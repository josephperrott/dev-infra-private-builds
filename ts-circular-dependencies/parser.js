/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/ts-circular-dependencies/parser", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    /**
     * Finds all module references in the specified source file.
     * @param node Source file which should be parsed.
     * @returns List of import specifiers in the source file.
     */
    function getModuleReferences(node) {
        var references = [];
        var visitNode = function (node) {
            if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
                node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier)) {
                references.push(node.moduleSpecifier.text);
            }
            ts.forEachChild(node, visitNode);
        };
        ts.forEachChild(node, visitNode);
        return references;
    }
    exports.getModuleReferences = getModuleReferences;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakM7Ozs7T0FJRztJQUNILFNBQWdCLG1CQUFtQixDQUFDLElBQW1CO1FBQ3JELElBQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQztRQUNoQyxJQUFNLFNBQVMsR0FBRyxVQUFDLElBQWE7WUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxlQUFlLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNsRixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUM7WUFDRCxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFDRixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqQyxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBWEQsa0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIEZpbmRzIGFsbCBtb2R1bGUgcmVmZXJlbmNlcyBpbiB0aGUgc3BlY2lmaWVkIHNvdXJjZSBmaWxlLlxuICogQHBhcmFtIG5vZGUgU291cmNlIGZpbGUgd2hpY2ggc2hvdWxkIGJlIHBhcnNlZC5cbiAqIEByZXR1cm5zIExpc3Qgb2YgaW1wb3J0IHNwZWNpZmllcnMgaW4gdGhlIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW9kdWxlUmVmZXJlbmNlcyhub2RlOiB0cy5Tb3VyY2VGaWxlKTogc3RyaW5nW10ge1xuICBjb25zdCByZWZlcmVuY2VzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB2aXNpdE5vZGUgPSAobm9kZTogdHMuTm9kZSkgPT4ge1xuICAgIGlmICgodHMuaXNJbXBvcnREZWNsYXJhdGlvbihub2RlKSB8fCB0cy5pc0V4cG9ydERlY2xhcmF0aW9uKG5vZGUpKSAmJlxuICAgICAgICBub2RlLm1vZHVsZVNwZWNpZmllciAhPT0gdW5kZWZpbmVkICYmIHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlLm1vZHVsZVNwZWNpZmllcikpIHtcbiAgICAgIHJlZmVyZW5jZXMucHVzaChub2RlLm1vZHVsZVNwZWNpZmllci50ZXh0KTtcbiAgICB9XG4gICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0Tm9kZSk7XG4gIH07XG4gIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUpO1xuICByZXR1cm4gcmVmZXJlbmNlcztcbn1cbiJdfQ==