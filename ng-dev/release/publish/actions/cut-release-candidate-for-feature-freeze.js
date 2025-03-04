"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CutReleaseCandidateForFeatureFreezeAction = void 0;
const semver_1 = require("../../../utils/semver");
const actions_1 = require("../actions");
/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
class CutReleaseCandidateForFeatureFreezeAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semver_1.semverInc(this.active.releaseCandidate.version, 'prerelease', 'rc');
    }
    async getDescription() {
        const newVersion = this._newVersion;
        return `Cut a first release-candidate for the feature-freeze branch (v${newVersion}).`;
    }
    async perform() {
        const { branchName } = this.active.releaseCandidate;
        const newVersion = this._newVersion;
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, branchName);
        await this.waitForPullRequestToBeMerged(pullRequest);
        await this.buildAndPublish(releaseNotes, branchName, 'next');
        await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
    }
    static async isActive(active) {
        // A release-candidate can be cut for an active release-train currently
        // in the feature-freeze phase.
        return (active.releaseCandidate !== null && active.releaseCandidate.version.prerelease[0] === 'next');
    }
}
exports.CutReleaseCandidateForFeatureFreezeAction = CutReleaseCandidateForFeatureFreezeAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLWZvci1mZWF0dXJlLWZyZWV6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtcmVsZWFzZS1jYW5kaWRhdGUtZm9yLWZlYXR1cmUtZnJlZXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGtEQUFnRDtBQUVoRCx3Q0FBeUM7QUFFekM7OztHQUdHO0FBQ0gsTUFBYSx5Q0FBMEMsU0FBUSx1QkFBYTtJQUE1RTs7UUFDVSxnQkFBVyxHQUFHLGtCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBNEI3RixDQUFDO0lBMUJVLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsT0FBTyxpRUFBaUUsVUFBVSxJQUFJLENBQUM7SUFDekYsQ0FBQztJQUVRLEtBQUssQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDO1FBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFcEMsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FDMUUsVUFBVSxFQUNWLFVBQVUsQ0FDWCxDQUFDO1FBRUYsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0QsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCxNQUFNLENBQVUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEyQjtRQUN4RCx1RUFBdUU7UUFDdkUsK0JBQStCO1FBQy9CLE9BQU8sQ0FDTCxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FDN0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTdCRCw4RkE2QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogQ3V0cyB0aGUgZmlyc3QgcmVsZWFzZSBjYW5kaWRhdGUgZm9yIGEgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlXG4gKiBmZWF0dXJlLWZyZWV6ZSBwaGFzZS4gVGhlIHZlcnNpb24gaXMgYnVtcGVkIGZyb20gYG5leHRgIHRvIGByYy4wYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFJlbGVhc2VDYW5kaWRhdGVGb3JGZWF0dXJlRnJlZXplQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBzZW12ZXJJbmModGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSEudmVyc2lvbiwgJ3ByZXJlbGVhc2UnLCAncmMnKTtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIGZpcnN0IHJlbGVhc2UtY2FuZGlkYXRlIGZvciB0aGUgZmVhdHVyZS1mcmVlemUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGJyYW5jaE5hbWUsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSByZWxlYXNlLWNhbmRpZGF0ZSBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHlcbiAgICAvLyBpbiB0aGUgZmVhdHVyZS1mcmVlemUgcGhhc2UuXG4gICAgcmV0dXJuIChcbiAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnXG4gICAgKTtcbiAgfVxufVxuIl19