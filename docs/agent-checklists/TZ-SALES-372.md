# Checklist TZ-SALES-372 — Snapshot edit и решение каталога

## Status

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-SALES-372.done.md`
> Commit/push: canonical `main`; deploy НЕ
> Implementation SHA: `cbf2e2fe14dc674e688623b332299e85a1c66146`; closeout SHA: `728ebf2c`

## Claim slot

- agent_id: Buffy / predeploy executor
- claimed_at: 2026-08-14T06:05:00+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: no — orchestration limitation: `Unknown task: TZ-SALES-372; sync tasks first`
- conflict keys checked: proposal-create page/table editor/product rail/spec + quotation schema/dto/service/spec + page doc

## Status dependencies

- [x] TZ-SALES-370 DONE in `origin/main`.
- [x] TZ-SALES-371 DONE in `origin/main`.
- [x] TZ-CATALOG-371 DONE in `origin/main`.
- [x] Photo/edit/copy canon and landed implementation read before continuing the dirty WIP.

## Preflight

- [x] Все dependencies DONE/pushed.
- [x] Claim marker/checklist slot created; Team Room best-effort claim attempted; proposal-create conflict keys checked.
- [x] Прочитан photo/edit/copy canon.

## Acceptance

- [x] Name/description/SKU/unit явно редактируются как snapshot.
- [x] Essential commercial columns pinned-visible; `Фото` remains explicitly hideable.
- [x] Inline/autosave не вызывает Product PATCH.
- [x] `pending`/`kp-only` metadata переживает save/hydrate/F5.
- [x] Exit review показывает diff каждой изменённой строки; multi-row review is one compact dialog.
- [x] Только КП — safe default; explicit Cancel leaves the pending snapshot in the table, × uses the safe КП-only default, Escape never mutates Product.
- [x] Update Product отправляет только identity fields + expectedVersion.
- [x] Conflict 409 ничего не перетирает and leaves the review unresolved.
- [x] Create-copy rebinds the edited row and clears its resolution metadata.
- [x] Explicit row copy inserts a new Product row below without changing the source row.
- [x] Duplicate KP row честно оставляет тот же Product.
- [x] Final/read-only rows immutable.

## Gates

- [x] FE tsc + proposal-create focused Jest PASS (45/45).
- [x] BE tsc + quotation focused Jest PASS (36/36); Product conflict contract is covered by landed CATALOG-371 tests.
- [x] architecture:check + diff-check PASS.
- [x] Light/dark/multi-row/F5 behavior is covered by the shell/DOM harness and persisted snapshot tests; local dev shell smoke returned HTTP 200 on port 4200.
- [x] Cursor/PO visual review: code-path review PASS; no production/browser deployment was performed.

## Integrity / executor report

- [x] Page docs/progress/architecture updated.
- [x] Executor report: snapshot-first identity edits, three per-row decisions, expectedVersion conflict handling, Product duplicate/rebind and explicit row-copy actions.
- [x] No commercial `qty/price/discount/optional` field enters Product update/copy overrides.
- [x] Known limit: module/material source-sync and inline media upload remain outside v1; KP3 photo population remains TZD-47 → MIG-303.

## Closeout

- [x] archive + lock + remove active marker
- [x] commit/push SHA recorded: implementation `cbf2e2fe14dc674e688623b332299e85a1c66146`; closeout `728ebf2c`
- [x] no deploy
