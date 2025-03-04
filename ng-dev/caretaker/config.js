"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaretakerConfig = void 0;
const config_1 = require("../utils/config");
/** Retrieve and validate the config as `CaretakerConfig`. */
function getCaretakerConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The non-validated config object.
    const config = config_1.getConfig();
    config_1.assertNoErrors(errors);
    return config;
}
exports.getCaretakerConfig = getCaretakerConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQXVFO0FBWXZFLDZEQUE2RDtBQUM3RCxTQUFnQixrQkFBa0I7SUFDaEMsb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixtQ0FBbUM7SUFDbkMsTUFBTSxNQUFNLEdBQXVELGtCQUFTLEVBQUUsQ0FBQztJQUUvRSx1QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sTUFBaUMsQ0FBQztBQUMzQyxDQUFDO0FBUkQsZ0RBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGludGVyZmFjZSBDYXJldGFrZXJDb25maWcge1xuICAvKiogR2l0aHViIHF1ZXJpZXMgc2hvd2luZyBhIHNuYXBzaG90IG9mIHB1bGxzL2lzc3VlcyBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbiAgZ2l0aHViUXVlcmllcz86IHtuYW1lOiBzdHJpbmc7IHF1ZXJ5OiBzdHJpbmd9W107XG4gIC8qKlxuICAgKiBUaGUgR2l0aHViIGdyb3VwIHVzZWQgdG8gdHJhY2sgY3VycmVudCBjYXJldGFrZXJzLiBBIHNlY29uZCBncm91cCBpcyBhc3N1bWVkIHRvIGV4aXN0IHdpdGggdGhlXG4gICAqIG5hbWUgXCI8Z3JvdXAtbmFtZT4tcm9zdGVyXCIgY29udGFpbmluZyBhIGxpc3Qgb2YgYWxsIHVzZXJzIGVsaWdpYmxlIGZvciB0aGUgY2FyZXRha2VyIGdyb3VwLlxuICAgKiAqL1xuICBjYXJldGFrZXJHcm91cD86IHN0cmluZztcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDYXJldGFrZXJDb25maWdgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhcmV0YWtlckNvbmZpZygpIHtcbiAgLy8gTGlzdCBvZiBlcnJvcnMgZW5jb3VudGVyZWQgdmFsaWRhdGluZyB0aGUgY29uZmlnLlxuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRoZSBub24tdmFsaWRhdGVkIGNvbmZpZyBvYmplY3QuXG4gIGNvbnN0IGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZzx7Y2FyZXRha2VyOiBDYXJldGFrZXJDb25maWd9Pj4gPSBnZXRDb25maWcoKTtcblxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnIGFzIFJlcXVpcmVkPHR5cGVvZiBjb25maWc+O1xufVxuIl19