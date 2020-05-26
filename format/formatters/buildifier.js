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
        define("@angular/dev-infra-private/format/formatters/buildifier", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Buildifier = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    /**
     * Formatter for running buildifier against bazel related files.
     */
    var Buildifier = /** @class */ (function (_super) {
        tslib_1.__extends(Buildifier, _super);
        function Buildifier() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = 'buildifier';
            _this.binaryFilePath = path_1.join(config_1.getRepoBaseDir(), 'node_modules/.bin/buildifier');
            _this.defaultFileMatcher = ['**/*.bzl', '**/BUILD.bazel', '**/WORKSPACE', '**/BUILD'];
            _this.actions = {
                check: {
                    commandFlags: BAZEL_WARNING_FLAG + " --lint=warn --mode=check --format=json",
                    callback: function (_, code, stdout) {
                        return code !== 0 || !JSON.parse(stdout)['success'];
                    },
                },
                format: {
                    commandFlags: BAZEL_WARNING_FLAG + " --lint=fix --mode=fix",
                    callback: function (file, code, _, stderr) {
                        if (code !== 0) {
                            console.error("Error running buildifier on: " + file);
                            console.error(stderr);
                            console.error();
                            return true;
                        }
                        return false;
                    }
                }
            };
            return _this;
        }
        return Buildifier;
    }(base_formatter_1.Formatter));
    exports.Buildifier = Buildifier;
    // The warning flag for buildifier copied from angular/angular's usage.
    var BAZEL_WARNING_FLAG = "--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default," +
        "attr-single-file,constant-glob,ctx-args,depset-iteration,depset-union,dict-concatenation," +
        "duplicated-name,filetype,git-repository,http-archive,integer-division,load,load-on-top," +
        "native-build,native-package,output-group,package-name,package-on-top,positional-args," +
        "redefined-variable,repository-name,same-origin-load,string-iteration,unused-variable";
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9mb3JtYXQvZm9ybWF0dGVycy9idWlsZGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0VBQWtEO0lBRWxELDhGQUEyQztJQUUzQzs7T0FFRztJQUNIO1FBQWdDLHNDQUFTO1FBQXpDO1lBQUEscUVBNkJDO1lBNUJDLFVBQUksR0FBRyxZQUFZLENBQUM7WUFFcEIsb0JBQWMsR0FBRyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFFeEUsd0JBQWtCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRWhGLGFBQU8sR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0wsWUFBWSxFQUFLLGtCQUFrQiw0Q0FBeUM7b0JBQzVFLFFBQVEsRUFDSixVQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsTUFBYzt3QkFDdEMsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDdEQsQ0FBQztpQkFDTjtnQkFDRCxNQUFNLEVBQUU7b0JBQ04sWUFBWSxFQUFLLGtCQUFrQiwyQkFBd0I7b0JBQzNELFFBQVEsRUFDSixVQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsQ0FBUyxFQUFFLE1BQWM7d0JBQ3BELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFnQyxJQUFNLENBQUMsQ0FBQzs0QkFDdEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDdEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUNoQixPQUFPLElBQUksQ0FBQzt5QkFDYjt3QkFDRCxPQUFPLEtBQUssQ0FBQztvQkFDZixDQUFDO2lCQUNOO2FBQ0YsQ0FBQzs7UUFDSixDQUFDO1FBQUQsaUJBQUM7SUFBRCxDQUFDLEFBN0JELENBQWdDLDBCQUFTLEdBNkJ4QztJQTdCWSxnQ0FBVTtJQStCdkIsdUVBQXVFO0lBQ3ZFLElBQU0sa0JBQWtCLEdBQUcsc0VBQXNFO1FBQzdGLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYsdUZBQXVGO1FBQ3ZGLHNGQUFzRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyfSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcblxuLyoqXG4gKiBGb3JtYXR0ZXIgZm9yIHJ1bm5pbmcgYnVpbGRpZmllciBhZ2FpbnN0IGJhemVsIHJlbGF0ZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGlmaWVyIGV4dGVuZHMgRm9ybWF0dGVyIHtcbiAgbmFtZSA9ICdidWlsZGlmaWVyJztcblxuICBiaW5hcnlGaWxlUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJ25vZGVfbW9kdWxlcy8uYmluL2J1aWxkaWZpZXInKTtcblxuICBkZWZhdWx0RmlsZU1hdGNoZXIgPSBbJyoqLyouYnpsJywgJyoqL0JVSUxELmJhemVsJywgJyoqL1dPUktTUEFDRScsICcqKi9CVUlMRCddO1xuXG4gIGFjdGlvbnMgPSB7XG4gICAgY2hlY2s6IHtcbiAgICAgIGNvbW1hbmRGbGFnczogYCR7QkFaRUxfV0FSTklOR19GTEFHfSAtLWxpbnQ9d2FybiAtLW1vZGU9Y2hlY2sgLS1mb3JtYXQ9anNvbmAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoXzogc3RyaW5nLCBjb2RlOiBudW1iZXIsIHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29kZSAhPT0gMCB8fCAhSlNPTi5wYXJzZShzdGRvdXQpWydzdWNjZXNzJ107XG4gICAgICAgICAgfSxcbiAgICB9LFxuICAgIGZvcm1hdDoge1xuICAgICAgY29tbWFuZEZsYWdzOiBgJHtCQVpFTF9XQVJOSU5HX0ZMQUd9IC0tbGludD1maXggLS1tb2RlPWZpeGAsXG4gICAgICBjYWxsYmFjazpcbiAgICAgICAgICAoZmlsZTogc3RyaW5nLCBjb2RlOiBudW1iZXIsIF86IHN0cmluZywgc3RkZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHJ1bm5pbmcgYnVpbGRpZmllciBvbjogJHtmaWxlfWApO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHN0ZGVycik7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLy8gVGhlIHdhcm5pbmcgZmxhZyBmb3IgYnVpbGRpZmllciBjb3BpZWQgZnJvbSBhbmd1bGFyL2FuZ3VsYXIncyB1c2FnZS5cbmNvbnN0IEJBWkVMX1dBUk5JTkdfRkxBRyA9IGAtLXdhcm5pbmdzPWF0dHItY2ZnLGF0dHItbGljZW5zZSxhdHRyLW5vbi1lbXB0eSxhdHRyLW91dHB1dC1kZWZhdWx0LGAgK1xuICAgIGBhdHRyLXNpbmdsZS1maWxlLGNvbnN0YW50LWdsb2IsY3R4LWFyZ3MsZGVwc2V0LWl0ZXJhdGlvbixkZXBzZXQtdW5pb24sZGljdC1jb25jYXRlbmF0aW9uLGAgK1xuICAgIGBkdXBsaWNhdGVkLW5hbWUsZmlsZXR5cGUsZ2l0LXJlcG9zaXRvcnksaHR0cC1hcmNoaXZlLGludGVnZXItZGl2aXNpb24sbG9hZCxsb2FkLW9uLXRvcCxgICtcbiAgICBgbmF0aXZlLWJ1aWxkLG5hdGl2ZS1wYWNrYWdlLG91dHB1dC1ncm91cCxwYWNrYWdlLW5hbWUscGFja2FnZS1vbi10b3AscG9zaXRpb25hbC1hcmdzLGAgK1xuICAgIGByZWRlZmluZWQtdmFyaWFibGUscmVwb3NpdG9yeS1uYW1lLHNhbWUtb3JpZ2luLWxvYWQsc3RyaW5nLWl0ZXJhdGlvbix1bnVzZWQtdmFyaWFibGVgO1xuIl19