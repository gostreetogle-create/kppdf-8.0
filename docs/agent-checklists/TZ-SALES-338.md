# TZ-SALES-338 checklist

> Status: **READY FOR REVIEW**
> Visual gate: list Edit → Create studio with same КП; Create does not open form dialog.
> Marker: `tasks/_active/TZ-SALES-338.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-338-kp-edit-opens-studio.md`
> Commit/push: **NO** until gates and visual Edit → studio PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:45:43Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse: canonical `D:\kppdf-8.0` / `main`.
- [x] Base refreshed to `8133237a`; 333 closeout pushed as `78516c8c`.
- [x] `_active-map.md` + `tasks/_active/` scanned; no competing 338 keys.
- [x] TZ, WAVE-KP-USABLE, prompt, and Create canon read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-338.md` created.

## Acceptance

- [x] «Создать» navigates to `/proposals/create?new=1` without ProposalFormDialog.
- [x] «Редактировать» navigates to `/proposals/create?id=...`.
- [x] Create hydrates the editable quotation from query id.
- [x] Missing/non-editable id falls back to clean Create with RU feedback.
- [x] No user-visible English `draft`/jargon remains in scoped Create hints.

## Integrity slot

- [x] Type: frontend route/navigation + Create hydration.
- [x] FIC/page docs and tests updated only in scoped files.
- [x] Foreign DOC-343/admin/system-role WIP excluded.
- [x] Canon: `docs/DOCS-INTEGRITY.md` and `docs/audits/2026-08-09-kp-usable-gap-map.md`.

## Gates (fact)

- [x] frontend tsc — PASS
- [x] focused proposals + Create Jest — 37/37 PASS
- [x] Prettier — PASS
- [x] ESLint — PASS
- [x] diff-check — PASS

## Executor report (auto)

- Implementation: `fb04b05689a9dc557840781791c469b80e6c91e4` (pushed after closeout metadata).
- List Create/Edit no longer opens `ProposalFormDialogComponent`; Edit carries `?id=` and Create hydrates draft by query id.
- Foreign DOC-343/admin/system-role WIP excluded.

## Review handoff

- [x] READY FOR REVIEW: list Edit → Create studio; Create → no form dialog.
- [ ] Do not archive until Cursor/PO visual PASS.

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: _
