# TZ-NX-DETAIL-MATERIAL-BOM checklist

> Status: **DONE**
> Wave: A4 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`
> Marker: none (single-session claim+close)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-08-30T15:35:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable

## What this TZ actually was

Unlike A1–A3 (verify+close already-correct work), this one was genuinely
unfinished: a prior session's `.done.md` for this TZ candidly admitted the
"BOM in `Material.notes` until backend API exists" was a stopgap
(`detail-bom-notes.ts`, `__DETAIL_BOM__:` prefix serialization) — Cursor's
own report called it out as "костыль, не backend composition; не видно в
общем BOM изделия". Confirmed live: 0 real Деталь records in the DB
actually used the notes-hack format, so a clean cutover needed no data
migration.

Built real backend composition for Материал (reused, did not reinvent, the
same `CompositionLine` schema/service/API shape already proven for
Product/ProductModule):

## Backend changes

- `material.schema.ts` — new `composition?: CompositionLine[]` field
- `composition-line.service.ts` — `ParentKind` gains `'material'`;
  `validateReference('material', …)` only accepts `lineType: 'material'`
  refs whose own `materialKind === 'raw'` (Деталь BOM is raw-materials-only,
  matching `docs/architecture/MASTER-CORE.md`'s domain model). Made
  `moduleModel` optional on `CompositionModels` since a material parent
  never touches it.
- `catalog-graph.service.ts` — `getTree()` accepts `kind: 'material'`,
  routed to a new, deliberately **isolated** `buildMaterialTree()` (flat,
  one level, no recursion) — NOT wired through the shared recursive
  `buildNode`/`getChildren` that Product/Module trees use, to keep this
  addition from touching cycle-sensitive shared graph-walking code.
- `material.service.ts` — `getComposition`/`addComposition`/
  `updateComposition`/`removeComposition`, mirroring `product.service.ts`'s
  `findOneAndUpdate` + optimistic-lock-version pattern (Material already
  has `optimisticLockPlugin`), not `product-module.service.ts`'s
  `doc.save()` pattern — Material had no legacy array needing dual-read.
- `material.controller.ts` — `GET/POST/PATCH/DELETE :id/composition` +
  `GET :id/tree`, same `@Roles()` shape as the module composition routes.
- `material.module.ts` — registers `CompositionLineService` as a provider
  (same per-module pattern `ProductModuleModule` already uses).
- No `assertNoCycleAndDepth` call on the material-parent add path: a
  Деталь can only ever contain raw materials (enforced above), and raw
  materials can never carry their own composition, so a cycle through this
  path is structurally impossible — verified this reasoning, not just
  assumed it.

## Frontend changes

- `composition.types.ts` — `CompositionParentKind` gains `'material'`
- `pi-composition.service.ts` — `getMaterialTree`/`getMaterialComposition`/
  `add`/`update`/`removeMaterialCompositionLine`, mirroring the existing
  module/product methods exactly
- `composition-tree.contract.ts` — `allowedLineTypes('material')` →
  `['material']` only; `isMaterialKindAllowedForParent('material', kind)` →
  raw only; `canAddIntoNode` returns `false` for a material root (BOM is
  flat, nothing to drill into)
- `composition-panel.component.ts` — the five places that branched
  module-vs-product (`reload`, `addLine`, `patchLine`, `removeLine`,
  `linesForParent`) were each a bare ternary; converted to five small
  `xFor(kind, …)` dispatch helpers so a missing third case fails loudly
  (TS) rather than silently misrouting a material call to the module or
  product endpoint
- `material-form-dialog.component.ts` — replaced the entire `bomLines`
  FormArray + `PiOverflowSelect` picker + `detail-bom-notes.ts`
  serialization with `<pi-composition-panel parentKind="material"
  [entityId]="id" />`, the exact same component Product/Module use. Deleted
  `detail-bom-notes.ts` (confirmed zero remaining references first)

## Live verification (not just code review)

Direct API (`:3000`), before touching the UI:
- Add a raw material to a Деталь's composition → `201`, correct line stored
- Add a non-raw (`part`) material to a Деталь → `400 "В состав детали можно
  добавлять только сырьё"` (validation correctly rejects it)
- `GET .../tree` after the add → correctly shows the child with resolved
  name/quantity/unit

Through the real browser UI (Playwright, admin session, `/registries/details`):
- Edit dialog shows the real `pi-composition-panel` (`[data-test="detail-bom-composition"]`
  present, `[data-test="detail-bom-add"]` — the old UI's marker — absent)
- Picker shows exactly 1 tab (material-only, matching `allowedLineTypes('material')`)
  and 8 real raw-material catalog options
- Added a raw material through the actual picker flow → network log shows
  `GET composition (200) → POST add (201) → GET composition (200, refreshed)`,
  matching `composition-panel`'s real reload cycle exactly
- Screenshots taken (session scratchpad, not repo) show the composition
  tree section visually identical in chrome/spacing to the Module/Product
  composition panel — genuinely integrated, not bolted on

## Acceptance (wave doc §A4)

- [x] Выбор материала из справочника (dropdown/search) — the real picker,
      not a hand-rolled overflow-select against a hardcoded raw-materials list
- [x] Габариты + описание компактно — unchanged from before this TZ, already correct
- [x] (Beyond the literal checklist, from Cursor's own deeper complaint) BOM
      now lives in real composition data, not text-encoded in `notes` — a
      Деталь's BOM is a first-class, backend-queryable composition, the same
      shape a Product/Module's is

## Explicitly NOT done (disclosed, not silently dropped)

- A Деталь's own raw-material BOM does **not** yet appear as grandchildren
  inside a *Product's* full tree view when that Деталь is used inside a
  Module. The mechanism to do that exists in `catalog-graph.service.ts`
  (`getChildren`'s `if (lineType === 'material') return [];` short-circuit
  would need loosening to recurse into a part-kind material's own
  `composition`), but that touches the SAME shared, cycle-sensitive
  recursive walk every Product/Module tree relies on — different, larger
  blast radius than this TZ's isolated `buildMaterialTree()` addition.
  Deliberately left for a follow-up TZ; noted in `_NOW.md` PARK.
- Did not build a migration script for the old `__DETAIL_BOM__:` notes
  format — confirmed live that 0 real records use it, so none was needed.

## Integrity slot

- [x] Тип изменения: **module** (new backend composition surface on an
      existing entity + frontend wiring; no new route/page)
- [x] FIC §A/§B/§E — N/A. §C (backend module) — new endpoints on an
      existing controller, same auth/role shape as the proven module
      composition routes; no new module registered at the app level
- [x] page.md — N/A, no new route (registries `/details` page unchanged)
- [x] Чужой WIP не в коммите — staged only the 16 files listed below;
      pre-existing uncommitted `module-form-dialog.component.ts` and the
      `pi-products.service`/`product.types` trio (present before this
      session started) left untouched
- [x] Coupling map — N/A

## Gates (factual)

```
Backend:
  pnpm exec tsc -p tsconfig.build.json --noEmit → 0 errors
  pnpm exec jest --silent src/modules/material src/modules/catalog
    → 5 suites, 74/74 tests (incl. new validateReference + getComposition tests)
  pnpm exec jest --silent (full suite) → 117/117 suites, 1092/1092 tests

Frontend:
  pnpm exec nx build kppdf-web → exit 0 (confirmed on a genuinely fresh
    build, not a stale cache hit — see note below)
  pnpm exec nx test kppdf-web → 45/46 suites green. The 1 failure
    (app-shell.component.spec.ts) is a PRE-EXISTING, unrelated regression
    in someone else's uncommitted app-shell.component.ts edit (confirmed
    via `git diff` — I never touched app-shell files). Not this TZ's scope.
  eslint on all 6 touched frontend files → 0 problems

Note on build noise: a `pnpm exec tsc -p tsconfig.base.json --noEmit`
whole-workspace check surfaces dozens of unrelated pre-existing errors
(a stale/incomplete SilentResult-touching edit elsewhere in the tree,
predating this session) and is NOT this project's actual gate — `nx build`/
`nx test kppdf-web` are (per docs/TZ-NX-BUILD-INTEGRITY.md and the
checklist template). One `nx build` run transiently failed on an unrelated
studio-editor.page.ts type error mid-session; a second run moments later
was clean — a live collision with what looks like another concurrent
session editing that file, not a real regression (confirmed via git diff:
that file has a 557-line uncommitted diff I never touched).
```

## Executor report

- What was built: real backend `composition[]` support for Материал
  (Деталь BOM), reusing the exact Product/Module composition
  schema/service/API/UI pattern rather than inventing a new one. Frontend
  now shares ONE composition component across all three parent kinds.
- Known limits: Деталь-in-Product tree nesting not yet visible (see "NOT
  done" above); `@Max()`-style backend clause untested live (no `@Max()`
  field in the touched DTOs).
- Conflict disclosure: this is the largest diff of the four TZs closed
  today (16 files, 2 new composition endpoints, one schema field). Touched
  `composition-panel.component.ts` and `composition-tree.contract.ts`
  again (both already touched by A3's commit `9e6d4ef2`) — additive only
  (new material branches), did not revert or restructure A3's changes.

## Review handoff

- No wave inbox configured; evidence above is the review artifact.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-DETAIL-MATERIAL-BOM.done.md`
- [x] `_NOW.md` synced (DONE list + PARK note for Деталь-in-tree nesting)
- Status = DONE
- closed_at: 2026-08-30T15:52:14Z
