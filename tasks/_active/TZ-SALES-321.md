# TZ-SALES-321 — Create КП preview fidelity

Status: READY FOR REVIEW

Claim slot:
- agent_id: agent-ccee39fec2
- claimed_at: 2026-08-09T11:03:03Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)

Scope:
- Preserve block layout in backend build HTML.
- Keep the frozen SALES-317 rails/overlay shell and add only A4 preview fidelity.
- Rewrite `/uploads` resources and contain-scale the build iframe without scrollbars.
- Keep DOC-344 builder keys, SALES-318/320, and persistence out of scope.

Gates: backend tsc + document-template-build e2e 7/7; frontend tsc + proposal-create 8/8.

Review handoff: visual Cursor/PO review required for a background and approximately four positioned blocks before archive.
