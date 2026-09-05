# TZ-NX-MODULE-WT-DAYS-SOT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-MODULE-WT-DAYS-SOT.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T13:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — S TZ уже закрыт и запушен, конфликтов нет
- [x] TZ / канон / deps (S TZ DONE first) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-MODULE-WT-DAYS-SOT.md` на месте

### Preflight Check Output
- **Context read:** `backend/src/modules/product-module/product-module.schema.ts`, `product-module.service.ts`, `product-module.service.spec.ts`, `frontend-nx/libs/data-access/src/lib/catalog/product-module.types.ts`, `.../work-type.types.ts`, `module-form-dialog.component.ts(+.spec.ts)`, `work-type-form-dialog.component.ts`, `production-read.facade.ts(+.spec.ts)`, `production-cockpit.page.ts(+.write.spec.ts)`, `blocks/gantt-bars.component.ts`, `blocks/order-inspector.component.ts`, `docs/pages/modules.page.md`, `docs/pages/work-types.page.md`, `docs/COUPLING-MAP.md`
- **Key Constraints:** Person/workTypeIds payload untouched (S-TZ scope); `estimatedHours` stays cost-only; `Order.estimateDayOverrides` write path untouched; no destructive migration/backfill of existing modules
- **Planned Deliverable:** `ModuleWorkTypeSchema.days` (BE binding SoT) → data-access types → module form «Дней» field with catalog seed-on-select → facade read order binding→catalog→populated → WorkType form label «Дней по умолчанию» → remove Gantt work-detail catalog-days button (option A, PO-canon default for the exact bug this TZ fixes) → docs SoT lines
- **Validation Path:** backend product-module unit tests + tsc; frontend-nx module-form-dialog / production-read.facade / production-cockpit.page.write jest + `nx build kppdf-web`

**Проверено:** каталог `WorkType.days` больше не единственный источник длительности Ганта; module↔workType binding побеждает, каталог — только fallback/seed. Resize остаётся order-scoped (`estimate-days`), не тронут.

---

## Acceptance (из TZ)

- [x] Модуль A: сварка 4д; модуль B: сварка 1д — разные бары на Ганте при одном WorkType, без order override (backend/facade specs)
- [x] Resize бара заказа → только estimate-days; WorkType.days не меняется (не тронут write path; каталог-кнопка удалена совсем — не может больше писать WorkType из Ганта)
- [x] Форма человека без `Nд` (S-TZ, уже DONE и запушено)
- [x] WorkType form: label «Дней по умолчанию» — seed, не «срок операции везде»
- [x] Gates (см. ниже)
- [x] Archive + GEMINI.md closeout

## Integrity slot

- [x] Тип изменения: module (backend schema/service field) + page (module/work-type dialogs, Gantt work-detail)
- [x] FIC: не требует нового route/permission/MCP — существующие CRUD/страницы расширены полем; N/A для §B/§E
- [x] page.md: `modules.page.md` + `work-types.page.md` обновлены (SoT-строка + TZ reference row); `production-cockpit.page.md` — историческая простыня, не в CONFLICT KEYS, не тронута (оставлено PO/Cursor при следующей волне production docs, если понадобится)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур, только поле существующей сущности
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены; Orders hub tray / order-hub-tray НЕ тронуты
- [x] COUPLING-MAP: обновлена строка «Gantt bar days SoT» (уже была заготовлена волной; уточнена ссылка на удалённую catalog-кнопку)
- [x] Канон: `docs/DOCS-INTEGRITY.md` соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → PASS (перед S TZ, унаследовано)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS (no errors)
- `cd backend && pnpm test -- product-module` → PASS (2 suites, 18 tests)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (typecheck+bundle, only pre-existing warnings: studio nullish-coalescing, gantt-bars style budget)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full project — testPathPattern regex got shell-mangled into a broad alternation twice, so ran the whole suite both times; used as the closing signal) → PASS: 80 suites, 521 passed / 7 skipped, 0 failed. Covers `module-form-dialog`, `production-read.facade`, `production-cockpit.page.write`, `worker-form-dialog`.

## Executor report

**Backend:**
- `ModuleWorkTypeSchema.days?: number|null` (default null) — binding-level Gantt SoT.
- `WorkTypeInModuleDto.days`; `normalizeWorkTypeDays()` — null/absent passthrough, throws `BadRequestException` if set and < 1; wired into both `create`/`toPersistence` and `update` mapping.
- Tests: persist on create, default-null when omitted, reject <1, update path.

**Frontend data-access:**
- `WorkTypeInModule.days` (read) and `ProductModuleWorkTypePayload.days` (write) added to `product-module.types.ts`.

**Module form dialog:**
- New «Дней» field per work-type row; `(change)` on the select seeds it from `WorkType.days` catalog only when empty (`seedDaysFromCatalog`) — never overwrites an explicit per-module value.
- Hint copy rewritten: Gantt duration = «Дней» in the module row; норма, ч = cost only; order-level Gantt can still adjust.
- Payload include `days` only when set (omit → binding stays null → facade falls back to catalog).
- Spec: seed-from-catalog, explicit-override-not-clobbered, existing hydrate/submit assertions updated for the new `days` control.

**Gantt read (`production-read.facade.ts`):**
- `mapModuleWorkTypes`: `days = (finite binding.days ≥ 1) ?? catalog?.days ?? populated?.days ?? null`.
- Spec: two modules sharing one WorkType — binding 4 wins over catalog 2; module without binding falls back to catalog 2.

**WorkType form dialog:**
- Label «Дней» → «Дней по умолчанию»; hint rewritten to «seed for new module bindings, actual term lives on the module / order Gantt».

**Gantt catalog-days button (Step 6, option A per PO-canon default for exactly this bug):**
- Removed the work-detail «Изменить в справочнике» button, `GanttCatalogDaysRequest`, `catalogDaysRequest` output, `onCatalogDaysClick` from `gantt-bars.component.ts`.
- Removed `onCatalogDaysRequest` handler + import from `production-cockpit.page.ts`.
- Deleted now-fully-dead `blocks/order-inspector.component.ts` (only consumer was the removed handler).
- Replaced the old confirm-prompt write-spec test with an assertion that no catalog-write control renders and `workTypesApi.update` is never called from the Gantt.
- Resize (`estimate-days`) and other work-detail controls (people, дни-input → order override) untouched.

**Docs:**
- `modules.page.md`: new SoT bullet + TZ reference row.
- `work-types.page.md`: TZ reference row explaining the label/seed semantics.
- `COUPLING-MAP.md`: sharpened the pre-existing Gantt-days SoT line (dated 2026-09-05) with the TZ id and the catalog-button removal note.
- `PAGE-TZ-INDEX.md`: one-line DONE markers on the `/modules` and `/work-types` rows.

**Conflict disclosure:** touched exactly the files in CONFLICT KEYS plus the directly-coupled dead-code deletion (`order-inspector.component.ts`, same `blocks/` folder, zero other consumers, not owned by any other active TZ). Orders hub tray / `order-hub-tray` files were never opened.

**Known limits:** `known_limitation` from the TZ stands — existing modules without `workTypes[].days` read the catalog until their next save; no separate backfill was run (not required by AC).

## Review handoff

- [x] TZ has no review-inbox wave requirement — archive directly after gates

## Closeout

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-05T14:10:00Z
