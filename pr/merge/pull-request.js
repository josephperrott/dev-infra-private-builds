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
        define("@angular/dev-infra-private/pr/merge/pull-request", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/string-pattern", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPullRequest = exports.loadAndValidatePullRequest = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    /** The default label for labeling pull requests containing a breaking change. */
    var BreakingChangeLabel = 'breaking changes';
    /**
     * Loads and validates the specified pull request against the given configuration.
     * If the pull requests fails, a pull request failure is returned.
     */
    function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
        var git = _a.git, config = _a.config;
        if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prData, labels, targetLabel, commitsInPr, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetchPullRequestFromGithub(git, prNumber)];
                    case 1:
                        prData = _b.sent();
                        if (prData === null) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notFound()];
                        }
                        labels = prData.labels.nodes.map(function (l) { return l.name; });
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.mergeReadyLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notMergeReady()];
                        }
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.claSignedLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.claUnsigned()];
                        }
                        try {
                            targetLabel = target_label_1.getTargetLabelFromPullRequest(config, labels);
                        }
                        catch (error) {
                            if (error instanceof target_label_1.InvalidTargetLabelError) {
                                return [2 /*return*/, new failures_1.PullRequestFailure(error.failureMessage)];
                            }
                            throw error;
                        }
                        commitsInPr = prData.commits.nodes.map(function (n) { return parse_1.parseCommitMessage(n.commit.message); });
                        try {
                            assertChangesAllowForTargetLabel(commitsInPr, targetLabel, config);
                            assertCorrectBreakingChangeLabeling(commitsInPr, labels, config);
                        }
                        catch (error) {
                            return [2 /*return*/, error];
                        }
                        state = prData.commits.nodes.slice(-1)[0].commit.status.state;
                        if (state === 'FAILURE' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.failingCiJobs()];
                        }
                        if (state === 'PENDING' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.pendingCiJobs()];
                        }
                        githubTargetBranch = prData.baseRefName;
                        requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
                        needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.commitMessageFixupLabel); });
                        hasCaretakerNote = !!config.caretakerNoteLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.caretakerNoteLabel); });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                    case 3:
                        targetBranches = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1 instanceof target_label_1.InvalidTargetBranchError || error_1 instanceof target_label_1.InvalidTargetLabelError) {
                            return [2 /*return*/, new failures_1.PullRequestFailure(error_1.failureMessage)];
                        }
                        throw error_1;
                    case 5: return [2 /*return*/, {
                            url: prData.url,
                            prNumber: prNumber,
                            labels: labels,
                            requiredBaseSha: requiredBaseSha,
                            githubTargetBranch: githubTargetBranch,
                            needsCommitMessageFixup: needsCommitMessageFixup,
                            hasCaretakerNote: hasCaretakerNote,
                            targetBranches: targetBranches,
                            title: prData.title,
                            commitCount: prData.commits.totalCount,
                        }];
                }
            });
        });
    }
    exports.loadAndValidatePullRequest = loadAndValidatePullRequest;
    /* Graphql schema for the response body the requested pull request. */
    var PR_SCHEMA = {
        url: typed_graphqlify_1.types.string,
        number: typed_graphqlify_1.types.number,
        // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
        // requests with more than 100 commits.
        commits: typed_graphqlify_1.params({ last: 100 }, {
            totalCount: typed_graphqlify_1.types.number,
            nodes: [{
                    commit: {
                        status: {
                            state: typed_graphqlify_1.types.oneOf(['FAILURE', 'PENDING', 'SUCCESS']),
                        },
                        message: typed_graphqlify_1.types.string,
                    },
                }],
        }),
        baseRefName: typed_graphqlify_1.types.string,
        title: typed_graphqlify_1.types.string,
        labels: typed_graphqlify_1.params({ first: 100 }, {
            nodes: [{
                    name: typed_graphqlify_1.types.string,
                }]
        }),
    };
    /** Fetches a pull request from Github. Returns null if an error occurred. */
    function fetchPullRequestFromGithub(git, prNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var x, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, git)];
                    case 1:
                        x = _a.sent();
                        return [2 /*return*/, x];
                    case 2:
                        e_1 = _a.sent();
                        // If the pull request could not be found, we want to return `null` so
                        // that the error can be handled gracefully.
                        if (e_1.status === 404) {
                            return [2 /*return*/, null];
                        }
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    /** Whether the specified value resolves to a pull request. */
    function isPullRequest(v) {
        return v.targetBranches !== undefined;
    }
    exports.isPullRequest = isPullRequest;
    /**
     * Assert the commits provided are allowed to merge to the provided target label, throwing a
     * PullRequestFailure otherwise.
     */
    function assertChangesAllowForTargetLabel(commits, label, config) {
        /**
         * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
         * scopes in patch branches, no breaking changes in minor or patch changes.
         */
        var exemptedScopes = config.targetLabelExemptScopes || [];
        /** List of commits which are subject to content requirements for the target label. */
        commits = commits.filter(function (commit) { return !exemptedScopes.includes(commit.scope); });
        switch (label.pattern) {
            case 'target: major':
                break;
            case 'target: minor':
                // Check if any commits in the pull request contains a breaking change.
                if (commits.some(function (commit) { return commit.breakingChanges.length !== 0; })) {
                    throw failures_1.PullRequestFailure.hasBreakingChanges(label);
                }
                break;
            case 'target: patch':
            case 'target: lts':
                // Check if any commits in the pull request contains a breaking change.
                if (commits.some(function (commit) { return commit.breakingChanges.length !== 0; })) {
                    throw failures_1.PullRequestFailure.hasBreakingChanges(label);
                }
                // Check if any commits in the pull request contains a commit type of "feat".
                if (commits.some(function (commit) { return commit.type === 'feat'; })) {
                    throw failures_1.PullRequestFailure.hasFeatureCommits(label);
                }
                break;
            default:
                console_1.warn(console_1.red('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
                console_1.warn(console_1.red("merged into the target branch: " + label.pattern));
                break;
        }
    }
    /**
     * Assert the pull request has the proper label for breaking changes if there are breaking change
     * commits, and only has the label if there are breaking change commits.
     */
    function assertCorrectBreakingChangeLabeling(commits, labels, config) {
        /** Whether the PR has a label noting a breaking change. */
        var hasLabel = labels.includes(config.breakingChangeLabel || BreakingChangeLabel);
        //** Whether the PR has at least one commit which notes a breaking change. */
        var hasCommit = commits.some(function (commit) { return commit.breakingChanges.length !== 0; });
        if (!hasLabel && hasCommit) {
            throw failures_1.PullRequestFailure.missingBreakingChangeLabel();
        }
        if (hasLabel && !hasCommit) {
            throw failures_1.PullRequestFailure.missingBreakingChangeCommit();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStEO0lBQy9ELHlFQUFzRTtJQUN0RSxvRUFBOEM7SUFHOUMsa0VBQXlDO0lBR3pDLHlFQUE4QztJQUM5QyxxRkFBZ0Q7SUFDaEQsaUZBQTRJO0lBRzVJLGlGQUFpRjtJQUNqRixJQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0lBMEIvQzs7O09BR0c7SUFDSCxTQUFzQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7WUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO1FBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7OzRCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTs0QkFDbkIsc0JBQU8sNkJBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7eUJBQ3RDO3dCQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFOzRCQUN0RSxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENB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aHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7TWVyZ2VDb25maWcsIFRhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5cbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBUaGUgZGVmYXVsdCBsYWJlbCBmb3IgbGFiZWxpbmcgcHVsbCByZXF1ZXN0cyBjb250YWluaW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuY29uc3QgQnJlYWtpbmdDaGFuZ2VMYWJlbCA9ICdicmVha2luZyBjaGFuZ2VzJztcblxuLyoqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVVJMIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByTnVtYmVyOiBudW1iZXI7XG4gIC8qKiBUaXRsZSBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB0aXRsZTogc3RyaW5nO1xuICAvKiogTGFiZWxzIGFwcGxpZWQgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgLyoqIExpc3Qgb2YgYnJhbmNoZXMgdGhpcyBQUiBzaG91bGQgYmUgbWVyZ2VkIGludG8uICovXG4gIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcbiAgLyoqIEJyYW5jaCB0aGF0IHRoZSBQUiB0YXJnZXRzIGluIHRoZSBHaXRodWIgVUkuICovXG4gIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nO1xuICAvKiogQ291bnQgb2YgY29tbWl0cyBpbiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29tbWl0Q291bnQ6IG51bWJlcjtcbiAgLyoqIE9wdGlvbmFsIFNIQSB0aGF0IHRoaXMgcHVsbCByZXF1ZXN0IG5lZWRzIHRvIGJlIGJhc2VkIG9uLiAqL1xuICByZXF1aXJlZEJhc2VTaGE/OiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0IG1lc3NhZ2UgZml4dXAuICovXG4gIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlLiAqL1xuICBoYXNDYXJldGFrZXJOb3RlOiBib29sZWFuO1xufVxuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgYWdhaW5zdCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAqIElmIHRoZSBwdWxsIHJlcXVlc3RzIGZhaWxzLCBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QoXG4gICAge2dpdCwgY29uZmlnfTogUHVsbFJlcXVlc3RNZXJnZVRhc2ssIHByTnVtYmVyOiBudW1iZXIsXG4gICAgaWdub3JlTm9uRmF0YWxGYWlsdXJlcyA9IGZhbHNlKTogUHJvbWlzZTxQdWxsUmVxdWVzdHxQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgY29uc3QgcHJEYXRhID0gYXdhaXQgZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoZ2l0LCBwck51bWJlcik7XG5cbiAgaWYgKHByRGF0YSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90Rm91bmQoKTtcbiAgfVxuXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubm9kZXMubWFwKGwgPT4gbC5uYW1lKTtcblxuICBpZiAoIWxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLm1lcmdlUmVhZHlMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RNZXJnZVJlYWR5KCk7XG4gIH1cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jbGFTaWduZWRMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5jbGFVbnNpZ25lZCgpO1xuICB9XG5cbiAgbGV0IHRhcmdldExhYmVsOiBUYXJnZXRMYWJlbDtcbiAgdHJ5IHtcbiAgICB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KGNvbmZpZywgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdEZhaWx1cmUoZXJyb3IuZmFpbHVyZU1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXRzIGZvciBhbGwgb2YgdGhlIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3QgY29tbWl0c0luUHIgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5tYXAobiA9PiBwYXJzZUNvbW1pdE1lc3NhZ2Uobi5jb21taXQubWVzc2FnZSkpO1xuXG4gIHRyeSB7XG4gICAgYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoY29tbWl0c0luUHIsIHRhcmdldExhYmVsLCBjb25maWcpO1xuICAgIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKGNvbW1pdHNJblByLCBsYWJlbHMsIGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzdGF0dXMgb2YgdGhlIGxhdGVzdCBjb21taXQgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3Qgc3RhdGUgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5zbGljZSgtMSlbMF0uY29tbWl0LnN0YXR1cy5zdGF0ZTtcbiAgaWYgKHN0YXRlID09PSAnRkFJTFVSRScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdQRU5ESU5HJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2VSZWZOYW1lO1xuICBjb25zdCByZXF1aXJlZEJhc2VTaGEgPVxuICAgICAgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHMgJiYgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHNbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgY29uc3QgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPSAhIWNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwpKTtcbiAgY29uc3QgaGFzQ2FyZXRha2VyTm90ZSA9ICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuICBsZXQgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuXG4gIC8vIElmIGJyYW5jaGVzIGFyZSBkZXRlcm1pbmVkIGZvciBhIGdpdmVuIHRhcmdldCBsYWJlbCwgY2FwdHVyZSBlcnJvcnMgdGhhdCBhcmVcbiAgLy8gdGhyb3duIGFzIHBhcnQgb2YgYnJhbmNoIGNvbXB1dGF0aW9uLiBUaGlzIGlzIGV4cGVjdGVkIGJlY2F1c2UgYSBtZXJnZSBjb25maWd1cmF0aW9uXG4gIC8vIGNhbiBsYXppbHkgY29tcHV0ZSBicmFuY2hlcyBmb3IgYSB0YXJnZXQgbGFiZWwgYW5kIHRocm93LiBlLmcuIGlmIGFuIGludmFsaWQgdGFyZ2V0XG4gIC8vIGxhYmVsIGlzIGFwcGxpZWQsIHdlIHdhbnQgdG8gZXhpdCB0aGUgc2NyaXB0IGdyYWNlZnVsbHkgd2l0aCBhbiBlcnJvciBtZXNzYWdlLlxuICB0cnkge1xuICAgIHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHx8IGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHVybDogcHJEYXRhLnVybCxcbiAgICBwck51bWJlcixcbiAgICBsYWJlbHMsXG4gICAgcmVxdWlyZWRCYXNlU2hhLFxuICAgIGdpdGh1YlRhcmdldEJyYW5jaCxcbiAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCxcbiAgICBoYXNDYXJldGFrZXJOb3RlLFxuICAgIHRhcmdldEJyYW5jaGVzLFxuICAgIHRpdGxlOiBwckRhdGEudGl0bGUsXG4gICAgY29tbWl0Q291bnQ6IHByRGF0YS5jb21taXRzLnRvdGFsQ291bnQsXG4gIH07XG59XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSB0aGUgcmVxdWVzdGVkIHB1bGwgcmVxdWVzdC4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIC8vIE9ubHkgdGhlIGxhc3QgMTAwIGNvbW1pdHMgZnJvbSBhIHB1bGwgcmVxdWVzdCBhcmUgb2J0YWluZWQgYXMgd2UgbGlrZWx5IHdpbGwgbmV2ZXIgc2VlIGEgcHVsbFxuICAvLyByZXF1ZXN0cyB3aXRoIG1vcmUgdGhhbiAxMDAgY29tbWl0cy5cbiAgY29tbWl0czogcGFyYW1zKHtsYXN0OiAxMDB9LCB7XG4gICAgdG90YWxDb3VudDogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgICBub2RlczogW3tcbiAgICAgIGNvbW1pdDoge1xuICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnRkFJTFVSRScsICdQRU5ESU5HJywgJ1NVQ0NFU1MnXSBhcyBjb25zdCksXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2U6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICB9LFxuICAgIH1dLFxuICB9KSxcbiAgYmFzZVJlZk5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBsYWJlbHM6IHBhcmFtcyh7Zmlyc3Q6IDEwMH0sIHtcbiAgICBub2RlczogW3tcbiAgICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfV1cbiAgfSksXG59O1xuXG5cblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICAgIGdpdDogR2l0Q2xpZW50PHRydWU+LCBwck51bWJlcjogbnVtYmVyKTogUHJvbWlzZTx0eXBlb2YgUFJfU0NIRU1BfG51bGw+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB4ID0gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbiAgICByZXR1cm4geDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kLCB3ZSB3YW50IHRvIHJldHVybiBgbnVsbGAgc29cbiAgICAvLyB0aGF0IHRoZSBlcnJvciBjYW4gYmUgaGFuZGxlZCBncmFjZWZ1bGx5LlxuICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIHJlc29sdmVzIHRvIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3QodjogUHVsbFJlcXVlc3RGYWlsdXJlfFB1bGxSZXF1ZXN0KTogdiBpcyBQdWxsUmVxdWVzdCB7XG4gIHJldHVybiAodiBhcyBQdWxsUmVxdWVzdCkudGFyZ2V0QnJhbmNoZXMgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIGNvbW1pdHMgcHJvdmlkZWQgYXJlIGFsbG93ZWQgdG8gbWVyZ2UgdG8gdGhlIHByb3ZpZGVkIHRhcmdldCBsYWJlbCwgdGhyb3dpbmcgYVxuICogUHVsbFJlcXVlc3RGYWlsdXJlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoXG4gICAgY29tbWl0czogQ29tbWl0W10sIGxhYmVsOiBUYXJnZXRMYWJlbCwgY29uZmlnOiBNZXJnZUNvbmZpZykge1xuICAvKipcbiAgICogTGlzdCBvZiBjb21taXQgc2NvcGVzIHdoaWNoIGFyZSBleGVtcHRlZCBmcm9tIHRhcmdldCBsYWJlbCBjb250ZW50IHJlcXVpcmVtZW50cy4gaS5lLiBubyBgZmVhdGBcbiAgICogc2NvcGVzIGluIHBhdGNoIGJyYW5jaGVzLCBubyBicmVha2luZyBjaGFuZ2VzIGluIG1pbm9yIG9yIHBhdGNoIGNoYW5nZXMuXG4gICAqL1xuICBjb25zdCBleGVtcHRlZFNjb3BlcyA9IGNvbmZpZy50YXJnZXRMYWJlbEV4ZW1wdFNjb3BlcyB8fCBbXTtcbiAgLyoqIExpc3Qgb2YgY29tbWl0cyB3aGljaCBhcmUgc3ViamVjdCB0byBjb250ZW50IHJlcXVpcmVtZW50cyBmb3IgdGhlIHRhcmdldCBsYWJlbC4gKi9cbiAgY29tbWl0cyA9IGNvbW1pdHMuZmlsdGVyKGNvbW1pdCA9PiAhZXhlbXB0ZWRTY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSk7XG4gIHN3aXRjaCAobGFiZWwucGF0dGVybikge1xuICAgIGNhc2UgJ3RhcmdldDogbWFqb3InOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiBtaW5vcic6XG4gICAgICAvLyBDaGVjayBpZiBhbnkgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiBwYXRjaCc6XG4gICAgY2FzZSAndGFyZ2V0OiBsdHMnOlxuICAgICAgLy8gQ2hlY2sgaWYgYW55IGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyBhIGJyZWFraW5nIGNoYW5nZS5cbiAgICAgIGlmIChjb21taXRzLnNvbWUoY29tbWl0ID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKSkge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIENoZWNrIGlmIGFueSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgYSBjb21taXQgdHlwZSBvZiBcImZlYXRcIi5cbiAgICAgIGlmIChjb21taXRzLnNvbWUoY29tbWl0ID0+IGNvbW1pdC50eXBlID09PSAnZmVhdCcpKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNGZWF0dXJlQ29tbWl0cyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihyZWQoJ1dBUk5JTkc6IFVuYWJsZSB0byBjb25maXJtIGFsbCBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgYXJlIGVsaWdpYmxlIHRvIGJlJykpO1xuICAgICAgd2FybihyZWQoYG1lcmdlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoOiAke2xhYmVsLnBhdHRlcm59YCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBoYXMgdGhlIHByb3BlciBsYWJlbCBmb3IgYnJlYWtpbmcgY2hhbmdlcyBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlXG4gKiBjb21taXRzLCBhbmQgb25seSBoYXMgdGhlIGxhYmVsIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2UgY29tbWl0cy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoXG4gICAgY29tbWl0czogQ29tbWl0W10sIGxhYmVsczogc3RyaW5nW10sIGNvbmZpZzogTWVyZ2VDb25maWcpIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhIGxhYmVsIG5vdGluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzTGFiZWwgPSBsYWJlbHMuaW5jbHVkZXMoY29uZmlnLmJyZWFraW5nQ2hhbmdlTGFiZWwgfHwgQnJlYWtpbmdDaGFuZ2VMYWJlbCk7XG4gIC8vKiogV2hldGhlciB0aGUgUFIgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgd2hpY2ggbm90ZXMgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0NvbW1pdCA9IGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApO1xuXG4gIGlmICghaGFzTGFiZWwgJiYgaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUxhYmVsKCk7XG4gIH1cblxuICBpZiAoaGFzTGFiZWwgJiYgIWhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VDb21taXQoKTtcbiAgfVxufVxuIl19