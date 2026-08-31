# WAVE checklist — Doc Studio S8→S9

Status: **DONE**
agent_id: claude
started_at: 2026-08-31T22:40:00+03:00
closed_at: 2026-09-01
workspace: D:\kppdf-8.0 (main)
**RESUME:** закрыто

## Preflight
- [x] git sync completed.
- [x] `tasks/_active/` was empty before each claim.
- [x] baseline `nx build kppdf-web` passed.

## S8
- [x] 1. TEXT-SUBSTITUTION — `96d08634`; archived.
- [x] 2. TABLE-ERP-BIND — `34f50b3c`; archived.
- [x] 3. LIST-TEMPLATES — `7dbbfbbe`; archived.
- [x] 4. PAGES-PANEL — `11bb0a7e`; archived.

## S9
- [x] 5. ANCHORS-MODEL — archived with known limitation: full multi-anchor backend migration deferred.
- [x] 6. CATALOG-VITRINA — `48b0d894`; archived with known limitation: resolver-side catalog row hydration deferred.
- [x] 7. TEMPLATE-BINDINGS-UX — `d981c08b`; archived.

## Gates
- [x] backend studio-data-resolver tests: PASS, 7 tests.
- [x] frontend studio tests: PASS, exit 0.
- [x] frontend `nx build kppdf-web`: PASS, exit 0.
- [x] pre-push backend + frontend typecheck: PASS.

## Closeout
- [x] Archives created under `tasks/_archive/2026-08/`.
- [x] `tasks/_active/` cleared.
- [x] Known limitations recorded in archives.
- [x] Remaining foreign WIP was not staged.
