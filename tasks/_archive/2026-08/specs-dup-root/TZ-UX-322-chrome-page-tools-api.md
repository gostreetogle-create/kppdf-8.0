═══════════════════════════════════════════════════════════════
TZ-UX-322: Chrome page-tools API (L/R app rails)
═══════════════════════════════════════════════════════════════

STATUS: READY (un-park; first consumer = /production in TZ-UX-323)
ACTIVE: claim → tasks/_active/TZ-UX-322.md
DEPENDENCIES: TZ-UX-321 / UX-321-FIX DONE (rails exist)
LAYER: 3
SOURCE: PO 2026-08-15 screenshot — Gantt icons → панель со стрелками
WAVE: tasks/_backlog/WAVE-UX-CHROME-GANTT-TOOLS.md

РОЛЬ АГЕНТА: Frontend shell
PAGES: (app shell)
PAGE_DOCS: page-chrome.md

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.component.spec.ts;
frontend/src/app/shared/chrome/pi-chrome-tools.service.ts;
frontend/src/app/shared/chrome/pi-chrome-tools.types.ts;
docs/pages/page-chrome.md;
docs/agent-checklists/TZ-UX-322.md;
docs/pages/PAGE-TZ-INDEX.md;
progress.md

Проверено: app-layout has app-chrome-rail-left/right 64px with only ←/→;
  production-cockpit has local 48px rails eating Gantt width;
  park sketch UX-322; PO wants tools on chrome panel, not beside Gantt.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Глобальные chrome-rail уже есть (прозрачные, ≥1680). Сейчас в них только
history. Страницы не могут проецировать свои icon-tools → дублируют локальные
колонки (Гант).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM + checklist

ШАГ 2 — `PiChromeToolsService` (root providedIn)
- Signals/lists: `leftTools`, `rightTools` (ordered items).
- Item shape: `{ id, side:'left'|'right', ariaLabel, title, icon (LucideIconData or template),
  active?, ariaExpanded?, ariaControls?, onClick, order? }`.
- API: `setTools(ownerId, items)`, `clear(ownerId)` — один write-path; owner =
  page/component id. Clear on destroy (caller responsibility + guard).
- Не хранить Angular components тяжёлые — только кнопки; flyout остаётся у страницы.

ШАГ 3 — AppLayout render
В `app-chrome-rail-left`: сверху ← (как сейчас), ниже — leftTools buttons
(тот же visual language `app-nav-rail-button` / согласованный class).
В `app-chrome-rail-right`: сверху →, ниже — rightTools.
data-test: `chrome-tool-{id}`.
RU aria-label/title обязательны.
Пустой список tools = только history (как сейчас на других страницах).

ШАГ 4 — Specs
Jest: setTools → DOM buttons; clear → gone; history buttons remain.

ШАГ 5 — Docs page-chrome.md: канон projection; first consumer TZ-UX-323.
Gates + archive + lock. **Не** трогать production cockpit в этом TZ.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- production-cockpit / gantt (→ 323)
- желтое меню разделов / nav categories
- backend, deploy
- modules filter migration (later successor)

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Service + layout render left/right tools under history arrows.
2. Pages without setTools look unchanged.
3. tsc + app-layout (+ chrome service) Jest PASS.
4. Archive DONE.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/layout/app-layout.component.spec.ts --runInBand --no-coverage
git diff --check
```
