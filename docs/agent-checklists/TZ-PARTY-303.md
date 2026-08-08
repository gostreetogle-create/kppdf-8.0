# TZ-PARTY-303 checklist

> Status: **DONE** (2026-08-08) · Wave: PARTY-DOCS #3 · Depends: PARTY-301 DONE  
> Source: `tasks/_archive/2026-08/TZ-PARTY-303.done.md`

## Claim slot
- agent_id: agent-3e757640b7 (Cursor executor)
- claimed_at: 2026-08-08
- workspace: D:\kppdf-8.0

## Acceptance
- [x] CP FullEditor kind C + list create/edit/delete
  - `counterparty-full-editor-dialog.component.ts`: `variant="content"` +
    `min(1120px, calc(100vw - 2rem))`, секции Основные / Реквизиты / Банк / Подписант
  - страница: «+ Создать» в tools, `app-pi-row-actions` (✎ / ×), удаление через
    `AlertDialogComponent` → soft delete
  - роли обязательны и читаются из `/counterparty-roles`; fallback на посеянный набор
- [x] Stub badge в списке/карточке
  - список: бейдж «временный» на колонке ИНН + счётчик в тулбаре (с PARTY-301)
  - редактор: подсказка «впишите реальный — метка снимется» при `innIsStub`
- [x] Клиент не шлёт organizationId
  - `buildPayload()` собирает только DTO-поля; тест «never sends organizationId»
- [x] counterparties.page.md + PAGE-TZ-INDEX
  - `docs/pages/counterparties.page.md` создан; индекс обновлён

## Gates
- [x] FE tsc — в зоне counterparties/pi-counterparty ошибок нет (в репо есть
      предсуществующий дрейф в чужих spec-файлах, не из этой волны)
- [x] Angular development build PASS (typecheck шаблонов)
- [x] counterparties tests: 18/18 PASS (editor 8, page 6, service 4)
- [x] targeted ESLint: 0 errors
- [x] `git diff --check`

## Closeout
- [x] Archive: `tasks/_archive/2026-08/TZ-PARTY-303.done.md`
- [x] Lock: `.mimocode/locks/TZ-PARTY-303-counterparty-fulleditor.lock`
- [x] progress.md
- [x] Commit/push; deploy NO

## Out of scope (по TZ)
- DaData / ИНН-lookup → TZ-INN-301 (PARKED)
- CP photo vault → ASSETS-301
- Site CRUD / площадки → ORDERS-303
