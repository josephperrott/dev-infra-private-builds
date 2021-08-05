"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutosquashMergeStrategy = void 0;
const path_1 = require("path");
const failures_1 = require("../failures");
const strategy_1 = require("./strategy");
/** Path to the commit message filter script. Git expects this paths to use forward slashes. */
const MSG_FILTER_SCRIPT = path_1.join(__dirname, './commit-message-filter.js').replace(/\\/g, '/');
/**
 * Merge strategy that does not use the Github API for merging. Instead, it fetches
 * all target branches and the PR locally. The PR is then cherry-picked with autosquash
 * enabled into the target branches. The benefit is the support for fixup and squash commits.
 * A notable downside though is that Github does not show the PR as `Merged` due to non
 * fast-forward merges
 */
class AutosquashMergeStrategy extends strategy_1.MergeStrategy {
    /**
     * Merges the specified pull request into the target branches and pushes the target
     * branches upstream. This method requires the temporary target branches to be fetched
     * already as we don't want to fetch the target branches per pull request merge. This
     * would causes unnecessary multiple fetch requests when multiple PRs are merged.
     * @throws {GitCommandError} An unknown Git command error occurred that is not
     *   specific to the pull request merge.
     * @returns A pull request failure or null in case of success.
     */
    async merge(pullRequest) {
        const { prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, githubTargetBranch } = pullRequest;
        // In case a required base is specified for this pull request, check if the pull
        // request contains the given commit. If not, return a pull request failure. This
        // check is useful for enforcing that PRs are rebased on top of a given commit. e.g.
        // a commit that changes the codeowner ship validation. PRs which are not rebased
        // could bypass new codeowner ship rules.
        if (requiredBaseSha && !this.git.hasCommit(strategy_1.TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
            return failures_1.PullRequestFailure.unsatisfiedBaseSha();
        }
        // SHA for the first commit the pull request is based on. Usually we would able
        // to just rely on the base revision provided by `getPullRequestBaseRevision`, but
        // the revision would rely on the amount of commits in a pull request. This is not
        // reliable as we rebase the PR with autosquash where the amount of commits could
        // change. We work around this by parsing the base revision so that we have a fixated
        // SHA before the autosquash rebase is performed.
        const baseSha = this.git
            .run(['rev-parse', this.getPullRequestBaseRevision(pullRequest)])
            .stdout.trim();
        // Git revision range that matches the pull request commits.
        const revisionRange = `${baseSha}..${strategy_1.TEMP_PR_HEAD_BRANCH}`;
        // We always rebase the pull request so that fixup or squash commits are automatically
        // collapsed. Git's autosquash functionality does only work in interactive rebases, so
        // our rebase is always interactive. In reality though, unless a commit message fixup
        // is desired, we set the `GIT_SEQUENCE_EDITOR` environment variable to `true` so that
        // the rebase seems interactive to Git, while it's not interactive to the user.
        // See: https://github.com/git/git/commit/891d4a0313edc03f7e2ecb96edec5d30dc182294.
        const branchOrRevisionBeforeRebase = this.git.getCurrentBranchOrRevision();
        const rebaseEnv = needsCommitMessageFixup
            ? undefined
            : { ...process.env, GIT_SEQUENCE_EDITOR: 'true' };
        this.git.run(['rebase', '--interactive', '--autosquash', baseSha, strategy_1.TEMP_PR_HEAD_BRANCH], {
            stdio: 'inherit',
            env: rebaseEnv,
        });
        // Update pull requests commits to reference the pull request. This matches what
        // Github does when pull requests are merged through the Web UI. The motivation is
        // that it should be easy to determine which pull request contained a given commit.
        // Note: The filter-branch command relies on the working tree, so we want to make sure
        // that we are on the initial branch or revision where the merge script has been invoked.
        this.git.run(['checkout', '-f', branchOrRevisionBeforeRebase]);
        this.git.run([
            'filter-branch',
            '-f',
            '--msg-filter',
            `${MSG_FILTER_SCRIPT} ${prNumber}`,
            revisionRange,
        ]);
        // Cherry-pick the pull request into all determined target branches.
        const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);
        if (failedBranches.length) {
            return failures_1.PullRequestFailure.mergeConflicts(failedBranches);
        }
        this.pushTargetBranchesUpstream(targetBranches);
        // For PRs which do not target the `master` branch on Github, Github does not automatically
        // close the PR when its commit is pushed into the repository.  To ensure these PRs are
        // correctly marked as closed, we must detect this situation and close the PR via the API after
        // the upstream pushes are completed.
        if (githubTargetBranch !== 'master') {
            /** The local branch name of the github targeted branch. */
            const localBranch = this.getLocalTargetBranchName(githubTargetBranch);
            /** The SHA of the commit pushed to github which represents closing the PR. */
            const sha = this.git.run(['rev-parse', localBranch]).stdout.trim();
            // Create a comment saying the PR was closed by the SHA.
            await this.git.github.issues.createComment({
                ...this.git.remoteParams,
                issue_number: pullRequest.prNumber,
                body: `Closed by commit ${sha}`,
            });
            // Actually close the PR.
            await this.git.github.pulls.update({
                ...this.git.remoteParams,
                pull_number: pullRequest.prNumber,
                state: 'closed',
            });
        }
        return null;
    }
}
exports.AutosquashMergeStrategy = AutosquashMergeStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBQzFCLDBDQUErQztBQUUvQyx5Q0FBOEQ7QUFFOUQsK0ZBQStGO0FBQy9GLE1BQU0saUJBQWlCLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFNUY7Ozs7OztHQU1HO0FBQ0gsTUFBYSx1QkFBd0IsU0FBUSx3QkFBYTtJQUN4RDs7Ozs7Ozs7T0FRRztJQUNNLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBd0I7UUFDM0MsTUFBTSxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFDLEdBQzVGLFdBQVcsQ0FBQztRQUNkLGdGQUFnRjtRQUNoRixpRkFBaUY7UUFDakYsb0ZBQW9GO1FBQ3BGLGlGQUFpRjtRQUNqRix5Q0FBeUM7UUFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw4QkFBbUIsRUFBRSxlQUFlLENBQUMsRUFBRTtZQUNoRixPQUFPLDZCQUFrQixDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDaEQ7UUFFRCwrRUFBK0U7UUFDL0Usa0ZBQWtGO1FBQ2xGLGtGQUFrRjtRQUNsRixpRkFBaUY7UUFDakYscUZBQXFGO1FBQ3JGLGlEQUFpRDtRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRzthQUNyQixHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDaEUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLDREQUE0RDtRQUM1RCxNQUFNLGFBQWEsR0FBRyxHQUFHLE9BQU8sS0FBSyw4QkFBbUIsRUFBRSxDQUFDO1FBRTNELHNGQUFzRjtRQUN0RixzRkFBc0Y7UUFDdEYscUZBQXFGO1FBQ3JGLHNGQUFzRjtRQUN0RiwrRUFBK0U7UUFDL0UsbUZBQW1GO1FBQ25GLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQzNFLE1BQU0sU0FBUyxHQUFHLHVCQUF1QjtZQUN2QyxDQUFDLENBQUMsU0FBUztZQUNYLENBQUMsQ0FBQyxFQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSw4QkFBbUIsQ0FBQyxFQUFFO1lBQ3RGLEtBQUssRUFBRSxTQUFTO1lBQ2hCLEdBQUcsRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUgsZ0ZBQWdGO1FBQ2hGLGtGQUFrRjtRQUNsRixtRkFBbUY7UUFDbkYsc0ZBQXNGO1FBQ3RGLHlGQUF5RjtRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ1gsZUFBZTtZQUNmLElBQUk7WUFDSixjQUFjO1lBQ2QsR0FBRyxpQkFBaUIsSUFBSSxRQUFRLEVBQUU7WUFDbEMsYUFBYTtTQUNkLENBQUMsQ0FBQztRQUVILG9FQUFvRTtRQUNwRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXhGLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLDZCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVoRCwyRkFBMkY7UUFDM0YsdUZBQXVGO1FBQ3ZGLCtGQUErRjtRQUMvRixxQ0FBcUM7UUFDckMsSUFBSSxrQkFBa0IsS0FBSyxRQUFRLEVBQUU7WUFDbkMsMkRBQTJEO1lBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RFLDhFQUE4RTtZQUM5RSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuRSx3REFBd0Q7WUFDeEQsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO2dCQUN6QyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtnQkFDeEIsWUFBWSxFQUFFLFdBQVcsQ0FBQyxRQUFRO2dCQUNsQyxJQUFJLEVBQUUsb0JBQW9CLEdBQUcsRUFBRTthQUNoQyxDQUFDLENBQUM7WUFDSCx5QkFBeUI7WUFDekIsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtnQkFDeEIsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRO2dCQUNqQyxLQUFLLEVBQUUsUUFBUTthQUNoQixDQUFDLENBQUM7U0FDSjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBakdELDBEQWlHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogUGF0aCB0byB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsdGVyIHNjcmlwdC4gR2l0IGV4cGVjdHMgdGhpcyBwYXRocyB0byB1c2UgZm9yd2FyZCBzbGFzaGVzLiAqL1xuY29uc3QgTVNHX0ZJTFRFUl9TQ1JJUFQgPSBqb2luKF9fZGlybmFtZSwgJy4vY29tbWl0LW1lc3NhZ2UtZmlsdGVyLmpzJykucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgZG9lcyBub3QgdXNlIHRoZSBHaXRodWIgQVBJIGZvciBtZXJnaW5nLiBJbnN0ZWFkLCBpdCBmZXRjaGVzXG4gKiBhbGwgdGFyZ2V0IGJyYW5jaGVzIGFuZCB0aGUgUFIgbG9jYWxseS4gVGhlIFBSIGlzIHRoZW4gY2hlcnJ5LXBpY2tlZCB3aXRoIGF1dG9zcXVhc2hcbiAqIGVuYWJsZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLiBUaGUgYmVuZWZpdCBpcyB0aGUgc3VwcG9ydCBmb3IgZml4dXAgYW5kIHNxdWFzaCBjb21taXRzLlxuICogQSBub3RhYmxlIGRvd25zaWRlIHRob3VnaCBpcyB0aGF0IEdpdGh1YiBkb2VzIG5vdCBzaG93IHRoZSBQUiBhcyBgTWVyZ2VkYCBkdWUgdG8gbm9uXG4gKiBmYXN0LWZvcndhcmQgbWVyZ2VzXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICAvKipcbiAgICogTWVyZ2VzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGludG8gdGhlIHRhcmdldCBicmFuY2hlcyBhbmQgcHVzaGVzIHRoZSB0YXJnZXRcbiAgICogYnJhbmNoZXMgdXBzdHJlYW0uIFRoaXMgbWV0aG9kIHJlcXVpcmVzIHRoZSB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzIHRvIGJlIGZldGNoZWRcbiAgICogYWxyZWFkeSBhcyB3ZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZSB0YXJnZXQgYnJhbmNoZXMgcGVyIHB1bGwgcmVxdWVzdCBtZXJnZS4gVGhpc1xuICAgKiB3b3VsZCBjYXVzZXMgdW5uZWNlc3NhcnkgbXVsdGlwbGUgZmV0Y2ggcmVxdWVzdHMgd2hlbiBtdWx0aXBsZSBQUnMgYXJlIG1lcmdlZC5cbiAgICogQHRocm93cyB7R2l0Q29tbWFuZEVycm9yfSBBbiB1bmtub3duIEdpdCBjb21tYW5kIGVycm9yIG9jY3VycmVkIHRoYXQgaXMgbm90XG4gICAqICAgc3BlY2lmaWMgdG8gdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBvciBudWxsIGluIGNhc2Ugb2Ygc3VjY2Vzcy5cbiAgICovXG4gIG92ZXJyaWRlIGFzeW5jIG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8UHVsbFJlcXVlc3RGYWlsdXJlIHwgbnVsbD4ge1xuICAgIGNvbnN0IHtwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsIGdpdGh1YlRhcmdldEJyYW5jaH0gPVxuICAgICAgcHVsbFJlcXVlc3Q7XG4gICAgLy8gSW4gY2FzZSBhIHJlcXVpcmVkIGJhc2UgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWYgdGhlIHB1bGxcbiAgICAvLyByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuIFRoaXNcbiAgICAvLyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuIGUuZy5cbiAgICAvLyBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGVvd25lciBzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIC8vIFNIQSBmb3IgdGhlIGZpcnN0IGNvbW1pdCB0aGUgcHVsbCByZXF1ZXN0IGlzIGJhc2VkIG9uLiBVc3VhbGx5IHdlIHdvdWxkIGFibGVcbiAgICAvLyB0byBqdXN0IHJlbHkgb24gdGhlIGJhc2UgcmV2aXNpb24gcHJvdmlkZWQgYnkgYGdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uYCwgYnV0XG4gICAgLy8gdGhlIHJldmlzaW9uIHdvdWxkIHJlbHkgb24gdGhlIGFtb3VudCBvZiBjb21taXRzIGluIGEgcHVsbCByZXF1ZXN0LiBUaGlzIGlzIG5vdFxuICAgIC8vIHJlbGlhYmxlIGFzIHdlIHJlYmFzZSB0aGUgUFIgd2l0aCBhdXRvc3F1YXNoIHdoZXJlIHRoZSBhbW91bnQgb2YgY29tbWl0cyBjb3VsZFxuICAgIC8vIGNoYW5nZS4gV2Ugd29yayBhcm91bmQgdGhpcyBieSBwYXJzaW5nIHRoZSBiYXNlIHJldmlzaW9uIHNvIHRoYXQgd2UgaGF2ZSBhIGZpeGF0ZWRcbiAgICAvLyBTSEEgYmVmb3JlIHRoZSBhdXRvc3F1YXNoIHJlYmFzZSBpcyBwZXJmb3JtZWQuXG4gICAgY29uc3QgYmFzZVNoYSA9IHRoaXMuZ2l0XG4gICAgICAucnVuKFsncmV2LXBhcnNlJywgdGhpcy5nZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdCldKVxuICAgICAgLnN0ZG91dC50cmltKCk7XG4gICAgLy8gR2l0IHJldmlzaW9uIHJhbmdlIHRoYXQgbWF0Y2hlcyB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdHMuXG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IGAke2Jhc2VTaGF9Li4ke1RFTVBfUFJfSEVBRF9CUkFOQ0h9YDtcblxuICAgIC8vIFdlIGFsd2F5cyByZWJhc2UgdGhlIHB1bGwgcmVxdWVzdCBzbyB0aGF0IGZpeHVwIG9yIHNxdWFzaCBjb21taXRzIGFyZSBhdXRvbWF0aWNhbGx5XG4gICAgLy8gY29sbGFwc2VkLiBHaXQncyBhdXRvc3F1YXNoIGZ1bmN0aW9uYWxpdHkgZG9lcyBvbmx5IHdvcmsgaW4gaW50ZXJhY3RpdmUgcmViYXNlcywgc29cbiAgICAvLyBvdXIgcmViYXNlIGlzIGFsd2F5cyBpbnRlcmFjdGl2ZS4gSW4gcmVhbGl0eSB0aG91Z2gsIHVubGVzcyBhIGNvbW1pdCBtZXNzYWdlIGZpeHVwXG4gICAgLy8gaXMgZGVzaXJlZCwgd2Ugc2V0IHRoZSBgR0lUX1NFUVVFTkNFX0VESVRPUmAgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gYHRydWVgIHNvIHRoYXRcbiAgICAvLyB0aGUgcmViYXNlIHNlZW1zIGludGVyYWN0aXZlIHRvIEdpdCwgd2hpbGUgaXQncyBub3QgaW50ZXJhY3RpdmUgdG8gdGhlIHVzZXIuXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZ2l0L2dpdC9jb21taXQvODkxZDRhMDMxM2VkYzAzZjdlMmVjYjk2ZWRlYzVkMzBkYzE4MjI5NC5cbiAgICBjb25zdCBicmFuY2hPclJldmlzaW9uQmVmb3JlUmViYXNlID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgICBjb25zdCByZWJhc2VFbnYgPSBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cFxuICAgICAgPyB1bmRlZmluZWRcbiAgICAgIDogey4uLnByb2Nlc3MuZW52LCBHSVRfU0VRVUVOQ0VfRURJVE9SOiAndHJ1ZSd9O1xuICAgIHRoaXMuZ2l0LnJ1bihbJ3JlYmFzZScsICctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCcsIGJhc2VTaGEsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdLCB7XG4gICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgZW52OiByZWJhc2VFbnYsXG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgcHVsbCByZXF1ZXN0cyBjb21taXRzIHRvIHJlZmVyZW5jZSB0aGUgcHVsbCByZXF1ZXN0LiBUaGlzIG1hdGNoZXMgd2hhdFxuICAgIC8vIEdpdGh1YiBkb2VzIHdoZW4gcHVsbCByZXF1ZXN0cyBhcmUgbWVyZ2VkIHRocm91Z2ggdGhlIFdlYiBVSS4gVGhlIG1vdGl2YXRpb24gaXNcbiAgICAvLyB0aGF0IGl0IHNob3VsZCBiZSBlYXN5IHRvIGRldGVybWluZSB3aGljaCBwdWxsIHJlcXVlc3QgY29udGFpbmVkIGEgZ2l2ZW4gY29tbWl0LlxuICAgIC8vIE5vdGU6IFRoZSBmaWx0ZXItYnJhbmNoIGNvbW1hbmQgcmVsaWVzIG9uIHRoZSB3b3JraW5nIHRyZWUsIHNvIHdlIHdhbnQgdG8gbWFrZSBzdXJlXG4gICAgLy8gdGhhdCB3ZSBhcmUgb24gdGhlIGluaXRpYWwgYnJhbmNoIG9yIHJldmlzaW9uIHdoZXJlIHRoZSBtZXJnZSBzY3JpcHQgaGFzIGJlZW4gaW52b2tlZC5cbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIGJyYW5jaE9yUmV2aXNpb25CZWZvcmVSZWJhc2VdKTtcbiAgICB0aGlzLmdpdC5ydW4oW1xuICAgICAgJ2ZpbHRlci1icmFuY2gnLFxuICAgICAgJy1mJyxcbiAgICAgICctLW1zZy1maWx0ZXInLFxuICAgICAgYCR7TVNHX0ZJTFRFUl9TQ1JJUFR9ICR7cHJOdW1iZXJ9YCxcbiAgICAgIHJldmlzaW9uUmFuZ2UsXG4gICAgXSk7XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcHVsbCByZXF1ZXN0IGludG8gYWxsIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzKTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0odGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gRm9yIFBScyB3aGljaCBkbyBub3QgdGFyZ2V0IHRoZSBgbWFzdGVyYCBicmFuY2ggb24gR2l0aHViLCBHaXRodWIgZG9lcyBub3QgYXV0b21hdGljYWxseVxuICAgIC8vIGNsb3NlIHRoZSBQUiB3aGVuIGl0cyBjb21taXQgaXMgcHVzaGVkIGludG8gdGhlIHJlcG9zaXRvcnkuICBUbyBlbnN1cmUgdGhlc2UgUFJzIGFyZVxuICAgIC8vIGNvcnJlY3RseSBtYXJrZWQgYXMgY2xvc2VkLCB3ZSBtdXN0IGRldGVjdCB0aGlzIHNpdHVhdGlvbiBhbmQgY2xvc2UgdGhlIFBSIHZpYSB0aGUgQVBJIGFmdGVyXG4gICAgLy8gdGhlIHVwc3RyZWFtIHB1c2hlcyBhcmUgY29tcGxldGVkLlxuICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggIT09ICdtYXN0ZXInKSB7XG4gICAgICAvKiogVGhlIGxvY2FsIGJyYW5jaCBuYW1lIG9mIHRoZSBnaXRodWIgdGFyZ2V0ZWQgYnJhbmNoLiAqL1xuICAgICAgY29uc3QgbG9jYWxCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgLyoqIFRoZSBTSEEgb2YgdGhlIGNvbW1pdCBwdXNoZWQgdG8gZ2l0aHViIHdoaWNoIHJlcHJlc2VudHMgY2xvc2luZyB0aGUgUFIuICovXG4gICAgICBjb25zdCBzaGEgPSB0aGlzLmdpdC5ydW4oWydyZXYtcGFyc2UnLCBsb2NhbEJyYW5jaF0pLnN0ZG91dC50cmltKCk7XG4gICAgICAvLyBDcmVhdGUgYSBjb21tZW50IHNheWluZyB0aGUgUFIgd2FzIGNsb3NlZCBieSB0aGUgU0hBLlxuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5jcmVhdGVDb21tZW50KHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IHB1bGxSZXF1ZXN0LnByTnVtYmVyLFxuICAgICAgICBib2R5OiBgQ2xvc2VkIGJ5IGNvbW1pdCAke3NoYX1gLFxuICAgICAgfSk7XG4gICAgICAvLyBBY3R1YWxseSBjbG9zZSB0aGUgUFIuXG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMudXBkYXRlKHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBwdWxsX251bWJlcjogcHVsbFJlcXVlc3QucHJOdW1iZXIsXG4gICAgICAgIHN0YXRlOiAnY2xvc2VkJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=