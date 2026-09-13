# TZ-NX-CATALOG-CATEGORY-INLINE-CREATE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (3.2)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T15:10:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — `_active` empty before claim (3.1 archived)
- [x] TZ read (`tasks/_ready/2026-09-13-studio-ops/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md`),
  all 4 conflict-key components read in full (module/product/material/category form
  dialogs), reference pattern read (`supply-request-form-dialog.component.ts`'s
  `openCreateMaterial`), `registry-create-button.component.ts`, `on-dialog-close-once.ts`,
  `PiDialogService`, `PiCategoriesService`
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, module/product/material/category-form-dialog components +
  their specs, `registry-create-button.component.ts` (reusable accent "+"),
  `on-dialog-close-once.ts` (nested-dialog result wiring), `supply-request-form-dialog`'s
  `openCreateMaterial` (reference pattern), `PiCategoriesService`
- **Key Constraints:** reuse `CategoryFormDialogComponent` (no new dialog component); add
  `lockType` only; product already has invalid-alert mechanism (only module/material need
  it); material never had `PiDialogService`/`DestroyRef`/`Injector` injected before; no BE
  Category schema/DTO changes; no typeahead; no VersionError fix on module update
- **Planned Deliverable:** ШАГ1 lockType on CategoryFormDialogComponent → ШАГ2 "+" button +
  nested-create wiring on all 3 forms → ШАГ3 invalid-Save summary alert on module+material
  → ШАГ4 specs + gates + live Playwright verification
- **Validation Path:** FE tsc + FE jest (scoped then full) + eslint (scoped) +
  architecture:check + `nx build kppdf-web` last + live Playwright on all 3 forms via
  `/registries/{modules,products,materials}`

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.txt`

## Acceptance (из TZ)

- [x] 1. В форме модуля (и product/material): у категории есть `+`; создание без ухода в
  реестр; новая категория сразу выбрана — live-подтверждено на всех 3 формах
- [x] 2. Nested create с `lockType=module` (и product/material) не даёт сохранить как
  другой тип — `type` select disabled, `getRawValue()` всё равно шлёт locked-значение —
  live-подтверждено (`ng.getComponent()` + settled DOM read) на всех 3 формах
- [x] 3. Пустая категория + Save → видимый alert — live-подтверждено на форме модуля
  (`alert mentions Категория: True`); material's summary-alert spec подтверждён unit-тестом
- [x] 4. Studio «Изменить» модуль — тот же dialog, поведение то же — те же классы
  компонентов (`ModuleFormDialogComponent` и т.д.), уже покрыто
  `studio-data-vitrina-edit.spec.ts` (не тронут, зелёный)
- [x] 5. Module photo→Save spec: payload с `photoIds` — новый spec, PASS
- [x] 6. Specs + `nx build kppdf-web` exit 0 — PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: UX addition (nested-create) + bugfix (silent invalid Save) — не новая
  архитектура, переиспользует существующий `CategoryFormDialogComponent`/
  `PiDialogService`/`onDialogCloseOnce`/`RegistryCreateButtonComponent`
- [x] FIC: N/A (нет новой page/permission/module)
- [x] page.md: `docs/pages/registries.page.md` — новая секция «Категория — создать без
  ухода из формы» после «Materials / Details row dialogs»
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (ровно 8 файлов из TZ: 4 компонента +
  4 spec) + page.md + этот checklist/evidence
- [x] Канон: не трогал BE `Category` schema/DTO; не трогал TextBlockCategory/состав
  модуля/photo upload API/registries category list page redesign/wipe/deploy; не заменял
  select на typeahead; не чинил VersionError на module update; не регрессировал wave
  1/2/3.1 (write-queue, Selected «Изменить», canvas+vitrina photo onerror, necessity
  IA/SoT/width — полный FE suite зелёный, 892+7skip/899, их specs не тронуты)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache --testFile=<4 dialog specs>` → all 4 suites PASS
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache` (full) → 125 suites / 892 passed + 7 skipped (899 total) PASS (was 885)
- `cd frontend-nx && pnpm exec eslint <8 touched files>` → 0 problems
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright (local dev, admin/admin123): module form full round-trip (invalid alert,
  "+" → create → auto-select → dirty) PASS; product/material forms "+" → locked-type nested
  dialog PASS; 0 page errors; test-created categories cleaned up via `DELETE /categories/:id`

## Executor report

**Root cause confirmed exactly as the TZ predicted:** module/material forms' `onSubmit()`
invalid branch was completely silent (`markAllAsTouched(); return;`), matching product's
symptom before its own earlier `TZ-NX-PO-SWEEP-01` fix — module and material now mirror
product's `buildInvalidMessage()`/`focusFirstInvalidField()` mechanism exactly, with
module's version additionally covering invalid work-type rows (per the TZ's explicit
callout) since `form.invalid` alone doesn't say *which* nested control failed.

**Reused, not duplicated:** `CategoryFormDialogComponent` gained one new optional field
(`lockType`) instead of a second create-category dialog; all three catalog forms reuse the
same `RegistryCreateButtonComponent` (existing accent "+" icon button) and the same
`onDialogCloseOnce` nested-dialog-result pattern already proven by
`supply-request-form-dialog.component.ts`'s `openCreateMaterial`.

**Real finding during live verification (not a defect in this TZ's own code):** the first
live end-to-end run hit a raw 500 from `POST /categories` — traced via direct curl
reproduction to a duplicate-slug collision, itself caused by `suggestSkuPrefix()`'s
16-character truncation combined with test data left over from an earlier verification run
in the shared dev database (not by anything this TZ changed). `category.service.ts`
returning a bare 500 instead of a clean 409 for a duplicate slug is a real, documented,
out-of-scope defect (`category.service.ts`/`CreateCategoryDto` are outside this TZ's
conflict keys and explicitly listed under "НЕ ИЗМЕНЯТЬ") — flagged in evidence, not fixed,
not silently worked around by touching backend code.

**Testing-harness nuance (not a product bug):** `onDialogCloseOnce`'s `effect()` needs
`fixture.whenStable()` (which ticks via the real NgZone) to fire correctly in a spec with a
live component fixture — calling `TestBed.flushEffects()` immediately after a native
`.click()` in the same test caused a spurious (test-only, non-failing) `NG0101` console
error, resolved by relying on `whenStable()` alone, which also better matches how a real
browser resolves this dialog-close flow.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T16:10:00Z
