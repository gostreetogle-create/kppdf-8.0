# TZ-NX-PROPOSALS-LIST-PDF checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PROPOSALS-LIST-PDF.md` (archived)

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:38:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI)

## Preflight
- [x] Previous PDF client archived and committed.
- [x] No conflicting active task; proposals facade/page/spec keys reserved.
- [x] BE PDF endpoint and studio blob pattern read.

## Acceptance
- [x] Facade downloads quotation PDF and creates a browser download.
- [x] Rows expose `data-test="proposal-download-pdf"`.
- [x] Success and error paths are covered.
- [x] Focused proposals spec and build pass.

## Integrity slot
- [x] Type = page behavior.
- [x] `kp-workspace.page.md` and `PAGE-TZ-INDEX.md` updated with list PDF behavior.
- [x] DOMAIN-MAP/SECTION-READINESS/Coupling = N/A; no route, permission or shared-field contour changed.
- [x] Foreign WIP excluded.

## Build integrity
- [x] `pnpm exec nx build kppdf-web` — PASS, exit 0; existing Angular/bundle warnings only.
- [x] Build was the last gate.

## Gates
- [x] Focused proposals spec — PASS, 1 suite / 31 tests.
- [x] Focused ESLint — PASS, 0 errors / 2 existing non-null assertion warnings in spec.
- [x] `nx build kppdf-web` — PASS, exit 0.

## Executor report
- Added row-level PDF action with busy state, browser blob download and success/error toast handling.
- Reused the live `PiQuotationsService.downloadPdf` endpoint; no archive/generated-document POST added.
- Fixed the existing same-project facade import to a relative import so focused lint is clean.
- Foreign dirty/untracked files were not staged.

## Closeout
- [x] Archive + lock + remove active marker.
- closed_at: 2026-09-17T06:55:00+03:00
