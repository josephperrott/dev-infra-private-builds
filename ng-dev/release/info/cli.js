"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseInfoCommandModule = void 0;
const git_client_1 = require("../../utils/git/git-client");
const index_1 = require("../config/index");
const active_release_trains_1 = require("../versioning/active-release-trains");
const print_active_trains_1 = require("../versioning/print-active-trains");
const versioning_1 = require("../versioning");
/** Yargs command handler for printing release information. */
async function handler() {
    const git = git_client_1.GitClient.get();
    const nextBranchName = versioning_1.getNextBranchName(git.config.github);
    const repo = { api: git.github, ...git.remoteConfig, nextBranchName };
    const releaseTrains = await active_release_trains_1.fetchActiveReleaseTrains(repo);
    // Print the active release trains.
    await print_active_trains_1.printActiveReleaseTrains(releaseTrains, index_1.getReleaseConfig());
}
/** CLI command module for retrieving release information. */
exports.ReleaseInfoCommandModule = {
    handler,
    command: 'info',
    describe: 'Prints active release trains to the console.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvaW5mby9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBS0gsMkRBQXFEO0FBQ3JELDJDQUFpRDtBQUNqRCwrRUFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLDhDQUFvRTtBQUVwRSw4REFBOEQ7QUFDOUQsS0FBSyxVQUFVLE9BQU87SUFDcEIsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixNQUFNLGNBQWMsR0FBRyw4QkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVELE1BQU0sSUFBSSxHQUF1QixFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUMsQ0FBQztJQUN4RixNQUFNLGFBQWEsR0FBRyxNQUFNLGdEQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNELG1DQUFtQztJQUNuQyxNQUFNLDhDQUF3QixDQUFDLGFBQWEsRUFBRSx3QkFBZ0IsRUFBRSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELDZEQUE2RDtBQUNoRCxRQUFBLHdCQUF3QixHQUFrQjtJQUNyRCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE1BQU07SUFDZixRQUFRLEVBQUUsOENBQThDO0NBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuaW1wb3J0IHtnZXROZXh0QnJhbmNoTmFtZSwgUmVsZWFzZVJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgcHJpbnRpbmcgcmVsZWFzZSBpbmZvcm1hdGlvbi4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZShnaXQuY29uZmlnLmdpdGh1Yik7XG4gIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHthcGk6IGdpdC5naXRodWIsIC4uLmdpdC5yZW1vdGVDb25maWcsIG5leHRCcmFuY2hOYW1lfTtcbiAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zLlxuICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgZ2V0UmVsZWFzZUNvbmZpZygpKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgcmV0cmlldmluZyByZWxlYXNlIGluZm9ybWF0aW9uLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VJbmZvQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZSA9IHtcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2luZm8nLFxuICBkZXNjcmliZTogJ1ByaW50cyBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgdG8gdGhlIGNvbnNvbGUuJyxcbn07XG4iXX0=