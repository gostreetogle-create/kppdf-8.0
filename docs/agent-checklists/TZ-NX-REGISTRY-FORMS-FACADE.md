# TZ-NX-REGISTRY-FORMS-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-FORMS-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T05:50:23Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (R1/R2 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-REGISTRY-FORMS-FACADE.md`, depends on R2 archived `0e21bfa1`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-FORMS-FACADE.md` на месте

## What changed

Three fat dialogs (734/604/538 LOC) → three separate facades, one per
entity, each `@Injectable()` and component-scoped via its own
`providers: [XxxFacade]` — no mega-facade. Same DI-token pattern as
`RoleFormFacade` (R1): `PI_DIALOG_DATA`/`PI_DIALOG_REF` are injected
directly inside each facade's field initializers (not `@Input()`), so no
`bind()`-host workaround is needed.

- `material-form.facade.ts` (new) ← `material-form-dialog.component.ts`
  (734 → 258 LOC). Moved every signal/computed (`submitting`,
  `errorMessage`, `units`, `categories`, `savedId`, `mode`,
  `materialEntity`, `photoItems`, `mainPhotoId`, `photosUploading`,
  `photoError`, `isDetailForm`, `categoryRequired`, `dialogTitle`,
  `showKindSelect`, `kindOptions`), the `form`/`dimensionsArray`, and every
  method (`invalid`, `fieldError`, `buildInvalidMessage`,
  `openCreateCategory`, `addDimension`, `removeDimension`, `onCancel`,
  `onSubmit`, photo handlers, `loadUnits`, `loadCategories`,
  `patchMaterial`, `hydratePhotos`, `createDimensionGroup`,
  `buildPayload`) as-is.
- `module-form.facade.ts` (new) ← `module-form-dialog.component.ts`
  (604 → 231 LOC). Same shape + work-type signals/methods (`workTypes`,
  `workTypesArray`, `addWorkType`/`removeWorkType`/`moveWorkType`/
  `seedDaysFromCatalog`) and `focusComposition`. `onCancel` (uses
  `confirmDirtyClose`) moved in full — no ViewChild involved.
- `product-form.facade.ts` (new) ← `product-form-dialog.component.ts`
  (538 → 200 LOC). Same shape, incl. `productEntity` (kept public —
  template reads `productEntity()?.isComplex` directly) and the private
  `pendingPhotoIds` bookkeeping set.

**New complication vs. every prior facade this wave (R1 had none of
this):** all three dialogs use `@ViewChild('formEl')` (+ module/product
also `@ViewChild('compositionBlock')` for `ngAfterViewInit`'s
`scrollCompositionBlockIntoView`) for DOM focus/scroll — a `ViewChild`
can only resolve against the *component's own* template, so it cannot
move to a facade. Since `onSubmit()`'s validation branch is otherwise
fully facade-owned (`form.invalid` → `markAllAsTouched` →
`buildInvalidMessage` → **focus the first invalid field**), the one
DOM side effect is bridged via an optional callback parameter:
`facade.onSubmit(onInvalid?: () => void)`, with the component's thin
wrapper supplying `() => this.focusFirstInvalidField()`. Each facade also
exposes a small lookup (`firstInvalidFieldHtmlId()` /
`firstInvalidRequiredFieldHtmlId()` + module's
`firstInvalidWorkTypeIndex()`) so the component's `focusFirstInvalidField`
keeps doing only DOM work (`querySelector`/`scrollIntoView`/`focus`), same
split point as `buildInvalidMessage` (facade) vs. `focusFirstInvalidField`
(component) — REQUIRED_FIELDS itself stayed in the facade since
`buildInvalidMessage` needs it too. `ngAfterViewInit`
(module/product) stays on the component unchanged, reading
`facade.focusComposition()` instead of `this.data.focusComposition`
(same boolean, already signal-wrapped in both the old and new code).

Every remaining member the dialogs previously owned is aliased/delegated
on the component with its **original name** (`protected readonly form =
this.facade.form`, `protected onSubmit() { … }`, etc.) rather than
rewriting templates to `facade.xxx` — this was **load-bearing**, not
stylistic: all three dialogs have dedicated specs that poke internals via
`fixture.componentInstance['form']`/`['onSubmit']`/`['onPhotosSelected']`/
`['onPhotoRemove']`/`['mainPhotoId']` (bracket access) or
`as unknown as {...}` casts (module's work-type tests). Read all three
spec files before writing any facade and cross-checked every such access
against the alias/delegate list — `form` (a `FormGroup` reference) aliases
safely like any other object reference (same identity, unlike the plain
`[(ngModel)]`-bound primitives hit in B2's supply page, which genuinely
needed a spec rewrite); no spec file was touched.

`MaterialFormDialogData`/`ModuleFormDialogData`/`ProductFormDialogData`
interfaces stayed defined in each dialog component file (not the facade),
matching R1's `RoleFormData`/`RoleFormResult` precedent exactly — each
facade imports the type via `import type { … } from './xxx-form-dialog.component'`
(type-only, erased at compile time, no runtime circularity). Confirmed via
grep that `MaterialFormDialogData` is also imported by
`warehouse/storage-put-on-stock-dialog.component.ts` and
`supply-requests/supply-request-form-dialog.component.ts` — keeping the
interface at its original import path avoids touching either file.

## Acceptance

- [x] material/module/product form dialog specs green (3/3 suites, 41/41 tests)
- [x] registries specs that open them green (36/36 suites, 236/243 passed, 7 skipped)
- [x] tsc clean (app tsconfig)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no payload/ACL semantics change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, templates functionally unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (dialogs, no route change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 3 dialog components + 3 new facades + this checklist/tracker/task marker)
- [x] Coupling map — N/A (material/module/product payload semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `npx jest --config apps/kppdf-web/jest.config.ts material-form-dialog.component.spec.ts module-form-dialog.component.spec.ts product-form-dialog.component.spec.ts` → PASS (3/3 suites, 41/41 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="registries"` → PASS (36/36 suites, 236/243 passed, 7 skipped, 0 failed)
- `pnpm architecture:check` → PASS (1524 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (106/106 suites, 741/748 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state и все submit/photo/
lookup методы трёх "толстых" диалогов реестров (material/module/product)
в три отдельных facade — без мега-facade, каждый со своим `providers`.
Новое усложнение по сравнению с R1: все три диалога используют
`@ViewChild` для DOM-фокуса невалидного поля при сабмите; т.к. ViewChild
не переносится в facade, единственный DOM-эффект прокинут через
опциональный callback-параметр `facade.onSubmit(onInvalid?)`, а поиск
"какое поле невалидно" остался в facade (та же граница, что уже была у
`buildInvalidMessage`). Все прежние имена членов диалога сохранены на
компоненте как алиасы/тонкие делегаты — обязательно, т.к. у всех трёх
диалогов есть свои спеки, читающие internals через bracket-access
(`componentInstance['form']` и т.п.); спеки не трогал.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
