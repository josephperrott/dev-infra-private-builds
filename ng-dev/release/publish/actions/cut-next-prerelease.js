"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CutNextPrereleaseAction = void 0;
const semver_1 = require("../../../utils/semver");
const next_prerelease_version_1 = require("../../versioning/next-prerelease-version");
const actions_1 = require("../actions");
/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
class CutNextPrereleaseAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving with the new version if a NPM next pre-release is cut. */
        this._newVersion = this._computeNewVersion();
    }
    async getDescription() {
        const { branchName } = this._getActivePrereleaseTrain();
        const newVersion = await this._newVersion;
        return `Cut a new next pre-release for the "${branchName}" branch (v${newVersion}).`;
    }
    async perform() {
        const releaseTrain = this._getActivePrereleaseTrain();
        const { branchName } = releaseTrain;
        const newVersion = await this._newVersion;
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, branchName);
        await this.waitForPullRequestToBeMerged(pullRequest);
        await this.buildAndPublish(releaseNotes, branchName, 'next');
        // If the pre-release has been cut from a branch that is not corresponding
        // to the next release-train, cherry-pick the changelog into the primary
        // development branch. i.e. the `next` branch that is usually `master`.
        if (releaseTrain !== this.active.next) {
            await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
        }
    }
    /** Gets the release train for which NPM next pre-releases should be cut. */
    _getActivePrereleaseTrain() {
        return this.active.releaseCandidate ?? this.active.next;
    }
    /** Gets the new pre-release version for this release action. */
    async _computeNewVersion() {
        const releaseTrain = this._getActivePrereleaseTrain();
        // If a pre-release is cut for the next release-train, the new version is computed
        // with respect to special cases surfacing with FF/RC branches. Otherwise, the basic
        // pre-release increment of the version is used as new version.
        if (releaseTrain === this.active.next) {
            return await next_prerelease_version_1.computeNewPrereleaseVersionForNext(this.active, this.config);
        }
        else {
            return semver_1.semverInc(releaseTrain.version, 'prerelease');
        }
    }
    static async isActive() {
        // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
        // there is a feature-freeze/release-candidate branch, the next pre-releases are either
        // cut from such a branch, or from the actual `next` release-train branch (i.e. master).
        return true;
    }
}
exports.CutNextPrereleaseAction = CutNextPrereleaseAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILGtEQUFnRDtBQUNoRCxzRkFBNEY7QUFFNUYsd0NBQXlDO0FBRXpDOzs7R0FHRztBQUNILE1BQWEsdUJBQXdCLFNBQVEsdUJBQWE7SUFBMUQ7O1FBQ0UsK0VBQStFO1FBQ3ZFLGdCQUFXLEdBQTJCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBcUQxRSxDQUFDO0lBbkRVLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDMUMsT0FBTyx1Q0FBdUMsVUFBVSxjQUFjLFVBQVUsSUFBSSxDQUFDO0lBQ3ZGLENBQUM7SUFFUSxLQUFLLENBQUMsT0FBTztRQUNwQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN0RCxNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUUxQyxNQUFNLEVBQUMsV0FBVyxFQUFFLFlBQVksRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUMxRSxVQUFVLEVBQ1YsVUFBVSxDQUNYLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU3RCwwRUFBMEU7UUFDMUUsd0VBQXdFO1FBQ3hFLHVFQUF1RTtRQUN2RSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNyQyxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDeEU7SUFDSCxDQUFDO0lBRUQsNEVBQTRFO0lBQ3BFLHlCQUF5QjtRQUMvQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDMUQsQ0FBQztJQUVELGdFQUFnRTtJQUN4RCxLQUFLLENBQUMsa0JBQWtCO1FBQzlCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ3RELGtGQUFrRjtRQUNsRixvRkFBb0Y7UUFDcEYsK0RBQStEO1FBQy9ELElBQUksWUFBWSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ3JDLE9BQU8sTUFBTSw0REFBa0MsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzRTthQUFNO1lBQ0wsT0FBTyxrQkFBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFVLEtBQUssQ0FBQyxRQUFRO1FBQzVCLG1GQUFtRjtRQUNuRix1RkFBdUY7UUFDdkYsd0ZBQXdGO1FBQ3hGLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBdkRELDBEQXVEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBwcmVyZWxlYXNlIGZvciB0aGUgbmV4dCBicmFuY2guIEEgdmVyc2lvbiBpbiB0aGUgbmV4dFxuICogYnJhbmNoIGNhbiBoYXZlIGFuIGFyYml0cmFyeSBhbW91bnQgb2YgbmV4dCBwcmUtcmVsZWFzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXROZXh0UHJlcmVsZWFzZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgd2l0aCB0aGUgbmV3IHZlcnNpb24gaWYgYSBOUE0gbmV4dCBwcmUtcmVsZWFzZSBpcyBjdXQuICovXG4gIHByaXZhdGUgX25ld1ZlcnNpb246IFByb21pc2U8c2VtdmVyLlNlbVZlcj4gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IG5leHQgcHJlLXJlbGVhc2UgZm9yIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSByZWxlYXNlVHJhaW47XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGJyYW5jaE5hbWUsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuXG4gICAgLy8gSWYgdGhlIHByZS1yZWxlYXNlIGhhcyBiZWVuIGN1dCBmcm9tIGEgYnJhbmNoIHRoYXQgaXMgbm90IGNvcnJlc3BvbmRpbmdcbiAgICAvLyB0byB0aGUgbmV4dCByZWxlYXNlLXRyYWluLCBjaGVycnktcGljayB0aGUgY2hhbmdlbG9nIGludG8gdGhlIHByaW1hcnlcbiAgICAvLyBkZXZlbG9wbWVudCBicmFuY2guIGkuZS4gdGhlIGBuZXh0YCBicmFuY2ggdGhhdCBpcyB1c3VhbGx5IGBtYXN0ZXJgLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gIT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJlbGVhc2UgdHJhaW4gZm9yIHdoaWNoIE5QTSBuZXh0IHByZS1yZWxlYXNlcyBzaG91bGQgYmUgY3V0LiAqL1xuICBwcml2YXRlIF9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTogUmVsZWFzZVRyYWluIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA/PyB0aGlzLmFjdGl2ZS5uZXh0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jb21wdXRlTmV3VmVyc2lvbigpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICAvLyBJZiBhIHByZS1yZWxlYXNlIGlzIGN1dCBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgdGhlIG5ldyB2ZXJzaW9uIGlzIGNvbXB1dGVkXG4gICAgLy8gd2l0aCByZXNwZWN0IHRvIHNwZWNpYWwgY2FzZXMgc3VyZmFjaW5nIHdpdGggRkYvUkMgYnJhbmNoZXMuIE90aGVyd2lzZSwgdGhlIGJhc2ljXG4gICAgLy8gcHJlLXJlbGVhc2UgaW5jcmVtZW50IG9mIHRoZSB2ZXJzaW9uIGlzIHVzZWQgYXMgbmV3IHZlcnNpb24uXG4gICAgaWYgKHJlbGVhc2VUcmFpbiA9PT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyhyZWxlYXNlVHJhaW4udmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoKSB7XG4gICAgLy8gUHJlLXJlbGVhc2VzIGZvciB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBjYW4gYWx3YXlzIGJlIGN1dC4gRGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAgICAvLyB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCwgdGhlIG5leHQgcHJlLXJlbGVhc2VzIGFyZSBlaXRoZXJcbiAgICAvLyBjdXQgZnJvbSBzdWNoIGEgYnJhbmNoLCBvciBmcm9tIHRoZSBhY3R1YWwgYG5leHRgIHJlbGVhc2UtdHJhaW4gYnJhbmNoIChpLmUuIG1hc3RlcikuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==