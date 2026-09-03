# TZ-NX-DOCSTUDIO-S17A-TABLE-TEMPLATE-COLUMN-LOCK: колонки только для ручной таблицы

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S16 DONE  
**CONFLICT KEYS:** `studio-table-properties.component.ts`; `studio-properties-panel.component.ts`

## PO rule

Если выбран **вид таблицы** из реестра (`tableTemplateId`) или источник строк **не manual** (catalog / КП / заказ) — структура колонок **read-only** (тип, key, align, add/remove).  
Редактор колонок — **только** для `manual` без применённого вида **или** явного «своя таблица».

## ИСХОДНОЕ

`studio-table-properties.component.ts` всегда показывает column editor (type text/number/date, add column) даже когда вид «Продукты» из реестра уже задал колонки.

## ЧТО ДЕЛАТЬ

1. `columnsEditable(block)` = `dataSource.type === 'manual'` AND no `tableTemplateId` (или flag `settings.customColumns`).
2. Если не editable: показать read-only summary «Колонки из вида: …» + ссылка «Сменить вид» / «Отвязать вид» (отвязка → manual, сохранить snapshot колонок).
3. Toggles видимости колонок — оставить (оператор может скрыть колонку на документе).
4. «Сохранить как вид таблицы» — только когда editable или PO-approved override.
5. Spec: applied template → no type `<select>`.

## КРИТЕРИИ ПРИЁМКИ

1. Вид «Продукты» → нет редактора type/key/add.
2. Manual table → редактор как сейчас.
3. `nx test` studio-table + `nx build kppdf-web` last.

## Archive

`tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S17A-TABLE-TEMPLATE-COLUMN-LOCK.done.md`
