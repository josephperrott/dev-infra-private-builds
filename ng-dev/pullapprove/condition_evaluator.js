"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertConditionToFunction = void 0;
const pullapprove_arrays_1 = require("./pullapprove_arrays");
const utils_1 = require("./utils");
/**
 * Context that is provided to conditions. Conditions can use various helpers
 * that PullApprove provides. We try to mock them here. Consult the official
 * docs for more details: https://docs.pullapprove.com/config/conditions.
 */
const conditionContext = {
    'len': (value) => value.length,
    'contains_any_globs': (files, patterns) => {
        // Note: Do not always create globs for the same pattern again. This method
        // could be called for each source file. Creating glob's is expensive.
        return files.some((f) => patterns.some((pattern) => utils_1.getOrCreateGlob(pattern).match(f)));
    },
};
/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
function convertConditionToFunction(expr) {
    // Creates a dynamic function with the specified expression.
    // The first parameter will be `files` as that corresponds to the supported `files` variable that
    // can be accessed in PullApprove condition expressions. The second parameter is the list of
    // PullApproveGroups that are accessible in the condition expressions. The followed parameters
    // correspond to other context variables provided by PullApprove for conditions.
    const evaluateFn = new Function('files', 'groups', ...Object.keys(conditionContext), `
    return (${transformExpressionToJs(expr)});
  `);
    // Create a function that calls the dynamically constructed function which mimics
    // the condition expression that is usually evaluated with Python in PullApprove.
    return (files, groups) => {
        const result = evaluateFn(new pullapprove_arrays_1.PullApproveStringArray(...files), new pullapprove_arrays_1.PullApproveGroupArray(...groups), ...Object.values(conditionContext));
        // If an array is returned, we consider the condition as active if the array is not
        // empty. This matches PullApprove's condition evaluation that is based on Python.
        if (Array.isArray(result)) {
            return result.length !== 0;
        }
        return !!result;
    };
}
exports.convertConditionToFunction = convertConditionToFunction;
/**
 * Transforms a condition expression from PullApprove that is based on python
 * so that it can be run inside JavaScript. Current transformations:
 *   1. `not <..>` -> `!<..>`
 */
function transformExpressionToJs(expression) {
    return expression.replace(/not\s+/g, '!');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILDZEQUFtRjtBQUNuRixtQ0FBd0M7QUFFeEM7Ozs7R0FJRztBQUNILE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsS0FBSyxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTTtJQUNyQyxvQkFBb0IsRUFBRSxDQUFDLEtBQTZCLEVBQUUsUUFBa0IsRUFBRSxFQUFFO1FBQzFFLDJFQUEyRTtRQUMzRSxzRUFBc0U7UUFDdEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyx1QkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNGLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFnQiwwQkFBMEIsQ0FDeEMsSUFBWTtJQUVaLDREQUE0RDtJQUM1RCxpR0FBaUc7SUFDakcsNEZBQTRGO0lBQzVGLDhGQUE4RjtJQUM5RixnRkFBZ0Y7SUFDaEYsTUFBTSxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQzdCLE9BQU8sRUFDUCxRQUFRLEVBQ1IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQ2hDO2NBQ1UsdUJBQXVCLENBQUMsSUFBSSxDQUFDO0dBQ3hDLENBQ0EsQ0FBQztJQUVGLGlGQUFpRjtJQUNqRixpRkFBaUY7SUFDakYsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN2QixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQ3ZCLElBQUksMkNBQXNCLENBQUMsR0FBRyxLQUFLLENBQUMsRUFDcEMsSUFBSSwwQ0FBcUIsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUNwQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FDbkMsQ0FBQztRQUNGLG1GQUFtRjtRQUNuRixrRkFBa0Y7UUFDbEYsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7U0FDNUI7UUFDRCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhDRCxnRUFnQ0M7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxVQUFrQjtJQUNqRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cEFycmF5LCBQdWxsQXBwcm92ZVN0cmluZ0FycmF5fSBmcm9tICcuL3B1bGxhcHByb3ZlX2FycmF5cyc7XG5pbXBvcnQge2dldE9yQ3JlYXRlR2xvYn0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQ29udGV4dCB0aGF0IGlzIHByb3ZpZGVkIHRvIGNvbmRpdGlvbnMuIENvbmRpdGlvbnMgY2FuIHVzZSB2YXJpb3VzIGhlbHBlcnNcbiAqIHRoYXQgUHVsbEFwcHJvdmUgcHJvdmlkZXMuIFdlIHRyeSB0byBtb2NrIHRoZW0gaGVyZS4gQ29uc3VsdCB0aGUgb2ZmaWNpYWxcbiAqIGRvY3MgZm9yIG1vcmUgZGV0YWlsczogaHR0cHM6Ly9kb2NzLnB1bGxhcHByb3ZlLmNvbS9jb25maWcvY29uZGl0aW9ucy5cbiAqL1xuY29uc3QgY29uZGl0aW9uQ29udGV4dCA9IHtcbiAgJ2xlbic6ICh2YWx1ZTogYW55W10pID0+IHZhbHVlLmxlbmd0aCxcbiAgJ2NvbnRhaW5zX2FueV9nbG9icyc6IChmaWxlczogUHVsbEFwcHJvdmVTdHJpbmdBcnJheSwgcGF0dGVybnM6IHN0cmluZ1tdKSA9PiB7XG4gICAgLy8gTm90ZTogRG8gbm90IGFsd2F5cyBjcmVhdGUgZ2xvYnMgZm9yIHRoZSBzYW1lIHBhdHRlcm4gYWdhaW4uIFRoaXMgbWV0aG9kXG4gICAgLy8gY291bGQgYmUgY2FsbGVkIGZvciBlYWNoIHNvdXJjZSBmaWxlLiBDcmVhdGluZyBnbG9iJ3MgaXMgZXhwZW5zaXZlLlxuICAgIHJldHVybiBmaWxlcy5zb21lKChmKSA9PiBwYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PiBnZXRPckNyZWF0ZUdsb2IocGF0dGVybikubWF0Y2goZikpKTtcbiAgfSxcbn07XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiBjb25kaXRpb24gdG8gYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBzZXQgb2YgZmlsZXMuIFRoZSByZXR1cm5lZFxuICogZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCB0byBjaGVjayBpZiB0aGUgc2V0IG9mIGZpbGVzIG1hdGNoZXMgdGhlIGNvbmRpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKFxuICBleHByOiBzdHJpbmcsXG4pOiAoZmlsZXM6IHN0cmluZ1tdLCBncm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSkgPT4gYm9vbGVhbiB7XG4gIC8vIENyZWF0ZXMgYSBkeW5hbWljIGZ1bmN0aW9uIHdpdGggdGhlIHNwZWNpZmllZCBleHByZXNzaW9uLlxuICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIHdpbGwgYmUgYGZpbGVzYCBhcyB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBzdXBwb3J0ZWQgYGZpbGVzYCB2YXJpYWJsZSB0aGF0XG4gIC8vIGNhbiBiZSBhY2Nlc3NlZCBpbiBQdWxsQXBwcm92ZSBjb25kaXRpb24gZXhwcmVzc2lvbnMuIFRoZSBzZWNvbmQgcGFyYW1ldGVyIGlzIHRoZSBsaXN0IG9mXG4gIC8vIFB1bGxBcHByb3ZlR3JvdXBzIHRoYXQgYXJlIGFjY2Vzc2libGUgaW4gdGhlIGNvbmRpdGlvbiBleHByZXNzaW9ucy4gVGhlIGZvbGxvd2VkIHBhcmFtZXRlcnNcbiAgLy8gY29ycmVzcG9uZCB0byBvdGhlciBjb250ZXh0IHZhcmlhYmxlcyBwcm92aWRlZCBieSBQdWxsQXBwcm92ZSBmb3IgY29uZGl0aW9ucy5cbiAgY29uc3QgZXZhbHVhdGVGbiA9IG5ldyBGdW5jdGlvbihcbiAgICAnZmlsZXMnLFxuICAgICdncm91cHMnLFxuICAgIC4uLk9iamVjdC5rZXlzKGNvbmRpdGlvbkNvbnRleHQpLFxuICAgIGBcbiAgICByZXR1cm4gKCR7dHJhbnNmb3JtRXhwcmVzc2lvblRvSnMoZXhwcil9KTtcbiAgYCxcbiAgKTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBkeW5hbWljYWxseSBjb25zdHJ1Y3RlZCBmdW5jdGlvbiB3aGljaCBtaW1pY3NcbiAgLy8gdGhlIGNvbmRpdGlvbiBleHByZXNzaW9uIHRoYXQgaXMgdXN1YWxseSBldmFsdWF0ZWQgd2l0aCBQeXRob24gaW4gUHVsbEFwcHJvdmUuXG4gIHJldHVybiAoZmlsZXMsIGdyb3VwcykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGV2YWx1YXRlRm4oXG4gICAgICBuZXcgUHVsbEFwcHJvdmVTdHJpbmdBcnJheSguLi5maWxlcyksXG4gICAgICBuZXcgUHVsbEFwcHJvdmVHcm91cEFycmF5KC4uLmdyb3VwcyksXG4gICAgICAuLi5PYmplY3QudmFsdWVzKGNvbmRpdGlvbkNvbnRleHQpLFxuICAgICk7XG4gICAgLy8gSWYgYW4gYXJyYXkgaXMgcmV0dXJuZWQsIHdlIGNvbnNpZGVyIHRoZSBjb25kaXRpb24gYXMgYWN0aXZlIGlmIHRoZSBhcnJheSBpcyBub3RcbiAgICAvLyBlbXB0eS4gVGhpcyBtYXRjaGVzIFB1bGxBcHByb3ZlJ3MgY29uZGl0aW9uIGV2YWx1YXRpb24gdGhhdCBpcyBiYXNlZCBvbiBQeXRob24uXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggIT09IDA7XG4gICAgfVxuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgY29uZGl0aW9uIGV4cHJlc3Npb24gZnJvbSBQdWxsQXBwcm92ZSB0aGF0IGlzIGJhc2VkIG9uIHB5dGhvblxuICogc28gdGhhdCBpdCBjYW4gYmUgcnVuIGluc2lkZSBKYXZhU2NyaXB0LiBDdXJyZW50IHRyYW5zZm9ybWF0aW9uczpcbiAqICAgMS4gYG5vdCA8Li4+YCAtPiBgITwuLj5gXG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybUV4cHJlc3Npb25Ub0pzKGV4cHJlc3Npb246IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBleHByZXNzaW9uLnJlcGxhY2UoL25vdFxccysvZywgJyEnKTtcbn1cbiJdfQ==