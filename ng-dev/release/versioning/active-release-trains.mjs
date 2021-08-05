"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveReleaseTrainsFromVersionBranches = exports.fetchActiveReleaseTrains = exports.nextBranchName = void 0;
const semver = require("semver");
const release_trains_1 = require("./release-trains");
const version_branches_1 = require("./version-branches");
/** Branch name for the `next` branch. */
exports.nextBranchName = 'master';
/** Fetches the active release trains for the configured project. */
async function fetchActiveReleaseTrains(repo) {
    const nextVersion = await version_branches_1.getVersionOfBranch(repo, exports.nextBranchName);
    const next = new release_trains_1.ReleaseTrain(exports.nextBranchName, nextVersion);
    const majorVersionsToConsider = [];
    let expectedReleaseCandidateMajor;
    // If the `next` branch (i.e. `master` branch) is for an upcoming major version, we know
    // that there is no patch branch or feature-freeze/release-candidate branch for this major
    // digit. If the current `next` version is the first minor of a major version, we know that
    // the feature-freeze/release-candidate branch can only be the actual major branch. The
    // patch branch is based on that, either the actual major branch or the last minor from the
    // preceding major version. In all other cases, the patch branch and feature-freeze or
    // release-candidate branch are part of the same major version. Consider the following:
    //
    //  CASE 1. next: 11.0.0-next.0: patch and feature-freeze/release-candidate can only be
    //          most recent `10.<>.x` branches. The FF/RC branch can only be the last-minor of v10.
    //  CASE 2. next: 11.1.0-next.0: patch can be either `11.0.x` or last-minor in v10 based
    //          on whether there is a feature-freeze/release-candidate branch (=> `11.0.x`).
    //  CASE 3. next: 10.6.0-next.0: patch can be either `10.5.x` or `10.4.x` based on whether
    //          there is a feature-freeze/release-candidate branch (=> `10.5.x`)
    if (nextVersion.minor === 0) {
        expectedReleaseCandidateMajor = nextVersion.major - 1;
        majorVersionsToConsider.push(nextVersion.major - 1);
    }
    else if (nextVersion.minor === 1) {
        expectedReleaseCandidateMajor = nextVersion.major;
        majorVersionsToConsider.push(nextVersion.major, nextVersion.major - 1);
    }
    else {
        expectedReleaseCandidateMajor = nextVersion.major;
        majorVersionsToConsider.push(nextVersion.major);
    }
    // Collect all version-branches that should be considered for the latest version-branch,
    // or the feature-freeze/release-candidate.
    const branches = await version_branches_1.getBranchesForMajorVersions(repo, majorVersionsToConsider);
    const { latest, releaseCandidate } = await findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor);
    if (latest === null) {
        throw Error(`Unable to determine the latest release-train. The following branches ` +
            `have been considered: [${branches.map((b) => b.name).join(', ')}]`);
    }
    return { releaseCandidate, latest, next };
}
exports.fetchActiveReleaseTrains = fetchActiveReleaseTrains;
/** Finds the currently active release trains from the specified version branches. */
async function findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
    // Version representing the release-train currently in the next phase. Note that we ignore
    // patch and pre-release segments in order to be able to compare the next release train to
    // other release trains from version branches (which follow the `N.N.x` pattern).
    const nextReleaseTrainVersion = semver.parse(`${nextVersion.major}.${nextVersion.minor}.0`);
    let latest = null;
    let releaseCandidate = null;
    // Iterate through the captured branches and find the latest non-prerelease branch and a
    // potential release candidate branch. From the collected branches we iterate descending
    // order (most recent semantic version-branch first). The first branch is either the latest
    // active version branch (i.e. patch) or a feature-freeze/release-candidate branch. A FF/RC
    // branch cannot be older than the latest active version-branch, so we stop iterating once
    // we found such a branch. Otherwise, if we found a FF/RC branch, we continue looking for the
    // next version-branch as that one is supposed to be the latest active version-branch. If it
    // is not, then an error will be thrown due to two FF/RC branches existing at the same time.
    for (const { name, parsed } of branches) {
        // It can happen that version branches have been accidentally created which are more recent
        // than the release-train in the next branch (i.e. `master`). We could ignore such branches
        // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
        // accidentally created branch by the caretaker. In either way we want to raise awareness.
        if (semver.gt(parsed, nextReleaseTrainVersion)) {
            throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is ` +
                `more recent than the release-train currently in the "${exports.nextBranchName}" branch. ` +
                `Please either delete the branch if created by accident, or update the outdated ` +
                `version in the next branch (${exports.nextBranchName}).`);
        }
        else if (semver.eq(parsed, nextReleaseTrainVersion)) {
            throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is already ` +
                `active in the "${exports.nextBranchName}" branch. Please either delete the branch if ` +
                `created by accident, or update the version in the next branch (${exports.nextBranchName}).`);
        }
        const version = await version_branches_1.getVersionOfBranch(repo, name);
        const releaseTrain = new release_trains_1.ReleaseTrain(name, version);
        const isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';
        if (isPrerelease) {
            if (releaseCandidate !== null) {
                throw Error(`Unable to determine latest release-train. Found two consecutive ` +
                    `branches in feature-freeze/release-candidate phase. Did not expect both "${name}" ` +
                    `and "${releaseCandidate.branchName}" to be in feature-freeze/release-candidate mode.`);
            }
            else if (version.major !== expectedReleaseCandidateMajor) {
                throw Error(`Discovered unexpected old feature-freeze/release-candidate branch. Expected no ` +
                    `version-branch in feature-freeze/release-candidate mode for v${version.major}.`);
            }
            releaseCandidate = releaseTrain;
        }
        else {
            latest = releaseTrain;
            break;
        }
    }
    return { releaseCandidate, latest };
}
exports.findActiveReleaseTrainsFromVersionBranches = findActiveReleaseTrainsFromVersionBranches;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLHFEQUE4QztBQUM5Qyx5REFLNEI7QUFZNUIseUNBQXlDO0FBQzVCLFFBQUEsY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUV2QyxvRUFBb0U7QUFDN0QsS0FBSyxVQUFVLHdCQUF3QixDQUM1QyxJQUF1QjtJQUV2QixNQUFNLFdBQVcsR0FBRyxNQUFNLHFDQUFrQixDQUFDLElBQUksRUFBRSxzQkFBYyxDQUFDLENBQUM7SUFDbkUsTUFBTSxJQUFJLEdBQUcsSUFBSSw2QkFBWSxDQUFDLHNCQUFjLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDM0QsTUFBTSx1QkFBdUIsR0FBYSxFQUFFLENBQUM7SUFDN0MsSUFBSSw2QkFBcUMsQ0FBQztJQUUxQyx3RkFBd0Y7SUFDeEYsMEZBQTBGO0lBQzFGLDJGQUEyRjtJQUMzRix1RkFBdUY7SUFDdkYsMkZBQTJGO0lBQzNGLHNGQUFzRjtJQUN0Rix1RkFBdUY7SUFDdkYsRUFBRTtJQUNGLHVGQUF1RjtJQUN2RiwrRkFBK0Y7SUFDL0Ysd0ZBQXdGO0lBQ3hGLHdGQUF3RjtJQUN4RiwwRkFBMEY7SUFDMUYsNEVBQTRFO0lBQzVFLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDM0IsNkJBQTZCLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDdEQsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDckQ7U0FBTSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ2xDLDZCQUE2QixHQUFHLFdBQVcs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TUFBTSxLQUFLLENBQ1Qsa0VBQWtFO29CQUNoRSw0RUFBNEUsSUFBSSxJQUFJO29CQUNwRixRQUFRLGdCQUFnQixDQUFDLFVBQVUsbURBQW1ELENBQ3pGLENBQUM7YUFDSDtpQkFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssNkJBQTZCLEVBQUU7Z0JBQzFELE1BQU0sS0FBSyxDQUNULGlGQUFpRjtvQkFDL0UsZ0VBQWdFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FDbkYsQ0FBQzthQUNIO1lBQ0QsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO1NBQ2pDO2FBQU07WUFDTCxNQUFNLEdBQUcsWUFBWSxDQUFDO1lBQ3RCLE1BQU07U0FDUDtLQUNGO0lBRUQsT0FBTyxFQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBQyxDQUFDO0FBQ3BDLENBQUM7QUF0RUQsZ0dBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VUcmFpbn0gZnJvbSAnLi9yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1xuICBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMsXG4gIGdldFZlcnNpb25PZkJyYW5jaCxcbiAgR2l0aHViUmVwb1dpdGhBcGksXG4gIFZlcnNpb25CcmFuY2gsXG59IGZyb20gJy4vdmVyc2lvbi1icmFuY2hlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBkZXRlcm1pbmVkIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgYSBwcm9qZWN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVSZWxlYXNlVHJhaW5zIHtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcInJlbGVhc2UtY2FuZGlkYXRlXCIgb3IgXCJmZWF0dXJlLWZyZWV6ZVwiIHBoYXNlLiAqL1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsO1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwibGF0ZXN0XCIgcGhhc2UuICovXG4gIGxhdGVzdDogUmVsZWFzZVRyYWluO1xuICAvKiogUmVsZWFzZS10cmFpbiBpbiB0aGUgYG5leHRgIHBoYXNlLiAqL1xuICBuZXh0OiBSZWxlYXNlVHJhaW47XG59XG5cbi8qKiBCcmFuY2ggbmFtZSBmb3IgdGhlIGBuZXh0YCBicmFuY2guICovXG5leHBvcnQgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSAnbWFzdGVyJztcblxuLyoqIEZldGNoZXMgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMoXG4gIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLFxuKTogUHJvbWlzZTxBY3RpdmVSZWxlYXNlVHJhaW5zPiB7XG4gIGNvbnN0IG5leHRWZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5leHRCcmFuY2hOYW1lKTtcbiAgY29uc3QgbmV4dCA9IG5ldyBSZWxlYXNlVHJhaW4obmV4dEJyYW5jaE5hbWUsIG5leHRWZXJzaW9uKTtcbiAgY29uc3QgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXI6IG51bWJlcltdID0gW107XG4gIGxldCBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyO1xuXG4gIC8vIElmIHRoZSBgbmV4dGAgYnJhbmNoIChpLmUuIGBtYXN0ZXJgIGJyYW5jaCkgaXMgZm9yIGFuIHVwY29taW5nIG1ham9yIHZlcnNpb24sIHdlIGtub3dcbiAgLy8gdGhhdCB0aGVyZSBpcyBubyBwYXRjaCBicmFuY2ggb3IgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGZvciB0aGlzIG1ham9yXG4gIC8vIGRpZ2l0LiBJZiB0aGUgY3VycmVudCBgbmV4dGAgdmVyc2lvbiBpcyB0aGUgZmlyc3QgbWlub3Igb2YgYSBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93IHRoYXRcbiAgLy8gdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaC4gVGhlXG4gIC8vIHBhdGNoIGJyYW5jaCBpcyBiYXNlZCBvbiB0aGF0LCBlaXRoZXIgdGhlIGFjdHVhbCBtYWpvciBicmFuY2ggb3IgdGhlIGxhc3QgbWlub3IgZnJvbSB0aGVcbiAgLy8gcHJlY2VkaW5nIG1ham9yIHZlcnNpb24uIEluIGFsbCBvdGhlciBjYXNlcywgdGhlIHBhdGNoIGJyYW5jaCBhbmQgZmVhdHVyZS1mcmVlemUgb3JcbiAgLy8gcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGFyZSBwYXJ0IG9mIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uIENvbnNpZGVyIHRoZSBmb2xsb3dpbmc6XG4gIC8vXG4gIC8vICBDQVNFIDEuIG5leHQ6IDExLjAuMC1uZXh0LjA6IHBhdGNoIGFuZCBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBjYW4gb25seSBiZVxuICAvLyAgICAgICAgICBtb3N0IHJlY2VudCBgMTAuPD4ueGAgYnJhbmNoZXMuIFRoZSBGRi9SQyBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGxhc3QtbWlub3Igb2YgdjEwLlxuICAvLyAgQ0FTRSAyLiBuZXh0OiAxMS4xLjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMS4wLnhgIG9yIGxhc3QtbWlub3IgaW4gdjEwIGJhc2VkXG4gIC8vICAgICAgICAgIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMS4wLnhgKS5cbiAgLy8gIENBU0UgMy4gbmV4dDogMTAuNi4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTAuNS54YCBvciBgMTAuNC54YCBiYXNlZCBvbiB3aGV0aGVyXG4gIC8vICAgICAgICAgIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTAuNS54YClcbiAgaWYgKG5leHRWZXJzaW9uLm1pbm9yID09PSAwKSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvciAtIDE7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciAtIDEpO1xuICB9IGVsc2UgaWYgKG5leHRWZXJzaW9uLm1pbm9yID09PSAxKSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yLCBuZXh0VmVyc2lvbi5tYWpvciAtIDEpO1xuICB9IGVsc2Uge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvcik7XG4gIH1cblxuICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgZm9yIHRoZSBsYXRlc3QgdmVyc2lvbi1icmFuY2gsXG4gIC8vIG9yIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZS5cbiAgY29uc3QgYnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMocmVwbywgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIpO1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlfSA9IGF3YWl0IGZpbmRBY3RpdmVSZWxlYXNlVHJhaW5zRnJvbVZlcnNpb25CcmFuY2hlcyhcbiAgICByZXBvLFxuICAgIG5leHRWZXJzaW9uLFxuICAgIGJyYW5jaGVzLFxuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yLFxuICApO1xuXG4gIGlmIChsYXRlc3QgPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gVGhlIGZvbGxvd2luZyBicmFuY2hlcyBgICtcbiAgICAgICAgYGhhdmUgYmVlbiBjb25zaWRlcmVkOiBbJHticmFuY2hlcy5tYXAoKGIpID0+IGIubmFtZSkuam9pbignLCAnKX1dYCxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHtyZWxlYXNlQ2FuZGlkYXRlLCBsYXRlc3QsIG5leHR9O1xufVxuXG4vKiogRmluZHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYnJhbmNoZXMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSxcbiAgbmV4dFZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gIGJyYW5jaGVzOiBWZXJzaW9uQnJhbmNoW10sXG4gIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIsXG4pOiBQcm9taXNlPHtcbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsO1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsO1xufT4ge1xuICAvLyBWZXJzaW9uIHJlcHJlc2VudGluZyB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIG5leHQgcGhhc2UuIE5vdGUgdGhhdCB3ZSBpZ25vcmVcbiAgLy8gcGF0Y2ggYW5kIHByZS1yZWxlYXNlIHNlZ21lbnRzIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gY29tcGFyZSB0aGUgbmV4dCByZWxlYXNlIHRyYWluIHRvXG4gIC8vIG90aGVyIHJlbGVhc2UgdHJhaW5zIGZyb20gdmVyc2lvbiBicmFuY2hlcyAod2hpY2ggZm9sbG93IHRoZSBgTi5OLnhgIHBhdHRlcm4pLlxuICBjb25zdCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHtuZXh0VmVyc2lvbi5tYWpvcn0uJHtuZXh0VmVyc2lvbi5taW5vcn0uMGApITtcblxuICBsZXQgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsID0gbnVsbDtcbiAgbGV0IHJlbGVhc2VDYW5kaWRhdGU6IFJlbGVhc2VUcmFpbiB8IG51bGwgPSBudWxsO1xuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2FwdHVyZWQgYnJhbmNoZXMgYW5kIGZpbmQgdGhlIGxhdGVzdCBub24tcHJlcmVsZWFzZSBicmFuY2ggYW5kIGFcbiAgLy8gcG90ZW50aWFsIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gRnJvbSB0aGUgY29sbGVjdGVkIGJyYW5jaGVzIHdlIGl0ZXJhdGUgZGVzY2VuZGluZ1xuICAvLyBvcmRlciAobW9zdCByZWNlbnQgc2VtYW50aWMgdmVyc2lvbi1icmFuY2ggZmlyc3QpLiBUaGUgZmlyc3QgYnJhbmNoIGlzIGVpdGhlciB0aGUgbGF0ZXN0XG4gIC8vIGFjdGl2ZSB2ZXJzaW9uIGJyYW5jaCAoaS5lLiBwYXRjaCkgb3IgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIEEgRkYvUkNcbiAgLy8gYnJhbmNoIGNhbm5vdCBiZSBvbGRlciB0aGFuIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLCBzbyB3ZSBzdG9wIGl0ZXJhdGluZyBvbmNlXG4gIC8vIHdlIGZvdW5kIHN1Y2ggYSBicmFuY2guIE90aGVyd2lzZSwgaWYgd2UgZm91bmQgYSBGRi9SQyBicmFuY2gsIHdlIGNvbnRpbnVlIGxvb2tpbmcgZm9yIHRoZVxuICAvLyBuZXh0IHZlcnNpb24tYnJhbmNoIGFzIHRoYXQgb25lIGlzIHN1cHBvc2VkIHRvIGJlIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLiBJZiBpdFxuICAvLyBpcyBub3QsIHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gZHVlIHRvIHR3byBGRi9SQyBicmFuY2hlcyBleGlzdGluZyBhdCB0aGUgc2FtZSB0aW1lLlxuICBmb3IgKGNvbnN0IHtuYW1lLCBwYXJzZWR9IG9mIGJyYW5jaGVzKSB7XG4gICAgLy8gSXQgY2FuIGhhcHBlbiB0aGF0IHZlcnNpb24gYnJhbmNoZXMgaGF2ZSBiZWVuIGFjY2lkZW50YWxseSBjcmVhdGVkIHdoaWNoIGFyZSBtb3JlIHJlY2VudFxuICAgIC8vIHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIG5leHQgYnJhbmNoIChpLmUuIGBtYXN0ZXJgKS4gV2UgY291bGQgaWdub3JlIHN1Y2ggYnJhbmNoZXNcbiAgICAvLyBzaWxlbnRseSwgYnV0IGl0IG1pZ2h0IGJlIHN5bXB0b21hdGljIGZvciBhbiBvdXRkYXRlZCB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgYnJhbmNoLCBvciBhblxuICAgIC8vIGFjY2lkZW50YWxseSBjcmVhdGVkIGJyYW5jaCBieSB0aGUgY2FyZXRha2VyLiBJbiBlaXRoZXIgd2F5IHdlIHdhbnQgdG8gcmFpc2UgYXdhcmVuZXNzLlxuICAgIGlmIChzZW12ZXIuZ3QocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBgICtcbiAgICAgICAgICBgbW9yZSByZWNlbnQgdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIGAgK1xuICAgICAgICAgIGBQbGVhc2UgZWl0aGVyIGRlbGV0ZSB0aGUgYnJhbmNoIGlmIGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgb3V0ZGF0ZWQgYCArXG4gICAgICAgICAgYHZlcnNpb24gaW4gdGhlIG5leHQgYnJhbmNoICgke25leHRCcmFuY2hOYW1lfSkuYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzZW12ZXIuZXEocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IG5ldyBSZWxlYXNlVHJhaW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3QgaXNQcmVyZWxlYXNlID0gdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnIHx8IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuXG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4uIEZvdW5kIHR3byBjb25zZWN1dGl2ZSBgICtcbiAgICAgICAgICAgIGBicmFuY2hlcyBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gRGlkIG5vdCBleHBlY3QgYm90aCBcIiR7bmFtZX1cIiBgICtcbiAgICAgICAgICAgIGBhbmQgXCIke3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZX1cIiB0byBiZSBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlLmAsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgb2xkIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gRXhwZWN0ZWQgbm8gYCArXG4gICAgICAgICAgICBgdmVyc2lvbi1icmFuY2ggaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgbW9kZSBmb3IgdiR7dmVyc2lvbi5tYWpvcn0uYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGUgPSByZWxlYXNlVHJhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhdGVzdCA9IHJlbGVhc2VUcmFpbjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZSwgbGF0ZXN0fTtcbn1cbiJdfQ==