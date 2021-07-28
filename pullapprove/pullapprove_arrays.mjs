import { getOrCreateGlob } from './utils';
export class PullApproveGroupStateDependencyError extends Error {
    constructor(message) {
        super(message);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveGroupStateDependencyError.prototype);
        // Error names are displayed in their stack but can't be set in the constructor.
        this.name = PullApproveGroupStateDependencyError.name;
    }
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for files in conditions.
 */
export class PullApproveStringArray extends Array {
    constructor(...elements) {
        super(...elements);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveStringArray.prototype);
    }
    /** Returns a new array which only includes files that match the given pattern. */
    include(pattern) {
        return new PullApproveStringArray(...this.filter(s => getOrCreateGlob(pattern).match(s)));
    }
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern) {
        return new PullApproveStringArray(...this.filter(s => !getOrCreateGlob(pattern).match(s)));
    }
}
/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for groups in conditions.
 */
export class PullApproveGroupArray extends Array {
    constructor(...elements) {
        super(...elements);
        // Set the prototype explicitly because in ES5, the prototype is accidentally
        // lost due to a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, PullApproveGroupArray.prototype);
    }
    include(pattern) {
        return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
    }
    /** Returns a new array which only includes files that did not match the given pattern. */
    exclude(pattern) {
        return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
    }
    get pending() {
        throw new PullApproveGroupStateDependencyError();
    }
    get active() {
        throw new PullApproveGroupStateDependencyError();
    }
    get inactive() {
        throw new PullApproveGroupStateDependencyError();
    }
    get rejected() {
        throw new PullApproveGroupStateDependencyError();
    }
    get names() {
        return this.map(g => g.groupName);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbGFwcHJvdmVfYXJyYXlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3B1bGxhcHByb3ZlX2FycmF5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXhDLE1BQU0sT0FBTyxvQ0FBcUMsU0FBUSxLQUFLO0lBQzdELFlBQVksT0FBZ0I7UUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsNkVBQTZFO1FBQzdFLDZDQUE2QztRQUM3QyxpSEFBaUg7UUFDakgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsb0NBQW9DLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsZ0ZBQWdGO1FBQ2hGLElBQUksQ0FBQyxJQUFJLEdBQUcsb0NBQW9DLENBQUMsSUFBSSxDQUFDO0lBQ3hELENBQUM7Q0FDRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxLQUFhO0lBQ3ZELFlBQVksR0FBRyxRQUFrQjtRQUMvQixLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUVuQiw2RUFBNkU7UUFDN0UsNkNBQTZDO1FBQzdDLGlIQUFpSDtRQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0Qsa0ZBQWtGO0lBQ2xGLE9BQU8sQ0FBQyxPQUFlO1FBQ3JCLE9BQU8sSUFBSSxzQkFBc0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsMEZBQTBGO0lBQzFGLE9BQU8sQ0FBQyxPQUFlO1FBQ3JCLE9BQU8sSUFBSSxzQkFBc0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDRjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxLQUF1QjtJQUNoRSxZQUFZLEdBQUcsUUFBNEI7UUFDekMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFbkIsNkVBQTZFO1FBQzdFLDZDQUE2QztRQUM3QyxpSEFBaUg7UUFDakgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUFlO1FBQ3JCLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELDBGQUEwRjtJQUMxRixPQUFPLENBQUMsT0FBZTtRQUNyQixPQUFPLElBQUkscUJBQXFCLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxNQUFNLElBQUksb0NBQW9DLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsTUFBTSxJQUFJLG9DQUFvQyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVELElBQUksUUFBUTtRQUNWLE1BQU0sSUFBSSxvQ0FBb0MsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDVixNQUFNLElBQUksb0NBQW9DLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7Z2V0T3JDcmVhdGVHbG9ifSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5XG4gICAgLy8gbG9zdCBkdWUgdG8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yLnByb3RvdHlwZSk7XG4gICAgLy8gRXJyb3IgbmFtZXMgYXJlIGRpc3BsYXllZCBpbiB0aGVpciBzdGFjayBidXQgY2FuJ3QgYmUgc2V0IGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICB0aGlzLm5hbWUgPSBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IubmFtZTtcbiAgfVxufVxuXG4vKipcbiAqIFN1cGVyc2V0IG9mIGEgbmF0aXZlIGFycmF5LiBUaGUgc3VwZXJzZXQgcHJvdmlkZXMgbWV0aG9kcyB3aGljaCBtaW1pYyB0aGVcbiAqIGxpc3QgZGF0YSBzdHJ1Y3R1cmUgdXNlZCBpbiBQdWxsQXBwcm92ZSBmb3IgZmlsZXMgaW4gY29uZGl0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlU3RyaW5nQXJyYXkgZXh0ZW5kcyBBcnJheTxzdHJpbmc+IHtcbiAgY29uc3RydWN0b3IoLi4uZWxlbWVudHM6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIoLi4uZWxlbWVudHMpO1xuXG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseSBiZWNhdXNlIGluIEVTNSwgdGhlIHByb3RvdHlwZSBpcyBhY2NpZGVudGFsbHlcbiAgICAvLyBsb3N0IGR1ZSB0byBhIGxpbWl0YXRpb24gaW4gZG93bi1sZXZlbGluZy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvd2lraS9GQVEjd2h5LWRvZXNudC1leHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC13b3JrLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBQdWxsQXBwcm92ZVN0cmluZ0FycmF5LnByb3RvdHlwZSk7XG4gIH1cbiAgLyoqIFJldHVybnMgYSBuZXcgYXJyYXkgd2hpY2ggb25seSBpbmNsdWRlcyBmaWxlcyB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwYXR0ZXJuLiAqL1xuICBpbmNsdWRlKHBhdHRlcm46IHN0cmluZyk6IFB1bGxBcHByb3ZlU3RyaW5nQXJyYXkge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVTdHJpbmdBcnJheSguLi50aGlzLmZpbHRlcihzID0+IGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChzKSkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBuZXcgYXJyYXkgd2hpY2ggb25seSBpbmNsdWRlcyBmaWxlcyB0aGF0IGRpZCBub3QgbWF0Y2ggdGhlIGdpdmVuIHBhdHRlcm4uICovXG4gIGV4Y2x1ZGUocGF0dGVybjogc3RyaW5nKTogUHVsbEFwcHJvdmVTdHJpbmdBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZVN0cmluZ0FycmF5KC4uLnRoaXMuZmlsdGVyKHMgPT4gIWdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChzKSkpO1xuICB9XG59XG5cbi8qKlxuICogU3VwZXJzZXQgb2YgYSBuYXRpdmUgYXJyYXkuIFRoZSBzdXBlcnNldCBwcm92aWRlcyBtZXRob2RzIHdoaWNoIG1pbWljIHRoZVxuICogbGlzdCBkYXRhIHN0cnVjdHVyZSB1c2VkIGluIFB1bGxBcHByb3ZlIGZvciBncm91cHMgaW4gY29uZGl0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlR3JvdXBBcnJheSBleHRlbmRzIEFycmF5PFB1bGxBcHByb3ZlR3JvdXA+IHtcbiAgY29uc3RydWN0b3IoLi4uZWxlbWVudHM6IFB1bGxBcHByb3ZlR3JvdXBbXSkge1xuICAgIHN1cGVyKC4uLmVsZW1lbnRzKTtcblxuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5XG4gICAgLy8gbG9zdCBkdWUgdG8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgUHVsbEFwcHJvdmVHcm91cEFycmF5LnByb3RvdHlwZSk7XG4gIH1cblxuICBpbmNsdWRlKHBhdHRlcm46IHN0cmluZyk6IFB1bGxBcHByb3ZlR3JvdXBBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUdyb3VwQXJyYXkoLi4udGhpcy5maWx0ZXIocyA9PiBzLmdyb3VwTmFtZS5tYXRjaChwYXR0ZXJuKSkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBuZXcgYXJyYXkgd2hpY2ggb25seSBpbmNsdWRlcyBmaWxlcyB0aGF0IGRpZCBub3QgbWF0Y2ggdGhlIGdpdmVuIHBhdHRlcm4uICovXG4gIGV4Y2x1ZGUocGF0dGVybjogc3RyaW5nKTogUHVsbEFwcHJvdmVHcm91cEFycmF5IHtcbiAgICByZXR1cm4gbmV3IFB1bGxBcHByb3ZlR3JvdXBBcnJheSguLi50aGlzLmZpbHRlcihzID0+IHMuZ3JvdXBOYW1lLm1hdGNoKHBhdHRlcm4pKSk7XG4gIH1cblxuICBnZXQgcGVuZGluZygpIHtcbiAgICB0aHJvdyBuZXcgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKCk7XG4gIH1cblxuICBnZXQgYWN0aXZlKCkge1xuICAgIHRocm93IG5ldyBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IoKTtcbiAgfVxuXG4gIGdldCBpbmFjdGl2ZSgpIHtcbiAgICB0aHJvdyBuZXcgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKCk7XG4gIH1cblxuICBnZXQgcmVqZWN0ZWQoKSB7XG4gICAgdGhyb3cgbmV3IFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcigpO1xuICB9XG5cbiAgZ2V0IG5hbWVzKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChnID0+IGcuZ3JvdXBOYW1lKTtcbiAgfVxufVxuIl19