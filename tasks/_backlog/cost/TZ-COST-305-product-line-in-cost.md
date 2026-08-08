═══════════════════════════════════════════════════════════════
TZ-COST-305: Product-line вклад в себестоимость + default/copy в picker
═══════════════════════════════════════════════════════════════

> DONE · archived `tasks/_archive/2026-08/TZ-COST-305.done.md`
> Канон решений: `docs/audits/2026-08-09-product-line-cost-vs-override.md` (D1–D5)

STATUS: DONE

РОЛЬ АГЕНТА: Backend + Frontend (один агент, Layer 3 на cost-calculation + picker)

ЗАВИСИМОСТИ:
- TZ-COST-301…303 DONE
- TZ-COST-304 docs-DONE (D1–D5 зафиксированы)
- Не параллелить с другим агентом на `cost-calculation.service.ts`

LAYER: 3

PAGES: `/products/:id` (BOM picker + Себестоимость)
PAGE_DOCS: `docs/pages/product-detail.page.md`; audit 2026-08-09

CONFLICT KEYS:
backend/src/modules/cost-calculation/cost-calculation.service.ts;
backend/src/modules/cost-calculation/cost-calculation.service.spec.ts;
backend/src/modules/cost-calculation/cost-calculation.schema.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-COST-305.md;
docs/agent-checklists/_active-map.md;

---

## Domain preflight

| Слово | Код-канон |
|-------|-----------|
| Цена в составе | `composition[].unitPriceOverride` (product-line only) |
| Себест. ребёнка | `Product.costPrice` |
| Прайс ребёнка | `Product.listPrice` (только default UI) |
| Себест. родителя | CostCalculation → activate → parent `costPrice` |

Проверено: audit 2026-08-09; `cost-calculation.service.ts` ~100–113 skips product;
`composition-line.schema.ts` `unitPriceOverride?`; picker без prefill.

Формула вклада (D1=b):
```
contrib(line) =
  if line.lineType !== 'product': (уже покрыто material/module)
  else if unitPriceOverride != null: unitPriceOverride * qty
  else if child.costPrice != null: child.costPrice * qty
  else: 0 + infos warn
```
Вклад **не** входит в базу overhead% (P0: overhead остаётся % от materials only).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Override пишется в composition, cost его игнорирует → PO видит 0.
2. Picker: «Цена переопределения», default пустой.
3. BOM inspector (COST-303) может не показывать вклад product-line — поправить если есть колонка «вклад».

---

## ЧТО ДЕЛАТЬ

### 1. BE — product-lines в create()
- После module walk: для каждой `lineType==='product'` загрузить child, посчитать contrib.
- Положить вклад в snapshot так, чтобы UI/API могли показать сумму (предпочтительно отдельный массив `productLines: [{ productId, name, quantity, unitCost, total, source: 'override'|'costPrice'|'none' }]` + `totalProductLineCost`; **не** ломать существующие materials/labor поля без миграции клиентов).
- `totalCost = materials + labor + overhead + totalProductLineCost`.
- `infos` при source=none.
- activate → `Product.costPrice = totalCost` (как в 302) — убедиться, что новый bucket учтён.

### 2. BE tests
- Parent только product-line + override → total отражает override×qty.
- Parent product-line без override, child.costPrice=X → X×qty.
- Parent product-line без override и без costPrice → 0 + info.
- Regression: material+module rollup без product-lines не изменился.

### 3. FE picker
- Label: **«Цена в составе, ₽»**; короткий hint под полем (RU).
- При выборе изделия: prefill `costPrice` иначе `listPrice` иначе ''.
- Не писать в карточку ребёнка; payload как сейчас (`unitPriceOverride?`).

### 4. FE BOM / cost UI
- На карточке изделия: вклад product-line виден в inspector или в блоке себест. (если уже есть строки вклада — добавить kind product).
- Не трогать module cost-preview API контракт без нужды.

### 5. Docs + closeout
- `product-detail.page.md` — 5–10 строк канона цены в составе.
- Checklist + archive по GEMINI; map: 305 DONE.

---

## ИЗМЕНЯТЬ

Только CONFLICT KEYS (+ progress/ARCHITECTURE/lock/archive по TZF).

## НЕ ИЗМЕНЯТЬ

- Ручная цена модуля; override на non-product
- Автозапись listPrice/costPrice ребёнка
- Order / КП commerce; StorageItem
- `app-composition-tree` стили (335); module-detail (336) — чужие TZ
- Рекурсия composition ребёнка (D1≠c)
- Deploy

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Parent с product-line+override → CostCalculation.totalCost включает override×qty
- [ ] Без override → child.costPrice×qty; оба пусты → 0 + infos
- [ ] overhead% не умножается на product-line bucket
- [ ] Picker: RU copy + prefill D3; jest picker spec зелёный
- [ ] BE unit tests на 3 сценария + regression module/material
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [ ] `cd backend && pnpm test -- cost-calculation`
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] product-detail.page.md обновлён; нет silent 0 без info
- [ ] Archive + lock; **не** трогать чужой `_active` 336

known_limitation:
- Live-рекурсия BOM ребёнка вместо stale costPrice — out of scope (later).
- Module detail parity (336) может параллельно менять layout — не править module routes здесь, если не нужно для picker shared.

---

## Промпт исполнителю (когда map выдаст)

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-COST-305.md + checklist docs/agent-checklists/TZ-COST-305.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/audits/2026-08-09-product-line-cost-vs-override.md и
tasks/_backlog/cost/TZ-COST-305-product-line-in-cost.md — выполни TZ.
```
