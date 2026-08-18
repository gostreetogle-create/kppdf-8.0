# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-17T23:20:00+03:00
hygiene: warm deploy OK ddd2cade; 5 CP emails on prod

## ACTIVE

_(none)_ — WAVE-FORMS-NUMBER 314→317 archived; deploy НЕ

## NEXT (PO)

1. Smoke: КП → PDF (не тост) · карточка контрагента «Почта»
2. Завтра на работе: тот же ПК, новая ссылка не нужна

## DONE / LANDED (recent)

## [2026-08-18] — TZ-FORMS-317 DONE — DTO numeric transforms

- Archive: `tasks/_archive/2026-08/TZ-FORMS-317.done.md`; backend tsc/work-type 9/9/product-module 10/10/ESLint PASS; deploy НЕ
- Wave complete; next action is PO deploy command only

## [2026-08-18] — TZ-FORMS-316 DONE — counterparty/org/proposal numeric payloads

- Archive: `tasks/_archive/2026-08/TZ-FORMS-316.done.md`; focused tsc/CP 10/10/org 14/14/ESLint PASS; deploy НЕ
- Next: `TZ-FORMS-317`

## [2026-08-18] — TZ-FORMS-315 DONE — module numeric payload boundary

- Archive: `tasks/_archive/2026-08/TZ-FORMS-315.done.md`; focused tsc/Jest 6/6/ESLint PASS; deploy НЕ
- Next: `TZ-FORMS-316`

## [2026-08-18] — TZ-FORMS-314 DONE — optional numeric submit helper + виды работ

- Archive: `tasks/_archive/2026-08/TZ-FORMS-314.done.md`; focused tsc/Jest 3/3/ESLint PASS; deploy НЕ
- Next: `TZ-FORMS-315`

## [2026-08-17] — Warm deploy OK

- SHA `ddd2cade` · Auth login OK · Frontend 200 · WIPE=false
- Chromium `/usr/bin/chromium-browser` in kppdf-backend
- CP email load: **5 written**, 1 skip our-company, 4 no_cp (не были в MIG-302)

## DONE / LANDED (recent)

## [2026-08-17] — TZ-SALES-379 DONE — Chromium Docker PDF

- Archive: `tasks/_archive/2026-08/TZ-SALES-379.done.md`; Docker build PASS; deploy **NOT** done.
- Next: PO «кати», then live KP PDF smoke.

## [2026-08-17] — TZ-MIG-307 BLOCKED — email load needs deploy

- Archive: `TZ-MIG-307.done.md`; SHA `266c1cd6`; prod login OK; PATCH 400 `email should not exist`; **0/9**.
- Next: PO «кати» ≥ `da01f1e5`, then re-run load script.

## [2026-08-17] — TZ-MIG-304 PARTIAL — Counterparty.email + KP3 load blocked

- Archive: `tasks/_archive/2026-08/TZ-MIG-304.done.md`; schema+UI DONE; load **0/10** (SoT timeout); BE 17/17 FE 9/9.
- Next: re-run load script when Synology reachable.

## [2026-08-17] — TZ-MIG-303 DONE — KP3 photos attach verify

- Archive: `tasks/_archive/2026-08/TZ-MIG-303.done.md`; coverage 661/661 (100%); uploaded 0 / skipped 661; REST prod; MCP offline.
- Next: MIG-304; PO smoke catalog photos.

## [2026-08-17] — TZ-MIG-302 DONE — KP3 scoped load closeout

- Archive: `tasks/_archive/2026-08/TZ-MIG-302.done.md`; SHA `833c12c5`; load 2026-08-12 (699/16/13/27); REST when MCP down; no re-load.
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
