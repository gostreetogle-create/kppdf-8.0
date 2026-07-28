import { Observable } from 'rxjs';

import { SilentResult } from '../../../core/silent-http';

/**
 * Narrower service contract for the `<pi-entity-form>` wrapper.
 *
 * The wrapper only needs `.create()` + `.update()` — there is no need
 * to force callers to also pass `.list()` / `.findById()` / `.remove()`.
 * Pages/dialogs that have a hand-written 5-CRUD service can pass it
 * directly (TypeScript structural typing accepts the broader shape).
 *
 * Why this exists: originally the proposal was to type the wrapper's
 * `service` input as `EntityService<T, P>` (the full 5-CRUD surface
 * from `<pi-entity-list>`), but that's wrong for two reasons:
 *
 *  1. Dialog code paths NEVER call `.list()` — list-fetch is a page
 *     concern. Forcing dialog callers to provide a list-capable
 *     service means they need a `toEntityService` adapter that maps
 *     the hand-written service's non-paginated list response into
 *     the canonical envelope. That's pure ceremony for the dialog
 *     use-case.
 *  2. Some hand-written services have no list endpoint at all (e.g.
 *     if it's a write-only or read-only subset). Forcing the full
 *     shape is a leaky abstraction.
 *
 * Usage:
 * ```ts
 * export class WorkTypeFormDialogComponent {
 *   private readonly wt = inject(WorkTypesService);
 *   // WorkTypesService already implements `.create()` + `.update()`
 *   // so it satisfies EntityMutator<WorkType> structurally — no
 *   // adapter needed.
 *   protected readonly mutator: EntityMutator<WorkType> = this.wt;
 * }
 * ```
 */
export interface EntityMutator<T> {
  create(payload: Partial<T>): Observable<SilentResult<T>>;
  update(id: string, payload: Partial<T>): Observable<SilentResult<T>>;
}
