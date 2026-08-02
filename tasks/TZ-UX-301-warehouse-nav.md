═══════════════════════════════════════════════════════════════
TZ-UX-301: Nav — группа «Склад» для inventory routes
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Layout / IA
ЗАВИСИМОСТИ: нет
LAYER: 3
PAGES: /inventory ; /storage-items ; /stock-movements
PAGE_DOCS: inventory-dashboard.page.md ; storage-items.page.md ; stock-movements.page.md

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-UX-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Routes существуют (`app.routes.ts` inventory / storage-items / stock-movements),
но в `NAV_CATEGORIES` (app-layout) **нет** пункта «Склад» — страницы
недоступны из меню (только прямой URL). Тот же класс бага, что «два
входа» DOC-324, зеркально: «ноль входов».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Добавить nav category `warehouse` / «Склад» с items:
  `/inventory` (Дашборд / Остатки — по title страницы),
  `/storage-items`, `/stock-movements`.
ШАГ 2 — Согласовать labels с page headers (не «Склад» vs «Inventory»).
ШАГ 3 — Обновить PAGE-TZ-INDEX + Executor report (auto).

НЕ: удалять routes; не redesign dashboard.

AC: три пункта видны в меню; capability-gate не ломает (если нет caps —
  как у materials). tsc/layout smoke. Executor report.
ПРОМПТ: Прочитай GEMINI.md + tasks/TZ-UX-301-warehouse-nav.md. Выполни.
Checklist docs/agent-checklists/TZ-UX-301.md + Executor report. Push нет.
