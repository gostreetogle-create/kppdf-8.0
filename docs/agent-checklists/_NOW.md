# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-18T22:15:00+03:00
hygiene: prod still 789487f1; origin DESK-403 (0ce536a4); deploy BLOCKED (VPN off)

## ACTIVE

**Freebuff continuous wave — RUNNING** (PO ушёл 20:38; 406/402/412/403 DONE, next 413)  
Prompt: `tasks/PROMPT-FREEBUFF-DESK-WAVE-CONTINUOUS.md`  
**no deploy** until VPN + «кати».

**Freebuff DESKTOP wave — TZD-49 DONE** (CAD follow-ups)  
Prompt: `tasks/PROMPT-FREEBUFF-DESKTOP-WAVE-CONTINUOUS.md`  
Queue: **58** installer (parallel). **57** pairing DONE. Smoke: `docs/agent-checklists/DESKTOP-SMOKE.md`

## QUEUE (do not skip order)

1. **413** tray visual IA (cards) — `tasks/TZ-DESK-413.md` **← next**
2. **410** search/filter — `tasks/TZ-DESK-410.md`
3. **411** capabilities — `tasks/TZ-DESK-411.md`
4. **407** view=gantt/combine — `tasks/TZ-DESK-407.md`
5. **404** deep-link fallback — `tasks/TZ-DESK-404.md`
6. **408** DeskNote — if time after 1–5



Gate «раскладка v2 ok» **снят** — PO delegated full desk while away.

## NEXT (PO when back)

1. VPN on → smoke `/desk` + `DESK-SMOKE.md`
2. «кати» warm deploy if smoke ok
3. 409 quick-attach — backlog

## DONE / LANDED (recent)

## [2026-08-18] — TZD-49 DONE — CAD spec import follow-ups

- Archive: `tasks/_archive/2026-08/TZD-49.done.md`; gates PASS 75/75; deploy НЕ
- name=article fallback (warning); dims/weight on module create; catalog lookup by article/sku
- PO smoke CAD xlsx — ручной; next desktop: **58** installer

## [2026-08-18] — TZD-57 DONE — pairing download button + version

- Archive: `tasks/_archive/2026-08/TZD-57.done.md`; gates PASS; deploy НЕ
- Toolbar: «Скачать Desktop v{semver}» напротив «Выпустить ключ»; footer только «Закрыть»
- Next desktop wave: **58** installer integrity

## [2026-08-18] — TZ-DESK-403 DONE — состав + supply + combine в tray

- Archive: `tasks/_archive/2026-08/TZ-DESK-403.done.md`; SHA `0ce536a4`; gates PASS; deploy НЕ
- tray self-contained: composition-tree + lazy supply + combine-strip; desk BOM без `/orders/:id`
- Next: 413 (tray visual IA)

## [2026-08-18] — TZ-DESK-412 DONE — shared order-hub-tray

- Archive: `tasks/_archive/2026-08/TZ-DESK-412.done.md`; SHA `53c8e75c`; gates PASS; deploy НЕ
- Один `order-hub-tray` для `/orders` expand + `/desk` tray; `desk-order-tray` удалён; orders.page spec (HUB-302/303/304) без изменений
- Next: 403 (tree + combine + lazy supply in tray)

## [2026-08-18] — TZ-DESK-402 DONE — live orders + shared form

- Archive: `tasks/_archive/2026-08/TZ-DESK-402.done.md`; SHA `99641d90`; gates PASS; deploy НЕ
- `order-form-panel` shared dialog+desk; desk = live GET /orders; invalid orderId → RU toast + clear query
- Next: 412 (shared order-hub-tray)

## [2026-08-18] — TZ-DESK-406 DONE — desk chrome parity

- Archive: `tasks/_archive/2026-08/TZ-DESK-406.done.md`; SHA `5e83932c`; focused FE gates PASS; deploy НЕ
- `/desk`: одна group-workspace chip-строка, без «Рабочий стол» и H1; ширина = `/orders`
- Next: 402 (form + GET /orders)

## [2026-08-18] — TZ-DESK-405 DONE — desk layout rev.2

- Archive: `tasks/_archive/2026-08/TZ-DESK-405.done.md`; focused FE gates PASS; deploy НЕ
- `/desk`: layout rev.2 DONE (405); 402+ — Freebuff continuous wave _(superseded: «ждёт PO ok»)_

## [2026-08-18] — Manager desk PO review → DESK-405 rev.2

- 401 innards-под-очередью отклонён; expand-in-row + tray-first actions
- Crumbs вместо header; L flyout для left rail; Gantt via crumbs = 407; блокнот = 408
- Next: PROMPT-FREEBUFF-DESK-405.md

## [2026-08-18] — TZ-DESK-401 DONE — fixture manager desk

- Archive: `tasks/_archive/2026-08/TZ-DESK-401.done.md`; fixture `/desk` gates PASS; deploy НЕ
- Next: PO посмотреть `/desk` и сказать «раскладка ок»; DESK-402 не брать раньше

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

## [2026-08-18] — TZ-MATERIALS-313 DONE — цена материала number

- Archive: `tasks/_archive/2026-08/TZ-MATERIALS-313.done.md`; SHA `e34b015d`; gates PASS; deploy **НЕ**
- Next: PO «кати»; затем Freebuff FORMS-314…317

## [2026-08-18] — TZ-COMP-401 PARTIAL — Privacy page & enroll notice

- Archive: `tasks/_archive/2026-08/TZ-COMP-401.done.md`; FE code done; deploy BLOCKED (SSH timeout)
- Next: PO needs to ensure VM is in LAN or VPN is off, then deploy and apply nginx config.

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
