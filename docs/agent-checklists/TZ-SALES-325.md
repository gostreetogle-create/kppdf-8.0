# TZ-SALES-325 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-SALES-325.md` removed after closeout
> Commit/push: implementation `e1e84cb8`; closeout commit follows

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:56:32Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Current `origin/main` fetched/rebased at `557c8f73` before code.
- [x] TZ-SALES-325, wave audit §C, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] 323/324/326/327/329 and DOC-344 are DONE; DOC-TABLES-305 has no overlapping key.
- [x] `pi-document-templates.service.ts` was free; foreign dirty `document-template.service.ts` orientation WIP remained excluded.
- [x] Claim marker existed before code changes.

## Acceptance

- [x] Optional request-only `previewLines` reaches the build preview.
- [x] Draft fields map by canonical column-key aliases only.
- [x] Target selection is explicit `settings.kpLineItems` / line-items role, otherwise one live table only.
- [x] Snapshot-mode and non-target tables are unchanged; empty lines use the 324 skeleton.
- [x] No preview payload is persisted to Mongo/Quotation.
- [x] FE rebuild follows in-memory `draftLines` updates without painting a duplicate bullet list.
- [x] No 323 scroll regression and no `Нет данных` regression.
- [x] Cursor/PO visual PASS: products appear in the assigned line-items table, empty state remains skeleton, and A4 has no H/V scroll.

## Gates (факт)

- Backend tsc — PASS
- `document-templates-build` e2e — **10/10 PASS**
- Frontend tsc — PASS
- `proposal-create` focused Jest — **11/11 PASS**
- `git diff --check` — PASS

## Executor report (auto)

- implementation commit: `e1e84cb8`
- build accepts optional request-only `previewLines`; explicit `kpLineItems`/`line-items` targets win, otherwise exactly one live table is eligible.
- Canonical case-insensitive `column.key` aliases populate name, quantity, unit price, total, SKU, and unit; unknown keys remain blank.
- Explicit empty preview lines render the 324 skeleton; snapshot and unassigned live tables are not filled with draft rows.
- FE selected-template rebuilds send mapped in-memory draft lines; product add triggers the debounced rebuild; no duplicate list is painted on A4.
- conflict disclosure: foreign DOC-343 backend/docs WIP and dirty `document-template.service.ts` orientation line were preserved and excluded.

## Review handoff

- [x] READY FOR REVIEW after gates
- [x] Cursor/PO visual PASS received: assigned table, empty skeleton, and A4 scroll behavior

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T13:10:04Z`
