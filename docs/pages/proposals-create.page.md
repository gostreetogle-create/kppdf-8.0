# /proposals/create — Создать КП

**Route:** `/proposals/create` (guarded lazy)
**TZ:** **310** route · **311** design-spec · **312** shell · **314 DONE** left rail · **315** inspector · **316** template · **320** print PARKED
**Spec:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md)

## Сейчас

- Три зоны shell + sticky Deals chrome.
- Left: `app-proposal-product-rail` — поиск/список изделий (`ProductsService.list`), «Добавить».
- Write-path draft: **in-memory** `draftLines` на странице (не PATCH quotation). Persist — later TZ.
- Center показывает черновые строки или empty copy.
- Right — placeholder до 315.

## Entities

| UI | Код |
|----|-----|
| КП | Quotation |
| Бланк | Organization |
| Изделие | Product |

## Не здесь

Печать, ModuleMaterials, inspector 315, template 316, deploy.
