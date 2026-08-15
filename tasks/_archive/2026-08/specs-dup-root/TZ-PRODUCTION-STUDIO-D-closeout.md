═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-STUDIO-D: Production studio — consistency + geometry PASS 98–99
═══════════════════════════════════════════════════════════════

STATUS: READY (после DONE C)
ACTIVE: claim → tasks/_active/TZ-PRODUCTION-STUDIO-D.md
DEPENDENCIES: TZ-PRODUCTION-STUDIO-C DONE
SOURCE: docs/ux/production-gantt-studio-spec.md §§ 7–11
WAVE: tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md
MASTER: docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md

РОЛЬ АГЕНТА: Frontend polish + verification
LAYER: 3

PAGES: /production ; /work-types
PAGE_DOCS: production-cockpit.page.md ; work-types.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/production/production-cockpit.page.spec.ts;
frontend/src/app/pages/production/blocks/order-inspector.component.ts;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.ts;
frontend/src/app/pages/work-types/work-types.page.ts;
docs/pages/production-cockpit.page.md;
docs/pages/work-types.page.md;
docs/SECTION-READINESS.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-PRODUCTION-STUDIO-D.md;
docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md;
tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md;
progress.md

Проверено: SoT geometry gate; park 308/310 blocked until after C; 309 = отдельная
  write-wave (НЕ делать здесь).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM + resume

ШАГ 2 — Tree / a11y polish  
Inspector disclosure: крупный hit-target, aria-expanded, focus-visible light/dark;
состояния не только цветом (легенда/текст уже есть — усилить если дыры).
Не менять дерево данных.

ШАГ 3 — Geometry evidence  
На 1920px light **и** dark (Playwright или ручной script + evidence в checklist):
`getBoundingClientRect` — rails внутри body; rail ~48px; **center width equal**
до/после каждого flyout; нет docked w-56/20rem; нет text toolbar; нет double
page scroll / clipped flyout. DOM-only querySelector = FAIL.

ШАГ 4 — Цех parity  
`/work-types`: тот же PiGroupWorkspace section; без ложного «Каталог» в UI copy
если ещё торчит; не переписывать CRUD таблицы.

ШАГ 5 — Safe absorb 308/310 only if missing  
Scroll-to-today в viewport и keyboard rail↔bars — только если ещё нет после C.
**Запрет:** 309 production:write / order-level days / drag / weekend shading без календаря.

ШАГ 6 — Readiness closeout  
SECTION-READINESS: studio estimate **PASS / usable** (факт производства out).
Page-doc: as-is docked notes удалить/заменить на «studio live».
WAVE file → STATUS DONE + SHA table.
Master checklist score_now ≥ 98, last_phase=DONE.
Archive D + lock + commit/push.
Отчёт PO: score, archives, known_limitation.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- estimate math / facade / backend / WorkType schema
- 309 write wave; 304–307 plug-ins; deploy
- shared StudioRail (если нет третьего consumer evidence)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Geometry gate evidence приложена к checklist (числа rect до/после).
2. Light+dark PASS; focus-visible; RU aria на rail.
3. Behavior 1:1 сохранён.
4. SECTION-READINESS честный (estimate studio, не факт).
5. WAVE DONE; `_active` пуст по STUDIO-*; score ≥ 98.
6. tsc + Jest production PASS.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/pages/production --runInBand --no-coverage
git diff --check
# + geometry evidence block in checklist
```

known_limitation: факт производства / ProductionSchedule / drag / 309 — вне claim 100%.
Целевой PO visual **98–99**; «100» только если PO явно принял estimate-only как полный PASS экрана.

Промпт: tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md
