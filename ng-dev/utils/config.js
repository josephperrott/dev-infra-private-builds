"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConfig = exports.assertNoErrors = exports.getConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const console_1 = require("./console");
const git_client_1 = require("./git/git-client");
const ts_node_1 = require("./ts-node");
/**
 * The filename expected for creating the ng-dev config, without the file
 * extension to allow either a typescript or javascript file to be used.
 */
const CONFIG_FILE_PATH = '.ng-dev/config';
/** The configuration for ng-dev. */
let cachedConfig = null;
/**
 * The filename expected for local user config, without the file extension to allow a typescript,
 * javascript or json file to be used.
 */
const USER_CONFIG_FILE_PATH = '.ng-dev.user';
/** The local user configuration for ng-dev. */
let userConfig = null;
function getConfig(baseDir) {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        baseDir = baseDir || git_client_1.GitClient.get().baseDir;
        // The full path to the configuration file.
        const configPath = path_1.join(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = validateCommonConfig(readConfigFile(configPath));
    }
    // Return a clone of the cached global config to ensure that a new instance of the config
    // is returned each time, preventing unexpected effects of modifications to the config object.
    return { ...cachedConfig };
}
exports.getConfig = getConfig;
/** Validate the common configuration has been met for the ng-dev command. */
function validateCommonConfig(config) {
    const errors = [];
    // Validate the github configuration.
    if (config.github === undefined) {
        errors.push(`Github repository not configured. Set the "github" option.`);
    }
    else {
        if (config.github.name === undefined) {
            errors.push(`"github.name" is not defined`);
        }
        if (config.github.owner === undefined) {
            errors.push(`"github.owner" is not defined`);
        }
    }
    assertNoErrors(errors);
    return config;
}
/**
 * Resolves and reads the specified configuration file, optionally returning an empty object if the
 * configuration file cannot be read.
 */
function readConfigFile(configPath, returnEmptyObjectOnError = false) {
    // If the `.ts` extension has not been set up already, and a TypeScript based
    // version of the given configuration seems to exist, set up `ts-node` if available.
    if (require.extensions['.ts'] === undefined &&
        fs_1.existsSync(`${configPath}.ts`) &&
        ts_node_1.isTsNodeAvailable()) {
        // Ensure the module target is set to `commonjs`. This is necessary because the
        // dev-infra tool runs in NodeJS which does not support ES modules by default.
        // Additionally, set the `dir` option to the directory that contains the configuration
        // file. This allows for custom compiler options (such as `--strict`).
        require('ts-node').register({
            dir: path_1.dirname(configPath),
            transpileOnly: true,
            compilerOptions: { module: 'commonjs' },
        });
    }
    try {
        return require(configPath);
    }
    catch (e) {
        if (returnEmptyObjectOnError) {
            console_1.debug(`Could not read configuration file at ${configPath}, returning empty object instead.`);
            console_1.debug(e);
            return {};
        }
        console_1.error(`Could not read configuration file at ${configPath}.`);
        console_1.error(e);
        process.exit(1);
    }
}
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
function assertNoErrors(errors) {
    if (errors.length == 0) {
        return;
    }
    console_1.error(`Errors discovered while loading configuration file:`);
    for (const err of errors) {
        console_1.error(`  - ${err}`);
    }
    process.exit(1);
}
exports.assertNoErrors = assertNoErrors;
/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
function getUserConfig() {
    // If the global config is not defined, load it from the file system.
    if (userConfig === null) {
        const git = git_client_1.GitClient.get();
        // The full path to the configuration file.
        const configPath = path_1.join(git.baseDir, USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return { ...userConfig };
}
exports.getUserConfig = getUserConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBK0I1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBdUIsSUFBSSxDQUFDO0FBRTVDOzs7R0FHRztBQUNILE1BQU0scUJBQXFCLEdBQUcsY0FBYyxDQUFDO0FBRTdDLCtDQUErQztBQUMvQyxJQUFJLFVBQVUsR0FBZ0MsSUFBSSxDQUFDO0FBUW5ELFNBQWdCLFNBQVMsQ0FBQyxPQUFnQjtJQUN4QyxxRUFBcUU7SUFDckUsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1FBQ3pCLE9BQU8sR0FBRyxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDN0MsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ2pFO0lBQ0QseUZBQXlGO0lBQ3pGLDhGQUE4RjtJQUM5RixPQUFPLEVBQUMsR0FBRyxZQUFZLEVBQUMsQ0FBQztBQUMzQixDQUFDO0FBWkQsOEJBWUM7QUFFRCw2RUFBNkU7QUFDN0UsU0FBUyxvQkFBb0IsQ0FBQyxNQUE0QjtJQUN4RCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIscUNBQXFDO0lBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0tBQzNFO1NBQU07UUFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDN0M7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDOUM7S0FDRjtJQUNELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQXFCLENBQUM7QUFDL0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsd0JBQXdCLEdBQUcsS0FBSztJQUMxRSw2RUFBNkU7SUFDN0Usb0ZBQW9GO0lBQ3BGLElBQ0UsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTO1FBQ3ZDLGVBQVUsQ0FBQyxHQUFHLFVBQVUsS0FBSyxDQUFDO1FBQzlCLDJCQUFpQixFQUFFLEVBQ25CO1FBQ0EsK0VBQStFO1FBQy9FLDhFQUE4RTtRQUM5RSxzRkFBc0Y7UUFDdEYsc0VBQXNFO1FBQ3RFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDMUIsR0FBRyxFQUFFLGNBQU8sQ0FBQyxVQUFVLENBQUM7WUFDeEIsYUFBYSxFQUFFLElBQUk7WUFDbkIsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQztTQUN0QyxDQUFDLENBQUM7S0FDSjtJQUVELElBQUk7UUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUM1QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSx3QkFBd0IsRUFBRTtZQUM1QixlQUFLLENBQUMsd0NBQXdDLFVBQVUsbUNBQW1DLENBQUMsQ0FBQztZQUM3RixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsZUFBSyxDQUFDLHdDQUF3QyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdELGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLE1BQWdCO0lBQzdDLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDdEIsT0FBTztLQUNSO0lBQ0QsZUFBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7SUFDN0QsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7UUFDeEIsZUFBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNyQjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQVRELHdDQVNDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYTtJQUMzQixxRUFBcUU7SUFDckUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDNUQsZ0NBQWdDO1FBQ2hDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsNEZBQTRGO0lBQzVGLGtGQUFrRjtJQUNsRixPQUFPLEVBQUMsR0FBRyxVQUFVLEVBQUMsQ0FBQztBQUN6QixDQUFDO0FBWkQsc0NBWUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBHaXQgY2xpZW50IGludGVyYWN0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0Q2xpZW50Q29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIEdpdGh1YiBjb25maWd1cmF0aW9uIGZvciBkZXYtaW5mcmEuIFRoaXMgY29uZmlndXJhdGlvbiBpc1xuICogdXNlZCBmb3IgQVBJIHJlcXVlc3RzLCBkZXRlcm1pbmluZyB0aGUgdXBzdHJlYW0gcmVtb3RlLCBldGMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQ29uZmlnIGV4dGVuZHMgR2l0Q2xpZW50Q29uZmlnIHt9XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZztcbn07XG5cbi8qKlxuICogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpYyBuZy1kZXYgY29tbWFuZCwgcHJvdmlkaW5nIGJvdGggdGhlIGNvbW1vblxuICogbmctZGV2IGNvbmZpZyBhcyB3ZWxsIGFzIHRoZSBzcGVjaWZpYyBjb25maWcgb2YgYSBzdWJjb21tYW5kLlxuICovXG5leHBvcnQgdHlwZSBOZ0RldkNvbmZpZzxUID0ge30+ID0gQ29tbW9uQ29uZmlnICYgVDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzogTmdEZXZDb25maWcgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IE5nRGV2Q29uZmlnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKTogTmdEZXZDb25maWc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiBOZ0RldkNvbmZpZyB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoY2FjaGVkQ29uZmlnID09PSBudWxsKSB7XG4gICAgYmFzZURpciA9IGJhc2VEaXIgfHwgR2l0Q2xpZW50LmdldCgpLmJhc2VEaXI7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGJhc2VEaXIsIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIHZhbGlkYXRlIGl0IGJlZm9yZSBjYWNoaW5nIGl0IGZvciB0aGUgZnV0dXJlLlxuICAgIGNhY2hlZENvbmZpZyA9IHZhbGlkYXRlQ29tbW9uQ29uZmlnKHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgpKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgY2FjaGVkIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xuICAvLyBpcyByZXR1cm5lZCBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4uY2FjaGVkQ29uZmlnfTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgTmdEZXZDb25maWc7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLCBvcHRpb25hbGx5IHJldHVybmluZyBhbiBlbXB0eSBvYmplY3QgaWYgdGhlXG4gKiBjb25maWd1cmF0aW9uIGZpbGUgY2Fubm90IGJlIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGg6IHN0cmluZywgcmV0dXJuRW1wdHlPYmplY3RPbkVycm9yID0gZmFsc2UpOiBvYmplY3Qge1xuICAvLyBJZiB0aGUgYC50c2AgZXh0ZW5zaW9uIGhhcyBub3QgYmVlbiBzZXQgdXAgYWxyZWFkeSwgYW5kIGEgVHlwZVNjcmlwdCBiYXNlZFxuICAvLyB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIHNlZW1zIHRvIGV4aXN0LCBzZXQgdXAgYHRzLW5vZGVgIGlmIGF2YWlsYWJsZS5cbiAgaWYgKFxuICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnRzJ10gPT09IHVuZGVmaW5lZCAmJlxuICAgIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgIGlzVHNOb2RlQXZhaWxhYmxlKClcbiAgKSB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgdGFyZ2V0IGlzIHNldCB0byBgY29tbW9uanNgLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIGRldi1pbmZyYSB0b29sIHJ1bnMgaW4gTm9kZUpTIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgRVMgbW9kdWxlcyBieSBkZWZhdWx0LlxuICAgIC8vIEFkZGl0aW9uYWxseSwgc2V0IHRoZSBgZGlyYCBvcHRpb24gdG8gdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBjb25maWd1cmF0aW9uXG4gICAgLy8gZmlsZS4gVGhpcyBhbGxvd3MgZm9yIGN1c3RvbSBjb21waWxlciBvcHRpb25zIChzdWNoIGFzIGAtLXN0cmljdGApLlxuICAgIHJlcXVpcmUoJ3RzLW5vZGUnKS5yZWdpc3Rlcih7XG4gICAgICBkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksXG4gICAgICB0cmFuc3BpbGVPbmx5OiB0cnVlLFxuICAgICAgY29tcGlsZXJPcHRpb25zOiB7bW9kdWxlOiAnY29tbW9uanMnfSxcbiAgICB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocmV0dXJuRW1wdHlPYmplY3RPbkVycm9yKSB7XG4gICAgICBkZWJ1ZyhgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0sIHJldHVybmluZyBlbXB0eSBvYmplY3QgaW5zdGVhZC5gKTtcbiAgICAgIGRlYnVnKGUpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlcnJvcihgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0uYCk7XG4gICAgZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVyciBvZiBlcnJvcnMpIHtcbiAgICBlcnJvcihgICAtICR7ZXJyfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdpdC5iYXNlRGlyLCBVU0VSX0NPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgdXNlckNvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSB1c2VyIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi51c2VyQ29uZmlnfTtcbn1cbiJdfQ==