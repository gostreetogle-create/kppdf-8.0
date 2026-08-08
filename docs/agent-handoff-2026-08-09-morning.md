# Завтра 2026-08-09 — handoff (не потерять)

## Вердикт TZD-24

**PASS.** feat `1ae611e` · closeout `08424a1` · archive `tasks/_archive/2026-08/TZD-24.done.md`.  
Deploy **не** катили — zip на Synology volume только по «задеплой».

## Очередь

1. **TZ-COST-304** — аудит: сумма при вставке изделия vs себестоимость (docs → решения → 305).
2. **TZ-CATALOG-335** — dark composition depth (скрин монохрома).
3. По PO: **deploy** и/или **TZD-21**.

## Не терять (PARK / SoT)

- Composition cascade → Заказы: **TZ-ORDERS-302** + pattern lock audit + скрин в `docs/pages/assets/`.
- Канон UI: `docs/pages/ui-composition-tree.md` §Переиспользование.

## Промпты

```text
# 304
docs/PO-DIARY.md §1–§4 + tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md
→ checklist TZ-COST-304 → audit docs only → D1–D5 → draft COST-305 → commit/push docs

# 335
GEMINI.md + tasks/_backlog/catalog/TZ-CATALOG-335-composition-tree-dark-depth.md
→ checklist → dark nest depth → gates → archive (no deploy)
```
