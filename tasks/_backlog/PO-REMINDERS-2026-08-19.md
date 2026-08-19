# PO reminders 2026-08-19 — backlog

> Ответы PO после рабочего дня. Исполнение по приоритету.

## Сейчас (агенты)

| ID | Тема | TZ |
|----|------|-----|
| ✅ search+50 | Заказчики поиск | `ad9cb800` |
| ✅ pagination | Заказчики pager/total | `e41dec0d` |
| ✅ desk filter | Default all + localStorage per user | `cda4417b` |

## Очередь TZ (планирование → исполнение)

| PO пункт | TZ | Суть |
|----------|-----|------|
| Контакт к ООО | **TZ-PARTY-305** | `contactPersonId` в FullEditor заказчика; Person picker; lastName optional; phone unique |
| Изготовитель/контора в заказе | **TZ-ORDERS-307** | `Order.organizationId` (наша Organization-исполнитель); dropdown в форме; видно в снабжении |
| Фото крупно | **TZ-UI-344** | Shared `PiPhotoLightbox`; audit + wire: каталог, composition-tree |
| Заказ: удалить со стола | **TZ-DESK-418** | Delete order из `/desk` (API есть) |
| NG8102 warning | **TZ-UI-345** | PO пришлёт текст — triage |
| Снабжение UX | **DEFER** | PO даст отдельное ТЗ на «нормальный вид» + быстрый материал |

## Уже есть (проверить на prod после deploy)

- Изменение номера заказа — поле в `order-form-panel` (create/edit на `/orders` и desk edit panel)
- Удаление заказа — row action на `/orders` (не на `/desk`)
