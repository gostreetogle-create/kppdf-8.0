# UI Fact Card (карточка факта)

> Компактный блок: **подпись · значение · короткое пояснение**.
> Для инспекторов, паспортов, денег — не для длинных форм.
> Аудит карточки изделия: [`../audits/2026-08-08-product-detail-side-panels-cost.md`](../audits/2026-08-08-product-detail-side-panels-cost.md).

**Код:** `frontend/src/app/shared/ui/fact-card/` · `app-pi-fact-card` / `app-pi-fact-stack`
**TZ:** UX-FACT-301 (kit) → DETAIL-301+ (wiring, не этот файл).

## Зачем

PO: боковые панели «каша текста». Один визуальный атом везде → потом sweep.

## API

```html
<app-pi-fact-stack title="Деньги" headingId="fact-money">
  <app-pi-fact-card
    label="Прайс"
    value="12 900 ₽"
    caption="Цена витрины / для КП"
    [mono]="true"
  />
  <app-pi-fact-card
    label="Себест."
    value="8 100 ₽"
    variant="emphasis"
    [mono]="true"
  />
</app-pi-fact-stack>
```

Слот `[actions]` для кнопок (под value/caption, не в одну строку с цифрой).
Варианты: `default` | `emphasis` | `danger`.

## Правила

1. Label: `pi-label` 13px (TYPE-303) — не `eyebrow` / micro.
2. Value: plain `text-base`; **mono** (₽ / габариты) → `text-sm font-mono` (TYPE-302).
3. Caption ≤ 1–2 коротких предложения; не роман.
4. Кнопки не смешивать с value в одну строку без stack.
5. Не использовать для composition-tree строк.
6. Wiring: product/module detail + BomPanel inspector — DETAIL-301…304 **DONE**.
   Site adoption audit: [`../audits/2026-08-09-fact-card-adoption.md`](../audits/2026-08-09-fact-card-adoption.md) (FACT-302).

## Adoption

- Order detail passport (`/orders/:id`) uses `PiFactStack` for number, customer, object, status, order date, and materials source. Quotation money remains intentionally absent.
