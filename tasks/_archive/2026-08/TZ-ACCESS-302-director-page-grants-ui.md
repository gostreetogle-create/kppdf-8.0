═══════════════════════════════════════════════════════════════
TZ-ACCESS-302: UI — Админ назначает Директора; Директор галочки страниц
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Admin / People access
ЗАВИСИМОСТИ: TZ-ACCESS-301
LAYER: 3
PAGES: /admin/users ; (новый) /admin/access или вкладка на user
PAGE_DOCS: —

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/core/capabilities/;
frontend/src/app/pages/admin/;
docs/agent-checklists/TZ-ACCESS-302.md;
docs/pages/PAGE-TZ-INDEX.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Vision: Админ открывает доступ Директору; Директор отмечает сотруднику
разделы галочками. Сейчас nav почти всем подряд (кроме admin caps).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Nav filter: показывать item только если page key ∈ effective pages
  из /auth/me (после 301).
ШАГ 2 — Админ: назначение роли Director пользователю (уже roles UI —
  проверить seed и UX; добить если нельзя).
ШАГ 3 — Экран «Доступ к разделам» (Директор или Admin): список сотрудников
  + checkbox list PAGE_KEYS (группировать как nav categories). Сохранение
  user.pageAccess / API из 301. Без per-button матрицы.
ШАГ 4 — Route guard (CanMatch): нет page → /forbidden (как capabilities).
ШАГ 5 — Executor report.

НЕ: Гант, КП, складская логика.
НЕ: отдельный «конструктор прав» на 50 экранов.

AC: работник без page:materials не видит пункт и не открывает URL;
  директор сохраняет галочки; smoke jest/guard; Executor report.
ПРОМПТ: GEMINI.md + tasks/TZ-ACCESS-302-director-page-grants-ui.md.
Checklist TZ-ACCESS-302. Push нет.
