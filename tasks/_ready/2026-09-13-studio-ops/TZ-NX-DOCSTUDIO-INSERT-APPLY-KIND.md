# TZ-NX-DOCSTUDIO-INSERT-APPLY-KIND: Insert/источник применяет макет из реестра (не хардкод 3 колонок)

> **SIZE:** S · **PACK:** `tasks/_ready/2026-09-13-studio-ops/`  
> **РОЛЬ:** Claude или Freebuff  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** пересечение с TABLE-PHOTO / COL-WIDTH по studio-editor — не параллелить с ними на `studio-editor.page.ts`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-catalog-insert.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts; frontend-nx/libs/data-access/src/lib/doc-studio/` (только list filter helpers если нужны)

**AUDIT:** `docs/audits/2026-09-13-studio-table-kind-vs-source.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## Domain preflight

- Insert сегодня: `createTableBlock` → `STUDIO_DEFAULT_TABLE_COLUMNS` (3 колонки) + `setBlockCatalogSource` — **без** `TableTemplate`.  
- В реестре есть виды с `dataSource` / имена «Продукты» и т.п.  
- Выбор вида вручную = `buildTableSettingsFromTemplate` + rehydrate (S47).  
- Necessity: убрать ощущение хардкода; один write-path — пресет из БД.

## ЧТО ДЕЛАТЬ

1. Helper `pickTableTemplateForSource(templates, dataSourceType): TableTemplate | null`:  
   - сначала `template.dataSource === dataSourceType` (и isActive);  
   - иначе единственный active с category/name match (products↔Продукты / modules↔Модули / …) — явная map в коде, без «угадай»;  
   - иначе null.
2. `insertCatalogTable` / `setBlockCatalogSource` / `onTableSourceChange` на catalog-*:  
   - list templates (или кэш props);  
   - если pick ≠ null → `patchTableSettings` через `buildTableSettingsFromTemplate` **до или сразу после** putDataSet, затем rehydrate (существующий путь S47);  
   - если null → оставить default columns + toast: «Нет вида таблиц для этого источника — создайте в Реестры → Виды таблиц» + не врать что макет «Продукты» применён.
3. Select «Вид» в props: при catalog source **предпочитать** показывать/фильтровать templates с matching `dataSource` (остальные — группа «Другие» или внизу). Inactive не в списке (если list уже фильтрует — проверить).
4. Не создавать второй seed хардкодом колонок в FE — SoT = реестр; при отсутствии вида в БД — toast, не раздувать STUDIO_DEFAULT до 7 колонок «как Продукты».
5. Specs: insert products + mock template with dataSource catalog-products → block получает template columns (sku/photo/…); без template → toast + default 3 col.  
6. Gates + page.md одна строка.

## НЕ

Удалять TableTemplate; wipe; менять BE schema без нужды (dataSource поле уже есть); параллелить с PHOTO-BROKEN / COL-WIDTH на тех же файлах.

## ACCEPT

1. «Вставить таблицу изделий» при наличии вида с `dataSource: catalog-products` → на листе колонки этого вида (не только 3 default).  
2. Select Вид показывает выбранный id.  
3. Нет вида → честный toast, без тихого «как будто Продукты».  
4. Build/tests green.
