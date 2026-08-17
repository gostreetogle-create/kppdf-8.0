# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-17T20:05:00+03:00
hygiene: TZ-MIG-302 DONE (archive-only); TZ-MIG-306 DONE; next MIG-304; deploy НЕ

## ACTIVE

- _(idle)_ next = **TZ-MIG-304** · email→Person · `_backlog/migrate-kp3/`
- Deploy запрещён. Live category filter smoke — после deploy BE когда PO скажет «кати».

## NEXT (PO)

1. Новый чат: **TZ-MIG-304** (одна TZ) — Counterparty.email → Person
2. MIG-303 attach photos — когда live MCP + id-map

## DONE / LANDED (recent)

## [2026-08-17] — TZ-MIG-302 DONE — KP3 scoped load closeout

- Archive: `tasks/_archive/2026-08/TZ-MIG-302.done.md`; load 2026-08-12 (699/16/13/27); REST when MCP down; no re-load.
- Next: MIG-304 / MIG-303 successors; no deploy.

## [2026-08-17] — TZ-MIG-306 DONE — product categoryId filter

- Archive: `tasks/_archive/2026-08/TZ-MIG-306.done.md`; BE tsc 0; product.service.spec **17/17**; live GET/UI **BLOCKED** (API down).
- Fix: `findAll` `$in: [ObjectId, string]` for KP3 mixed categoryId types @ `bceb1762`.
- Next: MIG-304 / deploy BE when PO says «кати»; MIG-302 closed archive-only.

## [2026-08-17] — TZD-47 DONE — MCP photo upload HITL

- Archive: `tasks/_archive/2026-08/TZD-47.done.md`; mcp tsc 0; tests 121/121; registry 95; live MCP offline.
- Next: `TZ-MIG-302` in the next chat; no deploy.

## [2026-08-17] — TZD-56 DONE — NSIS AI runner bundle

- Archive: `tasks/_archive/2026-08/TZD-56.done.md`; desktop tsc + svelte-check 0/0; tests 72/72; bundle ~115 MB; deploy НЕ.
- Next: `TZD-47` in the next chat; no deploy.

## DONE / LANDED (recent)

## [2026-08-17] — TZ-UX-371 DONE — Orders list redesign

- Archive: `tasks/_archive/2026-08/TZ-UX-371.done.md`; focused FE gates 44/44; build PASS; deploy НЕ.
- `PiTable` disclosure `▸/▾` is RU/read-only and `bg-gold` when open; order summary uses semantic flat Paper & Ink layout.
- Next: `TZD-56` in the next chat; no deploy.

## [2026-08-16] — Warm deploy OK

- SHA `61dd144e` · Auth login OK · Frontend 200 · WIPE=false

## [2026-08-16] — TZ-PRODUCTION-353 DONE — unassigned Gantt gate

- Archive: `TZ-PRODUCTION-353.done.md`; SHA `61dd144e`; jest 131/131

## [2026-08-16] — TZ-PRODUCTION-352 DONE — tint hash fallback

- Archive: `TZ-PRODUCTION-352.done.md`; SHA `eccc1d6b`; jest 102/102

## [2026-08-16] — TZ-SALES-369 DONE — KP PDF filename

- SHA `8898a13e`

## [2026-08-16] — TZD-39 DONE — Basic Auth coexist

- Archive-only @ `fd31ab5`
