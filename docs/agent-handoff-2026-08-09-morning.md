# Завтра 2026-08-09 — handoff (не потерять)

## Вердикт TZD-24

**PASS.** feat `1ae611e` · closeout `08424a1`.  
Deploy **не** катили — zip на Synology только по «задеплой».

## Очередь

1. **TZ-COST-304** — аудит: сумма при вставке изделия vs себестоимость → D1–D5 → draft 305.
2. **TZ-CATALOG-335** — dark composition depth (не монохром).
3. **TZ-DICT-313** — аудит: профили быстрых create-форм S/M/L в Справочниках → draft 314–316.
4. По PO: **deploy** и/или **TZD-21**.

## Не терять (PARK / SoT)

- Composition cascade → Заказы: **TZ-ORDERS-302** + pattern lock + скрин.
- Quick-create forms: **DICT-313** (настройки галочками; диалоги в точках «Добавить»).

## Промпты

```text
# 304
docs/PO-DIARY.md §1–§4 + tasks/_backlog/cost/TZ-COST-304-product-line-cost-audit.md
→ checklist → audit docs → D1–D5 → draft COST-305 → commit/push docs

# 335
GEMINI.md + tasks/_backlog/catalog/TZ-CATALOG-335-composition-tree-dark-depth.md
→ checklist → dark nest → gates → archive (no deploy)

# 313
docs/PO-DIARY.md §1–§4 + tasks/TZ-DICT-300.md +
tasks/_backlog/dictionaries/TZ-DICT-313-quick-create-form-profiles-audit.md
→ checklist TZ-DICT-313 → audit docs → D1–D8 → draft 314–316 → commit/push docs
```
