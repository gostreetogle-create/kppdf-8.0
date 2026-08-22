# TZ-UX-FORM-309 — archive

> Status: DONE
> TZ: tasks/TZ-UX-FORM-309-product-full-editor-pack.md
> Checklist: docs/agent-checklists/TZ-UX-FORM-309.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23T01:10:00+03:00
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit exit 0)
  - tests: PASS (product-form-dialog 28/28)
  - lint: PASS (0 errors, 18 pre-existing warnings)
  - checklist: ADDED
  - deploy: НЕ (TZ запрещает)

## Что сделано

- Убран внешний `lg:grid-cols-3` (`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">`)
- Три секции (Основные, Цена и учёт, Габариты и цвет) — каждая с `md:grid-cols-12 gap-x-3 gap-y-2`
- Основные: name col-span-8 + sku col-span-4; kind/status/isActive по col-span-4
- Цена: listPrice с max-w-[7rem] + categoryId col-span-4 + subcategory col-span-4
- Габариты: одна лента dimLength (md:col-start-1) / dimWidth / dimHeight / dimUnit / weightKg / unit
- nano-поля с max-w-[5.5rem] + dim-numeric (text-right tabular-nums)
- xs-поля (dimUnit/unit/listPrice) с max-w-[7rem]
- Цвет: max-w-[14rem], не full-bleed
- Описание/заметки: rows=2 без изменений
- Импорт коллбеков colSpanClass/controlMaxClass из field-capacity.ts
- ::ng-deep .dim-numeric input для text-right + tabular-nums
- formControlName не менялись; BOM write-path не трогались

## Conflict disclosure

- field-capacity.ts не менялся (только читаем через экспорт)
- module-form-dialog, material-form-dialog не трогались
- product-form-dialog.component.spec.ts не менялся (тесты 28/28 PASS без изменений)