# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-16T17:04:17+03:00
hygiene: `docs/audits/2026-08-16-task-ledger-hygiene-audit.md`; orphan root DONE specs UX-326/332/TZD-48 merged into archive + prompts spent removed

## ACTIVE

- Freebuff (параллель): **WAVE-FREEBUFF-COMBINE-MODULES** — промпт `PROMPT-FREEBUFF-COMBINE-MODULES.md` (406→407→408).
- Cursor/executor queue: **пуста** после TZ-DASHBOARD-401 (готово предложить warm deploy по слову PO).

## NEXT (PO paste prompt)

- Freebuff: скопировать `tasks/_backlog/PROMPT-FREEBUFF-COMBINE-MODULES.md`
- Warm deploy — только по «деплой»/«кати»
- **TZ-DATA-UTF8-CLEAN** — нужен отдельный «ок» (трогает демо-данные)
- SALES-377 — не без PO
- Опц. **TZ-DASHBOARD-402** — КП open aggregate (если понадобится)

_(HARDEN 324–328 DONE 98/100; POLISH 329–330 DONE; 331–335 Gantt polish DONE; **336 order-form Save/site/freeze DONE**; **337 composition pencil/forest DONE**)_

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → DONE; archive + lock prepared
- Backlog: SALES-377 — не брать без PO.
- Chrome page-tools migrate: UX-326+ — по PO (`WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE`)
- Gantt left-edge / a11y polish — parked 308/310; successor after PO

## DONE / LANDED (recent)

## [2026-08-16] — TZ-DASHBOARD-401 DONE — home stats виджеты обзора

- Archive: `tasks/_archive/2026-08/TZ-DASHBOARD-401.done.md`; lock `TZ-DASHBOARD-401-home-stats-widgets.lock`; FE tsc + jest dashboard-stats|dashboard.page 23. Deploy нет.

## [2026-08-16] — TZ-TEST-REGRESS-414 DONE — jest pack COMBINE+GANTT

- Archive: `tasks/_archive/2026-08/TZ-TEST-REGRESS-414.done.md`; lock `TZ-TEST-REGRESS-414-combine-gantt-jest-pack.lock`; BE jest 62 + FE jest 122 + BE/FE tsc EXIT 0. ВОЛНА DONE. Deploy нет.

## [2026-08-16] — TZ-TEST-OPS-413 DONE — docs link smoke COMBINE/GANTT

- Archive: `tasks/_archive/2026-08/TZ-TEST-OPS-413.done.md`; lock `TZ-TEST-OPS-413-docs-link-smoke.lock`; 0 broken links (PAGE-TZ-INDEX 41 refs, COUPLING-MAP rel). Deploy нет.

## [2026-08-16] — TZ-TEST-GANTT-402 DONE — specs «По рабочим»

- Archive: `tasks/_archive/2026-08/TZ-TEST-GANTT-402.done.md`; lock `TZ-TEST-GANTT-402-workers-view-specs.lock`; +2: multi-person label одна группа; worker work-detail read-only. FE tsc + jest production-cockpit|gantt 93. Deploy нет.

## [2026-08-16] — TZ-TEST-COMBINE-412 DONE — dashboard доп. кейсы Комбайна

- Archive: `tasks/_archive/2026-08/TZ-TEST-COMBINE-412.done.md`; lock `TZ-TEST-COMBINE-412-dashboard-extra-cases.lock`; +3: reverse drop design→prep, lineId guard, non-first-shop. FE tsc + jest dashboard.page 17. Deploy нет.

## [2026-08-16] — TZ-TEST-COMBINE-411 DONE — FE orders.service.patchLane spec

- Archive: `tasks/_archive/2026-08/TZ-TEST-COMBINE-411.done.md`; lock `TZ-TEST-COMBINE-411-orders-service-patchlane.lock`; patchLane URL/body/error 2 кейса. FE tsc + jest orders.service 12. Deploy нет.

## [2026-08-16] — TZ-TEST-COMBINE-410 DONE — BE lane controller spec

- Archive: `tasks/_archive/2026-08/TZ-TEST-COMBINE-410.done.md`; lock `TZ-TEST-COMBINE-410-lane-controller-spec.lock`; новый order.controller.spec (happy/shipped 400/unknown 404) + service unknown-lineId 404. BE tsc + jest 2 suites/62. Deploy нет.

## [2026-08-16] — TZ-GANTT-401 DONE — Gantt «По рабочим» (read-only)

- Archive: `tasks/_archive/2026-08/TZ-GANTT-401.done.md`; lock `TZ-GANTT-401-gantt-by-workers-readonly.lock`; code `036b5fd5` (pushed). Toggle «По заказам | По рабочим» в Масштаб-флайауте; worker-группировка + «Не назначен»; read-only. Gates FE tsc + jest 3 suites/91. Deploy нет.

## [2026-08-16] — TZ-COMBINE-405 DONE — FE item DnD + freeze + ship-whole

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-405.done.md`; lock `TZ-COMBINE-405-combine-item-dnd.lock`; FE tsc + dashboard.page 14 PASS. WAVE COMBINE v1 FE write-path DONE. Deploy нет — готово предложить warm deploy 402–405.

## [2026-08-16] — TZ-COMBINE-404 DONE — FE item cards + boardLane columns

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-404.done.md`; lock `TZ-COMBINE-404-combine-item-cards.lock`; FE tsc + dashboard.page specs PASS. Next: 405 DnD. Deploy нет.

## [2026-08-16] — TZ-COMBINE-403 DONE — PATCH line boardLane + Order.status rollup

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-403.done.md`; lock `TZ-COMBINE-403-patch-lane-rollup.lock`; BE tsc + order.service 58/58. Next: 404/405 FE. Deploy нет.

## [2026-08-16] — TZ-COMBINE-402 DONE — OrderItem.lineId + boardLane

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-402.done.md`; lock `TZ-COMBINE-402-order-item-lineid-boardlane.lock`; BE tsc + order.service 48/48. Next: 403. Deploy нет.

## [2026-08-16] — TZ-NAV-305 DONE — Проект: Комбайн first

- Archive: `tasks/_archive/2026-08/TZ-NAV-305.done.md`; lock `TZ-NAV-305-project-combine-first.lock`; entryPath `/design/combine`; flyout Комбайн → Очередь. Deploy нет.

## [2026-08-16] - WARM DEPLOY OK — unattended deploy.ps1

- Outcome: **OK**; HEAD 0081e0bf (0081e0bf31ff9e5531379cb03e44a8b95279116b); smoke LAN /api/health/ready **200**, public https://kppdf-crm.ru/api/health/ready **200**; WIPE=false; timestamp 2026-08-16T13:57:34+03:00.

## [2026-08-16] — TZ-NAV-303 DONE — Комбайн → Проект; home = Обзор

- Archive: `tasks/_archive/2026-08/TZ-NAV-303.done.md`; lock `TZ-NAV-303-combine-to-design-home-stats.lock`; S1 `destructive:false` on statCards; home stats stub; `/design/combine` kanban. Deploy нет.

## [2026-08-16] — TZ-PHOTO-304 DONE — photo frame meta

- Archive: `tasks/_archive/2026-08/TZ-PHOTO-304.done.md`; lock `TZ-PHOTO-304-photo-frame-meta.lock`; BE 4/13 photos + FE tsc + FE photos.service 8; WAVE #1 DONE. Next: UX-PHOTO-302/303. Deploy нет.

## [2026-08-16] — TZ-OPS-SITE-SMOKE-401 DONE — site operator walk PASS

- Archive: `tasks/_archive/2026-08/TZ-OPS-SITE-SMOKE-401.done.md`; journal `docs/audits/2026-08-16-site-operator-walk.md`; lock `TZ-OPS-SITE-SMOKE-401.lock`; closeout `72ba21a8`; Cursor PASS (docs-only). 24 routes PASS/SKIP/stub; catalog P0 OK; S1→NAV-303; S2→TZ-DATA-UTF8-CLEAN PARK. Deploy нет.

## [2026-08-16] — TZ-OPS-313…316 DONE — confidence ledger P2 remediation

- **315** `aba3842b` — CreateOrderDto create-only status + UpdateOrderDto OmitType+PATCH FSM IsIn (ValidationPipe accepts ready/in_production); archive `TZ-OPS-315.done.md`
- **314** `9ddadae2` — director on catalog GET @Roles; archive `TZ-OPS-314.done.md`
- **316** `a1ad0e35` — materials expand без Material.stockQty; archive `TZ-OPS-316.done.md`
- **313** `18d9b915` — PAGE-TZ-INDEX links + COUPLING-MAP combine; archive `TZ-OPS-313.done.md`
- Deploy нет. photos/** WIP не коммитился.

## [2026-08-16] — TZ-OPS-CONFIDENCE-LEDGER-401 DONE — confidence ledger wave

- Archive: `tasks/_archive/2026-08/TZ-OPS-CONFIDENCE-LEDGER-401.done.md`; rollup `docs/audits/confidence/00-ROLLUP.md`; min86/median91 P0=0; closeout `7c882254`; lock `TZ-OPS-CONFIDENCE-LEDGER-401.lock`; Cursor PASS. WAVE DONE. Deploy нет.

## [2026-08-16] — TZ-UX-328 DONE — `/materials` chrome page-tools

- Archive: `tasks/_archive/2026-08/TZ-UX-328.done.md`; code `e7b3c88b`; lock `TZ-UX-328-materials-chrome-page-tools.lock`; Cursor PASS; WAVE #3 DONE. Deploy нет.

## [2026-08-16] — TZ-PRODUCTION-337 DONE — workshop ACTIVE exclude draft

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md`; lock `TZ-PRODUCTION-337-workshop-exclude-draft.lock`; Cursor PASS. Deploy нет. known_limitation: draft `?orderId=` selected bypass.

## [2026-08-16] — TZ-CATALOG-375 DONE — materials list expandable preview

- Archive: `tasks/_archive/2026-08/TZ-CATALOG-375.done.md`; code `1322248d`; lock `TZ-CATALOG-375-materials-list-expand.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-344 DONE — showcase photo contain

- Archive: `tasks/_archive/2026-08/TZ-UX-344.done.md`; code `0dec96e9`; lock `TZ-UX-344-showcase-photo-contain.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-342 DONE — KP rail pager + dead totals

- Archive: `tasks/_archive/2026-08/TZ-UX-342.done.md`; code `db689987`; lock `TZ-UX-342-pager-dead-totals.lock`; Cursor PASS. WAVE pagination #3. Deploy нет.

## [2026-08-16] — TZ-UX-331 DONE — Brand home chip → Комбайн

- Archive: `tasks/_archive/2026-08/TZ-UX-331.done.md`; code `9e410338`; lock `TZ-UX-331-brand-home-combine.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-340 DONE — PiPagination канон + pi-table footer

- Archive: `tasks/_archive/2026-08/TZ-UX-340.done.md`; closeout `dc3491c6`; code `a36120d4`; default 10; size 10/25/50. Deploy нет.

## [2026-08-16] — TZ-CATALOG-374 DONE — `/modules` list expandable состав

- Archive: `tasks/_archive/2026-08/TZ-CATALOG-374.done.md`; row-click expand tray; detail via name; tsc + 24 modules.page tests. Deploy нет.

## [2026-08-16] — TZ-UX-326 DONE — `/products` chrome page-tools

- Archive: `tasks/_archive/2026-08/TZ-UX-326.done.md`; фильтр в app-chrome-rail; w-12 снят. Deploy нет.

## [2026-08-16] — TZ-UX-332 DONE — Product edit `_id` + RU not-found

- Archive: `tasks/_archive/2026-08/TZ-UX-332.done.md`; dashboard findById; RU not-found; photo filename. Deploy нет.

## [2026-08-16] — TZ-PRODUCTION-336 DONE — Gantt skip orders without modules

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-336.done.md`; no empty-module orders on Gantt; rail marker; toast on attempt.

## [2026-08-15] — TZ-ORDERS-337 DONE — Composition-tree pencil + list forest

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-337.done.md`; pencil on tree rows; list expand = live catalog forest; «Паспорт»→«Заказ».

## [2026-08-15] — TZ-ORDERS-336 DONE — Order form productId + default Site + freeze

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-336.done.md`; Save writes productId; empty CP gets default Site; freeze payload/UI.

### TZ-PRODUCTION-335 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-335.done.md`; Gantt/rail sort by startDate; meta auto-save.

### TZ-PRODUCTION-334 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-334.done.md`; workers list `limit: 100` (BE `@Max(100)`).

### TZ-PRODUCTION-333 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-333.done.md`; optimistic Gantt drag; silent PATCH; revert on fail.

### TZ-PRODUCTION-332 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-332.done.md`; Day ticks DD.MM + ПН…ВС; headers h-10.

### TZ-PRODUCTION-331 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-331.done.md`; plan fields through ready; siteId heal; demo seed siteId.

### TZ-PRODUCTION-330 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-330.done.md`; Месяц zoom + RU ticks; Сегодня always recenters.

### TZ-PRODUCTION-329 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-329.done.md`; Filters Counterparty select; tabs removed; Gantt follows select.

### TZ-PRODUCTION-328 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`; page/spec SoT synced; final estimate-studio score 98/100.

### TZ-PRODUCTION-327 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-327.done.md`; one dumb scale-controls extract; 70 production tests PASS.

### WAVE-PRODUCTION-GANTT-CASCADE — DONE 2026-08-15

- **321–323:** work-detail cascade · kill bottom card · one full-width meta

### WAVE-PRODUCTION-GANTT-TREE — DONE 2026-08-15

- 314–320: expand · bottom card · offsets · keep orders · sheet viewport · card IA · **split expand vs card**

### TZ-AUTH-305 — DONE / CUTOVER 2026-08-15

### WAVE-UX-CHROME-GANTT-TOOLS — DONE (100)

## NEXT

1. AUTH-307 park — только после PO
2. App warm deploy — только по «деплой»
3. Chrome page-tools migrate wave — по PO

## HEAD / queue

- Queue: **WAVE COMBINE v1** — **405 DONE**; next 406/407 or PO warm deploy.
- Deploy app: НЕ — не автодеплой; **готово предложить** warm после 402–405 PASS
