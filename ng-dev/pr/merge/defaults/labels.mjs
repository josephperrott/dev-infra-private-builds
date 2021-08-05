"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultTargetLabelConfiguration = void 0;
const versioning_1 = require("../../../release/versioning");
const target_label_1 = require("../target-label");
const lts_branch_1 = require("./lts-branch");
/**
 * Gets a label configuration for the merge tooling that reflects the default Angular
 * organization-wide labeling and branching semantics as outlined in the specification.
 *
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of an authenticated Github client.
 * @param githubConfig Configuration for the Github remote. Used as Git remote
 *   for the release train branches.
 * @param releaseConfig Configuration for the release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
async function getDefaultTargetLabelConfiguration(api, githubConfig, releaseConfig) {
    const repo = { owner: githubConfig.owner, name: githubConfig.name, api };
    const { latest, releaseCandidate, next } = await versioning_1.fetchActiveReleaseTrains(repo);
    return [
        {
            pattern: 'target: major',
            branches: () => {
                // If `next` is currently not designated to be a major version, we do not
                // allow merging of PRs with `target: major`.
                if (!next.isMajor) {
                    throw new target_label_1.InvalidTargetLabelError(`Unable to merge pull request. The "${versioning_1.nextBranchName}" branch will be released as ` +
                        'a minor version.');
                }
                return [versioning_1.nextBranchName];
            },
        },
        {
            pattern: 'target: minor',
            // Changes labeled with `target: minor` are merged most commonly into the next branch
            // (i.e. `master`). In rare cases of an exceptional minor version while being already
            // on a major release train, this would need to be overridden manually.
            // TODO: Consider handling this automatically by checking if the NPM version matches
            // the last-minor. If not, then an exceptional minor might be in progress. See:
            // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
            branches: [versioning_1.nextBranchName],
        },
        {
            pattern: 'target: patch',
            branches: (githubTargetBranch) => {
                // If a PR is targeting the latest active version-branch through the Github UI,
                // and is also labeled with `target: patch`, then we merge it directly into the
                // branch without doing any cherry-picking. This is useful if a PR could not be
                // applied cleanly, and a separate PR for the patch branch has been created.
                if (githubTargetBranch === latest.branchName) {
                    return [latest.branchName];
                }
                // Otherwise, patch changes are always merged into the next and patch branch.
                const branches = [versioning_1.nextBranchName, latest.branchName];
                // Additionally, if there is a release-candidate/feature-freeze release-train
                // currently active, also merge the PR into that version-branch.
                if (releaseCandidate !== null) {
                    branches.push(releaseCandidate.branchName);
                }
                return branches;
            },
        },
        {
            pattern: 'target: rc',
            branches: (githubTargetBranch) => {
                // The `target: rc` label cannot be applied if there is no active feature-freeze
                // or release-candidate release train.
                if (releaseCandidate === null) {
                    throw new target_label_1.InvalidTargetLabelError(`No active feature-freeze/release-candidate branch. ` +
                        `Unable to merge pull request using "target: rc" label.`);
                }
                // If the PR is targeting the active release-candidate/feature-freeze version branch
                // directly through the Github UI and has the `target: rc` label applied, merge it
                // only into the release candidate branch. This is useful if a PR did not apply cleanly
                // into the release-candidate/feature-freeze branch, and a separate PR has been created.
                if (githubTargetBranch === releaseCandidate.branchName) {
                    return [releaseCandidate.branchName];
                }
                // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
                return [versioning_1.nextBranchName, releaseCandidate.branchName];
            },
        },
        {
            // LTS changes are rare enough that we won't worry about cherry-picking changes into all
            // active LTS branches for PRs created against any other branch. Instead, PR authors need
            // to manually create separate PRs for desired LTS branches. Additionally, active LT branches
            // commonly diverge quickly. This makes cherry-picking not an option for LTS changes.
            pattern: 'target: lts',
            branches: async (githubTargetBranch) => {
                if (!versioning_1.isVersionBranch(githubTargetBranch)) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged as it does not target a long-term support ` +
                        `branch: "${githubTargetBranch}"`);
                }
                if (githubTargetBranch === latest.branchName) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged with "target: lts" into patch branch. ` +
                        `Consider changing the label to "target: patch" if this is intentional.`);
                }
                if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged with "target: lts" into feature-freeze/release-candidate ` +
                        `branch. Consider changing the label to "target: rc" if this is intentional.`);
                }
                // Assert that the selected branch is an active LTS branch.
                await lts_branch_1.assertActiveLtsBranch(repo, releaseConfig, githubTargetBranch);
                return [githubTargetBranch];
            },
        },
    ];
}
exports.getDefaultTargetLabelConfiguration = getDefaultTargetLabelConfiguration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFHSCw0REFJcUM7QUFJckMsa0RBQWtGO0FBRWxGLDZDQUFtRDtBQUVuRDs7Ozs7Ozs7Ozs7R0FXRztBQUNJLEtBQUssVUFBVSxrQ0FBa0MsQ0FDdEQsR0FBaUIsRUFDakIsWUFBMEIsRUFDMUIsYUFBNEI7SUFFNUIsTUFBTSxJQUFJLEdBQUcsRUFBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUMsQ0FBQztJQUN2RSxNQUFNLEVBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBQyxHQUFHLE1BQU0scUNBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUUsT0FBTztRQUNMO1lBQ0UsT0FBTyxFQUFFLGVBQWU7WUFDeEIsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDYix5RUFBeUU7Z0JBQ3pFLDZDQUE2QztnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDL0Isc0NBQXNDLDJCQUFjLCtCQUErQjt3QkFDakYsa0JBQWtCLENBQ3JCLENBQUM7aUJBQ0g7Z0JBQ0QsT0FBTyxDQUFDLDJCQUFjLENBQUMsQ0FBQztZQUMxQixDQUFDO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLHFGQUFxRjtZQUNyRixxRkFBcUY7WUFDckYsdUVBQXVFO1lBQ3ZFLG9GQUFvRjtZQUNwRiwrRUFBK0U7WUFDL0UsOEdBQThHO1lBQzlHLFFBQVEsRUFBRSxDQUFDLDJCQUFjLENBQUM7U0FDM0I7UUFDRDtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQy9CLCtFQUErRTtnQkFDL0UsK0VBQStFO2dCQUMvRSwrRUFBK0U7Z0JBQy9FLDRFQUE0RTtnQkFDNUUsSUFBSSxrQkFBa0IsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFO29CQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1QjtnQkFDRCw2RUFBNkU7Z0JBQzdFLE1BQU0sUUFBUSxHQUFHLENBQUMsMkJBQWMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3JELDZFQUE2RTtnQkFDN0UsZ0VBQWdFO2dCQUNoRSxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTtvQkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDNUM7Z0JBQ0QsT0FBTyxRQUFRLENBQUM7WUFDbEIsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsWUFBWTtZQUNyQixRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUMvQixnRkFBZ0Y7Z0JBQ2hGLHNDQUFzQztnQkFDdEMsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDL0IscURBQXFEO3dCQUNuRCx3REFBd0QsQ0FDM0QsQ0FBQztpQkFDSDtnQkFDRCxvRkFBb0Y7Z0JBQ3BGLGtGQUFrRjtnQkFDbEYsdUZBQXVGO2dCQUN2Rix3RkFBd0Y7Z0JBQ3hGLElBQUksa0JBQWtCLEtBQUssZ0JBQWdCLENBQUMsVUFBVSxFQUFFO29CQUN0RCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3RDO2dCQUNELHFGQUFxRjtnQkFDckYsT0FBTyxDQUFDLDJCQUFjLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkQsQ0FBQztTQUNGO1FBQ0Q7WUFDRSx3RkFBd0Y7WUFDeEYseUZBQXlGO1lBQ3pGLDZGQUE2RjtZQUM3RixxRkFBcUY7WUFDckYsT0FBTyxFQUFFLGFBQWE7WUFDdEIsUUFBUSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsNEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLElBQUksdUNBQXdCLENBQ2hDLGdFQUFnRTt3QkFDOUQsWUFBWSxrQkFBa0IsR0FBRyxDQUNwQyxDQUFDO2lCQUNIO2dCQUNELElBQUksa0JBQWtCLEtBQUssTUFBTSxDQUFDLFVBQVUsRUFBRTtvQkFDNUMsTUFBTSxJQUFJLHVDQUF3QixDQUNoQyw0REFBNEQ7d0JBQzFELHdFQUF3RSxDQUMzRSxDQUFDO2lCQUNIO2dCQUNELElBQUksZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGtCQUFrQixLQUFLLGdCQUFnQixDQUFDLFVBQVUsRUFBRTtvQkFDbkYsTUFBTSxJQUFJLHVDQUF3QixDQUNoQywrRUFBK0U7d0JBQzdFLDZFQUE2RSxDQUNoRixDQUFDO2lCQUNIO2dCQUNELDJEQUEyRDtnQkFDM0QsTUFBTSxrQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3JFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlCLENBQUM7U0FDRjtLQUNGLENBQUM7QUFDSixDQUFDO0FBMUdELGdGQTBHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvY29uZmlnL2luZGV4JztcbmltcG9ydCB7XG4gIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgaXNWZXJzaW9uQnJhbmNoLFxuICBuZXh0QnJhbmNoTmFtZSxcbn0gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtUYXJnZXRMYWJlbH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7SW52YWxpZFRhcmdldEJyYW5jaEVycm9yLCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuaW1wb3J0IHthc3NlcnRBY3RpdmVMdHNCcmFuY2h9IGZyb20gJy4vbHRzLWJyYW5jaCc7XG5cbi8qKlxuICogR2V0cyBhIGxhYmVsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBtZXJnZSB0b29saW5nIHRoYXQgcmVmbGVjdHMgdGhlIGRlZmF1bHQgQW5ndWxhclxuICogb3JnYW5pemF0aW9uLXdpZGUgbGFiZWxpbmcgYW5kIGJyYW5jaGluZyBzZW1hbnRpY3MgYXMgb3V0bGluZWQgaW4gdGhlIHNwZWNpZmljYXRpb24uXG4gKlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVVxuICpcbiAqIEBwYXJhbSBhcGkgSW5zdGFuY2Ugb2YgYW4gYXV0aGVudGljYXRlZCBHaXRodWIgY2xpZW50LlxuICogQHBhcmFtIGdpdGh1YkNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIHJlbW90ZS4gVXNlZCBhcyBHaXQgcmVtb3RlXG4gKiAgIGZvciB0aGUgcmVsZWFzZSB0cmFpbiBicmFuY2hlcy5cbiAqIEBwYXJhbSByZWxlYXNlQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSByZWxlYXNlIHBhY2thZ2VzLiBVc2VkIHRvIGZldGNoXG4gKiAgIE5QTSB2ZXJzaW9uIGRhdGEgd2hlbiBMVFMgdmVyc2lvbiBicmFuY2hlcyBhcmUgdmFsaWRhdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVmYXVsdFRhcmdldExhYmVsQ29uZmlndXJhdGlvbihcbiAgYXBpOiBHaXRodWJDbGllbnQsXG4gIGdpdGh1YkNvbmZpZzogR2l0aHViQ29uZmlnLFxuICByZWxlYXNlQ29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuKTogUHJvbWlzZTxUYXJnZXRMYWJlbFtdPiB7XG4gIGNvbnN0IHJlcG8gPSB7b3duZXI6IGdpdGh1YkNvbmZpZy5vd25lciwgbmFtZTogZ2l0aHViQ29uZmlnLm5hbWUsIGFwaX07XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGUsIG5leHR9ID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogbWFqb3InLFxuICAgICAgYnJhbmNoZXM6ICgpID0+IHtcbiAgICAgICAgLy8gSWYgYG5leHRgIGlzIGN1cnJlbnRseSBub3QgZGVzaWduYXRlZCB0byBiZSBhIG1ham9yIHZlcnNpb24sIHdlIGRvIG5vdFxuICAgICAgICAvLyBhbGxvdyBtZXJnaW5nIG9mIFBScyB3aXRoIGB0YXJnZXQ6IG1ham9yYC5cbiAgICAgICAgaWYgKCFuZXh0LmlzTWFqb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gVGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2ggd2lsbCBiZSByZWxlYXNlZCBhcyBgICtcbiAgICAgICAgICAgICAgJ2EgbWlub3IgdmVyc2lvbi4nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogbWlub3InLFxuICAgICAgLy8gQ2hhbmdlcyBsYWJlbGVkIHdpdGggYHRhcmdldDogbWlub3JgIGFyZSBtZXJnZWQgbW9zdCBjb21tb25seSBpbnRvIHRoZSBuZXh0IGJyYW5jaFxuICAgICAgLy8gKGkuZS4gYG1hc3RlcmApLiBJbiByYXJlIGNhc2VzIG9mIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIHZlcnNpb24gd2hpbGUgYmVpbmcgYWxyZWFkeVxuICAgICAgLy8gb24gYSBtYWpvciByZWxlYXNlIHRyYWluLCB0aGlzIHdvdWxkIG5lZWQgdG8gYmUgb3ZlcnJpZGRlbiBtYW51YWxseS5cbiAgICAgIC8vIFRPRE86IENvbnNpZGVyIGhhbmRsaW5nIHRoaXMgYXV0b21hdGljYWxseSBieSBjaGVja2luZyBpZiB0aGUgTlBNIHZlcnNpb24gbWF0Y2hlc1xuICAgICAgLy8gdGhlIGxhc3QtbWlub3IuIElmIG5vdCwgdGhlbiBhbiBleGNlcHRpb25hbCBtaW5vciBtaWdodCBiZSBpbiBwcm9ncmVzcy4gU2VlOlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVS9lZGl0I2hlYWRpbmc9aC5oN281cGpxNnlxZDBcbiAgICAgIGJyYW5jaGVzOiBbbmV4dEJyYW5jaE5hbWVdLFxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogcGF0Y2gnLFxuICAgICAgYnJhbmNoZXM6IChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgLy8gSWYgYSBQUiBpcyB0YXJnZXRpbmcgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2ggdGhyb3VnaCB0aGUgR2l0aHViIFVJLFxuICAgICAgICAvLyBhbmQgaXMgYWxzbyBsYWJlbGVkIHdpdGggYHRhcmdldDogcGF0Y2hgLCB0aGVuIHdlIG1lcmdlIGl0IGRpcmVjdGx5IGludG8gdGhlXG4gICAgICAgIC8vIGJyYW5jaCB3aXRob3V0IGRvaW5nIGFueSBjaGVycnktcGlja2luZy4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBjb3VsZCBub3QgYmVcbiAgICAgICAgLy8gYXBwbGllZCBjbGVhbmx5LCBhbmQgYSBzZXBhcmF0ZSBQUiBmb3IgdGhlIHBhdGNoIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgcGF0Y2ggY2hhbmdlcyBhcmUgYWx3YXlzIG1lcmdlZCBpbnRvIHRoZSBuZXh0IGFuZCBwYXRjaCBicmFuY2guXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gW25leHRCcmFuY2hOYW1lLCBsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIC8vIEFkZGl0aW9uYWxseSwgaWYgdGhlcmUgaXMgYSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSByZWxlYXNlLXRyYWluXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUsIGFsc28gbWVyZ2UgdGhlIFBSIGludG8gdGhhdCB2ZXJzaW9uLWJyYW5jaC5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBicmFuY2hlcy5wdXNoKHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJyYW5jaGVzO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IHJjJyxcbiAgICAgIGJyYW5jaGVzOiAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgY2Fubm90IGJlIGFwcGxpZWQgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplXG4gICAgICAgIC8vIG9yIHJlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UgdHJhaW4uXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgYE5vIGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdCB1c2luZyBcInRhcmdldDogcmNcIiBsYWJlbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIFBSIGlzIHRhcmdldGluZyB0aGUgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHZlcnNpb24gYnJhbmNoXG4gICAgICAgIC8vIGRpcmVjdGx5IHRocm91Z2ggdGhlIEdpdGh1YiBVSSBhbmQgaGFzIHRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgYXBwbGllZCwgbWVyZ2UgaXRcbiAgICAgICAgLy8gb25seSBpbnRvIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSBicmFuY2guIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgZGlkIG5vdCBhcHBseSBjbGVhbmx5XG4gICAgICAgIC8vIGludG8gdGhlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaCwgYW5kIGEgc2VwYXJhdGUgUFIgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbWVyZ2UgaW50byB0aGUgbmV4dCBhbmQgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZSwgcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBMVFMgY2hhbmdlcyBhcmUgcmFyZSBlbm91Z2ggdGhhdCB3ZSB3b24ndCB3b3JyeSBhYm91dCBjaGVycnktcGlja2luZyBjaGFuZ2VzIGludG8gYWxsXG4gICAgICAvLyBhY3RpdmUgTFRTIGJyYW5jaGVzIGZvciBQUnMgY3JlYXRlZCBhZ2FpbnN0IGFueSBvdGhlciBicmFuY2guIEluc3RlYWQsIFBSIGF1dGhvcnMgbmVlZFxuICAgICAgLy8gdG8gbWFudWFsbHkgY3JlYXRlIHNlcGFyYXRlIFBScyBmb3IgZGVzaXJlZCBMVFMgYnJhbmNoZXMuIEFkZGl0aW9uYWxseSwgYWN0aXZlIExUIGJyYW5jaGVzXG4gICAgICAvLyBjb21tb25seSBkaXZlcmdlIHF1aWNrbHkuIFRoaXMgbWFrZXMgY2hlcnJ5LXBpY2tpbmcgbm90IGFuIG9wdGlvbiBmb3IgTFRTIGNoYW5nZXMuXG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBsdHMnLFxuICAgICAgYnJhbmNoZXM6IGFzeW5jIChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZlcnNpb25CcmFuY2goZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIHBhdGNoIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHBhdGNoXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaC4gQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiByY1wiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc2VydCB0aGF0IHRoZSBzZWxlY3RlZCBicmFuY2ggaXMgYW4gYWN0aXZlIExUUyBicmFuY2guXG4gICAgICAgIGF3YWl0IGFzc2VydEFjdGl2ZUx0c0JyYW5jaChyZXBvLCByZWxlYXNlQ29uZmlnLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgICByZXR1cm4gW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gICAgICB9LFxuICAgIH0sXG4gIF07XG59XG4iXX0=