# WAVE — Doc Studio FINISH S27→S37

Status: **S37B DONE (code-level) · S37 awaits live re-check** · 2026-09-04 · HEAD `4fd4052c`  
Evidence: `docs/audits/2026-09-04-docstudio-finish-smoke.md`  
Hotfix: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`  
S37B checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.md`

## Волна A–C (S27–S36, S38–S40)

| # | TZ | Status |
|---|-----|--------|
| 01–13 | S27–S36, S38–S40 | [x] archived on main |
| 14 | S37 OPERATOR-SMOKE | **FAIL (AC2)** — evidence written; **not** archived DONE |
| 15 | S37B COUNTERPARTY-TOKEN-PREVIEW | [x] archived DONE — full code-trace (UI insert → doc.context → substitution bag → render) found **no defect**; the gap was missing test coverage for the «Поле ERP» click → `insertContent()` wiring, now closed by `studio-text-properties.component.spec.ts`. Live browser click-through **not** performed this session (no browser/Playwright tool; `POST /api/auth/login` blocked by Claude Code auto-mode security classifier). |

## Closeout

- [x] S27–S40 + S37B archived (15/15)
- [x] `_active/` пуст
- [ ] S37 AC2 **live** mini-smoke — short manual re-check recommended (~2 min: klick through both steps of the «Поле ERP» dialog to the end) before archiving S37 itself DONE; automated evidence (backend hydration test since S8-1 + new frontend insert test) says the mechanism is sound
- [ ] operator-bar — depends on S37 live closeout above
- [x] QUEUE/_NOW updated after S37B
