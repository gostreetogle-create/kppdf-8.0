# TZ-SUPPLY-305 — SUPERSEDED

> Черновик заменён исполняемым ТЗ:
> - Backend: `tasks/TZ-SUPPLY-305-quick-order-data-bind.md` (READY)
> - Frontend: `tasks/TZ-SUPPLY-311-quick-order-frontend-wiring.md` (READY)
>
> Решения, бывшие «для PO» в черновике, приняты дефолтом 2026-08-20:
> 1. Новая сущность `SupplyRequest` (не расширять PurchaseRequest/SupplyTask).
> 2. Списки раздельны; при статусе «Заказано» — spawn `SupplyTask` (link по `linkedSupplyTaskId`) только при наличии `orderId`+`materialId`.
> 3. Фото — реальный upload через существующий `/api/photos`.
