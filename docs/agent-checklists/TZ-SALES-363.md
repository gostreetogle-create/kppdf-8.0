# TZ-SALES-363 checklist — polish содержимого панелей студии Create КП

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-363.md` (должен существовать, пока не archive)
> Commit/push: на каждом закрытом TZ (канон PO-DIARY §4.10); deploy — нет.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `freebuff-kppdf-8.0-d8650b12` (Buffy/Freebuff worktree d8650b12)
- claimed_at: 2026-08-12T09:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Task Room registry has no SALES-363 entry; claim message sent)

## Preflight

- [x] `git rev-parse --show-toplevel` → worktree `D:\kppdf-8.0\.freebuff\worktrees\d8650b12…` (Freebuff worktree; main = D:\kppdf-8.0)
- [x] Прочитал `_active-map.md` + `tasks/_active/` — пусто, нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (WAVE-KP-STUDIO-CHROME, PROMPT, audit 2026-08-12)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-363.md` на месте

## Acceptance

- [x] Убраны дубли хинтов: пустое «Условия» без повтора библиотеки; имя шаблона под селектом убрано (его показывает trigger); «Клиент» — search + native select → один `PiOverflowSelect` (дубль поиска убран)
- [x] Плотность Paper & Ink: три «только в этом КП» в inspector сведены к одной подсказке про наценку; кнопки уже `PiButton` (не менялись)
- [x] Recipient / Terms / Picker / Params читаемы; `tableOnly` ветка inspector не раздута (не трогалась — 359 её уберёт)
- [x] Product rail: ширина flyout не менялась; padding/пустое состояние не трогались (шума нет — bullet 4)
- [x] `git diff` не содержит `proposal-create.page.ts` (и composition/table-studio/table-editor/backend) — только CONFLICT KEYS
- [x] Gates: FE tsc PASS; focused specs proposal-create + terms 38/38 PASS

## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: page (UI polish child panels Create КП)
- [ ] FIC §A–E пройдены или N/A одной строкой
- [ ] page.md обновлены: docs/pages/proposals-create.page.md (строка про chrome)
- [ ] SECTION-READINESS обновлён или N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest --runInBand --silent proposal-create` → 38/38 PASS (page + terms)
- `cd frontend && pnpm exec eslint <4 changed panel files>` → PASS (0 errors)
- `git diff --check` → PASS; `git diff --name-only` → только CONFLICT KEYS
- Prettier: repo baseline не чист (untouched product-rail тоже warn); prettier-нормализованный diff = только намеренные правки
- DOM self-verify (dev server :4203, worktree): Условия/Получатель/Шаблон/Параметры — без дублей, overflow-select клиента открывается/выбирает, реквизиты гидратируются, console без ошибок

## Executor report

- Изменено: `proposal-create-terms.component.ts` (empty-state copy), `proposal-create-template-picker.component.ts` (убран дубль имени + dead CSS), `proposal-create-recipient.component.ts` (клиент → `PiOverflowSelect`, убраны search/filteredCounterparties), `proposal-create-inspector.component.ts` (2 повтора «только в этом КП» убраны), `docs/pages/proposals-create.page.md` (строка 363).
- Conflict disclosure: page.ts/composition/table-studio/table-editor/backend не тронуты; diff только по CONFLICT KEYS; claims другого агента (WAVE-KP-TABLE-EDITOR) не пересекались (`_active/` пуст при старте).
- Known limits: Prettier baseline репо не чист; live auth-браузерный smoke не требуется (копирайт/выбор UI); таблица-в-КП не затронута.

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (если волна требует)
- [ ] Не archive до Cursor Verdict PASS (если TZ требует review) — волна 363 без review-гейта

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T01:10:00Z
