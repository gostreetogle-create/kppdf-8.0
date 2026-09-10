# TZ-NX-UX-08-warehouses-AUDIT: UX smell audit — `/warehouses`

**РОЛЬ АГЕНТА:** Executor auditor — claude  
**ЗАВИСИМОСТИ:** предыдущая волна UX закрыта (или первая)  
**LAYER:** 4 (docs) · **SIZE:** S  
**PAGES:** `/warehouses`  
**PAGE_DOCS:** `warehouses.page.md`

**CONFLICT KEYS:**  
`docs/audits/2026-09-09-nx-ux-warehouses-audit.md` (create) ;  
`docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 08)

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`; registry gold `registry-detail-panel.component.ts`; page sources under `frontend-nx/.../pages/warehouse/warehouses.page.ts`
- **Key Constraints:** **NO product code** in this TZ. One page only: `/warehouses`.
- **Planned Deliverable:** smell audit markdown with T1–C1 checklist + file:line
- **Validation Path:** audit file PASS/EMPTY; then FIX TZ may claim

**Note:** Named warehouses CRUD

---

## ЧТО ДЕЛАТЬ

1. Открой код страницы `/warehouses` (не по памяти). При живом стенде — глазом UI.
2. Пройди чеклист T1–C1 из `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`.
3. Сравни с `/registries` expand + `pi-button` toolbar.
4. Напиши `docs/audits/2026-09-09-nx-ux-warehouses-audit.md`:
   - таблица smells (id · факт · path:line · severity P0/P1/P2)
   - что УЖЕ ок (не чинить)
   - verdict: `PASS-EMPTY` (нет P0/P1) **или** `PASS-FIX` (есть работа для FIX)
5. Обнови WAVE row 08 audit status. Archive. **Не** правь product code.

## НЕ ИЗМЕНЯТЬ
`frontend-nx/**/*.ts` app logic; другие routes; BE; A4 studio geometry.

## КРИТЕРИИ ПРИЁМКИ
1. Audit file exists with every checklist row marked OK/FAIL/N/A.
2. No product code in commit.
3. If PASS-EMPTY — FIX TZ = skip (mark WAVE FIX N/A DONE).
