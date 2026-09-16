# Audit — блок «Строки» (статус / Обновить / Сменить) в Свойствах таблицы

date: 2026-09-13  
PO: убрать — таблица = Выбрано → Insert.

## Вердикт

| Кусок | Решение |
|-------|---------|
| Status «Из Выбрано» + Обновить + Сменить | **DELETE** — дубль Insert; refresh уже в `onCatalogSelectionChange` |
| Превью «Строки таблицы» (сетка + qty) | **KEEP** |
| Select «Источник» для manual/КП/заказ / +Таблица | **KEEP** |
| Select для уже Insert catalog | **не показывать** (смена kind = новый Insert) |

TZ: `tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md`
