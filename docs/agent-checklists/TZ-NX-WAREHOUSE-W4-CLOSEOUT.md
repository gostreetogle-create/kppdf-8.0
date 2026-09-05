# TZ-NX-WAREHOUSE-W4-CLOSEOUT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md` (removed after archive)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T21:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI not installed)

## Preflight

- [x] `tasks/_active/` empty except `.gitkeep` before claim (W1–W3 archived and pushed: `d9631c00`, `f7b9242a`, `7f90a28d`)
- [x] W4 TZ, `docs/DOMAIN-MAP.md`, `docs/pages/PAGE-TZ-INDEX.md`, `docs/pages/{warehouses,storage-items,stock-movements}.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md` §A, `docs/CAPABILITY-LEDGER.md` read

### Preflight Check Output
- **Context read:** `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md`, `docs/DOMAIN-MAP.md` (Warehouse row + route table), `docs/pages/PAGE-TZ-INDEX.md` (Warehouse section), `docs/pages/{warehouses,storage-items,stock-movements}.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md` §A, `docs/CAPABILITY-LEDGER.md` (Warehouse row)
- **Key Constraints:** docs-only unless a real FIC gap is found (none was); no product code change
- **Planned Deliverable:** DOMAIN-MAP + PAGE-TZ-INDEX + FIC + WAVE evidence all say W1–W3 live/DONE, not gap/placeholder
- **Validation Path:** doc consistency read-through; no build gate required (no FE/code change — matches the TZ's own "smoke after doc-only ok if no FE change")

## Acceptance

- [x] DOMAIN-MAP Warehouse row + route table say live (W1–W3 DONE), not gap/placeholder
- [x] PAGE-TZ-INDEX rows for `/warehouses`, `/storage-items`, `/stock-movements` marked DONE with the right wave letter
- [x] page.md NX SoT notes present (already written during W1–W3; legacy remains the cutover reference)
- [x] FIC §A closure note added (port of pre-existing pages — no new route/permission/seed, so most §A line items are N/A by construction)
- [x] `WAVE-NX-WAREHOUSE.md` evidence checklist added, wave status = DONE

## Integrity slot

- [x] Type: docs-only closeout
- [x] No product code touched
- [x] `docs/CAPABILITY-LEDGER.md` reviewed — already accurate (`Warehouse: warehouses, stock, movements` = `included`), no edit needed

## Gates

- [x] Doc consistency read-through — DOMAIN-MAP / PAGE-TZ-INDEX / page.md / FIC / CAPABILITY-LEDGER / WAVE file all agree: W1–W3 live and DONE, W4 closes the wave
- N/A `nx build kppdf-web` — no frontend/backend file was changed in this TZ (docs-only); TZ's own guardrail marks the build gate conditional on an FE change, which did not happen here

## Executor report

- Updated `docs/DOMAIN-MAP.md` (Warehouse capability row + the NX route table) from "gap/placeholder" wording to "live (W1–W3 DONE)".
- Updated `docs/pages/PAGE-TZ-INDEX.md` Warehouse section: `/storage-items` and `/stock-movements` rows now say **W2/W3 DONE** with a one-line description instead of "W1 live route placeholder → W2/W3 …"; `/warehouses` says **W1 DONE**.
- Added a one-line `FEATURE-INTEGRATION-CHECKLIST.md` §A closure note (mirroring the existing `/production` precedent in the same file) explaining this wave ported pre-existing legacy routes/pages rather than adding new ones, so most §A checklist rows don't apply.
- Verified `docs/CAPABILITY-LEDGER.md`'s Warehouse row is already accurate — left unchanged.
- Updated `docs/agent-checklists/WAVE-NX-WAREHOUSE.md`: chain table now points at the three `.done.md` archives, added a "W4 evidence (DoD)" section, wave status = DONE.
- No product code was touched in this TZ — the one code fix that came up during review (duplicated barrel export in `warehouse/index.ts`) was found and fixed during W3, and is already part of the W3 commit (`7f90a28d`), not this one.

## Closeout

- [x] Archive + remove active marker
- [x] Status = DONE
- closed_at: 2026-09-05T21:20:00+03:00
- commit SHA: see git log

## Wave status

**WAVE-NX-WAREHOUSE (W1→W2→W3→W4) is fully DONE.** Per `PROMPT-FREEBUFF-W2-CLOSEOUT.md`'s "Сразу W3 → W4" instruction: stopping here — no further warehouse work queued. `kppdf-web` is now free; per `_NOW.md`, Claude's S1 supply page and Freebuff's TZD-71…73 (NX pairing) are both unblocked next, by separate PO command.
