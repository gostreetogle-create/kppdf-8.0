# WAVE-DESKTOP-EXCEL-NX-ALIGN checklist

> Status: **DONE** (68–73 archived; см. TZD-73 closeout)
> Specs: `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-NX-ALIGN.md`
> Audits: `docs/audits/2026-09-05-desktop-excel-nx-align-audit.md`, `docs/audits/2026-09-05-nx-desktop-download-port-audit.md`

## Chain

| ID | Spec | Status |
|----|------|--------|
| TZD-68 | `tasks/_archive/2026-09/TZD-68.done.md` | DONE (Claude) |
| TZD-69 | `tasks/_archive/2026-09/TZD-69.done.md` | DONE (Claude) |
| TZD-70 | `tasks/_archive/2026-09/TZD-70.done.md` | DONE (Claude) |
| TZD-71 | `tasks/_archive/2026-09/TZD-71.done.md` | DONE (Freebuff) |
| TZD-72 | `tasks/_archive/2026-09/TZD-72.done.md` | DONE (Freebuff, RBAC `desktop:admin`) |
| TZD-73 | `tasks/_archive/2026-09/TZD-73.done.md` | DONE (Freebuff) |

## Prompts

- Excel 68–70: `tasks/PROMPT-CLAUDE-DESKTOP-EXCEL-NX.md`
- NX 71–73: `tasks/PROMPT-FREEBUFF-NX-DESKTOP-PAIRING.md`

## Gate before code

- [ ] `tasks/_active/` empty **or** PO: parallel ok with W1 (desktop keys only)
- [ ] Peer Claude blockers applied: TZD-68+, no warehouse.type change, worker ready, units OUT, UX disabled logic

## DoD

- [x] 68–73 archived (tasks/_archive/2026-09/)
- [x] Smoke Excel + NX admin download + non-admin no button (TZD-73 checklist; unit-level + manual list; live deploy-smoke — PO after deploy)
- [x] Ledger Form Studio + NX pairing (CAPABILITY-LEDGER: обе строки included)
- [x] registries.page pointer («массовый Excel = Desktop; кнопок Excel нет»)
