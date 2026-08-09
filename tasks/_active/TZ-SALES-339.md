# TZ-SALES-339 — Save КП visible, autosave, and delete filtering

> Status: **READY FOR REVIEW**
> Visual gate: visible Save КП + autosave/F5 restore + delete/reload row gone.
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-339-kp-save-autosave-delete.md`
> Marker: active until visual PASS and archive

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:54:31Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-339; sync tasks first`

## Preflight / conflicts

- Canonical `D:\kppdf-8.0` / `main` at `398f9ee8`; TZ-SALES-338 visual closeout is pushed.
- `tasks/_active/` was empty after 338 closeout; no competing 339 claim.
- Foreign DOC-343/admin/system-role WIP is preserved and excluded.
- Scope keys: Create page/inspector/spec, proposals list/spec, quotation service/schema/e2e, and scoped page docs.
- BAN: second editor, 334 client, 335 qty/photo, 336 paid/lock/copy, 317 shell, 320/322, and deploy.

## Acceptance

- «Сохранить КП» is visible in the Create studio, not only under НДС/Параметры.
- Autosave creates/updates the same draft after template + our firm, with debounce and quiet repeat saves.
- Resume restores items/template from the saved quotation, not only lastTemplateId; deleted drafts do not resume.
- Soft-deleted quotations are excluded from list and ordinary GET; successful delete removes the row after reload.
- UI remains Russian; manual Save remains available.

## Gates

- frontend tsc: PASS; backend tsc: PASS
- proposal/Create Jest: 38/38; quotation service Jest: 26/26; quotation e2e: 6/6
- FE Prettier/ESLint: PASS; diff-check: PASS
- Implementation: `da1d83e7de29b58276c063c71071675c69b5a44c`

## Review handoff

- [x] READY FOR REVIEW: visible Save КП, autosave + F5 restore, delete + reload row gone.
- [ ] Do not archive until Cursor/PO visual PASS.
