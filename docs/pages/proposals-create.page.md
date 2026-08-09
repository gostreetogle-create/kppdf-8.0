# /proposals/create — Создать КП

**Route:** `/proposals/create` (guarded lazy, SALES-310 stub → studio shell 312+)
**TZ:** **311 DONE** (этот page doc + design-spec) · **312** shell · **314** left rail · **315** inspector · **316** template center · **320** print PARKED
**Spec (SoT layout):** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md)

## Сейчас (после 310)

Безопасный route-stub: заголовок «Создать КП» и общий chrome **Сделки → КП**, жёлтые подchips **Создать КП | Все КП**. Stub **не** вызывает quotation API и **не** рисует три колонки.

## Цель студии (spec 311)

Desktop ≥1280: **Left 280–320px** (товары) · **Center flex** (превью A4) · **Right 300–340px** (Organization / % / оценка). Tablet/mobile — center + panels/drawers. Пустые фразы и ширины — только в spec.

## Entities

| UI     | Код                          |
| ------ | ---------------------------- |
| КП     | Quotation / proposals routes |
| Бланк  | Organization                 |
| Клиент | Counterparty                 |

## Не здесь

Печать пачкой, schema family rewrite, ModuleMaterials, deploy.
