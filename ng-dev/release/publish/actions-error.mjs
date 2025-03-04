"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FatalReleaseActionError = exports.UserAbortedReleaseActionError = void 0;
/** Error that will be thrown if the user manually aborted a release action. */
class UserAbortedReleaseActionError extends Error {
    constructor() {
        super();
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, UserAbortedReleaseActionError.prototype);
    }
}
exports.UserAbortedReleaseActionError = UserAbortedReleaseActionError;
/** Error that will be thrown if the action has been aborted due to a fatal error. */
class FatalReleaseActionError extends Error {
    constructor() {
        super();
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, FatalReleaseActionError.prototype);
    }
}
exports.FatalReleaseActionError = FatalReleaseActionError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy1lcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy1lcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrRUFBK0U7QUFDL0UsTUFBYSw2QkFBOEIsU0FBUSxLQUFLO0lBQ3REO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFDUix5RkFBeUY7UUFDekYsaUNBQWlDO1FBQ2pDLGlIQUFpSDtRQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RSxDQUFDO0NBQ0Y7QUFSRCxzRUFRQztBQUVELHFGQUFxRjtBQUNyRixNQUFhLHVCQUF3QixTQUFRLEtBQUs7SUFDaEQ7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQUNSLHlGQUF5RjtRQUN6RixpQ0FBaUM7UUFDakMsaUhBQWlIO1FBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDRjtBQVJELDBEQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBFcnJvciB0aGF0IHdpbGwgYmUgdGhyb3duIGlmIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgYSByZWxlYXNlIGFjdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseSBsb3N0IGR1ZSB0b1xuICAgIC8vIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIEVycm9yIHRoYXQgd2lsbCBiZSB0aHJvd24gaWYgdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLiAqL1xuZXhwb3J0IGNsYXNzIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5IGxvc3QgZHVlIHRvXG4gICAgLy8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuIl19