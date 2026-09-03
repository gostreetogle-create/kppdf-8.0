# TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T22:13:46Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S40
- branch: claude/docstudio-s40
- team_room_claim: unavailable (CLI недоступен в этой сессии)

## Preflight

- [x] git status/branch проверены — ветка `claude/docstudio-s40`, worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S40`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (registry.service.ts / studio-data-field-picker-dialog.component.ts / nx build kppdf-web); `_active/` был пуст до этого TZ
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS.md` на месте

## Acceptance

- [x] Поле ERP → источник «Заказ» → `{{order.number}}` резолвится в Preview при выбранном заказе — `DATA_SOURCES` получил дескриптор `order` (`registry.service.ts`); `bag.order` уже гидрировался в `StudioOutputService.renderStudioDocument`/`buildSubstitutionBag` из `context.orderId` (S8-1), а `studio-order-select` в `studio-data-panel.component.ts` уже писал `orderId` — не хватало только самого registry-дескриптора, чтобы поле появилось в picker
- [x] Плательщик в picker → токен `anchor.payer`; при выбранном payer в Данные Preview ≠ клиент, если разные — `groupedSources()` клонирует `counterparty`-источник с `key: 'payer'`/`'supplier'` вместо переиспользования `key: 'counterparty'`; `confirmInsert()` эмитит `anchorSource(src.key)` → `anchor.payer`/`anchor.supplier`, консьюмер (`studio-text-properties.component.ts`) собирает токен из `sel.source` как есть → `{{anchor.payer.*}}`. Backend `buildSubstitutionBag` уже клал `bag.anchor.payer`/`bag.anchor.supplier` из `context.anchors` (не менялся)
- [x] Disabled invoice/product не вставляют «успешный» пустой токен без hint — `UNBOUND_SOURCE_HINTS` (invoice/work-type/product/material) рендерятся disabled-кнопкой с подсказкой; `pickSource()` не даёт выбрать disabled-источник (ранний return), поэтому шаг 2 (поля) для них недостижим
- [x] `cd backend && pnpm test -- registry.service` PASS
- [x] `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: backend registry descriptor (data-only, без миграций) + frontend dialog component (picker) + doc
- [x] FIC §A–E — N/A: не меняет общие статусы/разрешения/coupling-поля, только состав `DATA_SOURCES` (read-only каталог) и клиентскую логику picker-диалога
- [x] page.md — обновлён: `docs/pages/document-studio.page.md` §2.4 (таблица + короткая заметка S40)
- [x] SECTION-READINESS — N/A: нет такого файла для studio в этом воркспейсе
- [x] Чужой WIP не в коммите; conflict keys (`registry.service.ts`, `registry.service.spec.ts`, `studio-data-field-picker-dialog.component.ts`, `nx build kppdf-web`) — только мои правки, других `_active/*` с этими ключами не было
- [x] Coupling map — N/A: не трогал общее поле/статус/lifecycle
- [x] `studio-text-properties.component.ts` — НЕ менялся: consumer уже строил токен из `sel.source` буквально (`{{${sel.source}.${field.key}}}`), поэтому фикс со стороны диалога (эмитить `anchor.payer`/`anchor.supplier` в `source`) был достаточен без изменения этого файла (TZ допускал правку «если token insert», но по факту не понадобилась)
- [x] Канон `docs/DOCS-INTEGRITY.md` учтён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: node_modules отсутствовали в свежем worktree → `pnpm install --frozen-lockfile` в `backend/` и `frontend-nx/`, затем `nx build kppdf-web` подтверждён PASS после правок
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

Канон: `docs/TZ-NX-BUILD-INTEGRITY.md`

## Gates (факт)

```text
cd backend
pnpm install --frozen-lockfile          → OK (node_modules отсутствовал в worktree)
pnpm test -- registry.service
  → PASS, exit 0 (5 passed: 2 baseline + 1 новый order-source тест + 2 buildFieldsFromSchema)
pnpm exec eslint src/modules/registry/registry.service.ts src/modules/registry/registry.service.spec.ts
  → PASS, exit 0, 0 problems

cd frontend-nx
pnpm install --frozen-lockfile          → OK (node_modules отсутствовал в worktree)
pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0
pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-data-field-picker-dialog.component.ts \
  apps/kppdf-web/src/app/pages/studio/studio-data-field-picker-dialog.component.spec.ts
  → PASS, exit 0, 0 problems
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-data-field-picker-dialog
  → PASS, exit 0 (1 suite, 5 tests: counterparty≠anchor.payer≠anchor.supplier + disabled state + DOM hint)
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio (full studio scope)
  → 1 failing suite: registries.catalog.spec.ts — ПРЕДСУЩЕСТВУЮЩИЙ baseline (vat-rate/formulas
    registries появились независимо от этого TZ, задокументировано в S39 archive), вне diff
    этого TZ. Все studio picker/text-properties сьюты зелёные (356 passed / 7 skipped / 365 total).

pnpm architecture:check (root)
  → PASS: "Architecture check passed (1399 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 ("Successfully ran target build for project kppdf-web and 4 tasks it depends on").
    Component-style budget warning на новом picker CSS (5.02kB vs 4kB warning-порог,
    error-порог 8kB) — тот же класс pre-existing warnings, что и у нескольких других
    studio-компонентов в этой же сборке (studio-blocks-canvas, pi-showcase-card, …), не error.
```

Checklist: этот файл

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope specs; pre-existing baseline FAIL unrelated to this TZ (registries.catalog.spec.ts, see Gates)
  - lint: PASS for changed-scope files, 0 problems
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
