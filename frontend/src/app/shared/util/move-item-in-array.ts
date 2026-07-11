/**
 * TZ-86 Phase D.1 — `moveItemInArray` utility.
 *
 * Re-exports the CDK helper for stable imports. CDK ships
 * `moveItemInArray` from `@angular/cdk/drag-drop` but its return type is
 * `void`; we wrap to keep call-sites readable and to allow future swapping
 * (e.g. an immutable version using a fresh array + spread).
 *
 * @param array The array to mutate in place.
 * @param fromIndex Source index.
 * @param toIndex Target index.
 */
export function moveItemInArray<T>(array: T[], fromIndex: number, toIndex: number): void {
  if (fromIndex === toIndex) return;
  if (fromIndex < 0 || fromIndex >= array.length) return;
  if (toIndex < 0 || toIndex >= array.length) return;
  const target = array[fromIndex];
  const dir = toIndex < fromIndex ? -1 : 1;
  for (let i = fromIndex; i !== toIndex; i += dir) {
    array[i] = array[i + dir];
  }
  array[toIndex] = target;
}
