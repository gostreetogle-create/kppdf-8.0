# TZ-DICT-308 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-DICT-308.done.md`
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (deepseek-v4-pro via Freebuff)
- claimed_at: 2026-08-04T19:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Workspace D:\kppdf-8.0 confirmed
- [x] _active-map.md: DICT-308 RESERVED — no other DICT FE claimed
- [x] Design SoT + TZ + PO-DIARY §5 прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] tasks/_active/TZ-DICT-308.md на месте

## Acceptance

- [x] PiGroupWorkspace: chips группы сверху, жёлтый активный, wrap, sticky, сразу tools+таблица. БЕЗ H1, БЕЗ path
- [x] Nav «Справочники»: dropdown по группам (Классификация/Измерения/Оформление/Документы); клик группы → экран группы
- [x] Пилот: группа «Измерения» + chip «Единицы» (units body)
- [x] Specs + fe tsc + jest PASS
- [x] READY FOR REVIEW в DICT-WAVE1-REVIEW.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS** (exit 0)
- `cd frontend && pnpm exec jest --testPathPattern "dictionaries|pi-dictionary-shell" --no-coverage` → **PASS** (10 suites / 83 tests)
- Code review: **PASS** (P1 fixed: nav regression text-block-categories restored; dead code removed)

## Executor report

**Что сделано:**

1. `PiGroupWorkspaceComponent` (shared/page) — новый shell:
   - chips группы сверху (sticky top-14), active = bg-sunrise-warm (жёлтый)
   - wrap на несколько рядов (flex-wrap)
   - tools bar sticky ниже chips
   - body слот для контента
   - **Без** H1 title, **без** path-breadcrumbs
2. `MeasurementsGroupPage` — пилот: группа «Измерения» + chip «Единицы»
   - chips: [{ id: 'units', label: 'Единицы', route: '/dictionaries/measurements' }]
   - body = units table + search/filter/add-CTA (переиспользована логика UnitsPage)
3. Nav update (`app-layout.component.ts`):
   - «Справочники» dropdown → группы: Классификация / Измерения / Оформление / Документы
   - «Документы» сохраняет sub-entries (Категории шаблонов / Категории текстов)
4. Routes: `/dictionaries/measurements` → MeasurementsGroupPage (pageKey: dictionaries)
5. Tests: `measurements-group.page.spec.ts` (3 tests — create, chips config, DOM render)

**Conflict disclosure:**
- `frontend/src/app/layout/app-layout.component.ts` — изменён только items массива «Справочники»
- `frontend/src/app/app.routes.ts` — добавлен 1 route (measurements-group)
- Новые файлы: `pi-group-workspace.component.ts`, `measurements-group.page.ts`, `measurements-group.page.spec.ts`
- Существующие файлы не затронуты (UnitsPage, PiDictionaryShell, etc.)

**Known limits:**
- `top: 6.25rem` hard-coded для tools-bar — работает для пилота с 1 chip; при wrap на 2+ ряда нужен динамический расчёт
- `MeasurementsGroupPage` дублирует ~200 строк UnitsPage — для пилота допустимо; extraction в shared при тираже паттерна
- PiGroupWorkspaceComponent без собственного spec — тестируется через MeasurementsGroupPage

**Diff summary (4 изменённых + 3 новых файла):**
```
M frontend/src/app/app.routes.ts
M frontend/src/app/layout/app-layout.component.ts
M frontend/src/app/shared/page/index.ts
A frontend/src/app/shared/page/pi-group-workspace.component.ts
A frontend/src/app/pages/dictionaries/measurements-group.page.ts
A frontend/src/app/pages/dictionaries/measurements-group.page.spec.ts
```

## Review handoff

- [x] READY FOR REVIEW в DICT-WAVE1-REVIEW.md
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить _active
- [x] Status = DONE
- closed_at: 2026-08-04T21:00:00Z
- Cursor Verdict: PASS
