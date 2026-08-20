# TZ-SUPPLY-313 — Стратегия legacy-контура PurchaseRequest/PurchaseOrder

**Status:** BACKLOG (решение PO) · **Date:** 2026-08-20 · **Depends on:** TZ-SUPPLY-312
**Owner:** PO/архитектор · **Слой:** docs + backend (удаление/заморозка по решению)

## Почему это ТЗ

Аудит 2026-08-20 (`docs/audits/2026-08-20-supply-section-audit.md`) зафиксировал:
быстрый заказ и реестр работают на новых сущностях `SupplyRequest`/`SupplyTask`,
а `PurchaseRequest`/`PurchaseOrder` остаются в backend без UI и без потребителя
в текущем контуре. Это не доказанный runtime-дубль, но требует зафиксированной
стратегии сосуществования/миграции — иначе следующий агент/разработчик примет
решение наугад.

## Факты из живого кода (CONFIRMED 2026-08-20)

- `backend/src/modules/purchase-request/` — CRUD `/api/purchase-requests`,
  гибридная схема: дубль статусов `statusId` + `status`, полиморфные
  `entityType`/`entityId` + кэши `entityName/Sku/Unit`, дочерняя
  `PurchaseRequestItem` (`requestId`).
- `backend/src/modules/purchase-order/` — `/api/purchase-orders`, консолидация
  `SupplierOrder`; `POST /purchase-orders/:id/receive` создаёт `StockMovement` и
  обновляет `StorageItem.quantity` (единственный живой интеграционный хук).
- Оба модуля зарегистрированы в `backend/src/app.module.ts`
  (`PurchaseRequestModule`, `PurchaseOrderModule`).
- Desktop MCP: `kppdf_list_purchase_requests`, `kppdf_get_purchase_request`,
  `kppdf_list_purchase_orders`, `kppdf_get_purchase_order`
  (`desktop/docs/MCP.md`).
- **Данные на стенде: 0 записей** в `purchaserequests`,
  `purchaserequestitems`, `purchaseorders` (2026-08-20, локальный стенд).
- UI во frontend отсутствует; быстрый заказ не использует эти модули.
- `docs/data-model-audit.md`: рекомендации «оставить полиморфизм, удалить кэши»
  и «унифицировать статус на `statusId`» — не исполнены и не приоритизированы.

## Развилка для PO (A/B)

- **A. Официальный legacy-режим (рекомендуется сейчас).** Ничего не удаляем;
  контур помечается deprecated в CAPABILITY-LEDGER и DOMAIN-MAP; UI не строим;
  новые записи не создаются (только чтение + MCP-совместимость). Организация
  scope для новых записей не требуется (записей нет). Стоимость — ноль риска,
  нулевая поддержка.
- **B. Удаление после развязки MCP (successor).** Отвязать MCP-инструменты,
  вынести `receive`-логику (StockMovement/StorageItem) в общий сервис или
  документировать как неиспользуемую, затем снять модули и коллекции. Требует
  явного «да, разрешаю» PO (DANGEROUS-OPS-категория) и архива решения.
- (C. Миграция PurchaseRequest → SupplyRequest/SupplyTask отклонена: данных
  нет, статусные модели разные, выгоды нулевые.)

## AC (после выбора PO)

- A: CAPABILITY-LEDGER + DOMAIN-MAP + этот файл — единственное место правды;
  документированы MCP-зависимости; новых ТЗ на расширение контура нет.
- B: MCP без `purchase-*` инструментов; модули удалены из app.module;
  коллекции удалены; `git log`/архив фиксирует решение PO.

## НЕ ИЗМЕНЯТЬ

- `SupplyRequest`/`SupplyTask`/`Shipment` и их статусные матрицы.
- Схемы статусов legacy-контура до решения PO (это и есть предмет решения).
- Ничего не удалять без явного разрешения PO.

## Гейт

Решение PO (A или B) → одна короткая docs-волна (A) или тонкая TZ-волна (B).
Без решения контур остаётся в статусе «legacy, без UI, без данных» и не
блокирует приёмку раздела снабжения.
