/**
 * TZ-NX-REGISTRIES-PLATFORM — typed contract for the generic "Реестры"
 * platform. Every demo registry is authored against its own concrete
 * `TRow` (see `../data/*.registry.ts`) and widened to `RegistryRow` via
 * `defineRegistry()` — the single erasure boundary — before landing in
 * the catalog. The list/detail pages then operate on `RegistryRow` only
 * and never need a concrete row shape, so there is no `AnyTableService`:
 * generics stay strict everywhere except this one documented cast.
 */

/** Universal runtime row shape once a registry enters the catalog. */
export type RegistryRow = Record<string, unknown>;

/**
 * TZ-NX-REGISTRIES-MASTER-TABLE-UX — where a registry's rows actually come
 * from. Shown as an explicit badge on the master table row so "real backend"
 * and "demo fixture" registries are never visually ambiguous.
 */
export type RegistrySource = 'api' | 'demo';

export type RegistrySortDirection = 'asc' | 'desc';

export interface RegistrySort {
  readonly key: string;
  readonly direction: RegistrySortDirection;
}

export interface RegistryColumn<TRow> {
  readonly key: keyof TRow & string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  readonly width?: string;
  readonly numeric?: boolean;
  readonly format: (row: TRow) => string;
}

export type RegistryFilterType = 'text' | 'select';

/** How pagination is applied for this registry (documentation + tests). */
export type RegistryPaginationMode = 'server' | 'client' | 'fixture';

export interface RegistryFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface RegistryFilter {
  readonly key: string;
  readonly label: string;
  readonly type: RegistryFilterType;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  /** Required for `type: 'select'`. First option is the implicit "all" state when `value` is unset. */
  readonly options?: readonly RegistryFilterOption[];
  /** Label for the empty `<option value="">` — default «Все». Use when empty maps to a specific API default. */
  readonly emptyOptionLabel?: string;
}

export interface RegistryDetailField {
  readonly label: string;
  readonly value: string;
}

export interface RegistryExpandable<TRow> {
  readonly ariaLabel: (row: TRow) => string;
  readonly fields: (row: TRow) => readonly RegistryDetailField[];
}

export interface RegistryActionContext {
  /** Re-runs the current query (same filters/page/sort) against the data source. */
  readonly reload: () => void;
  /**
   * Reports action outcome to the user. Kept on the context (rather than
   * requiring Angular DI inside registry/fixture modules) so a registry's
   * `run` handler stays a plain, framework-agnostic function.
   */
  readonly notify: (message: string, tone?: 'success' | 'error') => void;
}

export interface RegistryRowActionConfirm {
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
}

/** Lucide icon key for compact registry row actions (TZ-NX-REGISTRIES-FULL-CLOSEOUT). */
export type RegistryRowActionIcon =
  | 'plus'
  | 'pencil'
  | 'copy'
  | 'archive'
  | 'layers'
  | 'check'
  | 'x'
  | 'power';

/** Semantic Paper & Ink tone for icon-only row actions. */
export type RegistryRowActionTone =
  | 'accent'
  | 'neutral'
  | 'destructive'
  | 'success'
  | 'edit'
  | 'copy'
  | 'doc';

export interface RegistryRowAction<TRow> {
  readonly id: string;
  readonly label: string;
  /** Icon-only button glyph; defaults inferred from `id` when omitted. */
  readonly icon?: RegistryRowActionIcon;
  /** Semantic color; defaults from icon/destructive when omitted. */
  readonly tone?: RegistryRowActionTone;
  /** Russian accessible name; defaults to `label`. */
  readonly ariaLabel?: string;
  /** Destructive actions render with the destructive tone and require `confirm`. */
  readonly destructive?: boolean;
  /** Confirmation dialog shown before `run`. Required in practice for `destructive` actions. */
  readonly confirm?: RegistryRowActionConfirm;
  readonly isDisabled?: (row: TRow) => boolean;
  readonly disabledReason?: (row: TRow) => string | null;
  readonly run: (row: TRow, ctx: RegistryActionContext) => void | Promise<void>;
}

/** Current filters/page/pageSize/sort — the part of page state that lives in the URL. */
export interface RegistryQueryState {
  readonly filters: Readonly<Record<string, string>>;
  readonly page: number;
  readonly pageSize: number;
  readonly sort: RegistrySort | null;
}

export interface RegistryQueryResult<TRow> {
  readonly rows: readonly TRow[];
  readonly total: number;
}

export interface RegistryDataSource<TRow> {
  query: (state: RegistryQueryState) => Promise<RegistryQueryResult<TRow>>;
}

export type RegistryPageStatus = 'loading' | 'success' | 'error';

/** Fetch/render state — the part of page state that does NOT live in the URL. */
export interface RegistryPageState<TRow> {
  readonly status: RegistryPageStatus;
  readonly rows: readonly TRow[];
  readonly total: number;
  readonly error: string | null;
}

export interface RegistryDefinition<TRow = RegistryRow> {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  /** Required so the master table can never show an ambiguous/guessed source badge. */
  readonly source: RegistrySource;
  readonly rowId: (row: TRow) => string;
  readonly columns: readonly RegistryColumn<TRow>[];
  readonly filters?: readonly RegistryFilter[];
  /**
   * TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY — how page/pageSize reach the backend.
   * `server`: page/limit query params; `client`: full list then slice (modules);
   * `fixture`: in-memory demo adapter.
   */
  readonly paginationMode?: RegistryPaginationMode;
  readonly rowActions?: readonly RegistryRowAction<TRow>[];
  readonly expandable?: RegistryExpandable<TRow>;
  readonly defaultSort?: RegistrySort;
  readonly defaultPageSize?: number;
  readonly dataSource: RegistryDataSource<TRow>;
  readonly emptyMessage?: string;
  /**
   * Optional toolbar primary action (e.g. «Создать») — requires no row.
   * TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS.
   */
  readonly createAction?: {
    readonly label: string;
    readonly run: (ctx: RegistryActionContext) => void | Promise<void>;
  };
  /**
   * Cheap synchronous record count for the `/registries` card list.
   * Optional — a future non-fixture registry may only know its total via
   * a real fetch, in which case the card simply omits the count rather
   * than pretending to know it or reusing `dataSource.query` (which would
   * spend a fixture's `failFirstAttempt` before the user ever opens it).
   */
  readonly recordCount?: () => number;
}

/**
 * The one controlled type-erasure boundary in the platform: widens a
 * strongly-typed `RegistryDefinition<TRow>` (authored against a concrete
 * row interface, with compiler-checked column keys/formatters) to the
 * catalog's `RegistryDefinition<RegistryRow>`. Safe because every function
 * on the definition (`format`, `rowId`, filter/action handlers,
 * `expandable.fields`) is only ever invoked with rows produced by that
 * same definition's own `dataSource` — the concrete shape never actually
 * escapes to a mismatched consumer.
 */
export function defineRegistry<TRow>(
  definition: RegistryDefinition<TRow>,
): RegistryDefinition<RegistryRow> {
  return definition as unknown as RegistryDefinition<RegistryRow>;
}

/**
 * TZ-NX-REGISTRIES-MASTER-TABLE-UX — one row of the `/registries` master
 * table. `id` duplicates `key` solely to satisfy `@kppdf/ui/table`'s row
 * identity convention (`_id` / `id`), which the platform's own `key` field
 * doesn't otherwise follow.
 */
export interface RegistryMasterRow {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly source: RegistrySource;
  /** `null` when the registry does not expose `recordCount`. */
  readonly recordCount: number | null;
}
