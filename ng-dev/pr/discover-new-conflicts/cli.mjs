"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDiscoverNewConflictsCommand = exports.buildDiscoverNewConflictsCommand = void 0;
const console_1 = require("../../utils/console");
const github_yargs_1 = require("../../utils/git/github-yargs");
const index_1 = require("./index");
/** Builds the discover-new-conflicts pull request command. */
function buildDiscoverNewConflictsCommand(yargs) {
    return github_yargs_1.addGithubTokenOption(yargs)
        .option('date', {
        description: 'Only consider PRs updated since provided date',
        defaultDescription: '30 days ago',
        coerce: (date) => (typeof date === 'number' ? date : Date.parse(date)),
        default: getThirtyDaysAgoDate(),
    })
        .positional('pr-number', { demandOption: true, type: 'number' });
}
exports.buildDiscoverNewConflictsCommand = buildDiscoverNewConflictsCommand;
/** Handles the discover-new-conflicts pull request command. */
async function handleDiscoverNewConflictsCommand({ 'pr-number': prNumber, date, }) {
    // If a provided date is not able to be parsed, yargs provides it as NaN.
    if (isNaN(date)) {
        console_1.error('Unable to parse the value provided via --date flag');
        process.exit(1);
    }
    await index_1.discoverNewConflictsForPr(prNumber, date);
}
exports.handleDiscoverNewConflictsCommand = handleDiscoverNewConflictsCommand;
/** Gets a date object 30 days ago from today. */
function getThirtyDaysAgoDate() {
    const date = new Date();
    // Set the hours, minutes and seconds to 0 to only consider date.
    date.setHours(0, 0, 0, 0);
    // Set the date to 30 days in the past.
    date.setDate(date.getDate() - 30);
    return date.getTime();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILGlEQUEwQztBQUMxQywrREFBa0U7QUFFbEUsbUNBQWtEO0FBUWxELDhEQUE4RDtBQUM5RCxTQUFnQixnQ0FBZ0MsQ0FDOUMsS0FBVztJQUVYLE9BQU8sbUNBQW9CLENBQUMsS0FBSyxDQUFDO1NBQy9CLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZCxXQUFXLEVBQUUsK0NBQStDO1FBQzVELGtCQUFrQixFQUFFLGFBQWE7UUFDakMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTtLQUNoQyxDQUFDO1NBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQVhELDRFQVdDO0FBRUQsK0RBQStEO0FBQ3hELEtBQUssVUFBVSxpQ0FBaUMsQ0FBQyxFQUN0RCxXQUFXLEVBQUUsUUFBUSxFQUNyQixJQUFJLEdBQzBDO0lBQzlDLHlFQUF5RTtJQUN6RSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNmLGVBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFDRCxNQUFNLGlDQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBVkQsOEVBVUM7QUFFRCxpREFBaUQ7QUFDakQsU0FBUyxvQkFBb0I7SUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4QixpRUFBaUU7SUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQix1Q0FBdUM7SUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuXG5pbXBvcnQge2Rpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHJ9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kT3B0aW9ucyB7XG4gIGRhdGU6IG51bWJlcjtcbiAgJ3ByLW51bWJlcic6IG51bWJlcjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZChcbiAgeWFyZ3M6IEFyZ3YsXG4pOiBBcmd2PERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKVxuICAgIC5vcHRpb24oJ2RhdGUnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ09ubHkgY29uc2lkZXIgUFJzIHVwZGF0ZWQgc2luY2UgcHJvdmlkZWQgZGF0ZScsXG4gICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICczMCBkYXlzIGFnbycsXG4gICAgICBjb2VyY2U6IChkYXRlKSA9PiAodHlwZW9mIGRhdGUgPT09ICdudW1iZXInID8gZGF0ZSA6IERhdGUucGFyc2UoZGF0ZSkpLFxuICAgICAgZGVmYXVsdDogZ2V0VGhpcnR5RGF5c0Fnb0RhdGUoKSxcbiAgICB9KVxuICAgIC5wb3NpdGlvbmFsKCdwci1udW1iZXInLCB7ZGVtYW5kT3B0aW9uOiB0cnVlLCB0eXBlOiAnbnVtYmVyJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQoe1xuICAncHItbnVtYmVyJzogcHJOdW1iZXIsXG4gIGRhdGUsXG59OiBBcmd1bWVudHM8RGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kT3B0aW9ucz4pIHtcbiAgLy8gSWYgYSBwcm92aWRlZCBkYXRlIGlzIG5vdCBhYmxlIHRvIGJlIHBhcnNlZCwgeWFyZ3MgcHJvdmlkZXMgaXQgYXMgTmFOLlxuICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICBlcnJvcignVW5hYmxlIHRvIHBhcnNlIHRoZSB2YWx1ZSBwcm92aWRlZCB2aWEgLS1kYXRlIGZsYWcnKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgYXdhaXQgZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihwck51bWJlciwgZGF0ZSk7XG59XG5cbi8qKiBHZXRzIGEgZGF0ZSBvYmplY3QgMzAgZGF5cyBhZ28gZnJvbSB0b2RheS4gKi9cbmZ1bmN0aW9uIGdldFRoaXJ0eURheXNBZ29EYXRlKCkge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgLy8gU2V0IHRoZSBob3VycywgbWludXRlcyBhbmQgc2Vjb25kcyB0byAwIHRvIG9ubHkgY29uc2lkZXIgZGF0ZS5cbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgLy8gU2V0IHRoZSBkYXRlIHRvIDMwIGRheXMgaW4gdGhlIHBhc3QuXG4gIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIDMwKTtcbiAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xufVxuIl19