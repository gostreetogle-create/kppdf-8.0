# TZ-SALES-345 checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-08/TZ-SALES-345.done.md`; `_active/` removed
> Conflict keys: quotation controller/service, document-template render, generated-document, backend package, proposal Create/proposals pages and services, proposals-create docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable (Unknown task; claim attempted)`

## Preflight

- [x] SALES-341 archive/lock/push verified at `d5b06e98`.
- [x] Strict wave order verified: 345 was next; 343 remains queued.
- [x] Existing generated-document archive service and build HTML path read.
- [x] No backend PDF engine found; optional system Chrome implementation and RU 503 fallback selected.

## Acceptance

- [x] POST quotation PDF renders the same build HTML, with one reusable browser and operation timeouts ≤20 seconds.
- [x] PDF response is `application/pdf` with КП filename; unavailable engine returns RU 503.
- [x] POST quotation archive creates a new final `GeneratedDocument` with quotation source metadata.
- [x] Create studio has one «Скачать» menu with PDF, Печать, and archive actions; autosave is flushed first.
- [x] Print uses the current A4 preview HTML, not raw service markup.
- [x] «Все КП» exposes PDF and Печать actions.
- [x] All user-visible copy is Russian and no out-of-scope feature is opened.
- [x] Backend tsc + quotation/generated-document tests pass.
- [x] Frontend tsc + proposal-create/proposals tests/build pass.
- [x] Prettier/ESLint/diff-check pass.
- [x] Browser-equivalent self-verify pass; real authenticated browser/PDF smoke unavailable because no backend data stack/Chrome exists in headless workspace; missing-engine path unit-tested.

## Integrity slot

- [x] Тип: fullstack quotation output and generated-document archive contract.
- [x] FIC: existing quotation/document routes; no new permission catalog entry required beyond admin/manager.
- [x] `proposals-create.page.md` updated with PDF/print/archive decision.
- [x] Frozen shell 317 preserved.
- [x] Foreign WIP excluded and keys exclusive.
- [x] No deploy, ZIP publish, nginx/VPS, or credentials touched.

## Closeout

- [x] Archive marker: `ARCHIVE_MARKER`, outcome `DONE`.
- [x] Lock: `.mimocode/locks/TZ-SALES-345-kp-pdf-print-archive.lock`.
- [x] Active marker removed.
- [x] Commit + push: closeout included in the next commit and will be pushed to `origin/main`.
