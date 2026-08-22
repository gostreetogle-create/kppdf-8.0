# TZ-DESK-422 — Стол: группировка списка заказов по заказчику

**Дата:** 2026-08-22 · **Исполнитель:** freebuff · **Статус:** DONE

## Outcome

PASS. Stable client-side groupBy на уже отфильтрованном/отсортированном списке visibleOrders. Разделитель с названием заказчика перед каждой группой, компактный CSS (min-height 1.25rem, micro-typography). Одиночные заказчики тоже получают разделитель.

## Что сделано

1. `DeskOrderGroup` интерфейс и `groupedOrders` computed — stable groupBy по `counterpartyId`, сохраняя порядок первого попадания
2. Шаблон: `@for (group of groupedOrders())` → разделитель + `@for (order of group.orders)`
3. CSS: `.manager-desk__customer-sep` — micro-typography, минимальный padding
4. Spec: 2 новых теста — базовый с тремя разными заказчиками (3 разделителя) и смешанный (2 заказа cp1, 1 cp2 = 2 разделителя)

## Изменённые файлы

- `frontend/src/app/pages/desk/manager-desk.page.ts`
- `frontend/src/app/pages/desk/manager-desk.page.spec.ts`

## Gates

| Gate | Result |
|------|--------|
| `tsc --noEmit` | PASS |
| `jest manager-desk` | **24/24** PASS |
| `lint` | PASS (0 errors) |

## Known limits

- Браузерный проход не выполнялся (dev-сервер недоступен) — primary signal: gates PASS
- Порядок групп — «по первому попаданию» (как в TZ по умолчанию)
- Счётчик заказов в разделителе не добавлен (не входит в acceptance)

closed_at: 2026-08-22T14:06:42+03:00