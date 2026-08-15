═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-STUDIO-C: Production studio — visual rails + flyout
═══════════════════════════════════════════════════════════════

STATUS: READY (после DONE B)
ACTIVE: claim → tasks/_active/TZ-PRODUCTION-STUDIO-C.md
DEPENDENCIES: TZ-PRODUCTION-STUDIO-B DONE
SOURCE: docs/ux/production-gantt-studio-spec.md §§ FROZEN, 2–7
WAVE: tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md
MASTER: docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md

РОЛЬ АГЕНТА: Frontend UI
LAYER: 3
ЗАВИСИМОСТИ: B DONE; не параллелить с D

PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/production/production-cockpit.page.spec.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts;
frontend/src/app/pages/production/blocks/order-inspector.component.ts;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts;
frontend/src/app/pages/production/production-studio.shell.ts;
docs/pages/production-cockpit.page.md;
docs/agent-checklists/TZ-PRODUCTION-STUDIO-C.md;
docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md;
progress.md

Проверено: SoT mapping v1; Заказы≠Фильтры split; KP overlay pattern в
  proposal-create (эталон поведения, не copy-paste shared component).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

После B: PiGroupWorkspace + shell state. Ещё видны docked `w-56`/`w-14` и
текстовый toolbar. Цель C: целевой chrome 48|Gantt|48 + overlay flyouts.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM + resume slot WAVE master

ШАГ 2 — Layout  
`production-studio-body`: relative; overflow hidden; grid/flex
`48px | flex:1 min-w-0 | 48px`. Center = только `app-gantt-bars` (+ loading overlay).
Удалить постоянный aside `w-56`/`w-14` и длинный text toolbar (Обновить/Сброс/Сегодня/…).

ШАГ 3 — Left rail  
Кнопки (RU aria-label + title + aria-expanded/controls):
- Заказы → flyout: список, поиск, select, Все активные (из orders-rail, без filter block)
- Фильтры → flyout: active-only, priority, dates, кнопка Сброс фильтров
- Обновить → click = existing onRefresh (можно без flyout)
Взаимоисключение с правым flyout.

ШАГ 4 — Right rail  
- Карточка → flyout: OrderInspector (не docked 20rem); close ≠ clear selection
- Сегодня → existing onToday
- Масштаб → flyout или popover: День / Неделя / Весь горизонт

ШАГ 5 — Flyout UX  
Один active; absolute overlay поверх center; backdrop; Escape closes;
focus → heading/first control; close → focus opener; Tab не в закрытый flyout.
Не сжимать center (template/CSS: rails fixed columns).

ШАГ 6 — Split orders-rail  
Рефактор `orders-rail` на части list/search vs filters **или** два template
блока в page; семантика ctx signals без изменения filterOrdersForRail.

ШАГ 7 — Gates + docs + archive  
Jest на shell/rails/inspector/gantt; page-doc «Wave C visual DONE»; master
Phase C [x]; archive + lock + commit/push.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS выше (FE production + docs).

НЕ ИЗМЕНЯТЬ:
- estimate math / facade load path / backend
- shared StudioRail extraction
- 309 writes / drag / ProductionSchedule
- полный geometry browser matrix (минимум unit/DOM; полный D)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Нет постоянного docked `w-56`/`w-14`/`w-[20rem]` inspector в layout.
2. Нет текстового toolbar-ряда над timeline.
3. Rails 48px L/R; tools per SoT mapping; Заказы/Фильтры split жёсткий.
4. Один flyout; Escape/backdrop/focus return.
5. Behavior 1:1: select, filters, reset, zoom, today, fit, refresh, `?orderId=`, unknown hint, read-only.
6. tsc + Jest production PASS; WAVE score_now ≈ 75.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/pages/production --runInBand --no-coverage
git diff --check
```

known_limitation: полный getBoundingClientRect @1920 light/dark — Phase D.

Промпт: tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md
