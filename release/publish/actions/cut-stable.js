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
        define("@angular/dev-infra-private/release/publish/actions/cut-stable", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning/long-term-support", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/external-commands"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutStableAction = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var long_term_support_1 = require("@angular/dev-infra-private/release/versioning/long-term-support");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var external_commands_1 = require("@angular/dev-infra-private/release/publish/external-commands");
    /**
     * Release action that cuts a stable version for the current release-train in the release
     * candidate phase. The pre-release release-candidate version label is removed.
     */
    var CutStableAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutStableAction, _super);
        function CutStableAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = _this._computeNewVersion();
            return _this;
        }
        CutStableAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion;
                return tslib_1.__generator(this, function (_a) {
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Cut a stable release for the release-candidate branch (v" + newVersion + ")."];
                });
            });
        };
        CutStableAction.prototype.perform = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, isNewMajor, id, previousPatch, ltsTagForPatch;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            isNewMajor = (_a = this.active.releaseCandidate) === null || _a === void 0 ? void 0 : _a.isMajor;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            id = (_b.sent()).id;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'latest')];
                        case 3:
                            _b.sent();
                            if (!isNewMajor) return [3 /*break*/, 7];
                            previousPatch = this.active.latest;
                            ltsTagForPatch = long_term_support_1.getLtsNpmDistTagOfMajor(previousPatch.version.major);
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(previousPatch.branchName)];
                        case 4:
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version)];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7: return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(newVersion, branchName)];
                        case 8:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the new stable version of the release candidate release-train. */
        CutStableAction.prototype._computeNewVersion = function () {
            var version = this.active.releaseCandidate.version;
            return semver.parse(version.major + "." + version.minor + "." + version.patch);
        };
        CutStableAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // A stable version can be cut for an active release-train currently in the
                    // release-candidate phase. Note: It is not possible to directly release from
                    // feature-freeze phase into a stable version.
                    return [2 /*return*/, active.releaseCandidate !== null &&
                            active.releaseCandidate.version.prerelease[0] === 'rc'];
                });
            });
        };
        return CutStableAction;
    }(actions_1.ReleaseAction));
    exports.CutStableAction = CutStableAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMscUdBQTJFO0lBQzNFLDhFQUF5QztJQUN6QyxrR0FBdUY7SUFFdkY7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7WUFBQSxxRUFvREM7WUFuRFMsaUJBQVcsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7UUFtRGxELENBQUM7UUFqRE8sd0NBQWMsR0FBcEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLHNCQUFPLDZEQUEyRCxVQUFVLE9BQUksRUFBQzs7O1NBQ2xGO1FBRUssaUNBQU8sR0FBYjs7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsV0FBakMsQ0FBa0M7NEJBQzdDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOzRCQUM5QixVQUFVLFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsMENBQUUsT0FBTyxDQUFDOzRCQUc1QyxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsRUFBRSxHQUFJLENBQUEsU0FBZ0UsQ0FBQSxHQUFwRTs0QkFFVCxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUE7OzRCQUEzQyxTQUEyQyxDQUFDOzRCQUM1QyxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUE7OzRCQUE1RCxTQUE0RCxDQUFDO2lDQUl6RCxVQUFVLEVBQVYsd0JBQVU7NEJBQ04sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDOzRCQUNuQyxjQUFjLEdBQUcsMkNBQXVCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFNUUsa0ZBQWtGOzRCQUNsRixvRkFBb0Y7NEJBQ3BGLG1GQUFtRjs0QkFDbkYsdUZBQXVGOzRCQUN2Rix1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUscUJBQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBTjNELGtGQUFrRjs0QkFDbEYsb0ZBQW9GOzRCQUNwRixtRkFBbUY7NEJBQ25GLHVGQUF1Rjs0QkFDdkYsdUZBQXVGOzRCQUN2Riw4RUFBOEU7NEJBQzlFLFNBQTJELENBQUM7NEJBQzVELHFCQUFNLDRDQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBQS9DLFNBQStDLENBQUM7NEJBQ2hELHFCQUFNLDJDQUF1QixDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUE7OzRCQUFwRSxTQUFvRSxDQUFDOztnQ0FHdkUscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXBFLFNBQW9FLENBQUM7Ozs7O1NBQ3RFO1FBRUQsMEVBQTBFO1FBQ2xFLDRDQUFrQixHQUExQjtZQUNTLElBQUEsT0FBTyxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLFFBQWpDLENBQWtDO1lBQ2hELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBSSxPQUFPLENBQUMsS0FBSyxTQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQU8sQ0FBRSxDQUFDO1FBQzdFLENBQUM7UUFFWSx3QkFBUSxHQUFyQixVQUFzQixNQUEyQjs7O29CQUMvQywyRUFBMkU7b0JBQzNFLDZFQUE2RTtvQkFDN0UsOENBQThDO29CQUM5QyxzQkFBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSTs0QkFDbkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFDOzs7U0FDNUQ7UUFDSCxzQkFBQztJQUFELENBQUMsQUFwREQsQ0FBcUMsdUJBQWEsR0FvRGpEO0lBcERZLDBDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7Z2V0THRzTnBtRGlzdFRhZ09mTWFqb3J9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbG9uZy10ZXJtLXN1cHBvcnQnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7aW52b2tlU2V0TnBtRGlzdENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIHN0YWJsZSB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCByZWxlYXNlLXRyYWluIGluIHRoZSByZWxlYXNlXG4gKiBjYW5kaWRhdGUgcGhhc2UuIFRoZSBwcmUtcmVsZWFzZSByZWxlYXNlLWNhbmRpZGF0ZSB2ZXJzaW9uIGxhYmVsIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRTdGFibGVBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBzdGFibGUgcmVsZWFzZSBmb3IgdGhlIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIGNvbnN0IGlzTmV3TWFqb3IgPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlPy5pc01ham9yO1xuXG5cbiAgICBjb25zdCB7aWR9ID0gYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gobmV3VmVyc2lvbiwgYnJhbmNoTmFtZSwgJ2xhdGVzdCcpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYW5kIGJlY29tZXMgdGhlIFwibGF0ZXN0XCIgcmVsZWFzZS10cmFpbiwgd2UgbmVlZFxuICAgIC8vIHRvIHNldCB0aGUgTFRTIG5wbSBkaXN0IHRhZyBmb3IgdGhlIHByZXZpb3VzIGxhdGVzdCByZWxlYXNlLXRyYWluICh0aGUgY3VycmVudCBwYXRjaCkuXG4gICAgaWYgKGlzTmV3TWFqb3IpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGF0Y2ggPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgICBjb25zdCBsdHNUYWdGb3JQYXRjaCA9IGdldEx0c05wbURpc3RUYWdPZk1ham9yKHByZXZpb3VzUGF0Y2gudmVyc2lvbi5tYWpvcik7XG5cbiAgICAgIC8vIEluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFncywgd2UgaW52b2tlIHRoZSBuZy1kZXYgY29tbWFuZCBmb3JcbiAgICAgIC8vIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFdlIGRvIHRoaXMgYmVjYXVzZSByZWxlYXNlIE5QTVxuICAgICAgLy8gcGFja2FnZXMgY291bGQgYmUgZGlmZmVyZW50IGluIHRoZSBwcmV2aW91cyBwYXRjaCBicmFuY2gsIGFuZCB3ZSB3YW50IHRvIHNldCB0aGVcbiAgICAgIC8vIExUUyB0YWcgZm9yIGFsbCBwYWNrYWdlcyBwYXJ0IG9mIHRoZSBsYXN0IG1ham9yLiBJdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gc2V0IHRoZVxuICAgICAgLy8gTlBNIGRpc3QgdGFnIGZvciBuZXcgcGFja2FnZXMgcGFydCBvZiB0aGUgcmVsZWFzZWQgbWFqb3IsIG5vciB3b3VsZCBpdCBiZSBhY2NlcHRhYmxlXG4gICAgICAvLyB0byBza2lwIHRoZSBMVFMgdGFnIGZvciBwYWNrYWdlcyB3aGljaCBhcmUgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIG5ldyBtYWpvci5cbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwcmV2aW91c1BhdGNoLmJyYW5jaE5hbWUpO1xuICAgICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZChsdHNUYWdGb3JQYXRjaCwgcHJldmlvdXNQYXRjaC52ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuZXcgc3RhYmxlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UgY2FuZGlkYXRlIHJlbGVhc2UtdHJhaW4uICovXG4gIHByaXZhdGUgX2NvbXB1dGVOZXdWZXJzaW9uKCk6IHNlbXZlci5TZW1WZXIge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIHJldHVybiBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YCkhO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgc3RhYmxlIHZlcnNpb24gY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICAgIC8vIHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gZGlyZWN0bHkgcmVsZWFzZSBmcm9tXG4gICAgLy8gZmVhdHVyZS1mcmVlemUgcGhhc2UgaW50byBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYyc7XG4gIH1cbn1cbiJdfQ==