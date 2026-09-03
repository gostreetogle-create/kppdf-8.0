# TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T22:02:24Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI недоступен в этой сессии)

## Preflight

- [x] git status/branch проверены — ветка `claude/docstudio-s39`, worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S39`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-list.page.ts / studio dialog / nx build kppdf-web)
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S39-CREATE-DOCTYPE.md` на месте

## Acceptance

- [x] Диалог «Создать документ»: имя (default как сейчас) + обязательный select типа из live DocTypes — `studio-create-doctype-dialog.component.ts`
- [x] Create API вызывается с `docTypeId` — `studio-list.page.ts` `createDocument(name, docTypeId)`
- [x] «Новое КП» (S33) остаётся одним кликом без dialog — `createKp()` не тронут по потоку (только вынесен общий `buildDefaultName`)
- [x] «Из шаблона» не тронут (тип наследуется от шаблона) — `createFromTemplate()`/`openTemplatePicker()` без изменений
- [x] `data-test="studio-create-doctype-dialog"` — на `<form>` в новом диалоге
- [x] Нельзя создать blank без типа — `create()` всегда открывает диалог с обязательным `docTypeId` (`Validators.required`), `service.create` вызывается только из `ref.close(result)`
- [x] Создал «Договор» → в панели Шаблон выбран договор — `docTypeId` из ответа create попадает в `document().docTypeId` → `StudioTemplatePanelComponent` (существующая связка, не менялась)
- [x] `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (studio-list.page.ts + новый диалог studio-create-doctype-dialog.component.ts)
- [x] FIC §A–E — N/A: чисто клиентская правка одной страницы, не трогает общие поля/статусы/разрешения
- [x] page.md / PAGE-TZ-INDEX — N/A: `docs/pages/document-studio.page.md` в репозитории отсутствует (нет каталога `docs/pages/`)
- [x] SECTION-READINESS — N/A: нет такого файла для studio в этом воркспейсе
- [x] Чужой WIP не в коммите; conflict keys (`studio-list.page.ts`, dialog под `studio/`, `nx build kppdf-web`) — только мои правки, других `_active/*` с этими ключами не было
- [x] Coupling map — N/A: не трогал общее поле/статус, только studio-list flow
- [x] Канон docs/DOCS-INTEGRITY.md учтён (см. пункты выше)

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (проверено до правок)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict)
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

Канон: `docs/TZ-NX-BUILD-INTEGRITY.md`

## Gates (факт)

```
cd frontend-nx
pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
                                             → PASS, exit 0
pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-list.page.ts \
  apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts \
  apps/kppdf-web/src/app/pages/studio/studio-create-doctype-dialog.component.ts
                                             → PASS, exit 0, 0 problems
pnpm exec nx build kppdf-web                → PASS (baseline, до правок)
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-list
                                             → PASS (4/4 tests, studio-list.page.spec.ts)
pnpm exec jest --config apps/kppdf-web/jest.config.ts studio
                                             → 1 failed suite (registries.catalog.spec.ts — pre-existing,
                                               unrelated: catalog gained `vat-rate`/`formulas` registries
                                               independently of this TZ; confirmed via git stash that it
                                               fails identically on the pre-change tree). All studio suites
                                               (incl. studio-list) green.
pnpm exec nx lint kppdf-web                 → FAIL overall, but zero findings in touched files
                                               (studio-list.page.ts, studio-list.page.spec.ts,
                                               studio-create-doctype-dialog.component.ts). All 21 errors /
                                               74 warnings are pre-existing a11y/lint debt in untouched
                                               studio files (studio-blocks-canvas, studio-editor.page,
                                               studio-layers-panel, studio-properties-panel,
                                               studio-table-properties, studio-text-properties,
                                               studio-workspace-shell.component.html).
pnpm architecture:check (root)              → PASS
pnpm exec nx build kppdf-web (после правок) → PASS (closing gate)
```

## Executor report

Что сделано:
- Добавлен `StudioCreateDoctypeDialogComponent` (`apps/kppdf-web/src/app/pages/studio/studio-create-doctype-dialog.component.ts`):
  reactive-form диалог с полями «Название» (default как раньше) и обязательный «Тип документа»
  (`app-pi-select` из live `PiDocTypesService.list()`), `data-test="studio-create-doctype-dialog"` на форме.
- `studio-list.page.ts`: `create()` теперь всегда грузит live DocTypes, при пустом списке — toast и никакого
  создания; иначе открывает новый диалог и создаёт документ только после подтверждения с обязательным
  `docTypeId`. Общая логика дефолтного имени вынесена в `buildDefaultName(prefix)`, переиспользуется и в
  `createKp()` (сам путь «Новое КП» — один клик, без диалога — не изменился).
- `createFromTemplate()` / «Из шаблона» не тронуты — тип по-прежнему наследуется от шаблона.
- Обновлён `studio-list.page.spec.ts`: заменён устаревший тест «оставляет docTypeId неопределённым» на тест,
  что generic-кнопка требует диалог и docTypeId; добавлен тест на пустой список типов (toast, без открытия
  диалога и без create).
- AC#2 («Договор» → в панели Шаблон выбран договор) обеспечивается существующей связкой
  `studio-editor.page.ts` (`docTypeId` computed из `document()`) → `StudioTemplatePanelComponent` — она не
  менялась, а теперь всегда получает реальный `docTypeId` из ответа create.

Conflict disclosure: конфликтных claim'ов на `studio-list.page.ts` / dialog под `studio/` / `nx build kppdf-web`
от других агентов не было (проверено `_NOW.md` + `tasks/_active/`).

Known limits: браузерный/Playwright smoke этой страницы не выполнялся — в репозитории нет Playwright-обвязки
для document-studio и нет тривиального пути поднять backend+Mongo в рамках этой сессии; вместо этого
поведение диалога и его integration с list-page покрыто Jest (открытие только при непустых DocTypes,
блокировка создания без выбранного типа через `Validators.required`, вызов `service.create` только по
`ref.close(result)`), что соответствует существующей практике проекта для соседних диалогов
(create-from-template, save-as-template — тоже без Playwright).

## Review handoff

- [x] READY FOR REVIEW в wave inbox — N/A, TZ не требует отдельного review inbox; ORCH-режим = autonomous finish
- [x] Archive после gates PASS (ORCH: autonomous finish, no wait-confirm)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-03T22:15:00Z
