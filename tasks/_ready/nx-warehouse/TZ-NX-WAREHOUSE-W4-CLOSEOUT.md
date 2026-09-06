# TZ-NX-WAREHOUSE-W4-CLOSEOUT: FIC + DOMAIN-MAP + page.md

**РОЛЬ АГЕНТА:** Executor — Freebuff  
**ЗАВИСИМОСТИ:** W3 DONE  
**LAYER:** 2 · **SIZE:** S  

**CONFLICT KEYS:**  
`docs/DOMAIN-MAP.md` ;  
`docs/FEATURE-INTEGRATION-CHECKLIST.md` (если чеклист в PR) ;  
`docs/pages/PAGE-TZ-INDEX.md` ;  
`docs/pages/{warehouses,storage-items,stock-movements}.page.md` ;  
`docs/CAPABILITY-LEDGER.md` (если есть складские capabilities)

IMPLICIT CONFLICT: nx build kppdf-web (smoke after doc-only ok if no FE change)

---

## ЧТО ДЕЛАТЬ
1. DOMAIN-MAP: Warehouse NX column = live routes (не gap).
2. PAGE-TZ-INDEX: строки W1–W4 DONE.
3. page.md: NX SoT notes; legacy = эталон до cutover.
4. FIC A: routes/nav/permissions/page docs — все строки закрыты.
5. Короткий evidence checklist в `docs/agent-checklists/WAVE-NX-WAREHOUSE.md` → DONE.

## НЕ ИЗМЕНЯТЬ
Product code unless FIC gap found (then minimal fix).

## КРИТЕРИИ ПРИЁМКИ
DOMAIN-MAP + PAGE-TZ-INDEX + FIC согласованы; WAVE status DONE.
