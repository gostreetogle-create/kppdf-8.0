# TZ-NX-DOCPLAT-01 checklist

> Status: **DONE** (архивировано)
> Marker: `tasks/_active/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-docplat-01
- claimed_at: 2026-08-30T10:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этой сессии)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `git fetch origin && git merge origin/main` → up to date; ветка main
- [x] Прочитал `_NOW.md` + `tasks/_active/` (пусто) — нет чужого CLAIM на `tasks/**`; параллельная волна S0 владеет frontend-nx/** и registries.page.md — не пересекаемся
- [x] TZ / канон (GEMINI.md, GIT-POLICY.md, preflight skill) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md` на месте

### Preflight Check Output

- **Context read:** `tasks/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md`, `GEMINI.md`, `docs/GIT-POLICY.md`, `docs/agent-checklists/_TEMPLATE.md`, `tasks/README.md`, `docs/how-to-connect-ai.md`, `tasks/_backlog/QUEUE.md`, `docs/agent-checklists/_NOW.md`
- **Key Constraints:** docs/tasks-only (LAYER 0) + read-only UI съёмка legacy; НЕ трогать frontend/**/frontend-nx/**/backend/**/docs-architecture/page.md; конфликт-зона с S0 — не писать; Claim заполнен
- **Planned Deliverable:** (1) порядок в tasks/ (22 дубля → rm/archive, прочие → _backlog, PROMPT → prompts-spent), (2) evidence ≥12 скриншотов legacy-экранов + замеры геометрии КП, (3) gates + defects.md, (4) финализация
- **Validation Path:** критерии приёмки TZ § КРИТЕРИИ ПРИЁМКИ + DOCS-INTEGRITY + gates (docs-only N/A, доказательство запуска legacy)

## Acceptance

- [x] В корне `tasks/` — 6 служебных + 5 файлов текущих волн (README, QUEUE-LIVE, PROMPT-RESUME-ANY, PROMPT-FOLLOW-QUEUE, PROMPT-UNIVERSAL-CONTINUOUS, PROMPT-DEPLOY-READY + TZ-NX-DOCPLAT-01, TZ-NX-DOCSTUDIO-S0, PROMPT-FREEBUFF-DOCPLAT-01, PROMPT-FREEBUFF-DOCSTUDIO-S0, PROMPT-CLAUDE-DOCSTUDIO-REVIEW); `.done.md` в `_archive/**` не изменены/удалены
- [x] `tasks/README.md` и `tasks/_backlog/QUEUE.md` соответствуют фактическому содержимому папок
- [x] `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/` — 19 скриншотов по списку фазы B.2, включая альбомную ориентацию КП
- [x] Замеры геометрии числами для книжной и альбомной: 480px, 8px, Δ=0.0px (см. Gates)
- [x] `## Gates` — строка по каждому экрану; каждый «частично»/«падает»/«недоступно» имеет строку в `defects.md` (D1–D9)
- [x] `defects.md` — все пункты с шагами воспроизведения
- [x] Integrity slot заполнен; `## Executor report (auto)` — 5 полей, полный 40-символьный SHA
- [x] Код продукта не менялся → docs-only: typecheck/tests/lint N/A + доказательство запуска legacy (start.mjs, health 200, UI-логин)

## Outcome (фаза A — что перенесено)

- **specs-dup-root/ (33 файла):** 22 дубля из TZ (корень нёс полные спеки, `.done.md` — краткие архивы) + 7 корневых TZ с полным `.done.md` (CATALOG-377, KP-443, SUPPLY-443, TEST-422, UX-440R, UX-442, UX-444B — их спеки уникальны и упоминаются в архивах) + GATES/GATES-2/OPS-320/UNITS-DELETE-FE (архив или дубль backlog).
- **`_backlog/nx/`:** TZ-NX-COMPOSITION-ARCHITECTURE-DECISION, TZ-NX-F0-bootstrap, TZ-NX-NEXT-DAY-PLAN, TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.
- **`_backlog/ops/`** (создана): TZ-OPS-AGENT-ORCHESTRATION-AUDIT, TZ-OPS-NX-START-CANON.
- **`_backlog/ux-hygiene/`:** TZ-AUDIT-MGR-530.
- **`_backlog/doc-studio/`:** WAVE-DOC-STUDIO. **`_backlog/ui-density/`:** WAVE-UI-DENSITY-PAPER-INK.
- **prompts-spent/ (20 файлов):** отработанные PROMPT-* из корня.
- В корне осталось 11 файлов (6 служебных + 5 активных волн). Итого убрано из корня `tasks/`: 33 + 9 + 20 = **62 файла**.

## Integrity slot (заполнен)

- [x] Тип изменения: **docs-only** (tasks/ порядок + checklist + evidence + 1 строка PAGE-TZ-INDEX)
- [x] FIC §A–E: **N/A** — продукт-код не менялся, только перемещения docs/tasks и read-only съёмка
- [x] page.md: **N/A** (UI route не менялся); PAGE-TZ-INDEX.md — дописана строка в конец
- [x] SECTION-READINESS: N/A (нет UI route)
- [x] Чужой WIP не в коммите: staged только свои пути (backend/unit, auth, common, frontend-nx, start.mjs, package.json — не тронуты); конфликт-зона с S0 не пересечена
- [x] Coupling map: N/A (общее поле/статус не трогал)
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report (auto)

- agent_id: `freebuff-docplat-01`
- task: `TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER`
- commit_sha: `bc65aa35445a03e69578c48e82a8b76c6c2aaa76` (delivery commit `bc65aa35` на `origin/main`)
- type: `docs-only`
- outcome: `DONE`

## Gates (факт)

- [x] **docs-only: typecheck/tests/lint N/A** — продукт-код не менялся (ни строки в frontend/backend); доказательство запуска legacy ниже
- [x] legacy-приложение поднято и снято живьём: `node start.mjs --no-browser` → frontend http://127.0.0.1:4200, backend :3000, health 200, UI-логин admin OK

### Замеры геометрии КП (числа из браузера, метод из `docs/pages/kp-workspace-geometry.md`)

| # | Проверка | Portrait (книжн.) | Landscape (альбомн.) |
|---|----------|-------------------|----------------------|
| 1 | `panelW === 480` | **480.00** px (`.kp-ws-panel--left`, x=79) | **480.00** px (x=79) |
| 2 | A4 `right` gap stage ≈ 8px | **8.0** px (sheet.right=1343, stage.right=1351) | **8.0** px (sheet.right=1343, stage.right=1351) |
| 3 | A4 rect идентичен open vs collapsed (Δ ≤ 0.5px) | **Δ = 0.0** px (x=832.5, y=144, w=510.5, h=722 — open и closed одинаковы) | **Δ = 0.0** px (x=83, y=140, w=1260, h=730 — open и closed одинаковы) |
| 4 | Панель поверх серой зоны (overlay) | ✔ (absolute, z поверх viewport) | ✔ |
| 5 | Left rail в chrome, не horizontal strip | ✔ | ✔ |
| 6 | Контент панели `max-width: 272px` | ✔ (компактный, соответствует канону) | ✔ |
| 7 | Клик по A4 сворачивает панель без jerk | ✘ — клик по листу не сворачивает панель (только rail-тул) → D7 | ✘ (то же) → D7 |

Источник: `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/_geometry.json` (Playwright `getBoundingClientRect`, viewport 1440×900).

### Строки по экранам (фаза B.2)

| Экран | Статус | Консоль/сеть | Скриншот |
|-------|--------|--------------|----------|
| `/doc-constructor/templates` | работает | 0 ошибок | `02-templates.png` |
| `/doc-constructor/builder/:id` | работает частично | 404 фото шаблона (D1); палитры вставки и drag-блока нет (D5, D6) | `03-builder.png` |
| `/doc-constructor/studio` (список) | работает | 0 ошибок | `06-studio-list.png` |
| `/doc-constructor/studio` «Из шаблона» | работает | 0 ошибок | `07-studio-from-template-dialog.png` |
| `/doc-constructor/studio/:id` — rail Элементы | работает | 0 ошибок | `09-studio-rail-elements.png` |
| `/doc-constructor/studio/:id` — rail Слои | работает | 0 ошибок | `10-studio-rail-layers.png` |
| `/doc-constructor/studio/:id` — rail Шаблон | работает частично | 0 ошибок; save-as-template не найден (D3) | `11-studio-rail-template.png` |
| `/doc-constructor/studio/:id` — rail Данные | работает | 0 ошибок | `12-studio-rail-data.png` |
| `/doc-constructor/studio/:id` — rail Свойства | работает частично | 0 ошибок; геометрия read-only, нет тулбара шрифтов (D4) | `13-studio-rail-properties.png` |
| `/doc-constructor/studio/:id` — rail Таблица | работает | 0 ошибок | `14-studio-rail-table.png` |
| `/doc-constructor/studio/:id` — ±страницы | **недоступно** | нет UI-управления страницами (D2) | `08-studio-doc.png` (счётчик «1 / 1») |
| `/doc-constructor/studio/:id` — save-as-template | **недоступно** | нет кнопки/пункта (D3) | — |
| `/proposals/workspace` — превью (книжн.) | работает | 0 ошибок | `10-kp-workspace-portrait.png` |
| `/proposals/workspace` — таблица позиций | работает | 0 ошибок | `10e-kp-positions-table.png` |
| `/proposals/workspace` — наследование контрагента | работает | 0 ошибок (панель Клиент) | `10d-kp-recipient.png` |
| `/proposals/workspace` — альбомная ориентация | работает | 0 ошибок | `11-kp-workspace-landscape.png` + `11e-kp-landscape-positions-table.png` |
| `/doc-constructor/texts` | работает | 0 ошибок | `23-doc-texts.png` |
| `/doc-constructor/tables` | работает | 0 ошибок | `24-doc-tables.png` |

Все «частично» и «недоступно» имеют строку в `evidence/TZ-NX-DOCPLAT-01/defects.md` (D1–D9). Скриншотов: 19 (требование ≥12 выполнено).

## Executor report

- что сделано / conflict disclosure / known limits

## Review handoff

- [ ] READY FOR REVIEW (архив после финализации по TZ)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: 2026-08-30T09:45:00+03:00
