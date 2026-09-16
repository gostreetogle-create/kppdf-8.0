# Audit: «Создать текст» — select категории без «+» (2026-09-13)

## Symptom (PO)

Диалог «Создать текст»: Категория / Подкатегория — голые `<select>`. Непонятно, где создать категорию, чтобы выбрать в списке. Нужен **плюс рядом с select**, как в UI-ките.

## Kit SoT

- **`app-pi-select-add-row`** (`frontend-nx/libs/ui/paper-and-ink/.../pi-select-add-row.component.ts`, TZ-UI-PLUS-605)
- Демо: `/forms` Section III «Select + inline create»
- Стили кнопки: класс `pi-select-add-btn` (компонент + kit)
- **Не** изобретать flex + произвольный `+`; **не** копировать `pi-registry-create-button` как замену ряду (registry-кнопка — toolbar accent; для поля формы канон = select-add-row)

## Nested create SoT

- Диалог уже есть: `TextBlockCategoryFormDialogComponent` (`parentId` → подкатегория, без → корень)
- Эталон wiring: `module-form-dialog.openCreateCategory` + `onDialogCloseOnce` (каталог) — тот же nested-dialog паттерн, другой entity/dialog
- Реестр: `/registries/text-block-categories` (остаётся SoT списка; inline не заменяет реестр)

## Gap

`text-block-form-dialog.component.ts` — два select без `app-pi-select-add-row` и без nested create.
