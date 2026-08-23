# TZ-KP-WS-408: Cutover — `/proposals/create` → workspace

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-403..407 DONE  
**LAYER:** frontend routes  
**WAVE:** #8 (session 4)  
**PAGES:** `/proposals/create` ; `/proposals/workspace`  
**PAGE_DOCS:** `proposals-create.page.md` ; audit parity matrix  
**CONFLICT KEYS:** `app.routes.ts`; `proposal-create.page.ts`; `deals-group-chips.ts`; `proposals.page.ts`; `KP-E2E-SMOKE.md`

## ИСХОДНОЕ СОСТОЯНИЕ

- Create route → `ProposalCreatePage`.
- Workspace at `/proposals/workspace` (admin) with full feature set after 403–407.

## ЧТО ДЕЛАТЬ

1. **Route cutover:** `/proposals/create` → same component as workspace (or redirect to `/proposals/workspace` preserving query params).
2. Run **parity checklist** from TZ-400 audit — every row must PASS or explicit defer in `.done.md`.
3. Extend Jest: migrate critical tests from `proposal-create.page.spec.ts` to workspace host (keep ≥90% coverage of flyout behaviors).
4. Manual: execute `docs/agent-checklists/KP-E2E-SMOKE.md` — document PASS in checklist evidence file.
5. Update chips: «Создать КП» still lands on create path (now workspace).
6. `data-test` attributes: preserve or alias for smoke tests (`kp-create-toggle-*` → document mapping in `.done.md`).
7. Feature flag rollback: env `KP_WORKSPACE_LEGACY=false` optional — if too heavy, keep old component file renamed `proposal-create.legacy.page.ts` one release (document).

## ИЗМЕНЯТЬ

- `app.routes.ts`
- Workspace page (production entry)
- `deals-group-chips.ts` if href change
- `docs/pages/proposals-create.page.md` — banner «superseded by workspace»
- `docs/agent-checklists/KP-E2E-SMOKE.md` evidence

## НЕ ИЗМЕНЯТЬ

- Backend APIs
- List page lifecycle (367 canon)

## КРИТЕРИИ ПРИЁМКИ

- [ ] `/proposals/create?id=` works identically to pre-cutover for PO smoke flows
- [ ] Parity matrix 100% PASS or deferred items listed with TZ refs
- [ ] `pnpm test -- proposal` PASS (full proposals pattern)
- [ ] tsc + lint PASS
- [ ] KP-E2E-SMOKE evidence file attached

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-408.done.md`
