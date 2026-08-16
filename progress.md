## [2026-08-16] — TZ-UX-344 DONE — showcase photo contain
**Исполнитель:** agent-ux344-WIN-LOQVGED63JM-28704
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** `pi-showcase-card` media img `object-fit: contain` + `object-position: center`; removed md cover override; spec asserts contain.
**Gates:** FE tsc PASS; pi-showcase-card Jest 12/12 PASS.
**Review:** Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-344.done.md`
**Commit:** _(stamp after commit)_
**Lock:** `.mimocode/locks/TZ-UX-344-showcase-photo-contain.lock`
**Next:** STOP for this TZ; list-thumb cover = known_limitation / successor; deploy не выполнялся.

## [2026-08-16] — TZ-UX-342 DONE — KP rail pager + dead totals
**Исполнитель:** cursor-composer
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** KP rail → `app-pi-pagination` (PAGE_SIZE 10, `showPageSize=false`); dead `[total]` removed on inventory/supply/dict/doc lists; documents/templates unused Показано helpers cleaned; forms demo 5→10.
**Gates:** FE tsc PASS; focused Jest 14 suites / 109 tests PASS.
**Review:** Cursor Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-UX-342.done.md`
**Commit:** `db689987256bbc8e054e1838aacc1417aa5ac14f`
**Lock:** `.mimocode/locks/TZ-UX-342-pager-dead-totals.lock`
**Next:** STOP for this TZ; WAVE-UX-PAGINATION-UNIFY #1–#3 DONE; deploy не выполнялся.

## [2026-08-16] — TZ-UX-341 DONE — catalog grid pager → pi-pagination
**Исполнитель:** cursor-composer
**Статус:** DONE; REVIEW not required; deploy НЕ
**Что:** products/modules/materials grid custom pager → `app-pi-pagination`; products 15→10; `pageSizeChange` resets page 1; modules grid slice via `paginatedRows()`.
**Gates:** FE tsc PASS; products|modules|materials page Jest 69/69 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-341.done.md`
**Commit:** `c1e5d1c5`
**Lock:** `.mimocode/locks/TZ-UX-341-catalog-grid-pager-unify.lock`
**Next:** TZ-UX-342 (already READY FOR REVIEW); deploy не выполнялся.

## [2026-08-16] — TZ-UX-331 DONE — Brand home chip → Комбайн
**Исполнитель:** cursor-composer
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** бренд «KPPDF · 8.0» в шапке — видимый home-chip (`nav-brand-home`, sunrise soft + gold marker, hover/focus); `routerLink="/"` → Комбайн; aria/title «Комбайн заказов — главная»; канон dashboard/page-chrome/PAGE-TZ-INDEX.
**Gates:** FE tsc PASS; app-layout Jest 8/8 PASS.
**Review:** Cursor Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-UX-331.done.md`
**Commit:** `9e4103380527d169ab20a18ab03f452a199f6bfa`
**Lock:** `.mimocode/locks/TZ-UX-331-brand-home-combine.lock`
**Next:** STOP for this TZ; deploy не выполнялся.

## [2026-08-16] — TZ-CATALOG-374 DONE — `/modules` list expandable состав
**Исполнитель:** cursor-composer
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** клик по строке модуля в list раскрывает gold-soft tray состава (`getModuleTree`); detail через имя / «Открыть карточку»; empty/loading/error RU; `expandedSection` задел без пустых вкладок; grid без expand.
**Gates:** FE tsc PASS; modules.page Jest 24/24 PASS.
**Review:** Cursor architect Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-374.done.md`
**Commit:** `215b89fb4a551f3aeefdd2a71174e5752f9a1f54`
**Lock:** `.mimocode/locks/TZ-CATALOG-374-modules-list-expand.lock`
**Next:** STOP for this TZ; deploy не выполнялся.

## [2026-08-16] — TZ-UX-326 DONE — `/products` chrome page-tools
**Исполнитель:** cursor-grok-4.6
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** воронка фильтра Продукции в `app-chrome-rail` под ←; вид+Обновить справа; локальный `w-12` снят; flyout overlay сохранён; &lt;1680 — icon-fallback в toolbar.
**Gates:** FE tsc PASS; products.page Jest 24/24 PASS.
**Review:** Cursor self-review PASS (PO: закрыть без деплоя).
**Archive:** `tasks/_archive/2026-08/TZ-UX-326.done.md`
**Commit:** `da5bf969c31d3939f376758da0c9ae4bb9888646`
**Lock:** `.mimocode/locks/TZ-UX-326-products-chrome-page-tools.lock`
**Next:** TZ-UX-327 по PO; deploy не выполнялся.

## [2026-08-16] — TZ-UX-332 DONE — Product edit `_id` + RU not-found
**Исполнитель:** cursor-grok-4.6
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** дашборд открывает изделие через `findById` (полный `Product._id`); Save больше не бьёт `PATCH /products/undefined`; 404 not-found в UI по-русски; кириллица в имени фото декодируется с latin1 Multer.
**Gates:** FE tsc PASS; FE jest 3/35; BE tsc PASS; BE jest 5/14.
**Review:** Cursor self-review PASS (PO: закрыть без деплоя).
**Archive:** `tasks/_archive/2026-08/TZ-UX-332.done.md`
**Commit:** `e45bfcccd049315561d15873f672569dde16783a`
**Lock:** `.mimocode/locks/TZ-UX-332-product-edit-undefined-ru-errors.lock`
**Next:** STOP for this TZ; deploy не выполнялся.

## [2026-08-16] — TZD-48 DONE — Desktop Import Studio release blockers
**Исполнитель:** Buffy / фоновый desktop исполнитель
**Статус:** DONE; Cursor Verdict PASS; commit b03ecc22060f4d20c6d559c043910ea4701b5d87 pushed (e108e22a..b03ecc22 → main); deploy НЕ
**Что:** сняты 10 блокеров релиза 0.5.3: AI-runner `/download` асинхронный + mkdir models + URL allowlist HF + не-sticky missing-file; частичный merge AI-карты (не обнуляет эвристики); честность SoT (non-material «Записать в каталог» + confirm, processed/ только при proposed+created>0); inbox Excel — лист с данными; counterparty inn required; bom убран из enum + guard; BE 400 на пустой профиль + нормализация legacy columnMap; копи «Модель» Запустить→Скачать→Перезапустить.
**Gates:** desktop tsc PASS; svelte-check 0/0; desktop tests 46/46 (вкл. partial AI map, inn, sheet-with-data, URL allowlist); backend jest 12/12 (empty profile 400, dual-state normalize); smoke ai-runner PASS.
**Review:** Cursor PASS (b03ecc22060f4d20c6d559c043910ea4701b5d87).
**Archive:** `tasks/_archive/2026-08/TZD-48.done.md`
**Lock:** `.mimocode/locks/TZD-48-desktop-import-studio-release-blockers.lock`
**Known limit:** живой GGUF-прогон не делался (трафик); journal HITL для product/module/counterparty, размеры/вес CAD, session-per-chat Llama — successor TZD-49 (PARK).
**Next:** STOP; новых TZ не брать. Версия 0.5.3 готова к сборке инсталлятора.

## [2026-08-16] — TZ-PRODUCTION-336 DONE — Gantt skip orders without modules
**Исполнитель:** cursor-grok-4.6
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** на Гант не кладутся заказы без прямых модулей/видов работ; шапка без спама «нет прямых модулей»; rail показывает их с маркером «нет плана»; toast только при выборе / `?orderId=`.
**Gates:** FE tsc PASS; focused Jest 4 suites / 56 tests PASS; eslint owned files PASS (pre-existing OnInit warning).
**Review:** Cursor PASS — eligibility = `buildGanttBars`; header spam gone; toast on attempt only.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-336.done.md`
**Commit:** `1650cb22`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-336-gantt-skip-orders-without-modules.lock`
**Next:** STOP for this TZ; deploy не выполнялся.

## [2026-08-16] — TZ-FRONTEND-305 DONE — dashboard dialog boundary
**Исполнитель:** Buffy
**Статус:** DONE; scoped score 100/100; deploy НЕ
**Что:** DashboardPage больше не импортирует sibling page dialogs; `DashboardDialogService` сохраняет lazy Order/Product dialog payloads и reload-after-close. Канбан write-path и UX не менялись.
**Gates:** FE tsc PASS; dashboard + coordinator Jest 2 suites / 7 tests PASS; ESLint/Prettier/diff-check PASS; architecture:check PASS (948 files; baseline 6).
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-305.done.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-305-dashboard-dialog-boundary.lock`
**Score:** TZ scoped acceptance 100/100; deploy отложен до завтра.

## [2026-08-16] — TZ-FRONTEND-304 DONE — composition dialog boundary
**Исполнитель:** Buffy
**Статус:** DONE; scoped score 100/100; deploy НЕ
**Что:** существующие Product/Module/Material page-dialog imports вынесены из shared composition UI в `ProductCompositionDialogService`; UX, composition API/write-path, cost hints и close refresh сохранены. Остаточный API ownership панели зафиксирован как отдельный successor.
**Gates:** FE tsc PASS; baseline composition/QuickCreate 3 suites / 38 tests PASS; final unique gate 5 suites / 69 tests PASS (module detail + product form included); ESLint/Prettier/diff-check PASS. Architecture check blocked only by pre-existing dashboard cross-page imports at lines 19,26.
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-304.done.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-304-composition-dialog-boundary.lock`
**Score:** TZ scoped acceptance 100/100; deploy НЕ; next action = explicit PO choice.

## [2026-08-16] — TZ-SWEEP-401 DONE — Kanban order write-path
**Исполнитель:** Buffy
**Статус:** DONE; Cursor Verdict PASS; deploy НЕ
**Что:** order status FSM теперь принимает PATCH только по draft↔confirmed↔in_production↔ready; shipped/delivered/cancelled защищены RU-ошибкой без мутаций; ship() создаёт отгрузку и переводит все items в shipped. Канбан получил optimistic PATCH/rollback/toast, подтверждение отгрузки и корректный item.status/readiness; форма и навигация «Комбайн» → `/dashboard` синхронизированы.
**Gates:** BE tsc PASS; order.service Jest 42/42; BE ESLint PASS; FE tsc PASS; focused FE Jest 26/26 + follow-up dashboard spec 5/5 (`7f81c949`) + смежные 62/62; FE ESLint/Prettier/diff-check PASS.
**Review:** Cursor independent review PASS, 8/8 acceptance points, no blockers.
**Archive:** `tasks/_archive/2026-08/TZ-SWEEP-401.done.md`
**Lock:** `.mimocode/locks/TZ-SWEEP-401-kanban-order-write-path.lock`
**Next:** STOP; deploy не выполнялся.

## [2026-08-16] — TZ-UI-PHOTO-343 DONE — catalog photo-entry sweep
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-COMPOSE-CREATE-PHOTO complete; deploy НЕ
**Что:** product/material primary photo controls migrated to `app-pi-photo-dropzone`; module form/detail and QuickCreate paths verified; catalog primary photo entries now share file + drag-and-drop + Ctrl+V. Module detail URL remains collapsed secondary; organization/document-constructor asset uploaders documented as intentional non-catalog workflows.
**Gates:** FE tsc PASS; Jest product/material/dropzone 3 suites / 77 tests PASS; module-detail + QuickCreate 2 suites / 19 tests PASS; lint PASS с 18 существующими архитектурными предупреждениями; owned Prettier PASS; diff-check PASS. Docs Prettier reports existing markdown drift; broad reformat not applied.
**Archive:** `tasks/_archive/2026-08/TZ-UI-PHOTO-343.done.md`
**Lock:** `.mimocode/locks/TZ-UI-PHOTO-343-photo-sweep.lock`
**Score:** WAVE 4/4; all phases archived; next action STOP.

## [2026-08-16] — TZ-MODULES-341 DONE — module photo upload form/detail/QC
**Исполнитель:** Buffy
**Статус:** DONE; deploy НЕ
**Что:** module form and QuickCreate L upload through shared dropzone/PhotosService and link via ProductModulePhotosService `photoId`; module detail file upload is primary, URL is collapsed secondary; module photo links use one API path.
**Gates:** FE tsc PASS; Jest module form/detail + QuickCreate + dropzone + product/material forms 6 suites / 101 tests PASS; lint PASS с 18 существующими архитектурными предупреждениями; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-MODULES-341.done.md`
**Lock:** `.mimocode/locks/TZ-MODULES-341-module-photo-upload.lock`
**Dep:** TZ-UI-PHOTO-342 (`c523237c`)

## [2026-08-16] — TZ-UI-PHOTO-342 DONE — shared photo dropzone paste + RU hint
**Исполнитель:** Buffy
**Статус:** DONE; deploy НЕ
**Что:** dropzone принимает изображения из Ctrl+V при hover/focus, игнорирует текст/не-image clipboard, сохраняет upload/delete ownership у parent; hint унифицирован как «Файл с диска · перетащить · Ctrl+V».
**Gates:** FE tsc PASS; Jest dropzone + QuickCreate + product/material forms 4 suites / 91 tests PASS; lint PASS с 18 существующими архитектурными предупреждениями; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-PHOTO-342.done.md`
**Lock:** `.mimocode/locks/TZ-UI-PHOTO-342-photo-dropzone-paste.lock`
**Dep:** TZ-CATALOG-340

## [2026-08-16] — TZ-CATALOG-340 DONE — Composition picker «Создать» → QuickCreate
**Исполнитель:** Buffy
**Статус:** DONE; deploy НЕ
**Что:** picker рядом с «Что добавить» открывает product/module QuickCreate или material create form по активной вкладке; успешный результат сразу добавляется в options и выбирается без сброса количества; BOM write path не менялся.
**Gates:** FE tsc PASS; Jest picker + BOM panel + QuickCreate 3 suites / 38 tests PASS; lint PASS с 18 существующими архитектурными предупреждениями; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-340.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-340-composition-picker-create.lock`
**Dep:** none

## [2026-08-15] — TZ-ORDERS-337 DONE — Composition-tree pencil + list forest
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** карандаш на строках состава; лист изделия/модуля открывает каталог; expand списка = `app-composition-tree`; «Паспорт заказа» → «Заказ».
**Gates:** FE tsc PASS; Jest composition-tree + order-detail + orders.page + forest + bom-panel **48 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-337.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-337-order-composition-edit.lock`
**Dep:** TZ-ORDERS-336

## [2026-08-15] — TZ-ORDERS-336 DONE — Order form productId + default Site + freeze
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** onProductPick пишет productId; пустой объект → ensure-default Site; freeze in_production/ready только план/приоритет; date input + ship default.
**Gates:** FE+BE tsc PASS; FE Jest order-form-dialog **9 PASS**; BE site.service **4 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-336.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-336-order-form-save-site-freeze.lock`
**Dep:** none

## [2026-08-15] — TZ-PRODUCTION-335 DONE — Gantt sort by start + clean order-meta
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** Гант/rail — раньше startDate выше (tie orderNumber); meta: Статус заказа / Важность / Начало плана; auto-save silent optimistic; убраны hint и кнопка Сохранить.
**Gates:** FE tsc PASS; FE Jest gantt-bar.model + gantt-bars + production-cockpit + orders-rail **85 PASS**; lint owned files PASS (pre-existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-335.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-335-gantt-sort-meta-clean.lock`
**Dep:** 333

## [2026-08-15] — TZ-PRODUCTION-334 DONE — Workers list limit 100 (no 400)
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** cockpit `getWorkersByWorkType` → `workersApi.list({ limit: 100, isActive: true })`; BE `@Max(100)`; spec asserts limit 100.
**Gates:** FE tsc PASS; FE Jest production-read.facade.spec **2 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-334.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-334-workers-list-limit.lock`
**Dep:** none

## [2026-08-15] — TZ-PRODUCTION-333 DONE — Optimistic Gantt drag, no full reload
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** resize / summary plannedDate / child start-offset — optimistic local bars + silent PATCH; fail → revert + error toast; «Обновить» по-прежнему полный reload.
**Gates:** FE tsc PASS; FE Jest gantt-bar.model + production-cockpit **38 PASS**; lint owned files PASS (pre-existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-333.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-333-gantt-optimistic-drag.lock`
**Dep:** 331 / 332

## [2026-08-15] — TZ-PRODUCTION-332 DONE — Day Gantt ticks DD.MM + weekday
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** zoom День — две строки в тике (`DD.MM` + ПН…ВС UTC); шапка шкалы и «Заказ» `h-10`; Месяц без weekday (330).
**Gates:** FE tsc PASS; FE Jest gantt-bars **36 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-332.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-332-gantt-day-weekday-ticks.lock`
**Dep:** 330 / 331

## [2026-08-15] — TZ-PRODUCTION-331 DONE — Plan fields on ready + heal missing siteId
**Исполнитель:** cursor-grok-4.6-executor
**Статус:** DONE; deploy НЕ
**Что:** `plannedDate`/`priority` на in_production/ready; состав заморожен; shipped+ план блокируется; legacy `siteId` лечится первой площадкой контрагента; demo seed всегда пишет siteId.
**Gates:** BE tsc PASS; BE Jest order.service **34 PASS**; FE tsc PASS; FE Jest production **6 suites / 74 tests PASS**; lint PASS (1 existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-331.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-331-order-plan-fields-ready.lock`
**Dep:** 330

## [2026-08-15] — TZ-PRODUCTION-330 DONE — Месяц zoom + Сегодня always scrolls
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-POLISH complete; deploy НЕ
**Что:** «Неделя» → «Месяц» с RU тиками; fit-density как у бывшей недели; Сегодня всегда центрирует маркер (chrome «Прокрутить к сегодня»).
**Gates:** FE tsc PASS; FE Jest production **6 suites / 73 tests PASS**; lint PASS (1 existing OnInit warning); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-330.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-330-gantt-month-today.lock`
**Dep:** 329 (`ee0b0c78`)

## [2026-08-15] — TZ-PRODUCTION-329 DONE — Filters + Counterparty select → Gantt
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-POLISH 329 closed; deploy НЕ
**Что:** вкладки Заказы|Заказчики убраны; Фильтры = Counterparty select + Сброс accent если dirty; выбор заказчика сразу режет список Заказы и Гант; chrome «Фильтры» active пока dirty.
**Gates:** FE tsc PASS; FE Jest production **6 suites / 71 tests PASS**; lint PASS (1 existing OnInit warning); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-329.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-329-filters-counterparty.lock`
**Dep:** 328

## [2026-08-15] — TZ-PRODUCTION-328 DONE — production cockpit docs closeout
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN complete; deploy НЕ
**Что:** production-cockpit.page.md rewritten as page SoT; production-gantt-studio-spec synchronized to no-bottom-card cascade and current zoom/filters/write paths; final audit scoreboard and indexes closed; estimate studio **STUDIO ESTIMATE PASS 98/100**; fact production OUT.
**Gates:** docs review/diff-check PASS; prior FE tsc PASS; production Jest **6 suites / 70 tests PASS**; lint PASS (18 existing architecture warnings); targeted Prettier PASS; root markdown Prettier unavailable.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-328-cockpit-docs-closeout.lock`
**Dep:** 327 (`038b18da`)

## [2026-08-15] — TZ-PRODUCTION-327 DONE — cockpit smart/dumb light refactor
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 327 closed; deploy НЕ
**Что:** Smart/dumb inventory recorded; ProductionCockpitPage/Facade/Context remain orchestration/read/state boundaries; Gantt and Orders rail stayed behavior-sensitive; one focused dumb `ProductionScaleControlsComponent` extracted with input/output-only zoom/fit events; no UX/API rewrite.
**Gates:** FE tsc PASS; FE Jest production **6 suites / 70 tests PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-327.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-327-cockpit-smart-dumb.lock`
**Dep:** 326 (`23f0740f`)

## [2026-08-15] — TZ-PRODUCTION-324 DONE — Gantt fit-width / «Сегодня»
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 324 closed; deploy НЕ
**Что:** Неделя измеряет ширину timeline через ResizeObserver и считает fit-density с readable min 12px/day; «Вместить сроки» сужает range до padded min…max баров, включает Неделю и скроллит начало; «Сегодня» держит today в range и скроллит красный маркер в viewport.
**Gates:** FE tsc PASS; FE jest gantt-bars + production-cockpit **43 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-324.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-324-gantt-zoom-fit.lock`
**Dep:** 323

## [2026-08-15] — TZ-PRODUCTION-325 DONE — Orders rail / Заказчики
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 325 closed; deploy НЕ
**Что:** status-pips убраны из Orders rail; режим Заказчики агрегирует Counterparty/«Без заказчика» и фильтрует rail+Гант; поиск переключается номер/имя; dateFrom/dateTo проверены.
**Gates:** FE tsc PASS; FE jest orders-rail + model + cockpit **33 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-325.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-325-orders-rail-counterparties.lock`
**Dep:** 324

## [2026-08-15] — TZ-PRODUCTION-326 DONE — plannedDate write-path sync
**Исполнитель:** Buffy
**Статус:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 326 closed; deploy НЕ
**Что:** summary drag and meta Save use canEditOrder (admin|manager); child resize/start-offset/catalog remain production:write; successful plannedDate update reloads orders/bars; existing ISO API verified.
**Gates:** FE tsc PASS; FE jest Gantt + cockpit **46 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-326.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-326-gantt-write-sync.lock`
**Dep:** 325

## [2026-08-15] — TZ-PRODUCTION-323 DONE — one Gantt meta + full-width cascade panels
**Исполнитель:** executor-grok-4.6
**Статус:** DONE; WAVE-PRODUCTION-GANTT-CASCADE closed (321–323); deploy НЕ
**Что:** meta только под summary (не на child); order-meta и work-detail — непрерывная полоса label+timeline (`gantt-cascade-panel` 100cqw + minWidth board, spacer на календаре); поля в один ряд.
**Gates:** FE tsc PASS; FE jest gantt-bars + production-cockpit **41 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-323.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-323-gantt-cascade-fullwidth.lock`
**Dep:** 322
**known_limitations:** новые поля в широкой панели — не в этом TZ.

## [2026-08-15] — TZ-PRODUCTION-322 DONE — Gantt order-meta + kill bottom card
**Исполнитель:** executor-grok-4.6
**Статус:** DONE; WAVE-PRODUCTION-GANTT-CASCADE closed (321+322); deploy НЕ
**Что:** meta strip под summary (status/priority/plannedDate/Save/`/orders`); sheet + chrome «Карточка» сняты; label/select/`?orderId=` → meta; Esc/dismiss чистит meta+detail+trees; 321 work-detail жив.
**Gates:** FE tsc PASS; FE jest `src/app/pages/production` **58 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-322.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-322-gantt-order-meta-kill-card.lock`
**Dep:** 321
**known_limitations:** product/module deep-links из inspector — backlog; sheet не восстанавливать.

## [2026-08-15] — TZ-PRODUCTION-321 DONE — Gantt work-detail cascade
**Исполнитель:** executor-grok-4.6
**Статус:** DONE; WAVE-PRODUCTION-GANTT-CASCADE 321 closed; 322 next; deploy НЕ
**Что:** клик вида работ (лейбл/▸) → inline detail под строкой (люди, дни PATCH estimate-days, catalog confirm); один detail; Esc/dismiss; highlight `gantt-work-detail-open`. Нижняя Карточка жива (322).
**Gates:** FE tsc PASS; FE jest gantt-bars|cockpit|model **52 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-321.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-321-gantt-work-detail-cascade.lock`
**Dep:** 320


**Исполнитель:** executor-composer
**Статус:** DONE; WAVE-PRODUCTION-GANTT-TREE closed 314–320; deploy НЕ
**Что:** ▸ = только дерево Ганта; номер заказа = только карточка; убран setOrderExpanded из onSelect/label; visual expand-col + a11y.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **32 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-320.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-320-split-expand-vs-card.lock`
**Dep:** 319

## [2026-08-15] — TZ-PRODUCTION-319 DONE — Gantt card IA + taller sheet
**Исполнитель:** executor-composer
**Статус:** DONE; WAVE-PRODUCTION-GANTT-TREE closed 314–319; deploy НЕ
**Что:** карточка только с левой подписи summary (toggle) / chrome; child/chevron/timeline ≠ card; sheet `min(72vh, …)`.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **31 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-319.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-319-gantt-card-interaction.lock`
**Dep:** 318

## [2026-08-15] — TZ-PRODUCTION-318 DONE — card sheet viewport + upward composition
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; WAVE-PRODUCTION-GANTT-TREE closed; deploy НЕ
**Что:** sheet почти full-width + max-height в viewport; состав — fixed upward popovers; saves intact.
**Gates:** FE tsc PASS; FE jest cockpit **9 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-318.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-318-card-sheet-viewport.lock`
**Dep:** 317 @ 67d266dc

## [2026-08-15] — TZ-PRODUCTION-317 DONE — Gantt select keeps multi-order
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; deploy НЕ
**Что:** select/deep-link/reload больше не зовут `applyBars([order])`; `applyFilteredActive()` + `setOrderExpanded`; дети под сводкой, peer-заказы остаются.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **28 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-317.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-317-gantt-expand-keep-orders.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE → next 318

## [2026-08-15] — TZ-PRODUCTION-316 DONE — per-bar start offsets (parallel)
**Исполнитель:** gemini-executor-gantt-tree
**Статус:** DONE; WAVE-PRODUCTION-GANTT-TREE closed; deploy НЕ
**Что:** `Order.estimateStartOffsets` + `PATCH …/estimate-start`; child body-drag → offset; overlap OK; summary min/max; summary drag = plannedDate.
**Gates:** FE tsc+jest **39 PASS**; BE tsc+order.service **28 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-316.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-316-gantt-bar-start-offset.lock`
**Dep:** 314 @ e5089da6; 315 @ 1f4ed444

## [2026-08-15] — TZ-PRODUCTION-315 DONE — Карточка bottom sheet
**Исполнитель:** gemini-executor-gantt-tree
**Статус:** DONE; deploy НЕ
**Что:** Карточка = bottom sheet под Гантом (min(42vh,22rem)); right card flyout убран; inspector horizontal-friendly; chrome «Карточка» toggle сохранён.
**Gates:** FE tsc PASS; FE jest production-cockpit **7 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-315.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-315-card-bottom-sheet.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE → next 316
**Dep:** 314 @ e5089da631e01ee78569252c7f7a11b4b0a6264e

## [2026-08-15] — TZ-PRODUCTION-314 DONE — Gantt order summary + expand
**Исполнитель:** gemini-executor-gantt-tree
**Статус:** DONE; child plannedDate drag off until 316; deploy НЕ
**Что:** default = 1 сводная полоса/заказ (min…max); ▸ expand → виды работ; summary body-drag = plannedDate; child resize = days; `ctx.expandedOrderIds`.
**Gates:** FE tsc PASS; FE jest gantt-bar|gantt-bars|cockpit **36 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-314.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-314.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-314-gantt-order-expand.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE → next 315
**known_limitation:** children still sequential until 316; card still right until 315.

## [2026-08-15] — TZ-PRODUCTION-312 DONE — Gantt body-drag → plannedDate
**Исполнитель:** gemini-executor-312
**Статус:** DONE; left-edge OUT; deploy НЕ
**Что:** body-drag полосы (не resize handle) → snap ±Nд → PATCH plannedDate (oldAnchor+delta); цепочка едет, days без изменений; Escape cancel; readOnly/shipped+ без drag; 311 resize сохранён.
**Gates:** FE tsc PASS; FE jest production-cockpit|gantt-bar 31 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-312.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-312-gantt-body-drag-planned-date.lock`
**known_limitation:** нет независимого lag одной средней полосы.
**Dep:** TZ-PRODUCTION-313 @ 4cd045c66c88b7a37208a4dfcf8ffd71864d5e73; 311 @ 85329247650db938cb80039b458c3e05cb363a7a

## [2026-08-15] — TZ-PRODUCTION-313 DONE — Карточка flyout compact (no gutter)
**Исполнитель:** gemini-executor-313
**Статус:** DONE; deploy НЕ
**Что:** flyout-card `min(22rem)` + order-inspector `w-full` — убран пустой gutter (было 28rem vs 20/22rem).
**Gates:** FE tsc PASS; FE jest production-cockpit|gantt-bar 27 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-313.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-313.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-313-card-flyout-compact.lock`
**Successor:** TZ-PRODUCTION-312 (body-drag plannedDate).

## [2026-08-15] — TZ-PRODUCTION-311 DONE — Gantt right-edge estimate resize
**Исполнитель:** cursor-executor-311
**Статус:** DONE; left/move OUT; WorkType catalog from handles НЕТ; deploy НЕ
**Что:** правый handle на editable bars → snap `GANTT_PX_PER_DAY` + preview «Nд» → `PATCH estimate-days` (order override) → reload bars (cascade); Escape cancel; noTerm/readOnly без ручек.
**Gates:** FE tsc PASS; FE jest gantt-bars+cockpit 17 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-311.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-311-gantt-estimate-resize.lock`
**known_limitation:** left-edge / body drag / plannedDate-from-bar = successor; no undo stack.
**Dep:** TZ-PRODUCTION-309 @ 9b24c0f1498c12daa996500ccfd760cfca1a0bd6

## [2026-08-15] — TZ-PRODUCTION-309 DONE — order-level estimate days + production:write
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; drag UI НЕ (311); deploy НЕ
**Что:** `estimateDayOverrides` + PATCH `/orders/:id/estimate-days`; WorkType mutate → `production:write`; FE override в Gantt + inspector; catalog confirm «для всех» сохранён.
**Gates:** BE tsc PASS; BE jest order 25 PASS; FE tsc PASS; FE jest gantt-bar|production-read 17 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-309.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-309-safe-estimate-order-days.lock`
**known_limitation:** existing manager roles in DB may need re-seed for `production:write`; N+1 estimate facade; drag = 311.
**Successor:** TZ-PRODUCTION-311 (right-edge resize).

## [2026-08-15] — TZ-UX-324 DONE — chrome history ↔ page-tools gap
**Исполнитель:** cursor-composer-executor
**Статус:** DONE; spacer ~1 btn + muted page-tool; deploy НЕ
**Что:** `chrome-rail-tools-gap` только при tools; `app-chrome-page-tool` paper-2/rule vs raised history; page-chrome docs; Jest gap AC.
**Gates:** FE tsc PASS; Jest app-layout 7/7 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-324.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-324.md`
**Lock:** `.mimocode/locks/TZ-UX-324-chrome-history-page-tools-gap.lock`
**known_limitation:** flyout registration / PiChromeToolsService API не трогали.


**Исполнитель:** agent-3e757640b7
**Статус:** DONE; people UI via Devices; users redirect; register 410; login KEEP; deploy НЕТ
**Итог:** Nav/TOC → Устройства|Роли; `/admin`+`/admin/users` → devices; `POST /api/auth/register` Gone; BE `/api/admin/users` KEEP.
**Gates:** FE tsc PASS; FE Jest admin|layout|devices|auth 147 PASS; BE tsc PASS; BE Jest auth 28 PASS; git diff --check (TZ files) PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-308.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-308.md`
**Lock:** `.mimocode/locks/TZ-AUTH-308-device-only-admin-ux.lock`
**known_limitation:** reset-password UI via users route redirected; break-glass login/script.
**Successor:** TZ-AUTH-307 (park) only after PO; deploy only on explicit PO.

## [2026-08-15] — TZ-UX-325 DONE — chrome page-tools migration audit
**Исполнитель:** Buffy continuous executor (docs)
**Статус:** DONE; docs-only; deploy НЕ
**Что:** Inventory candidates → chrome-rail; P0 products/modules/materials (`filters-rail` w-12); WAVE 326…330 backlog; page-chrome + PAGE-TZ-INDEX linked; KP/Builder marked already-studio.
**Gates:** no FE/BE product diff; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-325.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-325.md`
**Lock:** `.mimocode/locks/TZ-UX-325-chrome-page-tools-migration-audit.lock`
**Audit:** `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`
**Wave:** `tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md`
**Successor:** executable TZ-UX-326+ when PO opens wave.

## [2026-08-15] — TZ-AUTH-305 DONE — подъезд снят (auth_request)
**Исполнитель:** cursor-architect (ops cutover)
**Статус:** DONE; Basic Auth removed from UI; device cookie gate live; wipe нет
**Что:** Stage A enroll open → owner-device smoke → Stage B `auth_request` + убран Basic; rollback `kppdf-proxy.bak-auth-basic`.
**Gates:** nginx -t PASS; `/` anon 401 без Basic; cookie 200; `/enroll/` 200; `/api/health` 200; OPTIONS 204; pairing health 200.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-305.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-305.md`
**Evidence:** `docs/ops/server-harden-evidence.md` § AUTH-305
**Successor:** TZ-AUTH-307 (htpasswd + enrollBaseUrl); PO открывает owner enroll в своём браузере один раз.

## [2026-08-15] — TZ-UX-323 DONE — Gantt tools in app chrome-rail
**Исполнитель:** Buffy continuous executor
**Статус:** DONE; /production tools→chrome; local 48px rails removed; deploy НЕ
**Что:** setTools production-cockpit; studio-body full width; flyouts left:0/right:0; SoT FROZEN updated; untracked sync (no effect loop).
**Gates:** FE tsc PASS; Jest production+layout+chrome 14/14 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-323.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-323.md`
**Lock:** `.mimocode/locks/TZ-UX-323-gantt-tools-chrome-rail.lock`
**Wave:** `WAVE-UX-CHROME-GANTT-TOOLS` score 100
**known_limitation:** chrome tools видны только ≥1680 (как ←→); без локальных 48px fallback.
**Successor:** none for this wave; deploy only on explicit PO.

## [2026-08-15] — TZ-UX-322 DONE — Chrome page-tools API
**Исполнитель:** Buffy continuous executor
**Статус:** DONE; app shell page-tools projection; deploy НЕ
**Что:** `PiChromeToolsService` setTools/clear; AppLayout left/right tools under ←/→ (`chrome-tool-{id}`); pages without setTools unchanged; production → TZ-UX-323.
**Gates:** FE tsc PASS; Jest app-layout+chrome 8/8 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-322.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-322.md`
**Lock:** `.mimocode/locks/TZ-UX-322-chrome-page-tools-api.lock`
**Successor:** `TZ-UX-323-gantt-tools-into-chrome-rail.md` (same wave).

## [2026-08-15] — TZ-UX-PHOTO-301 DONE — visible photo upload progress
**Исполнитель:** Buffy (impl + closeout)
**Статус:** DONE; FE photo upload progress; deploy НЕ
**Что:** Progress bar + RU status on dropzone / product / material / QuickCreate; `uploadWithProgress` (reportProgress); legacy `upload()` intact; indeterminate when % unknown.
**Gates:** FE tsc PASS; Jest dropzone+forms 88/88 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-PHOTO-301.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-PHOTO-301.md`
**Lock:** `.mimocode/locks/TZ-UX-PHOTO-301-upload-progress.lock`
**known_limitation:** точный % зависит от браузера/прокси; иначе indeterminate bar.
**Successor:** none (UX feedback only).

## [2026-08-15] — TZ-PRODUCTION-STUDIO-A DONE — Gantt studio chrome contract
**Исполнитель:** Cursor (docs closeout)
**Статус:** DONE; docs-only; deploy НЕ; product Wave B НЕ стартовал
**Что:** SoT `production-gantt-studio-spec.md`; page/readiness/IA Цех; park 308–310 BLOCKED; Заказы≠Фильтры split; score 15/99.
**Gates:** git diff --check PASS; frontend/backend product diff отсутствует.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-STUDIO-A.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-STUDIO-A-spec.lock`
**Successor:** `PROMPT-PRODUCTION-STUDIO-CONTINUOUS` → TZ-B shell (явная выдача PO).

## [2026-08-15] — TZ-ORDERS-HUB-304 DONE — readiness / warehouse / shipping stub
**Исполнитель:** Buffy (impl + closeout)
**Статус:** DONE; frontend orders expand readiness/warehouse/shipping; deploy НЕ
**Что:** Expand «Готовность» X/Y + lines (0 HTTP); `pi-reservations.service` read-only by Order.number; expand «Склад» lazy reservations; expand «Отгрузка» stub → `/shipping`; no GET /shipments.
**Gates:** FE tsc PASS; Jest orders.page|pi-reservations 19/19 PASS; quality 98; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-304.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-304.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.lock`
**Implementation SHA:** `cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1`
**Closeout SHA:** `d08f61f4f2126228d8ae6384b48e052c78cfc200`
**Successor:** orders-hub wave complete; AUTH-305 prep only.

## [2026-08-15] — TZ-UX-321 DONE — universal left chrome rail
**Исполнитель:** Buffy (impl + closeout)
**Статус:** DONE; app shell left chrome rail; deploy НЕ
**Что:** `app-chrome-rail-left` 64px under header; ←→ stacked inside rail; ≥1680 show; UX-320 interim floating gutters superseded; filter → UX-322.
**Gates:** app-layout Jest 5/5 PASS; ng build PASS; browser smoke 1920 selfScore 98; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-321.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-321.md`
**Lock:** `.mimocode/locks/TZ-UX-321-universal-left-chrome-rail.lock`
**Implementation SHA:** `21f32f11317d79d25e05b651f320579e407d3bf3`
**Merge SHA:** `85dbcc57cb2174fa750c27b425e6319baba8b30a`
**Closeout SHA:** `099de456d9127c91acabb313e3937d3f57fbc4d7`
**Successor:** TZ-UX-322 page-tools projection into rail.

## [2026-08-15] — TZ-ORDERS-HUB-303 DONE — supply / production / docs expand
**Исполнитель:** Buffy (impl + closeout)
**Статус:** DONE; frontend orders expand + supply/production deep-links; deploy НЕ
**Что:** Lazy supply counters в expand; блоки Производство/Документы; `/supply?orderId=` chip; `/production?orderId=` selectOrder + unknown hint.
**Gates:** FE tsc PASS; Jest orders|supply|production-cockpit 17/17 PASS; quality 98.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-303.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-303-supply-production-docs.lock`
**Implementation SHA:** `9eed2860ddadbc4b1daf8d8176dd7345784f3faf`
**Docs SHA:** `00603a36d5650ff3800b9c8f63b31d1a19f744ac`
**Successor:** TZ-ORDERS-HUB-304 readiness/warehouse/shipping.

## [2026-08-15] — TZ-CATALOG-372 DONE — modules list vitrine parity
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend /modules vitrine; deploy НЕ
**Что:** Photo column + name link; toolbar Состав/Обновить/list↔grid; filters-rail overlay; PiShowcaseCard md grid; `pi-modules-view-mode`; composition client filter; ProductModule photoIds types.
**Gates:** FE tsc PASS; modules.page Jest 17/17; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-372.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-372.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-372-modules-list-vitrine-parity.lock`
**Implementation SHA:** `3b460f4517cfae01b40722c9b4229ba7717e6552`
**Closeout SHA:** `a03500d7d4199e41972e7d3063b06b17096d0368`
**Known limit:** server envelope `/modules` — successor.

## [2026-08-15] — TZ-ORDERS-HUB-302 DONE — orders expand columns + Deal/Composition
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend orders list; deploy НЕ
**Что:** Колонки без total; X/Y readiness; read-only expand Сделка/Состав (UX-319 chrome); /proposals route fix. Cherry-pick `9d1a0aac` → `71446d6b` onto origin/main; app-layout from `657b0182` omitted (UX-320 LANDED).
**Gates:** FE tsc PASS; orders.page Jest 11/11 PASS; Cursor functional PASS 98/100.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-302.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-302-orders-expand-columns.lock`
**Implementation SHA:** `71446d6bfb37434913450449678ce4b78e26be37`
**Closeout SHA:** `a1da7a2bcb2092983d831d143b2bd54101f6c458`
**Successor:** TZ-ORDERS-HUB-303 unblocked → READY.

> **APPEND-ONLY HISTORY — НЕ ЧИТАТЬ ПРИ СТАРТЕ.**
> Текущая работа: `docs/agent-checklists/_NOW.md`.

## [2026-08-15] — TZ-CATALOG-373 DONE — materials list vitrine parity
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend /materials; deploy НЕ
**Что:** list↔grid toggle, filters-rail (canon products), `PiShowcaseCard` grid, `pi-materials-view-mode` persistence; materials.page-373.spec (12 tests).
**Gates:** FE tsc (tsconfig.app.json) PASS; materials.page Jest 3 suites / 18 tests PASS; Cursor PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-373.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-373.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-373-materials-list-vitrine-parity.lock`
**Implementation SHA:** `528e3cf9fb21eb283b076893e627097a3736ffea`
**Closeout SHA:** `cafd3acf`
**Known limit:** rail sort N/A (backend no sortBy).

## [2026-08-15] — TZ-UX-320 DONE / LANDED — ←→ из края окна в поля у колонки контента
**Исполнитель:** Buffy (impl) + Cursor land (cherry-pick onto main)
**Статус:** DONE / LANDED on main; frontend shell CSS; deploy НЕ
**Что:** Глобальные ← → переставлены с края окна (`left/right: 14px`) в вертикальные поля слева/справа от колонки контента, на линию бокового отступа шапки (`left/right: 64px` — padding `pi-edge-bleed` ≥1024px). `AppHistoryStore`, click/disabled/aria/data-test и порог ≥1680px не менялись.
**Gates:** FE tsc PASS; app-layout Jest 12/12 PASS; eslint changed PASS; architecture:check PASS; diff-check PASS; browser smoke ≥1680 light/dark 16/16 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-320.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-320.md`
**Lock:** `.mimocode/locks/TZ-UX-320-nav-gutter-align-content-column.lock`
**Implementation SHA:** `3d5911d143e4428e4a1bcf656216fcfa011bd8b3` (cherry-pick of `dc424c45`)
**Land note:** только UX-320 paths; без SALES-378/backend постороннего.

## [2026-08-15] — TZ-SALES-378 DONE — multipage bg CSS + full next-page table
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; backend document build; deploy НЕ
**Что:** Hoist `buildDocumentContentStyles` into multipage outer head (`.doc-bg` preserved); `.doc-page { position: relative }`; auto next-page capacity from full A4 sheet; `remapContinuationTableBlock` y0/h1 on page 2+.
**Gates:** BE tsc PASS; document-template 70 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-378.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-378.md`
**Lock:** `.mimocode/locks/TZ-SALES-378-multipage-bg-full-next.lock`
**Implementation SHA:** `b20944637d62bafe614bc808505137334e6c6e49`
**Closeout SHA:** `ed57baff`
**Known limit:** strip decorations / continuationMode = TZ-SALES-377 PARK backlog.

## [2026-08-15] — TZ-SALES-376 DONE — geometry-aware KP page split
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; full-stack document split + Create КП copy; deploy НЕ
**Что:** `estimateAutoRowCapacity` по `layout.height` блока таблицы; `splitPreviewLines` capacity + `pageBreakBefore`; clip overflow на build CSS; last-page totals = full KP lines; RU hint «0 — автоматически по рамке…».
**Gates:** BE tsc PASS; document-template 67 tests; FE tsc PASS; proposal-create 61 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-376.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-376.md`
**Lock:** `.mimocode/locks/TZ-SALES-376-geometry-aware-page-split.lock`
**Implementation SHA:** `7a619e4c95ceebc64aef45a42e47208437a46516`
**Closeout SHA:** `764aded5`
**Known limit:** auto capacity — estimate not pixel-perfect; continuation/per-page templates = TZ-SALES-377 PARK backlog.

## [2026-08-15] — TZ-FRONTEND-303 DONE — Jest baseline debt
**Исполнитель:** Buffy / isolated `feature/TZ-FRONTEND-303`
**Статус:** DONE; frontend test-only; deploy НЕ
**Что:** Материалы-тесты получили локальный fallback mock `PiDictionaryLabelsService`, а `FormProfilesService` assertions выровнены с текущим `LockedRequired` (product: kind/unit/sku; module: name/article). Product/service implementation не изменялись.
**Gates:** focused 4 suites / 17 tests PASS; full frontend Jest 154/154 suites, 1444/1444 tests PASS; frontend tsc, changed ESLint, architecture:check (937 files; baseline 6), diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-FRONTEND-303.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-303-jest-baseline-debt.lock`
**Implementation SHA:** `8b60d1f0998b70caa28a1bbe9760c3eec8a8a878`
**Known limit:** Angular/JSDOM console diagnostics remain non-failing in legacy suites; no new failing tests.

## [2026-08-15] — TZ-SALES-375 DONE — remove products rail draft-lines list
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend UI; deploy НЕ
**Что:** Create КП products flyout: removed «Позиции КП» / `kp-rail-draft-lines` block; cards under filters; kept `draftLines` for «В КП»/«Ещё +N»; dead `quantityChange`/`onQuantityChange` removed; qty via table editor.
**Gates:** FE tsc PASS; proposal-product-rail 11 tests; proposal-create 61 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-375.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-375.md`
**Lock:** `.mimocode/locks/TZ-SALES-375-no-products-rail-draft-lines.lock`
**Implementation SHA:** `d75e1f08c10e76077e94beb27ea5b919e5bc9d93`
**Closeout SHA:** `f24400d0`
**Known limit:** custom lines without catalog card visible only in table editor (by design).

## [2026-08-15] — TZ-SALES-374 DONE — KP table editor chrome + dual fonts + drawer-actions
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend + thin BE sheetLayout; deploy НЕ
**Что:** Create КП table editor: Lucide icon chrome (Рамка/Шапка); `tableHeaderFontSize` + `tableFontSize`; row gutter chevron-only; drawer «Действия» с RU labels; expand ink frame + sibling dim; preset→шаблон copy.
**Gates:** FE/BE tsc PASS; proposal-create 61 tests; table-template.service 7 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-374.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-374.md`
**Lock:** `.mimocode/locks/TZ-SALES-374-kp-table-editor-chrome.lock`
**Implementation SHA:** `9b50bc9ec044216817fd0928c8fd3d29cb3f52e6`
**Closeout SHA:** `1b813260c4ba01f6f60f6e438770b20fb21874a9`
**Known limit:** drawer density/accent seg-buttons text-only; no per-column font.

## [2026-08-15] — TZ-UX-319 DONE — products expanded row ink frame
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend UI chrome; deploy НЕ
**Что:** `pi-table`: класс `pi-table-row--open` + ink-рамка (~1.5px) вокруг пары data-row + `expanded-row`; соседние data-rows приглушены (`opacity: 0.5`) пока одна раскрыта. Expand API / composition не трогались.
**Gates:** frontend tsc PASS; pi-table.component.spec 25; products.page.spec 21; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-319.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-319.md`
**Lock:** `.mimocode/locks/TZ-UX-319-products-expanded-row-frame.lock`
**Implementation SHA:** `55dac38afb9e533d1ad28793a1edbae3181482cc`
**Closeout SHA:** `bf30c9acc0898ab645004ec48448b26d0bd13269`
**Known limit:** рамка = две границы `<tr>` (не wrapper div); другие `expandedRow` страницы получают тот же chrome.

## [2026-08-15] — TZ-FRONTEND-301/302 DONE — Angular component integrity
**Исполнитель:** Lane A/B executors + Cursor closeout
**Статус:** DONE; ANGULAR INTEGRITY READY yes (known Jest debt); deploy НЕ
**Что:** Stage 1 dual-lane audit + Stage 2 batches A1–A6 and B-TOOLING/ENTITY/PHOTO. P0 KP autosave/recipient/inspector fixed; admin/order/import-todos raw HttpClient removed; photo dropzone presentational; ESLint harness repaired. Merged with main including SALES-373 tableFontSize coexistence.
**Gates:** FE tsc/lint/architecture/diff PASS; full Jest 150/154 (13 baseline materials/form-profiles debt documented, not suppressed).
**Archive:** 	asks/_archive/2026-08/TZ-FRONTEND-301.done.md, 	asks/_archive/2026-08/TZ-FRONTEND-302.done.md
**Canonical:** docs/audits/2026-08-15-angular-component-integrity.md
**Locks:** .mimocode/locks/TZ-FRONTEND-301-angular-component-integrity-audit.lock, .mimocode/locks/TZ-FRONTEND-302-angular-integrity-remediation-wave.lock
**Known limit:** composition/group-ACL successors + Jest debt = separate TZ; deploy/SSH не выполнялись.

## [2026-08-15] — TZ-SALES-373 DONE — KP table font size on A4 sheet
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend + backend sheetLayout; deploy НЕ
**Что:** `sheetLayout.tableFontSize` (default 12, clamp 8–20) в Create КП: «Шрифт таблицы» в Вид листа + «Шрифт» в тулбаре редактора; live table + A4 preview HTML `font-size`; старые КП без поля → 12.
**Gates:** FE/BE tsc PASS; proposal-create 56 tests; table-template.service 6 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-373.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-373.md`
**Lock:** `.mimocode/locks/TZ-SALES-373-kp-table-font-size.lock`
**Implementation SHA:** `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
**Closeout SHA:** `8d4b5616bc435d6e302491d09c99a809d6749a1f`
**Known limit:** no per-column/per-cell font; long descriptions still multi-page.

## [2026-08-15] — TZ-DOC-TABLES-310 DONE — remove help + separate toolbar buttons
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend UI; deploy НЕ
**Что:** Диалог таблиц `/doc-constructor/tables`: убран on-page `ttd-column-help`; «+ Добавить столбец» и «Колонки как в КП» разведены через toolbar-sep; taller+RU из 309 сохранены; fontSize не тронут.
**Gates:** frontend tsc PASS; table-template-dialog.component.spec 46/46; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-310.done.md`
**Checklist:** `docs/agent-checklists/TZ-DOC-TABLES-310.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-310-remove-help-separate-buttons.lock`
**Implementation SHA:** `44435acd272d684f2437e75ce3801021e25df187`
**Docs SHA:** `e67a831703d2f721f8858a59afb934cb7829baae`
**Known limit:** fontSize колонок — только после явного PO «да».

## [2026-08-15] — TZ-DOC-TABLES-309 DONE — tables dialog copy + taller fields
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend UI; deploy НЕ
**Что:** Диалог таблиц `/doc-constructor/tables`: кнопка «Колонки как в КП» + confirm стандартных колонок КП без жаргона «пресет/канон»; короткая RU-справка у add-column; выше `.ttd-cell-input` / шапки колонок. `data-test` ключи сохранены.
**Gates:** frontend tsc PASS; table-template-dialog.component.spec 45/45; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-309.done.md`
**Checklist:** `docs/agent-checklists/TZ-DOC-TABLES-309.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-309-tables-dialog-copy-and-taller-fields.lock`
**Implementation SHA:** `2cc0383d8afd824cff447b92ad7d06c26ceda2b0`
**Docs SHA:** `53374e783fa29746756b975c8106f72812631f23`
**Known limit:** fontSize колонок — только TZ-DOC-TABLES-310 после явного PO «да».

## [2026-08-15] — TZ-UX-318 DONE — KP columns checkbox menu stay-open
**Исполнитель:** Buffy (closeout)
**Статус:** DONE; frontend UX; deploy НЕ
**Что:** Меню «Колонки» на `/proposals/create` остаётся открытым при нескольких чекбоксах подряд (убраны mouseleave + close-on-toggle). Закрытие только outside-click / Escape / toggle триггера / «Ещё» / scroll table wrap. RU-канон stay-open для checkbox multi-panels в `ui-overflow-select.md`.
**Gates:** frontend tsc PASS; Cursor Verdict PASS (browser smoke ≥2 toggles stay-open → outside closes).
**Archive:** `tasks/_archive/2026-08/TZ-UX-318.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-318.md`
**Lock:** `.mimocode/locks/TZ-UX-318-kp-columns-checkbox-menu-stay-open.lock`
**Implementation SHA:** `9bd27f11a644384e48d5c26488d70573cdfda7fc`
**Docs SHA:** `2340979af9d5fa792d179f30153a8ff1cbb19278`
**Confirm SHA:** `d4426510e26525315b321e982ed6e9cf3b686b6d`
**Known limit:** ad-hoc dropdown (no CDK Overlay); More menu mouseleave unchanged.

## [2026-08-14] — TZ-SALES-372 DONE — snapshot edit и решение каталога
**Исполнитель:** Buffy / predeploy executor
**Статус:** DONE; frontend + backend contract; deploy НЕ
**Что:** Identity-поля source-linked Product редактируются только в snapshot КП; metadata `catalogDirtyFields/catalogDecision/catalogSourceVersion` переживает save/hydrate/F5. При выходе из таблицы открывается multi-row review с тремя per-row решениями; КП-only безопасен, source update ограничен dirty identity fields + `expectedVersion`, copy-after-edit делает duplicate/rebind, явная копия строки вставляется ниже, а обычный duplicate строки сохраняет тот же Product. Коммерческие qty/price/discount/optional/row presentation не sync в Product.
**Gates:** FE tsc PASS; proposal-create Jest 45/45; BE tsc PASS; quotation.service 36/36; Product duplicate/expectedVersion contract covered by CATALOG-371; changed ESLint PASS; architecture:check PASS; git diff --check PASS; local shell smoke HTTP 200; controlled snapshot/review/copy evidence PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-372.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-372.md`
**Lock:** `.mimocode/locks/TZ-SALES-372-kp-line-snapshot-edit-and-catalog-resolution.lock`
**Implementation SHA:** `cbf2e2fe14dc674e688623b332299e85a1c66146`
**Closeout SHA:** `f182460503fc5f88e63af5ec7fe52e1afe8b8e07`
**Known limit:** module/material source-sync and inline media upload вне v1; KP3 photo population remains `TZD-47 → TZ-MIG-303`; production/deploy/SSH/nginx/migration/wipe не выполнялись.

## [2026-08-14] — TZ-SALES-371 DONE — реальное фото изделия в КП
**Исполнитель:** Buffy / predeploy executor
**Статус:** DONE; frontend + backend output; deploy НЕ
**Что:** Реальный populated `Product.photoIds` thumb/medium теперь переносится в line snapshot вместе с description; видимая фото-колонка имеет единые FE/BE aliases и request-scoped layout controls; saved quotation rebuild сохраняет `photoUrl` и `sheetLayout`; PDF применяет allowlisted own asset resolver, base href и bounded image wait; отсутствующее/запрещённое фото даёт нейтральное `Нет фото`. Inline catalog identity edits остаются snapshot metadata для SALES-372 и не мутируют Product.
**Gates:** FE tsc PASS; proposal-create Jest 45/45; BE tsc PASS; quotation/table-template/quotation-output 44/44; document-template assets 5/5; changed ESLint без ошибок; architecture:check PASS; git diff --check PASS; controlled real-photo/no-photo fixture path PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-371.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-371.md`
**Lock:** `.mimocode/locks/TZ-SALES-371-kp-real-product-photo-output.lock`
**Implementation SHA:** `cbf2e2fe14dc674e688623b332299e85a1c66146`
**Known limit:** KP3 фото остаются зависимостью `TZD-47 → TZ-MIG-303`; deploy, SSH, nginx, migration и wipe не выполнялись.

## [2026-08-13] — TZ-SALES-370 DONE — настройки вида строки КП
**Исполнитель:** Buffy (closeout) / isolated `feature/TZ-SALES-370`
**Статус:** DONE; frontend + backend; deploy НЕ
**Что:** Row-level drawer с типизированным `rowPresentation` для density, accent, separator, page-break, description visibility и photo fit. Настройки сохраняются в строке КП, применяются в live table/HTML/PDF path и сохраняют коммерческие поля видимыми; backward defaults и enum validation защищают старые КП.
**Gates:** frontend tsc PASS; proposal-create Jest 42/42; backend tsc PASS; quotation 35/35, table-template 4/4, quotation-output 3/3; architecture:check PASS; git diff --check PASS до и после интеграции origin/main.
**Review:** Cursor visual PASS 2026-08-13 для light/dark/narrow; live A4 template fixture пуст, provisional evidence принята и передана TZ-SALES-371.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-370.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-370.md`
**Lock:** `.mimocode/locks/TZ-SALES-370-kp-row-layout-drawer.lock`
**Implementation SHA:** `c08f13735acf956133a16d886e70857e31a1fd91`
**Closeout SHA:** `d1e97c1c` on `origin/feature/TZ-SALES-370`
**Main SHA:** `f49a3d0037174b9e8dc39d8df7c904172912c69f`
**Known limit:** реальный A4/photo parity закрывается в TZ-SALES-371; data dependency TZD-47 → MIG-303.

## [2026-08-13] — TZ-CATALOG-371 DONE — безопасная копия изделия
**Исполнитель:** Buffy / predeploy executor
**Статус:** DONE; backend + typed frontend client; deploy НЕ
**Что:** `POST /api/products/:id/duplicate` с organization-scoped source filter, whitelist overrides `name/description/unit/sku`, copiedFromProductId, независимым composition/EAV copy, shared photo/module refs и defaults `stockQty=0`, `status=draft`, `isSystem=false`. Добавлен bounded unique-SKU retry и русский 409 для explicit collision. Product update получил optional `expectedVersion` → 409 без stale overwrite.
**Gates:** backend tsc PASS; ProductService 16/16; frontend tsc PASS; ProductsService 2/2; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-371.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-371.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-371-product-duplicate-api.lock`
**Implementation SHA:** `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
**Known limit:** UI copy/rebind action belongs to TZ-SALES-372; photo binaries intentionally remain shared refs; TZ-SALES-371 validates real photo output.


## [2026-08-13] — TZ-AUTH-304 DONE — вход по приглашению (UI)
**Исполнитель:** agent-3e757640b7 (coding agent) + Buffy (closeout/sessionKind-контракт)
**Статус:** DONE; frontend; deploy НЕ
**Что:** Публичная активация `/enroll/:token` (одно поле «Как назвать этот компьютер?», GET не consume, POST только по кнопке; после успеха `applyDeviceAccess` — только короткий access JWT без refresh — + `ensureUser()` + `navigateByUrl('/', { replaceUrl: true })`). Device-сессия в SPA: `DEVICE_KEY` (localStorage), `renewDevice` (single-flight cookie-renew), `bootstrapDevice` (status→session→me), `deviceDenied` («Доступ этого компьютера отключён. Обратитесь к администратору.») на `/login`; interceptor 401 → cookie-renew + один retry (IS_RETRY), без циклов; password-поток не затронут. Админ-страница `/admin/devices`: чип «Устройства» (sibling Пользователи|Роли), таблица (имя/состояние «Работает|Отключён»/роль/срок/последний вход), «Создать ссылку» (роль обязательна + срок 1/3/7 + доступ 30/90/365 → URL + Копировать), owner-only «Добавить мой компьютер» (step-up пароль, 15m, без роли), «Изменить роль»/«Изменить срок»/«Отключить» (с подтверждением); `PiDeviceEnrollmentService` — typed клиент.
**Gates:** FE tsc PASS; auth.service 24/24; auth.interceptor 13/13 (device-renew + recursion-guard); enroll 6/6; devices-admin 6/6; login.page 4/4; permission-labels PASS; eslint/diff-check PASS. Backend-контракт: enroll/session → `sessionKind: 'device'` (184f965d, e2e PASS).
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-304.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-304.md`
**Lock:** `.mimocode/locks/TZ-AUTH-304-device-enrollment-ui.lock`
**Known limit:** nginx Basic до TZ-AUTH-305; `__Host-` cookie требует HTTPS; смена роли устройства — при следующем renew (≤5m). Pre-existing (не регрессия): FormProfilesService › isLocked падает на main (TZ-DICT-315).
**NEXT:** READY FOR DEPLOY — TZ-AUTH-305 (nginx auth_request + rollback) только после явной команды PO `деплой`; до включения auth_request зарегистрировать owner-браузер (C1). Волна 3/5, не DONE; TZ-AUTH-307 только после PASS cutover.

## [2026-08-13] — TZ-AUTH-303 DONE — вход по приглашению (backend)
**Исполнитель:** agent-3e757640b7 (coding agent)
**Статус:** DONE; backend-only; deploy НЕ
**Что:** Новый модуль `backend/src/modules/device-enrollment/` — `DeviceInvite` (regular с preselected активной role / owner-device с immutable ownerUserId, SHA-256 hash + display prefix, TTL 1/3/7d default 3d) и `BrowserDeviceGrant` (browser-only credential, SHA-256 hash, `deviceName` не-unique, 365d default). Атомарное одноразовое погашение в Mongo-транзакции: regular → `User(accountType=device)` с random невыдаваемым паролем и ровно выбранной ролью; owner-device → grant на существующего единственного owner (15m, password step-up). Cookie `__Host-kppdf-device` (Secure+HttpOnly+SameSite=Lax, Path=/, без Domain); cookie-only `GET /device/session` выдаёт access JWT ≤5m без refresh; `GET /device/status`, `GET /device/auth-check` (nginx boolean gate без персональных данных). Admin `user:admin`: invites CRUD + devices list/PATCH/revoke; owner-only `POST /admin/devices/owner-invite` + `GET /admin/devices/owner`. Инварианты: role только из invite; admin-power (invite admin / PATCH в/из admin) — owner-only (403, без мутации User); reset-password для device → 409; audit без plaintext. `accountType` добавлен в `User`; Desktop/nginx не тронуты.
**Gates:** backend tsc PASS; device-enrollment 20/20; auth.service 15/15; desktop-pairing-key 7/7; enrollment e2e 8/8 + auth 6/6 + owner-invariant 8/8; eslint/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-303.md`
**Lock:** `.mimocode/locks/TZ-AUTH-303-device-enrollment-backend.lock`
**Known limit:** до 304 нет UI `/enroll` + `/admin/devices`; nginx Basic до 305; `__Host-` cookie требует HTTPS (dev через proxy).
**NEXT:** TZ-AUTH-304 (UI `/enroll/:token` + `/admin/devices`). Deploy НЕ.

## [2026-08-13] — TZ-AUTH-306 DONE — единственный скрытый владелец (hidden owner invariant)
**Исполнитель:** agent-3e757640b7 (coding agent)
**Статус:** DONE; backend + frontend; deploy НЕ
**Что:** `user.schema.ts` — `isOwner` (default false) + partial unique index `partialFilterExpression { isOwner:true }` (БД-gate «не более одного true»). `admin.seed.ts` — idempotent fail-closed `backfillOwner()`: owner = точный активный bootstrap admin по `ADMIN_USERNAME`; 0/неактивный/несовпадающий/>1 owner → startup error, никогда не создаёт второго owner, без wipe/reseed. `jwt.strategy.ts` гидрирует `isOwner` из БД (не из JWT). Owner bypass в Roles/PermissionsGuard без owner-only permission key. `owner-only.guard.ts` (403 OWNER_ONLY) на roles-admin + permissions-admin; `owner-target.guard.ts` на users-admin mutators (non-owner → owner 404; owner self delete/deactivate/demote 403 OWNER_SELF_PROTECTED; grant/revoke admin power 403 OWNER_ONLY). users-admin list/count/search/getById скрывают owner для non-owner; create role=admin 403. FE: `isOwner` computed, `ownerOnlyRouteGuard` на /admin/roles, скрытие self-destructive действий owner-строки.
**Gates:** backend tsc PASS; frontend tsc PASS; backend tests 99/99 (owner-target/owner-only/roles.guard/permissions.guard/auth.service/users-admin/roles-admin/last-admin); e2e owner-invariant 8/8 + auth 6/6; frontend jest 27/27; eslint PASS (pre-existing warnings вне scope); architecture:check 1 pre-existing; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-306.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-306.md`
**Lock:** `.mimocode/locks/TZ-AUTH-306-hidden-owner-invariant.lock`
**Known limit:** ordinary admin всё ещё может выдать `permissions: ['*']` (pre-existing wildcard break-glass RBAC-CONTRACT §4/§9.3) — вне scope 306.
**NEXT:** TZ-AUTH-303 (backend regular invite + owner-device self-link + BrowserDeviceGrant + 365d cookie + JWT ≤5m). Deploy НЕ.

## [2026-08-12] — TZD-46 DONE — Desktop ZIP semver в имени файла + publish canon
**Исполнитель:** freebuff/tzd-46 (agent-158a657202)
**Статус:** DONE; desktop publish + deploy scripts + FE URL + docs; deploy НЕ
**Что:** publish-installer.mjs: Semver SoT = `desktop/package.json` (assert == `tauri.conf.json`, FAIL при расхождении); публикует `kppdf-desktop-setup-v{semver}.exe/.zip` (внутри ZIP — versioned exe) + unversioned aliases `kppdf-desktop-setup.exe/.zip` (копия тех же байт); NSIS candidate `KPPDF Desktop_{semver}_x64-setup.exe` вместо хардкода `0.1.0` (legacy = fallback WARN); финальный лог — versioned URL. deploy.py `publish_desktop_installer` — зеркало схемы (semver из package.json на build-машине, versioned + alias в `frontend/browser/downloads/`, WARN про versioned zip). FE `DEFAULT_DESKTOP_DOWNLOAD_URL` остаётся alias (вариант A канона) + доккоммент про meta-инжект versioned; pairing показывает semver из compat. INSTALL.md/PAIRING.md — канон имён; deploy README + config.env.example уже в base (b91de8df).
**Gates:** desktop tsc PASS; version-compat tsx 10/10 PASS (tsx — канон TZD-40; `node --test` не резолвит extensionless ESM); publish dry без exe → FAIL c message (exit 1); publish functional (fake exe: 4 файла в обоих каталогах, arcname versioned) PASS; deploy.py publish functional (python tmp root, alias zip byte-identical) PASS; FE tsc PASS; jest pairing+desktop-download-url 14/14 PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZD-46.done.md`
**Checklist:** `docs/agent-checklists/TZD-46.md`
**Lock:** `.mimocode/locks/TZD-46-desktop-zip-versioned-filename.lock`
**Known limit:** live Synology обновится только на следующем warm deploy (tauri build + publish-installer на build-машине, VPN off + слово PO); локальный тест — фейковый exe (убрано).
**NEXT:** idle desktop/backend фон; «деплой» — только по слову PO. Не выдумывать TZ.

## [2026-08-12] — TZ-UX-317 DONE — системные ← → в полях app shell (WAVE-NAV-RETURN #2)
**Исполнитель:** freebuff/wave-nav-return (agent-158a657202)
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** Новый `AppHistoryStore` (site-wide SPA history): стек same-app URL из Router events, `popstate` двигает индекс, replaceUrl-тики не растят стек, `/login` не предыдущий URL, `Location.back()/forward()` — реальная браузерная история. В `app-layout` gutters-кнопки ← (`data-test="app-nav-back"`) / → (`app-nav-forward"`) — position:fixed в полях вне max-width колонки, видны ≥1680px (поле ≥76px, не наезжают на studio rails/palette/A4), disabled + aria-disabled без истории. page-chrome.md: запрет «глобальных ←→ нет» заменён каноном gutters + приоритет returnUrl vs history.
**Gates:** FE tsc PASS (0 errors); Jest app-layout 4/4 + app-history.store 6/6 + nav-order/catalog-return (общий прогон с picker+builder 57/57) PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-317.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-317.md`
**Lock:** `.mimocode/locks/TZ-UX-317-app-history-gutters.lock`
**Known limit:** live visual smoke gutters — вручную после деплоя; порог вхождения 1680px по геометрии полей.
**NEXT:** WAVE-NAV-RETURN closed — idle, готово предложить деплой; deploy НЕ.

## [2026-08-12] — TZ-UX-316 DONE — «Редактировать шаблон» → /builder/:id + returnUrl (WAVE-NAV-RETURN #1)
**Исполнитель:** freebuff/wave-nav-return (agent-158a657202)
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** Из Create «Редактировать шаблон» открывает живой конструктор `/doc-constructor/builder/:id` (не список `/templates?templateId=` — query там не читался) с `?returnUrl` = текущий Create path (вкл. query id черновика). Builder «←»: валидный same-origin `returnUrl` → туда (label «← К созданию КП»); иначе `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')` (label «← Шаблоны»). Валидация returnUrl: absolute same-origin path, без `//host` и схем.
**Gates:** FE tsc PASS (0 errors); Jest picker 2/2 + builder.page 29/29 = 31/31 PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-316.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-316.md`
**Lock:** `.mimocode/locks/TZ-UX-316-template-edit-return.lock`
**Known limit:** `proposal-create.page.ts` не тронут (TZ-SALES-368 WIP в canonical); gutter-канон — в 317.
**NEXT:** TZ-UX-317 (системные ←→ в gutters app shell); deploy НЕ.

## [2026-08-12] — TZ-SALES-368 DONE — Create КП: печать свободная; PDF/Архив отдельно
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** `requestOutput` разведён: Печать сразу зовёт `printCurrentPreview()` (без `canSaveDraft`/save/pendingOutput, пустое превью — короткий тост); PDF/Архив требуют сохранённый draft id (есть id → сразу; нет и можно → save затем; нельзя → свой тост «Для PDF/архива нужны шаблон, готовое превью и наша фирма»). Autosave write-path не тронут.
**Gates:** FE tsc PASS; proposal-create.page Jest 41/41 PASS (+4 теста); diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-368.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-368.md`
**Lock:** `.mimocode/locks/TZ-SALES-368-kp-output-gates.lock`

## [2026-08-12] — TZ-SALES-367 DONE — Create КП: savebar gone, output on rail
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** Удалена полоса над A4 (`kp-save-bar`: Сохранено/статус/версии/заказ/копировать/Скачать). A4 сразу под chips. Вывод — правый rail «Вывод» → Печать · PDF · Архив. Autosave без видимой полосы. Lifecycle — на Все КП.
**Gates:** FE tsc PASS; proposal-create.page Jest 37/37 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-367.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-367.md`
**Lock:** `.mimocode/locks/TZ-SALES-367-kp-create-no-savebar.lock`
**Known limit:** отдельной страницы просмотра готового КП нет (park).
**NEXT:** idle; deploy НЕ.

## [2026-08-12] — TZ-SALES-366 DONE — браузерная «Печать» КП вне sandbox-превью
**Исполнитель:** kppdf-8.0/freebuff (agent-adeea875e2)
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** «Скачать ▾ → Печать» больше не зовёт `print()` внутри sandboxed A4 iframe (`Ignored call to 'print()'`): `printPreview()` собирает тот же build HTML всех листов (`previewHtml` — полный документ с `.doc-page` и `@page A4`) и печатает его во временном невидимом родительском iframe (`data-test="kp-temp-print-frame"`, без sandbox — модалки разрешены; srcdoc задаётся до вставки, печать по load с guard `about:srcdoc`, кадр убирается по `afterprint`/таймауту). В head добавляется печатный CSS (`print-color-adjust:exact` — фон «как на экране», паритет с PDF `printBackground`; явный page-break между листами). Превью-лента осталась `sandbox="allow-same-origin"` без scripts; убран ненужный `#previewFrame` viewChild. `proposal-create.page.ts` не тронут; PDF/Архив/puppeteer/Desktop не тронуты; 320 остаётся PARK.
**Gates:** FE tsc PASS (exit 0, 0 diagnostics); focused Jest proposal-create-template-center + proposal-create.page 42/42 PASS (новый spec template-center 5/5: sandbox без allow-scripts, print path, temp frame всех листов, пустое превью без кадра); changed ESLint/Prettier/diff-check PASS; `git diff` без page.ts / PDF / puppeteer / Desktop.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-366.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-366.md`
**Lock:** `.mimocode/locks/TZ-SALES-366-kp-browser-print-sandbox.lock`
**Known limit:** нативный диалог печати в headless-сессии не открыть — print-путь покрыт Jest; live smoke «Все КП → ?action=print» — вручную после деплоя.
**NEXT:** TZ-SALES-362 (тиры S/L + иконка Условий) после merge 359 на page.ts; deploy НЕ.

## [2026-08-12] — TZ-SALES-363 DONE — chrome polish панелей Create КП (WAVE-KP-STUDIO-CHROME #1)
**Автор:** Buffy / freebuff-kppdf-8.0-d8650b12
**Статус:** DONE; frontend-only (LAYER 2, parallel OK); deploy НЕ
**Что:** Панели-дети студии Create КП ужаты по Paper & Ink: (1) пустое «Условия» — короткое «Добавьте первое условие.» без повтора кнопки библиотеки; (2) «Шаблон» — убран дубль имени шаблона под селектом (имя и так в trigger); (3) «Получатель» — клиент выбирается searchable `PiOverflowSelect` (334-канон) вместо «поиск + native select»; (4) «Параметры» — три повтора «только в этом КП» сведены к одной подсказке про наценку. Product rail не менялся (шума нет; ширина = 362).
**Gates:** frontend tsc PASS; proposal-create + terms Jest 38/38 PASS; changed-file ESLint PASS; `git diff --check` PASS; diff не содержит `proposal-create.page.ts`. DOM self-verify PASS на dev :4203 (Условия/Получатель/Шаблон/Параметры вживую, console чист).
**Archive:** `tasks/_archive/2026-08/TZ-SALES-363.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-363.md`
**Lock:** `.mimocode/locks/TZ-SALES-363-kp-studio-panels-chrome.lock`
**Known limit:** Prettier-базлайн репо не чист (warn на untouched файлах); мои правки стилю окружения не противоречат. Live backend-data smoke не требуется (правки UI-копирайта/выбора).
**NEXT:** TZ-SALES-362 после merge 359 на page.ts; deploy НЕ.

## [2026-08-12] — TZD-44 DONE — MCP data hygiene
**Автор:** Buffy
**Статус:** DONE; Desktop/MCP only; deploy НЕ
**Что:** Added read-only duplicate grouping for material/product/module/counterparty and gated `kppdf_cleanup_test_data` with exactly one non-empty prefix/regex/id filter, explicit `userOk:true`, dry-run mode, and existing Nest DELETE soft-delete guards only. No hard delete, wipe, or production cleanup.
**Gates:** desktop/mcp 110/110 PASS; MCP tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-44.done.md`
**Checklist:** `docs/agent-checklists/TZD-44.md`
**Lock:** `.mimocode/locks/TZD-44-mcp-data-hygiene.lock`
**Known limitation:** production cleanup waits for explicit PO «да, чисти Тест*»; TZD-45 remains parked.
**NEXT:** MCP audit queue complete; deploy НЕ.

## [2026-08-12] — TZD-43 DONE — MCP product category/status contract
**Автор:** Buffy
**Статус:** DONE; Desktop/MCP + backend mutation-journal mapping; deploy НЕ
**Что:** Product proposals now accept optional `categoryId` and backend status whitelist `new|active|archived|draft`; journal payload preserves both through confirm. Product domain schema and `kppdf_validate_product` expose/validate the fields; omitted fields remain backward-compatible.
**Gates:** desktop/mcp 105/105 PASS; MCP tsc PASS; backend mutation-journal 26/26 PASS; backend tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-43.done.md`
**Checklist:** `docs/agent-checklists/TZD-43.md`
**Lock:** `.mimocode/locks/TZD-43-mcp-product-category-status.lock`
**Known limitation:** no live product create was run; no category API/backfill/frontend/production/deploy changes.
**NEXT:** TZD-44; TZD-45 parked; deploy НЕ.

## [2026-08-12] — TZD-42 DONE — MCP mutation-journal confirm 404 recovery
**Автор:** Buffy
**Статус:** DONE; Desktop/MCP + backend mutation-journal; deploy НЕ
**Что:** Reproduced a stable propose→confirm path through 100 immediate backend confirms and material/product MCP mock chains. Root cause was consistent with clients passing a nested/derived id instead of TZD-41’s top-level `proposalId`; no delete, overwrite, ownership race, or TTL expiry reproduced. Proposal confirm/cancel 404s now echo the received id with a recovery hint, and MCP confirm repeats it on HTTP 404.
**Gates:** backend mutation-journal 23/23 PASS; backend tsc PASS; desktop/mcp 100/100 PASS; MCP tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-42.done.md`
**Checklist:** `docs/agent-checklists/TZD-42.md`
**Lock:** `.mimocode/locks/TZD-42-mcp-confirm-404.lock`
**Known limitation:** live replay of «Шест для лазания ШЛ-300» was not run; unit + MCP chain close the investigated hypotheses. No frontend, TZD-43/44/45, production cleanup, or deploy changes.
**NEXT:** TZD-43 → TZD-44; TZD-45 parked; deploy НЕ.

## [2026-08-12] — TZD-41 DONE — MCP envelope, outputSchema and canonical list aliases
**Автор:** Buffy
**Статус:** DONE; Desktop/MCP contract hardening; deploy НЕ
**Что:** Общий success envelope `{ok,result,id?,proposalId?}` теперь отдаётся и через `structuredContent`; `_id` нормализуется в `id`, proposal ids — в top-level `proposalId`. Добавлены `outputSchema` на TZD-41 tool surface и канонические `kppdf_list_*` с one-wave aliases для doc/import/text list tools.
**Gates:** `cd desktop/mcp && pnpm test` 98/98 PASS; `pnpm exec tsc --noEmit` PASS; tools/list smoke 81 tools/outputSchema PASS; `git diff --check` PASS. Prettier/ESLint для desktop/mcp не настроены (N/A).
**Archive:** `tasks/_archive/2026-08/TZD-41.done.md`
**Checklist:** `docs/agent-checklists/TZD-41.md`
**Lock:** `.mimocode/locks/TZD-41-mcp-envelope-output-schema.lock`
**Known limitation:** domain/validate registrations remain outside this conflict-key schema sweep; TZD-42 → TZD-43 → TZD-44 next, TZD-45 parked.
**NEXT:** TZD-42; deploy НЕ.

## [2026-08-11] — TZ-SALES-355 DONE — Состав КП: wide table + edit in place
**Автор:** Cursor
**Статус:** DONE (код); deploy позже
**Что:** Правый «Состав КП» — таблица на ~½ экрана вместо кучи карточек; карандаш открывает FullEditor без ухода со студии; A4 = превью.
**Gates:** FE tsc PASS; proposal-create 34/34 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-355.done.md`
**Audit:** `docs/audits/2026-08-11-kp-composition-table-audit.md`
**NEXT:** PO смотрит локально/после деплоя; деплой по команде.

## [2026-08-11] — TZ-CATALOG-339 DONE — фото изделия без «уже изменено»
**Автор:** Cursor
**Статус:** DONE (код); warm deploy — ждёт PO «деплой»
**Что:** VersionError при сохранении photoIds: optimisticLockPlugin больше не трогает __v вручную; Product/Material update через findOneAndUpdate; attachPhoto — нормальный append.
**Gates:** Jest product.service + optimistic-lock PASS; backend tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-339.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-339.md`
**NEXT:** деплой по команде PO → снова WAVE-MCP-AUDIT-P0 (TZD-41).

## [2026-08-11] — TZ-OPS-312 DONE — catalog page specs dictionary-labels flush
**Автор:** Buffy / buffy-ops-312
**Статус:** DONE; specs-only harness fix; deploy НЕ
**Что:** В products/module-detail page specs добавлен явный flush всех GET `/dictionary-labels` массивом `[]`; generic leftover cleanup в module-detail больше не отправляет `{}` в dictionary service. Production pages/services/BOM не затронуты.
**Gates:** focused Jest 25/25; frontend app tsc PASS; ESLint PASS; Prettier code style PASS с checkout CRLF override; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-312.done.md`
**Checklist:** `docs/agent-checklists/TZ-OPS-312.md`
**Lock:** `.mimocode/locks/TZ-OPS-312-catalog-specs-dict-flush.lock`
**NEXT:** idle; Deploy НЕ.

## [2026-08-11] — TZ-OPS-311 DONE — shared→pages BOM убран (architecture:check)
**Исполнитель:** Buffy / freebuff executor (land Cursor→main)
**Статус:** DONE; FE gates + archive + lock; landed on main
**Что:** BOM panel + composition picker перенесены `pages/products/` → `shared/ui/composition`; quick-create (shared) больше не импортирует `pages/*`. В панели module/material edit-диалоги стали lazy dynamic imports (паттерн product-form, без ESM-цикла, один write-path состава). Обновлены импорты quick-create / product-form-dialog / product-detail / module-detail (+spec'ы).
**Gates:** FE tsc PASS; `pnpm architecture:check` baseline 7 → 3 (resolved: quick-create:52, module-detail:33, bom-panel:41/42; новых нет) PASS; Jest focused 4/4 suites (63) PASS; Prettier/ESLint PASS. Pre-existing (чистый HEAD, stash-тест): module-detail.page.spec/products.page.spec 24 fail — dictionary-labels flush, не регрессия.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-311.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-311-shared-bom-extract.lock`
**NEXT:** idle; WAVE-KP-SHAME-POLISH already DONE on main; deploy НЕ.

## [2026-08-11T18:30:00Z] — TZ-SALES-354 DONE — self-pass менеджера, WAVE-KP-SHAME-POLISH DONE
**Исполнитель:** Buffy / buffy-sales354
**Статус:** DONE; manager self-pass, frontend gates, archive and lock complete; deploy НЕ
**Что:** Один проход «Все КП → Создать КП» подтвердил RU empty/status chrome, create/edit/copy/print routes, витрина/qty/modules/materials, состав/своя строка/условия, status/F5/preview. Точечно убраны legacy `strip-commerce` и `master` из подтверждений.
**Gates:** FE tsc PASS; proposals + proposal-create + product-rail Jest 68/68 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS. Browser/auth smoke unavailable headlessly.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-354.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-354-kp-manager-selfpass.lock`
**CHECKPOINT:** WAVE-KP-SHAME-POLISH DONE; idle; готово предложить деплой; deploy НЕ.

## [2026-08-11T18:05:00Z] — TZ-SALES-353 DONE — превью A4, F5 и страницы
**Исполнитель:** Buffy / buffy-sales353
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** Превью показывает короткие RU loading/error, один лист — «Страница 1», несколько — «Страница 1 из N»; iframe sandboxed/view-only. F5 восстанавливает состав и сохранённый `sheetLayout` после выбора шаблона.
**Gates:** FE tsc PASS; proposal-create Jest 34/34 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-353.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-353-kp-preview-f5-shame.lock`
**NEXT:** TZ-SALES-354; deploy НЕ.

## [2026-08-11T17:20:00Z] — TZ-SALES-352 DONE — chrome состава, условий и статуса
**Исполнитель:** Buffy / buffy-sales352
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** Empty «Состав КП» ведёт в «Товары» и нормализует пустую «Своя строка»; «Условия» имеют явный «Добавить условие»; status chrome использует «Принято», а «Создать заказ» видим и объясняет disabled до принятия.
**Gates:** FE tsc PASS; proposal-create + terms Jest 36/36 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-352.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock`
**NEXT:** TZ-SALES-353; deploy НЕ.

## [2026-08-11T16:58:00Z] — TZ-SALES-351 DONE — витрина Create КП без краевых ловушек
**Исполнитель:** Buffy / buffy-sales351
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** Витрина Create КП получила русские empty-подсказки для пустого вида/поиска, сохранение поиска при смене chip, qty минимум 1 с поддержкой дробных материалов и badge «В КП» из актуального `draftLines`.
**Gates:** FE tsc PASS; proposal-product-rail Jest 12/12 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-351.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock`
**NEXT:** TZ-SALES-352; deploy НЕ.

## [2026-08-11T16:40:00Z] — TZ-SALES-350 DONE — журнал «Все КП» без стыда
**Исполнитель:** Buffy / buffy-sales350
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** Список «Все КП» выровнен со студией Create КП 347: `accepted` = «Принято», `converted` = «В заказе»; неизвестные коды не протекают в UI как сырой EN. Пустой журнал получил русское объяснение и явную кнопку «Создать КП» → `/proposals/create`; при пустом поиске CTA не вводит в заблуждение.
**Gates:** FE tsc PASS; proposals.page Jest 21/21 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; `pnpm architecture:check` PASS; DOM self-check PASS. Root Markdown Prettier unavailable in environment.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-350.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock`
**NEXT:** TZ-SALES-351; deploy НЕ.

## [2026-08-11] — Adopt vibe org: ledger + task modes + architecture:check
**Исполнитель:** cursor-architect
**Статус:** docs + tooling on main; product code НЕ
**Что:** Capability ledger; AGENT-TASK-MODES (primary/secondary); `scripts/architecture-check.mjs` + baseline (7 keys); wire AI-AGENT-GUIDE/GEMINI/PROJECT-MEMORY/FIC/SECTION-READINESS/ARCHITECTURE/skill; backlog TZ-OPS-311 (shared→pages BOM).
**Gates:** `pnpm architecture:check` PASS
**NEXT:** claim TZ-OPS-311 когда свободен исполнитель; deploy НЕ.

## [2026-08-11] — Warm deploy OK — AUTH-302 + KP на прод
**Исполнитель:** cursor-architect-ops
**Статус:** warm deploy WIPE=false complete
**SHA:** `c8ebdeb6`
**Smoke:** LAN+prod health ok; prod index без inline desktop script (meta OK); admin login 200 после Basic.
**NEXT:** idle.

## [2026-08-11] — TZ-AUTH-302 CODE DONE — CSP inline desktop URL removed
**Исполнитель:** cursor-architect-ops
**Статус:** code DONE + archive; warm deploy ждёт PO «деплой»
**Что:** Убран inline script из `index.html`; URL установщика через meta `kppdf-desktop-download-url`; `deploy.py` пишет content; Helmet scriptSrc без unsafe-inline.
**Gates:** FE tsc; jest desktop-download-url 7/7.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-302.done.md`
**NEXT:** warm deploy по «деплой»; на проде проверить отсутствие CSP inline + вход admin.

## [2026-08-11] — TZ-OPS-310 DONE — server harden (deploy gate)
**Исполнитель:** cursor-architect-ops
**Статус:** DONE; evidence + archive + lock; deploy НЕ
**Что:** VPN OFF → SSH jump VM→VPS. Inventory SUID/SGID на box-946037 и ubuntuserver (без снятия битов — всё пакетное/allowlist). UFW VPS только 22/80/443; :4200 listen но снаружи закрыт. Basic Auth 401/200. htpasswd root:www-data 640. Tunnel + LAN health 200.
**Evidence:** `docs/ops/server-harden-evidence.md`
**Archive:** `tasks/_archive/2026-08/TZ-OPS-310.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-310-server-harden.lock`
**NEXT:** warm deploy только по PO «деплой»; после выката проверить вход (AUTH-302). Wipe НЕ.

## [2026-08-11] — TZ-SALES-348 DONE — витрина КП: «В КП», qty, модули/материалы
**Исполнитель:** cursor-composer-sales348
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Витрина Create КП — chips Изделия/Модули/Материалы; «В КП: N» из реального состава; поле кол-ва на карточке (Add & continue / «Ещё +N»). Module/material пишут `lineKind` + `refId` со снимком; старые catalog `productId` читаются; GET populate по виду.
**Gates:** backend tsc + quotation 40/40; frontend tsc + proposal-create/rail 41/41 + Angular development build; Prettier/ESLint/diff-check PASS; DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-348.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-348-kp-vitrine-added-badge-modules.lock`
**Commit/push:** `e23a665d` on canonical `main` and `origin/main`.
**NEXT:** idle coding → VPN OFF → OPS-310 → warm deploy (PO); Deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-347 DONE — статус, версии и заказ из КП
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** Create КП получил RU status badge и разрешённые переходы, использующий existing API `freeze` version viewer без PATCH/autosave, кнопку «Создать заказ» для принятого КП с переходом в `/orders/:id` и «Копировать КП» через duplicate.
**Gates:** frontend tsc + proposal-create/terms 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS; DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-347.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-347-kp-status-versions-in-studio.lock`
**Commit/push:** pending closeout commit.
**NEXT:** TZ-SALES-348; Deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-346 DONE — многостраничный лист КП
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Добавлен `Quotation.sheetLayout` с лимитами строк, размером/обрезкой фото и переключателем photo column. Backend build режет длинный состав на страницы, повторяет шапку таблицы и фон, выводит итоги/условия только на последней странице и добавляет нумерацию при `pageNumbering`.
**Preview:** Центр Create КП показывает вертикальный стек A4 iframe-листов и «Страница 1 из N»; одношитный режим и frozen shell 317 сохранены.
**Gates:** backend tsc + document-template/table-template/quotation 102/102; frontend tsc + proposal-create 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS (ESLint 0 errors, 3 existing any warnings); DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-346.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-346-kp-multipage-sheet-layout.lock`
**Commit/push:** `ad476607` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-347 → 348; Deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-342 DONE — свои строки КП и line-level commerce
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** В «Состав КП» добавлена «Своя строка» без создания карточки каталога. Позиции получили название/описание, ед. изм., скидку %, и флаг «Не входит в стоимость»; custom/catalog discriminator сохраняет старые КП.
**Persistence/render:** Backend считает `quantity × unitPrice × (1 − discountPercent/100)`, optional lines не входят в документный итог, но остаются на листе с отдельным «Дополнительно (не входит в стоимость)». Build и PDF получают описание, скидку и optional marker.
**Gates:** backend tsc + quotation/generated-document 48/48; frontend tsc + proposal-create/terms 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS. DOM/component self-check PASS; authenticated browser data smoke unavailable без backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-342.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-342-kp-custom-lines.lock`
**Commit/push:** `2736d28e` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-346 → 347 → 348; Deploy НЕ; desktop ZIP publish НЕ.


## [2026-08-11] — TZ-SALES-344 DONE — КП условия, библиотека и переменные
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** В правом рейле студии добавлена русская панель «Условия»: строки условий с multiline-редактором, ↑/↓, удалением, библиотекой TextBlock по активным категориям и вставкой переменных в позицию курсора. Shell 317/A4 geometry не изменялись.
**Persistence/render:** `Quotation.terms` сохраняется и восстанавливается после F5; build получает terms, номер/дату/итог и печатает известные переменные в блок условий или fallback-секцию. Неизвестные токены остаются литералом; PDF rebuild payload включает terms.
**Gates:** backend tsc + document-template/quotation 96/96; frontend tsc + proposal-create/terms 32/32; Angular development build; ESLint/Prettier/diff-check PASS. DOM/component self-check PASS; authenticated browser data smoke unavailable без backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-344.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-344-kp-terms-panel.lock`
**Commit/push:** `36601821` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-342 → 346 → 347 → 348; Deploy НЕ; desktop ZIP publish НЕ.


## [2026-08-11] — TZ-SALES-343 DONE — КП получатель, контакт и объект
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Добавлен левый overlay «Получатель» без изменения frozen A4 geometry: активные Counterparty с поиском, карточка реквизитов, назначенный Person, Site объект/адрес и quick-create клиента. «Параметры» оставляет одну summary-строку с «Изменить» в тот же overlay.
**Persistence/build:** Quotation хранит и populate-ит `contactPersonId`/`siteId`; autosave/F5 восстанавливают refs; build получает buyer/contact/site ids и добавляет `contactName`, `contactPosition`, `siteName`, `siteAddress` к `counterparty` source.
**Gates:** backend tsc + quotation 35/35; frontend tsc + proposal-create 28/28; Angular development build; ESLint/Prettier/diff-check PASS. DOM/test self-check PASS; authenticated browser data smoke unavailable без backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-343.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-343-kp-recipient-panel.lock`
**Commit/push:** `5299db91` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-344 → 342 → 346 → 347 → 348; Deploy НЕ; desktop ZIP publish НЕ.


## [2026-08-11] — TZ-SALES-345 DONE — КП PDF, Печать and archive
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Добавлены `POST /quotations/:id/pdf` из сохранённого/build HTML с `puppeteer-core`, RU 503 fallback при отсутствии Chrome, final archive `GeneratedDocument`, единое меню «Скачать ▾» в студии и PDF/Печать в «Все КП». Печать использует текущий A4 iframe; повторный архив создаёт новую запись.
**Gates:** backend tsc + quotation/generated-document 31/31 focused и 13/13 generated-document; frontend tsc + proposal-create 27/27 + proposals 20/20 + development build; ESLint/Prettier/diff-check PASS. DOM self-check PASS; real browser/PDF smoke unavailable without Chrome/backend data stack, 503 path tested.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-345.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-345-kp-pdf-print-archive.lock`
**Scope:** frozen shell 317, recipient/terms/custom lines/multipage/status/versions/vitrine, deploy, ZIP publish and foreign WIP untouched.
**NEXT:** TZ-SALES-343 → 344 → 342 → 346 → 347 → 348; Deploy НЕ.

## [2026-08-10T23:50:00Z] — TZ-SALES-341 DONE — КП commercial fields and VAT persistence
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** В «Параметры» добавлены секции «Документ», «Деньги» и «Сроки»; номер/название/даты, НДС, скидка %/₽, предоплата и сроки идут в autosave и гидратируются после F5. Backend хранит новые поля и пересчитывает итог как наценка → скидка; A4 footer получает тот же dealTotals без колонки скидки.
**Gates:** frontend tsc + proposal-create 26/26 PASS; backend tsc + quotation 32/32 PASS; ESLint/Prettier/diff-check PASS; Angular DOM self-check PASS. Live authenticated browser smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-341.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-341-kp-commercial-fields.lock`
**Scope:** shell 317, catalog, shared table presets, PDF/print and foreign WIP untouched.
**NEXT:** TZ-SALES-345 → 343 → 344 → 342 → 346 → 347 → 348; Deploy НЕ.

## [2026-08-10T23:25:00Z] — TZ-SALES-340 DONE — КП composition panel
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; fullstack gates, archive and lock complete; deploy НЕ
**Что:** В студии `/proposals/create` добавлен взаимоисключающий overlay «Состав КП»: позиции с фото/артикулом, quantity −/+, цена, ед. изм., сумма, дублирование, удаление и порядок. Повторное добавление изделия увеличивает количество; изменения идут через существующий build/autosave путь.
**Gates:** frontend tsc PASS; proposal-create 25/25 PASS; backend tsc PASS; ESLint/Prettier/diff-check PASS; Angular DOM self-check PASS. Live authenticated browser smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-340.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-340-kp-composition-panel.lock`
**Scope:** shell 317, shared TableTemplate, catalog prices, PDF/print and foreign WIP untouched.
**NEXT:** TZ-SALES-341 → 345 → 343 → 344 → 342 → 346 → 347 → 348; Deploy НЕ.

## [2026-08-10T23:05:00Z] — TZ-AUTH-301 DONE — login personal-project notice
**Исполнитель:** Buffy / agent-d2515d7a53
**Статус:** DONE; frontend gates, archive and lock complete; deploy НЕ
**Что:** На `/login` добавлен русскоязычный мягкий notice «Личный проект для обучения и тестирования» с канон-текстом, без запрещённой copy. `index.html` получил мягкое description и `robots noindex, nofollow`; документация явно отделяет notice от контроля доступа.
**Gates:** frontend app tsc PASS; `pnpm test -- login.page --runInBand` 4/4 PASS; `git diff --check` PASS. `verify-status.sh` имеет 72 pre-existing historical FWD mismatches, не относящихся к AUTH-301.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-301.done.md`
**Lock:** `.mimocode/locks/TZ-AUTH-301-personal-project-notice.lock`
**Scope:** auth API/guards, backend, nginx/VPS, deploy и foreign WIP не затронуты.
**NEXT:** TZ-SALES-340 → 341 → 345 → 343 → 344 → 342 → 346 → 347 → 348; Deploy НЕ.

## [2026-08-10T19:01:12Z] — TZD-38 DONE — hierarchical specification → BOM composition HITL
**Исполнитель:** Buffy / canonical-main
**Статус:** DONE; archive/lock/closeout complete; Deploy НЕ; desktop ZIP publish НЕ
**Что:** Desktop Import Studio распознаёт `level/parentArticle/article/name/qty/unit/kind`, строит дерево изделие → модуль → материалы, блокирует qty≤0, missing parent, duplicate article/link и invalid root/type. Явное HITL-подтверждение создаёт недостающие Product/Module/Material и вызывает существующие Product/Module composition REST endpoints; flat TZD-37 path не изменён. MCP получил draft-only module/composition tools и `userOk:true` confirm gate. TZD-35 PARK закрыт этим TZ.
**Gates:** desktop typecheck PASS; svelte-check 0/0 PASS; desktop build PASS; specification parser 4/4 PASS; MCP typecheck + 93/93 tests PASS; diff-check PASS. Native Tauri/live catalog smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-38.done.md`
**Lock:** `.mimocode/locks/TZD-38-spec-bom-composition-import.lock`
**Scope:** `desktop/mcp-runtime/**`, orders/quotes bulk, EAV, deploy, ZIP publish, and foreign dirty WIP untouched. Deploy НЕ
**Итог:** WAVE-EXCEL-IMPORT-STUDIO TZD-36→38 DONE; готово предложить desktop publish отдельно, но publish НЕ выполнялся.

## [2026-08-10T18:52:06Z] — TZD-37 DONE — Excel mapping profiles + validation HITL
**Исполнитель:** Buffy / canonical-main
**Статус:** DONE; desktop/backend gates, archive/lock/closeout complete; Deploy НЕ
**Что:** Добавлены multi-sheet выбор, обязательный mapping HITL с красными unfit/conflict и ignore, canonical reshape, row statuses `ok_new/ok_update/skip/conflict/error`, journal-only proposal confirmation, MCP classify suggestion и org-scoped `import_mapping_profiles` CRUD с единственным ★ default.
**Gates:** desktop typecheck + svelte-check 0/0 + build PASS; MCP typecheck + 91/91 tests PASS; backend tsc PASS; mapping profile service 6/6 PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-37.done.md`
**Lock:** `.mimocode/locks/TZD-37-excel-validation-hitl-studio.lock`
**Scope:** `desktop/mcp-runtime/**`, deploy, ZIP publish, commercial MCP, BOM composition and foreign dirty WIP untouched. Deploy НЕ
**NEXT:** claim TZD-38 strictly after conflict scan.

## [2026-08-10T18:43:36Z] — TZD-36 DONE — Desktop Import Studio shell
**Исполнитель:** Buffy / canonical-main
**Статус:** DONE; desktop typecheck, Svelte check, build, MCP tests, archive/lock complete; Deploy НЕ
**Что:** Desktop открывается на вкладке «Импорт Excel» с отдельной вкладкой «MCP», connected-user chip, большой dropzone/preview table и вторичным Inbox. Pairing/MCP host controls сохранены внутри MCP; окно Tauri увеличено до `1280×800` (`1080×720` minimum). README/INSTALL обновлены; TZD-37 mapping/multi-sheet и TZD-38 BOM hierarchy остаются отдельными.
**Gates:** desktop typecheck PASS; svelte-check 0 errors / 0 warnings PASS; desktop build PASS; MCP typecheck + 91/91 tests PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-36.done.md`
**Lock:** `.mimocode/locks/TZD-36-desktop-import-studio-shell.lock`
**Scope:** `desktop/mcp/**`, `desktop/mcp-runtime/**`, deploy, ZIP publish, WAVE-MCP-GAP implementation, and foreign dirty WIP untouched.
**NEXT:** claim TZD-37 strictly after conflict scan. Deploy НЕ

## [2026-08-10T22:10:00Z] — TZD-34 DONE — WAVE-MCP-GAP CLOSED (31→34)
**Исполнитель:** Buffy / continuous executor
**Статус:** WAVE DONE; 4/4 TZ в archive + locks; `_active/` пуст; deploy НЕ (готово предложить деплой)
**Что:** NEW `stock-tools.ts`: `kppdf_list_stock_movements` (GET /api/stock-movements, фильтры) + `kppdf_stock_movement_create` (POST /api/stock-movements — приход/расход/перевод/корректировка; SoT сразу, без journal). Валидация до POST: ровно один из materialId|productId; transfer требует toWarehouseId → toolFail, 0 запросов. Body из whitelist CreateStockMovementDto. Register в tools.ts; registry toolCount 68 → 70. MCP.md: «склад через stock-movements, не storage-items POST».
**Gates:** desktop/mcp test 91/91 PASS; mcp tsc PASS; live healthz toolCount 70 PASS.
**Архивы:** TZD-31/32/33/34 `.done.md` в `tasks/_archive/2026-08/`; locks TZD-31…34.
**Итог волны:** healthz toolCount = source registry (70); material propose с ценой → SoT; MCP draft КП/заказ + gated ship/convert; stock-movement create.
**Checkpoint:** WAVE-MCP-GAP DONE · NEXT idle · готово предложить деплой · Deploy НЕ

## [2026-08-10T21:40:00Z] — TZD-33 DONE: commercial MCP HITL (WAVE-MCP-GAP #3)
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; MCP read + draft write для КП/заказ/клиент; userOk-гейты; deploy НЕ
**Что:** NEW `commercial-tools.ts` (17 tools): 9 read (counterparties/persons/sites/quotations/orders/contracts, slim без HTML snapshot), 4 draft write (counterparty_create — SoT сразу, site_create, quotation/order_create_draft — ПРИНУДИТЕЛЬНО status draft), 4 gated (quotation_set_status draft|sent|accepted|rejected, convert_to_order/contract, order_ship) — только с `userOk:true`, иначе toolFail и 0 backend call. Поля сверены с реальными DTO (QuotationItemDto, OrderItemDto unitPrice optional, CreateCounterpartyDto inn/roles). Register в tools.ts; registry toolCount 51 → 68.
**Gates:** desktop/mcp test 86/86 PASS; mcp tsc PASS; live healthz toolCount 68 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-33.done.md`
**Lock:** `.mimocode/locks/TZD-33-commercial-mcp-hitl.lock`
**Checkpoint:** NEXT = claim TZD-34. Deploy НЕ

## [2026-08-10T21:00:00Z] — TZD-32 DONE: material propose fields (WAVE-MCP-GAP #2)
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; propose create price/kind/description/dimensions → SoT; deploy НЕ
**Что:** `ProposeMaterialCreateDto` расширен whitelist-полями `pricePerUnit` (≥0), `materialKind` (MATERIAL_KINDS), `description` (≤2000), `dimensions` (`DimensionDto` переиспользован). propose→confirm передаёт поля в `MaterialService.create` без потерь; batch items — те же поля. MCP zod (`materialCreateInput`/`batchItemSchema`) зеркалит DTO + `buildMaterialCreateProposal` (default unit `шт`); MCP.md write-таблица обновлена. Invalid kind/цена/размер → 400/zod reject, 0 SoT; regression без новых полей PASS.
**Gates:** BE tsc PASS; mutation-journal Jest 20/20 PASS; desktop/mcp test 79/79 PASS; mcp tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-32.done.md`
**Lock:** `.mimocode/locks/TZD-32-material-propose-fields.lock`
**Checkpoint:** NEXT = claim TZD-33. Deploy НЕ

## [2026-08-10T20:30:00Z] — TZD-31 DONE: MCP runtime sync (WAVE-MCP-GAP #1)
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; live /healthz toolCount 51 ≥ 40; deploy НЕ
**Что:** Реестр имён tools в `desktop/mcp` (единый источник из `*_TOOL_NAMES` + `kppdf_ping`, без ручного дублирования); `/healthz` отдаёт `ok/port/toolCount/packageVersion/hostDir/toolsSample` (sample включает `kppdf_list_categories` + `kppdf_propose_product_create`); стартовый лог печатает hostDir + toolCount. Desktop host: `KPPDF_MCP_HOST_DIR` (import.meta.env `KPPDF_` / process.env) имеет приоритет над resourceDir walk; `package.json name ≠ @kppdf/desktop-mcp` → понятная RU ошибка, процесс не спавнится. Docs MCP.md/INSTALL.md: после `git pull` → Restart MCP → проверка healthz → Cursor Reload MCP.
**Gates:** desktop/mcp `pnpm test` 74/74 PASS (новые suites registry + healthz payload); mcp `tsc --noEmit` PASS; desktop zone `pnpm typecheck` PASS (mcpHost.ts).
**Smoke:** `GET /healthz` → `toolCount: 51`, `packageVersion: 0.1.0`, abs hostDir, startup log `tools 51 registered`.
**Archive:** `tasks/_archive/2026-08/TZD-31.done.md`
**Lock:** `.mimocode/locks/TZD-31-mcp-runtime-sync.lock`
**Checkpoint:** `_active/` пуст для 31; NEXT = claim TZD-32. Deploy НЕ

## [2026-08-10T18:03:51.7524650Z] — TZ-UX-DIALOG-307 DONE: save & continue hotkey
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE gates + archive/lock/closeout complete; deploy НЕ
**Что:** Product/Module/Material/Color reference и QuickCreate получили общий Ctrl+Enter/⌘+Enter save-and-continue pattern. Create сбрасывает default values и фокусирует первое обязательное поле; edit остаётся открыт; обычный Save/Create close behavior сохранён. Добавлены RU footer hints, helper tests и обновлены `ui-add-and-continue.md` / `DIALOG-COOKBOOK.md`.
**Gates:** frontend tsc PASS; focused Jest 6 suites / 92 tests PASS; changed-file ESLint PASS; Prettier PASS; FE build PASS; `git diff --check` PASS с CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-307.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-307-save-and-continue-hotkey.lock`
**NEXT:** land DICT wave into canonical `D:\\kppdf-8.0` main. Deploy НЕ

## [2026-08-10T17:54:56.7912096Z] — TZ-UX-DIALOG-306 DONE: composition quantity
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE gates + archive/lock/closeout complete; deploy НЕ
**Что:** Picker получил поле «Кол-во» с минимумом `0,001` и default `1`; quantity теперь входит в result/session feedback. BOM передаёт quantity в POST вместо hardcoded `1`; Add & continue сбрасывает quantity в `1`. Canonical `ui-add-and-continue.md` и focused specs обновлены.
**Gates:** frontend tsc PASS; focused Jest 2 suites / 22 tests PASS; changed-file ESLint PASS; Prettier PASS; `git diff --check` PASS с CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-306.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-306-composition-picker-qty.lock`
**NEXT:** claim TZ-UX-DIALOG-307 strictly. Deploy НЕ

## [2026-08-10T17:51:30.8247358Z] — TZ-DICT-320 DONE: kind labels FE wire + nav
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE gates + archive/lock/closeout complete; deploy НЕ
**Что:** Shared `PiDictionaryLabelsService` now loads/caches active product/material labels with one RU fallback warning; `/dictionaries/kind-labels` supports admin/manager rename/active PATCH. Product/material FullEditors, QuickCreate, catalog filters/rails, detail, BOM and composition picker use the same service; stable keys remain unchanged.
**Gates:** frontend tsc PASS; focused Jest 6 suites / 103/103; ESLint PASS; new-file Prettier PASS; FE build PASS; diff-check PASS with CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-320.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-320-kind-labels-fe-nav.lock`
**NEXT:** claim TZ-UX-DIALOG-306 strictly. Deploy НЕ

## [2026-08-10T17:37:39.9429139Z] — TZ-DICT-319 DONE: kind labels backend
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; backend gates + archive/lock/closeout complete; deploy НЕ
**Что:** Added idempotent global RU seeds for product/material kind labels, organization-plus-global read/active endpoints, admin/manager rename/order/active patch with immutable keys, and unique `(organizationId, scope, key)` identity with RU duplicate handling. FE dropdown/nav wire remains TZ-DICT-320.
**Gates:** backend tsc PASS; dictionary-label Jest 2 suites / 9 tests PASS; ESLint PASS with one non-blocking test-helper warning; diff-check PASS; backend Prettier unavailable because no formatter dependency is declared.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-319.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-319-kind-labels-dictionary-be.lock`
**NEXT:** claim TZ-DICT-320 strictly. Deploy НЕ

## [2026-08-10T17:32:05.3769468Z] — TZ-CATALOG-338 DONE: article identity contract
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; BE/FE gates, archive, lock, and closeout metadata complete; deploy НЕ
**Что:** Product `sku` стал обязательным артикулом, Product.name — optional с SKU fallback; Module/Material `article` обязательны и уникальны в организации; E11000 переводится в RU 409 «Артикул уже используется». QuickCreate, FullEditor, LockedRequired profiles, DTO/schema/service tests and page docs aligned. Material clone receives an `-COPY` article suffix.
**Gates:** backend tsc PASS; backend focused Jest 63/63; frontend tsc PASS; focused FE Jest 95/95; FE build PASS; ESLint PASS with legacy warnings; diff-check PASS; Prettier CRLF/style baseline documented.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-338.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-338-article-required-unique.lock`
**Known limit:** legacy rows without article remain readable and need migration/backfill before schema-validating edits; no cross-entity uniqueness.
**NEXT:** claim TZ-DICT-319 strictly. Deploy НЕ

## [2026-08-10T16:52:42.9338327Z] — TZ-MATERIALS-312 DONE: supplier states + half-width dimensions
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE gates + focused Jest 43/43 + archive/lock; deploy НЕ
**Что:** Material supplier lookup остаётся на Organization `type=supplier`; пустое состояние показывает RU hint и `/organizations`, ошибка видна под полем, loading отключает selector. «Габариты» ограничены `w-full lg:w-1/2 max-w-xl`; contract/isImmutable не менялись.
**Gates:** frontend tsc PASS; material-form Jest 43/43 PASS; ESLint PASS; `git diff --check` PASS; Prettier baseline CRLF mismatch documented.
**Archive:** `tasks/_archive/2026-08/TZ-MATERIALS-312.done.md`
**Lock:** `.mimocode/locks/TZ-MATERIALS-312-supplier-empty-dims-half.lock`
**NEXT:** claim TZ-CATALOG-338 strictly. Deploy НЕ

 freebuff/kppdf-8-0-wave-mcp-gap-d933f405-1386-42a7-acf9-965bef47b771

## [2026-08-09T20:10:00Z] — Warm deploy OK + deploy docs for agents
**Статус:** prod `https://kppdf-crm.ru` health/ready ok; LAN `:3000` ok; wipe НЕ
**База кода:** `fe98e763` (+ commit Unicode-fix `deploy.py` / docs)
**Урок:** Windows cp1251 ломал лог с `→` — `_safe_print` + `PYTHONUTF8=1`
**Docs:** `deploy/synology/README.md` § «Для ИИ-агента»; RUNBOOK/DEPLOY обновлены
**NEXT:** idle

## [2026-08-09T20:00:36Z] — TZ-OPS-309 DONE: deploy-prep hygiene + admin smoke
**Исполнитель:** Buffy / ops executor
**Статус:** DONE; READY TO PROPOSE DEPLOY; Deploy НЕ
**Что:** DOC-343 archive committed; DOC-344 parked without implementation. Existing single Nest on :3000 returned `/api/health` HTTP 200 (`status: ok`, Mongo/memory/disk up); existing FE on :4200 passed admin browser smoke for `Все КП`, `Создать КП`, and `Роли` (system rows `Системная` + `Редактировать`, no Delete).
**Gates:** FE tsc `--noEmit` PASS; BE tsc `--noEmit` PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-309.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-309-deploy-prep-hygiene-smoke.lock`
**Checkpoint:** READY TO PROPOSE DEPLOY · NEXT idle · Deploy NO.

## [2026-08-09T19:44:49Z] — WAVE-KP-USABLE DONE: 339 → 334 → 349 → 335 → 336
**Исполнитель:** Buffy / continuous executor
**Статус:** WAVE DONE; all scoped commits pushed to canonical `main`; deploy НЕ
**Финальный отчёт PO:**

| TZ | Feature SHA | Closeout SHA | Archive |
|---|---|---|---|
| TZ-SALES-339 | `8a3186f1` | `e183a663` | `tasks/_archive/2026-08/TZ-SALES-339.done.md` |
| TZ-SALES-334 | `fa14bcec` | `fa14bcec` | `tasks/_archive/2026-08/TZ-SALES-334.done.md` |
| TZ-SALES-349 | `a16d2845` | `a16d2845` | `tasks/_archive/2026-08/TZ-SALES-349.done.md` |
| TZ-SALES-335 | `d6bd43b9` | `592d5980` | `tasks/_archive/2026-08/TZ-SALES-335.done.md` |
| TZ-SALES-336 | `b8edffd7` | `b8edffd7` | `tasks/_archive/2026-08/TZ-SALES-336.done.md` |

Merge landing for 339/334: `69752397`. `_active/` is empty; WAVE-KP-COMPLETE was not started; Deploy NO.

## [2026-08-09T19:44:49Z] — TZ-SALES-336 DONE: hard-lock «Оплачена» и копирование КП
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; browser self-verify + FE/BE gates + archive/lock/closeout; deploy НЕ
**Что:** `accepted` показывается как «Оплачена» и блокирует редактирование товаров, количества, шаблона, параметров и таблицы; снятие статуса возвращает draft/editable. При повторном открытии оплаченной КП используется сохранённый `templateSnapshot.html`, без live template build. «Копировать» вызывает duplicate API и открывает новый draft в Create КП.
**Gates:** frontend/backend tsc PASS; proposal-create + proposals Jest 44/44; quotation service Jest 27/27; ESLint/Prettier/diff-check PASS.
**Browser evidence:** template + фирма → «Сохранено» → «Оплачена · бланк заблокирован» → unlock restores controls; «Копировать» HTTP 201 → `/proposals/create?id=…`, RU toast «Создана копия …».
**Archive:** `tasks/_archive/2026-08/TZ-SALES-336.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-336-kp-lock-paid-copy.lock`
**Scope:** foreign DOC-343/344 and system-role/admin WIP excluded; frozen 317/320 untouched. Deploy НЕ
**NEXT:** close WAVE-KP-USABLE; do not start WAVE-KP-COMPLETE.

## [2026-08-09T19:18:00Z] — TZ-SALES-349 DONE: hygiene старых уникальных индексов quotations
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; migration/unit/e2e/browser self-verify PASS; deploy НЕ
**Что:** Стартовая guarded-миграция перечисляет индексы `quotations`, удаляет только неканонические unique (оставляет `_id_`, `number_1`, `masterId_1_organizationId_1`), безопасна на пустой базе и при гонке удаления индекса; `DatabaseModule` запускает её после подключения Mongo.
**Gates:** backend tsc PASS; migration Jest 4/4; quotation e2e 7/7; frontend tsc PASS; proposal/Create Jest 21/21; Prettier/diff-check PASS.
**Browser evidence:** browser-context create → delete → create → create: HTTP `[201, 200, 201, 201]`, номера `QTN-2026-025/026/027` различны, удалённая КП скрыта, две живые видны; `/proposals/create?new=1` открылся с русским UI.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-349.done.md`; lock создан; `_active/TZ-SALES-349.md` удалён.
**Scope:** quotation schema/numbering/soft-delete, frozen 317/320, foreign system-role/admin и DOC-343/344 WIP не тронуты. Deploy НЕ
**NEXT:** claim TZ-SALES-335 separately. Deploy НЕ

## [2026-08-09T20:10:00Z] — Warm deploy OK + deploy docs for agents
**Статус:** prod `https://kppdf-crm.ru` health/ready ok; LAN `:3000` ok; wipe НЕ
**База кода:** `fe98e763` (+ commit Unicode-fix `deploy.py` / docs)
**Урок:** Windows cp1251 ломал лог с `→` — `_safe_print` + `PYTHONUTF8=1`
**Docs:** `deploy/synology/README.md` § «Для ИИ-агента»; RUNBOOK/DEPLOY обновлены
**NEXT:** idle

## [2026-08-09T18:18:00Z] — TZ-ADMIN-303 DONE: админ правит системные роли / delete запрещён
**Исполнитель:** agent-3e757640b7
**Статус:** DONE; self-verify PASS; deploy НЕ
**Что:** Site-admin PATCH системных ролей (permissions/pages); DELETE всегда 403 `SYSTEM_ROLE_FROZEN`; FE «Редактировать» при `role:write`; RU toast; бейдж «Системная»; filter сохраняет `code`.
**Gates:** BE/FE tsc PASS; system-role Jest 7/7; roles-admin.page Jest 13/13; Prettier/diff-check PASS; browser Edit→Save PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-303.done.md`; lock создан; `_active/TZ-ADMIN-303.md` удалён.
**Scope:** WAVE-KP-USABLE / TZ-SALES-* / freebuff worktree / deploy не тронуты.
**NEXT:** idle. Deploy НЕ

## [2026-08-09T17:00:00Z] — TZ-SALES-339 READY FOR REVIEW: visible Save КП, autosave, soft-delete
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual autosave/delete PASS обязателен до archive; deploy НЕ
**Implementation:** `da1d83e7de29b58276c063c71071675c69b5a44c`.
**Что:** «Сохранить КП» вынесена в верхнюю строку Create-студии; после шаблона + нашей фирмы запускается debounce-автосохранение того же draft; F5 восстанавливает товары/шаблон из Quotation. Soft-deleted КП исключаются из списка и обычного GET.
**Gates:** frontend/backend tsc PASS; proposal/Create Jest 38/38; quotation service 26/26; quotation e2e 6/6; FE Prettier/ESLint PASS; diff-check PASS.
**Scope:** 334 client, 335 qty/photo, 336 lock/copy, 317 shell, DOC-343/admin WIP, 320/322 и deploy не тронуты.
**NEXT:** Cursor/PO visual: Save КП на виду, autosave → F5, удалить КП → строка отсутствует после reload. После PASS archive/lock/remove `_active` → TZ-SALES-334. Deploy НЕ

## [2026-08-09T18:43:14Z] — TZ-SALES-334 DONE: all-counterparty client picker
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; browser self-verify + FE gates + archive/lock/closeout; deploy НЕ
**Feature:** client-only Create changes, pushed in the closeout commit for this TZ.
**Что:** В `Сделки → Создать КП` поле «Клиент» стало `PiOverflowSelect` по всем активным Counterparty без фильтра роли; searchable auto; выбранный клиент входит в autosave и восстанавливается после F5.
**Gates:** frontend tsc PASS; focused proposal/Create Jest 21/21 PASS; frontend Prettier PASS; diff-check PASS.
**Browser evidence:** 5 client options; `Демо · Клиент 3 · ИНН 7700002038` → «Сохранено» → reload `/proposals/create` без `new=1` → клиент остался в «Параметры». Временный self-check draft удалён.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-334.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-334-kp-counterparty-picker.lock`
**NEXT:** claim TZ-SALES-335 separately. Deploy НЕ

## [2026-08-09T21:35:00Z] — TZ-SALES-339 DONE: autosave, resume, delete closeout
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; browser self-verify + archive + lock + closeout commit/push; deploy НЕ
**Implementation:** `8a3186f1` (already on `main`).
**Что:** Create КП показывает только русское состояние автосохранения «Сохранено»; после выбора шаблона, нашей фирмы и товара draft сохраняется и восстанавливается вместе с клиентом. Удалённое КП даёт «КП удалено», исчезает после reload и не воскресает в новом листе.
**Gates:** frontend tsc PASS; backend tsc PASS; focused proposal/Create Jest 21/21 PASS; quotation service 26/26 + quotation e2e 6/6 baseline PASS; Prettier/diff-check PASS.
**Browser evidence:** `Сделки → Создать КП` autosave/no Save button; `/proposals/create` F5 inspector restored firm/client/product; `Сделки → КП` delete toast + row gone; empty new sheet after deletion.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-339.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-339-save-autosave-delete.lock`
**NEXT:** claim TZ-SALES-334 client-only. Deploy НЕ


## [2026-08-09T16:53:54Z] — TZ-SALES-338 DONE: edit through Create studio
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; Cursor/PO visual PASS; deploy НЕ
**Implementation:** `fb04b05689a9dc557840781791c469b80e6c91e4`.
**Что:** Список «Создать»/«Редактировать» ведёт в студию Создать КП; Edit передаёт `?id=`, draft гидратируется без второго form-диалога, EN hints убраны.
**Gates:** frontend tsc PASS; proposals + Create Jest 37/37; Prettier PASS; ESLint PASS; diff-check PASS.
**Visual:** PO подтвердил same КП в студии и новый лист без диалога.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-338.done.md`; lock создан; `_active/TZ-SALES-338.md` удалён.
**Scope:** DOC-343/admin/system-role WIP, 339, 334/335/336, 317 shell, 320/322 и deploy не тронуты.
**NEXT:** TZ-SALES-339. Deploy НЕ

## [2026-08-09T16:47:00Z] — TZ-SALES-338 READY FOR REVIEW: edit through Create studio
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual Edit → studio PASS обязателен до archive; deploy НЕ
**Implementation:** `fb04b05689a9dc557840781791c469b80e6c91e4`.
**Что:** Список «Создать» и «Редактировать» больше не открывает второй form-диалог: оба пути ведут в `/proposals/create`, Edit передаёт `?id=`, Create гидратирует тот же editable draft. Невалидный/закрытый id даёт RU ошибку и чистый лист; Create hints переведены на RU.
**Gates:** frontend tsc PASS; proposals + Create Jest 37/37; Prettier PASS; ESLint PASS; diff-check PASS.
**Scope:** 339 autosave/delete, 334 client, 335 qty/photo, 336 lock/copy, 317 shell, DOC-343/admin WIP, 320/322 и deploy не тронуты.
**NEXT:** Cursor/PO visual: `/proposals` → Редактировать → same КП in studio; Создать → no dialog. После PASS archive/lock/remove `_active` → TZ-SALES-339. Deploy НЕ

## [2026-08-09T16:44:27Z] — TZ-SALES-333 DONE: Save and resume draft
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; PO confirmed continuation; deploy НЕ
**Implementation:** `b1d51453b1e06d2e21f724028164836526c2959b`; closeout metadata `cc4ffd87`.
**Что:** Save создаёт draft с items/templateId/templateSnapshot; повторный Save обновляет тот же draft; editable draft/template resume работает без принудительной блокировки F5. Save visibility/autosave UX переданы TZ-SALES-339.
**Gates:** backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-333.done.md`; lock создан; `_active/TZ-SALES-333.md` удалён.
**Scope:** DOC-343 WIP, dirty admin/system-role WIP, 338/339, 334/335/336, 317 shell, 320/322 и deploy не тронуты.
**NEXT:** TZ-SALES-338. Deploy НЕ

## [2026-08-09T19:30:00Z] — TZ-SALES-333 READY FOR REVIEW: Save and resume draft
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual Save → reload/F5 PASS обязателен до archive; deploy НЕ
**Implementation:** `b1d51453b1e06d2e21f724028164836526c2959b`, pushed to `origin/main`.
**Что:** Save создаёт draft quotation с items/templateId/templateSnapshot; повторный Save PATCH-ит тот же draft; editable last draft/template восстанавливаются без блокировки F5.
**Gates:** backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
**Scope:** 334 Client, 335 qty/photo, 336 paid/lock/copy, 332 rail, 317 shell, DOC-343 WIP, 320/322 и deploy не тронуты.
**NEXT:** Cursor/PO visual Save → reload/F5 PASS → archive/lock/remove `_active` → 334. Deploy НЕ

## [2026-08-09T16:19:16Z] — TZ-SALES-337 DONE: no duplicate Table section in Parameters
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; quick DOM visual PASS; deploy НЕ
**Implementation:** `0d3ea7faa34752e9765bddc378d01107e72eca9e`.
**Что:** Parameters оставляет фирму/наценку/НДС/оценку/клиента; columns, hide/reorder и CTA «Открыть шаблон таблицы» остаются только в rail Таблица.
**Gates:** frontend tsc PASS; proposal-create Jest 15/15; Prettier PASS; ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-337.done.md`; lock создан; `_active/TZ-SALES-337.md` удалён.
**Scope:** 332 sync/layout, backend, Save/Client/qty/photo/lock, 317 shell, DOC-343 WIP, 320/322 и deploy не тронуты.
**NEXT:** claim TZ-SALES-333. Deploy НЕ.

## [2026-08-09T16:08:44Z] — TZ-SALES-332 DONE: Cursor visual PASS on hotfix
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; Cursor visual PASS; deploy НЕ
**Feature:** `f5e0f401`; **hotfix:** `272550ab946600045970e31f110d3d72bd121ccd`.
**Visual:** Cursor подтвердил target selection для multi-table template, совпадение labels панели с A4, hide/show и reorder.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-332.done.md`; lock создан; `_active/TZ-SALES-332.md` удалён.
**Gates:** frontend/backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
**Scope:** DOC-343 dirty WIP, 317 shell, 330/331 behavior, Save/Counterparty, 320/322 и deploy не тронуты.
**NEXT:** idle по KP-vitrine. Deploy НЕ.

## [2026-08-09T16:01:50Z] — TZ-SALES-332 HOTFIX READY FOR REVIEW: selected live-table binding
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual PASS обязателен до archive; deploy НЕ
**Root cause:** при 2+ live tables без `kpLineItems` FE выбирал DEFAULT_KP, поэтому labels панели не совпадали с A4 и hide/reorder уходили не в ту таблицу.
**Hotfix:** `272550ab` pushed to `origin/main`; Table rail показывает список live tables, выбранная таблица загружает реальные columns, `tableTargetId` проходит request-only build и BE применяет layout только к выбранной live table.
**Gates:** frontend tsc PASS; backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
**Scope:** 317 A4 rails|center, 330 copy-on-write layout, 331 footer/VAT, CTA/flyout polish, DOC-343 WIP, Save/Counterparty, 320/322 и deploy не тронуты.
**NEXT:** Cursor/PO visual PASS → archive/lock/remove `_active`. Deploy НЕ.

## [2026-08-09T15:45:00Z] — TZ-SALES-332 READY FOR REVIEW: flyout/table rail polish
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual PASS обязателен до archive; deploy НЕ
**Implementation:** `f5e0f401` pushed to `origin/main`.
**Что:** Layout Create КП синхронизируется с реальными columns выбранной live line-items TableTemplate; ←/→ и «Видна/Скрыта» rebuild request-only A4 layout, последний видимый столбец защищён. Правый rail разделён на Параметры/Таблица; CTA = PiButton «Открыть шаблон таблицы»; products закрывает right overlay, flyouts получили воздух/content-height/лёгкую прозрачность.
**Gates:** frontend tsc PASS; proposal-create Jest 14/14; Prettier PASS; diff-check PASS.
**Scope:** frozen A4 rails|center, 330 tableLayout, 331 footer/VAT, Save/Counterparty, 320/322, global tokens, DOC-343 WIP и deploy не тронуты.
**NEXT:** Cursor/PO visual PASS → archive/lock/remove `_active`. Deploy НЕ.

## [2026-08-09T15:35:06Z] — TZ-SALES-331 DONE: markup + VAT footer
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; PO visual PASS; deploy НЕ
**Feature:** `25512c2a` — request-only effective prices from immutable catalog base, whole-deal VAT footer under live line-items table.
**Gates:** backend tsc PASS; document-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Visual:** PO confirmed `Итого`/НДС on the A4 sheet and markup changes displayed figures.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-331.done.md`; lock создан; `_active/TZ-SALES-331.md` удалён.
**Scope:** DOC-343 dirty WIP excluded; discount column, 317 shell rewrite, snapshots, quotation persistence, 320/322, deploy untouched.
**NEXT:** TZ-SALES-332. Deploy НЕ
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual PASS обязателен до archive; deploy НЕ
**Что:** Наценка вычисляет request-only `previewLines.unitPrice` из immutable catalog base price; inspector добавляет НДС % (default 20). Build считает Итого и добавляет right-aligned `в т.ч. НДС` только под live line-items table; VAT-inclusive mode зафиксирован как `sum × vat/(100+vat)`, VAT 0 скрывает VAT row.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Scope:** 330 `tableLayout` и shell 317 сохранены; Product/listPrice не PATCH, скидочная колонка не добавлена; foreign DOC-343 WIP исключён.
**NEXT:** Cursor/PO visual PASS на `/proposals/create` → archive/lock/remove `_active`. Deploy НЕ.

## [2026-08-09T15:01:58Z] — TZ-SALES-330 DONE: Create КП table layout instance
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; Cursor/PO visual PASS; archive + lock; deploy НЕ
**Что:** Create КП получил request-only copy-on-write `kpTableLayout`: правый flyout «Таблица» меняет порядок и visibility колонок, а build применяет их только к назначенной live line-items table. Shared TableTemplate, snapshots и frozen shell не меняются.
**Implementation:** `8c5662fe5783631c5b352d5a5e8bad8547a5dd59`
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-330.done.md`; lock создан; `_active/TZ-SALES-330.md` удалён.
**Scope:** DOC-343 dirty WIP исключён; discount column, 317 shell rewrite, 320/322, deploy untouched.
**NEXT:** TZ-SALES-331. Deploy НЕ.

**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; Cursor/PO visual PASS обязателен до archive; deploy НЕ
**Что:** Правый flyout «Таблица» теперь управляет in-memory copy-on-write `kpTableLayout`: порядок ↑/↓ и visibility, с hint «Меняет только это КП, не общий шаблон» и ссылкой на пресет в Документах. Build DTO/backend применяют порядок/скрытие только к назначенной live line-items table, `index` = 1-based; snapshots и shared TableTemplate не меняются.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; diff-check PASS; FE Prettier PASS.
**Implementation:** pending scoped commit after READY marker; foreign DOC-343 dirty WIP preserved/excluded.
**NEXT:** Cursor/PO visual PASS → archive/lock/remove `_active` → commit/push → TZ-SALES-331. Deploy НЕ.

## [2026-08-09T14:26:00Z] — TZ-OPS-308 DONE: page.md drift audit + thin P0 fix
**Исполнитель:** buffy-ops-308 · docs-only
**Статус:** DONE; deploy НЕ
**Что:** Аудит routes.ts ↔ page.md/README/INDEX/DOMAIN-MAP: 36/36 бизнес-routes документированы, 0 MISMATCH по путям. Найден 1 ORPHAN page (foundations — нет route в app.routes.ts, FE-компонента нет): P0 ложный `/foundations` в README row 36. Тонкий P0-fix: ячейка Route + footer в README (без rewrite body). P1: 5 косметических title-расхождений отмечены, не чинились.
**Gates:** Test-Path аудит True; 84 ≤120; diff без product code; чужой WIP не тронут.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-308.done.md`; lock создан.
**NEXT:** idle; successor P2 — авто-drift gate routes↔page.md; deploy НЕ.

## [2026-08-09T14:42:11Z] — TZ-DOC-TABLES-307 DONE: KP category + preset
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; gates PASS; archive + lock; deploy НЕ
**Что:** Добавлены `kp`/«КП», канонный preset «КП — позиции» с шестью keys, idempotent seed и «Пресет КП» в dialog с confirm для непустых колонок.
**Gates:** BE tsc PASS; table-template e2e 9/9; FE tsc PASS; tables/dialog Jest 52/52; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-307.done.md`; lock создан; `_active/TZ-DOC-TABLES-307.md` удалён.
**Scope:** DOC-343 WIP, 306 chips, 308 layout, 330/331, discount column, Catalog routes, deploy untouched.
**NEXT:** TZ-SALES-330. Deploy НЕ.

## [2026-08-09T14:37:14Z] — TZ-DOC-TABLES-308 DONE: dialog layout + preview skeleton
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; gates PASS; archive + lock; deploy НЕ
**Что:** Source/fields controls выровнены по baseline с сопоставимой шириной; шапки колонок выше; пустой preview показывает skeleton cells и RU guidance вместо серого void.
**Gates:** frontend tsc PASS; dialog Jest 44/44; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-308.done.md`; lock создан; `_active/TZ-DOC-TABLES-308.md` удалён.
**Scope:** 306 chips, 307 enum/preset, backend registry, DOC-343 WIP, deploy untouched.
**NEXT:** TZ-DOC-TABLES-307. Deploy НЕ.

## [2026-08-09T14:33:25Z] — TZ-DOC-TABLES-306 DONE: tables query routing fix
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; gates PASS; archive + lock; deploy НЕ
**Что:** GroupChip/PiGroupWorkspace теперь разделяют route path и queryParams; `Из данных` остаётся на `/doc-constructor/tables?view=from-data`, `Все таблицы` — на `?view=all`, без fallthrough в `/materials`.
**Gates:** frontend tsc PASS; workspace/tables Jest 2 suites / 14 tests; Prettier PASS; diff-check PASS; generated RouterLink href contract PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-306.done.md`; lock создан; `_active/TZ-DOC-TABLES-306.md` удалён.
**Scope:** 307 dialog/preset, Catalog routes, KP Create, DOC-343 WIP, deploy untouched.
**NEXT:** TZ-DOC-TABLES-308. Deploy НЕ.

## [2026-08-09T14:30:45Z] — TZ-DOC-TABLES-305 DONE: PO visual closeout
**Исполнитель:** agent-ccee39fec2
**Статус:** DONE; PO visual PASS; archive + lock; deploy НЕ
**Что:** Table dialog compact settings, enum «Тип» overflow, multi-field overlay with search, and taller column headers. Preview/alignment polish remains TZ-DOC-TABLES-308.
**Gates:** frontend tsc PASS; focused table-template-dialog + overflow-select 2 suites / 49 tests; ESLint PASS; Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md`; lock created; `_active/TZ-DOC-TABLES-305.md` removed.
**Scope:** DOC-343 dirty WIP, 307 preset, Sales, and deploy untouched.
**NEXT:** TZ-DOC-TABLES-306. Deploy НЕ.

## [2026-08-09T14:10:00Z] — TZ-OPS-307 DONE: page.md stubs design/shipping + README hygiene (WAVE CLOSED)
**Исполнитель:** buffy-ops-307 · WAVE-PAGE-DOCS-GAPS #3 (последняя)
**Статус:** DONE; docs-only; deploy НЕ
**Что:** Stub page.md `design` + `shipping` (36 строк ≤60; TZ-NAV-301, data-test, API нет — не изобретать). README hygiene: `/dashboard`→`/inventory`, добавлены 12 живых страниц (25–36), счётчик 36/36. DOMAIN-MAP: former-6 все yes (design/shipping stub-documented), итог **0 × NO**, 4 domain-ячейки обновлены, drift-пометка снята. PAGE-TZ-INDEX OPS-307 DONE.
**Gates:** Test-Path оба True; Select-String NO = 0; page.md ≤60 PASS; diff без product code.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-307.done.md`; lock создан.
**NEXT:** idle — волна WAVE-PAGE-DOCS-GAPS (305→306→307) ЗАКРЫТА, DOMAIN-MAP gaps = 0; deploy НЕ.

## [2026-08-09T14:02:00Z] — TZ-OPS-306 DONE: page.md admin users + roles
**Исполнитель:** buffy-ops-306 · WAVE-PAGE-DOCS-GAPS #2
**Статус:** DONE; docs-only; deploy НЕ
**Что:** Созданы `docs/pages/admin-users.page.md` (90 ≤120) и `admin-roles.page.md` (89 ≤120): route/chips, capability-гейты (user:admin / role:read + systemRoles admin), API `/admin/users` (+activate/deactivate/reset-password) и `/admin/roles`, диалоги (UserForm/ResetPassword/RoleForm view), PAGE_SIZE=10, TZ-257/262/ADMIN-301/302/306.
**Wiring:** README 23/24 (24→26); PAGE-TZ-INDEX OPS-306 DONE; DOMAIN-MAP gap NO→yes (итог 4→2: design/shipping).
**Gates:** Test-Path оба True; ≤120 PASS; diff без product code; чужой WIP не тронут.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-306.done.md`; lock создан.
**NEXT:** TZ-OPS-307 (design/shipping stubs + README hygiene) — строго по очереди; deploy НЕ.

## [2026-08-09T13:52:00Z] — TZ-OPS-305 DONE: page.md doc-template-categories + text-block-categories
**Исполнитель:** buffy-ops-305 · WAVE-PAGE-DOCS-GAPS #1
**Статус:** DONE; docs-only; deploy НЕ
**Что:** Созданы `docs/pages/document-template-categories.page.md` (88 строк ≤120) и `text-block-categories.page.md` (93 ≤120) — route/chips, API `/document-template-categories` и `/text-block-categories`, dialogs, services (кэш activeOnly-каталога), signals, TZ-DOC-308/316/334/DICT-307/310, «системные» isSystem не edit/delete.
**Wiring:** README строки 12a/12b (счётчик 22→24); PAGE-TZ-INDEX OPS-305 DONE; DOMAIN-MAP gap NO→yes ×2, итог 6→4.
**Gates:** Test-Path оба True; page.md ≤120 PASS; diff без frontend/backend/desktop PASS; чужой WIP не тронут.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-305.done.md`; lock создан.
**NEXT:** TZ-OPS-306 (admin users/roles) — строго по очереди; deploy НЕ.

## [2026-08-09T13:40:00Z] — TZ-OPS-304 DONE: Domain Canon Map + gap inventory
**Исполнитель:** buffy-ops-304 · WAVE-PROJECT-KNOWLEDGE #3 (последняя)
**Статус:** DONE; docs-only self-archive OK (AC зелёные); deploy НЕ
**Что:** Создан `docs/DOMAIN-MAP.md` (84 строки ≤180): 12 доменов (домен → BE modules → FE routes → page.md → SoT) + «Не путать» с 4 канонами (Counterparty≠Organization, StorageItem SoT, КП≠Order, composition≠stock) + gap inventory 36 routes → 6 NO без page.md (`/design`, `/shipping`, `/doc-template-categories`, `/dictionaries/text-block-categories`, `/admin/users`, `/admin/roles`) — page.md не создавались, только таблица. Проводка: PROJECT-MEMORY, DOCS-INTEGRITY, ARCHITECTURE pointer (1 строка), pages/README (1 строка).
**Gates:** DOMAIN-MAP 84 ≤180 PASS; rg DOMAIN-MAP в 3 файлах PASS; `git diff --name-only` без frontend/backend PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-304.done.md`; `_active` удалён.
**NEXT:** idle — волна WAVE-PROJECT-KNOWLEDGE (302→303→304) ЗАКРЫТА; successors = missing page.md по gap-таблице (отдельные TZ, не эта волна); deploy НЕ.

## [2026-08-09T13:51:37Z] — TZ-SALES-328 DONE: shop-витрина final visual closeout
**Исполнитель:** agent-6c3d05b80e
**Статус:** DONE; Cursor/PO visual PASS; archive + lock; deploy НЕ
**Что:** Create КП product rail accepted as `PiShowcaseCard md` cards in exactly 3 columns inside the 58rem products flyout, with scoped compactness, photos/placeholders, equal-height rows, search/category filters, API-backed pager, and Add/Edit/Create actions.
**Commits:** `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md×3 + 58rem final visual).
**Gates:** frontend tsc PASS; focused rail Jest 4/4; proposal-create 11/11; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-328.done.md`; lock created; `_active/TZ-SALES-328.md` removed.
**Scope:** DOC-343/document-template.service.ts, OPS WIP, 325 bind, 322/320, and deploy untouched.
**NEXT:** idle по KP-vitrine; do not invent. Deploy НЕ.

## [2026-08-09T13:15:28Z] — TZ-SALES-328 READY FOR REVIEW: shop-витрина
**Исполнитель:** agent-6c3d05b80e
**Статус:** READY FOR REVIEW; visual Cursor/PO PASS обязателен до archive
**Что:** Create КП product rail заменён на `PiShowcaseCard md` grid с фото/placeholder, search/category filters, API-backed page/limit=12 pagination, `Добавить`, `Редактировать` и `Создать изделие` через существующие ProductForm/QuickCreate dialogs. Add-and-continue и A4 rails|center geometry сохранены.
**Gates:** frontend tsc PASS; focused rail Jest 4/4 PASS; proposal-create Jest 11/11 PASS; diff-check PASS.
**Canonical:** `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md×3 + 58rem final visual).
**Scope:** foreign DOC-343 backend/docs WIP preserved/excluded; 325, 322, 320, BuilderCanvas, deploy untouched.
**NEXT:** superseded by the DONE closeout above; deploy НЕ.

## [2026-08-09T13:20:00Z] — TZ-OPS-303 DONE: Docs Integrity Closeout
**Исполнитель:** buffy-ops-303 · WAVE-PROJECT-KNOWLEDGE #2
**Статус:** DONE; docs-only self-archive OK (AC зелёные); deploy НЕ
**Что:** Создан `docs/DOCS-INTEGRITY.md` (60 строк ≤100): правило «код + docs = один PR/TZ», матрица триггер→файлы, Integrity slot, анти-дрейф (код + живая schema побеждают). `_TEMPLATE.md` получил секцию **Integrity slot** после Acceptance; FIC §F — пункт про slot; PROJECT-MEMORY — живая ссылка DOCS-INTEGRITY + Integrity slot в «Не потерять»; GEMINI.md DoD — Integrity slot до READY/archive.
**Gates:** rg Integrity slot/DOCS-INTEGRITY → 14 hits в 6 целевых файлах PASS; DOCS-INTEGRITY 60 ≤100 строк PASS; product code не тронут PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-303.done.md`; `_active` удалён.
**NEXT:** TZ-OPS-304 (Domain Canon Map + gap inventory) — строго по очереди волны; deploy НЕ.

## [2026-08-09T13:05:00Z] — TZ-OPS-302 DONE: Project Memory Pack
**Исполнитель:** buffy-ops-302 · WAVE-PROJECT-KNOWLEDGE #1
**Статус:** DONE; docs-only self-archive OK (AC зелёные); deploy НЕ
**Что:** Создан `docs/PROJECT-MEMORY.md` (67 строк ≤140, 6 секций: Зачем / Ритуал 60 сек / Где правда / Не потерять при DONE / Не ломать / Куда идти по задаче) с заглушками DOCS-INTEGRITY (OPS-303) и DOMAIN-MAP (OPS-304). Проводка входа: GUIDE §1.2 шаг 1a до ARCHITECTURE, GEMINI.md после PO-DIARY, how-to-connect-ai п.6 после CLAIM.
**Gates:** rg PROJECT-MEMORY → 3 файла PASS; строк ≤140 PASS; product code не тронут PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-302.done.md`; `_active` удалён.
**NEXT:** TZ-OPS-303 (Docs Integrity Closeout) — строго по очереди волны; deploy НЕ.

## [2026-08-09T11:17:19Z] — TZ-SALES-321 + TZ-SALES-319 DONE: KP build-preview fidelity closeout
**Исполнитель:** agent-ccee39fec2
**Статус:** DONE; Cursor integration PASS; PO visual PASS; archive + locks; deploy НЕ
**Что:** Серверный build HTML сохраняет layout через `toObject()`, пустая таблица показывает «Нет данных», а frozen Create КП shell отображает фон и позиционированные блоки в sandboxed A4 iframe с absolute `/uploads` URLs, contain-scale, ResizeObserver и без H/V scroll.
**Gates:** backend tsc PASS; document-templates-build e2e 7/7 PASS; frontend tsc PASS; proposal-create 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-321.done.md` + `tasks/_archive/2026-08/TZ-SALES-319.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-321-create-kp-preview-fidelity.lock` + `.mimocode/locks/TZ-SALES-319-create-kp-template-build-preview.lock`
**NEXT:** idle; DOC-344 and DOC-TABLES-305 remain separate active WIP; deploy НЕ.

## [2026-08-09] � TZ-SALES-317 DONE: Create �� focus shell
**�����������:** agent-3e757640b7
**������:** DONE; archive + lock; deploy ��
**���:** Focus shell /proposals/create � A4 center, icon-rails, overlay flyouts (������/������/���������), ��� H1/zone titles; flushBody; spec �0 FROZEN.
**Gates:** FE tsc PASS; proposal-create Jest PASS; Cursor Verdict PASS (visual shell).
**Archive:** `tasks/_archive/2026-08/TZ-SALES-317.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-317-create-kp-focus-shell.lock`
**NEXT:** TZ-SALES-319 (build HTML preview); deploy ��.
## [2026-08-09] — TZ-DOC-342 DONE: upload-background missing file → 400
**Исполнитель:** Buffy closeout / agent-ccee39fec2
**Статус:** DONE; archive + lock created; deploy НЕ
**Что:** Multipart upload без поля `file` теперь возвращает понятный RU 400 для document-template background и template-block image; валидный PNG остаётся 201.
**Gates:** backend tsc PASS; document-templates-upload-background e2e 6/6 PASS; diff-check PASS; Cursor/PO evidence PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-342.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-342-upload-background-null-file-400.lock`
**NEXT:** idle; TZ-SALES-317 остаётся на visual PO; deploy только по явной команде.

## [2026-08-09] — TZ-DOC-TABLES-304 DONE: Registry schema auto-sync
**Исполнитель:** buffy-doc-tables-304
**Статус:** DONE; archive + lock created; deploy НЕ
**Что:** Product registry fields строятся из `ProductSchema.paths`, внутренние/ref/composition paths отфильтрованы deny-list; labels/types mapping детерминирован, entity source allowlist сохранён явным. Добавлен unit proof для нового mock path.
**Gates:** backend tsc PASS; registry unit 1 suite / 2 tests и e2e 1 suite / 8 tests PASS; registry ESLint, Prettier и diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-304.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-304-registry-schema-autosync.lock`
**NEXT:** idle — WAVE-DOC-TABLES #1–#4 DONE; deploy не запускался.

## [2026-08-09] — TZ-DOC-TABLES-303 DONE: Product registry fields + photo slot
**Исполнитель:** buffy-doc-tables-303
**Статус:** DONE; archive + lock created; deploy НЕ
**Что:** Реестр Product дополнен полями из schema SoT (notes/status/RAL/габариты/назначение/монтаж/флаги) и `photoIds` text photo-slot; schema reflection/autosync оставлены TZ-DOC-TABLES-304.
**Gates:** backend tsc PASS; registry e2e 1 suite / 8 tests PASS (baseline had stale 5-source assertion); registry ESLint, Prettier и diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-303.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-303-registry-product-fields-photo.lock`
**NEXT:** TZ-DOC-TABLES-304.

## [2026-08-09] — TZ-DOC-TABLES-302 DONE: dialog overflow-select UX
**Исполнитель:** buffy-doc-tables-302
**Статус:** DONE; archive + lock created; deploy НЕ
**Что:** Источник и тип столбца в диалоге таблицы используют `PiOverflowSelect` с overlay; поля registry читаемые, с явным empty state; native selects убраны из диалога.
**Gates:** FE tsc PASS; table dialog Jest 1 suite / 41 tests PASS; changed-file ESLint, Prettier и diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-302.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-302-table-dialog-overflow-select.lock`
**NEXT:** TZ-DOC-TABLES-303.

## [2026-08-09] — TZ-DOC-TABLES-301 DONE: Documents TOC + Tables subchips
**Исполнитель:** buffy-doc-tables-301
**Статус:** DONE; archive + lock created; deploy НЕ
**Что:** Четыре страницы конструктора документов используют тёмный Documents TOC; Таблицы получили жёлтые «Все таблицы»/«Из данных». `view=from-data` открывает существующий registry dialog, а `+ Новая таблица` остаётся только на `view=all`; дублирующий CTA удалён.
**Gates:** FE tsc PASS; focused Jest baseline 4 suites / 28 tests → final 4 suites / 29 tests PASS; changed-file ESLint, Prettier и diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-301.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-301-documents-toc-tables-subchips.lock`
**NEXT:** TZ-DOC-TABLES-302.

## [2026-08-09] — TZ-UI-GOLD-332 DONE: light fill gold + gold-deep line role

**Исполнитель:** agent-3e757640b7
**Статус:** DONE in scoped files; deploy НЕ
**Что:** Светлое золото заливки синхронизировано между кнопкой/чипами/алиасами; `gold-deep` отделён для focus/border/ring/edit/text ролей; три requested pages and paper-and-ink docs updated.
**Gates:** baseline/final Jest 136 suites / 1276 tests; FE tsc, changed-file ESLint/Prettier, Angular development build, diff-check — PASS.
**Known limitation:** global `text-sunrise-warm` search retains 22 existing files outside the explicit TZ file list; do not expand scope without PO.
**Archive:** `tasks/_archive/2026-08/TZ-UI-GOLD-332.done.md`
**Lock:** `.mimocode/locks/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.lock`
**NEXT:** TZ-DOC-TABLES-301 READY.

## [2026-08-09] — TZ-UI-THEME-331 DONE: dark depth + readable gold states

**Исполнитель:** agent-3e757640b7
**Статус:** DONE; deploy НЕ
**Что:** Добавлен invariant `text-on-gold` для золотых active/primary состояний, затемнены и выровнены dark surface ladders, приглушён dark text, добавлен inset highlight, исправлены selection и scrollbar правила; документация обновлена.
**Gates:** Prettier, changed-file ESLint, FE tsc, full Jest 136 suites / 1276 tests, Angular development build, diff-check — PASS. Focused requested specs отсутствуют; `--passWithNoTests` PASS. Контрольный поиск `bg-sunrise-warm text-paper`: 0.
**Archive:** `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md`
**Lock:** `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`
**NEXT:** TZ-UI-GOLD-332 READY; не claim в этом closeout.

## [2026-08-09] — TZ-SALES-316 DONE: Create KP template center

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #7
**Статус:** DONE; deploy НЕ
**Что:** Центр Создать КП — выбор DocumentTemplate, A4 preview zone, deep-link в builder. Печать 320 остаётся PARKED.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-316.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-316-create-kp-template-center.lock`
**Gates:** FE tsc PASS; Jest 5/5 PASS.
**NEXT:** idle — WAVE fill done; ждать PO unpark 320; можно предложить деплой.

## [2026-08-09] — TZ-SALES-315 DONE: Create KP right inspector

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #6
**Статус:** DONE; deploy НЕ
**Что:** Правая панель Создать КП: Organization, % наценки, оценка суммы (UI), deep-link в организации.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-315.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-315-create-kp-inspector.lock`
**Gates:** FE tsc PASS; Jest 4/4 PASS.
**NEXT:** TZ-SALES-316 template center.

## [2026-08-09] — TZ-SALES-314 DONE: Create KP left product rail

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #5
**Статус:** DONE; deploy НЕ
**Что:** Левый рейл изделий на `/proposals/create` (поиск + Добавить через ProductsService). Draft позиции — in-memory `draftLines`, без PATCH quotation. Center показывает черновик.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-314.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-314-create-kp-product-rail.lock`
**Gates:** FE tsc PASS; Jest 3/3 PASS.
**NEXT:** TZ-SALES-315 inspector.

## [2026-08-09] — TZ-UX-315 DONE: drop pathLabel + dense group chrome

**Исполнитель:** agent-3e757640b7
**Статус:** DONE; deploy НЕ
**Что:** `PiGroupWorkspace` больше не рисует eyebrow `pathLabel` (раздел = топ-меню); TOC/chips `pt-0` вплотную под header; jest на no-render + sticky; сняты мёртвые `pathLabel=` со страниц кроме proposals*/create (peer SALES).
**Затронуто:** pi-group-workspace (+spec), 16 pages attr strip, page-chrome docs.
**Gates:** FE tsc PASS; Jest pi-group-workspace 5/5 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-315.done.md`
**Lock:** `.mimocode/locks/TZ-UX-315-drop-pathlabel-dense-chrome.lock`
**NEXT:** TZ-SALES-315 inspector (KP-VITRINE); 314 already DONE peer.

## [2026-08-09] — TZ-SALES-313 DONE: Все КП family expand (ex-304)

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #4
**Статус:** DONE; deploy НЕ
**Что:** На `/proposals` отдельная колонка Семья: expand variants, attach «Несколько фирм» с UI-оценкой, отдельный read-only variant dialog, sync+confirm. List скрывает variants. SALES-304 не воскрешался; attach остаётся одним существующим API write-path.
**Затронуто:** pi-proposals.service (+spec), proposals.page (+spec), proposal-family-attach-dialog, proposal-variant-dialog, page docs.
**Gates:** FE tsc PASS; Jest 31/31 PASS; prettier/eslint PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-313.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-313-all-kp-family-expand.lock`
**NEXT:** idle — WAVE-KP-VITRINE 310–316 DONE; TZ-SALES-320 PARKED.

## [2026-08-09] — TZ-UI-LIGHT-330 DONE: светлая тема без пересвета

Канва/raised/rule-strong, кнопки gold/secondary, контуры полей, muted-лестница; docs paper-and-ink. Build разблокирован фиксом attach-dialog.

**Archive:** `tasks/_archive/2026-08/TZ-UI-LIGHT-330.done.md`  
**NEXT:** idle / PO visual light+dark; deploy только по команде.

## [2026-08-09] — TZ-SALES-312 DONE: оболочка «Создать КП» (3 зоны)

Трёхколоночный shell `/proposals/create` по design-spec: placeholders RU, toggles на узком viewport, Deals chrome сохранён. Без пикера/сохранения/печати.

**Archive:** `tasks/_archive/2026-08/TZ-SALES-312.done.md`  
**Lock:** `.mimocode/locks/TZ-SALES-312-create-kp-shell.lock`  
**NEXT:** TZ-SALES-313 (Все КП+семья) и/или 314–315 наполнение.

## [2026-08-09] — TZ-SALES-312 DONE: Create КП three-zone shell

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #3
**Статус:** DONE; deploy НЕ
**Что:** `/proposals/create` получил трёхзонный shell (Left/Center/Right) с RU empty-copy из spec 311, toggles на узких viewport и `data-test` для Jest. Deals TOC + жёлтые chips сохранены. Picker/save/template/print — следующие TZ.
**Затронуто:** `proposal-create.page.ts` + spec, page doc, WAVE/ARCHITECTURE, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 5/5 PASS; prettier/eslint PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-312.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-312-create-kp-shell.lock`
**NEXT:** TZ-SALES-313 (Все КП + семья) затем 314/315.

## [2026-08-09] — TZ-SALES-311 DONE: Create КП design-spec (3 columns)

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #2
**Статус:** DONE; deploy НЕ
**Что:** Утверждаемый layout SoT для `/proposals/create`: desktop Left 280–320 / Center flex A4 / Right 300–340; tablet/mobile drawers; пустые RU-фразы; карта зон → 312/314/315/316. Page doc + WAVE/ARCHITECTURE обновлены. Angular-shell остаётся за 312.
**Затронуто:** `docs/ux/kp-create-studio-spec.md`, `docs/pages/proposals-create.page.md`, PAGE-TZ-INDEX, WAVE, ARCHITECTURE, checklist/archive/lock.
**Gates:** docs-only Markdown review PASS; `git diff --check` PASS; product tsc/tests N/A.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-311.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-311-create-kp-design-spec.lock`
**NEXT:** TZ-SALES-312 shell Создать КП.

## [2026-08-09] — TZ-SALES-310 DONE: Deals TOC and КП subchips

**Исполнитель:** agent-3e757640b7 · WAVE-KP-VITRINE #1
**Статус:** DONE; deploy НЕ
**Что:** Сделки переведены на общий тёмный TOC **КП | Договоры | Заказы**; под КП добавлены жёлтые **Создать КП | Все КП**. Добавлен guarded lazy `/proposals/create` route-stub с заголовком «Создать КП». Contracts/orders используют тот же TOC с пустым жёлтым рядом; существующий `/proposals` и quotation API не менялись.
**Затронуто:** FE navigation/chips/routes, focused chips spec, page docs, PAGE-TZ-INDEX, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 2 suites / 18 tests PASS; Angular development build PASS; Prettier PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-310.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-310-deals-kp-subchips.lock`
**NEXT:** TZ-SALES-311 design-spec `/proposals/create`; full three-zone studio remains 312+.

## [2026-08-09] — TZ-PHOTO-303 DONE: legacy originals backfill script

**Исполнитель:** agent-3e757640b7 · WAVE-PERF-PHOTOS #3
**Статус:** DONE; deploy НЕ
**Что:** Добавлен идемпотентный `backend/scripts/tz-photo-303-backfill-thumbs.ts` и команда `pnpm photos:backfill-thumbs`. Скрипт находит старые `original` без thumb, создаёт связанный Sharp WebP thumb, пропускает missing/unsupported/broken файлы с логом, не меняет и не удаляет originals. Повторный запуск не плодит дубли.
**Затронуто:** backend script, focused photo backfill spec, backend package script, checklist/archive/lock.
**Gates:** BE tsc PASS (`--noEmit` и build config); focused photos Jest 3 suites / 6 tests PASS; ESLint PASS; `git diff --check` PASS. `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-303.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-303-backfill-thumbs.lock`
**Run:** из `backend/` → `pnpm photos:backfill-thumbs`; live Mongo backfill намеренно не запускался, оператор должен выполнить после проверки окружения.

## [2026-08-09] — TZ-PHOTO-302 DONE: catalogue lists use linked thumbs

**Исполнитель:** agent-3e757640b7 · WAVE-PERF-PHOTOS #2
**Статус:** DONE; deploy НЕ
**Что:** Добавлен общий frontend helper `photoListUrl()`: direct/linked `thumb` выбирается для list/grid, legacy original остаётся fallback. `/products` table+grid, `/materials` list и production read-facade order/catalogue thumbs переведены на helper; `/modules` audit не нашёл list-photo surface. Detail/form/lightbox/picker оставлены на original сознательно.
**Затронуто:** `frontend/src/app/shared/services/photos.service.ts` (+spec), products/materials pages, production read facade, products/materials page docs, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 5 suites / 33 tests PASS; changed FE ESLint PASS; Prettier PASS; `git diff --check` PASS. `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-302.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-302-lists-use-thumb.lock`
**Known:** старые original без thumb дорабатываются TZ-PHOTO-303; upload/pickers/business logic/layout/PAGE_SIZE/deploy не затронуты.

## [2026-08-09] — TZ-PHOTO-301 DONE: original + lightweight thumb on upload

**Исполнитель:** agent-3e757640b7 · WAVE-PERF-PHOTOS #1
**Статус:** DONE; deploy НЕ
**Что:** Backend `POST /photos/upload` сохраняет оригинал без перекодирования и создаёт отдельный WebP thumb через `sharp` (long side ≤320px, quality 80, без enlargement). Thumb регистрируется дочерним `Photo` с `parentPhotoId`, размерами и размером файла; API сохраняет исходные поля ответа и добавляет `variants.thumb`. Ошибка генерации thumb оставляет оригинал доступным и логирует WARN.
**Затронуто:** `backend/src/modules/photos/*`, `backend/package.json`, `backend/pnpm-lock.yaml`, photo specs, checklist/archive/lock.
**Gates:** BE tsc PASS; photo Jest 2 suites / 4 tests PASS; changed-photo ESLint PASS; full backend Jest 72 suites / 694 tests PASS with one unrelated pre-existing text-block-category failure; `git diff --check` PASS. `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-301.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-301-upload-variants-sharp.lock`
**Known:** TZ-PHOTO-302 переводит списки на thumb; TZ-PHOTO-303 обрабатывает старые original; UI/pickers/business logic/deploy не затронуты.

## [2026-08-08] — TZ-PRODUCTS-309 DONE: состав изделия в FullEditor через ProductBomPanel

**Исполнитель:** agent-3e757640b7 · WAVE-PRODUCT-EDITOR #2
**Статус:** DONE; deploy НЕ
**Что:** В edit FullEditor встроен тот же `ProductBomPanel`, что и на карточке изделия; composition API и единственный write-path переиспользованы без ModuleMaterials. Create mode показывает русскую подсказку «Сначала сохраните изделие — затем откройте редактирование, чтобы собрать состав», а панель ограничена scrollable viewport внутри диалога.
**Затронуто:** `frontend/src/app/pages/products/product-form-dialog.component.ts` и spec, `docs/pages/products.page.md`, checklist/archive/lock.
**Gates:** FE tsc PASS; Angular development build PASS; focused Jest form + BOM 32/32 PASS; targeted ESLint PASS; Prettier PASS для изменённых form-файлов; `git diff --check` PASS. `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-309.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-309-composition-in-fulleditor.lock`

## [2026-08-08] — TZ-PRODUCTS-308 DONE: FullEditor «Изделие» плотнее и понятнее

**Исполнитель:** agent-3e757640b7 · WAVE-PRODUCT-EDITOR #1
**Статус:** DONE; deploy НЕ
**Что:** Product FullEditor получил пользовательский канон «Изделие» без переименования `Product`/API, три responsive-колонки «Основные» / «Цена и учёт» / «Габариты и цвет», узкие controls для Д/Ш/В/ед./веса/RAL и полноширинные поля описания/фото. Старый hint про профиль L удалён; composition write-path не трогался и остаётся за TZ-PRODUCTS-309.
**Затронуто:** `frontend/src/app/pages/products/product-form-dialog.component.ts`, focused spec, `docs/pages/products.page.md`, checklist/archive/lock.
**Gates:** FE tsc PASS; Angular development build PASS; focused Jest 24/24 PASS; targeted ESLint PASS; Prettier PASS; `git diff --check` PASS. `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-308.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-308-izdelie-dense-fulleditor.lock`

## [2026-08-08] — TZ-UX-FORM-307 DONE: секции форм договоров и видов работ

**Исполнитель:** agent-e51db87918 · WAVE-SHOP-NORTH-B #7
**Статус:** DONE; deploy НЕ
**Что:** Плоские формы договора и вида работ переведены на общий `app-pi-form-section` в стиле материала: «Основные данные», «Позиции»/«Дополнительно». Organization FullEditor уже имел тот же примитив и kind-C 1120 после Party wave, поэтому не дублировался и не менялся. Control names, DTO/payload и бизнес-логика сохранены.
**Gates:** FE tsc PASS; Angular production build PASS (только существующие budget warnings); targeted ESLint PASS; Jest 132 suites / 1247 tests PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-307.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-307-form-sections.lock`
**Known:** глобальный `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries; вне frontend TZ. Wave Shop-north B закрыта, idle; deploy NO.

## [2026-08-08] — TZ-DESKTOP-SOT-301 DONE: canonical desktop/mcp source of truth

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #7)
**Статус:** DONE; deploy НЕ
**Что:** Разобран конфликт `desktop/mcp` vs `desktop/mcp-runtime`: единственным SoT
оставлен tracked `desktop/mcp`, на который уже указывает Desktop host. В root desktop
добавлены `mcp:typecheck`, `mcp:test`, `mcp:check`, а README/MCP/INSTALL явно фиксируют,
что runtime staging отсутствует и installer/sidecar — отдельный follow-up. Чужой
`mcp-runtime` из другого worktree не восстанавливался и не коммитился. По пути закрытия
починен stale Desktop shell check без изменения MCP tools.
**Затронуто:** `desktop/package.json`, `desktop/src/App.svelte`, `desktop/README.md`,
`desktop/docs/MCP.md`, `desktop/docs/INSTALL.md`, checklist, archive, lock.
**Gates:** `pnpm mcp:check` (typecheck + 69/69), desktop `pnpm typecheck`, `pnpm check`,
`pnpm build`, `git diff --check` — PASS. deploy NO.
**Archive:** `tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md`
**Lock:** `.mimocode/locks/TZ-DESKTOP-SOT-301-mcp-sot.lock`
**Known:** installer-sidecar packaging is intentionally not added; INN-301 remains PARKED.

## [2026-08-08] — TZ-ORG-ASSETS-302 DONE: реквизиты и vault-слоты в печатном pipeline

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #6)
**Статус:** DONE; deploy НЕ
**Что:** Существующий `DocumentTemplateService.build()` теперь принимает КП/счёт как
источник и каскадирует связанную stub-КП/контрагента для заказа. Организация-эмитент берётся
из шаблона, а registry получил поля `legalAddress`, `ogrnip`, банковские/подписантские
реквизиты и typed-vault aliases `logoUrl`/`sealUrl`/`signatureUrl`. На рендере assets[]
разворачиваются по роли; отсутствующий слот оставляет image/seal пустым, а signature —
канонический placeholder, без падения. Сгенерированный snapshot сохраняет sourceType
`quotation`/`invoice` вместе с прежними `order`/`contract`.
**Затронуто:** `backend/src/modules/document-template/*`, `generated-document/*`,
`template-block/*`, `registry/registry.service.ts`, FE registry/template types/services,
`backend/src/modules/document-template/document-template.assets.spec.ts`, docs pages,
checklist, archive, lock.
**Gates:** BE `pnpm typecheck`; focused document-template + generated-document Jest PASS;
FE `pnpm typecheck`; focused registry Jest PASS; targeted ESLint 0 errors;
`git diff --check` PASS; `verify-status.sh` retains disclosed pre-existing 72 legacy
kit-era drift. deploy NO.
**Archive:** `tasks/_archive/2026-08/TZ-ORG-ASSETS-302.done.md`
**Lock:** `.mimocode/locks/TZ-ORG-ASSETS-302-print-bind.lock`
**Known:** PDF engine intentionally not added; generated document stores HTML snapshot for
existing preview/print path. INN/DaData remains PARKED; desktop SOT is next wave slot.

## [2026-08-08] — TZ-ORG-ASSETS-301 DONE: типизированное хранилище logo/seal/signature

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #5)
**Статус:** DONE; deploy НЕ
**Что:** У организации был безымянный `photoIds[]`, который не отвечал на вопрос «что
печатать»: документу нужен именно логотип, именно печать и именно подпись. Добавлены слоты по
роли — `Organization.assets[]` (`role` ∈ `logo|seal|signature`, `photoId`, `storageUrl`,
mime/размер, `uploadedAt`/`uploadedBy`), `PUT /organizations/:id/assets/:role` (multipart
`file`) и `DELETE` того же адреса. Слот один на роль: повторная загрузка **заменяет** файл и
удаляет прежнее `Photo` (иначе диск обрастал бы мусором на каждой замене), истории версий нет
— она никому не нужна и путала бы «какая печать актуальна». Пустой слот на DELETE отвечает 404,
а не молчаливым успехом. **Печать меняет только admin** — и на upload, и на remove; менеджер
слот и превью видит, но вместо кнопок читает «Печать меняет только администратор» (отказ живёт
в сервисе, UI лишь не обманывает). Multer-конфиг вынесен в
`photos/image-upload.options.ts` и переиспользован — лимит 10 МБ и список mime не разъезжаются
с `POST /photos/upload`, а регистрация `Photo` даёт готовую уборку файла. Вместе с хранилищем
добавлен `legalAddress` (без адреса шапка документа неполная — дешевле сейчас, чем отдельной
миграцией). На фронте — секция «Файлы для документов» в Org FullEditor: три слота с превью,
«Загрузить/Заменить/Снять». Файлы пишутся сразу (в JSON-payload файл не положишь), поэтому
«Отмена» после работы с файлами всё равно возвращает обновлённую организацию — иначе список
показывал бы старое.
**Затронуто:** `backend/src/modules/organization/organization.schema.ts`,
`organization.service.ts` (+ spec), `organization.controller.ts`, `organization.module.ts`,
`dto/create-organization.dto.ts`, `backend/src/modules/photos/image-upload.options.ts` (новый),
`photos.module.ts`, `backend/test/e2e/organization-assets.e2e-spec.ts` (новый),
`frontend/src/app/shared/services/organizations.service.ts`,
`frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts` (+ spec),
`docs/pages/organizations.page.md`, `ARCHITECTURE.md`, checklist, lock.
**Gates:** BE `tsc --noEmit` чисто; BE unit organization 19/19; BE e2e
`organization-assets` 6/6 (замена не трогает соседний слот, seal manager → 403 / admin → 200,
повторный DELETE → 404, чужая организация → 404); FE `npm run typecheck` + `npm run build`
PASS; FE `pages/organizations` 20/20; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORG-ASSETS-301.done.md`
**Lock:** `.mimocode/locks/TZ-ORG-ASSETS-301-typed-vault.lock`
**Грабли/находки:** (1) `optimisticLockPlugin` вручную поднимает `__v`, поэтому любой
`doc.save()` с изменённым массивом падает `VersionError` — слоты пишутся `findOneAndUpdate`
(`$set`/`$pull`). Плагин чужой, чинить его — отдельная TZ. (2) Aggregation-pipeline update
Mongoose кастует по схеме и `$concatArrays` тихо превращался в пустой массив — запись уходила
«успешно» в никуда; поймано e2e-тестом, а не типами. (3) `catalog-314.archive.spec.ts` не
компилировался после TZ-COST-302 (6-й аргумент `ProductModuleService`) — весь `tsc` был
красный, поправлено двумя строками мока, чтобы гейт снова что-то значил.
**Известные ограничения:** привязка слотов к печати PDF — `TZ-ORG-ASSETS-302`; SVG принимается
как и раньше (общий mime-список), санитизации нет; `photoIds[]` у организации остался как
legacy-галерея; unit-фейл `text-block-category.service.spec.ts` (`resolveDefault` → system
«Общее») был до этой TZ и относится к зоне TZ-DOC-315 — не правил. deploy NO.

## [2026-08-08] — TZ-ORDERS-306 DONE: КП-заглушка из прямого заказа

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #4)
**Статус:** DONE; deploy НЕ
**Что:** Прямой заказ создаётся без КП, поэтому у него не было `quotationId` — и всё, что
просит ссылку на КП, для такого заказа было недостижимо. Добавлен
`POST /orders/:id/stub-proposal` → `OrderService.ensureStubProposal()`: черновик КП из позиций
заказа, `status: 'draft'`, `isStub: true`, `sourceOrderId` = заказ, связь двусторонняя
(`Order.quotationId` ↔ `Quotation.sourceOrderId`). Статус `converted` не используем: никакой
конвертации не было и цены никто не считал. Флаг `isStub` нужен, чтобы заглушка не выглядела в
списке КП как настоящее посчитанное предложение. Идемпотентность: у заказа с КП метод
возвращает существующее с `created: false` — два клика ≠ два КП; висячий `quotationId`
(КП удалили) пересоздаётся с warn в лог. Отказы явные и по-русски: отменённый заказ и заказ
без позиций (пустое КП бесполезно для документа). Организацию («кто выставляет») берём через
`OrganizationService.findCurrent` — JWT → `isOurCompany` → единственная (PARTY-301), а не
угадываем, иначе КП уехало бы от чужой фирмы. На карточке заказа — факт «КП»: «Нет — прямой
заказ» + кнопка «Создать черновик КП», либо «№QTN-… · черновик-заглушка» + ссылка.
**Затронуто:** `backend/src/modules/order/order.service.ts` (+ spec),
`order.controller.ts`, `order.module.ts`, `backend/src/modules/quotation/quotation.schema.ts`
(+`isStub`, +`sourceOrderId`), `backend/test/e2e/orders.e2e-spec.ts`,
`frontend/src/app/pages/orders/order-detail.page.ts` (+ spec), `orders.service.ts` (+ spec),
`docs/pages/orders.page.md`, checklist, lock.
**Gates:** BE tsc в зоне чисто; BE unit 71/71 (order 18); BE e2e orders 7/7 (новый кейс: два
вызова → один `quotationId`, заказ ссылается на КП); FE tsc + development build PASS;
FE pages/orders 21/21; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-306.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-306-stub-proposal.lock`
**Расширение CONFLICT KEYS:** `quotation.schema.ts` (2 поля), `order.module.ts`, e2e и unit
spec заказа. В `_active/` параллельных TZ нет — конфликта не было.
**Известные ограничения:** `BuildDocumentDto` по-прежнему без `quotationId` — заглушка делает
КП достижимым, но привязка КП к builder-документам это отдельное TZ; список КП пока не
фильтрует заглушки (флаг есть, UI-фильтра нет); supply/line-ready не тронуты; у Order нет
`organizationId`, tenant по-прежнему косвенный через контрагента. deploy NO.

## [2026-08-08] — TZ-PARTY-303 DONE: Counterparty FullEditor + CRUD со страницы

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #3)
**Статус:** DONE; deploy НЕ
**Что:** Страница «Заказчики» была read-only, поэтому клиент, созданный быстрым созданием
(имя + телефон + адрес, ИНН-заглушка), нельзя было довести до «годен для документа»: реальный
ИНН, КПП/ОГРН, банк, подписант не имели UI вообще. Добавлен FullEditor того же канона, что у
организации: `variant="content"` + `min(1120px, calc(100vw - 2rem))`, секции Основные /
Реквизиты / Банк / Подписант. На странице — «+ Создать» в tools, `app-pi-row-actions` (✎ / ×),
удаление через `AlertDialogComponent` (на сервере soft delete, заказы остаются).
Роли обязательны (их требует create DTO) и читаются из `/counterparty-roles`, чтобы
добавленная админом роль была выбираема; если справочник недоступен — fallback на посеянный
набор, иначе упавший GET блокировал бы сохранение. `organizationId` с клиента не уходит —
тенант штампует сервер после PARTY-301, на это есть тест. При правке заказчика с временным
ИНН в редакторе висит подсказка; сам флаг снимает сервер.
**Затронуто:** `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts`
(+ spec), `counterparties.page.ts` (+ spec),
`frontend/src/app/shared/services/pi-counterparty.service.ts` (`listRoles()`, `CounterpartyRole`),
`docs/pages/counterparties.page.md` (создан), `docs/pages/PAGE-TZ-INDEX.md`, checklist, lock.
**Gates:** FE tsc — в зоне чисто; Angular development build PASS; counterparty tests 18/18 PASS;
targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-303.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-303-counterparty-fulleditor.lock`
**Известные ограничения:** ИНН-lookup/DaData — `TZ-INN-301` PARKED; фото контрагента —
`ASSETS-301`; объекты (площадки) и карточка заказчика — `ORDERS-303`; список без поиска и
пагинации (limit 200), сортировки нет; `contactPersonId` без people-picker. Репо-уровневый
`tsc` по чужим spec-файлам красный до этой волны — не чинил. deploy NO.

## [2026-08-08] — TZ-PARTY-302 DONE: Organization FullEditor (kind C 1120)

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #2)
**Статус:** DONE; deploy НЕ
**Что:** Диалог организации показывал 7 полей из ~25, поэтому реквизиты, без которых не
сделать документ (банк, БИК, р/с, корр/с, ОГРН/ОГРНИП, подписант, паспорт ИП), из UI были
недостижимы. Сделан FullEditor по канону material/product: `variant="content"` +
`min(1120px, calc(100vw - 2rem))`, секции `app-pi-form-section` — Основные / Реквизиты /
Банк / Подписант / Паспорт ИП. Паспорт появляется **только** при `legalType = ip` и не
отправляется для ООО. Юридический тип — overflow-select (канон каталожного dropdown), не
native. «Наша фирма» и «Активна» — switch; в списке у названия бейдж «наша фирма».
Старый узкий диалог удалён: один write-path на организацию, а не «быстрый» и «полный» с
разной логикой. Payload не пишет пустые строки в реквизиты (API с `forbidNonWhitelisted`),
даты уходят ISO.
**Затронуто:** `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts`
(+ spec), `organizations.page.ts` (+ spec), `organization-form-dialog.component.ts` (удалён),
`frontend/src/app/shared/services/organizations.service.ts` (`findCurrent()`, паспорт/isOurCompany),
`docs/pages/organizations.page.md`, `docs/pages/PAGE-TZ-INDEX.md`, checklist, lock.
**Gates:** FE tsc PASS; Angular development build PASS (поймал `type="date"` вне `PiInputType`
— заменено нативным input); organizations 13/13 PASS; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-302.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-302-org-fulleditor.lock`
**Известные ограничения:** логотип/печать/фото — `TZ-ORG-ASSETS-301` (typed vault), в диалоге
`photoIds` не трогаем; `contactPersonId` пока без people-picker; ИНН-lookup — `TZ-INN-301` PARKED;
сортировка списка по-прежнему только по текущей странице. deploy NO.

## [2026-08-08] — TZ-PARTY-301 DONE: party hygiene (tenant · soft-delete · INN · stub badge)

**Исполнитель:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #1)
**Статус:** DONE; deploy НЕ
**Что:** Контрагенты и организации перестали быть дырой в multi-tenant. `organizationId`/`isSystem`
больше не читаются из body (mass-assign guard) — только из JWT, в т.ч. в quick-create. Чужой
Counterparty/Organization отдаёт **404**, а не 403 (IDOR закрыт), записи без `organizationId`
остаются общими legacy. `deletedAt` добавлен в обе схемы — до этого `remove()` писал поле, которого
нет в schema, и strict-mode молча его выкидывал: «удалённый» контрагент оставался в списке.
Глобальный unique на `Counterparty.inn` снят (первый tenant «занимал» ИНН реальной компании для
всех) — уникальность per-tenant через compound `{organizationId, inn}` sparse unique + миграция с
отчётом коллизий. Quick-created ИНН помечается `innIsStub`, на `/counterparties` бейдж «временный»
и счётчик в тулбаре; ручной ввод ИНН снимает флаг. Для документов появилась «наша фирма»:
`Organization.isOurCompany` + `GET /organizations/current` (JWT-org → флаг → единственная Org →
иначе 404 с подсказкой настроить, без угадывания).
**Затронуто:** `backend/src/modules/counterparty/*` (service/controller/schema/spec),
`backend/src/modules/organization/*` (service/controller/schema/dto + новый spec),
`backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts` (+ spec),
`frontend/src/app/pages/counterparties/counterparties.page.ts` (+ spec),
`frontend/src/app/shared/services/pi-counterparty.service.ts`, ARCHITECTURE.md, checklist, lock.
**Gates:** backend tsc PASS; backend jest 31/31 (counterparty, organization, migration) PASS;
targeted ESLint 0 errors; frontend tsc PASS; Angular development build PASS; counterparties.page 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-301.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-301-party-hygiene.lock`
**Известные ограничения:** `Organization.inn` остаётся глобально unique (Org = сам tenant,
single-org политика). Миграция запускается вручную (`npx ts-node backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts`),
не bootstrap-hook. FullEditor карточек — TZ-PARTY-302/303; undelete UI вне TZ. deploy NO.

## [2026-08-08] — TZD-30 DONE: MCP text-block drafts + category shelves

**Исполнитель:** agent-d782972d63 (Freebuff desktop executor)
**Статус:** DONE; deploy НЕ
**Что:** Desktop MCP получил list категорий/блоков, явное создание TextBlockCategory и create-draft: `categoryId` обязателен, имя `Черновик ИИ — …`, `isActive=false`, `ai-draft`, pre-check дублей, понятный 409 без overwrite. После создания создаётся todo со ссылкой `/doc-constructor/texts?editId=<id>`; ошибка todo возвращается как `todoError`. Поля `notes` нет.
**Затронуто:** `desktop/mcp/src/text-block-tools.ts`, `desktop/mcp/src/text-block-tools.test.ts`, `desktop/mcp/src/tools.ts`, `docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md`, checklist/status/active task.
**Gates:** MCP test 69/69 PASS; MCP tsc PASS; `git diff --check` PASS.
**Известные ограничения:** TextBlock без `organizationId`; idempotency-key и sync `mcp` → `mcp-runtime` остаются follow-up/packaging gate; deploy NO.

## [2026-08-08] — TZ-CATALOG-337 DONE: material-detail A+ shell

**Что:** `/materials/:id` получил sibling-каркас product/module: `PiPageChrome` crumbs, sticky left hero + FACT-304 passport + Photo/Price accordion, right where-used + stock. Populated photo cover/gallery и empty state; без `ProductBomPanel`, composition-tree, backend/API и ModuleMaterials.
**Gates:** FE tsc PASS; Angular development build PASS; material-detail 6/6 PASS; targeted ESLint/Prettier PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-337.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-337-material-detail-a-plus.lock`
**Known:** dimensions normalization — отдельный thin follow-up; substitute graph вне scope; desktop/orders/supply/products.page не трогались; deploy NO.

## [2026-08-08] — TZ-UX-FACT-304 DONE: material-detail passport FactStack

**Что:** material detail passport переведён с плотного `dl` на shared FactStack: идентификация, категория, единица, тип, профиль, стандарт, марка, вес, габариты; цена получила caption «Закупочная / учётная цена материала». Dimensions table, stock link и where-used сохранены; material adoption audit = ADOPTED.
**Gates:** FE tsc PASS; material-detail 6/6 PASS; targeted ESLint PASS; `git diff --check` PASS. Prettier check отмечен как line-ending-only mismatch: репозиторий CRLF, config требует LF.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-304-material-detail-factstack.lock`
**Known:** A+ chrome/layout — следующий `TZ-CATALOG-337`; dimensions-normalize utility не найден в materials-зоне и не включён. Desktop/orders/supply/products.page/composition не трогались; deploy NO.

## [2026-08-08] — TZ-UX-DIALOG-303 DONE: add-and-continue composition pickers

**Что:** composition picker `onAdded` — Add пишет строку и оставляет диалог; session list; BomPanel `applyCompositionLine`; toast «Добавлено»; docs канон.
**Gates:** FE tsc PASS; composition-picker + bom-panel 15/15; ESLint/Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-303-add-and-continue.lock`
**Known:** photo multi-add → DIALOG-304; FACT-303/orders/desktop/supply не трогались.

## [2026-08-08] — TZ-UX-FACT-303 DONE: order-detail FactStack

**Что:** order passport migrated to shared FactStack facts; materials selector remains in actions slot; order money stays absent.
**Gates:** FE tsc PASS; order-detail 4/4; targeted ESLint/Prettier + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-303-order-detail-factstack.lock`

## [2026-08-08] — TZ-SALES-302 DONE: immutable quotation versions

**Что:** atomic freeze with immutable embedded snapshots (lines, totals, family/template metadata, actor), version list/detail APIs, and proposals-page freeze/history UI.
**Gates:** BE tsc PASS; BE quotation 25/25; FE tsc PASS; FE proposals 16/16; targeted ESLint/Prettier + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-302.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-302-kp-send-versions.lock`
**Known:** email/PDF outbox remains later scope.

## [2026-08-08] — TZ-UI-TYPE-303 DONE: content label 13px (pi-label)

**Что:** `--text-label` + `.pi-label`; table th / fact / passport names off eyebrow; sort glyph text-xs; eyebrow = compact chrome only.
**Gates:** FE tsc PASS; jest fact-card+pi-table+module-detail 29/29.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-303.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-303-content-label.lock`
**Known:** FACT-303 shared fact-card key — label class only; Adoption section kept.

## [2026-08-08] — TZ-UI-COLOR-301 DONE: contrast light+dark P0/P1

**Что:** badge ink+gold-soft / success / paper-2; table selected fill; gantt zebra paper-2; surface dark; docs sync.
**Gates:** FE tsc PASS; jest badge+pi-table 40/40.
**Archive:** `tasks/_archive/2026-08/TZ-UI-COLOR-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-COLOR-301-contrast-light-dark.lock`
**Known:** PO eyeball `/modules/:id` + table light/dark; WAVE-UI-TYPE-COLOR complete.

## [2026-08-08] — TZ-UI-TYPE-302 DONE: type scale hotspots

**Что:** nav 11px; tree badge/depth/chevron on ERP ladder; fact mono text-sm; titles already aligned.
**Gates:** FE tsc PASS; jest 22/22 (tree/fact/nav/module-detail).
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-302.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-302-type-scale-hotspots.lock`
**Known:** order-detail title → successor; next COLOR-301.

## [2026-08-08] — TZ-UI-TYPE-301 DONE: ERP type scale canon

**Что:** CSS tokens `--text-micro`/`--text-title`; `.eyebrow`+`.pi-tech-label` = 11px; design-spec + foundations hint = Hanken/Inter/JetBrains + 5 roles.
**Gates:** FE tsc PASS; docs sync; «ERP type scale» marker in styles.css.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-301-type-scale-canon.lock`
**Known:** page hotspots → TYPE-302; contrast → COLOR-301.

## [2026-08-08] — TZ-ORDERS-305 DONE: soft materials source gate

**Что:** `materialsSource=own|customer` persists on Order; order detail selector + non-blocking own-materials warning when ready lines lack confirmed supply.
**Gates:** BE+FE tsc PASS; BE order 15/15; FE order 9/9; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-305.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-305-materials-source.lock`
**Known:** confirmed supply lookup is best-effort; exact stock remains INVENTORY-301.

## [2026-08-08] — TZ-ORDERS-304 DONE: line ready-for-work gate

**Что:** line-level `readyForWork` + audit metadata, validated toggle API, and order-detail control; ordinary line updates preserve readiness metadata.
**Gates:** BE+FE tsc PASS; BE order 14/14; FE order 9/9; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-304.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-304-line-ready.lock`
**Known:** readiness is available for order lines; module-specific persisted readiness remains a later refinement.

## [2026-08-08] — TZ-SUPPLY-302 DONE: BOM explode → SupplyTasks

**Что:** `POST /supply-tasks/explode` recursively expands order/module BOM, aggregates materials, creates idempotent draft tasks; `/supply` gets «Создать из заказа».
**Gates:** BE+FE tsc PASS; BE supply 7/7; FE supply 3/3; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SUPPLY-302.done.md`
**Lock:** `.mimocode/locks/TZ-SUPPLY-302-bom-explode-tasks.lock`
**Known:** no auto-confirm / PO creation; concurrent safety uses unique open-task index.

## [2026-08-08] — TZD-29 DONE: manager import todos (wave #7 — WAVE COMPLETE)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** BE `backend/src/modules/import-todo/**` (NEW) — `import_todos` schema (title/body?/href?/importTaskId?/templateId?/org?/createdByUserId/status open|done), REST POST/GET?status=/PATCH :id, RBAC admin|manager, org-scope как import-tasks; seed pages admin+manager. MCP `kppdf_import_todo_create|list|set_status` (tools.ts). FE thin page `/import-todos` (PiGroupWorkspace chrome, фильтры Все/Открытые/Выполненные, «Готово» PATCH done, href link, DatePipe); nav Документы «Задачи импорта»; docs page.md + PAGE-TZ-INDEX + MCP.md + FEATURE checklist + WAVE checkpoint DONE.
**Gates:** BE tsc PASS; jest import-todo 3/3; MCP test 62/62; MCP tsc PASS; FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-29.done.md`
**Lock:** `.mimocode/locks/TZD-29-manager-import-todos.lock`
**Known:** Deploy NO. **Волна desktop bulk-import ЗАКРЫТА (все 7 TZ на main). NEXT idle.**

## [2026-08-08] — TZD-28 DONE: doc-constructor MCP drafts (wave #6)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** NEW `desktop/mcp/src/doc-tools.ts` — `kppdf_doc_types_list`/`kppdf_doc_template_categories_list`/`kppdf_doc_templates_list` (GET) + `kppdf_doc_template_create_draft` (isActive=false, isDefault=false, notes `[AI-DRAFT]…`, **без** set-default); doc-draft protocol в MCP.md (→ id в todo TZD-29).
**Gates:** MCP tsc PASS; MCP test 60/60 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-28.done.md`
**Lock:** `.mimocode/locks/TZD-28-doc-constructor-mcp.lock`
**Known:** Deploy NO. Next TZD-29 (manager import todos).

## [2026-08-08] — TZD-27 DONE: journal product.create/update (wave #5)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** `MUTATION_KINDS` += product.create|product.update (propose→confirm→undo, org scope, **не** ProductService до confirm); MCP `kppdf_propose_product_create|_update`, `kppdf_validate_product`, domain schema product; `aiReport.rows[].entity` ветка в apply_plan (тот же batch); MCP.md product path protocol.
**Gates:** BE tsc PASS; jest journal+import-task 27/27; MCP test 58/58; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-27.done.md`
**Lock:** `.mimocode/locks/TZD-27-journal-product-writes.lock`
**Known:** Deploy NO. Next TZD-28 (doc-constructor MCP).

## [2026-08-08] — TZD-19 DONE: MCP product graph + integrity (wave #4)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** 5 graph read tools (composition/where_used: products/modules/materials) + `kppdf_run_integrity_suite` (read-only smoke, sample ids) + `kppdf_list_modules`; graph protocol в MCP.md перед product.update / mass material.update.
**Gates:** MCP tsc PASS; MCP test 51/51 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-19.done.md`
**Lock:** `.mimocode/locks/TZD-19-mcp-graph-integrity.lock`
**Known:** Deploy NO. Next TZD-27 (journal product.*).

## [2026-08-08] — TZD-18 DONE: batch propose/confirm + scaled ImportTask (wave #3)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** `POST /api/mutation-journal/propose-batch|confirm-batch|cancel-batch` (all-or-nothing + idempotencyKey); MCP `kppdf_propose_material_batch`/`confirm_batch`/`cancel_batch`; `apply_plan` чанками по 100; ImportTask cap 500→2000; inbox limit/offset.
**Gates:** BE tsc PASS; jest journal+import-task 22/22; MCP test 47/47; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-18.done.md`
**Lock:** `.mimocode/locks/TZD-18-mcp-batch-scale.lock`
**Known:** Deploy NO. Next TZD-19 (graph).

## [2026-08-08] — TZD-26 DONE: columns ready/unfit + AI reshape (wave #2)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** `kppdf_inbox_classify_columns` (canonical|unknown|conflict, mapping, sample) + `PATCH /api/import-tasks/:id/rows` (`kppdf_import_task_reshape`; только pre-apply; сброс aiReport → re-match; 0 journal); protocol Column ready/reshape в MCP.md; FEATURE checklist §E.
**Gates:** BE tsc PASS; jest import-task 12/12; MCP test 44/44; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-26.done.md`
**Lock:** `.mimocode/locks/TZD-26-column-ready-reshape.lock`
**Known:** Deploy NO. Next TZD-18 (batch).

## [2026-08-08] — TZD-23 DONE: AI matching + HITL plan → propose (wave #1)

**Исполнитель:** buffy-desktop-ex (Freebuff desktop executor)
**Статус:** DONE on main; deploy НЕ
**Что:** BE `PATCH /api/import-tasks/:id/report` (aiReport+awaiting_user; whitelist — rows intact) + `/proposals` (proposalIds+applying); MCP `kppdf_import_task_set_report` (0 journal) + `kppdf_import_task_apply_plan` (userOk gate; new/update→propose, skip/doubt—нет); MCP.md Variant C protocol; FEATURE checklist §E.
**Gates:** BE tsc PASS; jest import-task 10/10; MCP test 38/38; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-23.done.md`
**Lock:** `.mimocode/locks/TZD-23-ai-import-matching-hitl.lock`
**Known:** Deploy NO. Next TZD-26 (reshape).

## [2026-08-08] — TZ-UX-FACT-302 DONE: FactCard site adoption audit

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** docs-only adoption audit; successors FACT-303…306.
**Gates:** N/A (docs).
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-302-fact-card-site-audit.lock`
**Known:** Deploy NO. Wave complete · idle.

## [2026-08-08] — TZ-UX-DETAIL-304 DONE: module detail parity

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** passport FactCards; cost в аккордеоне с captions; shared BomPanel inspector.
**Gates:** FE tsc PASS; Jest module-detail 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-304-module-detail-parity.lock`
**Known:** Deploy NO. Next FACT-302.

## [2026-08-08] — TZ-UX-DETAIL-303 DONE: bom inspector FactCards

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** inspector FactStack; PiButton Edit/Open/Remove/Reload; FormDialog по kind.
**Gates:** FE tsc PASS; Jest product-bom-panel 5/5 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-303-bom-inspector-fact-cards.lock`
**Known:** Deploy NO. Next DETAIL-304.

## [2026-08-08] — TZ-UX-DETAIL-302 DONE: cost panel vertical + autorecalc

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** цены+captions; вертикальный журнал; auto-recalc 400ms на BomPanel.changed.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-302-cost-panel-vertical-autorecalc.lock`
**Known:** Deploy NO. Next DETAIL-303.

## [2026-08-08] — TZ-UX-DETAIL-301 DONE: product passport cleanup

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** убраны ₽-плитки из hero; dims/вес/RAL через FactCard; «В составе» meta.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-301-product-passport-cleanup.lock`
**Known:** Deploy NO. Next DETAIL-302.

## [2026-08-08] — TZ-UX-310 DONE: chrome drift audit

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** docs-only audit path→chrome PASS/FAIL; successors UX-313…315.
**Gates:** N/A (docs).
**Archive:** `tasks/_archive/2026-08/TZ-UX-310.done.md`
**Lock:** `.mimocode/locks/TZ-UX-310-design-system-chrome-audit.lock`
**Known:** Deploy NO. Phase B → DETAIL-301.

## [2026-08-08] — TZ-UX-309 DONE: page chrome unify

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** supply/shipping/design/documents → PiGroupWorkspace pathLabel+chips; docs/pages/ui-page-chrome.md.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-309.done.md`
**Lock:** `.mimocode/locks/TZ-UX-309-page-chrome-unify.lock`
**Known:** Deploy NO. Next UX-310.

## [2026-08-08] — TZ-CATALOG-DEDUP-304 DONE: detail edit opener

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** product/material detail «Редактировать» → тот же FullEditor/MaterialForm, что список; reload после close.
**Gates:** FE tsc PASS; Jest material-detail 6/6 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-304.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-304-detail-edit-opener.lock`
**Known:** Deploy NO. Next UX-309.

## [2026-08-08] — TZ-UX-FORM-306 DONE: Module QuickCreate L + BomPanel

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** module L после create остаётся открытым с ProductBomPanel rootKind=module; «Готово»; product L не сломан.
**Gates:** FE tsc PASS; Jest quick-create-dialog 14/14 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-306.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-306-module-quickcreate-L-bom.lock`
**Known:** Deploy NO. Next DEDUP-304.

## [2026-08-08] — TZ-CATALOG-DEDUP-303 DONE: delete orphan CompositionEditor

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** удалён unused CompositionEditor (+spec); composition-tree / BomPanel не трогали.
**Gates:** FE tsc PASS; Jest composition 15/15 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-303.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-303-delete-orphan-composition-editor.lock`
**Known:** Deploy NO. Next FORM-306.

## [2026-08-08] — TZ-CATALOG-DEDUP-302 DONE: retire ModuleMaterials dialog

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** убрана кнопка «Быстрое редактирование» с module-detail; удалён ModuleMaterialsFormDialog (+spec). Состав модуля = только BomPanel.
**Gates:** FE tsc PASS; Jest modules zone 9/9 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-302.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-302-retire-module-materials-dialog.lock`
**Known:** Deploy NO. Next DEDUP-303.

## [2026-08-08] — TZ-UX-FACT-301 DONE: PiFactCard + FactStack UI kit

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** shared `app-pi-fact-card` / `app-pi-fact-stack` (label·value·caption·actions; variants). Docs + jest. Product-detail **не** подключали.
**Gates:** FE tsc PASS; Jest fact-card 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-301-pi-fact-card.lock`
**Known:** Deploy NO. Wiring → DETAIL-301+.

## [2026-08-08] — TZ-UX-313 DONE: catalog detail smart back

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** `CatalogReturnStore` (previousUrl + Location.back/fallback); wire product/module/material detail; label «← Назад» при referrer; docs page-chrome § Возврат. Не трогали supply/desktop/PRODUCTS-307.
**Gates:** FE tsc PASS; Jest catalog-return + module-detail + material-detail 19/19 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-313.done.md`
**Lock:** `.mimocode/locks/TZ-UX-313-catalog-smart-back.lock`
**Known:** Deploy NO. Crumbs remain structural.

## [2026-08-08] — TZ-UX-312 DONE: composition-tree larger thumb + denser row

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** thumb `w-9 h-9` (36px); row `min-h-11 px-1.5 py-1 gap-1`; line-clamp-2 сохранён. Nest/BomPanel/QC/DEDUP не трогали.
**Gates:** FE tsc PASS; Jest composition-tree 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-312.done.md`
**Lock:** `.mimocode/locks/TZ-UX-312-composition-tree-thumb-density.lock`
**Known:** Deploy NO.

## [2026-08-08] — TZ-CATALOG-DEDUP-301 DONE: strip composition from Product FullEditor

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** FullEditor = паспорт/фото/RAL; BOM UI и composition sync удалены; hint на карточку / QuickCreate L. BomPanel и QC не тронуты.
**Gates:** FE tsc PASS; Jest product-form-dialog 22/22 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-301.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-301-strip-fulleditor-composition.lock`
**Known:** Deploy NO. Next DEDUP-302.

## [2026-08-08] — TZ-UX-311 DONE: composition-tree thumb + name wrap

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** `TreeNode.photoUrl` в catalog-graph (main/first Photo.storageUrl); в `app-composition-tree` мини-thumb после бейджа + Lucide placeholder; имя `line-clamp-2`/`break-words` вместо `truncate`. Docs §11. Не трогали QuickCreate/chrome/deploy.
**Gates:** FE tsc PASS; BE tsc PASS; Jest composition-tree 7/7 + catalog-graph 13/13 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-311.done.md`
**Lock:** `.mimocode/locks/TZ-UX-311-composition-tree-thumb-wrap.lock`
**Known:** Deploy NO. Org-scope jest expectations aligned with intentional global module parents.

## [2026-08-08] — TZ-GIT-301 DONE: merge FORM-302…305 → main

**Исполнитель:** agent-3e757640b7 (Cursor executor)
**Статус:** DONE on main; deploy НЕ
**Что:** FORM wave `7bc88e17…e485f521` landed on main as merge commit `c4f4d830` (parents `b4146581` + `e485f521`). NAV-302 IA preserved (`b3f6948b` ancestor). Closeout: archive/lock/checklist; backlog stub GIT-301 removed; FORM-304/305 locks restored.
**Gates:** FE tsc PASS; Jest quick-create + photo-dropzone + material-form-dialog 3/3 suites, 55/55 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-GIT-301.done.md`
**Lock:** `.mimocode/locks/TZ-GIT-301-merge-form-wave-to-main.lock`
**Known:** Deploy NO. Unrelated desktop/chrome WIP was stashed as `wip-before-TZ-GIT-301`.

## [2026-08-08] — TZ-UX-FORM-305 DONE: form-dialog sections sweep Wave A

**Исполнитель:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**Статус:** DONE on main; deploy НЕ
**Что:** Wave A form-dialogs получили общий `PiFormSection`: Product, Module, color/category/document/text categories, Order, Proposal, People, Warehouse и Stock Movement. Payload/API/FormControl/business logic не изменялись; outliers вынесены в audit.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 5 suites / 58 tests PASS; scoped ESLint PASS with one pre-existing order raw-HttpClient warning; scoped Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-305.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-305-dialog-sections-sweep.lock`
**Known:** Wave B deferred and listed in `docs/audits/2026-08-08-dialog-layout-canon.md`; Material remains canon reference. Deploy: NO.

## [2026-08-08] — TZ-UX-FORM-304 DONE: QuickCreate L composition reuse

**Исполнитель:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**Статус:** DONE on main; deploy НЕ
**Что:** Product QuickCreate L после create остаётся в том же окне с живым `productId`; секция «Состав» напрямую переиспользует `ProductBomPanel`, включая picker/actions; «Готово» закрывает, пустой BOM допустим; max-width состава ограничен `min(1100px, 100vw - 2rem)`.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest QuickCreate + BOM 18/18 PASS; scoped ESLint/Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-304-quickcreate-L-composition.lock`
**Known:** Module L remains product-only and closes after create; extending that flow was outside the required Product L path. Deploy: NO.

## [2026-08-08] — TZ-UX-FORM-303 DONE: QuickCreate L photo dropzone

**Исполнитель:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**Статус:** DONE on main; deploy НЕ
**Что:** Добавлен shared `app-pi-photo-dropzone` с drag/drop, picker, preview/remove и PhotosService upload. Product QuickCreate L показывает фото в секции «Дополнительно» и передаёт `photoIds` в create; новые upload IDs чистятся при cancel/destroy.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 2 suites / 14 tests PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-303-quickcreate-L-photo.lock`
**Known:** FullEditor migration deferred because its Layer-3 file is outside the minimal AC path; module photos remain out of scope. Deploy: NO.

## [2026-08-08] — TZ-UX-FORM-302 DONE: Shared form sections for Material and QuickCreate

**Исполнитель:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**Статус:** DONE on main; deploy НЕ
**Что:** Добавлен shared `app-pi-form-section`; Material dialog переведён на него; QuickCreate M/L получил секции «Основные данные / Габариты / Дополнительно» с пустыми группами hidden. FORM-301 capacity/packing сохранён.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 2 suites / 49 tests PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-302-form-sections-canon-quickcreate.lock`
**Known:** FORM-303 photo, FORM-304 BOM, FORM-305 sweep не затрагивались. Deploy: NO.

## [2026-08-08] — TZ-NAV-302 DONE: people→Клиенты, work-types→Цех, chips

- Menu + yellow highlight: `/people` under Клиенты; `/work-types` under Цех
- Section chips: Клиенты / Цех / Сделки (PiGroupWorkspace reuse)
- Orders: «+ Создать заказ» + empty hint; deals chip path from КП
- Gates: jest `app-layout.nav-order` + frontend tsc PASS; Deploy NO

**Archive:** `tasks/_archive/2026-08/TZ-NAV-302.done.md`  
**Lock:** `.mimocode/locks/TZ-NAV-302-ia-people-worktypes-chips.lock`

## [2026-08-08] — TZ-UX-308 DONE: Nav «Справ.» yellow on /categories

**Исполнитель:** agent-3e757640b7 (self PASS → archive; PO CLAIM)
**Статус:** DONE on main; deploy НЕ
**Что:** reference `entryPath`+item → `/categories`; `activeAliases` classification/appearance/documents-ref; `matchActiveCategoryId()` + jest; docs-ref leaf дубль убран (alias → doc-template-categories).
**Gates:** FE tsc PASS; jest app-layout.nav-order 4/4
**Archive:** `tasks/_archive/2026-08/TZ-UX-308-nav-reference-active-highlight.done.md`
**Lock:** `.mimocode/locks/TZ-UX-308-nav-reference-active-highlight.lock`
**Known:** dialogs/QuickCreate/admin/deploy не трогали. Deploy: NO.

## [2026-08-08] — TZ-UX-FORM-301 DONE: QuickCreate field capacity packing

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** `field-capacity.ts` (nano…full → 12-col spans); QuickCreate M/L `md:grid-cols-12` + `gap-x-3 gap-y-2`; габариты+вес одна nano-лента (`col-start-1`); textarea rows=2 + min-h-0; controls sm; DIALOG-302 width не откатывали.
**Gates:** FE tsc PASS; jest quick-create 8/8; browser AC product L — overflowPx=0, contentH 464 < ~504 budget @720p, dimSameRow=true
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-301-quickcreate-field-capacity.lock`
**Known:** FullEditor capacity → FORM-303 successor. Deploy: NO.

## [2026-08-08] — TZ-UX-307 DONE: nav shortLabel + compact height

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** header h-14 / кнопки h-10; shortLabel (Проект/Снабж./Цех/Докум./Справ.…); полный RU в aria/title; equal-width от коротких; порядок 304 сохранён.
**Gates:** FE tsc PASS; jest app-layout.nav-order 2/2
**Archive:** `tasks/_archive/2026-08/TZ-UX-307-nav-shorter-labels-compact-height.done.md`
**Lock:** `.mimocode/locks/TZ-UX-307-nav-shorter-labels-compact-height.lock`
**Known:** PO CLAIM как «306» → канон **307** (306 = people-route). admin/dialogs/deploy не трогали. Deploy: NO.

## [2026-08-08] — TZ-UX-DIALOG-302 DONE: QuickCreate balanced + dialog canon

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** SIZE_TO_WIDTH S/M/L→md/lg/xl (~920); M/L 2-col; body max-h~70vh; openers без width:md; cookbook kinds A–D + ui-dialog-canon + outliers table.
**Gates:** FE tsc PASS; jest quick-create 7/7
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-302-quickcreate-balanced-panels.lock`
**Known:** FullEditor legacy→kind C не в scope. Deploy: NO.

## [2026-08-08] — TZ-UX-305 DONE: nav equal width + full RU labels

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** полные RU подписи под иконкой; колонки одной ширины (grid auto-cols-fr от longest); shortLabel убран; dropdown compact = host contents; caption 9px→10px @1280+.
**Gates:** FE tsc PASS (peer admin WIP isolated); jest app-layout.nav-order 2/2
**Archive:** `tasks/_archive/2026-08/TZ-UX-305-nav-equal-width.done.md`
**Lock:** `.mimocode/locks/TZ-UX-305-nav-equal-width-full-labels.lock`
**Known:** admin/** не трогали. Deploy: NO.

## [2026-08-08] — TZ-ADMIN-302 DONE: system role all-checked read-only

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** «Смотреть» системной роли — полный каталог pageKeys+capabilities ✓ disabled; баннер «Системная · нельзя изменить (полный доступ)»; кастом/несистемные Edit без изменений.
**Gates:** FE tsc PASS; jest role-form+roles-admin+permission-labels 30/30
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-302.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-302-system-role-checked-readonly.lock`
**Known:** peer users-admin/chrome WIP не staged. Deploy: NO. app-layout не трогали.

## [2026-08-08] — TZ-UX-304 DONE: nav icon+caption + Dictionaries after Docs

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** топ-nav rect + иконка сверху + подпись снизу; порядок Каталог…Документы → Справочники → Админ; shortLabel для длинных; dropdown compact тот же язык.
**Gates:** FE tsc PASS; jest app-layout.nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-UX-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-304-nav-icon-caption-and-order.lock`
**Known:** admin/** не трогали. Deploy: NO.

## [2026-08-08] — TZ-ADMIN-301 DONE: roles permissions UX + pageKey ACL

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** системные роли — RU badge + Смотреть (read-only); кастом — матрица разделов меню (pages) + capabilities; API pages; PAGE_KEYS + text-block-categories; RU labels.
**Gates:** FE+BE tsc PASS; fe admin jest 56; be admin jest 23
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-301.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-301-roles-permissions-ux.lock`
**Known:** peer chrome WIP / users-admin dirty не staged. Deploy: NO.

## [2026-08-08] — TZ-UX-301 DONE: compact icon top nav

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** топ-nav icon-first + tooltip/aria; active wash+border; Десктоп/Выйти icon-only; user truncate md+; dropdown compact input.
**Gates:** FE tsc PASS; jest app-layout.nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-UX-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-301-compact-icon-top-nav.lock`
**Known:** mobile hamburger out of P0. Admin/production не трогали. Deploy: NO.

## [2026-08-08] — TZ-DICT-316 DONE: QuickCreate wire products/modules

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** `QuickCreateDialog` (S/M/L profiles, LockedRequired); «Создать» на `/products`+`/modules`; edit → FullEditor.
**Gates:** FE tsc PASS; jest quick-create 6/6 (+ form-profiles 13 green)
**Archive:** `tasks/_archive/2026-08/TZ-DICT-316.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-316-quick-create-wire.lock`
**Known:** module notes UI-only (BE upsert без notes, как FullEditor). Deploy: NO.

## [2026-08-08] — TZ-DICT-315 DONE: form profiles settings UI

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** `/dictionaries/form-profiles` — entity overflow-select, S|M|L, checkbox matrix, LockedRequired locked; PUT API; nav+route; docs.
**Gates:** FE tsc PASS; jest form-profiles service+page 13/13
**Archive:** `tasks/_archive/2026-08/TZ-DICT-315.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-315-form-profiles-settings-ui.lock`
**Known:** QuickCreate wire → DICT-316. Peer dirty dict pages не трогали. Deploy: NO.

## [2026-08-08] — TZ-SALES-303 DONE: KP family schema + thin API (D21 L1)

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что:** `familyRole`/`masterId`/`familyVersion`/`orgMarkupPercent` + attach/sync/GET family; convert variant → 400; FE skip; stub 304 READY.
**Gates:** BE tsc PASS; jest quotation 21/21 PASS
**Archive:** `tasks/_archive/2026-08/TZ-SALES-303.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-303-kp-family-schema.lock`
**Known:** UI семья → TZ-SALES-304. Deploy: NO.

## [2026-08-08] — TZ-SUPPLY-301 DONE: SupplyTask + confirm + /supply UI

**Что:** скелет снабжения (D9/D18): schema/API confirm audit; `/supply` таблица + manual create; не stub.
**Gates:** BE+FE tsc PASS; jest BE 6 + FE 2 PASS; eslint supply PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SUPPLY-301.done.md`
**Known:** BOM auto → SUPPLY-302. Deploy: NO.

## [2026-08-08] — TZ-NAV-301 DONE: lifecycle menu L→R + stubs

**Исполнитель:** cursor-composer-nav301 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** топ-меню поток L→R; Люди→Производство; Организации→Админ; stubs Клиенты/Проектирование/Снабжение/Отгрузка; PAGE_KEYS seed.
**Gates:** FE+BE tsc PASS; jest nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-NAV-301.done.md`
**Lock:** `.mimocode/locks/TZ-NAV-301-lifecycle-menu-stubs.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] — TZ-ORDERS-303 DONE: заказчик+объект+owner линии

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** Site API; order.siteId; quick-create CP+Site; line ownerUserId + plannedShipDate; convert/activate default site; FE form+detail.
**Gates:** BE+FE tsc PASS; BE unit zone 36; FE orders/site 12
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-303.done.md`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] — TZ-ORDERS-302 DONE: order detail live composition-tree

**Исполнитель:** agent-3e757640b7 (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** `/orders/:id` chrome «Заказ №…»; корни = линии; live `getProductTree`; тот же `app-composition-tree`; без прайса КП; empty/404 warn.
**Gates:** FE tsc PASS; jest order-detail+orders.page 10/10
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-302.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-302-order-detail-composition-tree.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] — TZ-DICT-314 DONE: form profiles BE API (S/M/L)

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** FormProfile schema + unique org/entity/size; GET list/one + PUT; seed defaults audit §4; LockedRequired 400; jest 12/12.
**Gates:** BE tsc PASS; jest form-profiles 12/12
**Archive:** `tasks/_archive/2026-08/TZ-DICT-314.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-314-form-profiles-api.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] — TZ-COST-305 DONE: product-line в CostCalculation

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** bucket productLines; override×qty иначе child.costPrice×qty (+infos); overhead без product-line; picker «Цена в составе» + prefill; BOM inspector hint.
**Gates:** BE tsc PASS; jest cost-calculation 10/10; FE tsc PASS; jest picker+bom 12/12
**Archive:** `tasks/_archive/2026-08/TZ-COST-305.done.md`
**Lock:** `.mimocode/locks/TZ-COST-305-product-line-in-cost.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] — TZD-21 DONE: desktop pairing keys (TTL/multi/revoke)

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ
**Что сделано кратко:** Opaque `kppd_…` keys; API issue/list/revoke; dual Bearer in JwtAuthGuard; FE dialog; expiresAt null; docs.
**Gates:** BE tsc + jest 6/6; FE tsc + pairing 4/4; desktop tsc
**Archive:** `tasks/_archive/2026-08/TZD-21.done.md`
**Cursor Verdict:** PASS

## [2026-08-08] — TZ-DICT-313 DONE: quick-create form profiles audit

**Исполнитель:** continuous-executor-composer (docs PASS → archive)
**Статус:** DONE on main; deploy НЕ; product code NOT TOUCHED
**Что сделано кратко:** D1–D8; FieldKey P0 product+module; drafts 314–316; IA Справочники ≠ appearance.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-313.done.md`
**Audit:** `docs/audits/2026-08-09-quick-create-form-profiles.md`
**Cursor Verdict:** PASS

## [2026-08-08] — TZ-CATALOG-335 DONE: composition-tree dark depth

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Dark nest ladder 12/22/34/46% + rule chroma + inset; light 334 без регрессии; без kind-wash.
**Gates:** frontend tsc PASS; Jest composition-tree 5/5 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-335.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-335-composition-tree-dark-depth.lock`
**Cursor Verdict:** PASS

## [2026-08-08] — TZ-CATALOG-336 DONE: module detail = product A+ layout

**Исполнитель:** continuous-executor-composer (self PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** `/modules/:id` split A+ (паспорт+фото+cost-preview слева; BOM справа). `ProductBomPanel.rootKind=module`; без product-линий; legacy showcase убран.
**Gates:** frontend tsc PASS; Jest module-detail|product-bom-panel 8/8 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-336.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-336-module-detail-parity.lock`
**Cursor Verdict:** PASS

## [2026-08-08] — TZD-24 DONE: Desktop installer ZIP + SPA skip /downloads

**Что сделано:** default кнопка → `.zip`; Nest не отдаёт SPA на `/downloads/*`;
publish-installer + deploy.py кладут zip рядом с exe.
**Archive:** `tasks/_archive/2026-08/TZD-24.done.md`
**Lock:** `.mimocode/locks/TZD-24-desktop-installer-zip-download.lock`
**Gates:** BE+FE tsc PASS; Jest download/pairing 14/14; smoke zip 200 / missing 404
**Deploy:** NO
**Commit:** `1ae611e`

## [2026-08-08] — TZD-22 DONE: AI Import Task (assembly point)
**Исполнитель:** cursor-composer-tzd22 (Cursor PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** ImportTask BE `/api/import-tasks` + Desktop «Создать задачу для ИИ» + MCP `kppdf_import_task_*`. Create → `ready_for_ai`, 0 journal proposals. Propose path сохранён. Matching → TZD-23 (только по PO).
**Gates:** backend tsc PASS; jest import-task 6/6 PASS; desktop/mcp test 33/33 PASS; desktop typecheck PASS
**Archive:** `tasks/_archive/2026-08/TZD-22.done.md`
**Lock:** `.mimocode/locks/TZD-22-ai-import-task.lock`
**Commit:** `e64e81fca6514e0ad2ad9ae6a9b9a8820a7d8871`
**Cursor Verdict:** PASS
**Known limits:** no matching/chat; no web UI task list; TZD-23 park until PO

---

## [2026-08-08] — TZ-COST-303 DONE: cost visibility UI (lists + BOM)
**Исполнитель:** cursor-composer-cost303 (Cursor PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Модули list «Себест.»→«см. карточку»; изделия list/detail/grid `costPrice` рядом с Прайс; BOM inspector вклад строки (мат×qty / preview×qty). Не ручная цена модуля; не desktop/TZD.
**Gates:** frontend tsc PASS; Jest products + bom-panel + modules PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-303.done.md`
**Lock:** `.mimocode/locks/TZ-COST-303-cost-visibility-ui.lock`
**Commit:** `cec4804`
**Cursor Verdict:** PASS

---

## [2026-08-08] — TZ-CATALOG-334 DONE: composition nest visual cohesion
**Исполнитель:** cursor-composer-catalog334 (Cursor PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Усилен визуал `.comp-tree__nest`: sibling gap, left rail 3px kind, stronger wash, indent детей. Expand/клик без изменений. Не Excel.
**Gates:** frontend tsc PASS; Jest composition-tree 3/3 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-334.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-334-composition-block-cohesion.lock`
**Commit:** `0f90243`
**Cursor Verdict:** PASS

---

## [2026-08-08] — TZ-CATALOG-333 DONE: composition containment nest
**Исполнитель:** agent-3e757640b7 (Cursor PASS → archive)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Раскрытые узлы `app-composition-tree` оборачивают детей в `.comp-tree__nest` (hairline + wash kind родителя); module-in-module = рамка в рамке; на BOM — компактная легенда kind через `catalogKindOklch`. Клик по строке сохранён. Не Excel-колонки, не COST/desktop.
**Gates:** frontend tsc PASS; Jest composition-tree + bom-panel + composition-editor 3/9 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-333.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-333-composition-containment.lock`
**Commit:** `f2aedfdbec37c4ab16d733643085153f21fb6c6a`
**Cursor Verdict:** PASS

---

## [2026-08-08] — TZ-CATALOG-332 READY CLOSEOUT
**Исполнитель:** Buffy / agent-3e757640b7 (Cursor PASS)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Общий тонкий kind-marker подключён к спискам Products/Modules/Materials и вкладкам composition picker; `PiOverflowSelect` и `materialKind`-контракт сохранены. RAL, Gantt, BOM, desktop, COST и TZ-333 не затрагивались.
**Gates:** frontend tsc PASS; related Jest 5 suites / 33 tests PASS; scoped ESLint PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-332.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-332-kind-colors.lock`
**Commits:** implementation `23c47b0c564bfba55cff9619818fb54b63d32239`; closeout `06d74f7e9423d6c879d5bafc2ea4bc8ea62e2565`

---

## [2026-08-08] — TZ-COST-303 DONE: Cost visibility UI (lists + BOM)

**Что сделано:** колонка Себест. в модулях (hint «см. карточку»); Прайс+Себест. в изделиях;
BOM inspector — вклад строки material/module read-only.
**Archive:** `tasks/_archive/2026-08/TZ-COST-303.done.md`
**Lock:** `.mimocode/locks/TZ-COST-303-cost-visibility-ui.lock`
**Gates:** FE tsc PASS; bom-panel jest 4/4 PASS; Cursor PASS; deploy NO.

## [2026-08-08] — TZ-COST-302 DONE: Recursive cost rollup + costPrice sync
**Исполнитель:** cursor-composer-cost302 (Cursor PASS → archive)
**Статус:** DONE on main
**Что сделано кратко:** Рекурсивный rollup nested module×qty; cycle→infos; activate→Product.costPrice; overhead A (materials only); GET /modules/:id/cost-preview; FE module-detail read-only «Себестоимость (расчёт)».
**Gates:** backend tsc PASS; frontend tsc PASS; jest cost-calculation + product-module 14/14 PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-302.done.md`
**Lock:** `.mimocode/locks/TZ-COST-302-recursive-cost-rollup.lock`
**Commit:** `96761553fc2f2dfc643c66c61bdede539fd3b183`
**Known limits:** COST-303 только по PO; product→product lines PARK; deploy NO

---

## [2026-08-08] — TZ-COST-301 DONE: WorkType hourlyRate required
**Исполнитель:** cursor-composer-cost301 (Cursor PASS → archive)
**Статус:** DONE on main
**Что сделано кратко:** `hourlyRate` обязателен в create/update DTO и FE-форме; колонка «₽/час»; boot backfill missing→0; Виды работ остаются в Каталоге.
**Gates:** backend tsc PASS; frontend tsc PASS; jest work-type.service 8/8 PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-301.done.md`
**Lock:** `.mimocode/locks/TZ-COST-301-work-type-hourly-rate-required.lock`
**Commit:** `79edbea3c4c7957cb8ce7973f9acb1a29e2ca1a6`
**Known limits:** `0` разрешён; COST-302 только по PO; CostCalculation не трогали

---

## [2026-08-08] — TZ-CATALOG-331 DONE: catalog appearance settings
**Исполнитель:** Buffy / canonical executor (`agent-3e757640b7`)
**Статус:** DONE on main; deploy НЕ выполнялся
**Что сделано кратко:** Добавлен admin-only `/catalog/appearance` с preset hue для изделия/модуля/материала/сырья; сохранение organization-scoped через существующий settings API (`catalog.appearance.<organizationId>`), global/code defaults fallback; reactive palette подключена к CompositionTree и BOM inspector; RAL и Gantt не затрагивались.
**Gates:** frontend/backend tsc PASS; targeted Jest FE 3 suites / 6 tests PASS; backend setting Jest 2 tests PASS; scoped ESLint без `--fix` PASS; Angular dev build PASS с pre-existing NG8113 в DocumentsPage; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-331.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-331-catalog-appearance.lock`
**Known limits:** browser authenticated-admin smoke save/reload + light/dark остаётся перед финальным deploy-readiness.

---

## [2026-08-08] — TZD-20 DONE: MCP client JSON copy (Cursor / LM Studio)
**Исполнитель:** cursor-composer-tzd20 (Cursor PASS → archive)
**Статус:** DONE on main
**Что сделано кратко:** `buildMcpClientSnippet` full+fragment; кнопки «Скопировать mcp.json» / «Только фрагмент» в Desktop; docs connect; clipboard only (не пишет в чужие mcp.json). GET /mcp 405 уже был sync.
**Gates:** desktop typecheck PASS; svelte-check PASS; snippet tests 4/4 PASS
**Archive:** `tasks/_archive/2026-08/TZD-20.done.md`
**Lock:** `.mimocode/locks/TZD-20-mcp-client-json-copy.lock`
**Commit:** `f3ca1007947e2e727af4f24a05ac4f8ace71aade`
**Known limits:** JWT ~15m; disk write mcp.json — successor; `package.json` test script left unstaged (run via mcp tsx)

---

## [2026-08-08] — TZ-OPS-301 DONE: Quiet local boot logs (Nest DI + proxy race)
**Исполнитель:** cursor-composer-ops301 (Cursor PASS → archive)
**Статус:** DONE on main
**Что сделано кратко:** QuietNestLogger глушит Nest DI INFO; `start.mjs` не печатает vite proxy ECONNREFUSED до backend ready; `.env.example` LOG_LEVEL=info. TZ-248 WARN сохранён.
**Gates:** backend tsc PASS; `node --check start.mjs` PASS; jest quiet-nest-logger 5/5 PASS
**Archive:** `tasks/_archive/2026-08/TZ-OPS-301.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-301-quiet-dev-boot-logs.lock`
**Commit:** `f12c2d8e227f3c38aa97775b96f10192684dbe54`
**Known limits:** HTTP pino-http access logs вне scope; cold-start evidence optional

---

## [2026-08-08] — TZD-17 DONE: MCP semantic domain layer (schema + validate + inbox audit)
**Исполнитель:** cursor-composer-tzd17 (Cursor PASS → archive)
**Статус:** DONE on main
**Что сделано кратко:** `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material`, `kppdf_inbox_audit_file` + propose `mode=validate`. Validate/audit не создают proposal и не пишут SoT.
**Gates:** `desktop/mcp` typecheck PASS; tests 31/31 PASS
**Archive:** `tasks/_archive/2026-08/TZD-17.done.md`
**Lock:** `.mimocode/locks/TZD-17-mcp-semantic-domain-layer.lock`
**Commit:** `e88667f`
**Known limits:** TZD-18/19 PARK до команды PO; encoding WIP в `inbox.ts` не в коммите

---

## [2026-08-07] — TZ-CATALOG-330 DONE: kind colors on composition tree
**Исполнитель:** Cursor (session catalog colors wave)
**Статус:** DONE on main
**Что сделано кратко:** `catalogKindOklch` defaults (product/module/material/raw); wash+border+бейдж на `composition-tree`; точка kind в BOM inspector. Persist UI → 331.
**Gates:** Jest catalog-kind-oklch + bom-panel + composition-editor PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-330.done.md`
**Known limits:** цвета только из кода; экран «Оформление» — TZ-331

---

## [2026-08-07] — TZ-PRODUCTION-303.1b DONE: land Gantt hotfix + orders ?q= deep-link on main
**Исполнитель:** Buffy / canonical executor (`agent-3e757640b7`)
**Статус:** DONE on `main`; deep-link landed, Gantt hotfix preserved from `cde23a5`, deploy НЕ выполнялся
**Что сделано кратко:** В main подтверждены Gantt hotfix (rail↔bars filter sync, WorkType.days confirm+rollback, bar context, legend/palette, toolbar, ACL UX) и deep-link `/orders?q=<номер>` через `OrdersPage` search state. Catalog polish из базы сохранён; `products/**` этой задачей не менялся. Дублированная компактная ссылка в inspector удалена, оставлена одна полная ссылка.
**Gates:** frontend tsc PASS; targeted Jest 4 suites / 23 tests PASS; scoped ESLint без `--fix` PASS; Angular development build PASS с pre-existing NG8113 warning в DocumentsPage; `git diff --check` PASS.
**Commits:** `cde23a5` base Gantt hotfix + catalog preservation; `c622db5` deep-link landing; `c6e2a29` prior closeout evidence; final landing closeout commit recorded in checklist.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.1b-land-hotfix-main.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303.1b-land-hotfix-main.lock`
**Known limits:** producer-side inspector unit spec and ProductionCockpitPage rail↔bars integration spec remain follow-up hardening; browser/PO smoke remains.

---

## [2026-08-07] — TZ-PRODUCTION-303.1 DONE: Gantt closeout + orders ?q= deep-link
**Исполнитель:** Buffy / Freebuff executor (`agent-d4d9f3dbfd`)
**Статус:** DONE; Gantt hotfix history already on main, deep-link wired and documented
**Что сделано кратко:** OrdersPage читает `ActivatedRoute.queryParamMap.q` и прокидывает значение в существующий search state; удаление `q` очищает фильтр. Inspector получил явную ссылку `/orders?q=<номер>`. Production page docs синхронизированы.
**Gates:** FE tsc PASS; targeted Jest 4 suites / 20 tests PASS; scoped ESLint без `--fix` PASS; `git diff --check` PASS; development build PASS с pre-existing NG8113 warning в DocumentsPage. Scoped Prettier check выявил pre-existing formatting drift в трёх затронутых больших TS-файлах и не использовался как success gate.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.lock`
**Commit:** `f731957` implementation closeout; metadata finalized in the follow-up documentation commit; deploy НЕ выполнялся.
**Known limits:** handoff-referenced `docs/audits/2026-08-06-production-gantt-verdict-response.md` отсутствует на branch; producer-side inspector unit spec не добавлялся, так как отдельный spec path не входит в CONFLICT KEYS.

---

## [2026-08-06] — TZD-16 DONE: Pairing installer download
**Исполнитель:** Buffy (desktop/MCP executor)
**Статус:** DONE on main; Tauri build soft-waived
**Что сделано кратко:** Кнопка «Скачать приложение» в pairing dialog; `DESKTOP_DOWNLOAD_URL` с default/explicit-empty semantics; Jest, deploy runtime injection, static `/downloads/` docs; installer binaries не коммитились.
**Gates:** FE Jest 2 suites / 14 tests PASS; FE tsc/ESLint/Prettier PASS; desktop typecheck/svelte-check PASS; `pnpm tauri build` SOFT WAIVE — отсутствует pre-existing `desktop/src-tauri/icons/icon.ico`.
**Archive:** `tasks/_archive/2026-08/TZD-16.done.md`
**Lock:** `.mimocode/locks/TZD-16-pairing-download-installer.lock`
**Commits:** `873a70b`, `3d12fdf`, `103e7f1`; closeout `4c34814`
**Next:** `/production` verification / PO browser smoke; TZD-16.1 only if a real installer artifact is required.

---

## [2026-08-06] — TZ-PRODUCTION-303 DONE: Production Cockpit shell + Gantt plan-estimate
**Исполнитель:** Cursor (implement + land; PO «добиваем до конца»)
**Статус:** DONE on main (scoped)
**Что сделано кратко:** `/production` dense cockpit; orders rail (ACTIVE_COMMERCIAL + selected RO); Gantt bars по `WorkType.days` через FE facade (composition-first); ×N display; PAGE_KEYS+seed+`production:read`; director на GET products/modules/work-types; lifecycle north-star в PO-DIARY/design.
**Gates:** FE jest production|gantt|cockpit 14/14 PASS; FE tsc PASS; BE tsc build PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303-gantt-board-page.lock`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-303.md`
**Commit:** `08e7a45` on main
**Next:** PO browser smoke `/production`; then TZ-PRODUCTION-304+.

---

## [2026-08-06] — TZ-CATALOG-311 DONE: Unified CompositionTree + CompositionEditor
**Исполнитель:** Buffy (implement) + Cursor (PASS / land / closeout)
**Статус:** DONE on main
**Что сделано кратко:** Shared CompositionTree/Editor; getProductTree/getModuleTree; lazy depth-refetch + expand state; product/module detail; depth warn; soft jest/docs.
**Gates:** agent focused Jest PASS; tsc clean on land base.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-311.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-311-composition-tree.lock`
**Commit:** `c36eebf` (from `cd900c4`)
**Next:** optional 315; Production 303 independent.

---

## [2026-08-06] — TZD-15 DONE: Agent inbox workspace (drop → audit → propose fills)
**Исполнитель:** Buffy (desktop/MCP) + Cursor (land on main)
**Статус:** DONE; archive + lock; on main
**Что сделано кратко:** Inbox drop→audit→propose→confirm (journal only, no silent SoT); MCP kppdf_inbox_*; config v3 inbox.dir; busy-guard.
**Gates:** desktop typecheck/svelte-check/build PASS; mcp 17/17; cargo check PASS.
**Archive:** `tasks/_archive/2026-08/TZD-15.done.md`
**Lock:** `.mimocode/locks/TZD-15-agent-inbox-workspace.lock`
**Commit (Freebuff):** `594833f` · **on main:** (cherry-pick)
**Next:** **TZD-16** (pairing download).

---

## [2026-08-06] — TZ-WAREHOUSE-UX-301 DONE: Dashboard dedupe + movements warehouse filter + type help
**Исполнитель:** Buffy (Freebuff executor) + Cursor (land on main)
**Статус:** DONE; archive + lock; on main
**Что сделано кратко:** /inventory без дубля TOC-кнопок в tools; /stock-movements фильтр склада (chips ≤8 / select >8, warehouseId+type к API, type chips через chipClick); форма склада: default type=main + RU-подсказка; фикс TS2353 → QueryGroupChip.
**Gates:** FE tsc PASS по зоне TZ; jest 5/25 PASS. Catalog-дрейф materials.page.ts вне scope.
**Archive:** `tasks/_archive/2026-08/TZ-WAREHOUSE-UX-301.done.md`
**Lock:** `.mimocode/locks/TZ-WAREHOUSE-UX-301-archive.lock`
**Commit (Freebuff):** `65a936f` · **on main:** (cherry-pick feat + closeout)
**Next:** optional catalog tsc-hygiene; ACL warehouse — отдельные TZ.

---

## [2026-08-06] — TZD-14 DONE: Desktop hosts MCP (autostart + status UI)
**Исполнитель:** Buffy (deepseek-v4-flash, desktop/MCP executor, session №3) + Cursor (land on main)
**Статус:** DONE; archive + lock; on main
**Что сделано кратко:** Tauri сам запускает MCP host при паринге (spawn `node …/tsx …/http-server.ts` через tauri-plugin-shell, CREATE_NO_WINDOW). UI: статус, URL+copy, порт, LAN OFF default, start/stop/restart; stop on quit; config v2 `mcp {port,allowLan}`; MCP.md без Cursor.
**Gates:** desktop typecheck/svelte-check/build PASS; mcp 8/8; cargo check PASS; MCP smoke healthz/auth PASS.
**Archive:** `tasks/_archive/2026-08/TZD-14.done.md`
**Lock:** `.mimocode/locks/TZD-14-desktop-mcp-autostart.lock`
**Commit (Freebuff):** `0cfca55` · **on main:** (cherry-pick)
**Known limits:** Node не в MSI; icons/ pre-existing gap.
**Next:** **TZD-15** GO (agent inbox).

---

## [2026-08-06] — TZ-CATALOG-320 DONE: FE composition gap (cascade / details / complex)
**Исполнитель:** Buffy (implement) + Cursor (PASS review / closeout / tsc waive)
**Статус:** DONE
**Что сделано кратко:** Composition `module|material|product` + product-only `unitPriceOverride`; модуль — материалы+дочерние модули; изделие — модуль+non-raw+product + «Комплекс»; fix `formGroupName="dimensions"`; 4 page docs.
**Gates:** focused Jest 5/53 PASS; scoped eslint/prettier PASS; full-app tsc **WAIVED** (pre-existing warehouse/materials chips, не conflict keys 320).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-320.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-320-composition-gap.lock`
**Commit:** `07ced5f`
**Next:** TZ-CATALOG-311 (CompositionTree). Soft: module-detail table ещё только materials.

---

## [2026-08-06] — TZ-ADMIN-306 DONE: Role select from API + /admin hub cleanup
**Исполнитель:** Buffy (Freebuff worktree a405897c, parallel session #2)
**Статус:** DONE
**Что сделано кратко:** User-form role <select> загружается из GET /admin/roles (PiRolesService): value=role name, RU-лейблы (системные: Администратор/Директор/Менеджер/Пользователь + custom label), системные первыми, edit-mode safety; `/admin` → redirect `/admin/users`, фейковый placeholder удалён.
**Gates:** FE tsc на allowlist PASS (0 ошибок pages/admin + app.routes); focused Jest 4 suites / 45 tests PASS; full-repo tsc red ×9 — pre-existing group-chips WIP parallel session #1 (не трогал).
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-306.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-306-role-select-hub.lock`
**Commit (Freebuff):** `68b6cc9` · **on main:** `69d8a22` (cherry-pick)
**Next:** optional WAREHOUSE-UX-301 or close agent.

---

## [2026-08-06] — TZ-CATALOG-314 DONE: Archive / soft-delete / auth consistency
**Исполнитель:** Buffy (implement) + Cursor (closeout / PO deploy path)
**Статус:** DONE
**Что сделано кратко:** ProductModule hard-delete → soft archive; deletedAt + active-read на Product/Material/WorkType/Category/Module; 409 на structured refs; org-scope на owned CRUD + Product composition/tree; 313 photo dual-write сохранён.
**Gates (closeout):** backend tsc PASS; focused Jest 5/46 PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-314.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-314-archive.lock`
**Next:** deploy; затем TZ-CATALOG-320.

---

## [2026-08-06] — TZD-13 DONE: MCP writes + mutation journal
**Исполнитель:** Cursor / Auto (desktop/MCP owner)
**Статус:** DONE; archive; push with closeout
**Что сделано кратко:** Backend MutationJournal (propose→confirm→undo Material, ring 50); MCP write tools; MCP.md connect+safety; unit default `шт`.
**Gates:** backend tsc PASS; jest 5/5; mcp tests 8/8.
**Archive:** `tasks/_archive/2026-08/TZD-13.done.md`
**Next:** TZD-14 Tauri MCP autostart (после вечернего деплоя web — можно отдельно).

---

## [2026-08-06] — TZ-CATALOG-313 DONE: Photo/document attachment unify
**Исполнитель:** Buffy / openai/gpt-5.6-luna
**Статус:** DONE; PO accepted READY FOR REVIEW; archive + lock created.
**Что сделано кратко:** Добавлен typed CatalogAttachment для Product/ProductModule/Material; ProductModule получил photoIds/mainPhotoId; ProductModulePhoto и legacy document collections сохранены; legacy module-photo paths используют non-destructive dual-write для общих Photo references.
**Gates:** backend tsc PASS; focused Jest 3 suites / 15 tests PASS; scoped ESLint PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-313.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-313-attachments.lock`
**Commit:** pending closeout commit

---

## [2026-08-05] — TZ-CATALOG-312 DONE: Material detail page /materials/:id
**Исполнитель:** Buffy
**Статус:** DONE
**Что сделано кратко:** Карточка материала /materials/:id (4 секции: основное, габариты, склад, where-used backlinks). Роут + ссылка из списка материалов. Паттерн product/module detail.
**Gates:** FE tsc PASS; jest material-detail 6/6 PASS.
**Commit:** `7eb60f4`
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-312.done.md` (hygiene 2026-08-06: stale `_active` + backlog stub removed)
**Lock:** `.mimocode/locks/TZ-CATALOG-312-material-detail.lock`
**Next:** TZ-CATALOG-314 closeout (DAY-07) → 320.

---

## [2026-08-05] — TZD-05 DONE: Web «Подключить десктоп» — pairing JSON packet
**Исполнитель:** Buffy
**Статус:** DONE; archive created; commit pending
**Что сделано кратко:** Кнопка «Десктоп» в хедере (Monitor icon); dialog с JSON-пакетом + Copy/Close; apiBaseUrl = backend origin (dev: http://127.0.0.1:3000, prod: window.location.origin); RU-ошибки на истёкший/отсутствующий токен; pure FE, без нового backend-эндпоинта.
**Gates:** FE tsc (tsconfig.app.json) PASS; jest pairing-dialog 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-05.done.md`
**Next:** TZD-11/12 уже на main; TZD-14 desktop autostart или следующий backlog.

---

## [2026-08-05] — TZD-13 DONE: MCP writes + mutation journal
**Исполнитель:** Cursor / Auto (desktop/MCP owner)
**Статус:** DONE on main after push
**Что сделано кратко:** Backend MutationJournal (propose→confirm→undo, ring 50) для Material; MCP write tools; docs connect+safety; unit default `шт`.
**Gates:** backend tsc PASS; jest 5/5; mcp tests 8/8.
**Archive:** `tasks/_archive/2026-08/TZD-13.done.md`
**Next:** TZD-14 autostart MCP in Tauri (usability). FE pairing TZD-05 parallel.

---

## [2026-08-05] — TZD-12 DONE: MCP read tools
**Исполнитель:** Cursor / Auto
**Статус:** DONE; archive; on main after push
**Что сделано кратко:** 6 read-only MCP tools поверх существующих GET (materials/products/storage-items/warehouses) + slim product fields; обновлён `desktop/docs/MCP.md`.
**Gates:** `pnpm typecheck` PASS; `pnpm test` 7/7 PASS.
**Archive:** `tasks/_archive/2026-08-05/TZD-12.done.md`
**Lock:** `.mimocode/locks/TZD-12-mcp-reads.lock`
**Next:** TZD-13 writes + journal. Параллельно: TZD-05.

---

## [2026-08-05] — TZD-11 DONE: MCP server foundation
**Исполнитель:** Cursor / Auto
**Статус:** DONE; archive + lock; on main `de27bf2` (TZD-12 unblocked)
**Что сделано кратко:** Пакет `desktop/mcp` (`@kppdf/desktop-mcp`): Streamable HTTP на `127.0.0.1:9743` + stdio; auth pairing JWT (`KPPDF_API_KEY` + Bearer); tool `kppdf_ping`; docs `desktop/docs/MCP.md`; workspace member в `desktop/pnpm-workspace.yaml`.
**Gates:** `pnpm typecheck` PASS; `pnpm test` 2/2 PASS; smoke `/healthz` ok + Bearer mismatch → 401.
**Archive:** `tasks/_archive/2026-08/TZD-11.done.md`
**Lock:** `.mimocode/locks/TZD-11-mcp-foundation.lock`
**Next:** TZD-12 read tools (после push на main). Параллельно OK: TZD-05.

---

## [2026-08-05] — TZ-CATALOG-310 DONE: Where-used API
**Исполнитель:** Buffy / openai/gpt-5.6-luna
**Статус:** DONE; archive + lock created; commit/push pending
**Что сделано кратко:** Добавлены authenticated read-only where-used routes для Product, Module, Material и WorkType; общий paginated response, org scope для owned parent records, legacy composition fallback, orphan tolerance и Swagger docs.
**Gates:** backend tsc PASS; focused Jest 4 suites / 46 tests PASS; scoped ESLint PASS (0 errors, 6 existing test-mock warnings); diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-310.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-310-where-used.lock`
**Known limit:** ProductModule/WorkType остаются shared, так как текущие схемы не имеют organizationId.

---

## [2026-08-05] — TZ-CATALOG-UI-301 DONE: Catalog Group Chip Workspace
**Исполнитель:** Cursor Architect (+ FE subagent)
**Статус:** DONE
**Что сделано кратко:** Каталог (продукция/модули/материалы/виды работ/люди) на `PiGroupWorkspace`; top-nav Каталог и Справочники — entry без dropdown; SoT + DEVELOPMENT-PATTERNS §18; table mapping Expandable+Card grid / Flat+photo.
**Gates:** fe tsc PASS; jest catalog list specs PASS (32).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-UI-301.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-UI-301-group-chip.lock`
**Canon:** `docs/superpowers/specs/2026-08-05-group-chip-workspace-canon.md`

---

## [2026-08-05] — TZ-UI-TABLE-303 DONE: shared Expandable contract
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** DONE; archive + lock created per session close-board
**Что сделано кратко:** `app-pi-table` получил active-row predicate and named detail-region API; Products теперь single-expand с keyboard Enter/Space, `aria-expanded` and one detail row.
**Gates:** fe tsc PASS; targeted Jest 4 suites / 45 tests PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-303.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-303-expandable.lock`

---

## [2026-08-05] — TZ-UI-TABLE-305 DONE: raw registries on shared Flat kit
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** DONE; archive + lock created per session close-board
**Что сделано кратко:** семь raw registry tables переведены на `app-pi-table`; CRUD, filters, actions, loading/empty, sorting and pagination preserved. Added focused smoke specs for Documents, Forms and Inventory Dashboard.
**Gates:** fe tsc PASS; targeted Jest 11 suites / 86 tests PASS; raw registry scan PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-305.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-305-flat-kit.lock`

---

## [2026-08-05] — TZ-UI-TABLE-302 READY FOR REVIEW: shared Tree kit + categories
**Исполнитель:** openai-gpt-5.6-luna (Buffy)
**Статус:** READY FOR REVIEW; Cursor PASS → archive; не DONE
**Что сделано кратко:** добавлен `app-pi-table-tree` для nested rows, indent, expand/collapse и drag capability; CategoriesPage переведён с page-local grid/CDK markup на kit, reorder API сохранён.
**Gates:** fe tsc PASS; targeted jest 6 suites / 59 tests PASS; diff --check PASS.
**Документы:** categories.page.md, checklist, active marker/map.
**Известные ограничения:** MVP два уровня; filtered drag index behavior прежний; browser screenshot smoke не запускался.

---

## [2026-08-05] — TZ-DICT-312 READY FOR REVIEW: Group Chip chrome polish
**Исполнитель:** openai-gpt-5.6-luna (Buffy)
**Статус:** READY FOR REVIEW; Cursor PASS → archive; не DONE
**Что сделано кратко:** убран gap header→chips через dense main для dictionary group routes; chips+tools собраны в адаптивный sticky top-0 stack; CTA tools защищён от правого clip.
**Gates:** fe tsc PASS; targeted jest 10 suites / 91 tests PASS; diff --check PASS.
**Документы:** checklist, DICT-WAVE1-REVIEW, page docs, PAGE-TZ-INDEX, active-map.
**Известные ограничения:** browser screenshot smoke не запускался; UI-TABLE Tree/305 не входят.

---

## [2026-08-05] — TZ-DICT-312 + TZ-UI-TABLE-302 DONE (Architect PASS)
**Исполнитель:** Buffy + Cursor (tsc + 119 jest + archive)
**Статус:** PASS; archives `TZ-DICT-312.done.md`, `TZ-UI-TABLE-302.done.md`
**Что сделано кратко:** Group Chip sticky/dense polish; PiTableTree + categories migrate.
**Критерии:** AC 312 + 302
**Известные ограничения:** UI-TABLE-305 backlog; browser smoke optional PO

---

## [2026-08-05] — Authored TZ-DICT-312 (Group Chip polish tomorrow)
**Исполнитель:** Cursor Mode A (docs)
**Статус:** TZ READY — код завтра
**Что сделано кратко:** баги после warm: gap header→chips + clipped CTA; TZ+checklist.
**Файлы:** `tasks/TZ-DICT-312.md`, checklist, active-map, PO-DIARY
**Критерии:** executable TZ
**Известные ограничения:** не чинить сегодня без запроса PO

---

## [2026-08-08] — TZ-UI-SELECT-301 DONE: Catalog overflow search migration
**Исполнитель:** Buffy / openai/gpt-5.6-luna
**Статус:** DONE; archive + lock created; commit/push in this closeout
**Что сделано кратко:** Растущие selectors категорий, поставщиков, заказчиков, объектов, организаций и продукции переведены на `app-pi-overflow-select` с `searchable=auto`; enum selects сохранены; inventory docs обновлены.
**Gates:** targeted Jest 35 PASS; scoped ESLint 0 errors (one existing architecture warning); Prettier PASS; diff-check PASS. Full FE tsc has one unrelated baseline error from existing materials list WIP importing untracked `material-dimensions` helper.
**Archive:** `tasks/_archive/2026-08/TZ-UI-SELECT-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-SELECT-301.lock`

---

## [2026-08-08] — TZ-UX-COMPOSE-301 DONE: Module composition discoverability
**Исполнитель:** Buffy (freebuff claim worktree)
**Статус:** DONE; archive + lock + checklist; commit/push в этом closeout
**Что сделано кратко:** ModuleForm показывает hint «Состав (модули и материалы) — на карточке модуля или в QC L»; picker `restrictToModule` открывается на вкладке **Материал** (Модуль остаётся) + hint «модуль или материал»; при выборе материала/листа в дереве кнопка «+ В корень изделия/модуля» остаётся доступной (`bom-add-root-into`) — нет тупика. Матрица включённости задокументирована в module/product-detail. Бонус-фикс: quick-create spec override дополнен `PiOverflowSelectComponent` (падал полный сьют после SELECT-301).
**Gates:** tsc PASS; targeted Jest 20/20 PASS; полный сьют 129 suites / 1212 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-COMPOSE-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-COMPOSE-301.lock`

---

## [2026-08-08] — TZ-UX-DIALOG-305 DONE: Catalog kind-C width parity
**Исполнитель:** Buffy (freebuff claim worktree)
**Статус:** DONE; archive + lock + checklist; commit/push в этом closeout
**Что сделано кратко:** Module FullEditor переведён с form lg (~640) на kind C `variant="content"` + `maxWidth min(1120px, calc(100vw - 2rem))`; composition picker «Добавить в состав» — с form xl (~920) на ту же 1120 clamp (`form` + `maxWidth`). Opener `width` инертен (компонент решает сам). Cookbook kind C + canon дополнены; аудит `docs/audits/2026-08-09-catalog-dialog-width-parity.md`.
**Gates:** tsc PASS; targeted Jest 15/15 PASS; полный сьют 129 suites / 1214 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-305.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-305.lock`

---

## [2026-08-09] — TZ-SALES-323 DONE: Create КП A4 fit без scrollbar
**Исполнитель:** Buffy / agent-6c3d05b80e
**Статус:** DONE; PO visual PASS on canonical `main`; archive + lock + checkpoint completed
**Что сделано кратко:** FE contain-scale с safety inset/ResizeObserver и bounded portrait/landscape A4 build page box; подтверждены отсутствие H/V scrollbar и scrollWidth/scrollHeight <= client + 1px.
**Gates:** backend tsc PASS; document build e2e 8/8 PASS; frontend tsc PASS; proposal-create 9/9 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-323.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-323-create-kp-a4-fit-no-scroll.lock`

---

## [2026-08-09] — TZ-SALES-324 DONE: Empty table skeleton
**Исполнитель:** Buffy / agent-6c3d05b80e
**Статус:** DONE; archive + lock + checkpoint completed
**Что сделано кратко:** `TableTemplateService.preview()` при пустых sampleRows и объявленных columns сохраняет геометрию таблицы: thead с labels + ровно одна пустая data-row; plain «Нет данных» больше не заменяет таблицу.
**Gates:** backend tsc PASS; table-template e2e 8/8 PASS; document-template build e2e 9/9 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-324.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-324-empty-table-skeleton-blank.lock`

---

## [2026-08-09] — TZ-SALES-329 DONE: Deals → Create КП default landing
**Исполнитель:** Buffy / agent-6c3d05b80e
**Статус:** DONE; archive + lock + checkpoint completed
**Что сделано кратко:** вход «Сделки» и тёмный chip «КП» ведут на `/proposals/create`; жёлтый «Все КП» сохраняет `/proposals`, а `/proposals` остаётся active alias для Deals.
**Gates:** frontend tsc PASS; deals-group-chips 2/2 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-329.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-329-default-land-create-kp.lock`

---

## [2026-08-09] — TZ-SALES-326 DONE: Wider products flyout + outside dismiss
**Исполнитель:** Buffy / agent-6c3d05b80e
**Статус:** DONE; Cursor visual PASS; archive + lock + checkpoint completed
**Что сделано кратко:** products flyout capped at 40rem; transparent backdrop closes left/right panels through center and iframe; A4 rails|center|rails geometry remains unchanged; template binding compile fix included.
**Gates:** frontend tsc PASS; ng build PASS with existing budget warnings; proposal-create 11/11 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-326.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-326-products-flyout-wide-dismiss.lock`

---

## [2026-08-09] — TZ-DOC-344 DONE: Builder default background star fill closeout
**Исполнитель:** Buffy / agent-3e757640b7
**Статус:** DONE; PO accepted one-background behavior; star-fill fix self-checked; archive + lock + checkpoint completed
**Что сделано кратко:** active/default background star now visibly uses yellow fill through the nested Lucide SVG/path; inactive stars stay outline-only. Existing single-default canvas and upload healing remain unchanged.
**Gates:** frontend tsc PASS; builder-inspector + builder.page 43/43 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-344.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-344-builder-single-default-background.lock`
**Scope:** foreign DOC-343 checklist/backend WIP and dirty `document-template.service.ts` excluded; DOC-342, SALES-*, 322/320, deploy untouched.

---

## [2026-08-09] — TZ-SALES-325 DONE: draftLines → assigned line-items table
**Исполнитель:** Buffy / agent-6c3d05b80e
**Статус:** DONE; Cursor/PO visual PASS; archive + lock + checkpoint completed
**Что сделано кратко:** Create КП sends request-only `previewLines`; explicit `kpLineItems`/`line-items` target selection fills only the assigned live table, while empty lines preserve the 324 skeleton and snapshots remain untouched.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 11/11; diff-check PASS.
**Implementation:** `e1e84cb8`
**Archive:** `tasks/_archive/2026-08/TZ-SALES-325.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-325-draftlines-table-bind.lock`
**Scope:** foreign DOC-343 dirty WIP and `document-template.service.ts` orientation change preserved/excluded; deploy NO.

---

## [2026-08-09] — TZ-SALES-335 DONE: KP line-item columns, quantity and photo cell
**Исполнитель:** Buffy / canonical `D:\\kppdf-8.0` `main`
**Статус:** DONE; feature `d6bd43b9` pushed; closeout archive + lock + active removal in progress
**Что сделано кратко:** экземпляр выбранной live line-items таблицы получает request-only «Кол-во»/«Цена»/«Сумма»; количество редактируется в rail «Товары» и перестраивает A4; `photoUrl` рендерится как thumb только в существующей колонке «Рисунок».
**Gates:** frontend/backend tsc PASS; proposal/Create Jest 23/23; table-template Jest 2/2; Prettier/ESLint/diff-check PASS.
**Browser:** template + product with photo selected; quantity `1 → 3`; A4 showed «Кол-во» 3, «Цена» 7 000,00 ₽, «Сумма» 21 000,00 ₽; shared TableTemplate received no PATCH.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-335.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-335-kp-line-items-columns-photo.lock`
**Next:** TZ-SALES-336; deploy NO.

## [2026-08-10T16:34:00Z] — TZ-PRODUCTS-310 DONE: Product edit ɵcmp cycle removed
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE typecheck/build/focused tests/static import check PASS; deploy НЕ
**Что:** `ProductBomPanelComponent` больше не импортирует `ProductFormDialogComponent` статически. Nested edit загружает FullEditor динамически после `ProductsService.findById`, поэтому `ProductFormDialog` может безопасно встраивать BOM panel без undefined `ɵcmp`.
**Gates:** frontend tsc PASS; focused `product-form-dialog` + `product-bom-panel` Jest 33/33 PASS; Angular development build PASS; ESLint PASS; diff-check PASS. Madge показывает intentional dynamic edge и отдельный pre-existing template-block cycle; статическая взаимная связь отсутствует.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-310.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-310-product-bom-circular-cmp.lock`
**Known limit:** live browser/data smoke не запускался в изолированной сессии; deploy НЕ.
**NEXT:** claim TZ-DICT-317 строго по очереди.

## [2026-08-10T16:43:00Z] — TZ-DICT-317 DONE: Units CRUD edit + manager roles
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE/BE typecheck, focused tests, FE build, ESLint and diff-check PASS; deploy НЕ
**Что:** На странице «Измерения» карандаш теперь открывает компактный диалог редактирования названия, символа и категории; после PATCH список обновляется. POST/PATCH/DELETE единиц разрешены `admin` и `manager`, чтение оставлено `user`; удаление системных единиц по-прежнему запрещено.
**Gates:** Measurements Jest 6/6; Unit RBAC Jest 2/2; frontend/backend tsc PASS; frontend development build PASS; ESLint/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-317.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-317-units-crud-edit-roles.lock`
**Known limit:** live browser/data smoke не запускался в изолированной сессии; deploy НЕ.
**NEXT:** claim TZ-DICT-318 строго по очереди.

## [2026-08-10T16:47:00Z] — TZ-DICT-318 DONE: RAL auto-prefix and digit input
**Исполнитель:** Buffy / continuous executor
**Статус:** DONE; FE typecheck/build/focused tests/ESLint/diff-check PASS; deploy НЕ
**Что:** В справочнике цветов код RAL вводится четырьмя цифрами с readonly-префиксом `RAL`; необязательное название формирует `RAL 9003 — Сигнальный белый`. Редактирование разбирает существующий RAL name, а не-RAL имена не меняет. Неиспользуемый plural dialog twin удалён после grep импортов.
**Gates:** focused dialog/page Jest 21/21; frontend tsc PASS; frontend development build PASS; ESLint/dead-twin grep/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-318.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-318-ral-auto-prefix.lock`
**Known limit:** live browser/data smoke не запускался в изолированной сессии; deploy НЕ.
**NEXT:** claim TZ-MATERIALS-312 строго по очереди.

## [2026-08-12T16:29:00Z] — TZD-40 DONE: Desktop version gate
**Исполнитель:** Buffy / фоновый desktop исполнитель
**Статус:** DONE; BE tsc + jest desktop 10/10; FE tsc + jest desktop 12/12; desktop typecheck + svelte-check + mcp:check 110/110; diff-check PASS; deploy НЕ
**Что:** Публичный GET /api/desktop/compat (env DESKTOP_MIN_VERSION / DESKTOP_RECOMMENDED_VERSION / DESKTOP_DOWNLOAD_URL / APP_VERSION, fail-open). Desktop после /auth/me сверяет свою версию (tauri) с контрактом: ниже min → красный баннер + MCP не стартует, между min и recommended → жёлтый баннер, ≥ recommended → тишина. Веб-диалог паринга показывает «Актуальная версия Desktop: X (мин. Y)». Docs INSTALL/PAIRING + config.env.example.
**Archive:** tasks/_archive/2026-08/TZD-40.done.md
**Lock:** .mimocode/locks/TZD-40-desktop-version-gate.lock (local, gitignored)
**Known limit:** без warm deploy env баннер не появится; старый Desktop без кода баннер не покажет (ручной update).
**NEXT:** TZD-45 MCP production/supply READ.

## [2026-08-12T16:36:00Z] — TZD-45 DONE: MCP production + supply read-first
**Исполнитель:** Buffy / фоновый desktop исполнитель
**Статус:** DONE; desktop/mcp tsc + tests 114/114 PASS; deploy НЕ
**Что:** read-first MCP: production-tools.ts (work-types / production-orders / work-orders) + supply-tools.ts (supply-tasks / purchase-requests / purchase-orders) — 10 новых GET-tools по живым Nest routes (grep controllers, не invent). Реестр toolCount 83 → 93; MCP.md разделы production/supply.
**Archive:** tasks/_archive/2026-08/TZD-45.done.md
**Known limit:** только read; write-heavy HITL / тендеры / себестоимость / Гант — successor после smoke PO.
**NEXT:** Фоновый агент свободен (40/45 закрыты).

## [2026-08-12T19:20:00Z] — TZ-MIG-301 DONE: КП3 extract + field mapping audit
**Исполнитель:** Buffy / data migration analyst (read-only к КП3)
**Статус:** DONE; SSH BatchMode OK; counts 699/23/28; media 690 ≈82MB; git check-ignore дампов OK; deploy НЕ
**Что:** Выгружен КП3 (Mongo `kp-app` + `/opt/kppdf/media`) → `data/from-kp3/` (raw JSON c `_id` строками, media, photos-index 661, id-map 699/23/28). Аудит `docs/audits/2026-08-12-kp3-to-kp8-field-map.md`: полный field-map с вердиктами. gap-block (3): фото (нет MCP upload), Counterparty.email (нет поля), брендинг КП (нет слота). В SoT КП8 ничего не писал; FE/BE schema не тронуты.
**Archive:** tasks/_archive/2026-08/TZ-MIG-301.done.md
**Lock:** .mimocode/locks/TZ-MIG-301-kp3-extract-map.lock (local, gitignored)
**NEXT:** ждать вердикт PO по gap-списку → MIG-302 (map/rename часть) после OK.
