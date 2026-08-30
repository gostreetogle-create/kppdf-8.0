# TZ-NX-REGISTRIES-CATALOG-REVIEW — DONE

ARCHIVE_MARKER
outcome: PASS with 2 BLOCKERs
closed_at: 2026-08-29
closed_by: claude
mode: analysis-only — no product code, config, or task code changed

## Scope and a timing note

Independent review of the current Registry Platform, requested before extending
create/edit/copy/archive dialogs to Materials/Details. **At review time, that extension is
already substantially in progress**: `tasks/_active/TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS.md` is
an active claim (agent_id: `cursor`), and `frontend-nx/apps/kppdf-web/src/app/pages/registries/`
already contains working, tested code beyond what either archived read-only TZ describes:
`data/material-registry-actions.ts`, `data/material-registry-dialog-host.ts`,
`dialogs/material-form-dialog.component.ts`, plus updates to `registry.types.ts`,
`registry-detail-panel.component.ts`, `materials.registry.ts`, `details.registry.ts`,
`registries.catalog.ts`, and their specs. This review reports on that **current, real state** —
not a hypothetical pre-dialog snapshot — since that is what will actually ship next. This is a
read-only review; nothing under `frontend-nx/**` was modified by this task, only read.

Read in full: both prior read-only archives, this session's own prior
`TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md`, every file currently under
`frontend-nx/apps/kppdf-web/src/app/pages/registries/**`, every file under
`frontend-nx/libs/data-access/src/lib/catalog/**`, and both named docs pages.

---

## PASS

1. **Modules and Products are genuinely visible in the master table.**
   `registries.catalog.spec.ts:78-89` asserts the catalog builds exactly
   `['units','materials','details','modules','products','departments']` with `modules`/`products`
   both `source: 'api'` (`:91-96`); `registries-page.ts`'s `masterRows` maps `this.catalog` 1:1 into
   master-table rows — there is no filtering step that could hide them.

2. **API/data-source mapping is correct and honest per registry:**
   - `materials`/`details` → `GET /materials` via `PiMaterialsService.list()`
     (`materials-http-data-source.ts:47-54`), matching the real `MaterialController.list` query
     params (`page,limit,search,categoryId,materialKind`).
   - `modules` → `GET /modules` via `PiModulesService.list()` (`modules-http-data-source.ts:29`) —
     no query params sent beyond the optional `productId` the endpoint actually supports
     (`product-module.types.ts:26-28`).
   - `products` → `GET /products` via `PiProductsService.list()`
     (`products-http-data-source.ts:48-56`), with sort explicitly allowlisted to the four fields
     the backend actually accepts (`name,sku,listPrice,createdAt` —
     `products-http-data-source.ts:15-20`, matching `product.types.ts:69`).

3. **No imitated pagination.** `modules-http-data-source.ts:8-17,24-38` explicitly slices
   client-side (`sliceClientPage`) and both the module comment (`:20-23`) and the registry's own
   user-facing description (`modules.registry.ts:24-25`: *"Backend отдаёт полный список без
   пагинации — страницы в UI нарезаются на клиенте"*) disclose this honestly. No fake `page`/`limit`
   params are ever sent to `GET /modules`.

4. **`isComplex` is not invented.** `ProductRow` types it as optional
   (`products-http-data-source.ts:13`: *"may include isComplex when the API sends it (detail-only
   today)"*), and `formatComplexBadge` (`product-formatters.ts:30-32`) renders `'—'` unless the API
   literally sent `true`. No `?isComplex=` query parameter exists anywhere in
   `products-http-data-source.ts` or `pi-products.service.ts`.

5. **`_id` is the catalog identity everywhere.** `Product`, `Material`, `ProductModule`
   (`product.types.ts:16`, `material.types.ts:24`, `product-module.types.ts:11`) all declare
   `_id: string`; every registry's `rowId: (row) => row._id`
   (`materials.registry.ts:135`, `details.registry.ts:47`, `modules.registry.ts:27`,
   `products.registry.ts:42`). No registry uses `key`/`slug`/anything else for these entities —
   `key` remains reserved for the `units` registry's own slug identity, correctly kept separate.

6. **Materials registry filters correctly.** `materials-http-data-source.ts:38-39` hard-codes
   `materialKind = 'raw'` for `mode === 'materials'` regardless of any stray filter value — a
   Materials-registry request can never leak non-raw rows. Confirmed by its own test
   (`materials-registries.spec.ts:46-64`, *"materials mode always requests materialKind=raw"*).

7. **No dead buttons.** Every row action and the new toolbar create button resolves to a real
   handler with a real backend call or dialog open — traced individually in §4 below. The button
   rendering itself is also unconditional-but-correct: `RegistryDetailPanelComponent` only renders
   the create button when `definition().createAction` is set (`registry-detail-panel.component.ts:128`)
   and row actions only when `rowActions?.length` (`:201`) — no permanently-disabled or
   permanently-inert control exists in the reviewed code.

8. **Material dialog scope is cleanly separated from composition.** `MaterialFormDialogComponent`
   (`dialogs/material-form-dialog.component.ts`) imports and renders only passport sections
   (Основные данные / Справочные поля / Описание / Габариты) — **zero** references to
   `CompositionTree`, `BomPanel`, `CompositionLine`, or any picker anywhere in the file. This is
   architecturally correct: `Material` is a composition leaf and must never be a composition parent
   (per the locked decision in `TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md` and this session's
   prior composition audits) — the dialog respects that boundary exactly.

9. **Master-table expand behavior unchanged, no regression.** `RegistryDetailPanelComponent`'s
   `expandedRowId` signal, `onRowToggleExpand`, and `expandedRowWhenFn`
   (`registry-detail-panel.component.ts:225-236,311-315`) are byte-for-byte the same logic already
   documented in `docs/pages/registries.page.md:43-50` — the new `createAction` toolbar button
   (`:128-140`) was inserted as a sibling block, not woven into the expand logic, so it carries no
   risk of breaking "exactly one row expanded at a time."

10. **`/constructor` has not been removed**, and is still the *only* row action available for
    `modules`/`products` (`buildOpenConstructorRowAction`, still the sole entry in
    `modules.registry.ts:75-78` and `products.registry.ts:125-128`) — consistent with this
    session's own prior audit recommendation to keep it until Modules/Products get their own
    dialogs.

11. **Paper & Ink token discipline held** in the new dialog: `text-ink`, `text-destructive`,
    `pi-input`, `hairline` (implicit via `app-pi-form-section`), `gap-form-field` — no raw hex, no
    arbitrary box-shadow, consistent with every other reviewed NX file this session.

---

## BLOCKER

### B1 — «Детали» registry's default (unfiltered) view silently shows only `materialKind=part`,
### not "all non-raw" as its own UI and docs claim

**Evidence:** `materials-http-data-source.ts:40-43`:
```ts
} else {
  const filterKind = state.filters['materialKind'];
  materialKind = isDetailMaterialKind(filterKind) ? filterKind : 'part';
}
```
When no `materialKind` filter is set (the registry's default, first-load state, and also what
selecting the filter's own **"Все"** option produces — `registry-detail-panel.component.ts:119`:
`<option value="">Все</option>`), the query sent to `GET /materials` is
**`materialKind=part`** — not "no `materialKind` param" and not any way of expressing "part OR
fastener OR purchased OR other." This is confirmed **deliberate and already tested**
(`materials-registries.spec.ts:66-78`, test name *"details mode uses materialKind filter and
defaults to part"*; `resolveMaterialsListKind` test at `:134`: `resolveMaterialsListKind('details',
{})` → `'part'`) — root cause is a real backend limitation: `MaterialController.list` /
`MaterialService.findAll` only accept a single exact-match `materialKind` value
(`material.service.ts:54`: `if (q.materialKind) filter.materialKind = q.materialKind;`), with no
`$ne`/`$in` support, so "show all four non-raw kinds in one request" is not currently possible
without a backend change.

**Why this is still a BLOCKER, not just an accepted tradeoff:** both the registry's own filter UI
and the written documentation actively **overclaim** what actually happens:
- The filter's "Все" option (`registry-detail-panel.component.ts:119`) reads as "show everything,"
  but selecting it (i.e., clearing the filter) narrows the view to `part` only — the opposite of
  what "Все" promises.
- `docs/pages/registries.page.md:114`: *"`details` | Детали | `api` (`GET /materials`,
  `materialKind≠raw`)"* and the registry's own `description` field
  (`details.registry.ts:44-45`): *"с materialKind ≠ raw"* — both describe a `≠ raw` (all four
  kinds) view that the code does not actually deliver by default.
- An operator opening "Детали" for the first time, seeing rows, and not noticing the kind filter
  defaults to a specific value would reasonably (and wrongly) conclude they are looking at the
  complete list of non-raw materials — a real risk for a *registry*, whose entire purpose is being
  a trustworthy "shelf of saved records" (per this session's own prior architecture-decision doc's
  framing).

**Recommendation:** either (a) request a small backend change adding `materialKind[$in]=` or
`materialKind[$ne]=raw` support to `GET /materials`, and have the "Детали" data source send that
by default, or (b) — if (a) is out of scope for now — stop calling the cleared state "Все": relabel
the option/require an explicit kind selection, and correct both the registry `description` and
`docs/pages/registries.page.md` to say plainly "по умолчанию показывает вид «Деталь»; выберите вид
в фильтре, чтобы увидеть метизы/покупное/прочее" so the UI stops promising something the backend
cannot deliver. Do **not** ship this to a wider audience with the current "Все" label unchanged.

### B2 — Registry create/edit dialogs cannot auto-close when their opening context is destroyed
### (root-scoped `DestroyRef`/`Injector` misuse)

**Evidence:** `registries.catalog.ts:77-98` — `REGISTRIES_CATALOG` is an `InjectionToken` with
`providedIn: 'root'`, and its `factory` does:
```ts
factory: () => {
  const router = inject(Router);
  const dialogHost = createMaterialRegistryDialogHost(
    inject(PiDialogService),
    inject(DestroyRef),
    inject(Injector),
  );
  return buildRegistriesCatalogDefault(/* ... */);
},
```
Because this is a root-provided singleton, its factory executes **once**, in the **root
EnvironmentInjector's** context — `inject(DestroyRef)` and `inject(Injector)` here resolve to the
**application root's** destroy lifecycle, not any component's. That single root-scoped pair is
captured in `createMaterialRegistryDialogHost`'s closure
(`material-registry-dialog-host.ts:17-21`) and reused for **every** subsequent `openCreate`/
`openEdit` call, for the lifetime of the app:
```ts
const ref = dialog.open<Material | null | undefined>(MaterialFormDialogComponent, {
  data,
  parentDestroyRef: destroyRef,   // ← root DestroyRef, always the same instance
});
```
`PiDialogService.open()`'s entire reason for accepting `parentDestroyRef`
(`pi-dialog.service.ts`, documented as TZ-103.2: *"the caller is destroyed (e.g. tab-switch) → the
service programmatically closes the dialog"*) is to auto-close a dialog when the page/component
that opened it goes away. With a root-scoped `DestroyRef`, `onDestroy()` will not fire until the
**entire application** is torn down (full page unload) — never during ordinary SPA navigation.

**Concrete failure scenario:** an operator opens "Создать материал" on `/registries/materials`,
then clicks a different header-nav category (e.g. "Модули" or "Каталог") without closing the
dialog first. The underlying `/registries` page navigates away and
`RegistryDetailPanelComponent`/`RegistriesPage` are destroyed, but the open
`MaterialFormDialogComponent` overlay is **not** auto-closed (unlike every legacy dialog call site
this session reviewed, which all pass a genuine component-scoped `this.destroyRef`) — it remains
floating over whatever page loaded next until the user manually cancels/saves/Escapes it.

**Recommendation:** do not build the dialog host once inside the root `REGISTRIES_CATALOG`
factory. Either (a) inject `DestroyRef`/`Injector` inside `RegistryDetailPanelComponent` itself
(which is already destroyed/recreated per registry per the page's own documented behavior,
`docs/pages/registries.page.md:74-82`) and pass those down at the point the dialog is actually
opened, rather than baking a single pair into the catalog-wide dialog host; or (b) have
`MaterialRegistryDialogHost.openCreate`/`openEdit` accept a fresh `DestroyRef` as a per-call
argument instead of a constructor-time one. This is a real bug to fix **before** the same
`createMaterialRegistryDialogHost` pattern is copied for Modules/Products dialogs, so it doesn't
propagate.

---

## P1

### P1-1 — `docs/pages/registries.page.md` does not yet document the row-dialogs feature at all

**FACT, not really a defect** — expected, since `TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS` hasn't
archived yet. But calling it out explicitly so it doesn't get missed at closeout: the "Registries"
table (`registries.page.md:108-118`) still describes `materials`/`details` exactly as they were
after `TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ` (read-only), with no mention of `createAction`,
"Редактировать"/"Копировать"/"Архивировать" row actions, or the new dialog component. Whoever
closes the row-dialogs TZ needs to update this table (and correct the `materialKind≠raw`
overclaim per B1) as part of that closeout — this review found it stale, not broken.

### P1-2 — Minor duplicate helper: `detailActionDeps` vs `materialActionDeps`

`details.registry.ts:25-32` (`detailActionDeps`) and `materials.registry.ts:112-119`
(`materialActionDeps`) are byte-identical 4-field pass-through functions. Not a bug, but
`details.registry.ts` could simply import and reuse `materialActionDeps` from
`materials.registry.ts` (it already imports `type MaterialRegistryDeps` from there) instead of
redefining the same mapping — a one-line cleanup, safe to fold into the row-dialogs TZ's own
closeout diff rather than a separate task.

### P1-3 — `patchMaterial()` writes `materialKind` into a control that `ngOnInit` just locked+disabled

**Evidence:** `dialogs/material-form-dialog.component.ts:277-288` — for a locked-kind (Materials
registry) edit, `ngOnInit` first does
`this.form.controls.materialKind.setValue(this.data.lockMaterialKind); .disable();`, then
unconditionally calls `this.patchMaterial(this.data.material)` (when editing), which itself does
`form.patchValue({ materialKind: m.materialKind && MATERIAL_KINDS.includes(m.materialKind) ?
m.materialKind : 'part', ... })` — overwriting the just-set/just-disabled value a second time.
In practice this is harmless *today* because a Materials-registry row's `materialKind` is always
already `'raw'` (the list is server-filtered to `raw`), so the patched value coincidentally matches
the locked one. But the logic is fragile: if this dialog is ever reused for a row whose
`materialKind` could legitimately differ from the lock (e.g. a future "fix a bad legacy row" tool),
the disabled control would silently end up showing/submitting the *row's actual* kind instead of
the intended locked one, since `getRawValue()` (used in `buildPayload()`,
`material-form-dialog.component.ts:389`) includes disabled-control values. Recommend re-applying
the lock *after* `patchMaterial()`, not only before it, or having `patchMaterial()` skip
`materialKind` entirely when a lock is active.

---

## P2

### P2-1 — Icon-only "×" remove-dimension button has no `ariaLabel`

**Evidence:** `dialogs/material-form-dialog.component.ts:205`:
```html
<app-pi-button type="button" variant="destructive" size="icon" (click)="removeDimension(i)">×</app-pi-button>
```
`ButtonComponent` has an `ariaLabel` input specifically documented for icon-only buttons
(*"Set when content is purely icon"*), but it isn't used here — a screen reader announces this
control only as "×" (or "multiplication sign"), with no indication of what it removes or which
dimension row it belongs to. Low severity (sighted/mouse users are unaffected, and the row's own
labelled fields give context visually), but a real, cheap-to-fix accessibility gap — e.g.
`[ariaLabel]="'Удалить размер ' + (i + 1)"`.

### P2-2 — No dedicated accessibility spec exercises the new create-toolbar button or the new dialog

`registries-a11y.spec.ts` (read in full) predates the `createAction` feature and only covers the
master table + the generic detail-panel filters/table/row-action-confirm flow. A functional test
for the create button does exist (`registry-detail-panel.component.spec.ts:87-102`), so the
*behavior* is covered — but nothing asserts its accessible name, focus order, or that
`MaterialFormDialogComponent`'s own form fields are properly labelled end-to-end (beyond what
`PiFormFieldComponent` guarantees generically elsewhere). Recommend folding one or two assertions
into the row-dialogs TZ's own test suite rather than opening a separate task for it.

### P2-3 — "Копировать" always duplicates with the source's exact `materialKind`; no registry-level
### guard against a surprising cross-registry reappearance

Duplicating a "raw" Material via the Materials registry's "Копировать" action produces another
`raw` row (confirmed: `material.service.ts`'s `duplicate()` copies `materialKind` — not in its
exclusion list), so the copy correctly reappears in the same registry after `ctx.reload()`. This is
correct today, but purely because both registries currently share the one "Копировать" handler
with no kind-aware post-check. Not a bug — noting only so a future contributor doesn't assume the
handler enforces anything about the resulting kind; it doesn't, it relies entirely on the backend
preserving the field.

---

## What to add to the next Cursor prompt

1. **Fix B1** — either request/land a backend `materialKind[$in]`/`$ne` filter TZ so "Детали"
   can genuinely default to "all non-raw," or (faster) relabel the cleared-filter state so it no
   longer claims "Все" while actually querying `materialKind=part`, and correct both
   `details.registry.ts`'s `description` and `docs/pages/registries.page.md:114` to state the real
   default behavior plainly.
2. **Fix B2** — move `DestroyRef`/`Injector` acquisition for the material dialog host out of the
   root `REGISTRIES_CATALOG` factory (`registries.catalog.ts:81-96`) and into a per-open-call or
   per-component-lifetime source, so `parentDestroyRef` actually protects against orphaned dialogs
   on navigation. Add a test that opens a create/edit dialog, destroys the hosting component, and
   asserts the dialog closed — this is exactly the kind of regression the current test suite cannot
   catch (all existing dialog-host tests mock the DestroyRef/Injector rather than exercising real
   component destruction).
3. Fold in **P1-2** (dedupe `detailActionDeps`/`materialActionDeps`) and **P1-3** (re-apply the
   `materialKind` lock after `patchMaterial()`, or skip patching it under a lock) as small diffs in
   the same close-out commit — both touch files this TZ is already editing.
4. **Update `docs/pages/registries.page.md`** (P1-1) at closeout: document the new `createAction`
   field, the four material row actions (Редактировать/Копировать/Архивировать + existing
   «Открыть в Конструкторе»), and correct the `materialKind≠raw` claim per B1's resolution.
5. Add the two cheap accessibility fixes from **P2-1**/**P2-2** if time allows in the same pass —
   not blocking, but free while the file is already open.
6. **Do not** copy `createMaterialRegistryDialogHost`'s current construction pattern verbatim for
   a future Modules/Products dialog host until B2 is fixed — otherwise the same orphaned-dialog bug
   ships twice.

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRIES-CATALOG-REVIEW.md` — Integrity slot filled, status
DONE.
