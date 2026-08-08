# Аудит: где внедрить FactCard

**Дата:** 2026-08-09 (filename) / closed 2026-08-08  
**Канон:** [`docs/pages/ui-fact-card.md`](../pages/ui-fact-card.md)  
**Триггер:** TZ-UX-FACT-302 после DETAIL-303/304

---

## 1. Уже ADOPTED (PASS)

| Зона | Status |
|------|--------|
| product-detail passport + cost | DONE DETAIL-301/302 |
| product-bom-panel inspector | DONE DETAIL-303 |
| module-detail passport + cost | DONE DETAIL-304 |
| shared kit `fact-card/**` | DONE FACT-301 |

---

## 2. Candidates → FAIL / WARN

| Path | Smell | Verdict | Successor |
|------|-------|---------|-----------|
| `/orders/:id` order-detail | side meta / dl densе | FAIL | **TZ-UX-FACT-303** order inspector/passport facts |
| `/products` list | price cells in table — **не** FactCard | WARN (tables ≠ fact) | — |
| `/modules` list | same | WARN | — |
| doc-constructor tables page | form-ish grids | WARN (demo/tool) | low |
| material-detail | `dl` passport fields | FAIL (parity with product) | **TZ-UX-FACT-304** (или UX-314 chrome+facts) |
| cost-calculation detail dialog | breakdown table | WARN → optional FactStack for totals | **TZ-UX-FACT-305** |
| inventory dashboards | KPI tiles | FAIL soft | **TZ-UX-FACT-306** if PO wants KPI atom |

---

## 3. Prioritized successors

1. **P1 TZ-UX-FACT-303** — order-detail side facts  
2. **P1 TZ-UX-FACT-304** — material-detail passport FactStack  
3. **P2 TZ-UX-FACT-305** — cost breakdown dialog totals  
4. **P3 TZ-UX-FACT-306** — inventory KPI (only if PO)

Не кодить в FACT-302. Не трогать composition-tree.

---

## 4. Anti-patterns

- Не пихать FactCard в table cells / tree rows  
- Не дублировать FormField  
- Caption обязателен для денег (см. audit side-panels §2)
