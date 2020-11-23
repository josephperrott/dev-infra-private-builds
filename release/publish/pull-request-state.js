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
        define("@angular/dev-infra-private/release/publish/pull-request-state", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPullRequestState = void 0;
    var tslib_1 = require("tslib");
    /** Gets whether a given pull request has been merged. */
    function getPullRequestState(api, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.github.pulls.get(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { pull_number: id }))];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data.merged) return [3 /*break*/, 2];
                        return [2 /*return*/, 'merged'];
                    case 2:
                        if (!(data.closed_at !== null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, isPullRequestClosedWithAssociatedCommit(api, id)];
                    case 3: return [2 /*return*/, (_a.sent()) ? 'merged' : 'closed'];
                    case 4: return [2 /*return*/, 'open'];
                }
            });
        });
    }
    exports.getPullRequestState = getPullRequestState;
    /**
     * Whether the pull request has been closed with an associated commit. This is usually
     * the case if a PR has been merged using the autosquash merge script strategy. Since
     * the merge is not fast-forward, Github does not consider the PR as merged and instead
     * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
     */
    function isPullRequestClosedWithAssociatedCommit(api, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var request, events, i, _a, event_1, commit_id, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        request = api.github.issues.listEvents.endpoint.merge(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { issue_number: id }));
                        return [4 /*yield*/, api.github.paginate(request)];
                    case 1:
                        events = _c.sent();
                        i = events.length - 1;
                        _c.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 6];
                        _a = events[i], event_1 = _a.event, commit_id = _a.commit_id;
                        // If we come across a "reopened" event, we abort looking for referenced commits. Any
                        // commits that closed the PR before, are no longer relevant and did not close the PR.
                        if (event_1 === 'reopened') {
                            return [2 /*return*/, false];
                        }
                        // If a `closed` event is captured with a commit assigned, then we assume that
                        // this PR has been merged properly.
                        if (event_1 === 'closed' && commit_id) {
                            return [2 /*return*/, true];
                        }
                        _b = event_1 === 'referenced' && commit_id;
                        if (!_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, isCommitClosingPullRequest(api, commit_id, id)];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4:
                        // If the PR has been referenced by a commit, check if the commit closes this pull
                        // request. Note that this is needed besides checking `closed` as PRs could be merged
                        // into any non-default branch where the `Closes <..>` keyword does not work and the PR
                        // is simply closed without an associated `commit_id`. For more details see:
                        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#:~:text=non-default.
                        if (_b) {
                            return [2 /*return*/, true];
                        }
                        _c.label = 5;
                    case 5:
                        i--;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    }
    /** Checks whether the specified commit is closing the given pull request. */
    function isCommitClosingPullRequest(api, sha, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.github.repos.getCommit(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { ref: sha }))];
                    case 1:
                        data = (_a.sent()).data;
                        // Matches the closing keyword supported in commit messages. See:
                        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
                        return [2 /*return*/, data.commit.message.match(new RegExp("(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #" + id + "(?!\\d)", 'i'))];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQVFILHlEQUF5RDtJQUN6RCxTQUFzQixtQkFBbUIsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7Ozs7NEJBQ25ELHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsRUFBRSxJQUFFLEVBQUE7O3dCQUExRSxJQUFJLEdBQUksQ0FBQSxTQUFrRSxDQUFBLEtBQXRFOzZCQUNQLElBQUksQ0FBQyxNQUFNLEVBQVgsd0JBQVc7d0JBQ2Isc0JBQU8sUUFBUSxFQUFDOzs2QkFDUCxDQUFBLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFBLEVBQXZCLHdCQUF1Qjt3QkFDekIscUJBQU0sdUNBQXVDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFBOzRCQUE3RCxzQkFBTyxDQUFBLFNBQXNELEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFDOzRCQUVwRixzQkFBTyxNQUFNLEVBQUM7Ozs7S0FFakI7SUFURCxrREFTQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZSx1Q0FBdUMsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7Ozs7O3dCQUN6RSxPQUFPLEdBQ1QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsWUFBWSxFQUFFLEVBQUUsSUFBRSxDQUFDO3dCQUN4QyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQTs7d0JBQTdFLE1BQU0sR0FBcUMsU0FBa0M7d0JBSzFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQzlCLEtBQXFCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBN0Isa0JBQUssRUFBRSxTQUFTLGVBQUEsQ0FBYzt3QkFDckMscUZBQXFGO3dCQUNyRixzRkFBc0Y7d0JBQ3RGLElBQUksT0FBSyxLQUFLLFVBQVUsRUFBRTs0QkFDeEIsc0JBQU8sS0FBSyxFQUFDO3lCQUNkO3dCQUNELDhFQUE4RTt3QkFDOUUsb0NBQW9DO3dCQUNwQyxJQUFJLE9BQUssS0FBSyxRQUFRLElBQUksU0FBUyxFQUFFOzRCQUNuQyxzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7d0JBTUcsS0FBQSxPQUFLLEtBQUssWUFBWSxJQUFJLFNBQVMsQ0FBQTtpQ0FBbkMsd0JBQW1DO3dCQUNuQyxxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFBOzs4QkFBcEQsU0FBb0Q7Ozt3QkFOeEQsa0ZBQWtGO3dCQUNsRixxRkFBcUY7d0JBQ3JGLHVGQUF1Rjt3QkFDdkYsNEVBQTRFO3dCQUM1RSx5SUFBeUk7d0JBQ3pJLFFBQzBEOzRCQUN4RCxzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7Ozt3QkFwQnFDLENBQUMsRUFBRSxDQUFBOzs0QkFzQjNDLHNCQUFPLEtBQUssRUFBQzs7OztLQUNkO0lBRUQsNkVBQTZFO0lBQzdFLFNBQWUsMEJBQTBCLENBQUMsR0FBYyxFQUFFLEdBQVcsRUFBRSxFQUFVOzs7Ozs0QkFDaEUscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyx1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLEdBQUcsRUFBRSxHQUFHLElBQUUsRUFBQTs7d0JBQXpFLElBQUksR0FBSSxDQUFBLFNBQWlFLENBQUEsS0FBckU7d0JBQ1gsaUVBQWlFO3dCQUNqRSxxSEFBcUg7d0JBQ3JILHNCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDNUIsSUFBSSxNQUFNLENBQUMsa0RBQWdELEVBQUUsWUFBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUM7Ozs7S0FDbkYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG4vKiogU3RhdGUgb2YgYSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RTdGF0ZSA9ICdtZXJnZWQnfCdjbG9zZWQnfCdvcGVuJztcblxuLyoqIEdldHMgd2hldGhlciBhIGdpdmVuIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVsbFJlcXVlc3RTdGF0ZShhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcik6IFByb21pc2U8UHVsbFJlcXVlc3RTdGF0ZT4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnB1bGxzLmdldCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IGlkfSk7XG4gIGlmIChkYXRhLm1lcmdlZCkge1xuICAgIHJldHVybiAnbWVyZ2VkJztcbiAgfSBlbHNlIGlmIChkYXRhLmNsb3NlZF9hdCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBhd2FpdCBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpLCBpZCkgPyAnbWVyZ2VkJyA6ICdjbG9zZWQnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnb3Blbic7XG4gIH1cbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY2xvc2VkIHdpdGggYW4gYXNzb2NpYXRlZCBjb21taXQuIFRoaXMgaXMgdXN1YWxseVxuICogdGhlIGNhc2UgaWYgYSBQUiBoYXMgYmVlbiBtZXJnZWQgdXNpbmcgdGhlIGF1dG9zcXVhc2ggbWVyZ2Ugc2NyaXB0IHN0cmF0ZWd5LiBTaW5jZVxuICogdGhlIG1lcmdlIGlzIG5vdCBmYXN0LWZvcndhcmQsIEdpdGh1YiBkb2VzIG5vdCBjb25zaWRlciB0aGUgUFIgYXMgbWVyZ2VkIGFuZCBpbnN0ZWFkXG4gKiBzaG93cyB0aGUgUFIgYXMgY2xvc2VkLiBTZWUgZm9yIGV4YW1wbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC8zNzkxOC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdENsb3NlZFdpdGhBc3NvY2lhdGVkQ29tbWl0KGFwaTogR2l0Q2xpZW50LCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHJlcXVlc3QgPVxuICAgICAgYXBpLmdpdGh1Yi5pc3N1ZXMubGlzdEV2ZW50cy5lbmRwb2ludC5tZXJnZSh7Li4uYXBpLnJlbW90ZVBhcmFtcywgaXNzdWVfbnVtYmVyOiBpZH0pO1xuICBjb25zdCBldmVudHM6IE9jdG9raXQuSXNzdWVzTGlzdEV2ZW50c1Jlc3BvbnNlID0gYXdhaXQgYXBpLmdpdGh1Yi5wYWdpbmF0ZShyZXF1ZXN0KTtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBldmVudHMgb2YgdGhlIHB1bGwgcmVxdWVzdCBpbiByZXZlcnNlLiBXZSB3YW50IHRvIGZpbmQgdGhlIG1vc3RcbiAgLy8gcmVjZW50IGV2ZW50cyBhbmQgY2hlY2sgaWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB3aXRoIGEgY29tbWl0IGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB0aHJvdWdoIGEgY29tbWl0LCB3ZSBhc3N1bWUgdGhhdCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkXG4gIC8vIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHN0cmF0ZWd5LiBGb3IgbW9yZSBkZXRhaWxzLiBTZWUgdGhlIGBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneWAuXG4gIGZvciAobGV0IGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCB7ZXZlbnQsIGNvbW1pdF9pZH0gPSBldmVudHNbaV07XG4gICAgLy8gSWYgd2UgY29tZSBhY3Jvc3MgYSBcInJlb3BlbmVkXCIgZXZlbnQsIHdlIGFib3J0IGxvb2tpbmcgZm9yIHJlZmVyZW5jZWQgY29tbWl0cy4gQW55XG4gICAgLy8gY29tbWl0cyB0aGF0IGNsb3NlZCB0aGUgUFIgYmVmb3JlLCBhcmUgbm8gbG9uZ2VyIHJlbGV2YW50IGFuZCBkaWQgbm90IGNsb3NlIHRoZSBQUi5cbiAgICBpZiAoZXZlbnQgPT09ICdyZW9wZW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgYSBgY2xvc2VkYCBldmVudCBpcyBjYXB0dXJlZCB3aXRoIGEgY29tbWl0IGFzc2lnbmVkLCB0aGVuIHdlIGFzc3VtZSB0aGF0XG4gICAgLy8gdGhpcyBQUiBoYXMgYmVlbiBtZXJnZWQgcHJvcGVybHkuXG4gICAgaWYgKGV2ZW50ID09PSAnY2xvc2VkJyAmJiBjb21taXRfaWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgUFIgaGFzIGJlZW4gcmVmZXJlbmNlZCBieSBhIGNvbW1pdCwgY2hlY2sgaWYgdGhlIGNvbW1pdCBjbG9zZXMgdGhpcyBwdWxsXG4gICAgLy8gcmVxdWVzdC4gTm90ZSB0aGF0IHRoaXMgaXMgbmVlZGVkIGJlc2lkZXMgY2hlY2tpbmcgYGNsb3NlZGAgYXMgUFJzIGNvdWxkIGJlIG1lcmdlZFxuICAgIC8vIGludG8gYW55IG5vbi1kZWZhdWx0IGJyYW5jaCB3aGVyZSB0aGUgYENsb3NlcyA8Li4+YCBrZXl3b3JkIGRvZXMgbm90IHdvcmsgYW5kIHRoZSBQUlxuICAgIC8vIGlzIHNpbXBseSBjbG9zZWQgd2l0aG91dCBhbiBhc3NvY2lhdGVkIGBjb21taXRfaWRgLiBGb3IgbW9yZSBkZXRhaWxzIHNlZTpcbiAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3JkcyM6fjp0ZXh0PW5vbi1kZWZhdWx0LlxuICAgIGlmIChldmVudCA9PT0gJ3JlZmVyZW5jZWQnICYmIGNvbW1pdF9pZCAmJlxuICAgICAgICBhd2FpdCBpc0NvbW1pdENsb3NpbmdQdWxsUmVxdWVzdChhcGksIGNvbW1pdF9pZCwgaWQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBjb21taXQgaXMgY2xvc2luZyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpOiBHaXRDbGllbnQsIHNoYTogc3RyaW5nLCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IGFwaS5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi5hcGkucmVtb3RlUGFyYW1zLCByZWY6IHNoYX0pO1xuICAvLyBNYXRjaGVzIHRoZSBjbG9zaW5nIGtleXdvcmQgc3VwcG9ydGVkIGluIGNvbW1pdCBtZXNzYWdlcy4gU2VlOlxuICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3Jkcy5cbiAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2UubWF0Y2goXG4gICAgICBuZXcgUmVnRXhwKGAoPzpjbG9zZVtzZF0/fGZpeCg/OmVbc2RdPyl8cmVzb2x2ZVtzZF0/KTo/ICMke2lkfSg/IVxcXFxkKWAsICdpJykpO1xufVxuIl19