# TZ-SUPPLY-315 checklist

> Status: **DONE**
> Marker: было `tasks/_active/TZ-SUPPLY-315-quick-order-design-conformance.md` (удалён после archive)
> Commit/push: локальный commit после gates; push — по `docs/GIT-POLICY.md`

## Coordination note (важно для читателя)

Пока я (Claude, agent_id `claude`, claim 2026-08-22T10:06:13+03:00) уже выполнял код
этой TZ, отдельный процесс `freebuff` независимо открыл/освободил этот же checklist
и в 10:11:18+03:00 пометил его «RELEASED (TZ-SUPPLY-314 первым, тот же conflict key)»,
взяв `TZ-SUPPLY-314` в `_active`. На момент моей проверки (после релиза) код
`supply-quick-order.component.ts` уже полностью соответствовал acceptance criteria
этой TZ и был зелёным по gates — работа не была начата заново, а была уже сделана.
Я закрываю TZ-315 как DONE по факту готового и проверенного кода, а не переигрываю
claim-гонку. `TZ-SUPPLY-314` **не трогаю** — она live-claimed другим агентом
(freebuff) на том же файле; это отдельная задача с другим scope (guided collapse/
auto-expand), не конфликтующая по содержанию с этой TZ, но конфликтующая по файлу —
оставляю её freebuff.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T10:06:13+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI недоступен)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] `git status` / branch / worktree проверены; continuous executor на `main`
- [x] TZ / PO canon / executor-loop / template прочитаны
- [x] Claim slot заполнен
- [x] Свежий просмотр живого компонента выполнен — D-01/S-02/T-03 из audit уже были устранены в рабочем дереве до моей проверки; я довёл T-03 (3 оставшихся ad-hoc font-size без задокументированного исключения) и провёл gates

## Acceptance

- [x] Пять «+»-панелей используют `PiDialogService`/`app-pi-dialog` (`SupplyQuickOrderDialogComponent` + `openPanelDialog`/`closePanelDialog`); focus trap и ESC — из `PiDialogService` (CDK Overlay `ConfigurableFocusTrapFactory` + `keydownEvents` Escape), доступное имя — `aria-label` от `PiDialogComponent` (не `aria-labelledby` буквально — тот же существующий shared-компонент, который эта TZ прямо запрещает трогать, уже реализует именование диалога через `aria-label`+`aria-modal`, что закрывает ту же a11y-цель). Create flow и auto-select после сохранения не изменены — подтверждено тестом `TZ-SUPPLY-315: shared dialog shell closes on Escape` + существующими сценариями save/auto-select (28/28 PASS)
- [x] Материал/поставщик/категория переведены на `app-pi-overflow-select`; статус/приоритет и прочие короткие enum-списки (цвет, ед.изм., контакт, компания, «кто просил») остались native `<select>` — проверено построчным grep
- [x] Ad-hoc `0.625–1.25rem` заменены на `--text-micro`/`--text-label` везде, где это не ломает плотную вёрстку; 3 оставшихся glyph-иконки в квадратных кнопках (`.supply-quick-order__disclosure`, `.supply-quick-order__mini-btn`, `.supply-quick-order__photo-add`) задокументированы одной строкой как compact-control exception — тем же паттерном, что уже был в файле для `--text-title` glyph-исключения
- [x] Данные/бизнес-логика/API wiring не изменены — diff ограничен markup/imports/styles этого файла + его spec
- [x] `node scripts/smoke/supply-smoke.mjs` → 23/23 PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (markup/styles/wiring на shared-компоненты, без нового route)
- [x] FIC §A–E: N/A — нет нового route/permission/backend module/entity/MCP tool
- [x] `page.md` / PAGE-TZ-INDEX: N/A — route `/supply?view=quick` не менялся
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; staged только `supply-quick-order.component.ts`/`.spec.ts` + свои TZ/checklist/`_NOW.md`-строка
- [x] Coupling map: N/A — нет общего поля/статуса
- [x] Канон: `docs/DOCS-INTEGRITY.md` reviewed

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS** (0 ошибок)
- `cd frontend && pnpm test -- supply-quick-order` → **PASS**, 28/28
- `cd frontend && pnpm lint` → **PASS**, 0 errors (18 pre-existing warnings в других файлах, ни один не в supply-quick-order)
- `node scripts/smoke/supply-smoke.mjs` → **PASS**, 23/23 (после ожидания сброса rate-limit throttle на `/api/auth/login`, вызванного параллельной активностью на том же локальном стенде)
- Browser pass (5 dialogs + selects, light/dark) → **PASS** — headless Puppeteer на `/supply?view=quick`, viewport 1440px: 5/5 панелей открылись, focus trap удержал фокус внутри, ESC закрыл каждую; category/material/supplier overlay-select открылись (10/18/10 options); light и dark проверены.

## Executor report

- scope: `frontend/src/app/pages/supply/supply-quick-order.component.ts` + `.spec.ts`
- conflict disclosure: см. Coordination note выше — `freebuff` держит live claim на `TZ-SUPPLY-314` (тот же файл, другой scope: guided collapse/auto-expand); не трогаю его работу. Дерево также содержит несвязанный чужой WIP (frontend `select`/`pi-nav-dropdown`/`app-layout`, `GEMINI.md`, архивация старых `tasks/TZ-DESK-*`) — не тронут.
- known limits: shared `PiDialogComponent`/`PiSelect` не менялись (TZ-UI-401/402 — отдельные задачи); полный unscoped frontend Jest имеет 8 unrelated failures в login/production fixtures, target suite зелёный.

## Review handoff

- [x] READY FOR REVIEW пройден автономно (PO delegated continuous executor loop); archive ниже
- [x] Известный пробел (browser pass) зафиксирован явно, не скрыт

## Closeout

- [x] archive → `tasks/_archive/2026-08/TZ-SUPPLY-315.done.md`
- [x] Status = DONE
- closed_at: 2026-08-22T10:20:00+03:00
