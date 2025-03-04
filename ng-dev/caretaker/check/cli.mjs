"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckModule = void 0;
const github_yargs_1 = require("../../utils/git/github-yargs");
const check_1 = require("./check");
/** Builds the command. */
function builder(yargs) {
    return github_yargs_1.addGithubTokenOption(yargs);
}
/** Handles the command. */
async function handler() {
    await check_1.checkServiceStatuses();
}
/** yargs command module for checking status information for the repository  */
exports.CheckModule = {
    handler,
    builder,
    command: 'check',
    describe: 'Check the status of information the caretaker manages for the repository',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jaGVjay9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsK0RBQWtFO0FBRWxFLG1DQUE2QztBQU03QywwQkFBMEI7QUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztJQUMxQixPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU87SUFDcEIsTUFBTSw0QkFBb0IsRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRCwrRUFBK0U7QUFDbEUsUUFBQSxXQUFXLEdBQTZDO0lBQ25FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE9BQU87SUFDaEIsUUFBUSxFQUFFLDBFQUEwRTtDQUNyRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHtjaGVja1NlcnZpY2VTdGF0dXNlc30gZnJvbSAnLi9jaGVjayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FyZXRha2VyQ2hlY2tPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICBhd2FpdCBjaGVja1NlcnZpY2VTdGF0dXNlcygpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZm9yIGNoZWNraW5nIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgdGhlIHJlcG9zaXRvcnkgICovXG5leHBvcnQgY29uc3QgQ2hlY2tNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENhcmV0YWtlckNoZWNrT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdjaGVjaycsXG4gIGRlc2NyaWJlOiAnQ2hlY2sgdGhlIHN0YXR1cyBvZiBpbmZvcm1hdGlvbiB0aGUgY2FyZXRha2VyIG1hbmFnZXMgZm9yIHRoZSByZXBvc2l0b3J5Jyxcbn07XG4iXX0=