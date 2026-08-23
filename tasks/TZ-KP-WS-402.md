# TZ-KP-WS-402: Workspace store + chrome rails IA

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-401 DONE  
**LAYER:** frontend  
**WAVE:** #2  
**PAGES:** `/proposals/workspace`  
**PAGE_DOCS:** `kp-workspace-rail-ia.md`  
**CONFLICT KEYS:** `frontend/src/app/pages/commercial/proposals/workspace/*`; `frontend/src/app/shared/services/pi-chrome-tools.service.ts`; `proposal-workspace-demo.page.ts`

Проверено: audit `kp-workspace-rail-ia.md` (from 400); `proposal-create.page.ts` flyout state; `PiChromeToolsService`

## ИСХОДНОЕ СОСТОЯНИЕ

- Create page holds flyout state inline (signals), left/right mutual exclusion `<1280px`.
- Demo registers 6 section icons via chrome tools — names don't match prod flyouts.

## ЧТО ДЕЛАТЬ

1. **`ProposalWorkspaceStore`** (injectable, signal-based): `activeLeftSection | activeRightSection | panelOpen | orientation | quotationId` + actions `openSection`, `closePanel`, `toggleSection`, `setOrientation`.
2. Implement **IA from 400 audit**: left rail = Template · Catalog · Recipient; right rail = Params · Table · Terms · Output (register via `PiChromeToolsService` **right** slot if exists, else document extension pattern in layout — follow `page-chrome.md`).
3. **Icon dedup:** apply Lucide map from audit; remove demo-only sections (`params` vs `client` merge per IA).
4. Wire store to shell on `/proposals/workspace`: clicking chrome tool opens overlay panel; repeat click collapses; sheet click collapses (preserve demo behavior).
5. **Keyboard:** Escape closes panel (unless modal child — mirror create guard for catalog-review successor).
6. Tests: store state machine ≥8 cases; chrome registration snapshot.
7. Update `docs/pages/kp-workspace-rail-ia.md` if implementation diverges — note in `.done.md`.

## ИЗМЕНЯТЬ

- New: `proposal-workspace.store.ts` + spec
- `proposal-workspace-shell.component.ts` (inject store)
- Workspace page host
- Demo page (use shared store pattern or stay dummy — minimal)

## НЕ ИЗМЕНЯТЬ

- Quotation API / autosave
- `proposal-create.page.ts`
- Flyout widths on create page

## КРИТЕРИИ ПРИЁМКИ

- [ ] Left 3 + right 4 sections in chrome with unique Lucide icons + RU labels
- [ ] Store tests ≥8 PASS
- [ ] Panel overlay; A4 rect unchanged open/collapse (geometry checklist)
- [ ] No duplicate icon for Template vs Terms
- [ ] tsc + lint PASS

## known_limitation

- Right chrome rail may need layout PR — if no API, use `PiChromeToolsService` secondary group documented in `.done.md`.

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-402.done.md`
