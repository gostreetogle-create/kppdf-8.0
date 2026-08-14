# Checklist TZ-SALES-371 — Реальное фото изделия в КП

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-371.md`
> Commit/push: canonical `main`; deploy запрещён

## Claim slot

- agent_id: Buffy / predeploy executor
- claimed_at: 2026-08-14T00:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no — orchestration limitation: `Unknown task: TZ-SALES-371; sync tasks first`
- conflict keys checked: proposal create page/table editor/product rail/spec + quotation output/document template/table template/spec + page doc

## Preflight

- [x] `origin/main` contains TZ-SALES-370 closeout and CATALOG-371 DONE.
- [x] Landed 370 diff read; existing `photoUrl` live/saved mapping is not duplicated.
- [x] Product photo contract read: populated `photoIds` uses existing `Photo.storageUrl`/thumb helper; no demo fallback.
- [x] Empty KP3 photo data remains an honest data gap; controlled fixture evidence will use the existing photo code path only.
- [x] Team Room best-effort claim attempted; task is not registered, no claim slot was skipped.

## Acceptance

- [x] Product description + real populated `photoIds` photo reach ProposalDraftLine.
- [x] Default layout contains visible `Фото`; synchronized FE/BE aliases and explicit hide/reorder/width handling persist.
- [x] Saved Quotation output preserves `photoUrl` and `sheetLayout` photo options.
- [x] Server PDF uses one allowlisted resolver, absolute own upload URL via base href, and bounded non-fatal image waiting.
- [x] Missing/blocked image renders neutral `Нет фото` without a broken-image icon.
- [x] Controlled photo/no-photo fixture paths cover live A4 mapping and saved-output PDF payload; local dev server bundle was already available on port 4200 for the shell smoke.

## Integrity slot

- [x] Type: page + document output module.
- [x] FIC §C/§D and proposals page doc assessed.
- [x] No foreign dirty WIP staged; 370 presentation semantics untouched.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates

- [x] frontend tsc + proposal-create focused Jest PASS (45/45).
- [x] backend tsc + quotation-output/table-template/document-template focused Jest PASS (49/49 focused; quotation/table/output 44/44).
- [x] architecture:check + git diff --check PASS.
- [x] changed-file ESLint/diff review PASS (backend baseline warnings only, no errors).

## Executor report

- implementation: READY FOR REVIEW — description/photo snapshot, photo layout aliases, saved-output forwarding, URL allowlist and neutral empty state.
- browser evidence: controlled fixture path recorded; no KP3 photo data was fabricated; dependency remains TZD-47 → MIG-303.
- known limits: real KP3 population still depends on TZD-47 → MIG-303; deploy/browser manual smoke remains outside this executor client.

## Closeout

- [ ] archive + lock + progress + remove active marker
- [ ] commit/push SHA recorded
- [x] no deploy
