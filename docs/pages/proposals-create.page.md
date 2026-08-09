# /proposals/create — Создать КП

**Route:** `/proposals/create` (guarded lazy)
**TZ:** **310** route · **311** design-spec · **312 DONE** shell · **314** left rail · **315** inspector · **316** template center · **320** print PARKED
**Spec (SoT layout):** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md)

## Сейчас (после 312)

Трёхзонный shell под sticky Deals chrome:

- Left `data-test="kp-create-left"` — placeholder «Выберите изделие…»
- Center `data-test="kp-create-center"` — A4 sheet placeholder
- Right `data-test="kp-create-right"` — placeholder «Укажите нашу фирму…»
- Desktop ≥1280: три колонки всегда видны
- Уже: toggles «Товары» / «Параметры», одновременно ≤1 панель, Escape закрывает

Quotation API / picker / шаблон / печать — ещё не подключены (314–316 / 320).

## Entities

| UI | Код |
|----|-----|
| КП | Quotation / proposals routes |
| Бланк | Organization |
| Клиент | Counterparty |

## Не здесь

Печать пачкой, schema family rewrite, ModuleMaterials, deploy.
