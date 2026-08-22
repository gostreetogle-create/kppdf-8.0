# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-22T11:28:00+03:00
hygiene: origin `ba98a4a5`; PO wave **304+417+308** on main; prod still on older SHA — **warm deploy pending**

## ПРАВИЛО (PO 2026-08-21): GitHub = только хранилище

Никаких GitHub Actions и dependabot — `.github/` удалён, не возвращать.
Проверки только локальные: pre-commit гейт + smoke-скрипты. Канон:
`docs/GIT-POLICY.md`; политика деплоя: `deploy/synology/README.md`.

## ACTIVE

AUDIT (read-only): data-model refresh — Freebuff, 2026-08-22T08:36:56+03:00 — DONE
AUDIT (read-only): UI consistency — Freebuff, 2026-08-22T08:44:13+03:00 — DONE
**TZ-STRAT-01A** — DONE by `claude` (2026-08-22T11:05:00+03:00): PO/Cursor review PASS relayed; re-gate перед closeout (tsc + focused Jest 66/66) без расхождений; archive `tasks/_archive/2026-08/TZ-STRAT-01A.done.md`; deploy НЕ.
**TZ-SUPPLY-315** — DONE by `claude` (2026-08-22T10:20:00+03:00), commit `df4cd1fd` pushed: PiDialogService/app-pi-overflow-select/token conformance; archive `tasks/_archive/2026-08/TZ-SUPPLY-315.done.md`; target gates PASS (FE tsc, jest 28/28, lint, supply-smoke 23/23); browser pass PASS (Puppeteer 5/5 dialogs + catalogs, light/dark); unscoped FE Jest has 8 unrelated failures; deploy НЕ.
**TZ-SUPPLY-314** — DONE by `freebuff` (2026-08-22T10:52:01+03:00): гид-режим раскрытия блоков (whereExpanded/detailsExpanded), auto-expand по categoryId+materialId, gates PASS (tsc, jest 28/28, lint, smoke 23/23); archive `tasks/_archive/2026-08/TZ-SUPPLY-314.done.md`.
**TZ-DESK-419** — DONE by `claude` (2026-08-22T11:07:00+03:00); commits `2c6f840a` + `bdbbbc87`; archive `tasks/_archive/2026-08/TZ-DESK-419.done.md`; CSS queue height `calc(100dvh - 9.5rem)`; gates/browser PASS.
**TZ-DESK-421** — DONE by `claude` (2026-08-22T11:20:00+03:00); commit `d2f3e6a3`; docs-only audit `docs/audits/2026-08-22-desk-order-tray-execution-panel-audit.md`; archive `tasks/_archive/2026-08/TZ-DESK-421.done.md`; successor `TZ-DESK-422`.
**TZ-DESK-420** — CLAIMED / IN PROGRESS by `claude` (2026-08-22T11:28:00+03:00); conflict key `frontend/src/app/shared/orders/order-hub-tray.component.ts`.

**PO reminders wave** — код на `main`, prod не обновлён:
- PARTY-304 `e41dec0d` — пагинация контрагентов
- DESK-417 `cda4417b` — фильтр стола persist + default all
- ORDERS-308 `ba98a4a5` — PATCH номера + soft-delete в списке

Deploy: PO «кати» → `PRE-DEPLOY-2026-08-19.md` target `ba98a4a5`

## SUPPLY WAVE 2026-08-20 (TZ-SUPPLY-312 READY_FOR_ACCEPTANCE)

- Стендовый smoke выполнен: `node scripts/smoke/supply-smoke.mjs` → **23/23 PASS**
  (auth, Mongo, склад, upload-хранилище, быстрый заказ→реестр→отгрузка).
  Чек-лист: `docs/agent-checklists/SUPPLY-SMOKE.md`; браузерный проход PO после deploy.
- Найдено и исправлено 2 бага storage-item: partial unique index (`$exists` →
  `$type: 'objectId'`, `zoneName: null`) и silent no-op `remove()` → hard delete.
- Legacy PurchaseRequest/PurchaseOrder → **TZ-SUPPLY-313 DONE, вариант A** (официальный
  legacy-режим: read-only + MCP, без UI). Ledger + DOMAIN-MAP обновлены; удаление (B) — successor.

## QUEUE

Backlog (не брать без PO): PARTY-305, ORDERS-307, UI-344, SUPPLY-304/305

## DESK WAVE checkpoint (PO)

- Done: 406 `5e83932c`, 402 `99641d90`, 412 `53c8e75c`, 403 `0ce536a4`, 413 `4dff6012`, 410 `deb0fbce`, 411 `18d0af00`, 407 `91e33ee6`, 404 `e29fae3f`, 408 `1e67c6f5`, 414 (local), 416 tray from=desk
- Failed/Deferred: нет. known_limitation: Комбайн-возврат = назад браузера (общий DashboardPage); module-якорь блокнота — API only.
- HEAD: `387b04d0` == origin/main ✓ (code 408 = `1e67c6f5`)
- Gates: FE tsc OK; FE jest 45/45 (manager-desk 18, orders.page, order-form-panel, hub-tray); BE tsc OK; BE desk-note 8/8; eslint 0 err.
- Smoke DESK-SMOKE: **0/13 local** — dev-серверы не запущены (backend требует БД/VPN); автоматические тесты покрывают очередь/form/tray/ACL/404/408. PO: пройти DESK-SMOKE после VPN.
- Deploy: **НЕ ЗАПУЩЕН** (VPN). PO: «кати» когда вернётся.
- Критичные файлы: `manager-desk.page.ts`, `order-hub-tray.component.ts`, `order-form-panel.component.ts`, `desk-workflow-chips.ts`, `desk-notes.service.ts`, `backend/src/modules/desk-note/`

Gate «раскладка v2 ok» **снят** — PO delegated full desk while away.

## NEXT (PO when back)

1. VPN on → smoke `/desk` + `DESK-SMOKE.md` + `DESKTOP-SMOKE.md`
2. Переустановить Desktop с локального `kppdf-desktop-setup-v0.5.6.zip` (PE 0.5.6, ~45 MB)
3. «кати» warm deploy if smoke ok

## DONE / LANDED (recent)

## [2026-08-19] — TZ-ORDERS-308 DONE — PATCH number + soft-delete list filter

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-308.done.md`; SHA `ba98a4a5`; BE jest **78/78**; deploy **НЕ**
- Root cause: `update()` ignored `number`; `findAll()` не фильтровал `deletedAt`
- PO smoke после deploy: смена номера + удаление на `/orders`

## [2026-08-19] — TZ-DESK-417 DONE — desk filter persist per user

- SHA `cda4417b`; default all statuses; localStorage per userId; deploy **НЕ**

## [2026-08-19] — TZ-PARTY-304 DONE — counterparties pagination

- SHA `e41dec0d`; BE `$and` tenant+search; «Показано X–Y из Z»; deploy **НЕ**

## [2026-08-19] — TZ-DESK-416 DONE — tray «Открыть производство» from=desk

- Archive: `tasks/_archive/2026-08/TZ-DESK-416.done.md`; gates PASS (FE tsc, tray+orders jest 19/19, eslint); deploy НЕ
- Desk tray → `/production?orderId=&from=desk`; hub без `from`

## [2026-08-19] — TZ-DESK-414 DONE — RouterLink + stale notes + chip activeId

- Archive: `tasks/_archive/2026-08/TZ-DESK-414.done.md`; gates PASS (FE tsc, jest 20/20, eslint); deploy НЕ
- `RouterLink` на gantt/combine stub; `loadNotes` clear + drop stale GET; `[activeId]="view()"`

## [2026-08-19] — TZ-DESK-415 DONE — DeskNote orderId + author ACL

- Archive: `tasks/_archive/2026-08/TZ-DESK-415.done.md`; gates PASS (tsc + jest 10/10); deploy НЕ
- GET `/desk-notes` без валидного `orderId` → 400; PATCH/DELETE — автор или admin|director|manager, иначе 403

## [2026-08-18] — TZ-DESK-408 DONE — DeskNote (BE + FE)

- Archive: `tasks/_archive/2026-08/TZ-DESK-408.done.md`; SHA `1e67c6f5`; gates PASS; deploy НЕ
- BE `desk-note` module (schema + GET/POST/PATCH/DELETE /desk-notes, hard delete, indexes); FE `panel=notebook` на /desk (список + форма, kind/якорь, checklist, delete)
- **DESK WAVE COMPLETE** — очередь исчерпана; см. checkpoint выше

## [2026-08-18] — TZ-DESK-404 DONE — deep-link студии + «На стол»

- Archive: `tasks/_archive/2026-08/TZ-DESK-404.done.md`; SHA `e29fae3f`; gates PASS; deploy НЕ
- rail «На Ганте»/«В комбайне» → реальные студии с orderId&from=desk; на /production from=desk — RU «На стол» → /desk?orderId=; Комбайн — назад браузера (known_limitation)
- Next: 408 (DeskNote)

## [2026-08-18] — TZ-DESK-407 DONE — view=gantt/combine stub

- Archive: `tasks/_archive/2026-08/TZ-DESK-407.done.md`; gates PASS; deploy НЕ
- `?view=` query → stub views (crumbs + studio-link) для gantt/combine; chips/tools ведут на /desk?view=; embed отложен
- Next: 404 (deep-link fallback)

## [2026-08-18] — TZD-58 DONE — installer integrity 0.5.6

- Archive: `tasks/_archive/2026-08/TZD-58.done.md`; SHA `02534d0e`; exe 45339307 B PE 0.5.6; deploy **нет**
- Next: PO DESKTOP-SMOKE + deploy when VPN ok

## [2026-08-18] — TZD-49 DONE — CAD spec import follow-ups

- Archive: `tasks/_archive/2026-08/TZD-49.done.md`; SHA `098e0d3b`; tests 75/75; deploy НЕ
- name=article fallback (warning); dims/weight on module create; catalog lookup by article/sku
- PO smoke CAD xlsx — после reinstall Desktop 0.5.6

## [2026-08-18] — TZD-57 DONE — pairing download button + version

- Archive: `tasks/_archive/2026-08/TZD-57.done.md`; SHA `0f7138a4`; jest 11/11; deploy НЕ
- Toolbar: «Скачать Desktop v{semver}» напротив «Выпустить ключ»; footer только «Закрыть»
- Next desktop wave: **58** installer integrity

## [2026-08-18] — TZ-DESK-411 DONE — capabilities + CTA why-disabled

- Archive: `tasks/_archive/2026-08/TZ-DESK-411.done.md`; SHA `18d0af00`; gates PASS; deploy НЕ
- workflow strip + rail tools по page ACL; disabled CTA — RU-подсказка причины
- Next: 407 (view=gantt/combine)

## [2026-08-18] — TZ-DESK-410 DONE — search/filter/summary/sort

- Archive: `tasks/_archive/2026-08/TZ-DESK-410.done.md`; SHA `deb0fbce`; gates PASS; deploy НЕ
- toolbar debounced search; filter flyout («Активные» default, `?status=`); summary flyout; sort date desc; «ещё N»
- Next: 411 (capabilities)

## [2026-08-18] — TZ-DESK-413 DONE — tray visual IA (summary + cards)

- Archive: `tasks/_archive/2026-08/TZ-DESK-413.done.md`; SHA `4dff6012`; gates PASS; deploy НЕ
- summary bar + 2-col card grid; combine = lane chips в Исполнение; desk composition open by default
- Next: 410 (search/filter)

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
