# TZ-NX-DOCSTUDIO-S7-TABLE-POLISH — колонки таблицы + категории видов

**РОЛЬ:** executor · **ЗАВИСИМОСТИ:** S7-WIP-CLOSEOUT DONE  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-table-editor.component.ts`; `studio-table-properties.component.ts`

## ЧТО ДЕЛАТЬ

1. Редактор колонок (add/remove/reorder/width) в свойствах таблицы — по `TableTemplateFormDialog` / legacy.
2. Категория вида таблицы при save (`TABLE_TEMPLATE_CATEGORIES`).
3. Починить PARK из _NOW: `TypeError` в `@for` reconcile table-templates dialog если воспроизводится.

## КРИТЕРИИ

- [ ] Колонки редактируются без выхода из студии
- [ ] Save вид → появляется в picker с категорией
- [ ] build green
