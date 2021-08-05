"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkServiceStatuses = void 0;
const config_1 = require("../config");
const ci_1 = require("./ci");
const g3_1 = require("./g3");
const github_1 = require("./github");
const services_1 = require("./services");
/** List of modules checked for the caretaker check command. */
const moduleList = [github_1.GithubQueriesModule, services_1.ServicesModule, ci_1.CiModule, g3_1.G3Module];
/** Check the status of services which Angular caretakers need to monitor. */
async function checkServiceStatuses() {
    /** The configuration for the caretaker commands. */
    const config = config_1.getCaretakerConfig();
    /** List of instances of Caretaker Check modules */
    const caretakerCheckModules = moduleList.map((module) => new module(config));
    // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
    // promises do not match typings, however our usage here is only to determine when the promise
    // resolves.
    await Promise.all(caretakerCheckModules.map((module) => module.data));
    for (const module of caretakerCheckModules) {
        await module.printToTerminal();
    }
}
exports.checkServiceStatuses = checkServiceStatuses;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHNDQUE2QztBQUU3Qyw2QkFBOEI7QUFDOUIsNkJBQThCO0FBQzlCLHFDQUE2QztBQUM3Qyx5Q0FBMEM7QUFFMUMsK0RBQStEO0FBQy9ELE1BQU0sVUFBVSxHQUFHLENBQUMsNEJBQW1CLEVBQUUseUJBQWMsRUFBRSxhQUFRLEVBQUUsYUFBUSxDQUFDLENBQUM7QUFFN0UsNkVBQTZFO0FBQ3RFLEtBQUssVUFBVSxvQkFBb0I7SUFDeEMsb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFHLDJCQUFrQixFQUFFLENBQUM7SUFDcEMsbURBQW1EO0lBQ25ELE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU3RSxnR0FBZ0c7SUFDaEcsOEZBQThGO0lBQzlGLFlBQVk7SUFDWixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBd0IsQ0FBQyxDQUFDLENBQUM7SUFFMUYsS0FBSyxNQUFNLE1BQU0sSUFBSSxxQkFBcUIsRUFBRTtRQUMxQyxNQUFNLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUNoQztBQUNILENBQUM7QUFkRCxvREFjQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IHtDaU1vZHVsZX0gZnJvbSAnLi9jaSc7XG5pbXBvcnQge0czTW9kdWxlfSBmcm9tICcuL2czJztcbmltcG9ydCB7R2l0aHViUXVlcmllc01vZHVsZX0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtTZXJ2aWNlc01vZHVsZX0gZnJvbSAnLi9zZXJ2aWNlcyc7XG5cbi8qKiBMaXN0IG9mIG1vZHVsZXMgY2hlY2tlZCBmb3IgdGhlIGNhcmV0YWtlciBjaGVjayBjb21tYW5kLiAqL1xuY29uc3QgbW9kdWxlTGlzdCA9IFtHaXRodWJRdWVyaWVzTW9kdWxlLCBTZXJ2aWNlc01vZHVsZSwgQ2lNb2R1bGUsIEczTW9kdWxlXTtcblxuLyoqIENoZWNrIHRoZSBzdGF0dXMgb2Ygc2VydmljZXMgd2hpY2ggQW5ndWxhciBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1NlcnZpY2VTdGF0dXNlcygpIHtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDYXJldGFrZXJDb25maWcoKTtcbiAgLyoqIExpc3Qgb2YgaW5zdGFuY2VzIG9mIENhcmV0YWtlciBDaGVjayBtb2R1bGVzICovXG4gIGNvbnN0IGNhcmV0YWtlckNoZWNrTW9kdWxlcyA9IG1vZHVsZUxpc3QubWFwKChtb2R1bGUpID0+IG5ldyBtb2R1bGUoY29uZmlnKSk7XG5cbiAgLy8gTW9kdWxlJ3MgYGRhdGFgIGlzIGNhc3RlZCBhcyBQcm9taXNlPHVua25vd24+IGJlY2F1c2UgdGhlIGRhdGEgdHlwZXMgb2YgdGhlIGBtb2R1bGVgJ3MgYGRhdGFgXG4gIC8vIHByb21pc2VzIGRvIG5vdCBtYXRjaCB0eXBpbmdzLCBob3dldmVyIG91ciB1c2FnZSBoZXJlIGlzIG9ubHkgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIHByb21pc2VcbiAgLy8gcmVzb2x2ZXMuXG4gIGF3YWl0IFByb21pc2UuYWxsKGNhcmV0YWtlckNoZWNrTW9kdWxlcy5tYXAoKG1vZHVsZSkgPT4gbW9kdWxlLmRhdGEgYXMgUHJvbWlzZTx1bmtub3duPikpO1xuXG4gIGZvciAoY29uc3QgbW9kdWxlIG9mIGNhcmV0YWtlckNoZWNrTW9kdWxlcykge1xuICAgIGF3YWl0IG1vZHVsZS5wcmludFRvVGVybWluYWwoKTtcbiAgfVxufVxuIl19