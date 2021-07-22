/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/semver", ["require", "exports", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createExperimentalSemver = exports.semverInc = void 0;
    var semver = require("semver");
    /**
     * Increments a specified SemVer version. Compared to the original increment in SemVer,
     * the version is cloned to not modify the original version instance.
     */
    function semverInc(version, release, identifier) {
        var clone = new semver.SemVer(version.version);
        return clone.inc(release, identifier);
    }
    exports.semverInc = semverInc;
    /** Creates the equivalent experimental version for a provided SemVer. */
    function createExperimentalSemver(version) {
        var experimentalVersion = new semver.SemVer(version.format());
        experimentalVersion.major = 0;
        experimentalVersion.minor = version.major * 100 + version.minor;
        return new semver.SemVer(experimentalVersion.format());
    }
    exports.createExperimentalSemver = createExperimentalSemver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL3NlbXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakM7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUyxDQUNyQixPQUFzQixFQUFFLE9BQTJCLEVBQUUsVUFBbUI7UUFDMUUsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFKRCw4QkFJQztJQUVELHlFQUF5RTtJQUN6RSxTQUFnQix3QkFBd0IsQ0FBQyxPQUFzQjtRQUM3RCxJQUFNLG1CQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNoRSxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLG1CQUFtQixDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUxELDREQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG4vKipcbiAqIEluY3JlbWVudHMgYSBzcGVjaWZpZWQgU2VtVmVyIHZlcnNpb24uIENvbXBhcmVkIHRvIHRoZSBvcmlnaW5hbCBpbmNyZW1lbnQgaW4gU2VtVmVyLFxuICogdGhlIHZlcnNpb24gaXMgY2xvbmVkIHRvIG5vdCBtb2RpZnkgdGhlIG9yaWdpbmFsIHZlcnNpb24gaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZW12ZXJJbmMoXG4gICAgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcmVsZWFzZTogc2VtdmVyLlJlbGVhc2VUeXBlLCBpZGVudGlmaWVyPzogc3RyaW5nKSB7XG4gIGNvbnN0IGNsb25lID0gbmV3IHNlbXZlci5TZW1WZXIodmVyc2lvbi52ZXJzaW9uKTtcbiAgcmV0dXJuIGNsb25lLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKTtcbn1cblxuLyoqIENyZWF0ZXMgdGhlIGVxdWl2YWxlbnQgZXhwZXJpbWVudGFsIHZlcnNpb24gZm9yIGEgcHJvdmlkZWQgU2VtVmVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcih2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKTogc2VtdmVyLlNlbVZlciB7XG4gIGNvbnN0IGV4cGVyaW1lbnRhbFZlcnNpb24gPSBuZXcgc2VtdmVyLlNlbVZlcih2ZXJzaW9uLmZvcm1hdCgpKTtcbiAgZXhwZXJpbWVudGFsVmVyc2lvbi5tYWpvciA9IDA7XG4gIGV4cGVyaW1lbnRhbFZlcnNpb24ubWlub3IgPSB2ZXJzaW9uLm1ham9yICogMTAwICsgdmVyc2lvbi5taW5vcjtcbiAgcmV0dXJuIG5ldyBzZW12ZXIuU2VtVmVyKGV4cGVyaW1lbnRhbFZlcnNpb24uZm9ybWF0KCkpO1xufVxuIl19