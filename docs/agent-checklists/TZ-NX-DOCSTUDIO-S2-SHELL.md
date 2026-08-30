# TZ-NX-DOCSTUDIO-S2-SHELL checklist

> Status: **DONE**

## Claim slot
- agent_id: freebuff-docstudio-s2
- claimed_at: 2026-08-30T11:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Gates
- Step 1 claim/preflight: PASS — source TZ reviewed; active marker created; frontend-nx only.
- Step 2 data access/list/shell: PASS — PiStudioDocumentsService (list/get/create/update/remove), `/studio` list + `/studio/:id` A4 shell; `update` includes the backend revision gate (`expectedRevision`) — fixes PATCH 400.
- Step 3 navigation/docs/tests: PASS — app.routes + nav-categories `/studio`; data-access spec + geometry spec (incl. DOCPLAT-01 limiting-side fit) green.
- Step 4 browser geometry evidence: PASS — live Playwright walk (mongo+backend+frontend-nx): **portrait ratio 0.7071**, **landscape ratio 1.4143**, **stage not null**, panel 480px absolute, open/collapsed reflow Δ = 0/0/0, 0 console errors. Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S2-SHELL/`.
- Integrity/archive: PASS.

## Acceptance
- `/studio` lists documents and creates an empty document — PASS (end-to-end against real API).
- `/studio/:id` renders an empty A4 shell with overlay rails/panel/ribbon — PASS (screenshots).
- Landscape sheet ratio is A4 (~1.414), not legacy 1.726 — PASS (1.4143 measured).
- Panel is 480px overlay and does not reflow the sheet; sheet click collapses it — PASS (Δ 0/0/0).
- Orientation displayed read-only from template / via PATCH on the document — PASS.

## known_limitation
- S3 blocks are explicitly out of scope.
- Gates on the full frontend-nx suite still include 17 pre-existing failures in `registries/**` + `composition/**` (другая волна агента, TZ-NX-REGISTR*); architecture:check reports 3 pre-existing legacy `frontend/` cross-component violations.