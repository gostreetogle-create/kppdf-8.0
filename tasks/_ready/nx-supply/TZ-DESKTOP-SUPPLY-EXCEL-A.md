═══════════════════════════════════════════════════════════════
TZ-DESKTOP-SUPPLY-EXCEL-A: Excel path A — match по справочникам
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Executor Desktop (agent_id: claude)
ЗАВИСИМОСТИ: BE invoice fields DONE (колонки invoice/paid/orderLabel)
LAYER: 3
PAGE_DOCS: desktop/docs (import targets note); desktop/README.md

CONFLICT KEYS: desktop/src/core/import-targets.ts; desktop/src/core/import-mapping*.ts (supplyRequest columns); desktop/docs/* если канон колонок; связанные tests

---

### Preflight
- **Context read:** audit §8 path A; supplyRequest target уже есть, нет Sheets-паритета
- **Key Constraints:** HITL write; match material/supplier/order by name/SKU; red rows on miss
- **Deliverable:** form columns + validation messages RU; export-with-data если пилот позволяет

## ЧТО ДЕЛАТЬ
1. Расширить колонки supplyRequest: invoiceNo, deliveryNote, paid, orderLabel, qty, unit, neededBy, …
2. Match rules: article/name → materialId; supplier name → Organization; order number → orderId.
3. Несовпадение → invalid row (не silent create) — create material остаётся UI S5 / ручной HITL.
4. Docs + tests mapping.

## НЕ
Multi-sheet pack B; NSIS llama; NX pages; dropDatabase.

## AC
- [ ] Форма/импорт с новыми колонками; miss = красная строка
- [ ] desktop gates; bump patch version только если меняется installer-facing — иначе skip bump
- [ ] archive

CLAIM: agent_id claude.
