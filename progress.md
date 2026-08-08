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
