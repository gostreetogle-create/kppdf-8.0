═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-STUDIO-B: Production studio — behavior-preserving shell
═══════════════════════════════════════════════════════════════

STATUS: CLAIMED / IN PROGRESS
ACTIVE: claim → tasks/_active/TZ-PRODUCTION-STUDIO-B.md
DEPENDENCIES: TZ-PRODUCTION-STUDIO-A archived DONE; SoT
  docs/ux/production-gantt-studio-spec.md (FROZEN)
SOURCE: docs/audits/2026-08-15-production-studio-plan-review.md
WAVE: tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md
MASTER: docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md

РОЛЬ АГЕНТА: Frontend (shell only)
LAYER: 3
ЗАВИСИМОСТИ: Wave A DONE; не параллелить с C

PAGES: /production ; /work-types
PAGE_DOCS: production-cockpit.page.md ; work-types.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/production/production-cockpit.page.spec.ts;
frontend/src/app/pages/production/production-group-chips.ts;
docs/pages/production-cockpit.page.md;
docs/agent-checklists/TZ-PRODUCTION-STUDIO-B.md;
docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md;
progress.md

Проверено: production-cockpit.page.ts (inline chips + toolbar + w-56 layout);
  PiGroupWorkspace.flushBody в shared/page; work-types уже на PiGroupWorkspace;
  SoT FROZEN shell; search∈Заказы, filters∈Фильтры.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

`/production` — собственный header с group-chips и текстовым toolbar; docked
orders rail. Цель B: обернуть в section chrome + завести local shell state
для будущих flyout, **не** убирая ещё docked panels (это C) и **не** меняя
оценку/facade.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM  
Создать `docs/agent-checklists/TZ-PRODUCTION-STUDIO-B.md` (скопировать каркас
из WAVE master Phase B). Claim `tasks/_active/TZ-PRODUCTION-STUDIO-B.md`.
Обновить resume slot в WAVE master checklist.

ШАГ 2 — PiGroupWorkspace wrap  
В `production-cockpit.page.ts`: обернуть страницу в `PiGroupWorkspace` с
`PRODUCTION_SECTION_CHIPS`, `flushBody=true`, без ghost tools-slot.
Убрать дублирующий локальный chip-header, сохранив alert/hint зоны.
**Запрет:** не передавать в PiGroupWorkspace rails, Gantt, inspector, ctx, facade.

ШАГ 3 — Local studio shell state  
Добавить page-local (или tiny helper в том же файле/соседнем
`production-studio.shell.ts` если нужно) signals:
`leftTool: 'orders'|'filters'|null`, `rightTool: 'card'|'scale'|null`,
`flyoutOpen`, методы open/close/toggle с правилом «один flyout».
Не класть это в `ProductionCockpitContext` / `ProductionReadFacade`.
Пока C не начата: state может быть wired minimally (open/close no-op UI OK),
но API shell должен существовать и быть покрыт unit-тестом.

ШАГ 4 — Behavior 1:1 regression  
Сохранить текущий docked rail/inspector/toolbar поведение до C.
Прогнать существующие Jest production; починить только регрессии shell wrap.
Проверить маршруты chips → `/work-types`.

ШАГ 5 — Docs + gates + archive  
Обновить page-doc: «Wave B shell wrap DONE; visual still docked until C».
Master checklist Phase B → [x], score.
Gates ниже → archive `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-B.done.md`
+ lock + remove `_active` + commit/push per GIT-POLICY.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- production-cockpit.page.ts / .spec.ts
- production-group-chips.ts только если нужно для PiGroupWorkspace
- optional `production-studio.shell.ts` (local, no shared StudioRail)
- docs page + checklists + progress

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- gantt-bar.model / ProductionReadFacade estimate path / WorkType.days
- backend/**
- удаление w-56 / text toolbar (→ C)
- drag, ProductionOrder, shared StudioRail, TZ-309 writes
- PO-CANON / PO-DIARY чужой WIP

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `/production` рендерится внутри PiGroupWorkspace; chips Гант|Виды работ работают.
2. PiGroupWorkspace не импортирует/не знает Gantt/inspector/rails internals.
3. Local leftTool/rightTool API существует; max one flyout invariant в коде/тесте.
4. Существующие production Jest зелёные; поведение select/filters/zoom/refresh/`?orderId=` 1:1.
5. Нет product changes вне CONFLICT KEYS.
6. WAVE master Phase B отмечен; score_now ≈ 40.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/pages/production --runInBand --no-coverage
git diff --check
```

known_limitation: visual docked layout остаётся до C; geometry PASS — в D.

Промпт: tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md
Финализация: tasks/_archive/2026-08/ + GEMINI.md
