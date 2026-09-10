# TZ-NX-UX-01-kit-forms-FIX: UX parity — `/kit/forms`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-UX-01-kit-forms-AUDIT` DONE + verdict PASS-FIX (если PASS-EMPTY — skip, archive N/A)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/kit/forms`  
**PAGE_DOCS:** `texts.page.md / forms`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/forms/**` ;  
`docs/pages/` relevant page.md ;  
`docs/audits/2026-09-09-nx-ux-kit-forms-audit.md` (closeout) ;  
`docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** page audit `2026-09-09-nx-ux-kit-forms-audit.md`; canon sweep; registries gold
- **Key Constraints:** Only smells listed P0/P1 (+ P2 if free). One route. Reuse Pi-* / registry patterns. If audit missed a clear smell while fixing — **fix it in the same TZ** and note in closeout.
- **Planned Deliverable:** buttons/labels/selects/expand/table parity with gold
- **Validation Path:** focused jest; nx build last; visual note in Executor report

---

## ЧТО ДЕЛАТЬ

1. Implement P0 then P1 from the audit (expand-in-row if table registry-like; `pi-button`; labeled filters; honest empty/error).
2. If during fix you find an extra smell on **this same page** — fix it and append to audit closeout (PO разрешил).
3. Do **not** invent new BE fields or second write-paths.
4. Specs for expand/actions where behaviour changes.
5. page.md NX UX note; WAVE row 01 FIX DONE; `_NOW` Claude IDLE.

## НЕ ИЗМЕНЯТЬ
Other routes; BE schemas; DocStudio A4 geometry; shipping/money ledger; wipe/deploy.

## КРИТЕРИИ ПРИЁМКИ
1. All P0/P1 from audit closed or explicitly DEFERRED with reason.
2. No underline-as-primary-action left for row tools (use pi-button).
3. Expand/detail pattern matches registries where applicable.
4. `nx build kppdf-web` PASS last; focused tests PASS.
