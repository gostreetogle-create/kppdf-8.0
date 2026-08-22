# TZ-UI-405 — Detail-страницы: один back-affordance + выровненная глубина крошек

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude (executor)

## Что сделано (по решениям PO, все 4 пункта в TZ)

- **B-02 (глубина крошек):** `module-detail`, `material-detail`, `order-detail`
  приведены к 2 уровням («Раздел → имя/номер»), убран дублирующий route-сегмент
  («Модули»/«Материалы»/«Заказы»); `product-detail` — эталон, не менялся.
- **B-01 (back-affordance):** ghost-кнопка «← Назад» (TZ-UX-313) убрана с
  `module-detail`, `product-detail`, `material-detail`; остался один back через
  первую крошку `page-chrome` (`data-test="back-button"`). `onBack()`/`backLabel()`
  оставлены — используются в loadError-блоке (`back-button-error`).
- **B-03 (kit-компонент):** `pi-breadcrumb.component.ts` / `pi-breadcrumb-item.component.ts`
  помечены `@deprecated` в JSDoc (unused outside /navigation kit showcase,
  real pages use PiPageChromeComponent[crumbs]); код и демо не удалялись.
- **B-04 (builder/:id):** подтверждённая intentional exception — добавлен только
  комментарий рядом с TZ-DOC-324, поведение не менялось.

## Файлы

- `frontend/src/app/pages/modules/module-detail.page.ts` (crumbs + ghost back)
- `frontend/src/app/pages/products/product-detail.page.ts` (ghost back)
- `frontend/src/app/pages/materials/material-detail.page.ts` (crumbs + ghost back)
- `frontend/src/app/pages/orders/order-detail.page.ts` (crumbs только)
- `frontend/src/app/shared/ui/pi-breadcrumb.component.ts`, `pi-breadcrumb-item.component.ts` (@deprecated)
- `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` (комментарий B-04)
- `frontend/src/app/pages/materials/material-detail.page.spec.ts` (регресс-ассерты AC-2/AC-3)
- docs: `module-detail.page.md`, `material-detail.page.md`, `PAGE-TZ-INDEX.md`

## Verification

- acceptance criteria: PASS (1–6)
- typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
- tests: PASS (focused jest 23/23: module-detail, product-detail, material-detail, order-detail)
- lint: PASS (eslint по 8 файлам зоны, 0 errors)
- checklist: ADDED (`docs/agent-checklists/TZ-UI-405.md`)
- progress.md: UPDATED
- status synchronization: PASS

## Known limits

- Browser primary (4 detail-маршрута вживую) не выполнен: FE dev-server :4200
  (чужой контур агента TZ-UI-404) упал во время сессии; не перезапускался во
  избежание конфликта. BE :3000 жив, прямой `POST /api/auth/login` (admin/admin123)
  → 200 с токеном. Покрытие: jest-рендер крошек + count `back-button` (AC-3) +
  статическая проверка шаблонов.

## Промпт/волна

- Запущено напрямую из `tasks/TZ-UI-405-breadcrumb-detail-cleanup.md`
  (PO-решения по B-01..B-04 уже в TZ), не через PROMPT-FREEBUFF.
