# TZ-UI-403 — Аудит консистентности breadcrumb/навигации

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

audit:
- `docs/audits/2026-08-22-breadcrumb-consistency-audit.md`
- Инвентаризированы все реализации breadcrumb в `frontend/src/app`: kit-only
  `app-pi-breadcrumb`/`app-pi-breadcrumb-item` (единственное использование — `/navigation`
  showcase) vs реально используемый `app-pi-page-chrome[crumbs]` на всех 4 реальных
  `:id` detail-маршрутах.
- Найден дублирующийся `data-test="back-button"` (два back-affordance на одном экране) на
  module/product/material-detail; order-detail — контрпример с одним back-affordance.
- Несогласованная глубина крошек (product-detail 2 уровня vs остальные 3, с дублирующим
  route-сегментом).
- `doc-constructor/builder/:id` — третий кастомный паттерн, без крошек вообще; помечен
  UNCERTAIN, не нарушение.
- 4 open questions для PO зафиксированы; предложен successor `TZ-UI-404` при подтверждении
  направления.

verification:
  - acceptance criteria: PASS
  - code gates: N/A (docs-only TZ; product code не менялся)
  - markdown/diff-check: PASS
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-UI-403.md`)
  - progress.md: N/A (файл отсутствует в репозитории; `_NOW.md` обновлён)
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - deploy/wipe: NOT RUN

known_limitation:
- Отдельный browser/screenshot проход не выполнялся — аудит основан на статическом чтении
  живого кода и `app.routes.ts`; успешник по open questions должен визуально сверить крошки
  на `/materials/:id`, `/products/:id`, `/modules/:id`, `/orders/:id`.
