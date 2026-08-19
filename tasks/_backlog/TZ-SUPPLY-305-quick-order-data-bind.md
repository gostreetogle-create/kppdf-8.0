# TZ-SUPPLY-305 — Быстрый заказ: данные, справочники, sync (PARK)

**Status:** PARK — брать **только** после PO PASS на `TZ-SUPPLY-304` UI mock + canon.

```
PAGES: /supply ; /dictionaries/*
DEPENDS ON: TZ-SUPPLY-304 DONE
CONFLICT KEYS: backend/src/modules/supply/** ;
  backend/src/modules/status/** ;
  frontend/src/app/pages/supply/**
```

## Суть (черновик для PO)

1. **Новая сущность** `SupplyRequest` (или расширение PurchaseRequest) — строка быстрого заказа **без обязательного** `materialId` / `orderId`: title, article, categoryId, color, photo, supplierOrgId, productUrl, qty, unitKey, notes, statusId→EntityStatus, priority, organizationId, requester, optional orderId, needByDate.
2. **Справочники** (EntityStatus + admin UI):
   - `entityType=supply_request` — статусы (seed: «В работе», «Запрошено у поставщика», «Заказано», «Получено», «Отменено»)
   - категории заявки (Метизы, Оснастка, …) — отдельный dict или reuse categories с tag
   - приоритет — enum или dict (sync с Order.priority labels)
3. **Quick-create API:** POST organization (supplier) inline; optional POST material later — не блокер save.
4. **Sync с реестром:** при status «Заказано» → optional spawn SupplyTask или link; правило описать в canon + COUPLING-MAP строка.
5. **Migrate Excel:** импорт из Desktop HITL — отдельная TZ, не здесь.

## НЕ делать в 305

- Ломать SupplyTask enum без migration plan
- PurchaseOrder full flow
- Wipe / seed production

PO: подтверди entity name и sync rule перед активацией.
