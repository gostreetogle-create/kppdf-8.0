# Dialog layout canon audit — FORM-305

**Date:** 2026-08-08
**Scope:** `TZ-UX-FORM-305` Wave A only
**Rule:** visual section wrappers only; FormControl names, payloads, API calls, and confirm dialogs unchanged.

## Wave A result

| Dialog                                                                   | Result   | Sections                                                                                        |
| ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `pages/products/product-form-dialog.component.ts`                        | migrated | Основные данные, Категория, Цены, Габариты, Цвет (RAL), Состав, Описание и заметки, Изображения |
| `pages/modules/module-form-dialog.component.ts`                          | migrated | Основные данные, Габариты, Дополнительно                                                        || `pages/dictionaries/color-references-form-dialog.component.ts` | migrated | Основные данные, Дополнительно |
| `pages/dictionaries/color-reference-form-dialog.component.ts` | outlier | Existing specialized singular color editor; Wave A used the plural dialog path and this file remains unchanged. |

| `pages/dictionaries/category-form-dialog.component.ts`                   | migrated | Основные данные                                                                                 |
| `pages/dictionaries/document-template-category-form-dialog.component.ts` | migrated | Основные данные                                                                                 |
| `pages/dictionaries/text-block-category-form-dialog.component.ts`        | migrated | Основные данные, Дополнительно                                                                  |
| `pages/orders/order-form-dialog.component.ts`                            | migrated | Основные данные, Быстрый заказчик, Позиции, Заметки                                             |
| `pages/commercial/proposals/proposal-form-dialog.component.ts`           | migrated | Основные данные, Позиции, Заметки                                                               |
| `pages/people/people-form-dialog.component.ts`                           | migrated | Основные данные, Контакты и должность, Виды работ и заметки                                     |
| `pages/inventory/warehouse-form-dialog.component.ts`                     | migrated | Основные данные                                                                                 |
| `pages/inventory/stock-movement-form-dialog.component.ts`                | migrated | Основные данные                                                                                 |

## Outliers / explicitly not in Wave A

| Dialog                                                                       | Reason                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- || `pages/materials/material-form-dialog.component.ts` | Already the canonical Material-style reference; no further visual migration required. |

| `pages/modules/module-materials-form-dialog.component.ts`                    | Specialized nested materials editor; not listed in Wave A.                            |
| Other `*form*dialog*.ts` (contracts, organizations, work types, admin, etc.) | Wave B / future sweep; no changes in this commit.                                     |
| Confirm/delete dialogs                                                       | Kind A; explicitly excluded by TZ.                                                    |

No business logic, API/DTO, form control names, or submit payloads were changed.
