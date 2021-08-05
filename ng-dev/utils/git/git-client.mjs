"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitClient = exports.GitCommandError = void 0;
const child_process_1 = require("child_process");
const semver_1 = require("semver");
const config_1 = require("../config");
const console_1 = require("../console");
const dry_run_1 = require("../dry-run");
const github_1 = require("./github");
const github_urls_1 = require("./github-urls");
/** Error for failed Git commands. */
class GitCommandError extends Error {
    constructor(client, args) {
        // Errors are not guaranteed to be caught. To ensure that we don't
        // accidentally leak the Github token that might be used in a command,
        // we sanitize the command that will be part of the error message.
        super(`Command failed: git ${client.sanitizeConsoleOutput(args.join(' '))}`);
        this.args = args;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, GitCommandError.prototype);
    }
}
exports.GitCommandError = GitCommandError;
/** Class that can be used to perform Git interactions with a given remote. **/
class GitClient {
    constructor(
    /** The full path to the root of the repository base. */
    baseDir = determineRepoBaseDirFromCwd(), 
    /** The configuration, containing the github specific configuration. */
    config = config_1.getConfig(baseDir)) {
        this.baseDir = baseDir;
        this.config = config;
        /** Short-hand for accessing the default remote configuration. */
        this.remoteConfig = this.config.github;
        /** Octokit request parameters object for targeting the configured remote. */
        this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
        /** Instance of the Github client. */
        this.github = new github_1.GithubClient();
    }
    /** Executes the given git command. Throws if the command fails. */
    run(args, options) {
        const result = this.runGraceful(args, options);
        if (result.status !== 0) {
            throw new GitCommandError(this, args);
        }
        // Omit `status` from the type so that it's obvious that the status is never
        // non-zero as explained in the method description.
        return result;
    }
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    runGraceful(args, options = {}) {
        /** The git command to be run. */
        const gitCommand = args[0];
        if (dry_run_1.isDryRun() && gitCommand === 'push') {
            console_1.debug(`"git push" is not able to be run in dryRun mode.`);
            throw new dry_run_1.DryRunError();
        }
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands at the DEBUG level to better understand the git actions occurring. Verbose logging,
        // always logging at the INFO level, can be enabled either by setting the verboseLogging
        // property on the GitClient class or the options object provided to the method.
        const printFn = GitClient.verboseLogging || options.verboseLogging ? console_1.info : console_1.debug;
        // Note that we sanitize the command before printing it to the console. We do not want to
        // print an access token if it is contained in the command. It's common to share errors with
        // others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.sanitizeConsoleOutput(args.join(' ')));
        const result = child_process_1.spawnSync('git', args, {
            cwd: this.baseDir,
            stdio: 'pipe',
            ...options,
            // Encoding is always `utf8` and not overridable. This ensures that this method
            // always returns `string` as output instead of buffers.
            encoding: 'utf8',
        });
        if (result.stderr !== null) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.sanitizeConsoleOutput(result.stderr));
        }
        return result;
    }
    /** Git URL that resolves to the configured repository. */
    getRepoGitUrl() {
        return github_urls_1.getRepositoryGitUrl(this.remoteConfig);
    }
    /** Whether the given branch contains the specified SHA. */
    hasCommit(branchName, sha) {
        return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
    }
    /** Gets the currently checked out branch or revision. */
    getCurrentBranchOrRevision() {
        const branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
        // is currently in a detached state. In those cases, we just want to return the
        // currently checked out revision/SHA.
        if (branchName === 'HEAD') {
            return this.run(['rev-parse', 'HEAD']).stdout.trim();
        }
        return branchName;
    }
    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges() {
        return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
    }
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    checkout(branchOrRevision, cleanState) {
        if (cleanState) {
            // Abort any outstanding ams.
            this.runGraceful(['am', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding cherry-picks.
            this.runGraceful(['cherry-pick', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding rebases.
            this.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
            // Clear any changes in the current repo.
            this.runGraceful(['reset', '--hard'], { stdio: 'ignore' });
        }
        return this.runGraceful(['checkout', branchOrRevision], { stdio: 'ignore' }).status === 0;
    }
    /** Gets the latest git tag on the current branch that matches SemVer. */
    getLatestSemverTag() {
        const semVerOptions = { loose: true };
        const tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        const latestTag = tags.find((tag) => semver_1.parse(tag, semVerOptions));
        if (latestTag === undefined) {
            throw new Error(`Unable to find a SemVer matching tag on "${this.getCurrentBranchOrRevision()}"`);
        }
        return new semver_1.SemVer(latestTag, semVerOptions);
    }
    /** Retrieves the git tag matching the provided SemVer, if it exists. */
    getMatchingTagForSemver(semver) {
        const semVerOptions = { loose: true };
        const tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        const matchingTag = tags.find((tag) => semver_1.parse(tag, semVerOptions)?.compare(semver) === 0);
        if (matchingTag === undefined) {
            throw new Error(`Unable to find a tag for the version: "${semver.format()}"`);
        }
        return matchingTag;
    }
    /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
    allChangesFilesSince(shaOrRef = 'HEAD') {
        return Array.from(new Set([
            ...gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])),
            ...gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard'])),
        ]));
    }
    /** Retrieve a list of all files currently staged in the repostitory. */
    allStagedFiles() {
        return gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
    }
    /** Retrieve a list of all files tracked in the repository. */
    allFiles() {
        return gitOutputAsArray(this.runGraceful(['ls-files']));
    }
    /**
     * Sanitizes the given console message. This method can be overridden by
     * derived classes. e.g. to sanitize access tokens from Git commands.
     */
    sanitizeConsoleOutput(value) {
        return value;
    }
    /** Set the verbose logging state of all git client instances. */
    static setVerboseLoggingState(verbose) {
        GitClient.verboseLogging = verbose;
    }
    /**
     * Static method to get the singleton instance of the `GitClient`, creating it
     * if it has not yet been created.
     */
    static get() {
        if (!this._unauthenticatedInstance) {
            GitClient._unauthenticatedInstance = new GitClient();
        }
        return GitClient._unauthenticatedInstance;
    }
}
exports.GitClient = GitClient;
/** Whether verbose logging of Git actions should be used. */
GitClient.verboseLogging = false;
/**
 * Takes the output from `run` and `runGraceful` and returns an array of strings for each
 * new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult) {
    return gitCommandResult.stdout
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => !!x);
}
/** Determines the repository base directory from the current working directory. */
function determineRepoBaseDirFromCwd() {
    // TODO(devversion): Replace with common spawn sync utility once available.
    const { stdout, stderr, status } = child_process_1.spawnSync('git', ['rev-parse --show-toplevel'], {
        shell: true,
        stdio: 'pipe',
        encoding: 'utf8',
    });
    if (status !== 0) {
        throw Error(`Unable to find the path to the base directory of the repository.\n` +
            `Was the command run from inside of the repo?\n\n` +
            `${stderr}`);
    }
    return stdout.trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBNEU7QUFDNUUsbUNBQStEO0FBRS9ELHNDQUErRDtBQUMvRCx3Q0FBdUM7QUFDdkMsd0NBQWlEO0FBRWpELHFDQUFzQztBQUN0QywrQ0FBa0Q7QUFFbEQscUNBQXFDO0FBQ3JDLE1BQWEsZUFBZ0IsU0FBUSxLQUFLO0lBQ3hDLFlBQVksTUFBaUIsRUFBUyxJQUFjO1FBQ2xELGtFQUFrRTtRQUNsRSxzRUFBc0U7UUFDdEUsa0VBQWtFO1FBQ2xFLEtBQUssQ0FBQyx1QkFBdUIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFKekMsU0FBSSxHQUFKLElBQUksQ0FBVTtRQU1sRCx5RkFBeUY7UUFDekYsaUNBQWlDO1FBQ2pDLGlIQUFpSDtRQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekQsQ0FBQztDQUNGO0FBWkQsMENBWUM7QUFPRCwrRUFBK0U7QUFDL0UsTUFBYSxTQUFTO0lBVXBCO0lBQ0Usd0RBQXdEO0lBQy9DLFVBQVUsMkJBQTJCLEVBQUU7SUFDaEQsdUVBQXVFO0lBQzlELFNBQVMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7UUFGM0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFFdkMsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFidEMsaUVBQWlFO1FBQ3hELGlCQUFZLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBRXpELDZFQUE2RTtRQUNwRSxpQkFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxF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Ozs7Ozs7R0FPRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsZ0JBQTBDO0lBQ2xFLE9BQU8sZ0JBQWdCLENBQUMsTUFBTTtTQUMzQixLQUFLLENBQUMsSUFBSSxDQUFDO1NBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQztBQUVELG1GQUFtRjtBQUNuRixTQUFTLDJCQUEyQjtJQUNsQywyRUFBMkU7SUFDM0UsTUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLEdBQUcseUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO1FBQy9FLEtBQUssRUFBRSxJQUFJO1FBQ1gsS0FBSyxFQUFFLE1BQU07UUFDYixRQUFRLEVBQUUsTUFBTTtLQUNqQixDQUFDLENBQUM7SUFDSCxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDaEIsTUFBTSxLQUFLLENBQ1Qsb0VBQW9FO1lBQ2xFLGtEQUFrRDtZQUNsRCxHQUFHLE1BQU0sRUFBRSxDQUNkLENBQUM7S0FDSDtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtPcHRpb25zIGFzIFNlbVZlck9wdGlvbnMsIHBhcnNlLCBTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBHaXRodWJDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mb30gZnJvbSAnLi4vY29uc29sZSc7XG5pbXBvcnQge0RyeVJ1bkVycm9yLCBpc0RyeVJ1bn0gZnJvbSAnLi4vZHJ5LXJ1bic7XG5cbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50LnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSl9YCk7XG5cbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseSBsb3N0IGR1ZSB0b1xuICAgIC8vIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEdpdENvbW1hbmRFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgZm9yIHRoZSBgR2l0Q2xpZW50YGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIG1ldGhvZHMuICovXG50eXBlIEdpdENvbW1hbmRSdW5PcHRpb25zID0gU3Bhd25TeW5jT3B0aW9ucyAmIHtcbiAgdmVyYm9zZUxvZ2dpbmc/OiBib29sZWFuO1xufTtcblxuLyoqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuICoqL1xuZXhwb3J0IGNsYXNzIEdpdENsaWVudCB7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIGRlZmF1bHQgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUNvbmZpZzogR2l0aHViQ29uZmlnID0gdGhpcy5jb25maWcuZ2l0aHViO1xuXG4gIC8qKiBPY3Rva2l0IHJlcXVlc3QgcGFyYW1ldGVycyBvYmplY3QgZm9yIHRhcmdldGluZyB0aGUgY29uZmlndXJlZCByZW1vdGUuICovXG4gIHJlYWRvbmx5IHJlbW90ZVBhcmFtcyA9IHtvd25lcjogdGhpcy5yZW1vdGVDb25maWcub3duZXIsIHJlcG86IHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9O1xuXG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgR2l0aHViIGNsaWVudC4gKi9cbiAgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEdpdGh1YkNsaWVudCgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gICAgcmVhZG9ubHkgYmFzZURpciA9IGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpLFxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gICAgcmVhZG9ubHkgY29uZmlnID0gZ2V0Q29uZmlnKGJhc2VEaXIpLFxuICApIHt9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBHaXRDb21tYW5kUnVuT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvKiogVGhlIGdpdCBjb21tYW5kIHRvIGJlIHJ1bi4gKi9cbiAgICBjb25zdCBnaXRDb21tYW5kID0gYXJnc1swXTtcblxuICAgIGlmIChpc0RyeVJ1bigpICYmIGdpdENvbW1hbmQgPT09ICdwdXNoJykge1xuICAgICAgZGVidWcoYFwiZ2l0IHB1c2hcIiBpcyBub3QgYWJsZSB0byBiZSBydW4gaW4gZHJ5UnVuIG1vZGUuYCk7XG4gICAgICB0aHJvdyBuZXcgRHJ5UnVuRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBkZWJ1Z2dpbmcgZXhwZXJpZW5jZSBpbiBjYXNlIHNvbWV0aGluZyBmYWlscywgd2UgcHJpbnQgYWxsIGV4ZWN1dGVkIEdpdFxuICAgIC8vIGNvbW1hbmRzIGF0IHRoZSBERUJVRyBsZXZlbCB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJyaW5nLiBWZXJib3NlIGxvZ2dpbmcsXG4gICAgLy8gYWx3YXlzIGxvZ2dpbmcgYXQgdGhlIElORk8gbGV2ZWwsIGNhbiBiZSBlbmFibGVkIGVpdGhlciBieSBzZXR0aW5nIHRoZSB2ZXJib3NlTG9nZ2luZ1xuICAgIC8vIHByb3BlcnR5IG9uIHRoZSBHaXRDbGllbnQgY2xhc3Mgb3IgdGhlIG9wdGlvbnMgb2JqZWN0IHByb3ZpZGVkIHRvIHRoZSBtZXRob2QuXG4gICAgY29uc3QgcHJpbnRGbiA9IEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyB8fCBvcHRpb25zLnZlcmJvc2VMb2dnaW5nID8gaW5mbyA6IGRlYnVnO1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCBiZWZvcmUgcHJpbnRpbmcgaXQgdG8gdGhlIGNvbnNvbGUuIFdlIGRvIG5vdCB3YW50IHRvXG4gICAgLy8gcHJpbnQgYW4gYWNjZXNzIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGhcbiAgICAvLyBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKCdnaXQnLCBhcmdzLCB7XG4gICAgICBjd2Q6IHRoaXMuYmFzZURpcixcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFNIQS4gKi9cbiAgaGFzQ29tbWl0KGJyYW5jaE5hbWU6IHN0cmluZywgc2hhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydicmFuY2gnLCBicmFuY2hOYW1lLCAnLS1jb250YWlucycsIHNoYV0pLnN0ZG91dCAhPT0gJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbiAgZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBJZiBubyBicmFuY2ggbmFtZSBjb3VsZCBiZSByZXNvbHZlZC4gaS5lLiBgSEVBRGAgaGFzIGJlZW4gcmV0dXJuZWQsIHRoZW4gR2l0XG4gICAgLy8gaXMgY3VycmVudGx5IGluIGEgZGV0YWNoZWQgc3RhdGUuIEluIHRob3NlIGNhc2VzLCB3ZSBqdXN0IHdhbnQgdG8gcmV0dXJuIHRoZVxuICAgIC8vIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi9TSEEuXG4gICAgaWYgKGJyYW5jaE5hbWUgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCBhIHJlcXVlc3RlZCBicmFuY2ggb3IgcmV2aXNpb24sIG9wdGlvbmFsbHkgY2xlYW5pbmcgdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIGJlZm9yZSBhdHRlbXB0aW5nIHRoZSBjaGVja2luZy4gUmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicmFuY2ggb3IgcmV2aXNpb25cbiAgICogd2FzIGNsZWFubHkgY2hlY2tlZCBvdXQuXG4gICAqL1xuICBjaGVja291dChicmFuY2hPclJldmlzaW9uOiBzdHJpbmcsIGNsZWFuU3RhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoY2xlYW5TdGF0ZSkge1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGFtcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydhbScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBjaGVycnktcGlja3MuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBDbGVhciBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3Jlc2V0JywgJy0taGFyZCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBicmFuY2hPclJldmlzaW9uXSwge3N0ZGlvOiAnaWdub3JlJ30pLnN0YXR1cyA9PT0gMDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYXRlc3QgZ2l0IHRhZyBvbiB0aGUgY3VycmVudCBicmFuY2ggdGhhdCBtYXRjaGVzIFNlbVZlci4gKi9cbiAgZ2V0TGF0ZXN0U2VtdmVyVGFnKCk6IFNlbVZlciB7XG4gICAgY29uc3Qgc2VtVmVyT3B0aW9uczogU2VtVmVyT3B0aW9ucyA9IHtsb29zZTogdHJ1ZX07XG4gICAgY29uc3QgdGFncyA9IHRoaXMucnVuR3JhY2VmdWwoWyd0YWcnLCAnLS1zb3J0PS1jb21taXR0ZXJkYXRlJywgJy0tbWVyZ2VkJ10pLnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbGF0ZXN0VGFnID0gdGFncy5maW5kKCh0YWc6IHN0cmluZykgPT4gcGFyc2UodGFnLCBzZW1WZXJPcHRpb25zKSk7XG5cbiAgICBpZiAobGF0ZXN0VGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIGEgU2VtVmVyIG1hdGNoaW5nIHRhZyBvbiBcIiR7dGhpcy5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpfVwiYCxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VtVmVyKGxhdGVzdFRhZywgc2VtVmVyT3B0aW9ucyk7XG4gIH1cblxuICAvKiogUmV0cmlldmVzIHRoZSBnaXQgdGFnIG1hdGNoaW5nIHRoZSBwcm92aWRlZCBTZW1WZXIsIGlmIGl0IGV4aXN0cy4gKi9cbiAgZ2V0TWF0Y2hpbmdUYWdGb3JTZW12ZXIoc2VtdmVyOiBTZW1WZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlbVZlck9wdGlvbnM6IFNlbVZlck9wdGlvbnMgPSB7bG9vc2U6IHRydWV9O1xuICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnJ1bkdyYWNlZnVsKFsndGFnJywgJy0tc29ydD0tY29tbWl0dGVyZGF0ZScsICctLW1lcmdlZCddKS5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IG1hdGNoaW5nVGFnID0gdGFncy5maW5kKFxuICAgICAgKHRhZzogc3RyaW5nKSA9PiBwYXJzZSh0YWcsIHNlbVZlck9wdGlvbnMpPy5jb21wYXJlKHNlbXZlcikgPT09IDAsXG4gICAgKTtcblxuICAgIGlmIChtYXRjaGluZ1RhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGEgdGFnIGZvciB0aGUgdmVyc2lvbjogXCIke3NlbXZlci5mb3JtYXQoKX1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hpbmdUYWc7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeSBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGFPclJlZi4gKi9cbiAgYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhT3JSZWYgPSAnSEVBRCcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0KFtcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPWQnLCBzaGFPclJlZl0pKSxcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnLCAnLS1vdGhlcnMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJ10pKSxcbiAgICAgIF0pLFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgc3RhZ2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsU3RhZ2VkRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KFxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1BQ00nLCAnLS1zdGFnZWQnXSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIHRyYWNrZWQgaW4gdGhlIHJlcG9zaXRvcnkuICovXG4gIGFsbEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gY29uc29sZSBtZXNzYWdlLiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieVxuICAgKiBkZXJpdmVkIGNsYXNzZXMuIGUuZy4gdG8gc2FuaXRpemUgYWNjZXNzIHRva2VucyBmcm9tIEdpdCBjb21tYW5kcy5cbiAgICovXG4gIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdmVyYm9zZSBsb2dnaW5nIG9mIEdpdCBhY3Rpb25zIHNob3VsZCBiZSB1c2VkLiAqL1xuICBwcml2YXRlIHN0YXRpYyB2ZXJib3NlTG9nZ2luZyA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSB1bmF1dGhlbnRpY2F0ZWQgYEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTogR2l0Q2xpZW50O1xuXG4gIC8qKiBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiBhbGwgZ2l0IGNsaWVudCBpbnN0YW5jZXMuICovXG4gIHN0YXRpYyBzZXRWZXJib3NlTG9nZ2luZ1N0YXRlKHZlcmJvc2U6IGJvb2xlYW4pIHtcbiAgICBHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgPSB2ZXJib3NlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBHaXRDbGllbnRgLCBjcmVhdGluZyBpdFxuICAgKiBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0KCk6IEdpdENsaWVudCB7XG4gICAgaWYgKCF0aGlzLl91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBHaXRDbGllbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgb3V0cHV0IGZyb20gYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBmb3IgZWFjaFxuICogbmV3IGxpbmUuIEdpdCBjb21tYW5kcyB0eXBpY2FsbHkgcmV0dXJuIG11bHRpcGxlIG91dHB1dCB2YWx1ZXMgZm9yIGEgY29tbWFuZCBhIHNldCBvZlxuICogc3RyaW5ncyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICpcbiAqIE5vdGU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGNyZWF0ZWQgYXMgYSBsb2NhbGx5IGF2YWlsYWJsZSBmdW5jdGlvbiBmb3IgdXNhZ2UgYXMgY29udmVuaWVuY2VcbiAqIHV0aWxpdHkgd2l0aGluIGBHaXRDbGllbnRgJ3MgbWV0aG9kcyB0byBjcmVhdGUgb3V0cHV0cyBhcyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShnaXRDb21tYW5kUmVzdWx0OiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4pOiBzdHJpbmdbXSB7XG4gIHJldHVybiBnaXRDb21tYW5kUmVzdWx0LnN0ZG91dFxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKCh4KSA9PiB4LnRyaW0oKSlcbiAgICAuZmlsdGVyKCh4KSA9PiAhIXgpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyB0aGUgcmVwb3NpdG9yeSBiYXNlIGRpcmVjdG9yeSBmcm9tIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCkge1xuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZXBsYWNlIHdpdGggY29tbW9uIHNwYXduIHN5bmMgdXRpbGl0eSBvbmNlIGF2YWlsYWJsZS5cbiAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9ID0gc3Bhd25TeW5jKCdnaXQnLCBbJ3Jldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWwnXSwge1xuICAgIHNoZWxsOiB0cnVlLFxuICAgIHN0ZGlvOiAncGlwZScsXG4gICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgfSk7XG4gIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgJHtzdGRlcnJ9YCxcbiAgICApO1xuICB9XG4gIHJldHVybiBzdGRvdXQudHJpbSgpO1xufVxuIl19