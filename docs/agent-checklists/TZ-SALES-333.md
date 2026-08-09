# TZ-SALES-333 checklist

> Status: **DONE**
> Visual: PO confirmed Save/resume ready; Save visibility/autosave UX is handed to TZ-SALES-339.
> Marker: `tasks/_active/TZ-SALES-333.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-333-kp-save-resume-draft.md`
> Commit/push: **DONE**

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:20:07Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — unknown task; sync tasks first

## Preflight

- [x] Canonical `D:\kppdf-8.0` / `main` at `b1d51453`; 337 archived/DONE.
- [x] `_active-map.md` + `tasks/_active/` scanned; no competing 333 keys.
- [x] Read TZ, WAVE-KP-USABLE, prompt, usable-gap audit, and snapshot note.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-333.md` created.

## Acceptance

- [x] Save creates draft with items, templateId, and non-null templateSnapshot.
- [x] Repeat Save patches the same quotation.
- [x] Reopen restores only editable draft / last template.
- [x] F5 does not force-block on dirty state.
- [x] 332 table rail and 317 A4 overlay remain intact.

## Integrity slot

- [x] Type: fullstack (`/proposals/create` + quotations API).
- [x] FIC/page docs and quotation contracts updated only in scoped files.
- [x] Foreign DOC-343 WIP excluded.
- [x] Canon: `docs/DOCS-INTEGRITY.md` and `docs/audits/2026-08-09-kp-usable-gap-map.md`.

## Gates (fact)

- [x] backend tsc — PASS
- [x] quotation e2e — 5/5 PASS
- [x] frontend tsc — PASS
- [x] proposal-create Jest — 17/17 PASS
- [x] Prettier (changed FE files) — PASS
- [x] diff-check — PASS

## Executor report (auto)

- Implementation: `b1d51453b1e06d2e21f724028164836526c2959b` (pushed to `origin/main`).
- Save creates and repeat-save updates one editable draft; template snapshot and draft resume are request/persistence scoped.
- Foreign DOC-343 WIP remains excluded.

## Review handoff

- [x] READY FOR REVIEW: Save → reload/F5 → same template and products.
- [x] Cursor/PO visual continuation confirmation received; archive approved.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T16:44:27Z`
- Archive: `tasks/_archive/2026-08/TZ-SALES-333.done.md`
- Lock: `.mimocode/locks/TZ-SALES-333-kp-save-resume-draft.lock`
