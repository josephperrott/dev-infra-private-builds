/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
    var task_1 = require("@angular/dev-infra-private/pr/merge/task");
    /**
     * Merges a given pull request based on labels configured in the given merge configuration.
     * Pull requests can be merged with different strategies such as the Github API merge
     * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
     * More information on these strategies can be found in their dedicated strategy classes.
     *
     * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
     *
     * @param prNumber Number of the pull request that should be merged.
     * @param githubToken Github token used for merging (i.e. fetching and pushing)
     * @param projectRoot Path to the local Git project that is used for merging.
     * @param config Configuration for merging pull requests.
     */
    function mergePullRequest(prNumber, githubToken, projectRoot, config) {
        if (projectRoot === void 0) { projectRoot = config_1.getRepoBaseDir(); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            /** Performs the merge and returns whether it was successful or not. */
            function performMerge(ignoreFatalErrors) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var result, e_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, api.merge(prNumber, ignoreFatalErrors)];
                            case 1:
                                result = _a.sent();
                                return [4 /*yield*/, handleMergeResult(result, ignoreFatalErrors)];
                            case 2: return [2 /*return*/, _a.sent()];
                            case 3:
                                e_1 = _a.sent();
                                // Catch errors to the Github API for invalid requests. We want to
                                // exit the script with a better explanation of the error.
                                if (e_1 instanceof github_1.GithubApiRequestError && e_1.status === 401) {
                                    console_1.error(console_1.red('Github API request failed. ' + e_1.message));
                                    console_1.error(console_1.yellow('Please ensure that your provided token is valid.'));
                                    console_1.error(console_1.yellow("You can generate a token here: " + github_urls_1.GITHUB_TOKEN_GENERATE_URL));
                                    process.exit(1);
                                }
                                throw e_1;
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            }
            /**
             * Prompts whether the specified pull request should be forcibly merged. If so, merges
             * the specified pull request forcibly (ignoring non-critical failures).
             * @returns Whether the specified pull request has been forcibly merged.
             */
            function promptAndPerformForceMerge() {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, console_1.promptConfirm('Do you want to forcibly proceed with merging?')];
                            case 1:
                                if (_a.sent()) {
                                    // Perform the merge in force mode. This means that non-fatal failures
                                    // are ignored and the merge continues.
                                    return [2 /*return*/, performMerge(true)];
                                }
                                return [2 /*return*/, false];
                        }
                    });
                });
            }
            /**
             * Handles the merge result by printing console messages, exiting the process
             * based on the result, or by restarting the merge if force mode has been enabled.
             * @returns Whether the merge completed without errors or not.
             */
            function handleMergeResult(result, disableForceMergePrompt) {
                if (disableForceMergePrompt === void 0) { disableForceMergePrompt = false; }
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var failure, status, canForciblyMerge, _a;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                failure = result.failure, status = result.status;
                                canForciblyMerge = failure && failure.nonFatal;
                                _a = status;
                                switch (_a) {
                                    case 2 /* SUCCESS */: return [3 /*break*/, 1];
                                    case 1 /* DIRTY_WORKING_DIR */: return [3 /*break*/, 2];
                                    case 0 /* UNKNOWN_GIT_ERROR */: return [3 /*break*/, 3];
                                    case 5 /* GITHUB_ERROR */: return [3 /*break*/, 4];
                                    case 4 /* USER_ABORTED */: return [3 /*break*/, 5];
                                    case 3 /* FAILED */: return [3 /*break*/, 6];
                                }
                                return [3 /*break*/, 9];
                            case 1:
                                console_1.info(console_1.green("Successfully merged the pull request: #" + prNumber));
                                return [2 /*return*/, true];
                            case 2:
                                console_1.error(console_1.red("Local working repository not clean. Please make sure there are " +
                                    "no uncommitted changes."));
                                return [2 /*return*/, false];
                            case 3:
                                console_1.error(console_1.red('An unknown Git error has been thrown. Please check the output ' +
                                    'above for details.'));
                                return [2 /*return*/, false];
                            case 4:
                                console_1.error(console_1.red('An error related to interacting with Github has been discovered.'));
                                console_1.error(failure.message);
                                return [2 /*return*/, false];
                            case 5:
                                console_1.info("Merge of pull request has been aborted manually: #" + prNumber);
                                return [2 /*return*/, true];
                            case 6:
                                console_1.error(console_1.yellow("Could not merge the specified pull request."));
                                console_1.error(console_1.red(failure.message));
                                if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 8];
                                console_1.info();
                                console_1.info(console_1.yellow('The pull request above failed due to non-critical errors.'));
                                console_1.info(console_1.yellow("This error can be forcibly ignored if desired."));
                                return [4 /*yield*/, promptAndPerformForceMerge()];
                            case 7: return [2 /*return*/, _b.sent()];
                            case 8: return [2 /*return*/, false];
                            case 9: throw Error("Unexpected merge result: " + status);
                        }
                    });
                });
            }
            var api;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
                        // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
                        process.env['HUSKY_SKIP_HOOKS'] = '1';
                        return [4 /*yield*/, createPullRequestMergeTask(githubToken, projectRoot, config)];
                    case 1:
                        api = _a.sent();
                        return [4 /*yield*/, performMerge(false)];
                    case 2:
                        // Perform the merge. Force mode can be activated through a command line flag.
                        // Alternatively, if the merge fails with non-fatal failures, the script
                        // will prompt whether it should rerun in force mode.
                        if (!(_a.sent())) {
                            process.exit(1);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.mergePullRequest = mergePullRequest;
    /**
     * Creates the pull request merge task from the given Github token, project root
     * and optional explicit configuration. An explicit configuration can be specified
     * when the merge script is used outside of a `ng-dev` configured repository.
     */
    function createPullRequestMergeTask(githubToken, projectRoot, explicitConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git_2, devInfraConfig, git, _a, config, errors;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (explicitConfig !== undefined) {
                            git_2 = new git_1.GitClient(githubToken, { github: explicitConfig.remote }, projectRoot);
                            return [2 /*return*/, new task_1.PullRequestMergeTask(explicitConfig, git_2)];
                        }
                        devInfraConfig = config_1.getConfig();
                        git = new git_1.GitClient(githubToken, devInfraConfig, projectRoot);
                        return [4 /*yield*/, config_2.loadAndValidateConfig(devInfraConfig, git.github)];
                    case 1:
                        _a = _b.sent(), config = _a.config, errors = _a.errors;
                        if (errors) {
                            console_1.error(console_1.red('Invalid merge configuration:'));
                            errors.forEach(function (desc) { return console_1.error(console_1.yellow("  -  " + desc)); });
                            process.exit(1);
                        }
                        // Set the remote so that the merge tool has access to information about
                        // the remote it intends to merge to.
                        config.remote = devInfraConfig.github;
                        // We can cast this to a merge config with remote because we always set the
                        // remote above.
                        return [2 /*return*/, new task_1.PullRequestMergeTask(config, git)];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUE2RDtJQUM3RCxvRUFBbUY7SUFDbkYsa0VBQTBDO0lBQzFDLHNFQUE2RDtJQUM3RCxnRkFBc0U7SUFFdEUscUVBQXNFO0lBQ3RFLGlFQUFzRTtJQUV0RTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFzQixnQkFBZ0IsQ0FDbEMsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFdBQXNDLEVBQzdFLE1BQThCO1FBRFMsNEJBQUEsRUFBQSxjQUFzQix1QkFBYyxFQUFFOztZQWUvRSx1RUFBdUU7WUFDdkUsU0FBZSxZQUFZLENBQUMsaUJBQTBCOzs7Ozs7O2dDQUVuQyxxQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOztnQ0FBckQsTUFBTSxHQUFHLFNBQTRDO2dDQUNwRCxxQkFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBQTtvQ0FBekQsc0JBQU8sU0FBa0QsRUFBQzs7O2dDQUUxRCxrRUFBa0U7Z0NBQ2xFLDBEQUEwRDtnQ0FDMUQsSUFBSSxHQUFDLFlBQVksOEJBQXFCLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0NBQzFELGVBQUssQ0FBQyxhQUFHLENBQUMsNkJBQTZCLEdBQUcsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0NBQ3RELGVBQUssQ0FBQyxnQkFBTSxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztvQ0FDbEUsZUFBSyxDQUFDLGdCQUFNLENBQUMsb0NBQWtDLHVDQUEyQixDQUFDLENBQUMsQ0FBQztvQ0FDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQ0FDakI7Z0NBQ0Qs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ZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtnZXRDb25maWcsIGdldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGdpdGh1YlRva2VuIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBtZXJnaW5nIChpLmUuIGZldGNoaW5nIGFuZCBwdXNoaW5nKVxuICogQHBhcmFtIHByb2plY3RSb290IFBhdGggdG8gdGhlIGxvY2FsIEdpdCBwcm9qZWN0IHRoYXQgaXMgdXNlZCBmb3IgbWVyZ2luZy5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChcbiAgICBwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nLCBwcm9qZWN0Um9vdDogc3RyaW5nID0gZ2V0UmVwb0Jhc2VEaXIoKSxcbiAgICBjb25maWc/OiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUpIHtcbiAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gIHByb2Nlc3MuZW52WydIVVNLWV9TS0lQX0hPT0tTJ10gPSAnMSc7XG5cbiAgY29uc3QgYXBpID0gYXdhaXQgY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZ2l0aHViVG9rZW4sIHByb2plY3RSb290LCBjb25maWcpO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCFhd2FpdCBwZXJmb3JtTWVyZ2UoZmFsc2UpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcnMgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICMke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZChgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZCgnQW4gdW5rbm93biBHaXQgZXJyb3IgaGFzIGJlZW4gdGhyb3duLiBQbGVhc2UgY2hlY2sgdGhlIG91dHB1dCAnICtcbiAgICAgICAgICAgICAgICAnYWJvdmUgZm9yIGRldGFpbHMuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUjpcbiAgICAgICAgZXJyb3IocmVkKCdBbiBlcnJvciByZWxhdGVkIHRvIGludGVyYWN0aW5nIHdpdGggR2l0aHViIGhhcyBiZWVuIGRpc2NvdmVyZWQuJykpO1xuICAgICAgICBlcnJvcihmYWlsdXJlIS5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUQ6XG4gICAgICAgIGluZm8oYE1lcmdlIG9mIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIG1hbnVhbGx5OiAjJHtwck51bWJlcn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgZXJyb3IoeWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBlcnJvcihyZWQoZmFpbHVyZSEubWVzc2FnZSkpO1xuICAgICAgICBpZiAoY2FuRm9yY2libHlNZXJnZSAmJiAhZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQpIHtcbiAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBpbmZvKHllbGxvdyhgVGhpcyBlcnJvciBjYW4gYmUgZm9yY2libHkgaWdub3JlZCBpZiBkZXNpcmVkLmApKTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgVW5leHBlY3RlZCBtZXJnZSByZXN1bHQ6ICR7c3RhdHVzfWApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZSB0YXNrIGZyb20gdGhlIGdpdmVuIEdpdGh1YiB0b2tlbiwgcHJvamVjdCByb290XG4gKiBhbmQgb3B0aW9uYWwgZXhwbGljaXQgY29uZmlndXJhdGlvbi4gQW4gZXhwbGljaXQgY29uZmlndXJhdGlvbiBjYW4gYmUgc3BlY2lmaWVkXG4gKiB3aGVuIHRoZSBtZXJnZSBzY3JpcHQgaXMgdXNlZCBvdXRzaWRlIG9mIGEgYG5nLWRldmAgY29uZmlndXJlZCByZXBvc2l0b3J5LlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVQdWxsUmVxdWVzdE1lcmdlVGFzayhcbiAgICBnaXRodWJUb2tlbjogc3RyaW5nLCBwcm9qZWN0Um9vdDogc3RyaW5nLCBleHBsaWNpdENvbmZpZz86IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSkge1xuICBpZiAoZXhwbGljaXRDb25maWcgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQoZ2l0aHViVG9rZW4sIHtnaXRodWI6IGV4cGxpY2l0Q29uZmlnLnJlbW90ZX0sIHByb2plY3RSb290KTtcbiAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGV4cGxpY2l0Q29uZmlnLCBnaXQpO1xuICB9XG5cbiAgY29uc3QgZGV2SW5mcmFDb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbiwgZGV2SW5mcmFDb25maWcsIHByb2plY3RSb290KTtcbiAgY29uc3Qge2NvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhkZXZJbmZyYUNvbmZpZywgZ2l0LmdpdGh1Yik7XG5cbiAgaWYgKGVycm9ycykge1xuICAgIGVycm9yKHJlZCgnSW52YWxpZCBtZXJnZSBjb25maWd1cmF0aW9uOicpKTtcbiAgICBlcnJvcnMuZm9yRWFjaChkZXNjID0+IGVycm9yKHllbGxvdyhgICAtICAke2Rlc2N9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIHJlbW90ZSBzbyB0aGF0IHRoZSBtZXJnZSB0b29sIGhhcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXRcbiAgLy8gdGhlIHJlbW90ZSBpdCBpbnRlbmRzIHRvIG1lcmdlIHRvLlxuICBjb25maWchLnJlbW90ZSA9IGRldkluZnJhQ29uZmlnLmdpdGh1YjtcbiAgLy8gV2UgY2FuIGNhc3QgdGhpcyB0byBhIG1lcmdlIGNvbmZpZyB3aXRoIHJlbW90ZSBiZWNhdXNlIHdlIGFsd2F5cyBzZXQgdGhlXG4gIC8vIHJlbW90ZSBhYm92ZS5cbiAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhjb25maWchIGFzIE1lcmdlQ29uZmlnV2l0aFJlbW90ZSwgZ2l0KTtcbn1cbiJdfQ==