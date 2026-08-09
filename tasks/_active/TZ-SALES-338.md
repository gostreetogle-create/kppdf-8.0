# TZ-SALES-338 — Create КП edit opens studio

> Status: **READY FOR REVIEW**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-338-kp-edit-opens-studio.md`
> Marker: active until visual PASS and archive

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:45:43Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-338; sync tasks first`

## Preflight / conflicts

- Canonical `D:\kppdf-8.0` / `main` at `8133237a` before claim; TZ-SALES-333 closeout is pushed as `78516c8c`.
- `tasks/_active/` was empty; no competing 338 claim or overlapping Create/list claim.
- Foreign DOC-343 and admin/system-role WIP are preserved and excluded.
- Scope keys: proposals list, Create page, Create spec, form-dialog redirect path, and scoped page docs.
- BAN: autosave/delete (339), counterparty (334), qty/photo (335), paid/lock/copy (336), 317 shell, 320/322, and deploy.

## Acceptance

- List «Создать» navigates to `/proposals/create` without opening the form dialog.
- Row «Редактировать» navigates to `/proposals/create?id=<quotationId>`.
- Create hydrates the editable draft identified by `id`, retaining template/items and last draft id.
- Missing or non-editable id falls back to clean Create with RU feedback.
- Create UI has no user-visible English `draft`/jargon in scoped hints.
- Tests and page docs cover navigation and hydration.

## Gates

- frontend tsc: PASS
- proposals/Create focused Jest: 37/37 PASS
- Prettier/ESLint/diff-check: PASS
- Implementation: `fb04b05689a9dc557840781791c469b80e6c91e4`

## Review handoff

- [x] READY FOR REVIEW: list Edit → studio with same КП; Create does not open form dialog.
- [ ] Do not archive until Cursor/PO visual PASS.
