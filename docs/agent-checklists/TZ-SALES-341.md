# TZ-SALES-341 checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-08/TZ-SALES-341.done.md`; `_active/` removed
> Conflict keys: quotation schema/DTO/service, build DTO/service, proposal Create page/inspector/service, page docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-10T23:30:00Z`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable (Unknown task; claim message sent)`

## Preflight

- [x] TZ-SALES-340 archive/lock/push verified; no competing `_active/` marker.
- [x] Strict wave order verified: 341 was next; 345 remains queued.
- [x] Frozen 317 shell and 340 composition write path preserved.
- [x] TZ, audit and quotation/build code read.

## Acceptance

- [x] Quotation schema and DTO persist bounded VAT/prepayment/lead-time fields.
- [x] Server total applies markup and percent/amount discount without negative totals.
- [x] Build footer receives persisted deal totals and VAT.
- [x] Parameters has Russian Document/Money/Terms sections with reset.
- [x] F5/edit hydrates fields and autosave sends them.
- [x] Backend quotation tests — PASS, 32/32.
- [x] Frontend tsc + proposal-create tests — PASS, 26/26.
- [x] ESLint/Prettier/diff-check — PASS; two pre-existing renderer `any` warnings disclosed.
- [x] Browser-equivalent DOM self-verify — PASS; live authenticated browser unavailable without backend data stack.

## Integrity slot

- [x] Тип: page + quotation persistence/build contract.
- [x] FIC: N/A for new route/permission/module/MCP; existing quotation API extended.
- [x] `proposals-create.page.md` updated.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded and keys exclusive.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Closeout

- [x] Archive marker: `ARCHIVE_MARKER`, outcome `DONE`.
- [x] Lock: `.mimocode/locks/TZ-SALES-341-kp-commercial-fields.lock`.
- [x] Active marker removed.
- [x] Commit + push: closeout included in the next commit and pushed to `origin/main`.
