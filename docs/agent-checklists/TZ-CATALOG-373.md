# TZ-CATALOG-373 checklist

> Status: **READY FOR REVIEW** (gates green; archive после Cursor/PO PASS)
> Marker: `tasks/_active/TZ-CATALOG-373.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy
- claimed_at: 2026-08-15T07:37:08Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (в этой среде нет team room tool; конфликт проверен по `tasks/_active/` + `_active-map.md`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (в _active только TZ-AUTH-305, keys = deploy, непересекаются)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/<TASK-ID>.md` на месте

## Acceptance

- [x] `/materials` имеет list↔grid + filters-rail с каноном оверлея products (DOM-проверка live)
- [x] Grid карточки кликабельны на `/materials/:id`; фото/цена/ед. читаемы (href + DOM)
- [x] Kind filter в toolbar **и** rail пишут в один signal → `?materialKind=` (316 не регрессирует; live: rail→toolbar sync + фильтр сработал)
- [x] `pi-materials-view-mode` переживает F5 (live reload)
- [x] Gates: FE tsc PASS + materials.page Jest PASS (18/18)
- [ ] Archive после Executor report (auto) + PASS (ждёт Cursor/PO PASS)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page** (UI chrome существующей страницы; нет route/permission/module/MCP)
- [x] FIC §A–E: N/A — нет новой страницы/права/модуля/MCP; page.md + PAGE-TZ-INDEX обновлены (требование §A для UI-поведения)
- [x] page.md / PAGE-TZ-INDEX обновлены (materials.page.md + PAGE-TZ-INDEX: 373 READY→DONE)
- [x] SECTION-READINESS: N/A — раздел «Склад», каталог-статус не меняется
- [x] Чужой WIP не в коммите; conflict keys соблюдены (модули/products не тронуты; 316 kindFilter не сломан)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS** (0 errors)
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=materials.page` → **PASS** 3 suites / 18 tests (materials.page.spec 5 · materials.page-316.spec 1 · materials.page-373.spec 12)
- DOM self-verify (dev-server :4200, live): toggle list↔grid, rail open/close/backdrop, rail kind→`?materialKind=` (toolbar sync), Сбросить, F5 persistence grid

## Executor report

- Сделано: `materials.page.ts` — view toggle (List/LayoutGrid, `pi-materials-view-mode`), filters-rail (Тип = тот же `kindFilterSig` + Сбросить; backdrop/panel канон 1:1 products), grid `PiShowcaseCard size="md"` (media / eyebrow=kind|article / desc=dims|supplier / price+unit / pager). Cell-шаблоны вынесены из `@if/@else` на верхний уровень (static `@ViewChild` не видит ng-template в control-flow — иначе 308-suite падал). Новый `materials.page-373.spec.ts` (12 тестов).
- Conflict disclosure: 372 (modules.page.ts) не затронут; products.page.ts read-only; backend не менялся; 316/308 suite зелёные.
- Known limits: rail sort НЕ добавлен (backend `/materials` без sortBy/sortOrder — `MaterialService.findAll` всегда `sort({name:1})`); сужение колонок таблицы — successor; shared filters-rail — не обязателен.

## Review handoff

- [x] READY FOR REVIEW (checklist + report; Cursor/PO review ожидается — TZ-373 требует PASS перед archive)
- [x] Cursor Verdict: **PASS** (2026-08-15) — AC OK; CLOSEOUT_NEEDS_COMMIT then archive
- [ ] Archive after commit+push + closeout

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
