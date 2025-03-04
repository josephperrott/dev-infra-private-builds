"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitMessageBuilder = void 0;
/**
 * Generate a commit message builder function, using the provided defaults.
 */
function commitMessageBuilder(defaults) {
    return (params = {}) => {
        const { prefix, type, npmScope, scope, summary, body, footer } = { ...defaults, ...params };
        const scopeSlug = npmScope ? `${npmScope}/${scope}` : scope;
        return `${prefix}${type}${scopeSlug ? '(' + scopeSlug + ')' : ''}: ${summary}\n\n${body}\n\n${footer}`;
    };
}
exports.commitMessageBuilder = commitMessageBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3Rlc3QtdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFhSDs7R0FFRztBQUNILFNBQWdCLG9CQUFvQixDQUFDLFFBQTRCO0lBQy9ELE9BQU8sQ0FBQyxTQUFzQyxFQUFFLEVBQUUsRUFBRTtRQUNsRCxNQUFNLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLFFBQVEsRUFBRSxHQUFHLE1BQU0sRUFBQyxDQUFDO1FBQ3hGLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RCxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksR0FDckIsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDdEMsS0FBSyxPQUFPLE9BQU8sSUFBSSxPQUFPLE1BQU0sRUFBRSxDQUFDO0lBQ3pDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFSRCxvREFRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogVGhlIHBhcnRzIHRoYXQgbWFrZSB1cCBhIGNvbW1pdCBtZXNzYWdlIGZvciBjcmVhdGluZyBhIGNvbW1pdCBtZXNzYWdlIHN0cmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0TWVzc2FnZVBhcnRzIHtcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcbiAgbnBtU2NvcGU6IHN0cmluZztcbiAgc2NvcGU6IHN0cmluZztcbiAgc3VtbWFyeTogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGZvb3Rlcjogc3RyaW5nO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgY29tbWl0IG1lc3NhZ2UgYnVpbGRlciBmdW5jdGlvbiwgdXNpbmcgdGhlIHByb3ZpZGVkIGRlZmF1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tbWl0TWVzc2FnZUJ1aWxkZXIoZGVmYXVsdHM6IENvbW1pdE1lc3NhZ2VQYXJ0cykge1xuICByZXR1cm4gKHBhcmFtczogUGFydGlhbDxDb21taXRNZXNzYWdlUGFydHM+ID0ge30pID0+IHtcbiAgICBjb25zdCB7cHJlZml4LCB0eXBlLCBucG1TY29wZSwgc2NvcGUsIHN1bW1hcnksIGJvZHksIGZvb3Rlcn0gPSB7Li4uZGVmYXVsdHMsIC4uLnBhcmFtc307XG4gICAgY29uc3Qgc2NvcGVTbHVnID0gbnBtU2NvcGUgPyBgJHtucG1TY29wZX0vJHtzY29wZX1gIDogc2NvcGU7XG4gICAgcmV0dXJuIGAke3ByZWZpeH0ke3R5cGV9JHtcbiAgICAgIHNjb3BlU2x1ZyA/ICcoJyArIHNjb3BlU2x1ZyArICcpJyA6ICcnXG4gICAgfTogJHtzdW1tYXJ5fVxcblxcbiR7Ym9keX1cXG5cXG4ke2Zvb3Rlcn1gO1xuICB9O1xufVxuIl19