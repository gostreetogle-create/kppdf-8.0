# TZ-DOC-TABLES-308 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-DOC-TABLES-308.done.md`
> Closeout: source/fields layout and preview skeleton implemented; archive/lock completed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:35:01Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Canonical `D:\kppdf-8.0`; `HEAD/origin/main = 99fb6e3d` at claim.
- [x] 305 archived DONE; 306 done and its route keys are separate.
- [x] `_active-map` and `tasks/_active/` scanned; no overlapping foreign keys.
- [x] TZ, wave, KP-table canon, agent guide, and integrity requirements read.
- [x] Claim slot and `_active` marker created before code.
- [x] Team Room claim attempted; registry reports unknown task.

## Acceptance

- [x] Source/fields are on one row with centered baseline and balanced widths.
- [x] Column headers are visibly taller and readable.
- [x] Empty sample state shows skeleton preview row(s) under the header instead of an empty gray void.
- [x] Frontend tsc and focused dialog specs PASS.

## Integrity slot

- [x] Тип изменения: page/module UI.
- [x] FIC §A–E: N/A except page layout behavior; no permission or data-contract change.
- [x] `docs/pages/tables.page.md` updated with layout/preview behavior.
- [x] PAGE-TZ-INDEX/SECTION-READINESS checked; no additional update required.
- [x] Foreign DOC-343 WIP excluded; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- Frontend tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- Focused dialog Jest: PASS — **44/44**.
- `git diff --check`: PASS.

## Executor report (auto)

- Source and fields controls now share a centered baseline and comparable flex widths.
- Interactive column headers have a 124px minimum height with more breathing room.
- Empty client previews render a visible skeleton row plus the existing RU guidance message.
- Tables page documentation records the new layout/preview behavior.
- Scope guard: 306 chips, 307 enum/preset, BE registry, DOC-343 WIP, and deploy untouched.
- No shared PiOverflowSelect or backend changes were made.

## Review handoff

- [x] Gates complete; layout/preview acceptance surface implemented within the TZ.

## Closeout

- [x] archive + DONE
- closed_at: `2026-08-09T14:37:14Z`
