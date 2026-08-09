# TZ-SALES-339 checklist

> Status: **READY FOR REVIEW**
> Visual gate: visible Save КП + autosave/F5 restore + delete/reload row gone.
> Marker: `tasks/_active/TZ-SALES-339.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-339-kp-save-autosave-delete.md`
> Commit/push: **NO** until gates and visual autosave/delete PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:54:31Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse: canonical `D:\kppdf-8.0` / `main`.
- [x] Base at `398f9ee8`; TZ-SALES-338 archived after visual PASS.
- [x] `_active-map.md` + `tasks/_active/` scanned; no competing 339 keys.
- [x] TZ, WAVE-KP-USABLE, prompt, and Create canon read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-339.md` created.

## Acceptance

- [x] «Сохранить КП» is a visible primary control in Create, not hidden under НДС.
- [x] Debounced autosave creates/updates one editable draft and keeps manual Save.
- [x] F5 resumes saved items/template; deleted draft is not resumed.
- [x] Soft-deleted quotations are absent from list and ordinary GET.
- [x] Delete success leaves Russian toast «КП удалено» and row absent after reload.

## Integrity slot

- [x] Type: fullstack Create/list + quotation soft-delete.
- [x] FIC/page docs and tests updated only in scoped files.
- [x] Foreign DOC-343/admin/system-role WIP excluded.
- [x] Canon: `docs/DOCS-INTEGRITY.md` and `docs/audits/2026-08-09-kp-usable-gap-map.md`.

## Gates (fact)

- [x] frontend tsc — PASS
- [x] backend tsc — PASS
- [x] proposal/Create Jest — 38/38 PASS
- [x] quotation service Jest — 26/26 PASS
- [x] quotation e2e — 6/6 PASS
- [x] FE Prettier + ESLint — PASS
- [x] diff-check — PASS

## Executor report (auto)

- Implementation: `da1d83e7de29b58276c063c71071675c69b5a44c` (pushed after review metadata).
- Visible top-level «Сохранить КП», debounced request-only save/update, and soft-delete list/GET filtering are implemented.
- Foreign DOC-343/admin/system-role WIP excluded.

## Review handoff

- [x] READY FOR REVIEW: visible «Сохранить КП», autosave/F5 restore, delete + reload row gone.
- [ ] Do not archive until Cursor/PO visual PASS.

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: _
