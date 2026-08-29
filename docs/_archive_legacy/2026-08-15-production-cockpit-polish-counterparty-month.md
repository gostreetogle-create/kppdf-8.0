# Audit addendum: counterparty click + month zoom + Сегодня

**PO:** 2026-08-15 evening — после HARDEN 98.

## Counterparty click feels dead

Code **does** `setCounterpartyFilter` + `filtersChanged` → `applyFilteredActive`.
Smell: flyout stays on **список заказчиков** (не показывает отфильтрованные заказы);
Gantt может смениться незаметно. Demo orders без populate `counterpartyId` → все «Без заказчика».

**Fix IA (PO):** убрать вкладки Заказы|Заказчики. **Фильтры** = единое место:
приоритет, даты, **выпадающий список Заказчик**, Сброс (ярко, если dirty).
Список «Заказы» всегда заказы (уже отфильтрованные). Клик заказчика в select → Gantt сразу только его заказы.

## Week → Month

`н.32` непонятно. Zoom `week` → UX **«Месяц»**: тики шкалы = «август», «сентябрь» (RU);
плотность fit как у week; день остаётся детальным режимом.

## Сегодня (иконка календаря)

`onToday` + `scrollRequest('today')` уже есть; если today в range — PO может не видеть скролл.
Сделать: всегда scroll к маркеру; toast/hint короткий если маркер уже в кадре; не no-op.

Wave: `WAVE-PRODUCTION-COCKPIT-POLISH` · TZ **329** filters **DONE** · **330** month+today **DONE**.
