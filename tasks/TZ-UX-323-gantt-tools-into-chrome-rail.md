═══════════════════════════════════════════════════════════════
TZ-UX-323: Гант — tools в app chrome-rail (убрать 48px колонки)
═══════════════════════════════════════════════════════════════

STATUS: READY (после TZ-UX-322 DONE)
ACTIVE: claim → tasks/_active/TZ-UX-323.md
DEPENDENCIES: TZ-UX-322 DONE
LAYER: 3
SOURCE: PO 2026-08-15 — красные круги: иконки → панель со стрелками; шире Гант
WAVE: tasks/_backlog/WAVE-UX-CHROME-GANTT-TOOLS.md

РОЛЬ АГЕНТА: Frontend
PAGES: /production
PAGE_DOCS: production-cockpit.page.md ; production-gantt-studio-spec.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/production/production-cockpit.page.spec.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.ts;
docs/ux/production-gantt-studio-spec.md;
docs/pages/production-cockpit.page.md;
docs/pages/page-chrome.md;
docs/agent-checklists/TZ-UX-323.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/SECTION-READINESS.md;
progress.md

Проверено: production-studio-body grid `48 | 1fr | 48`; tools Заказы/Фильтры/Обновить
  + Карточка/Сегодня/Масштаб; flyouts absolute; SoT FROZEN local rails — обновляем.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Локальные production-studio-rail съедают ~96px ширины Ганта. Глобальный
chrome-rail уже занимает края окна. Нужно: кнопки только в app chrome;
studio body = один center на всю ширину main; flyout overlay без сдвига.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM (только после 322 archive)

ШАГ 2 — Register tools
В ProductionCockpitPage OnInit/effect: `chromeTools.setTools('production-cockpit', [...])`
Left (под ←): Заказы, Фильтры, Обновить — те же handlers/aria/data-test ids
  (`production-tool-orders` и т.д. сохранить или mirror `chrome-tool-orders` + keep old tests).
Right (под →): Карточка, Сегодня, Масштаб.
OnDestroy: `clear('production-cockpit')`.
Активное состояние / aria-expanded синхронизировать с leftTool/rightTool.

ШАГ 3 — Remove local rails
Удалить `<nav class="production-studio-rail-*">` из template.
`production-studio-body` → одна колонка (только Gantt + overlays).
Flyout left/right: якорь к краю studio/main (left:0 / right:0 или inset от content),
**не** оставлять padding 48px под мёртвые rails.
Backdrop/Escape/focus return — сохранить 1:1.

ШАГ 4 — Behavior 1:1
Заказы/Фильтры split; один flyout; refresh/today/zoom/fit; `?orderId=`;
read-only inspector. Не трогать facade / gantt-bar.model / WorkType.days.

ШАГ 5 — SoT + page-doc
Обновить `production-gantt-studio-spec.md` FROZEN:
```text
app-chrome-rail-left:  ← + page tools (Заказы·Фильтры·Обновить)
main: Gantt full width (no local 48px columns)
app-chrome-rail-right: → + page tools (Карточка·Сегодня·Масштаб)
flyouts: overlay; center width unchanged
```
SECTION-READINESS note if needed.

ШАГ 6 — Geometry evidence
При viewport ≥1680: нет `production-studio-rail` в DOM;
Gantt center шире, чем был с 48+48;
open/close flyout не меняет center width (getBoundingClientRect).
Jest production PASS.

ШАГ 7 — Archive + WAVE DONE score 100 для этой цели (chrome tools projection).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- estimate math / ProductionReadFacade API / backend
- drag / 309 / ProductionSchedule
- modules filter (отдельный successor)
- PiGroupWorkspace internals beyond consumption

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. На /production иконки видны в app-chrome-rail рядом со стрелками (≥1680).
2. Нет локальных 48px production-studio-rail колонок.
3. Flyout/behavior/a11y 1:1; Заказы≠Фильтры.
4. Другие страницы без лишних Gantt-кнопок.
5. tsc + Jest production + app-layout PASS; SoT обновлён.
6. PO visual: Гант заметно шире.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/pages/production src/app/layout/app-layout.component.spec.ts --runInBand --no-coverage
git diff --check
```
