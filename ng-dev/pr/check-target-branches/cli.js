"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckTargetBranchesModule = void 0;
const check_target_branches_1 = require("./check-target-branches");
/** Builds the command. */
function builder(yargs) {
    return yargs.positional('pr', {
        description: 'The pull request number',
        type: 'number',
        demandOption: true,
    });
}
/** Handles the command. */
async function handler({ pr }) {
    await check_target_branches_1.printTargetBranchesForPr(pr);
}
/** yargs command module describing the command.  */
exports.CheckTargetBranchesModule = {
    handler,
    builder,
    command: 'check-target-branches <pr>',
    describe: 'Check a PR to determine what branches it is currently targeting',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsbUVBQWlFO0FBTWpFLDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDNUIsV0FBVyxFQUFFLHlCQUF5QjtRQUN0QyxJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLEVBQUUsRUFBd0M7SUFDaEUsTUFBTSxnREFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsb0RBQW9EO0FBQ3ZDLFFBQUEseUJBQXlCLEdBQWtEO0lBQ3RGLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDRCQUE0QjtJQUNyQyxRQUFRLEVBQUUsaUVBQWlFO0NBQzVFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtwcmludFRhcmdldEJyYW5jaGVzRm9yUHJ9IGZyb20gJy4vY2hlY2stdGFyZ2V0LWJyYW5jaGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBDaGVja1RhcmdldEJyYW5jaGVzT3B0aW9ucyB7XG4gIHByOiBudW1iZXI7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5wb3NpdGlvbmFsKCdwcicsIHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBwdWxsIHJlcXVlc3QgbnVtYmVyJyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3ByfTogQXJndW1lbnRzPENoZWNrVGFyZ2V0QnJhbmNoZXNPcHRpb25zPikge1xuICBhd2FpdCBwcmludFRhcmdldEJyYW5jaGVzRm9yUHIocHIpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gICovXG5leHBvcnQgY29uc3QgQ2hlY2tUYXJnZXRCcmFuY2hlc01vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgQ2hlY2tUYXJnZXRCcmFuY2hlc09wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAnY2hlY2stdGFyZ2V0LWJyYW5jaGVzIDxwcj4nLFxuICBkZXNjcmliZTogJ0NoZWNrIGEgUFIgdG8gZGV0ZXJtaW5lIHdoYXQgYnJhbmNoZXMgaXQgaXMgY3VycmVudGx5IHRhcmdldGluZycsXG59O1xuIl19