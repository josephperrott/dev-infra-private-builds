"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiModule = void 0;
const node_fetch_1 = require("node-fetch");
const index_1 = require("../../release/versioning/index");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
class CiModule extends base_1.BaseModule {
    async retrieveData() {
        const gitRepoWithApi = { api: this.git.github, ...this.git.remoteConfig };
        const releaseTrains = await index_1.fetchActiveReleaseTrains(gitRepoWithApi);
        const ciResultPromises = Object.entries(releaseTrains).map(async ([trainName, train]) => {
            if (train === null) {
                return {
                    active: false,
                    name: trainName,
                    label: '',
                    status: 'not found',
                };
            }
            return {
                active: true,
                name: train.branchName,
                label: `${trainName} (${train.branchName})`,
                status: await this.getBranchStatusFromCi(train.branchName),
            };
        });
        return await Promise.all(ciResultPromises);
    }
    async printToTerminal() {
        const data = await this.data;
        const minLabelLength = Math.max(...data.map((result) => result.label.length));
        console_1.info.group(console_1.bold(`CI`));
        data.forEach((result) => {
            if (result.active === false) {
                console_1.debug(`No active release train for ${result.name}`);
                return;
            }
            const label = result.label.padEnd(minLabelLength);
            if (result.status === 'not found') {
                console_1.info(`${result.name} was not found on CircleCI`);
            }
            else if (result.status === 'success') {
                console_1.info(`${label} ✅`);
            }
            else {
                console_1.info(`${label} ❌`);
            }
        });
        console_1.info.groupEnd();
        console_1.info();
    }
    /** Get the CI status of a given branch from CircleCI. */
    async getBranchStatusFromCi(branch) {
        const { owner, name } = this.git.remoteConfig;
        const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
        const result = await node_fetch_1.default(url).then((result) => result.text());
        if (result && !result.includes('no builds')) {
            return result.includes('passing') ? 'success' : 'failed';
        }
        return 'not found';
    }
}
exports.CiModule = CiModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJDQUErQjtBQUMvQiwwREFBc0Y7QUFFdEYsaURBQXNEO0FBQ3RELGlDQUFrQztBQWFsQyxNQUFhLFFBQVMsU0FBUSxpQkFBa0I7SUFDckMsS0FBSyxDQUFDLFlBQVk7UUFDekIsTUFBTSxjQUFjLEdBQUcsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBQyxDQUFDO1FBQ3hFLE1BQU0sYUFBYSxHQUFHLE1BQU0sZ0NBQXdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFckUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FDeEQsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBZ0MsRUFBRSxFQUFFO1lBQzFELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDbEIsT0FBTztvQkFDTCxNQUFNLEVBQUUsS0FBSztvQkFDYixJQUFJLEVBQUUsU0FBUztvQkFDZixLQUFLLEVBQUUsRUFBRTtvQkFDVCxNQUFNLEVBQUUsV0FBb0I7aUJBQzdCLENBQUM7YUFDSDtZQUVELE9BQU87Z0JBQ0wsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dCQUN0QixLQUFLLEVBQUUsR0FBRyxTQUFTLEtBQUssS0FBSyxDQUFDLFVBQVUsR0FBRztnQkFDM0MsTUFBTSxFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7YUFDM0QsQ0FBQztRQUNKLENBQUMsQ0FDRixDQUFDO1FBRUYsT0FBTyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRVEsS0FBSyxDQUFDLGVBQWU7UUFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzdCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUUsY0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtnQkFDM0IsZUFBSyxDQUFDLCtCQUErQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDcEQsT0FBTzthQUNSO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtnQkFDakMsY0FBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksNEJBQTRCLENBQUMsQ0FBQzthQUNsRDtpQkFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QyxjQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNMLGNBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixjQUFJLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCx5REFBeUQ7SUFDakQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE1BQWM7UUFDaEQsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRywyQkFBMkIsS0FBSyxJQUFJLElBQUksU0FBUyxNQUFNLG1CQUFtQixDQUFDO1FBQ3ZGLE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhFLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMzQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztDQUNGO0FBN0RELDRCQTZEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5pbXBvcnQge2ZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgUmVsZWFzZVRyYWlufSBmcm9tICcuLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcvaW5kZXgnO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIFRoZSByZXN1bHQgb2YgY2hlY2tpbmcgYSBicmFuY2ggb24gQ0kuICovXG50eXBlIENpQnJhbmNoU3RhdHVzID0gJ3N1Y2Nlc3MnIHwgJ2ZhaWxlZCcgfCAnbm90IGZvdW5kJztcblxuLyoqIEEgbGlzdCBvZiByZXN1bHRzIGZvciBjaGVja2luZyBDSSBicmFuY2hlcy4gKi9cbnR5cGUgQ2lEYXRhID0ge1xuICBhY3RpdmU6IGJvb2xlYW47XG4gIG5hbWU6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgc3RhdHVzOiBDaUJyYW5jaFN0YXR1cztcbn1bXTtcblxuZXhwb3J0IGNsYXNzIENpTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxDaURhdGE+IHtcbiAgb3ZlcnJpZGUgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIGNvbnN0IGdpdFJlcG9XaXRoQXBpID0ge2FwaTogdGhpcy5naXQuZ2l0aHViLCAuLi50aGlzLmdpdC5yZW1vdGVDb25maWd9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMoZ2l0UmVwb1dpdGhBcGkpO1xuXG4gICAgY29uc3QgY2lSZXN1bHRQcm9taXNlcyA9IE9iamVjdC5lbnRyaWVzKHJlbGVhc2VUcmFpbnMpLm1hcChcbiAgICAgIGFzeW5jIChbdHJhaW5OYW1lLCB0cmFpbl06IFtzdHJpbmcsIFJlbGVhc2VUcmFpbiB8IG51bGxdKSA9PiB7XG4gICAgICAgIGlmICh0cmFpbiA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbmFtZTogdHJhaW5OYW1lLFxuICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgc3RhdHVzOiAnbm90IGZvdW5kJyBhcyBjb25zdCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgbmFtZTogdHJhaW4uYnJhbmNoTmFtZSxcbiAgICAgICAgICBsYWJlbDogYCR7dHJhaW5OYW1lfSAoJHt0cmFpbi5icmFuY2hOYW1lfSlgLFxuICAgICAgICAgIHN0YXR1czogYXdhaXQgdGhpcy5nZXRCcmFuY2hTdGF0dXNGcm9tQ2kodHJhaW4uYnJhbmNoTmFtZSksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICk7XG5cbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoY2lSZXN1bHRQcm9taXNlcyk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBjb25zdCBtaW5MYWJlbExlbmd0aCA9IE1hdGgubWF4KC4uLmRhdGEubWFwKChyZXN1bHQpID0+IHJlc3VsdC5sYWJlbC5sZW5ndGgpKTtcbiAgICBpbmZvLmdyb3VwKGJvbGQoYENJYCkpO1xuICAgIGRhdGEuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0LmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgZGVidWcoYE5vIGFjdGl2ZSByZWxlYXNlIHRyYWluIGZvciAke3Jlc3VsdC5uYW1lfWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBsYWJlbCA9IHJlc3VsdC5sYWJlbC5wYWRFbmQobWluTGFiZWxMZW5ndGgpO1xuICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdub3QgZm91bmQnKSB7XG4gICAgICAgIGluZm8oYCR7cmVzdWx0Lm5hbWV9IHdhcyBub3QgZm91bmQgb24gQ2lyY2xlQ0lgKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIGluZm8oYCR7bGFiZWx9IOKchWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mbyhgJHtsYWJlbH0g4p2MYCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIENJIHN0YXR1cyBvZiBhIGdpdmVuIGJyYW5jaCBmcm9tIENpcmNsZUNJLiAqL1xuICBwcml2YXRlIGFzeW5jIGdldEJyYW5jaFN0YXR1c0Zyb21DaShicmFuY2g6IHN0cmluZyk6IFByb21pc2U8Q2lCcmFuY2hTdGF0dXM+IHtcbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2NpcmNsZWNpLmNvbS9naC8ke293bmVyfS8ke25hbWV9L3RyZWUvJHticmFuY2h9LnN2Zz9zdHlsZT1zaGllbGRgO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoKHVybCkudGhlbigocmVzdWx0KSA9PiByZXN1bHQudGV4dCgpKTtcblxuICAgIGlmIChyZXN1bHQgJiYgIXJlc3VsdC5pbmNsdWRlcygnbm8gYnVpbGRzJykpIHtcbiAgICAgIHJldHVybiByZXN1bHQuaW5jbHVkZXMoJ3Bhc3NpbmcnKSA/ICdzdWNjZXNzJyA6ICdmYWlsZWQnO1xuICAgIH1cbiAgICByZXR1cm4gJ25vdCBmb3VuZCc7XG4gIH1cbn1cbiJdfQ==