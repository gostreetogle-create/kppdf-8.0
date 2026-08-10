# TZ-SALES-340 checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-08/TZ-SALES-340.done.md`; `_active/` removed
> Conflict keys: proposal-create page/spec, composition component/spec, product rail, proposals-create page doc

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-10T23:10:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable (Unknown task; claim message sent)`

## Preflight

- [x] WAVE-KP-USABLE prerequisite checked: `tasks/_archive/2026-08/TZ-SALES-336.done.md` exists.
- [x] `_active/` checked before claim; no competing TZ.
- [x] Wave order checked: 340 was next; 341 was not claimed.
- [x] Frozen shell 317 and completed 319/321/323–339 scope identified as no-touch.
- [x] Canon/audit/TZ read.

## Acceptance

- [x] «Состав КП» overlay is visible and mutually exclusive with other right-rail panels.
- [x] Added items show and support quantity, unit price, unit, total, duplicate, delete, and reorder.
- [x] A4 build and panel total update from one shared draft write path.
- [x] Autosave/F5 path restores items and order.
- [x] Repeat Add increments the existing line.
- [x] UI copy is Russian; no banned wave scope introduced.
- [x] Frontend app tsc — PASS.
- [x] Focused proposal-create Jest — PASS, 25/25.
- [x] Backend build tsc — PASS.
- [x] Prettier/ESLint/diff-check — PASS.
- [x] Browser-equivalent Angular DOM self-verify — PASS; live authenticated browser unavailable without backend data stack.

## Integrity slot

- [x] Тип изменения: page + quotation composition write path.
- [x] FIC §A–E: N/A for route/permission/module/MCP; existing quotation persistence path reused.
- [x] `docs/pages/proposals-create.page.md` updated for the new «Состав» panel.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; conflict keys exclusive.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Closeout

- [x] Archive marker: `ARCHIVE_MARKER`, outcome `DONE`.
- [x] Lock: `.mimocode/locks/TZ-SALES-340-kp-composition-panel.lock`.
- [x] `tasks/_active/` cleaned.
- [x] Commit + push: pending closeout.

## Evidence / report

- Implementation: `proposal-create-composition.component.ts` + page wiring.
- Gates: frontend tsc, proposal-create 25/25, backend tsc, ESLint, Prettier, diff-check — PASS.
- Browser-equivalent self-check: empty state, repeated add increment, edit quantity/price, duplicate, move, delete, line render — PASS.
