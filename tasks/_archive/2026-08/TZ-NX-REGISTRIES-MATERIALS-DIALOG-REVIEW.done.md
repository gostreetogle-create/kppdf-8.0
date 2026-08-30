# TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW — DONE

ARCHIVE_MARKER
outcome: PASS with 2 carried-over BLOCKERs
closed_at: 2026-08-29
closed_by: claude
mode: analysis-only — no product code, config, or task code changed

## Scope and a timing note

`TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS` is now archived DONE. Since this session's own prior
`TZ-NX-REGISTRIES-CATALOG-REVIEW` (which reviewed that work while still in-flight), one further
task — `TZ-NX-REGISTRIES-COMPOSITION-DIALOG.done.md` — has also landed and archived, adding
Module/Product composition dialogs. It is **not** in this review's requested scope, but it touches
two files this review does read (`registries.catalog.ts`, `docs/pages/registries.page.md`), so its
effects are visible here and noted where relevant — it was not itself re-audited in full.

Read in full: all five requested archives, every current file under
`frontend-nx/apps/kppdf-web/src/app/pages/registries/**`, every file under
`frontend-nx/libs/data-access/src/lib/catalog/**`, and `docs/pages/registries.page.md`. Several
core files (`material-registry-dialog-host.ts`, `materials-http-data-source.ts`,
`details.registry.ts`, `registry.types.ts`, `dialogs/material-form-dialog.component.ts`) were
confirmed **byte-identical** to what this session's prior `TZ-NX-REGISTRIES-CATALOG-REVIEW`
already read — used directly as evidence that the findings below were carried into the DONE
archive unchanged, not fixed.

---

## PASS

1. **Materials create/edit/copy/archive map to real endpoints and the real DTO.**
   `PiMaterialsService` (`frontend-nx/libs/data-access/src/lib/catalog/pi-materials.service.ts:50-65`):
   `create` → `POST /materials`, `update` → `PATCH /materials/:id`, `duplicate` → `POST
   /materials/:id/duplicate`, `archive` → `DELETE /materials/:id`. `CreateMaterialPayload`
   (`material.types.ts:65-85`) is a documented mirror of the backend `CreateMaterialDto` field set
   (name/article/unit required; sku/materialKind/assortment/standardRef/materialGrade/weightKg/
   categoryId/description/pricePerUnit/dimensions/colors/notes optional) — `buildPayload()`
   (`dialogs/material-form-dialog.component.ts:388-419`) only ever sets fields from that exact set.
   No invented field names, no missing required field.

2. **Details create/edit/copy/archive reuse the identical, correct machinery.**
   `details.registry.ts:132-133` wires the same `buildMaterialCreateAction`/`buildMaterialRowActions`
   as Materials, with `DETAILS_DIALOG_CONFIG` (`:19-23`: `allowKindSelect: true`, no
   `lockMaterialKind`) — and `MaterialFormDialogComponent.kindOptions()`
   (`dialogs/material-form-dialog.component.ts:249-252`) correctly falls back to `DETAIL_KINDS =
   ['part','fastener','purchased','other']` (`:48`), **excluding `raw`**, so a Details create/edit
   can never accidentally produce a raw material even though the config carries no explicit lock.

3. **Destructive confirmations work correctly.** `archive-material`
   (`material-registry-actions.ts:60-79`) sets `destructive: true` and a real `confirm` block
   (title/description/confirmLabel/cancelLabel); `RegistryDetailPanelComponent.onRowAction`
   (`registry-detail-panel.component.ts:317-337`, unchanged from prior review) routes any action
   with `confirm` through `AlertDialogComponent` before ever calling `run()`. Regression-tested:
   `material-row-dialogs.spec.ts:100-108`.

4. **Error/retry/reload is consistent and complete.** Every write path
   (`create`/`update`/`duplicate`/`archive`) surfaces failure via `extractErrorMessage(res.error)`
   — inline in the dialog for create/edit (`material-form-dialog.component.ts:335-338`), via
   `ctx.notify(..., 'error')` toast for copy/archive (`material-registry-actions.ts:52-55,72-75`,
   both regression-tested: `material-row-dialogs.spec.ts:110-123`). Every success path calls
   `ctx.reload()` (or, for the dialog, closes with the fresh record so the caller's own
   `ctx.reload()` in `material-registry-dialog-host.ts:31-36` fires) so the table always reflects
   the latest state — no stale row after a mutation.

5. **`rowId`/`materialKind` are correct.** `rowId: (row) => row._id` on both `materials.registry.ts:135`
   and `details.registry.ts:47`. Materials is hard-locked server-request-side to `materialKind:
   'raw'` regardless of any filter tampering (`materials-http-data-source.ts:38-39`, tested at
   `materials-registries.spec.ts:46-64`). Details' *selected* filter values are correctly
   round-tripped (`materials-http-data-source.ts:42`, `isDetailMaterialKind` guard prevents an
   invalid/`raw` value from ever reaching the query). The one real problem is the **unfiltered
   default**, tracked as BLOCKER B1 below — a filtering-*correctness* issue, not a `rowId`/identity
   issue.

6. **Material carries zero composition scope, now regression-tested.**
   `dialogs/material-form-dialog.component.ts` has no import of any composition/tree/panel symbol.
   `material-row-dialogs.spec.ts:51-60` explicitly asserts
   `expect(ids).not.toContain('open-composition')` on the Materials registry's row actions —
   this boundary is no longer just "true by omission," it is now a real regression guard.

7. **No dead buttons.** Every rendered control (toolbar create, and all four row actions per row)
   resolves to a real handler with a real effect, traced individually above and in BLOCKER/P
   sections below. `RegistryDetailPanelComponent` only renders the create button when
   `definition().createAction` is set and row actions only when present — no permanently-inert
   control exists.

8. **Paper & Ink discipline holds; no raw colors or box-shadow.** Scanned
   `dialogs/material-form-dialog.component.ts`, `registry-detail-panel.component.ts`,
   `registries-page.ts` for hex literals, `box-shadow`, and non-token Tailwind arbitrary values —
   none found. All spacing/color classes are semantic tokens (`text-ink`, `text-destructive`,
   `text-muted-foreground`, `pi-input`, `hairline` via `app-pi-form-section`, `gap-form-field`).

9. **No backend or legacy (`frontend/**`) changes.** `git status --short -- backend frontend
   package.json` shows only pre-existing, unrelated diffs (auth module/rbac-contract/unit.service
   under `backend/`, doc-constructor studio files under `frontend/`, `package.json`) — the exact
   same baseline present before any registries work in this session started. Nothing in the
   Materials/Details dialog work touched `backend/**` or `frontend/**`.

10. **Documentation now accurately describes the shipped feature.** `docs/pages/registries.page.md`
    §"Materials / Details row dialogs (TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS)" (lines 130-136)
    correctly documents `createAction`, the unified `MaterialFormDialogComponent`, its exact field
    list, the `raw`-lock vs kind-select split, and the real copy/archive endpoints. This resolves
    the doc-staleness gap this session's prior `TZ-NX-REGISTRIES-CATALOG-REVIEW` flagged as P1-1
    (that update evidently landed via the intervening `TZ-NX-REGISTRIES-COMPOSITION-DIALOG` task's
    own doc pass, not a dedicated fix, but the result is correct either way).

11. **Master-table expand behavior, `/constructor` retention, and accessibility base contract**
    (focus trap, `role="dialog"`, keyboard-reachable rows) are all unchanged from the already-
    reviewed platform baseline — re-confirmed, no regression from the dialog work.

---

## BLOCKER (carried over from `TZ-NX-REGISTRIES-CATALOG-REVIEW`, not fixed)

### B1 — «Детали» registry's default/"Все" filter state still silently queries `materialKind=part`
### only, contradicting its own UI and (partially) its own docs

**Status: unchanged.** `materials-http-data-source.ts:40-43` — confirmed byte-identical to the
version reviewed previously:
```ts
} else {
  const filterKind = state.filters['materialKind'];
  materialKind = isDetailMaterialKind(filterKind) ? filterKind : 'part';
}
```
Clearing the kind filter, or never touching it (first load), still sends `GET
/materials?materialKind=part` — never "part OR fastener OR purchased OR other." The filter's own
"Все" option (`registry-detail-panel.component.ts:119`, unchanged) still reads as "show
everything," and still doesn't. This remains **deliberate and tested**
(`materials-registries.spec.ts:66-78`), rooted in a genuine backend limitation
(`MaterialController`/`MaterialService.findAll` only accept one exact-match `materialKind`, no
`$in`/`$ne`).

**What changed since the last review:** `docs/pages/registries.page.md:114` now reads *"`details`
| Детали | `api` (тот же `/materials`, `materialKind≠raw`)"* — slightly more compact than before but
still states the "≠raw" (all four kinds) claim without the "defaults to part" caveat. The
compact §"Materials / Details row dialogs" section (line 134: *"Details: выбор kind
(part/fastener/purchased/other)"*) doesn't claim a combined default view either way, so the
overclaim is now narrower (confined to the one registry-matrix table cell) but still present.

**Still a BLOCKER, not a P1, because:** it is the top-row master-data browsing tool for exactly the
non-raw catalog leaf kinds, and an operator relying on "Детали" + cleared filter to mean "all
details" will silently miss 3 of 4 kinds — a data-integrity-adjacent UX risk, not merely cosmetic.

### B2 — Registry dialogs still cannot auto-close on navigation (root-scoped `DestroyRef`/`Injector`),
### and the same pattern has since spread to Modules/Products

**Status: unchanged for Materials/Details**, confirmed byte-identical:
`material-registry-dialog-host.ts:17-21` still receives `destroyRef`/`injector` as constructor
params, and `registries.catalog.ts`'s `REGISTRIES_CATALOG` factory
(`providedIn: 'root'`, lines 80-107) still does:
```ts
factory: () => {
  const router = inject(Router);
  const materialDialogHost = createMaterialRegistryDialogHost(
    inject(PiDialogService),
    inject(DestroyRef),   // ← still root-scoped
    inject(Injector),
  );
  ...
```
Every `MaterialFormDialogComponent` opened via this host still uses that one root-scoped
`parentDestroyRef` for its entire application lifetime — a dialog opened from `/registries` still
will not auto-close if the user navigates away without explicitly closing it first (Cancel/Save/X;
ESC and backdrop-click *do* still work, since those don't depend on `parentDestroyRef` at all).

**New evidence this session that the risk was real, not theoretical:** the same
`registries.catalog.ts` factory (lines 91-95) now **also** builds a second dialog host,
`createCatalogRegistryDialogHost`, for Modules/Products (`catalog-registry-dialog-host.ts`,
landed via the out-of-scope `TZ-NX-REGISTRIES-COMPOSITION-DIALOG` task), constructed the **exact
same way** — `inject(DestroyRef)`/`inject(Injector)` inside the same root factory
(`registries.catalog.ts:91-95`). This confirms the prior review's explicit warning ("do not copy
this pattern... until B2 is fixed") was not seen or not acted on before the second host was built
— the orphaned-dialog risk now exists for four dialog types (Material create/edit, Module
create/edit, Product create/edit) instead of two. (That second host is out of this review's
requested scope and was not otherwise re-audited; noted here only as corroborating evidence for
why B2 should not wait any longer.)

**Recommendation, unchanged:** stop building the dialog host(s) once inside the root
`REGISTRIES_CATALOG` factory. Either inject `DestroyRef`/`Injector` inside
`RegistryDetailPanelComponent` (already destroyed/recreated per registry switch) and pass those
down at the point a dialog is actually opened, or have the host's `open*` methods accept a
per-call `DestroyRef` instead of a constructor-time one.

---

## P1

### P1-1 — `patchMaterial()` still re-writes a just-locked, just-disabled `materialKind` control

**Status: unchanged.** `dialogs/material-form-dialog.component.ts:276-287` — `ngOnInit` locks
`materialKind` to `lockMaterialKind` and disables the control, then unconditionally calls
`patchMaterial(this.data.material)` when editing, which itself patches `materialKind` again from
`m.materialKind` (with a `'part'` fallback). Still harmless in practice today (a Materials-registry
row's `materialKind` is always already `'raw'`), still fragile for the reason previously noted:
`getRawValue()` (used in `buildPayload()`) includes disabled-control values, so if this dialog is
ever reused for a row whose kind could genuinely differ from the intended lock, the lock would be
silently overridden by whatever the row happens to already have. Recommend re-applying the lock
*after* `patchMaterial()`, or skipping the `materialKind` key inside `patchMaterial()` whenever a
lock is active.

### P1-2 — `docs/pages/registries.page.md` "Детали" row still says `materialKind≠raw` without the
### "defaults to part" caveat

Part of B1's blast radius but worth its own line item since it's a pure one-sentence docs fix,
independent of whichever UI/backend fix is chosen for B1 itself: `registries.page.md:114`.

---

## P2

### P2-1 — Icon-only "×" remove-dimension button still has no `ariaLabel`

**Status: unchanged.** `dialogs/material-form-dialog.component.ts:204`:
```html
<app-pi-button type="button" variant="destructive" size="icon" (click)="removeDimension(i)">×</app-pi-button>
```
`ButtonComponent.ariaLabel` exists precisely for this case and is unused here. A screen reader
announces only "×". Cheap fix: `[ariaLabel]="'Удалить размер ' + (i + 1)"`.

### P2-2 — Minor duplicated helper: `detailActionDeps` vs `materialActionDeps`

**Status: unchanged.** `details.registry.ts:25-32` and `materials.registry.ts:112-119` remain
byte-identical 4-field pass-throughs; `details.registry.ts` already imports
`type MaterialRegistryDeps` from `materials.registry.ts` and could import/reuse
`materialActionDeps` directly instead of redefining it.

### P2-3 — No dedicated a11y assertion for the toolbar create button or the dialog's own form-field
### labelling, beyond functional coverage

**Status: unchanged.** `registries-a11y.spec.ts` still predates `createAction` and doesn't cover
it or the new dialog; `registry-detail-panel.component.spec.ts:87-102` and
`material-row-dialogs.spec.ts` cover *behavior* (button click → `run()` fires; actions map to real
calls) but not accessible-name/focus-order assertions specifically. Low priority — fold into
whichever TZ next touches these files.

### P2-4 (new, visual) — Dimension "type" dropdown can silently produce a duplicate row past 6 types

`addDimension()` (`dialogs/material-form-dialog.component.ts:303-307`) falls back to `'length'`
once all 6 `DIMENSION_TYPES` are already used, letting a user add a 7th, duplicate-type row purely
client-side; the backend's own `assertUniqueDimensionTypes` (`MaterialService.create/update`) will
reject it with a clear RU error on Save, so nothing is silently lost — but the dialog could disable
"+ Добавить размер" once all 6 types are present, or grey it out, to avoid the round-trip. Purely
cosmetic; noted as a visual rough edge for the next Cursor prompt, not a functional defect.

---

## Mandatory fixes (do before this pattern spreads further / before wider rollout)

1. **B2** — stop capturing `DestroyRef`/`Injector` once inside the root `REGISTRIES_CATALOG`
   factory for *both* `material-registry-dialog-host.ts` and (even though out of this review's
   formal scope) `catalog-registry-dialog-host.ts`. This is the higher-priority of the two BLOCKERs
   because it now affects four dialog types, not one, and a fix to the pattern should be applied
   uniformly rather than patched twice.
2. **B1** — pick one of: (a) a small backend TZ adding `materialKind[$in]`/`$ne` support to `GET
   /materials` so "Детали" can genuinely default to "all non-raw"; or (b) stop the UI/docs from
   claiming "Все" — rename the cleared-filter state's implied meaning and correct
   `registries.page.md:114` (P1-2) to state the real default plainly. Either is acceptable; leaving
   the current mismatch as-is is not.
3. **P1-1** — re-apply the `materialKind` lock after `patchMaterial()` (or skip the field in
   `patchMaterial()` under a lock) — a two-line change, cheap enough to bundle with whichever TZ
   next touches this file.

## Can defer

- **P2-1** (missing `ariaLabel` on the "×" button) — real but low-severity; fold into any future
  touch of this file.
- **P2-2** (duplicated `detailActionDeps`/`materialActionDeps` helper) — pure style, zero behavior
  risk.
- **P2-3** (a11y test coverage gap for the create button/dialog) — functional coverage already
  exists; the gap is only in dedicated accessibility assertions.
- **P2-4** (dimension dropdown allows a 7th duplicate-type row) — backend already rejects it
  cleanly; UI-only polish.

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW.md` — Integrity slot filled,
status DONE.
