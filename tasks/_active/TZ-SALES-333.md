# TZ-SALES-333 — Create КП Save draft and resume

> Status: **READY FOR REVIEW**
> Visual gate: Save → reload/F5 → same draft/template/products before archive.
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-333-kp-save-resume-draft.md`
> Marker: active until visual PASS and archive

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:20:07Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-333; sync tasks first`

## Preflight / conflicts

- Canonical `D:\kppdf-8.0` / `main` at `b1d51453`; TZ-SALES-337 archived/DONE immediately before claim.
- `_active/` and `_active-map` scanned: no competing 333 claim.
- Foreign DOC-343 dirty/untracked files are preserved and excluded.
- Scope keys: proposal create page/inspector/spec, proposal service, quotation create/update DTO/service, and scoped page docs.
- BAN: paid lock/copy, client picker, qty/photo, 322, print, FROZEN 317 shell, and deploy changes.

## Acceptance

- Save creates a draft with items, templateId, and non-null templateSnapshot.
- Repeat Save patches the same quotation.
- Last draft/template is restored through session/localStorage only for editable drafts.
- Dirty state does not force-block F5.
- Gates PASS: frontend/backend tsc, proposal-create Jest 17/17, quotation e2e 5/5, FE Prettier, diff-check.
- Implementation `b1d51453b1e06d2e21f724028164836526c2959b` is pushed to `origin/main`.
- Visual Save → F5 is required before archive; foreign DOC-343 WIP remains excluded.
