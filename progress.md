## [2026-08-19] — TZ-DESK-416 — tray production link from=desk

**Исполнитель:** composer-executor-desk-416
**Статус:** DONE
**Суть:** В `order-hub-tray` desk-mode ссылка «Открыть производство» шлёт `from=desk`, чтобы `/production` показал «На стол». Hub mode без `from`.
**Gates:** FE tsc PASS, jest 19/19 (tray 2 + orders.page 17), eslint PASS.
**Archive:** tasks/_archive/2026-08/TZ-DESK-416.done.md
**Lock:** .mimocode/locks/TZ-DESK-416-tray-from-desk.lock

## [2026-08-19] — TZ-DESK-415 DONE — DeskNote orderId + author ACL

**Исполнитель:** Gemini
**Статус:** DONE
**Суть:** GET `/desk-notes` без валидного orderId → 400 (не dump). PATCH/DELETE — автор или role admin|director|manager, иначе 403.
**Gates:** BE tsc PASS; desk-note jest 10/10; eslint PASS.
**Archive:** tasks/_archive/2026-08/TZ-DESK-415.done.md
**Lock:** .mimocode/locks/TZ-DESK-415-desknote-acl.lock
**Deploy:** НЕ

## [2026-08-18] — TZ-MATERIALS-313 — pricePerUnit type fix


**Исполнитель:** Gemini
**Статус:** DONE
**Суть:** Исправлена передача `pricePerUnit` как строки с фронтенда (теперь преобразуется в number). Добавлен `@Type(() => Number)` в DTO для `pricePerUnit` и `weightKg`.
**Gates:** FE tsc PASS, tests PASS, BE tsc PASS.
**Archive:** tasks/_archive/2026-08/TZ-MATERIALS-313.done.md
**Lock:** .mimocode/locks/TZ-MATERIALS-313.lock

## [2026-08-18] — TZ-COMP-401 PARTIAL — Privacy page & enroll notice

**Исполнитель:** gemini
**Статус:** PARTIAL DONE — FE code done; deploy BLOCKED (SSH timeout)
**Суть:** Privacy page /legal/privacy, enroll notice, login notice updated.
**Gates:** FE tsc PASS, tests PASS, build PASS.
**Archive:** tasks/_archive/2026-08/TZ-COMP-401.done.md
**Lock:** .mimocode/locks/TZ-COMP-401.lock
**Next:** PO needs to ensure VM is in LAN or VPN is off, then deploy and apply nginx config.

## [2026-08-17] вЂ” TZ-MIG-304 PARTIAL вЂ” Counterparty.email + KP3 email load

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-mig-304
**РЎС‚Р°С‚СѓСЃ:** PARTIAL DONE вЂ” schema+UI shipped; load **BLOCKED** (SoT timeout)
**Р§С‚Рѕ:** optional `Counterparty.email` schema/DTO/UI В«РџРѕС‡С‚Р°В»; load script ready; 0/10 emails written (LAN down).
**Gates:** BE tsc PASS; counterparty 17/17; FE tsc PASS; editor 9/9.
**Archive:** `tasks/_archive/2026-08/TZ-MIG-304.done.md`
**Lock:** `.mimocode/locks/TZ-MIG-304-cp-email-via-person.lock`
**Next:** re-run `_mig304_cp_email_load.py` when SoT up; deploy BE on PO В«РєР°С‚РёВ».

## [2026-08-17] вЂ” TZ-MIG-303 DONE вЂ” KP3 photos attach verify

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-mig-303
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•; uploaded this run **0** (661 already had photoIds)
**Р§С‚Рѕ:** REST verify on `https://kppdf-crm.ru`; idempotent script `scripts/mig303-attach-kp3-photos.py`; coverage **661/661 (100%)**; orphans 35 logged not deleted; MCP :9743 offline; LAN unreachable.
**Gates:** script exit 0; AC в‰Ґ95% PASS.
**Archive:** `tasks/_archive/2026-08/TZ-MIG-303.done.md`
**Lock:** `.mimocode/locks/TZ-MIG-303-kp3-photos-attach.lock`
**Next:** MIG-304 email; PO smoke catalog photos in UI.

## [2026-08-17] вЂ” TZ-MIG-306 DONE вЂ” product categoryId filter

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-mig-306
**РЎС‚Р°С‚СѓСЃ:** DONE (live GET/UI **BLOCKED** вЂ” Synology/local API offline); deploy РќР•
**Р§С‚Рѕ:** `ProductService.findAll` matches `categoryId` via `$in: [ObjectId, string]` for KP3 mixed types; unit test TZ-MIG-306; code @ `bceb1762`.
**Gates:** BE tsc PASS; `product.service.spec` **17/17**; live `GET /api/products?categoryId=` not run.
**Archive:** `tasks/_archive/2026-08/TZ-MIG-306.done.md`
**Lock:** `.mimocode/locks/TZ-MIG-306-category-filter.lock`
**Next:** warm-deploy BE + live filter smoke when API up; then MIG-302.

## [2026-08-17] вЂ” TZ-MIG-302 DONE вЂ” KP3 scoped load closeout

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-mig-302
**РЎС‚Р°С‚СѓСЃ:** DONE (archive-only); deploy РќР•; mass re-load РќР•
**Р§С‚Рѕ:** Closeout load 2026-08-12: 699 products / 16 CP / 13 cat / 27 KP РЅР° Synology prod; REST when MCP down; id-map gitignore; deferred photo/email/brand.
**Gates:** load-report PASS; MCP :9743 offline; Synology timeout вЂ” РЅРµ re-verify.
**Archive:** `tasks/_archive/2026-08/TZ-MIG-302.done.md`
**Lock:** `.mimocode/locks/TZ-MIG-302-kp3-mcp-load.lock`
**Next:** TZ-MIG-304 emailв†’Person; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-17] вЂ” TZD-47 DONE вЂ” MCP photo upload HITL

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-tzd-47
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•; live MCP :9743 offline (smoke = mocked REST)
**Р§С‚Рѕ:** `kppdf_propose_photo_upload` + `kppdf_confirm_photo_upload` (`userOk`); SoT `POST /api/photos/upload`; bind `POST /api/products/:id/photos` в†’ `Product.photoIds`; CP bind REST РЅРµС‚.
**Gates:** mcp tsc PASS; tests **121/121**; registry **95**.
**Archive:** `tasks/_archive/2026-08/TZD-47.done.md`
**Lock:** `.mimocode/locks/TZD-47-mcp-photo-upload.lock`
**Next:** TZ-MIG-302 one-chat; deploy Р·Р°РїСЂРµС‰С‘РЅ. PO: РїРѕРґРєР»СЋС‡Рё MCP РґР»СЏ live 1-file.

## [2026-08-17] вЂ” TZD-56 DONE вЂ” NSIS AI runner sidecar/bundle

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-tzd-56
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•; bump **0.5.6**
**Р§С‚Рѕ:** bundled `ai-runner.mjs` + `node-llama-cpp` (win-x64 CPU) РєР°Рє Tauri resource; NSIS Р±РµР· `tsx`/monorepo; `tauri dev` РїРѕ-РїСЂРµР¶РЅРµРјСѓ tsx.
**Gates:** desktop tsc PASS; svelte-check 0/0; tests **72/72**; bundle smoke `--specs` + `getLlama`.
**Archive:** `tasks/_archive/2026-08/TZD-56.done.md`
**Lock:** `.mimocode/locks/TZD-56-desktop-ai-runner-nsis-sidecar.lock`
**Next:** TZD-47 MCP photo upload; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-17] вЂ” TZ-UX-371 DONE вЂ” Orders list redesign

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff-gpt-5.6-luna
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** expanded order row РїРµСЂРµРІРµРґС‘РЅ РІ РїР»РѕСЃРєСѓСЋ semantic Paper & Ink СЂР°Р·РјРµС‚РєСѓ; `PiTable` РїРѕР»СѓС‡РёР» RU read-only `в–ё/в–ѕ` control СЃ `bg-gold` РІ СЂР°СЃРєСЂС‹С‚РѕРј СЃРѕСЃС‚РѕСЏРЅРёРё; API/business logic РЅРµ РјРµРЅСЏР»РёСЃСЊ.
**Gates:** FE tsc PASS; focused Jest OrdersPage + PiTable **44/44**; `pnpm run build` PASS; owned ESLint 0 errors (pre-existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-UX-371.done.md`
**Lock:** `.mimocode/locks/TZ-UX-371-orders-list-redesign.lock`
**Next:** TZD-56 desktop AI runner sidecar; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-17] вЂ” TZ-PRODUCTION-353 DONE вЂ” Gantt unassigned People gate

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** banner В«Р‘РµР· РёСЃРїРѕР»РЅРёС‚РµР»СЏВ» + `/people`; amber В«РќРµ РЅР°Р·РЅР°С‡РµРЅВ» row; `summarizeUnassignedGanttWork`.
**Gates:** FE tsc PASS; jest model+gantt+cockpit **131/131**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-353.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-353-gantt-unassigned-people-gate.lock`
**Next:** TZ-SALES-369 / warm deploy РїРѕ PO.

## [2026-08-16] вЂ” TZ-PRODUCTION-352 DONE вЂ” Gantt worker tint hash fallback

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `resolveWorkTypeHue`; assigned worker summary tint when catalog `accentHue` null; unassigned summary hue null (353).
**Gates:** FE tsc PASS; jest gantt-bar + gantt-bars **102/102**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-352.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-352-gantt-workers-tint-fallback.lock`
**Next:** TZ-PRODUCTION-353 unassigned banner.

## [2026-08-16] вЂ” TZ-COMBINE-415 DONE вЂ” РљРѕРјР±Р°Р№РЅ: С‡РёС‚Р°РµРјС‹Рµ в„– Р·Р°РєР°Р·Р° + text-ink

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-415
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** order в„– Р±РµР· `pi-tech-label` (`font-mono text-xs font-medium text-ink` + `bg-paper-2`); РёРјСЏ + sticky titles `text-ink`; CDK placeholder opacity scoped to mini-kanban.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (28/28).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-415.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-415-combine-readable-order-labels.lock`
**Next:** Freebuff drain / deploy РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-COMBINE-413 DONE вЂ” РљРѕРјР±Р°Р№РЅ: DnD no-jump + module dialog

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-combine-413
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** solid opaque CDK preview + placeholder opacity 0 + soft drop anim; `openModuleEdit` dialog (stay on `/design/combine`); lane PATCH untouched.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page + dashboard-dialog.service PASS (33/33).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-413.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-413-combine-dnd-no-jump.lock`
**Next:** Freebuff drain / deploy РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-COMBINE-414 DONE вЂ” РљРѕРјР±Р°Р№РЅ: РёРјСЏ/СЂСЏРґ в†’ expand; edit С‚РѕР»СЊРєРѕ РєР°СЂР°РЅРґР°С€РѕРј

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-414
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** name/qty/indicators в†’ `toggleExpand`; product pencil в†’ `editProduct` only; fuse 412 intact; module pencil/DnD РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (26/26).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-414.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-414-combine-name-expands-pencil-edits.lock`
**Next:** TZ-COMBINE-413 DnD no-jump (park); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-COMBINE-412 DONE вЂ” РљРѕРјР±Р°Р№РЅ: СЃРєР»РµР№РєР° СЂСЏРґРѕРІ + РёРјСЏ в†’ edit

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-412
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** fuse same-order (`gap-0` / shared border); inter-order `mt-3`; nameв†’editProduct; в–ё expand; module pencilв†’`/modules/:id`.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (26/26).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-412.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-412-combine-fuse-rows-name-edit.lock`
**Next:** TZ-COMBINE-413 DnD no-jump (park); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-COMBINE-411 DONE вЂ” РљРѕРјР±Р°Р№РЅ: СѓР±СЂР°С‚СЊ РґСѓР±Р»СЊ В«Р—Р°РєР°Р· в„–В»

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-combine-411
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** СѓР±СЂР°РЅ `combine-order-group`; РЅРѕРјРµСЂ С‚РѕР»СЊРєРѕ РЅР° СЂСЏРґСѓ; `gap-1` + `mt-4` РЅР° СЃРјРµРЅРµ orderId; Р±РµР· color coding / boardLane.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (25/25).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-411.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-411-combine-drop-order-group-dup.lock`
**Next:** Freebuff drain; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-COMBINE-410 DONE вЂ” РљРѕРјР±Р°Р№РЅ В«С†РµР»РёРєРѕРјВ» + polish РёРЅРґРёРєР°С‚РѕСЂРѕРІ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-combine-410
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** prefetch modules в†’ collapsed indicators; chip В«С†РµР»РёРєРѕРјВ» DnD; a11y expand; light order group headers; boardLane semantics intact.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (25/25).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-410.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-410-combine-rows-whole-product-polish.lock`
**Next:** Freebuff drain queue; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-COMBINE-409 DONE вЂ” РљРѕРјР±Р°Р№РЅ product rows + mini-kanban
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-combine-409
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** column-kanban в†’ sticky stages + OrderItem rows; expand = 5-cell mini-kanban; CDK DnD scoped to line; PATCH/freeze/ship reuse.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest dashboard.page PASS (23/23).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-409.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-409-combine-product-rows.lock`
**Next:** TZ-COMBINE-410 polish (not claimed); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-350 DONE вЂ” Gantt mono milk ladder
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-350
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РѕРґРЅР° paper hue-СЃРµРјСЊСЏ (~82вЂ“90), Р»РµСЃС‚РЅРёС†Р° L/C; СѓР±СЂР°РЅС‹ rainbow 240/70/145; denser summary barFill; WT accent СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest gantt-bars PASS (53/53).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-350.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-350-gantt-mono-milk-ladder.lock`
**Next:** queue idle for Gantt palette; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-349 DONE вЂ” Gantt 4-level milk palette
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-349
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** CSS vars `--gantt-level-order|product|module`; distinct summary barFill cream/blue/sand; order-expanded Р±РµР· beige flatten; WT accent СЃРѕС…СЂР°РЅС‘РЅ; label+timeline wash parity.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest gantt-bars PASS (52/52).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-349.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-349-gantt-level-palette.lock`
**Next:** queue idle for Gantt palette; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-348 DONE вЂ” Gantt toolbar + header + label expand
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-348
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** С‚СѓР»Р±Р°СЂ В«РџРѕ Р·Р°РєР°Р·Р°Рј|РџРѕ СЂР°Р±РѕС‡РёРјВ» + В«Р”РµРЅСЊ|РњРµСЃСЏС†|Р’РјРµСЃС‚РёС‚СЊ СЃСЂРѕРєРёВ» РІ С€Р°РїРєРµ Р“Р°РЅС‚Р°; chrome В«РњР°СЃС€С‚Р°Р±В» СѓР±СЂР°РЅ; header В«Р—Р°РєР°Р·В»/В«Р Р°Р±РѕС‡РёР№В» Р±РµР· СЂР°РјРєРё; РєР»РёРє Р»РµР№Р±Р»Р° worker/product/module = expand; nest 15px + СЃРёР»СЊРЅРµРµ washes.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest gantt-bars|scale-controls|cockpit PASS (76/76).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-348.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-348-gantt-toolbar-header-expand.lock`
**Next:** queue idle for Gantt chrome; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-346 DONE вЂ” Gantt nest indent + level tint
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** local-executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** label `data-nest-depth` indent 10/20/30px (product/module/work); quiet `gantt-level-*` washes; timeline bars unshifted; frames/meta hierarchy intact; worker lens same indent.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bars.component` PASS (48/48).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-346.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-346-gantt-nest-indent-tint.lock`
**Next:** queue idle for Gantt IA visual; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-347 DONE вЂ” Gantt hide assembly/packaging
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-347
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `isGanttShopFloorNoiseName` + filter РІ `buildGanttBars` (РјРѕРґСѓР»СЊ/WT `/СЃР±РѕСЂРє|СѓРїР°РєРѕРІ/i`); only-noise в†’ skip 336; РєР°С‚Р°Р»РѕРі/wipe/346 CSS РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bar.model` PASS (37/37).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-347.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-347-gantt-hide-assembly-pack.lock`
**Next:** TZ-PRODUCTION-346 (CSS nest) READY; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-345 DONE вЂ” Gantt product-as-module В«С†РµР»РёРєРѕРјВ»
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** local-executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `resolveEstimateModules` + Р»РµР№Р±Р» `В«{product} В· С†РµР»РёРєРѕРјВ»` РґР»СЏ pseudo-module (`moduleId=productId` / `__product_whole__`); empty modules в†’ ineligible (336) Р±РµР· СЂРµРіСЂРµСЃСЃР°; order/worker trees 342вЂ“344 РѕРє.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bar.model|gantt-bars` PASS (2/80); cockpit 23/23.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-345.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-345-gantt-product-as-module.lock`
**Next:** WAVE IA DoD complete except deploy; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-343 DONE вЂ” Gantt RU labels + product/module frames
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** local-executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** kind-aware expand aria/title (РёР·РґРµР»РёРµ/РјРѕРґСѓР»СЊ/Р·Р°РєР°Р·); nested `gantt-product-group-*` / `gantt-module-group-*` frames; header `Р—Р°РєР°Р· В· РёР·РґРµР»РёРµ`; Р»РµР№Р±Р»С‹ РёР·РґРµР»РёРµ(+qty)/РјРѕРґСѓР»СЊ; tree 342 Рё worker 344 Р±РµР· РёР·РјРµРЅРµРЅРёР№.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bars.component` PASS (45/45).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-343.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-343-gantt-ia-labels-frames.lock`
**Next:** TZ-PRODUCTION-345 (product without modules); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-344 DONE вЂ” Gantt В«РџРѕ СЂР°Р±РѕС‡РёРјВ» Module+context + в–ё
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** local-executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `buildWorkerTreeBars` rematerialized: expand worker в†’ РјРѕРґСѓР»Рё СЃ Р»РµР№Р±Р»РѕРј `Р·Р°РєР°Р· В· РёР·РґРµР»РёРµ В· РјРѕРґСѓР»СЊ`, expand module в†’ РІРёРґС‹ СЂР°Р±РѕС‚; в–ё РЅР° worker; default collapsed; RO (РЅРµС‚ drag/resize); order lens 342 РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bar.model|gantt-bars|production-cockpit.page` PASS (3/100).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-344.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-344-gantt-workers-modules.lock`
**Next:** TZ-PRODUCTION-343 (RU labels) / 345; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-342 DONE вЂ” Gantt tree Orderв†’Productв†’Moduleв†’WT
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** local-executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `buildGanttTreeBars` rematerialized: expand order в†’ РёР·РґРµР»РёСЏ, product в†’ РјРѕРґСѓР»Рё, module в†’ РІРёРґС‹ СЂР°Р±РѕС‚; expand sets product/module; shell в–ё/frames/cascade/WT drag СЃРѕС…СЂР°РЅРµРЅС‹; estimate day math Р±РµР· РёР·РјРµРЅРµРЅРёР№; worker lens РЅРµ С‚СЂРѕРіР°Р»Рё (344).
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bar.model|gantt-bars|production-cockpit.page` PASS (3/97).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-342.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-342-gantt-tree-order-product-module.lock`
**Next:** TZ-PRODUCTION-343 (RU labels) / 344 (worker IA); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-341 DONE вЂ” Gantt hydrate throttle 429
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `PREFETCH_CONCURRENCY` 8в†’3; `getProduct`/`getModule` retry РЅР° 429/503 (backoff 300/800/1500); Р±РµР· retry РЅР° 404; unique prefetch + cache СЃРѕС…СЂР°РЅРµРЅС‹; estimate/PATCH/bars/BE throttle РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `production-read.facade` PASS (6/6).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-341.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-341-gantt-hydrate-throttle-429.lock`
**Next:** production idle; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-340 DONE вЂ” Gantt summary header tint
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `.gantt-order-group-start` С‡СѓС‚СЊ С‚РµРјРЅРµРµ/Р¶РµР»С‚РµРµ children wash (light `0.94/0.025/85` vs `0.97/0.012/95`; dark header `0.29/0.03/85`); meta-active background wins. Chevron/estimate/PATCH Р±РµР· РёР·РјРµРЅРµРЅРёР№.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `gantt-bars.component` PASS (43/43).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-340.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-340-gantt-summary-header-tint.lock`
**Next:** РѕС‡РµСЂРµРґСЊ production idle; deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZ-PRODUCTION-338 DONE вЂ” Gantt hydrate parallel + non-blocking thumbs
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff (code) + composer-executor (gates/closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Prefetch СѓРЅРёРєР°Р»СЊРЅС‹С… product/module ids (`runBounded` concurrency 8) РїРµСЂРµРґ `buildOrderEstimate`/`buildGanttBars`; bootstrap/reload РЅРµ Р¶РґС‘С‚ `getOrderThumbMap` РґРѕ bars. Estimate math / PATCH / filters Р±РµР· РёР·РјРµРЅРµРЅРёР№.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `production-read.facade|production-cockpit.page` PASS (2/27).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-338.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-338-gantt-hydrate-parallel.lock`
**Next:** TZ-PRODUCTION-339 (expand/group frames); deploy Р·Р°РїСЂРµС‰С‘РЅ.

## [2026-08-16] вЂ” TZD-51 READY FOR REVIEW вЂ” Desktop Excel Forms: СЃРїСЂР°РІРѕС‡РЅРёРєРё V2
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff (deepseek-v4-pro)
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW (РЅРµ archive РґРѕ Cursor/PO PASS); deploy РќР•
**Р§С‚Рѕ:** Form Studio + РєР°С‚РµРіРѕСЂРёСЏ В«РЎРїСЂР°РІРѕС‡РЅРёРєРёВ» в†’ 4 С‚Р°Р±Р»РёС†С‹ (СЃРєР»Р°РґС‹/РІРёРґС‹ СЂР°Р±РѕС‚/С†РІРµС‚Р° RAL/РєР°С‚РµРіРѕСЂРёРё) СЃ RU-РєРѕР»РѕРЅРєР°РјРё Рё `_kppdf`-С„РѕСЂРјРѕР№; РІР°Р»РёРґР°С†РёСЏ (enum type, hex, hourlyRate, skuPrefix, slug); dedupe РґРѕ POST в†’ `duplicate` РІ РѕС‚С‡С‘С‚Рµ, РЅРµ РїРёС€РµС‚СЃСЏ; write path POST `/api/warehouses|work-types|color-references|categories` + confirm.
**Gates:** desktop `tsc --noEmit` PASS; `svelte-check --threshold error` PASS (0/0); `tsx --test` 64/64 (+8).
**Checklist:** `docs/agent-checklists/TZD-51.md` (READY FOR REVIEW).
**Next:** Cursor/PO PASS в†’ archive `TZD-51.done.md` + lock; deploy ZIP С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-COMBINE-408 DONE вЂ” shop workType/days gate
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff (deepseek-v4-pro)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р’С…РѕРґ Р»РёРЅРёРё/РјРѕРґСѓР»СЏ РІ `shop` вЂ” 400 RU, РµСЃР»Рё РЅРµС‚ РІРёРґР° СЂР°Р±РѕС‚С‹ СЃ РѕС†РµРЅРєРѕР№ РґРЅРµР№ (override Р·Р°РєР°Р·Р° РёР»Рё РєР°С‚Р°Р»РѕРі `WorkType.days`); gate РІ `patchLineBoardLane`/`patchModuleLane`; FE СѓР¶Рµ РїРѕРєР°Р·С‹РІР°РµС‚ toast РёР· С‚РµР»Р° РѕС€РёР±РєРё. Auto-assign СЂР°Р±РѕС‡РёС… РќР•.
**Gates:** BE `tsc --noEmit` PASS; jest `src/modules/order` PASS (3 suites / 83, +8).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-408.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-408-shop-worktype-days-gate.lock`
**Next:** WAVE-FREEBUFF-COMBINE-MODULES Р·Р°РІРµСЂС€РµРЅР°; deploy С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-COMBINE-407 DONE вЂ” module DnD ghost
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff (deepseek-v4-pro)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** FE РљРѕРјР±Р°Р№РЅ: expand РёР·РґРµР»РёСЏ в†’ РјРѕРґСѓР»Рё (BOM top-level), DnD РјРѕРґСѓР»СЏ РїРѕ РєРѕР»РѕРЅРєР°Рј в†’ PATCH module lane, ghost В«РњРѕРґСѓР»СЊ РІ: {РєРѕР»РѕРЅРєР°}В» РїСЂРё СЂР°СЃС…РѕР¶РґРµРЅРёРё СЃ СЌС„С„РµРєС‚РёРІРЅРѕР№ РїРѕР»РѕСЃРѕР№ Р»РёРЅРёРё; РєР°СЂС‚РѕС‡РєР° Р»РёРЅРёРё СЃР»РµРґСѓРµС‚ min(moduleLanes); lane=shipped РїСЂРё DnD в†’ RU toast. РњР°С‚РµСЂРёР°Р»С‹ РЅРµ РєР°СЂС‚РѕС‡РєРё.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; `tsc -p tsconfig.spec.json --noEmit` PASS; jest `dashboard.page|orders.service` PASS (3 suites / 35, +6).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-407.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-407-module-dnd-ghost.lock`
**Next:** TZ-COMBINE-408 (shop workType/days gate); deploy С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-COMBINE-406 DONE вЂ” moduleLanes SoT (v1.1)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff (deepseek-v4-pro)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `Order.moduleLanes: [{lineId, moduleId, lane}]` sparse + `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane`; РїРѕР»РѕСЃР° Р»РёРЅРёРё = min(moduleLanes) РёР»Рё boardLane; rollup Order.status РїРѕ СЌС„С„РµРєС‚РёРІРЅРѕР№ РїРѕР»РѕСЃРµ; lane=shipped С‡РµСЂРµР· PATCH в†’ 400 RU.
**Gates:** BE `tsc --noEmit` PASS; jest `src/modules/order` PASS (3 suites / 75).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-406.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-406-module-lanes.lock`
**Next:** TZ-COMBINE-407 (module DnD ghost); deploy С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-DASHBOARD-401 DONE вЂ” home stats РІРёРґР¶РµС‚С‹ РѕР±Р·РѕСЂР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-executor-dashboard-401
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `/dashboard` denser RU: KPI Р·Р°РєР°Р·РѕРІ (GET /orders) + pulse СЃРєР»Р°РґР° (GET /inventory aggregate); loading/empty/error RU; Р±РµР· РєР°РЅР±Р°РЅР°. `dashboard.page.ts` РЅРµ С‚СЂРѕРЅСѓС‚.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `dashboard-stats|dashboard.page` PASS (3 suites / 23).
**Archive:** `tasks/_archive/2026-08/TZ-DASHBOARD-401.done.md`
**Lock:** `.mimocode/locks/TZ-DASHBOARD-401-home-stats-widgets.lock`
**Next:** Freebuff COMBINE modules; deploy С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO.

## [2026-08-16] вЂ” TZ-TEST-REGRESS-414 DONE вЂ” jest pack COMBINE+GANTT
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р РµРіСЂРµСЃСЃ-РїР°РєРµС‚: BE jest order.service|order.controller 62 PASS; FE jest dashboard.page|orders.service|production-cockpit|gantt 122 PASS; BE + FE tsc EXIT 0.
**Archive:** `tasks/_archive/2026-08/TZ-TEST-REGRESS-414.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-REGRESS-414-combine-gantt-jest-pack.lock`
**Next:** РІРѕР»РЅР° Freebuff 4h Р·Р°РІРµСЂС€РµРЅР° вЂ” РѕС‚С‡С‘С‚ PO.

## [2026-08-16] вЂ” TZ-TEST-OPS-413 DONE вЂ” docs link smoke COMBINE/GANTT
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** 0 broken `.page.md` СЃСЃС‹Р»РѕРє РІ PAGE-TZ-INDEX (41), 0 broken rel `.md` РІ COUPLING-MAP; design-combine boardLane в†” В§2b, production-cockpit В«РџРѕ СЂР°Р±РѕС‡РёРјВ» СЃРѕРіР»Р°СЃРѕРІР°РЅС‹.
**Gates:** docs-link smoke PASS.
**Archive:** `tasks/_archive/2026-08/TZ-TEST-OPS-413.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-OPS-413-docs-link-smoke.lock`
**Next:** TZ-TEST-REGRESS-414 (jest pack); deploy РќР•.

## [2026-08-16] вЂ” TZ-TEST-GANTT-402 DONE вЂ” specs В«РџРѕ СЂР°Р±РѕС‡РёРјВ»
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** +2 РєРµР№СЃР°: multi-person workerLabel = РѕРґРЅР° РіСЂСѓРїРїР° (known_limitation); worker work-detail read-only (РґРЅРё disabled, РЅРµС‚ catalog).
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `production-cockpit|gantt` PASS (3 suites / 93).
**Archive:** `tasks/_archive/2026-08/TZ-TEST-GANTT-402.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-GANTT-402-workers-view-specs.lock`
**Next:** TZ-TEST-OPS-413 (docs link smoke); deploy РќР•.

## [2026-08-16] вЂ” TZ-TEST-COMBINE-412 DONE вЂ” dashboard РґРѕРї. РєРµР№СЃС‹ РљРѕРјР±Р°Р№РЅР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** dashboard.page.spec +3: reverse drop designв†’prep patchLane; РєР°СЂС‚РѕС‡РєР° Р±РµР· lineId в†’ toast Р±РµР· PATCH; prepв†’shop РїСЂРё СѓР¶Рµ-shop Р±РµР· freeze modal.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `dashboard.page` PASS (2 suites / 17).
**Archive:** `tasks/_archive/2026-08/TZ-TEST-COMBINE-412.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-COMBINE-412-dashboard-extra-cases.lock`
**Next:** TZ-TEST-GANTT-402 (workers view specs); deploy РќР•.

## [2026-08-16] вЂ” TZ-TEST-COMBINE-411 DONE вЂ” FE orders.service.patchLane spec
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** orders.service.spec +2: patchLane PATCH `.../lines/:lineId/lane` body `{ lane }` (okв†’data) + http error в†’ `ok:false`.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `orders.service` PASS (12).
**Archive:** `tasks/_archive/2026-08/TZ-TEST-COMBINE-411.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-COMBINE-411-orders-service-patchlane.lock`
**Next:** TZ-TEST-COMBINE-412 (dashboard extra cases); deploy РќР•.

## [2026-08-16] вЂ” TZ-TEST-COMBINE-410 DONE вЂ” BE lane controller spec
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РќРѕРІС‹Р№ `order.controller.spec.ts` (thin): happy `shop` РґРµР»РµРіРёСЂСѓРµС‚, `shipped`в†’400, unknown lineIdв†’404; + service РєРµР№СЃ unknown lineId 404.
**Gates:** BE `tsc -p tsconfig.build.json --noEmit` PASS; jest `order.controller|order.service` PASS (2 suites / 62).
**Archive:** `tasks/_archive/2026-08/TZ-TEST-COMBINE-410.done.md`
**Lock:** `.mimocode/locks/TZ-TEST-COMBINE-410-lane-controller-spec.lock`
**Next:** TZ-TEST-COMBINE-411 (FE orders.service.patchLane spec); deploy РќР•.

## [2026-08-16] вЂ” TZ-GANTT-401 DONE вЂ” Gantt В«РџРѕ СЂР°Р±РѕС‡РёРјВ» (read-only)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** deepseek/deepseek-v4-pro (Freebuff)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Toggle В«РџРѕ Р·Р°РєР°Р·Р°Рј | РџРѕ СЂР°Р±РѕС‡РёРјВ» РІ РњР°СЃС€С‚Р°Р±-С„Р»Р°Р№Р°СѓС‚Рµ `/production`; worker-РіСЂСѓРїРїРёСЂРѕРІРєР° СЃС‚СЂРѕРє РїРѕ `workerLabel` (В«РќРµ РЅР°Р·РЅР°С‡РµРЅВ» РґР»СЏ РїСѓСЃС‚С‹С…), СЃРІРѕРґРЅР°СЏ СЃС‚СЂРѕРєР° РіСЂСѓРїРїС‹ + РІСЃРµРіРґР° СЂР°Р·РІС‘СЂРЅСѓС‚С‹Рµ РґРµС‚Рё; worker-СЂРµР¶РёРј read-only (РЅРµС‚ resize/drag). ACTIVE filter, buildGanttBars, facade РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; `tsc -p tsconfig.spec.json --noEmit` PASS; jest `gantt-bar.model|gantt-bars.component|production-cockpit.page` PASS (3 suites / 91).
**Archive:** `tasks/_archive/2026-08/TZ-GANTT-401.done.md`
**Lock:** `.mimocode/locks/TZ-GANTT-401-gantt-by-workers-readonly.lock`
**Code:** `036b5fd5`
**Next:** TZ-TEST-GANTT-402 (deepen specs); deploy РќР•.

## [2026-08-16] вЂ” TZ-COMBINE-405 DONE вЂ” FE item DnD + freeze + ship-whole
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** CDK DnD РєР°СЂС‚РѕС‡РµРє в†’ patchLane; freeze modal РЅР° РїРµСЂРІС‹Р№ shop; РґСЂРѕРї РІ В«РћС‚РіСЂСѓР¶РµРЅС‹В» в†’ toast N / confirmShip POST ship; optimistic+rollback.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `dashboard.page` PASS (14).
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-405.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-405-combine-item-dnd.lock`
**Next:** COMBINE-406/407 modules; warm deploy after 402вЂ“405 PASS.

## [2026-08-16] вЂ” TZ-COMBINE-404 DONE вЂ” FE item cards + boardLane columns
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РљРѕРјР±Р°Р№РЅ = flat OrderItem cards by boardLane (RU+helper); filter orderId; click в†’ order edit; patchLane stub for 405; DnD РЅРµС‚.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `dashboard.page` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-404.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-404-combine-item-cards.lock`
**Next:** TZ-COMBINE-405 DnD; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-COMBINE-403 DONE вЂ” PATCH line boardLane + Order.status rollup
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `PATCH /orders/:id/lines/:lineId/lane`; derive item.status; rollup Order.status (Opus В§2); reject shipped via PATCH; delete line only if prep.
**Gates:** BE `tsc -p tsconfig.build.json --noEmit` PASS; jest `order.service` 1 suite / 58 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-403.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-403-patch-lane-rollup.lock`
**Next:** TZ-COMBINE-404/405 FE; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-COMBINE-403 DONE вЂ” PATCH line boardLane + Order.status rollup
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `PATCH /orders/:id/lines/:lineId/lane`; derive item.status; rollup Order.status; reject lane=shipped; delete line only if prep.
**Gates:** BE `tsc -p tsconfig.build.json --noEmit` PASS; jest `order.service` 1 suite / 58 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-403.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-403-patch-lane-rollup.lock`
**Next:** TZ-COMBINE-404/405 FE; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-COMBINE-402 DONE вЂ” OrderItem.lineId + boardLane
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Schema `lineId` + `boardLane` (prep|design|shop|to_ship|shipped); create uuid+prep+pending; find backfill `legacy-{i}-{orderId}` + statusв†’lane; no PATCH lane.
**Gates:** BE `tsc -p tsconfig.build.json --noEmit` PASS; jest `order.service` 1 suite / 48 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-COMBINE-402.done.md`
**Lock:** `.mimocode/locks/TZ-COMBINE-402-order-item-lineid-boardlane.lock`
**Next:** TZ-COMBINE-403 lane PATCH + Order.status rollup; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-NAV-305 DONE вЂ” РџСЂРѕРµРєС‚: РљРѕРјР±Р°Р№РЅ first, then РћС‡РµСЂРµРґСЊ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Nav В«РџСЂРѕРµРєС‚В» вЂ” `design.items` РљРѕРјР±Р°Р№РЅ в†’ РћС‡РµСЂРµРґСЊ; `entryPath` в†’ `/design/combine`; specs + docs one-liners.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `app-layout` 2 suites / 18 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-NAV-305.done.md`
**Lock:** `.mimocode/locks/TZ-NAV-305-project-combine-first.lock`
**Next:** deploy by orchestrator; PHOTO/kanban write-path РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ.

## [2026-08-16] вЂ” TZ-PHOTO-304 DONE вЂ” photo frame meta (fit/posX/posY)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (WIP) + cursor-composer unattended land
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** `Photo.frame` schema + Create/UpdateFrame DTO + `PATCH /photos/:id/frame` + FE `PhotoFrame`/`updateFrame`; default contain/center.
**Gates:** BE tsc PASS; jest photos 4 suites / 13 tests PASS; FE tsc PASS; FE photos.service.spec 8 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-304.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-304-photo-frame-meta.lock`
**Next:** TZ-UX-PHOTO-302 dropzone UI; TZ-UX-PHOTO-303 consumers; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-NAV-303 DONE вЂ” РљРѕРјР±Р°Р№РЅ в†’ РџСЂРѕРµРєС‚; home = РћР±Р·РѕСЂ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy (impl) + cursor-composer (S1 land + archive)
**РЎС‚Р°С‚СѓСЃ:** DONE; PO-authorized unattended finish; deploy РќР•
**Р§С‚Рѕ:** Home `/`+`/dashboard` = `DashboardStatsPage` stub В«РћР±Р·РѕСЂВ»; РєР°РЅР±Р°РЅ в†’ `/design/combine` (РџСЂРѕРµРєС‚); brand В«РћР±Р·РѕСЂ вЂ” РіР»Р°РІРЅР°СЏВ»; deals Р±РµР· РљРѕРјР±Р°Р№РЅ chip; S1 `destructive: false` РЅР° non-overdue `statCards`.
**Gates:** FE `tsc -p tsconfig.app.json --noEmit` PASS; jest `app-layout|dashboard-stats|deals-group-chips` 3 suites / 20 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-NAV-303.done.md`
**Lock:** `.mimocode/locks/TZ-NAV-303-combine-to-design-home-stats.lock`
**Next:** TZ-DASHBOARD-401 (full widgets); PHOTO-304 DONE; deploy by orchestrator.

## [2026-08-16] вЂ” TZ-OPS-SITE-SMOKE-401 DONE вЂ” site operator walk PASS
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** DeepC 4 Pro (live walk) + cursor-composer (docs-only closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** Р–РёРІРѕР№ РѕР±С…РѕРґ 24 routes (PASS/SKIP/stub); P0 catalog write paths OK; product code РЅРµ РјРµРЅСЏР»СЃСЏ. Findings: S1 в†’ NAV-303 (`dashboard-stats.page.ts` TS2339 `destructive`); S2 в†’ `TZ-DATA-UTF8-CLEAN` PARK.
**Gates:** N/A (docs-only closeout; no product commit).
**Review:** Cursor Verdict PASS (docs-only).
**Archive:** `tasks/_archive/2026-08/TZ-OPS-SITE-SMOKE-401.done.md`
**Journal:** `docs/audits/2026-08-16-site-operator-walk.md`
**Commit:** `72ba21a8febff130627c7cb4a5307d24a041ae78`
**Lock:** `.mimocode/locks/TZ-OPS-SITE-SMOKE-401.lock`
**Next:** NAV-303 owns S1; UTF8-CLEAN stays PARK; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-OPS-313вЂ¦316 DONE вЂ” confidence ledger P2 remediation
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** P2 executor + cursor-composer (315 regression fix + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:**
- **315** CreateOrderDto `draft|confirmed` + CREATE_ALLOWED_STATUSES; **regression fix:** UpdateOrderDto `OmitType(вЂ¦,['status'])` + PATCH IsIn `draft|confirmed|in_production|ready` (РЅРµ РЅР°СЃР»РµРґСѓРµС‚ create-only); ValidationPipe spec accepts ready/in_production, rejects shipped.
- **314** director РІ @Roles РЅР° catalog GET (18 controllers; photos WIP excluded).
- **316** materials expand: СѓР±СЂР°РЅ В«РћСЃС‚Р°С‚РѕРєВ» РёР· Material.stockQty; СЃСЃС‹Р»РєР° В«РЎРєР»Р°Рґ в†’В».
- **313** PAGE-TZ-INDEX Р±РёС‚С‹Рµ СЃСЃС‹Р»РєРё + COUPLING-MAP combine path.
**Gates:** BE `tsc` + jest `order.service|create-order|update-order` 50/50 PASS (315); prior P2 gates for 314/316.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-313.done.md` вЂ¦ `TZ-OPS-316.done.md`
**Commits:** 315 `aba3842b` В· 314 `9ddadae2` В· 316 `a1ad0e35` В· 313 `18d9b915`
**Locks:** `.mimocode/locks/TZ-OPS-313-вЂ¦` вЂ¦ `TZ-OPS-316-вЂ¦`
**Next:** queue empty for this wave; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-OPS-CONFIDENCE-LEDGER-401 DONE вЂ” confidence ledger (LEDGER-01..12)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (freebuff audit) + cursor-composer closeout
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS (audit wave); deploy РќР•
**Р§С‚Рѕ:** 11 scorecards + `docs/audits/confidence/00-ROLLUP.md`; overall min **86** / median **91**; P0 **0**; P2 backlog TZ-OPS-313вЂ¦316 (later remediated вЂ” see entry above).
**Gates:** LEDGER-11 FE/BE/desktop tsc PASS; jest sample PASS (СЃРј. 11-gates.md).
**Review:** Cursor Verdict PASS вЂ” closeout-only; remediation out of scope.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-CONFIDENCE-LEDGER-401.done.md`
**Commit:** `7c8822544515f97f4b4fb39120a6447e8f25c668`
**Lock:** `.mimocode/locks/TZ-OPS-CONFIDENCE-LEDGER-401.lock`
**Next:** WAVE-CONFIDENCE-LEDGER-FLASH DONE; 313вЂ¦316 remediated separately; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-328 DONE вЂ” `/materials` chrome page-tools
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer (frontend executor + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** `/materials` filters/view/refresh в†’ `PiChromeToolsService` owner `materials-page`; w-12 `filters-rail` СЃРЅСЏС‚; flyout overlay + &lt;1680 fallback (Р·РµСЂРєР°Р»Рѕ UX-326).
**Gates:** FE tsc PASS; materials.page Jest 27/27 PASS.
**Review:** Cursor Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-UX-328.done.md`
**Commit:** `e7b3c88ba550333c7c581fb6ae87e8ce6c417abb`
**Lock:** `.mimocode/locks/TZ-UX-328-materials-chrome-page-tools.lock`
**Next:** WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE #3 DONE; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-CATALOG-375 DONE вЂ” materials list expandable preview
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (frontend executor)
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** `/materials` list row-click в†’ gold expand tray (РРґРµРЅС‚РёС„РёРєР°С†РёСЏ / РџРѕСЃС‚Р°РІС‰РёРє / Р“РµРѕРјРµС‚СЂРёСЏ / Р¦РµРЅР° Рё СЃРєР»Р°Рґ / РћРїРёСЃР°РЅРёРµ); detail via name / В«РћС‚РєСЂС‹С‚СЊ РєР°СЂС‚РѕС‡РєСѓВ».
**Gates:** FE tsc PASS; materials.page Jest 25/25 PASS.
**Review:** Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-375.done.md`
**Commit:** `1322248d764ad05903b3f14b31b4809b4d9c06ac`
**Lock:** `.mimocode/locks/TZ-CATALOG-375-materials-list-expand.lock`
**Next:** STOP for this TZ; grid expand = known_limitation; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-PRODUCTION-337 DONE вЂ” workshop ACTIVE exclude draft
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** frontend executor + cursor-closeout
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** С†РµС… В«Р’СЃРµ Р°РєС‚РёРІРЅС‹РµВ» = confirmed/in_production/ready (Р±РµР· draft); Couplings + COUPLING-MAP РєРѕРґ=РєР°РЅРѕРЅ.
**Gates:** FE tsc PASS; focused Jest 3 suites / 53 tests PASS.
**Review:** Cursor PASS вЂ” ACTIVE set; known_limitation selected bypass for draft `?orderId=`.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md`
**Commit:** `6e6b492237a9b7f23b7ae08acb99b94a0ea1c6cd`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-337-workshop-exclude-draft.lock`
**Next:** STOP for this TZ; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-344 DONE вЂ” showcase photo contain
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-ux344-WIN-LOQVGED63JM-28704
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** `pi-showcase-card` media img `object-fit: contain` + `object-position: center`; removed md cover override; spec asserts contain.
**Gates:** FE tsc PASS; pi-showcase-card Jest 12/12 PASS.
**Review:** Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-344.done.md`
**Commit:** `0dec96e9`
**Lock:** `.mimocode/locks/TZ-UX-344-showcase-photo-contain.lock`
**Next:** STOP for this TZ; list-thumb cover = known_limitation / successor; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-342 DONE вЂ” KP rail pager + dead totals
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** KP rail в†’ `app-pi-pagination` (PAGE_SIZE 10, `showPageSize=false`); dead `[total]` removed on inventory/supply/dict/doc lists; documents/templates unused РџРѕРєР°Р·Р°РЅРѕ helpers cleaned; forms demo 5в†’10.
**Gates:** FE tsc PASS; focused Jest 14 suites / 109 tests PASS.
**Review:** Cursor Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-UX-342.done.md`
**Commit:** `db689987256bbc8e054e1838aacc1417aa5ac14f`
**Lock:** `.mimocode/locks/TZ-UX-342-pager-dead-totals.lock`
**Next:** STOP for this TZ; WAVE-UX-PAGINATION-UNIFY #1вЂ“#3 DONE; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-341 DONE вЂ” catalog grid pager в†’ pi-pagination
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; REVIEW not required; deploy РќР•
**Р§С‚Рѕ:** products/modules/materials grid custom pager в†’ `app-pi-pagination`; products 15в†’10; `pageSizeChange` resets page 1; modules grid slice via `paginatedRows()`.
**Gates:** FE tsc PASS; products|modules|materials page Jest 69/69 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-341.done.md`
**Commit:** `c1e5d1c5`
**Lock:** `.mimocode/locks/TZ-UX-341-catalog-grid-pager-unify.lock`
**Next:** TZ-UX-342 (already READY FOR REVIEW); deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-331 DONE вЂ” Brand home chip в†’ РљРѕРјР±Р°Р№РЅ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** Р±СЂРµРЅРґ В«KPPDF В· 8.0В» РІ С€Р°РїРєРµ вЂ” РІРёРґРёРјС‹Р№ home-chip (`nav-brand-home`, sunrise soft + gold marker, hover/focus); `routerLink="/"` в†’ РљРѕРјР±Р°Р№РЅ; aria/title В«РљРѕРјР±Р°Р№РЅ Р·Р°РєР°Р·РѕРІ вЂ” РіР»Р°РІРЅР°СЏВ»; РєР°РЅРѕРЅ dashboard/page-chrome/PAGE-TZ-INDEX.
**Gates:** FE tsc PASS; app-layout Jest 8/8 PASS.
**Review:** Cursor Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-UX-331.done.md`
**Commit:** `9e4103380527d169ab20a18ab03f452a199f6bfa`
**Lock:** `.mimocode/locks/TZ-UX-331-brand-home-combine.lock`
**Next:** STOP for this TZ; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-CATALOG-374 DONE вЂ” `/modules` list expandable СЃРѕСЃС‚Р°РІ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** РєР»РёРє РїРѕ СЃС‚СЂРѕРєРµ РјРѕРґСѓР»СЏ РІ list СЂР°СЃРєСЂС‹РІР°РµС‚ gold-soft tray СЃРѕСЃС‚Р°РІР° (`getModuleTree`); detail С‡РµСЂРµР· РёРјСЏ / В«РћС‚РєСЂС‹С‚СЊ РєР°СЂС‚РѕС‡РєСѓВ»; empty/loading/error RU; `expandedSection` Р·Р°РґРµР» Р±РµР· РїСѓСЃС‚С‹С… РІРєР»Р°РґРѕРє; grid Р±РµР· expand.
**Gates:** FE tsc PASS; modules.page Jest 24/24 PASS.
**Review:** Cursor architect Verdict PASS (closeout-only).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-374.done.md`
**Commit:** `215b89fb4a551f3aeefdd2a71174e5752f9a1f54`
**Lock:** `.mimocode/locks/TZ-CATALOG-374-modules-list-expand.lock`
**Next:** STOP for this TZ; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-327 DONE вЂ” `/modules` chrome page-tools
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** composer-frontend-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** РІРѕСЂРѕРЅРєР° С„РёР»СЊС‚СЂР° РњРѕРґСѓР»РµР№ РІ `app-chrome-rail` РїРѕРґ в†ђ; РІРёРґ+РћР±РЅРѕРІРёС‚СЊ СЃРїСЂР°РІР°; Р»РѕРєР°Р»СЊРЅС‹Р№ `w-12` СЃРЅСЏС‚; flyout overlay СЃРѕС…СЂР°РЅС‘РЅ; <1680 вЂ” icon-fallback РІ toolbar.
**Gates:** FE tsc PASS; modules.page Jest 27/27 PASS.
**Review:** Cursor Verdict PASS (PO: Р·Р°РєСЂС‹С‚СЊ Р±РµР· РґРµРїР»РѕСЏ).
**Archive:** `tasks/_archive/2026-08/TZ-UX-327.done.md`
**Commit:** 8b59195a3a76b47f9fb81bffb685036640fcc83b
**Lock:** `.mimocode/locks/TZ-UX-327-modules-chrome-page-tools.lock`
**Next:** TZ-UX-328 materials chrome РїРѕ PO; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-326 DONE вЂ” `/products` chrome page-tools
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** РІРѕСЂРѕРЅРєР° С„РёР»СЊС‚СЂР° РџСЂРѕРґСѓРєС†РёРё РІ `app-chrome-rail` РїРѕРґ в†ђ; РІРёРґ+РћР±РЅРѕРІРёС‚СЊ СЃРїСЂР°РІР°; Р»РѕРєР°Р»СЊРЅС‹Р№ `w-12` СЃРЅСЏС‚; flyout overlay СЃРѕС…СЂР°РЅС‘РЅ; &lt;1680 вЂ” icon-fallback РІ toolbar.
**Gates:** FE tsc PASS; products.page Jest 24/24 PASS.
**Review:** Cursor self-review PASS (PO: Р·Р°РєСЂС‹С‚СЊ Р±РµР· РґРµРїР»РѕСЏ).
**Archive:** `tasks/_archive/2026-08/TZ-UX-326.done.md`
**Commit:** `da5bf969c31d3939f376758da0c9ae4bb9888646`
**Lock:** `.mimocode/locks/TZ-UX-326-products-chrome-page-tools.lock`
**Next:** TZ-UX-327 РїРѕ PO; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UX-332 DONE вЂ” Product edit `_id` + RU not-found
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** РґР°С€Р±РѕСЂРґ РѕС‚РєСЂС‹РІР°РµС‚ РёР·РґРµР»РёРµ С‡РµСЂРµР· `findById` (РїРѕР»РЅС‹Р№ `Product._id`); Save Р±РѕР»СЊС€Рµ РЅРµ Р±СЊС‘С‚ `PATCH /products/undefined`; 404 not-found РІ UI РїРѕ-СЂСѓСЃСЃРєРё; РєРёСЂРёР»Р»РёС†Р° РІ РёРјРµРЅРё С„РѕС‚Рѕ РґРµРєРѕРґРёСЂСѓРµС‚СЃСЏ СЃ latin1 Multer.
**Gates:** FE tsc PASS; FE jest 3/35; BE tsc PASS; BE jest 5/14.
**Review:** Cursor self-review PASS (PO: Р·Р°РєСЂС‹С‚СЊ Р±РµР· РґРµРїР»РѕСЏ).
**Archive:** `tasks/_archive/2026-08/TZ-UX-332.done.md`
**Commit:** `e45bfcccd049315561d15873f672569dde16783a`
**Lock:** `.mimocode/locks/TZ-UX-332-product-edit-undefined-ru-errors.lock`
**Next:** STOP for this TZ; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZD-48 DONE вЂ” Desktop Import Studio release blockers
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / С„РѕРЅРѕРІС‹Р№ desktop РёСЃРїРѕР»РЅРёС‚РµР»СЊ
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; commit b03ecc22060f4d20c6d559c043910ea4701b5d87 pushed (e108e22a..b03ecc22 в†’ main); deploy РќР•
**Р§С‚Рѕ:** СЃРЅСЏС‚С‹ 10 Р±Р»РѕРєРµСЂРѕРІ СЂРµР»РёР·Р° 0.5.3: AI-runner `/download` Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ + mkdir models + URL allowlist HF + РЅРµ-sticky missing-file; С‡Р°СЃС‚РёС‡РЅС‹Р№ merge AI-РєР°СЂС‚С‹ (РЅРµ РѕР±РЅСѓР»СЏРµС‚ СЌРІСЂРёСЃС‚РёРєРё); С‡РµСЃС‚РЅРѕСЃС‚СЊ SoT (non-material В«Р—Р°РїРёСЃР°С‚СЊ РІ РєР°С‚Р°Р»РѕРіВ» + confirm, processed/ С‚РѕР»СЊРєРѕ РїСЂРё proposed+created>0); inbox Excel вЂ” Р»РёСЃС‚ СЃ РґР°РЅРЅС‹РјРё; counterparty inn required; bom СѓР±СЂР°РЅ РёР· enum + guard; BE 400 РЅР° РїСѓСЃС‚РѕР№ РїСЂРѕС„РёР»СЊ + РЅРѕСЂРјР°Р»РёР·Р°С†РёСЏ legacy columnMap; РєРѕРїРё В«РњРѕРґРµР»СЊВ» Р—Р°РїСѓСЃС‚РёС‚СЊв†’РЎРєР°С‡Р°С‚СЊв†’РџРµСЂРµР·Р°РїСѓСЃС‚РёС‚СЊ.
**Gates:** desktop tsc PASS; svelte-check 0/0; desktop tests 46/46 (РІРєР». partial AI map, inn, sheet-with-data, URL allowlist); backend jest 12/12 (empty profile 400, dual-state normalize); smoke ai-runner PASS.
**Review:** Cursor PASS (b03ecc22060f4d20c6d559c043910ea4701b5d87).
**Archive:** `tasks/_archive/2026-08/TZD-48.done.md`
**Lock:** `.mimocode/locks/TZD-48-desktop-import-studio-release-blockers.lock`
**Known limit:** Р¶РёРІРѕР№ GGUF-РїСЂРѕРіРѕРЅ РЅРµ РґРµР»Р°Р»СЃСЏ (С‚СЂР°С„РёРє); journal HITL РґР»СЏ product/module/counterparty, СЂР°Р·РјРµСЂС‹/РІРµСЃ CAD, session-per-chat Llama вЂ” successor TZD-49 (PARK).
**Next:** STOP; РЅРѕРІС‹С… TZ РЅРµ Р±СЂР°С‚СЊ. Р’РµСЂСЃРёСЏ 0.5.3 РіРѕС‚РѕРІР° Рє СЃР±РѕСЂРєРµ РёРЅСЃС‚Р°Р»Р»СЏС‚РѕСЂР°.

## [2026-08-16] вЂ” TZ-PRODUCTION-336 DONE вЂ” Gantt skip orders without modules
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** РЅР° Р“Р°РЅС‚ РЅРµ РєР»Р°РґСѓС‚СЃСЏ Р·Р°РєР°Р·С‹ Р±РµР· РїСЂСЏРјС‹С… РјРѕРґСѓР»РµР№/РІРёРґРѕРІ СЂР°Р±РѕС‚; С€Р°РїРєР° Р±РµР· СЃРїР°РјР° В«РЅРµС‚ РїСЂСЏРјС‹С… РјРѕРґСѓР»РµР№В»; rail РїРѕРєР°Р·С‹РІР°РµС‚ РёС… СЃ РјР°СЂРєРµСЂРѕРј В«РЅРµС‚ РїР»Р°РЅР°В»; toast С‚РѕР»СЊРєРѕ РїСЂРё РІС‹Р±РѕСЂРµ / `?orderId=`.
**Gates:** FE tsc PASS; focused Jest 4 suites / 56 tests PASS; eslint owned files PASS (pre-existing OnInit warning).
**Review:** Cursor PASS вЂ” eligibility = `buildGanttBars`; header spam gone; toast on attempt only.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-336.done.md`
**Commit:** `1650cb22`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-336-gantt-skip-orders-without-modules.lock`
**Next:** STOP for this TZ; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-FRONTEND-305 DONE вЂ” dashboard dialog boundary
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; scoped score 100/100; deploy РќР•
**Р§С‚Рѕ:** DashboardPage Р±РѕР»СЊС€Рµ РЅРµ РёРјРїРѕСЂС‚РёСЂСѓРµС‚ sibling page dialogs; `DashboardDialogService` СЃРѕС…СЂР°РЅСЏРµС‚ lazy Order/Product dialog payloads Рё reload-after-close. РљР°РЅР±Р°РЅ write-path Рё UX РЅРµ РјРµРЅСЏР»РёСЃСЊ.
**Gates:** FE tsc PASS; dashboard + coordinator Jest 2 suites / 7 tests PASS; ESLint/Prettier/diff-check PASS; architecture:check PASS (948 files; baseline 6).
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-305.done.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-305-dashboard-dialog-boundary.lock`
**Score:** TZ scoped acceptance 100/100; deploy РѕС‚Р»РѕР¶РµРЅ РґРѕ Р·Р°РІС‚СЂР°.

## [2026-08-16] вЂ” TZ-FRONTEND-304 DONE вЂ” composition dialog boundary
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; scoped score 100/100; deploy РќР•
**Р§С‚Рѕ:** СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ Product/Module/Material page-dialog imports РІС‹РЅРµСЃРµРЅС‹ РёР· shared composition UI РІ `ProductCompositionDialogService`; UX, composition API/write-path, cost hints Рё close refresh СЃРѕС…СЂР°РЅРµРЅС‹. РћСЃС‚Р°С‚РѕС‡РЅС‹Р№ API ownership РїР°РЅРµР»Рё Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ РєР°Рє РѕС‚РґРµР»СЊРЅС‹Р№ successor.
**Gates:** FE tsc PASS; baseline composition/QuickCreate 3 suites / 38 tests PASS; final unique gate 5 suites / 69 tests PASS (module detail + product form included); ESLint/Prettier/diff-check PASS. Architecture check blocked only by pre-existing dashboard cross-page imports at lines 19,26.
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-304.done.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-304-composition-dialog-boundary.lock`
**Score:** TZ scoped acceptance 100/100; deploy РќР•; next action = explicit PO choice.

## [2026-08-16] вЂ” TZ-SWEEP-401 DONE вЂ” Kanban order write-path
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor Verdict PASS; deploy РќР•
**Р§С‚Рѕ:** order status FSM С‚РµРїРµСЂСЊ РїСЂРёРЅРёРјР°РµС‚ PATCH С‚РѕР»СЊРєРѕ РїРѕ draftв†”confirmedв†”in_productionв†”ready; shipped/delivered/cancelled Р·Р°С‰РёС‰РµРЅС‹ RU-РѕС€РёР±РєРѕР№ Р±РµР· РјСѓС‚Р°С†РёР№; ship() СЃРѕР·РґР°С‘С‚ РѕС‚РіСЂСѓР·РєСѓ Рё РїРµСЂРµРІРѕРґРёС‚ РІСЃРµ items РІ shipped. РљР°РЅР±Р°РЅ РїРѕР»СѓС‡РёР» optimistic PATCH/rollback/toast, РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РѕС‚РіСЂСѓР·РєРё Рё РєРѕСЂСЂРµРєС‚РЅС‹Р№ item.status/readiness; С„РѕСЂРјР° Рё РЅР°РІРёРіР°С†РёСЏ В«РљРѕРјР±Р°Р№РЅВ» в†’ `/dashboard` СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹.
**Gates:** BE tsc PASS; order.service Jest 42/42; BE ESLint PASS; FE tsc PASS; focused FE Jest 26/26 + follow-up dashboard spec 5/5 (`7f81c949`) + СЃРјРµР¶РЅС‹Рµ 62/62; FE ESLint/Prettier/diff-check PASS.
**Review:** Cursor independent review PASS, 8/8 acceptance points, no blockers.
**Archive:** `tasks/_archive/2026-08/TZ-SWEEP-401.done.md`
**Lock:** `.mimocode/locks/TZ-SWEEP-401-kanban-order-write-path.lock`
**Next:** STOP; deploy РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-16] вЂ” TZ-UI-PHOTO-343 DONE вЂ” catalog photo-entry sweep
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-COMPOSE-CREATE-PHOTO complete; deploy РќР•
**Р§С‚Рѕ:** product/material primary photo controls migrated to `app-pi-photo-dropzone`; module form/detail and QuickCreate paths verified; catalog primary photo entries now share file + drag-and-drop + Ctrl+V. Module detail URL remains collapsed secondary; organization/document-constructor asset uploaders documented as intentional non-catalog workflows.
**Gates:** FE tsc PASS; Jest product/material/dropzone 3 suites / 77 tests PASS; module-detail + QuickCreate 2 suites / 19 tests PASS; lint PASS СЃ 18 СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРјРё Р°СЂС…РёС‚РµРєС‚СѓСЂРЅС‹РјРё РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёСЏРјРё; owned Prettier PASS; diff-check PASS. Docs Prettier reports existing markdown drift; broad reformat not applied.
**Archive:** `tasks/_archive/2026-08/TZ-UI-PHOTO-343.done.md`
**Lock:** `.mimocode/locks/TZ-UI-PHOTO-343-photo-sweep.lock`
**Score:** WAVE 4/4; all phases archived; next action STOP.

## [2026-08-16] вЂ” TZ-MODULES-341 DONE вЂ” module photo upload form/detail/QC
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** module form and QuickCreate L upload through shared dropzone/PhotosService and link via ProductModulePhotosService `photoId`; module detail file upload is primary, URL is collapsed secondary; module photo links use one API path.
**Gates:** FE tsc PASS; Jest module form/detail + QuickCreate + dropzone + product/material forms 6 suites / 101 tests PASS; lint PASS СЃ 18 СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРјРё Р°СЂС…РёС‚РµРєС‚СѓСЂРЅС‹РјРё РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёСЏРјРё; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-MODULES-341.done.md`
**Lock:** `.mimocode/locks/TZ-MODULES-341-module-photo-upload.lock`
**Dep:** TZ-UI-PHOTO-342 (`c523237c`)

## [2026-08-16] вЂ” TZ-UI-PHOTO-342 DONE вЂ” shared photo dropzone paste + RU hint
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** dropzone РїСЂРёРЅРёРјР°РµС‚ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РёР· Ctrl+V РїСЂРё hover/focus, РёРіРЅРѕСЂРёСЂСѓРµС‚ С‚РµРєСЃС‚/РЅРµ-image clipboard, СЃРѕС…СЂР°РЅСЏРµС‚ upload/delete ownership Сѓ parent; hint СѓРЅРёС„РёС†РёСЂРѕРІР°РЅ РєР°Рє В«Р¤Р°Р№Р» СЃ РґРёСЃРєР° В· РїРµСЂРµС‚Р°С‰РёС‚СЊ В· Ctrl+VВ».
**Gates:** FE tsc PASS; Jest dropzone + QuickCreate + product/material forms 4 suites / 91 tests PASS; lint PASS СЃ 18 СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРјРё Р°СЂС…РёС‚РµРєС‚СѓСЂРЅС‹РјРё РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёСЏРјРё; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-PHOTO-342.done.md`
**Lock:** `.mimocode/locks/TZ-UI-PHOTO-342-photo-dropzone-paste.lock`
**Dep:** TZ-CATALOG-340

## [2026-08-16] вЂ” TZ-CATALOG-340 DONE вЂ” Composition picker В«РЎРѕР·РґР°С‚СЊВ» в†’ QuickCreate
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** picker СЂСЏРґРѕРј СЃ В«Р§С‚Рѕ РґРѕР±Р°РІРёС‚СЊВ» РѕС‚РєСЂС‹РІР°РµС‚ product/module QuickCreate РёР»Рё material create form РїРѕ Р°РєС‚РёРІРЅРѕР№ РІРєР»Р°РґРєРµ; СѓСЃРїРµС€РЅС‹Р№ СЂРµР·СѓР»СЊС‚Р°С‚ СЃСЂР°Р·Сѓ РґРѕР±Р°РІР»СЏРµС‚СЃСЏ РІ options Рё РІС‹Р±РёСЂР°РµС‚СЃСЏ Р±РµР· СЃР±СЂРѕСЃР° РєРѕР»РёС‡РµСЃС‚РІР°; BOM write path РЅРµ РјРµРЅСЏР»СЃСЏ.
**Gates:** FE tsc PASS; Jest picker + BOM panel + QuickCreate 3 suites / 38 tests PASS; lint PASS СЃ 18 СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРјРё Р°СЂС…РёС‚РµРєС‚СѓСЂРЅС‹РјРё РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёСЏРјРё; owned Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-340.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-340-composition-picker-create.lock`
**Dep:** none

## [2026-08-15] вЂ” TZ-ORDERS-337 DONE вЂ” Composition-tree pencil + list forest
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РєР°СЂР°РЅРґР°С€ РЅР° СЃС‚СЂРѕРєР°С… СЃРѕСЃС‚Р°РІР°; Р»РёСЃС‚ РёР·РґРµР»РёСЏ/РјРѕРґСѓР»СЏ РѕС‚РєСЂС‹РІР°РµС‚ РєР°С‚Р°Р»РѕРі; expand СЃРїРёСЃРєР° = `app-composition-tree`; В«РџР°СЃРїРѕСЂС‚ Р·Р°РєР°Р·Р°В» в†’ В«Р—Р°РєР°Р·В».
**Gates:** FE tsc PASS; Jest composition-tree + order-detail + orders.page + forest + bom-panel **48 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-337.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-337-order-composition-edit.lock`
**Dep:** TZ-ORDERS-336

## [2026-08-15] вЂ” TZ-ORDERS-336 DONE вЂ” Order form productId + default Site + freeze
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** onProductPick РїРёС€РµС‚ productId; РїСѓСЃС‚РѕР№ РѕР±СЉРµРєС‚ в†’ ensure-default Site; freeze in_production/ready С‚РѕР»СЊРєРѕ РїР»Р°РЅ/РїСЂРёРѕСЂРёС‚РµС‚; date input + ship default.
**Gates:** FE+BE tsc PASS; FE Jest order-form-dialog **9 PASS**; BE site.service **4 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-336.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-336-order-form-save-site-freeze.lock`
**Dep:** none

## [2026-08-15] вЂ” TZ-PRODUCTION-335 DONE вЂ” Gantt sort by start + clean order-meta
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р“Р°РЅС‚/rail вЂ” СЂР°РЅСЊС€Рµ startDate РІС‹С€Рµ (tie orderNumber); meta: РЎС‚Р°С‚СѓСЃ Р·Р°РєР°Р·Р° / Р’Р°Р¶РЅРѕСЃС‚СЊ / РќР°С‡Р°Р»Рѕ РїР»Р°РЅР°; auto-save silent optimistic; СѓР±СЂР°РЅС‹ hint Рё РєРЅРѕРїРєР° РЎРѕС…СЂР°РЅРёС‚СЊ.
**Gates:** FE tsc PASS; FE Jest gantt-bar.model + gantt-bars + production-cockpit + orders-rail **85 PASS**; lint owned files PASS (pre-existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-335.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-335-gantt-sort-meta-clean.lock`
**Dep:** 333

## [2026-08-15] вЂ” TZ-PRODUCTION-334 DONE вЂ” Workers list limit 100 (no 400)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** cockpit `getWorkersByWorkType` в†’ `workersApi.list({ limit: 100, isActive: true })`; BE `@Max(100)`; spec asserts limit 100.
**Gates:** FE tsc PASS; FE Jest production-read.facade.spec **2 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-334.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-334-workers-list-limit.lock`
**Dep:** none

## [2026-08-15] вЂ” TZ-PRODUCTION-333 DONE вЂ” Optimistic Gantt drag, no full reload
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** resize / summary plannedDate / child start-offset вЂ” optimistic local bars + silent PATCH; fail в†’ revert + error toast; В«РћР±РЅРѕРІРёС‚СЊВ» РїРѕ-РїСЂРµР¶РЅРµРјСѓ РїРѕР»РЅС‹Р№ reload.
**Gates:** FE tsc PASS; FE Jest gantt-bar.model + production-cockpit **38 PASS**; lint owned files PASS (pre-existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-333.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-333-gantt-optimistic-drag.lock`
**Dep:** 331 / 332

## [2026-08-15] вЂ” TZ-PRODUCTION-332 DONE вЂ” Day Gantt ticks DD.MM + weekday
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** zoom Р”РµРЅСЊ вЂ” РґРІРµ СЃС‚СЂРѕРєРё РІ С‚РёРєРµ (`DD.MM` + РџРќвЂ¦Р’РЎ UTC); С€Р°РїРєР° С€РєР°Р»С‹ Рё В«Р—Р°РєР°Р·В» `h-10`; РњРµСЃСЏС† Р±РµР· weekday (330).
**Gates:** FE tsc PASS; FE Jest gantt-bars **36 PASS**; lint owned files PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-332.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-332-gantt-day-weekday-ticks.lock`
**Dep:** 330 / 331

## [2026-08-15] вЂ” TZ-PRODUCTION-331 DONE вЂ” Plan fields on ready + heal missing siteId
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-grok-4.6-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `plannedDate`/`priority` РЅР° in_production/ready; СЃРѕСЃС‚Р°РІ Р·Р°РјРѕСЂРѕР¶РµРЅ; shipped+ РїР»Р°РЅ Р±Р»РѕРєРёСЂСѓРµС‚СЃСЏ; legacy `siteId` Р»РµС‡РёС‚СЃСЏ РїРµСЂРІРѕР№ РїР»РѕС‰Р°РґРєРѕР№ РєРѕРЅС‚СЂР°РіРµРЅС‚Р°; demo seed РІСЃРµРіРґР° РїРёС€РµС‚ siteId.
**Gates:** BE tsc PASS; BE Jest order.service **34 PASS**; FE tsc PASS; FE Jest production **6 suites / 74 tests PASS**; lint PASS (1 existing OnInit warning).
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-331.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-331-order-plan-fields-ready.lock`
**Dep:** 330

## [2026-08-15] вЂ” TZ-PRODUCTION-330 DONE вЂ” РњРµСЃСЏС† zoom + РЎРµРіРѕРґРЅСЏ always scrolls
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-POLISH complete; deploy РќР•
**Р§С‚Рѕ:** В«РќРµРґРµР»СЏВ» в†’ В«РњРµСЃСЏС†В» СЃ RU С‚РёРєР°РјРё; fit-density РєР°Рє Сѓ Р±С‹РІС€РµР№ РЅРµРґРµР»Рё; РЎРµРіРѕРґРЅСЏ РІСЃРµРіРґР° С†РµРЅС‚СЂРёСЂСѓРµС‚ РјР°СЂРєРµСЂ (chrome В«РџСЂРѕРєСЂСѓС‚РёС‚СЊ Рє СЃРµРіРѕРґРЅСЏВ»).
**Gates:** FE tsc PASS; FE Jest production **6 suites / 73 tests PASS**; lint PASS (1 existing OnInit warning); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-330.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-330-gantt-month-today.lock`
**Dep:** 329 (`ee0b0c78`)

## [2026-08-15] вЂ” TZ-PRODUCTION-329 DONE вЂ” Filters + Counterparty select в†’ Gantt
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-POLISH 329 closed; deploy РќР•
**Р§С‚Рѕ:** РІРєР»Р°РґРєРё Р—Р°РєР°Р·С‹|Р—Р°РєР°Р·С‡РёРєРё СѓР±СЂР°РЅС‹; Р¤РёР»СЊС‚СЂС‹ = Counterparty select + РЎР±СЂРѕСЃ accent РµСЃР»Рё dirty; РІС‹Р±РѕСЂ Р·Р°РєР°Р·С‡РёРєР° СЃСЂР°Р·Сѓ СЂРµР¶РµС‚ СЃРїРёСЃРѕРє Р—Р°РєР°Р·С‹ Рё Р“Р°РЅС‚; chrome В«Р¤РёР»СЊС‚СЂС‹В» active РїРѕРєР° dirty.
**Gates:** FE tsc PASS; FE Jest production **6 suites / 71 tests PASS**; lint PASS (1 existing OnInit warning); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-329.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-329-filters-counterparty.lock`
**Dep:** 328

## [2026-08-15] вЂ” TZ-PRODUCTION-328 DONE вЂ” production cockpit docs closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN complete; deploy РќР•
**Р§С‚Рѕ:** production-cockpit.page.md rewritten as page SoT; production-gantt-studio-spec synchronized to no-bottom-card cascade and current zoom/filters/write paths; final audit scoreboard and indexes closed; estimate studio **STUDIO ESTIMATE PASS 98/100**; fact production OUT.
**Gates:** docs review/diff-check PASS; prior FE tsc PASS; production Jest **6 suites / 70 tests PASS**; lint PASS (18 existing architecture warnings); targeted Prettier PASS; root markdown Prettier unavailable.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-328-cockpit-docs-closeout.lock`
**Dep:** 327 (`038b18da`)

## [2026-08-15] вЂ” TZ-PRODUCTION-327 DONE вЂ” cockpit smart/dumb light refactor
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 327 closed; deploy РќР•
**Р§С‚Рѕ:** Smart/dumb inventory recorded; ProductionCockpitPage/Facade/Context remain orchestration/read/state boundaries; Gantt and Orders rail stayed behavior-sensitive; one focused dumb `ProductionScaleControlsComponent` extracted with input/output-only zoom/fit events; no UX/API rewrite.
**Gates:** FE tsc PASS; FE Jest production **6 suites / 70 tests PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-327.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-327-cockpit-smart-dumb.lock`
**Dep:** 326 (`23f0740f`)

## [2026-08-15] вЂ” TZ-PRODUCTION-324 DONE вЂ” Gantt fit-width / В«РЎРµРіРѕРґРЅСЏВ»
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 324 closed; deploy РќР•
**Р§С‚Рѕ:** РќРµРґРµР»СЏ РёР·РјРµСЂСЏРµС‚ С€РёСЂРёРЅСѓ timeline С‡РµСЂРµР· ResizeObserver Рё СЃС‡РёС‚Р°РµС‚ fit-density СЃ readable min 12px/day; В«Р’РјРµСЃС‚РёС‚СЊ СЃСЂРѕРєРёВ» СЃСѓР¶Р°РµС‚ range РґРѕ padded minвЂ¦max Р±Р°СЂРѕРІ, РІРєР»СЋС‡Р°РµС‚ РќРµРґРµР»СЋ Рё СЃРєСЂРѕР»Р»РёС‚ РЅР°С‡Р°Р»Рѕ; В«РЎРµРіРѕРґРЅСЏВ» РґРµСЂР¶РёС‚ today РІ range Рё СЃРєСЂРѕР»Р»РёС‚ РєСЂР°СЃРЅС‹Р№ РјР°СЂРєРµСЂ РІ viewport.
**Gates:** FE tsc PASS; FE jest gantt-bars + production-cockpit **43 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-324.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-324-gantt-zoom-fit.lock`
**Dep:** 323

## [2026-08-15] вЂ” TZ-PRODUCTION-325 DONE вЂ” Orders rail / Р—Р°РєР°Р·С‡РёРєРё
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 325 closed; deploy РќР•
**Р§С‚Рѕ:** status-pips СѓР±СЂР°РЅС‹ РёР· Orders rail; СЂРµР¶РёРј Р—Р°РєР°Р·С‡РёРєРё Р°РіСЂРµРіРёСЂСѓРµС‚ Counterparty/В«Р‘РµР· Р·Р°РєР°Р·С‡РёРєР°В» Рё С„РёР»СЊС‚СЂСѓРµС‚ rail+Р“Р°РЅС‚; РїРѕРёСЃРє РїРµСЂРµРєР»СЋС‡Р°РµС‚СЃСЏ РЅРѕРјРµСЂ/РёРјСЏ; dateFrom/dateTo РїСЂРѕРІРµСЂРµРЅС‹.
**Gates:** FE tsc PASS; FE jest orders-rail + model + cockpit **33 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-325.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-325-orders-rail-counterparties.lock`
**Dep:** 324

## [2026-08-15] вЂ” TZ-PRODUCTION-326 DONE вЂ” plannedDate write-path sync
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-COCKPIT-HARDEN 326 closed; deploy РќР•
**Р§С‚Рѕ:** summary drag and meta Save use canEditOrder (admin|manager); child resize/start-offset/catalog remain production:write; successful plannedDate update reloads orders/bars; existing ISO API verified.
**Gates:** FE tsc PASS; FE jest Gantt + cockpit **46 PASS**; frontend lint PASS (18 existing architecture warnings); targeted Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-326.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-326-gantt-write-sync.lock`
**Dep:** 325

## [2026-08-15] вЂ” TZ-PRODUCTION-323 DONE вЂ” one Gantt meta + full-width cascade panels
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** executor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-CASCADE closed (321вЂ“323); deploy РќР•
**Р§С‚Рѕ:** meta С‚РѕР»СЊРєРѕ РїРѕРґ summary (РЅРµ РЅР° child); order-meta Рё work-detail вЂ” РЅРµРїСЂРµСЂС‹РІРЅР°СЏ РїРѕР»РѕСЃР° label+timeline (`gantt-cascade-panel` 100cqw + minWidth board, spacer РЅР° РєР°Р»РµРЅРґР°СЂРµ); РїРѕР»СЏ РІ РѕРґРёРЅ СЂСЏРґ.
**Gates:** FE tsc PASS; FE jest gantt-bars + production-cockpit **41 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-323.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-323-gantt-cascade-fullwidth.lock`
**Dep:** 322
**known_limitations:** РЅРѕРІС‹Рµ РїРѕР»СЏ РІ С€РёСЂРѕРєРѕР№ РїР°РЅРµР»Рё вЂ” РЅРµ РІ СЌС‚РѕРј TZ.

## [2026-08-15] вЂ” TZ-PRODUCTION-322 DONE вЂ” Gantt order-meta + kill bottom card
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** executor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-CASCADE closed (321+322); deploy РќР•
**Р§С‚Рѕ:** meta strip РїРѕРґ summary (status/priority/plannedDate/Save/`/orders`); sheet + chrome В«РљР°СЂС‚РѕС‡РєР°В» СЃРЅСЏС‚С‹; label/select/`?orderId=` в†’ meta; Esc/dismiss С‡РёСЃС‚РёС‚ meta+detail+trees; 321 work-detail Р¶РёРІ.
**Gates:** FE tsc PASS; FE jest `src/app/pages/production` **58 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-322.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-322-gantt-order-meta-kill-card.lock`
**Dep:** 321
**known_limitations:** product/module deep-links РёР· inspector вЂ” backlog; sheet РЅРµ РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°С‚СЊ.

## [2026-08-15] вЂ” TZ-PRODUCTION-321 DONE вЂ” Gantt work-detail cascade
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** executor-grok-4.6
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-CASCADE 321 closed; 322 next; deploy РќР•
**Р§С‚Рѕ:** РєР»РёРє РІРёРґР° СЂР°Р±РѕС‚ (Р»РµР№Р±Р»/в–ё) в†’ inline detail РїРѕРґ СЃС‚СЂРѕРєРѕР№ (Р»СЋРґРё, РґРЅРё PATCH estimate-days, catalog confirm); РѕРґРёРЅ detail; Esc/dismiss; highlight `gantt-work-detail-open`. РќРёР¶РЅСЏСЏ РљР°СЂС‚РѕС‡РєР° Р¶РёРІР° (322).
**Gates:** FE tsc PASS; FE jest gantt-bars|cockpit|model **52 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-321.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-321-gantt-work-detail-cascade.lock`
**Dep:** 320


**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-TREE closed 314вЂ“320; deploy РќР•
**Р§С‚Рѕ:** в–ё = С‚РѕР»СЊРєРѕ РґРµСЂРµРІРѕ Р“Р°РЅС‚Р°; РЅРѕРјРµСЂ Р·Р°РєР°Р·Р° = С‚РѕР»СЊРєРѕ РєР°СЂС‚РѕС‡РєР°; СѓР±СЂР°РЅ setOrderExpanded РёР· onSelect/label; visual expand-col + a11y.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **32 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-320.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-320-split-expand-vs-card.lock`
**Dep:** 319

## [2026-08-15] вЂ” TZ-PRODUCTION-319 DONE вЂ” Gantt card IA + taller sheet
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** executor-composer
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-TREE closed 314вЂ“319; deploy РќР•
**Р§С‚Рѕ:** РєР°СЂС‚РѕС‡РєР° С‚РѕР»СЊРєРѕ СЃ Р»РµРІРѕР№ РїРѕРґРїРёСЃРё summary (toggle) / chrome; child/chevron/timeline в‰  card; sheet `min(72vh, вЂ¦)`.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **31 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-319.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-319-gantt-card-interaction.lock`
**Dep:** 318

## [2026-08-15] вЂ” TZ-PRODUCTION-318 DONE вЂ” card sheet viewport + upward composition
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-TREE closed; deploy РќР•
**Р§С‚Рѕ:** sheet РїРѕС‡С‚Рё full-width + max-height РІ viewport; СЃРѕСЃС‚Р°РІ вЂ” fixed upward popovers; saves intact.
**Gates:** FE tsc PASS; FE jest cockpit **9 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-318.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-318-card-sheet-viewport.lock`
**Dep:** 317 @ 67d266dc

## [2026-08-15] вЂ” TZ-PRODUCTION-317 DONE вЂ” Gantt select keeps multi-order
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** select/deep-link/reload Р±РѕР»СЊС€Рµ РЅРµ Р·РѕРІСѓС‚ `applyBars([order])`; `applyFilteredActive()` + `setOrderExpanded`; РґРµС‚Рё РїРѕРґ СЃРІРѕРґРєРѕР№, peer-Р·Р°РєР°Р·С‹ РѕСЃС‚Р°СЋС‚СЃСЏ.
**Gates:** FE tsc PASS; FE jest cockpit|gantt-bars **28 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-317.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-317-gantt-expand-keep-orders.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE в†’ next 318

## [2026-08-15] вЂ” TZ-PRODUCTION-316 DONE вЂ” per-bar start offsets (parallel)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-gantt-tree
**РЎС‚Р°С‚СѓСЃ:** DONE; WAVE-PRODUCTION-GANTT-TREE closed; deploy РќР•
**Р§С‚Рѕ:** `Order.estimateStartOffsets` + `PATCH вЂ¦/estimate-start`; child body-drag в†’ offset; overlap OK; summary min/max; summary drag = plannedDate.
**Gates:** FE tsc+jest **39 PASS**; BE tsc+order.service **28 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-316.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-316-gantt-bar-start-offset.lock`
**Dep:** 314 @ e5089da6; 315 @ 1f4ed444

## [2026-08-15] вЂ” TZ-PRODUCTION-315 DONE вЂ” РљР°СЂС‚РѕС‡РєР° bottom sheet
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-gantt-tree
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РљР°СЂС‚РѕС‡РєР° = bottom sheet РїРѕРґ Р“Р°РЅС‚РѕРј (min(42vh,22rem)); right card flyout СѓР±СЂР°РЅ; inspector horizontal-friendly; chrome В«РљР°СЂС‚РѕС‡РєР°В» toggle СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** FE tsc PASS; FE jest production-cockpit **7 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-315.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-315-card-bottom-sheet.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE в†’ next 316
**Dep:** 314 @ e5089da631e01ee78569252c7f7a11b4b0a6264e

## [2026-08-15] вЂ” TZ-PRODUCTION-314 DONE вЂ” Gantt order summary + expand
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-gantt-tree
**РЎС‚Р°С‚СѓСЃ:** DONE; child plannedDate drag off until 316; deploy РќР•
**Р§С‚Рѕ:** default = 1 СЃРІРѕРґРЅР°СЏ РїРѕР»РѕСЃР°/Р·Р°РєР°Р· (minвЂ¦max); в–ё expand в†’ РІРёРґС‹ СЂР°Р±РѕС‚; summary body-drag = plannedDate; child resize = days; `ctx.expandedOrderIds`.
**Gates:** FE tsc PASS; FE jest gantt-bar|gantt-bars|cockpit **36 PASS**.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-314.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-314.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-314-gantt-order-expand.lock`
**Wave:** WAVE-PRODUCTION-GANTT-TREE в†’ next 315
**known_limitation:** children still sequential until 316; card still right until 315.

## [2026-08-15] вЂ” TZ-PRODUCTION-312 DONE вЂ” Gantt body-drag в†’ plannedDate
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-312
**РЎС‚Р°С‚СѓСЃ:** DONE; left-edge OUT; deploy РќР•
**Р§С‚Рѕ:** body-drag РїРѕР»РѕСЃС‹ (РЅРµ resize handle) в†’ snap В±NРґ в†’ PATCH plannedDate (oldAnchor+delta); С†РµРїРѕС‡РєР° РµРґРµС‚, days Р±РµР· РёР·РјРµРЅРµРЅРёР№; Escape cancel; readOnly/shipped+ Р±РµР· drag; 311 resize СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** FE tsc PASS; FE jest production-cockpit|gantt-bar 31 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-312.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-312-gantt-body-drag-planned-date.lock`
**known_limitation:** РЅРµС‚ РЅРµР·Р°РІРёСЃРёРјРѕРіРѕ lag РѕРґРЅРѕР№ СЃСЂРµРґРЅРµР№ РїРѕР»РѕСЃС‹.
**Dep:** TZ-PRODUCTION-313 @ 4cd045c66c88b7a37208a4dfcf8ffd71864d5e73; 311 @ 85329247650db938cb80039b458c3e05cb363a7a

## [2026-08-15] вЂ” TZ-PRODUCTION-313 DONE вЂ” РљР°СЂС‚РѕС‡РєР° flyout compact (no gutter)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** gemini-executor-313
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** flyout-card `min(22rem)` + order-inspector `w-full` вЂ” СѓР±СЂР°РЅ РїСѓСЃС‚РѕР№ gutter (Р±С‹Р»Рѕ 28rem vs 20/22rem).
**Gates:** FE tsc PASS; FE jest production-cockpit|gantt-bar 27 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-313.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-313.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-313-card-flyout-compact.lock`
**Successor:** TZ-PRODUCTION-312 (body-drag plannedDate).

## [2026-08-15] вЂ” TZ-PRODUCTION-311 DONE вЂ” Gantt right-edge estimate resize
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-executor-311
**РЎС‚Р°С‚СѓСЃ:** DONE; left/move OUT; WorkType catalog from handles РќР•Рў; deploy РќР•
**Р§С‚Рѕ:** РїСЂР°РІС‹Р№ handle РЅР° editable bars в†’ snap `GANTT_PX_PER_DAY` + preview В«NРґВ» в†’ `PATCH estimate-days` (order override) в†’ reload bars (cascade); Escape cancel; noTerm/readOnly Р±РµР· СЂСѓС‡РµРє.
**Gates:** FE tsc PASS; FE jest gantt-bars+cockpit 17 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-311.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-311-gantt-estimate-resize.lock`
**known_limitation:** left-edge / body drag / plannedDate-from-bar = successor; no undo stack.
**Dep:** TZ-PRODUCTION-309 @ 9b24c0f1498c12daa996500ccfd760cfca1a0bd6

## [2026-08-15] вЂ” TZ-PRODUCTION-309 DONE вЂ” order-level estimate days + production:write
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; drag UI РќР• (311); deploy РќР•
**Р§С‚Рѕ:** `estimateDayOverrides` + PATCH `/orders/:id/estimate-days`; WorkType mutate в†’ `production:write`; FE override РІ Gantt + inspector; catalog confirm В«РґР»СЏ РІСЃРµС…В» СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** BE tsc PASS; BE jest order 25 PASS; FE tsc PASS; FE jest gantt-bar|production-read 17 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-309.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-309-safe-estimate-order-days.lock`
**known_limitation:** existing manager roles in DB may need re-seed for `production:write`; N+1 estimate facade; drag = 311.
**Successor:** TZ-PRODUCTION-311 (right-edge resize).

## [2026-08-15] вЂ” TZ-UX-324 DONE вЂ” chrome history в†” page-tools gap
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-executor
**РЎС‚Р°С‚СѓСЃ:** DONE; spacer ~1 btn + muted page-tool; deploy РќР•
**Р§С‚Рѕ:** `chrome-rail-tools-gap` С‚РѕР»СЊРєРѕ РїСЂРё tools; `app-chrome-page-tool` paper-2/rule vs raised history; page-chrome docs; Jest gap AC.
**Gates:** FE tsc PASS; Jest app-layout 7/7 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-324.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-324.md`
**Lock:** `.mimocode/locks/TZ-UX-324-chrome-history-page-tools-gap.lock`
**known_limitation:** flyout registration / PiChromeToolsService API РЅРµ С‚СЂРѕРіР°Р»Рё.


**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; people UI via Devices; users redirect; register 410; login KEEP; deploy РќР•Рў
**РС‚РѕРі:** Nav/TOC в†’ РЈСЃС‚СЂРѕР№СЃС‚РІР°|Р РѕР»Рё; `/admin`+`/admin/users` в†’ devices; `POST /api/auth/register` Gone; BE `/api/admin/users` KEEP.
**Gates:** FE tsc PASS; FE Jest admin|layout|devices|auth 147 PASS; BE tsc PASS; BE Jest auth 28 PASS; git diff --check (TZ files) PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-308.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-308.md`
**Lock:** `.mimocode/locks/TZ-AUTH-308-device-only-admin-ux.lock`
**known_limitation:** reset-password UI via users route redirected; break-glass login/script.
**Successor:** TZ-AUTH-307 (park) only after PO; deploy only on explicit PO.

## [2026-08-15] вЂ” TZ-UX-325 DONE вЂ” chrome page-tools migration audit
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy continuous executor (docs)
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only; deploy РќР•
**Р§С‚Рѕ:** Inventory candidates в†’ chrome-rail; P0 products/modules/materials (`filters-rail` w-12); WAVE 326вЂ¦330 backlog; page-chrome + PAGE-TZ-INDEX linked; KP/Builder marked already-studio.
**Gates:** no FE/BE product diff; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-325.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-325.md`
**Lock:** `.mimocode/locks/TZ-UX-325-chrome-page-tools-migration-audit.lock`
**Audit:** `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`
**Wave:** `tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md`
**Successor:** executable TZ-UX-326+ when PO opens wave.

## [2026-08-15] вЂ” TZ-AUTH-305 DONE вЂ” РїРѕРґСЉРµР·Рґ СЃРЅСЏС‚ (auth_request)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-architect (ops cutover)
**РЎС‚Р°С‚СѓСЃ:** DONE; Basic Auth removed from UI; device cookie gate live; wipe РЅРµС‚
**Р§С‚Рѕ:** Stage A enroll open в†’ owner-device smoke в†’ Stage B `auth_request` + СѓР±СЂР°РЅ Basic; rollback `kppdf-proxy.bak-auth-basic`.
**Gates:** nginx -t PASS; `/` anon 401 Р±РµР· Basic; cookie 200; `/enroll/` 200; `/api/health` 200; OPTIONS 204; pairing health 200.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-305.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-305.md`
**Evidence:** `docs/ops/server-harden-evidence.md` В§ AUTH-305
**Successor:** TZ-AUTH-307 (htpasswd + enrollBaseUrl); PO РѕС‚РєСЂС‹РІР°РµС‚ owner enroll РІ СЃРІРѕС‘Рј Р±СЂР°СѓР·РµСЂРµ РѕРґРёРЅ СЂР°Р·.

## [2026-08-15] вЂ” TZ-UX-323 DONE вЂ” Gantt tools in app chrome-rail
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; /production toolsв†’chrome; local 48px rails removed; deploy РќР•
**Р§С‚Рѕ:** setTools production-cockpit; studio-body full width; flyouts left:0/right:0; SoT FROZEN updated; untracked sync (no effect loop).
**Gates:** FE tsc PASS; Jest production+layout+chrome 14/14 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-323.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-323.md`
**Lock:** `.mimocode/locks/TZ-UX-323-gantt-tools-chrome-rail.lock`
**Wave:** `WAVE-UX-CHROME-GANTT-TOOLS` score 100
**known_limitation:** chrome tools РІРёРґРЅС‹ С‚РѕР»СЊРєРѕ в‰Ґ1680 (РєР°Рє в†ђв†’); Р±РµР· Р»РѕРєР°Р»СЊРЅС‹С… 48px fallback.
**Successor:** none for this wave; deploy only on explicit PO.

## [2026-08-15] вЂ” TZ-UX-322 DONE вЂ” Chrome page-tools API
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; app shell page-tools projection; deploy РќР•
**Р§С‚Рѕ:** `PiChromeToolsService` setTools/clear; AppLayout left/right tools under в†ђ/в†’ (`chrome-tool-{id}`); pages without setTools unchanged; production в†’ TZ-UX-323.
**Gates:** FE tsc PASS; Jest app-layout+chrome 8/8 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-322.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-322.md`
**Lock:** `.mimocode/locks/TZ-UX-322-chrome-page-tools-api.lock`
**Successor:** `TZ-UX-323-gantt-tools-into-chrome-rail.md` (same wave).

## [2026-08-15] вЂ” TZ-UX-PHOTO-301 DONE вЂ” visible photo upload progress
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (impl + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; FE photo upload progress; deploy РќР•
**Р§С‚Рѕ:** Progress bar + RU status on dropzone / product / material / QuickCreate; `uploadWithProgress` (reportProgress); legacy `upload()` intact; indeterminate when % unknown.
**Gates:** FE tsc PASS; Jest dropzone+forms 88/88 PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-PHOTO-301.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-PHOTO-301.md`
**Lock:** `.mimocode/locks/TZ-UX-PHOTO-301-upload-progress.lock`
**known_limitation:** С‚РѕС‡РЅС‹Р№ % Р·Р°РІРёСЃРёС‚ РѕС‚ Р±СЂР°СѓР·РµСЂР°/РїСЂРѕРєСЃРё; РёРЅР°С‡Рµ indeterminate bar.
**Successor:** none (UX feedback only).

## [2026-08-15] вЂ” TZ-PRODUCTION-STUDIO-A DONE вЂ” Gantt studio chrome contract
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor (docs closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only; deploy РќР•; product Wave B РќР• СЃС‚Р°СЂС‚РѕРІР°Р»
**Р§С‚Рѕ:** SoT `production-gantt-studio-spec.md`; page/readiness/IA Р¦РµС…; park 308вЂ“310 BLOCKED; Р—Р°РєР°Р·С‹в‰ Р¤РёР»СЊС‚СЂС‹ split; score 15/99.
**Gates:** git diff --check PASS; frontend/backend product diff РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-STUDIO-A.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-STUDIO-A-spec.lock`
**Successor:** `PROMPT-PRODUCTION-STUDIO-CONTINUOUS` в†’ TZ-B shell (СЏРІРЅР°СЏ РІС‹РґР°С‡Р° PO).

## [2026-08-15] вЂ” TZ-ORDERS-HUB-304 DONE вЂ” readiness / warehouse / shipping stub
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (impl + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend orders expand readiness/warehouse/shipping; deploy РќР•
**Р§С‚Рѕ:** Expand В«Р“РѕС‚РѕРІРЅРѕСЃС‚СЊВ» X/Y + lines (0 HTTP); `pi-reservations.service` read-only by Order.number; expand В«РЎРєР»Р°РґВ» lazy reservations; expand В«РћС‚РіСЂСѓР·РєР°В» stub в†’ `/shipping`; no GET /shipments.
**Gates:** FE tsc PASS; Jest orders.page|pi-reservations 19/19 PASS; quality 98; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-304.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-304.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.lock`
**Implementation SHA:** `cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1`
**Closeout SHA:** `d08f61f4f2126228d8ae6384b48e052c78cfc200`
**Successor:** orders-hub wave complete; AUTH-305 prep only.

## [2026-08-15] вЂ” TZ-UX-321 DONE вЂ” universal left chrome rail
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (impl + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; app shell left chrome rail; deploy РќР•
**Р§С‚Рѕ:** `app-chrome-rail-left` 64px under header; в†ђв†’ stacked inside rail; в‰Ґ1680 show; UX-320 interim floating gutters superseded; filter в†’ UX-322.
**Gates:** app-layout Jest 5/5 PASS; ng build PASS; browser smoke 1920 selfScore 98; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-321.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-321.md`
**Lock:** `.mimocode/locks/TZ-UX-321-universal-left-chrome-rail.lock`
**Implementation SHA:** `21f32f11317d79d25e05b651f320579e407d3bf3`
**Merge SHA:** `85dbcc57cb2174fa750c27b425e6319baba8b30a`
**Closeout SHA:** `099de456d9127c91acabb313e3937d3f57fbc4d7`
**Successor:** TZ-UX-322 page-tools projection into rail.

## [2026-08-15] вЂ” TZ-ORDERS-HUB-303 DONE вЂ” supply / production / docs expand
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (impl + closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend orders expand + supply/production deep-links; deploy РќР•
**Р§С‚Рѕ:** Lazy supply counters РІ expand; Р±Р»РѕРєРё РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ/Р”РѕРєСѓРјРµРЅС‚С‹; `/supply?orderId=` chip; `/production?orderId=` selectOrder + unknown hint.
**Gates:** FE tsc PASS; Jest orders|supply|production-cockpit 17/17 PASS; quality 98.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-303.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-303-supply-production-docs.lock`
**Implementation SHA:** `9eed2860ddadbc4b1daf8d8176dd7345784f3faf`
**Docs SHA:** `00603a36d5650ff3800b9c8f63b31d1a19f744ac`
**Successor:** TZ-ORDERS-HUB-304 readiness/warehouse/shipping.

## [2026-08-15] вЂ” TZ-CATALOG-372 DONE вЂ” modules list vitrine parity
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend /modules vitrine; deploy РќР•
**Р§С‚Рѕ:** Photo column + name link; toolbar РЎРѕСЃС‚Р°РІ/РћР±РЅРѕРІРёС‚СЊ/listв†”grid; filters-rail overlay; PiShowcaseCard md grid; `pi-modules-view-mode`; composition client filter; ProductModule photoIds types.
**Gates:** FE tsc PASS; modules.page Jest 17/17; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-372.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-372.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-372-modules-list-vitrine-parity.lock`
**Implementation SHA:** `3b460f4517cfae01b40722c9b4229ba7717e6552`
**Closeout SHA:** `a03500d7d4199e41972e7d3063b06b17096d0368`
**Known limit:** server envelope `/modules` вЂ” successor.

## [2026-08-15] вЂ” TZ-ORDERS-HUB-302 DONE вЂ” orders expand columns + Deal/Composition
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend orders list; deploy РќР•
**Р§С‚Рѕ:** РљРѕР»РѕРЅРєРё Р±РµР· total; X/Y readiness; read-only expand РЎРґРµР»РєР°/РЎРѕСЃС‚Р°РІ (UX-319 chrome); /proposals route fix. Cherry-pick `9d1a0aac` в†’ `71446d6b` onto origin/main; app-layout from `657b0182` omitted (UX-320 LANDED).
**Gates:** FE tsc PASS; orders.page Jest 11/11 PASS; Cursor functional PASS 98/100.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md`
**Checklist:** `docs/agent-checklists/TZ-ORDERS-HUB-302.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-HUB-302-orders-expand-columns.lock`
**Implementation SHA:** `71446d6bfb37434913450449678ce4b78e26be37`
**Closeout SHA:** `a1da7a2bcb2092983d831d143b2bd54101f6c458`
**Successor:** TZ-ORDERS-HUB-303 unblocked в†’ READY.

> **APPEND-ONLY HISTORY вЂ” РќР• Р§РРўРђРўР¬ РџР Р РЎРўРђР РўР•.**
> РўРµРєСѓС‰Р°СЏ СЂР°Р±РѕС‚Р°: `docs/agent-checklists/_NOW.md`.

## [2026-08-15] вЂ” TZ-CATALOG-373 DONE вЂ” materials list vitrine parity
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend /materials; deploy РќР•
**Р§С‚Рѕ:** listв†”grid toggle, filters-rail (canon products), `PiShowcaseCard` grid, `pi-materials-view-mode` persistence; materials.page-373.spec (12 tests).
**Gates:** FE tsc (tsconfig.app.json) PASS; materials.page Jest 3 suites / 18 tests PASS; Cursor PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-373.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-373.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-373-materials-list-vitrine-parity.lock`
**Implementation SHA:** `528e3cf9fb21eb283b076893e627097a3736ffea`
**Closeout SHA:** `cafd3acf`
**Known limit:** rail sort N/A (backend no sortBy).

## [2026-08-15] вЂ” TZ-UX-320 DONE / LANDED вЂ” в†ђв†’ РёР· РєСЂР°СЏ РѕРєРЅР° РІ РїРѕР»СЏ Сѓ РєРѕР»РѕРЅРєРё РєРѕРЅС‚РµРЅС‚Р°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (impl) + Cursor land (cherry-pick onto main)
**РЎС‚Р°С‚СѓСЃ:** DONE / LANDED on main; frontend shell CSS; deploy РќР•
**Р§С‚Рѕ:** Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ в†ђ в†’ РїРµСЂРµСЃС‚Р°РІР»РµРЅС‹ СЃ РєСЂР°СЏ РѕРєРЅР° (`left/right: 14px`) РІ РІРµСЂС‚РёРєР°Р»СЊРЅС‹Рµ РїРѕР»СЏ СЃР»РµРІР°/СЃРїСЂР°РІР° РѕС‚ РєРѕР»РѕРЅРєРё РєРѕРЅС‚РµРЅС‚Р°, РЅР° Р»РёРЅРёСЋ Р±РѕРєРѕРІРѕРіРѕ РѕС‚СЃС‚СѓРїР° С€Р°РїРєРё (`left/right: 64px` вЂ” padding `pi-edge-bleed` в‰Ґ1024px). `AppHistoryStore`, click/disabled/aria/data-test Рё РїРѕСЂРѕРі в‰Ґ1680px РЅРµ РјРµРЅСЏР»РёСЃСЊ.
**Gates:** FE tsc PASS; app-layout Jest 12/12 PASS; eslint changed PASS; architecture:check PASS; diff-check PASS; browser smoke в‰Ґ1680 light/dark 16/16 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-320.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-320.md`
**Lock:** `.mimocode/locks/TZ-UX-320-nav-gutter-align-content-column.lock`
**Implementation SHA:** `3d5911d143e4428e4a1bcf656216fcfa011bd8b3` (cherry-pick of `dc424c45`)
**Land note:** С‚РѕР»СЊРєРѕ UX-320 paths; Р±РµР· SALES-378/backend РїРѕСЃС‚РѕСЂРѕРЅРЅРµРіРѕ.

## [2026-08-15] вЂ” TZ-SALES-378 DONE вЂ” multipage bg CSS + full next-page table
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; backend document build; deploy РќР•
**Р§С‚Рѕ:** Hoist `buildDocumentContentStyles` into multipage outer head (`.doc-bg` preserved); `.doc-page { position: relative }`; auto next-page capacity from full A4 sheet; `remapContinuationTableBlock` y0/h1 on page 2+.
**Gates:** BE tsc PASS; document-template 70 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-378.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-378.md`
**Lock:** `.mimocode/locks/TZ-SALES-378-multipage-bg-full-next.lock`
**Implementation SHA:** `b20944637d62bafe614bc808505137334e6c6e49`
**Closeout SHA:** `ed57baff`
**Known limit:** strip decorations / continuationMode = TZ-SALES-377 PARK backlog.

## [2026-08-15] вЂ” TZ-SALES-376 DONE вЂ” geometry-aware KP page split
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; full-stack document split + Create РљРџ copy; deploy РќР•
**Р§С‚Рѕ:** `estimateAutoRowCapacity` РїРѕ `layout.height` Р±Р»РѕРєР° С‚Р°Р±Р»РёС†С‹; `splitPreviewLines` capacity + `pageBreakBefore`; clip overflow РЅР° build CSS; last-page totals = full KP lines; RU hint В«0 вЂ” Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїРѕ СЂР°РјРєРµвЂ¦В».
**Gates:** BE tsc PASS; document-template 67 tests; FE tsc PASS; proposal-create 61 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-376.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-376.md`
**Lock:** `.mimocode/locks/TZ-SALES-376-geometry-aware-page-split.lock`
**Implementation SHA:** `7a619e4c95ceebc64aef45a42e47208437a46516`
**Closeout SHA:** `764aded5`
**Known limit:** auto capacity вЂ” estimate not pixel-perfect; continuation/per-page templates = TZ-SALES-377 PARK backlog.

## [2026-08-15] вЂ” TZ-FRONTEND-303 DONE вЂ” Jest baseline debt
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / isolated `feature/TZ-FRONTEND-303`
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend test-only; deploy РќР•
**Р§С‚Рѕ:** РњР°С‚РµСЂРёР°Р»С‹-С‚РµСЃС‚С‹ РїРѕР»СѓС‡РёР»Рё Р»РѕРєР°Р»СЊРЅС‹Р№ fallback mock `PiDictionaryLabelsService`, Р° `FormProfilesService` assertions РІС‹СЂРѕРІРЅРµРЅС‹ СЃ С‚РµРєСѓС‰РёРј `LockedRequired` (product: kind/unit/sku; module: name/article). Product/service implementation РЅРµ РёР·РјРµРЅСЏР»РёСЃСЊ.
**Gates:** focused 4 suites / 17 tests PASS; full frontend Jest 154/154 suites, 1444/1444 tests PASS; frontend tsc, changed ESLint, architecture:check (937 files; baseline 6), diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-FRONTEND-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-FRONTEND-303.md`
**Lock:** `.mimocode/locks/TZ-FRONTEND-303-jest-baseline-debt.lock`
**Implementation SHA:** `8b60d1f0998b70caa28a1bbe9760c3eec8a8a878`
**Known limit:** Angular/JSDOM console diagnostics remain non-failing in legacy suites; no new failing tests.

## [2026-08-15] вЂ” TZ-SALES-375 DONE вЂ” remove products rail draft-lines list
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend UI; deploy РќР•
**Р§С‚Рѕ:** Create РљРџ products flyout: removed В«РџРѕР·РёС†РёРё РљРџВ» / `kp-rail-draft-lines` block; cards under filters; kept `draftLines` for В«Р’ РљРџВ»/В«Р•С‰С‘ +NВ»; dead `quantityChange`/`onQuantityChange` removed; qty via table editor.
**Gates:** FE tsc PASS; proposal-product-rail 11 tests; proposal-create 61 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-375.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-375.md`
**Lock:** `.mimocode/locks/TZ-SALES-375-no-products-rail-draft-lines.lock`
**Implementation SHA:** `d75e1f08c10e76077e94beb27ea5b919e5bc9d93`
**Closeout SHA:** `f24400d0`
**Known limit:** custom lines without catalog card visible only in table editor (by design).

## [2026-08-15] вЂ” TZ-SALES-374 DONE вЂ” KP table editor chrome + dual fonts + drawer-actions
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend + thin BE sheetLayout; deploy РќР•
**Р§С‚Рѕ:** Create РљРџ table editor: Lucide icon chrome (Р Р°РјРєР°/РЁР°РїРєР°); `tableHeaderFontSize` + `tableFontSize`; row gutter chevron-only; drawer В«Р”РµР№СЃС‚РІРёСЏВ» СЃ RU labels; expand ink frame + sibling dim; presetв†’С€Р°Р±Р»РѕРЅ copy.
**Gates:** FE/BE tsc PASS; proposal-create 61 tests; table-template.service 7 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-374.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-374.md`
**Lock:** `.mimocode/locks/TZ-SALES-374-kp-table-editor-chrome.lock`
**Implementation SHA:** `9b50bc9ec044216817fd0928c8fd3d29cb3f52e6`
**Closeout SHA:** `1b813260c4ba01f6f60f6e438770b20fb21874a9`
**Known limit:** drawer density/accent seg-buttons text-only; no per-column font.

## [2026-08-15] вЂ” TZ-UX-319 DONE вЂ” products expanded row ink frame
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend UI chrome; deploy РќР•
**Р§С‚Рѕ:** `pi-table`: РєР»Р°СЃСЃ `pi-table-row--open` + ink-СЂР°РјРєР° (~1.5px) РІРѕРєСЂСѓРі РїР°СЂС‹ data-row + `expanded-row`; СЃРѕСЃРµРґРЅРёРµ data-rows РїСЂРёРіР»СѓС€РµРЅС‹ (`opacity: 0.5`) РїРѕРєР° РѕРґРЅР° СЂР°СЃРєСЂС‹С‚Р°. Expand API / composition РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ.
**Gates:** frontend tsc PASS; pi-table.component.spec 25; products.page.spec 21; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-319.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-319.md`
**Lock:** `.mimocode/locks/TZ-UX-319-products-expanded-row-frame.lock`
**Implementation SHA:** `55dac38afb9e533d1ad28793a1edbae3181482cc`
**Closeout SHA:** `bf30c9acc0898ab645004ec48448b26d0bd13269`
**Known limit:** СЂР°РјРєР° = РґРІРµ РіСЂР°РЅРёС†С‹ `<tr>` (РЅРµ wrapper div); РґСЂСѓРіРёРµ `expandedRow` СЃС‚СЂР°РЅРёС†С‹ РїРѕР»СѓС‡Р°СЋС‚ С‚РѕС‚ Р¶Рµ chrome.

## [2026-08-15] вЂ” TZ-FRONTEND-301/302 DONE вЂ” Angular component integrity
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Lane A/B executors + Cursor closeout
**РЎС‚Р°С‚СѓСЃ:** DONE; ANGULAR INTEGRITY READY yes (known Jest debt); deploy РќР•
**Р§С‚Рѕ:** Stage 1 dual-lane audit + Stage 2 batches A1вЂ“A6 and B-TOOLING/ENTITY/PHOTO. P0 KP autosave/recipient/inspector fixed; admin/order/import-todos raw HttpClient removed; photo dropzone presentational; ESLint harness repaired. Merged with main including SALES-373 tableFontSize coexistence.
**Gates:** FE tsc/lint/architecture/diff PASS; full Jest 150/154 (13 baseline materials/form-profiles debt documented, not suppressed).
**Archive:** 	asks/_archive/2026-08/TZ-FRONTEND-301.done.md, 	asks/_archive/2026-08/TZ-FRONTEND-302.done.md
**Canonical:** docs/audits/2026-08-15-angular-component-integrity.md
**Locks:** .mimocode/locks/TZ-FRONTEND-301-angular-component-integrity-audit.lock, .mimocode/locks/TZ-FRONTEND-302-angular-integrity-remediation-wave.lock
**Known limit:** composition/group-ACL successors + Jest debt = separate TZ; deploy/SSH РЅРµ РІС‹РїРѕР»РЅСЏР»РёСЃСЊ.

## [2026-08-15] вЂ” TZ-SALES-373 DONE вЂ” KP table font size on A4 sheet
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend + backend sheetLayout; deploy РќР•
**Р§С‚Рѕ:** `sheetLayout.tableFontSize` (default 12, clamp 8вЂ“20) РІ Create РљРџ: В«РЁСЂРёС„С‚ С‚Р°Р±Р»РёС†С‹В» РІ Р’РёРґ Р»РёСЃС‚Р° + В«РЁСЂРёС„С‚В» РІ С‚СѓР»Р±Р°СЂРµ СЂРµРґР°РєС‚РѕСЂР°; live table + A4 preview HTML `font-size`; СЃС‚Р°СЂС‹Рµ РљРџ Р±РµР· РїРѕР»СЏ в†’ 12.
**Gates:** FE/BE tsc PASS; proposal-create 56 tests; table-template.service 6 tests; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-373.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-373.md`
**Lock:** `.mimocode/locks/TZ-SALES-373-kp-table-font-size.lock`
**Implementation SHA:** `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
**Closeout SHA:** `8d4b5616bc435d6e302491d09c99a809d6749a1f`
**Known limit:** no per-column/per-cell font; long descriptions still multi-page.

## [2026-08-15] вЂ” TZ-DOC-TABLES-310 DONE вЂ” remove help + separate toolbar buttons
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend UI; deploy РќР•
**Р§С‚Рѕ:** Р”РёР°Р»РѕРі С‚Р°Р±Р»РёС† `/doc-constructor/tables`: СѓР±СЂР°РЅ on-page `ttd-column-help`; В«+ Р”РѕР±Р°РІРёС‚СЊ СЃС‚РѕР»Р±РµС†В» Рё В«РљРѕР»РѕРЅРєРё РєР°Рє РІ РљРџВ» СЂР°Р·РІРµРґРµРЅС‹ С‡РµСЂРµР· toolbar-sep; taller+RU РёР· 309 СЃРѕС…СЂР°РЅРµРЅС‹; fontSize РЅРµ С‚СЂРѕРЅСѓС‚.
**Gates:** frontend tsc PASS; table-template-dialog.component.spec 46/46; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-310.done.md`
**Checklist:** `docs/agent-checklists/TZ-DOC-TABLES-310.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-310-remove-help-separate-buttons.lock`
**Implementation SHA:** `44435acd272d684f2437e75ce3801021e25df187`
**Docs SHA:** `e67a831703d2f721f8858a59afb934cb7829baae`
**Known limit:** fontSize РєРѕР»РѕРЅРѕРє вЂ” С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СЏРІРЅРѕРіРѕ PO В«РґР°В».

## [2026-08-15] вЂ” TZ-DOC-TABLES-309 DONE вЂ” tables dialog copy + taller fields
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend UI; deploy РќР•
**Р§С‚Рѕ:** Р”РёР°Р»РѕРі С‚Р°Р±Р»РёС† `/doc-constructor/tables`: РєРЅРѕРїРєР° В«РљРѕР»РѕРЅРєРё РєР°Рє РІ РљРџВ» + confirm СЃС‚Р°РЅРґР°СЂС‚РЅС‹С… РєРѕР»РѕРЅРѕРє РљРџ Р±РµР· Р¶Р°СЂРіРѕРЅР° В«РїСЂРµСЃРµС‚/РєР°РЅРѕРЅВ»; РєРѕСЂРѕС‚РєР°СЏ RU-СЃРїСЂР°РІРєР° Сѓ add-column; РІС‹С€Рµ `.ttd-cell-input` / С€Р°РїРєРё РєРѕР»РѕРЅРѕРє. `data-test` РєР»СЋС‡Рё СЃРѕС…СЂР°РЅРµРЅС‹.
**Gates:** frontend tsc PASS; table-template-dialog.component.spec 45/45; Cursor Verdict PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-309.done.md`
**Checklist:** `docs/agent-checklists/TZ-DOC-TABLES-309.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-309-tables-dialog-copy-and-taller-fields.lock`
**Implementation SHA:** `2cc0383d8afd824cff447b92ad7d06c26ceda2b0`
**Docs SHA:** `53374e783fa29746756b975c8106f72812631f23`
**Known limit:** fontSize РєРѕР»РѕРЅРѕРє вЂ” С‚РѕР»СЊРєРѕ TZ-DOC-TABLES-310 РїРѕСЃР»Рµ СЏРІРЅРѕРіРѕ PO В«РґР°В».

## [2026-08-15] вЂ” TZ-UX-318 DONE вЂ” KP columns checkbox menu stay-open
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend UX; deploy РќР•
**Р§С‚Рѕ:** РњРµРЅСЋ В«РљРѕР»РѕРЅРєРёВ» РЅР° `/proposals/create` РѕСЃС‚Р°С‘С‚СЃСЏ РѕС‚РєСЂС‹С‚С‹Рј РїСЂРё РЅРµСЃРєРѕР»СЊРєРёС… С‡РµРєР±РѕРєСЃР°С… РїРѕРґСЂСЏРґ (СѓР±СЂР°РЅС‹ mouseleave + close-on-toggle). Р—Р°РєСЂС‹С‚РёРµ С‚РѕР»СЊРєРѕ outside-click / Escape / toggle С‚СЂРёРіРіРµСЂР° / В«Р•С‰С‘В» / scroll table wrap. RU-РєР°РЅРѕРЅ stay-open РґР»СЏ checkbox multi-panels РІ `ui-overflow-select.md`.
**Gates:** frontend tsc PASS; Cursor Verdict PASS (browser smoke в‰Ґ2 toggles stay-open в†’ outside closes).
**Archive:** `tasks/_archive/2026-08/TZ-UX-318.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-318.md`
**Lock:** `.mimocode/locks/TZ-UX-318-kp-columns-checkbox-menu-stay-open.lock`
**Implementation SHA:** `9bd27f11a644384e48d5c26488d70573cdfda7fc`
**Docs SHA:** `2340979af9d5fa792d179f30153a8ff1cbb19278`
**Confirm SHA:** `d4426510e26525315b321e982ed6e9cf3b686b6d`
**Known limit:** ad-hoc dropdown (no CDK Overlay); More menu mouseleave unchanged.

## [2026-08-14] вЂ” TZ-SALES-372 DONE вЂ” snapshot edit Рё СЂРµС€РµРЅРёРµ РєР°С‚Р°Р»РѕРіР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / predeploy executor
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend + backend contract; deploy РќР•
**Р§С‚Рѕ:** Identity-РїРѕР»СЏ source-linked Product СЂРµРґР°РєС‚РёСЂСѓСЋС‚СЃСЏ С‚РѕР»СЊРєРѕ РІ snapshot РљРџ; metadata `catalogDirtyFields/catalogDecision/catalogSourceVersion` РїРµСЂРµР¶РёРІР°РµС‚ save/hydrate/F5. РџСЂРё РІС‹С…РѕРґРµ РёР· С‚Р°Р±Р»РёС†С‹ РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ multi-row review СЃ С‚СЂРµРјСЏ per-row СЂРµС€РµРЅРёСЏРјРё; РљРџ-only Р±РµР·РѕРїР°СЃРµРЅ, source update РѕРіСЂР°РЅРёС‡РµРЅ dirty identity fields + `expectedVersion`, copy-after-edit РґРµР»Р°РµС‚ duplicate/rebind, СЏРІРЅР°СЏ РєРѕРїРёСЏ СЃС‚СЂРѕРєРё РІСЃС‚Р°РІР»СЏРµС‚СЃСЏ РЅРёР¶Рµ, Р° РѕР±С‹С‡РЅС‹Р№ duplicate СЃС‚СЂРѕРєРё СЃРѕС…СЂР°РЅСЏРµС‚ С‚РѕС‚ Р¶Рµ Product. РљРѕРјРјРµСЂС‡РµСЃРєРёРµ qty/price/discount/optional/row presentation РЅРµ sync РІ Product.
**Gates:** FE tsc PASS; proposal-create Jest 45/45; BE tsc PASS; quotation.service 36/36; Product duplicate/expectedVersion contract covered by CATALOG-371; changed ESLint PASS; architecture:check PASS; git diff --check PASS; local shell smoke HTTP 200; controlled snapshot/review/copy evidence PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-372.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-372.md`
**Lock:** `.mimocode/locks/TZ-SALES-372-kp-line-snapshot-edit-and-catalog-resolution.lock`
**Implementation SHA:** `cbf2e2fe14dc674e688623b332299e85a1c66146`
**Closeout SHA:** `f182460503fc5f88e63af5ec7fe52e1afe8b8e07`
**Known limit:** module/material source-sync and inline media upload РІРЅРµ v1; KP3 photo population remains `TZD-47 в†’ TZ-MIG-303`; production/deploy/SSH/nginx/migration/wipe РЅРµ РІС‹РїРѕР»РЅСЏР»РёСЃСЊ.

## [2026-08-14] вЂ” TZ-SALES-371 DONE вЂ” СЂРµР°Р»СЊРЅРѕРµ С„РѕС‚Рѕ РёР·РґРµР»РёСЏ РІ РљРџ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / predeploy executor
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend + backend output; deploy РќР•
**Р§С‚Рѕ:** Р РµР°Р»СЊРЅС‹Р№ populated `Product.photoIds` thumb/medium С‚РµРїРµСЂСЊ РїРµСЂРµРЅРѕСЃРёС‚СЃСЏ РІ line snapshot РІРјРµСЃС‚Рµ СЃ description; РІРёРґРёРјР°СЏ С„РѕС‚Рѕ-РєРѕР»РѕРЅРєР° РёРјРµРµС‚ РµРґРёРЅС‹Рµ FE/BE aliases Рё request-scoped layout controls; saved quotation rebuild СЃРѕС…СЂР°РЅСЏРµС‚ `photoUrl` Рё `sheetLayout`; PDF РїСЂРёРјРµРЅСЏРµС‚ allowlisted own asset resolver, base href Рё bounded image wait; РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‰РµРµ/Р·Р°РїСЂРµС‰С‘РЅРЅРѕРµ С„РѕС‚Рѕ РґР°С‘С‚ РЅРµР№С‚СЂР°Р»СЊРЅРѕРµ `РќРµС‚ С„РѕС‚Рѕ`. Inline catalog identity edits РѕСЃС‚Р°СЋС‚СЃСЏ snapshot metadata РґР»СЏ SALES-372 Рё РЅРµ РјСѓС‚РёСЂСѓСЋС‚ Product.
**Gates:** FE tsc PASS; proposal-create Jest 45/45; BE tsc PASS; quotation/table-template/quotation-output 44/44; document-template assets 5/5; changed ESLint Р±РµР· РѕС€РёР±РѕРє; architecture:check PASS; git diff --check PASS; controlled real-photo/no-photo fixture path PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-371.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-371.md`
**Lock:** `.mimocode/locks/TZ-SALES-371-kp-real-product-photo-output.lock`
**Implementation SHA:** `cbf2e2fe14dc674e688623b332299e85a1c66146`
**Known limit:** KP3 С„РѕС‚Рѕ РѕСЃС‚Р°СЋС‚СЃСЏ Р·Р°РІРёСЃРёРјРѕСЃС‚СЊСЋ `TZD-47 в†’ TZ-MIG-303`; deploy, SSH, nginx, migration Рё wipe РЅРµ РІС‹РїРѕР»РЅСЏР»РёСЃСЊ.

## [2026-08-13] вЂ” TZ-SALES-370 DONE вЂ” РЅР°СЃС‚СЂРѕР№РєРё РІРёРґР° СЃС‚СЂРѕРєРё РљРџ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (closeout) / isolated `feature/TZ-SALES-370`
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend + backend; deploy РќР•
**Р§С‚Рѕ:** Row-level drawer СЃ С‚РёРїРёР·РёСЂРѕРІР°РЅРЅС‹Рј `rowPresentation` РґР»СЏ density, accent, separator, page-break, description visibility Рё photo fit. РќР°СЃС‚СЂРѕР№РєРё СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ РІ СЃС‚СЂРѕРєРµ РљРџ, РїСЂРёРјРµРЅСЏСЋС‚СЃСЏ РІ live table/HTML/PDF path Рё СЃРѕС…СЂР°РЅСЏСЋС‚ РєРѕРјРјРµСЂС‡РµСЃРєРёРµ РїРѕР»СЏ РІРёРґРёРјС‹РјРё; backward defaults Рё enum validation Р·Р°С‰РёС‰Р°СЋС‚ СЃС‚Р°СЂС‹Рµ РљРџ.
**Gates:** frontend tsc PASS; proposal-create Jest 42/42; backend tsc PASS; quotation 35/35, table-template 4/4, quotation-output 3/3; architecture:check PASS; git diff --check PASS РґРѕ Рё РїРѕСЃР»Рµ РёРЅС‚РµРіСЂР°С†РёРё origin/main.
**Review:** Cursor visual PASS 2026-08-13 РґР»СЏ light/dark/narrow; live A4 template fixture РїСѓСЃС‚, provisional evidence РїСЂРёРЅСЏС‚Р° Рё РїРµСЂРµРґР°РЅР° TZ-SALES-371.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-370.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-370.md`
**Lock:** `.mimocode/locks/TZ-SALES-370-kp-row-layout-drawer.lock`
**Implementation SHA:** `c08f13735acf956133a16d886e70857e31a1fd91`
**Closeout SHA:** `d1e97c1c` on `origin/feature/TZ-SALES-370`
**Main SHA:** `f49a3d0037174b9e8dc39d8df7c904172912c69f`
**Known limit:** СЂРµР°Р»СЊРЅС‹Р№ A4/photo parity Р·Р°РєСЂС‹РІР°РµС‚СЃСЏ РІ TZ-SALES-371; data dependency TZD-47 в†’ MIG-303.

## [2026-08-13] вЂ” TZ-CATALOG-371 DONE вЂ” Р±РµР·РѕРїР°СЃРЅР°СЏ РєРѕРїРёСЏ РёР·РґРµР»РёСЏ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / predeploy executor
**РЎС‚Р°С‚СѓСЃ:** DONE; backend + typed frontend client; deploy РќР•
**Р§С‚Рѕ:** `POST /api/products/:id/duplicate` СЃ organization-scoped source filter, whitelist overrides `name/description/unit/sku`, copiedFromProductId, РЅРµР·Р°РІРёСЃРёРјС‹Рј composition/EAV copy, shared photo/module refs Рё defaults `stockQty=0`, `status=draft`, `isSystem=false`. Р”РѕР±Р°РІР»РµРЅ bounded unique-SKU retry Рё СЂСѓСЃСЃРєРёР№ 409 РґР»СЏ explicit collision. Product update РїРѕР»СѓС‡РёР» optional `expectedVersion` в†’ 409 Р±РµР· stale overwrite.
**Gates:** backend tsc PASS; ProductService 16/16; frontend tsc PASS; ProductsService 2/2; changed-file ESLint PASS; architecture:check PASS; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-371.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-371.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-371-product-duplicate-api.lock`
**Implementation SHA:** `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
**Known limit:** UI copy/rebind action belongs to TZ-SALES-372; photo binaries intentionally remain shared refs; TZ-SALES-371 validates real photo output.


## [2026-08-13] вЂ” TZ-AUTH-304 DONE вЂ” РІС…РѕРґ РїРѕ РїСЂРёРіР»Р°С€РµРЅРёСЋ (UI)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (coding agent) + Buffy (closeout/sessionKind-РєРѕРЅС‚СЂР°РєС‚)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend; deploy РќР•
**Р§С‚Рѕ:** РџСѓР±Р»РёС‡РЅР°СЏ Р°РєС‚РёРІР°С†РёСЏ `/enroll/:token` (РѕРґРЅРѕ РїРѕР»Рµ В«РљР°Рє РЅР°Р·РІР°С‚СЊ СЌС‚РѕС‚ РєРѕРјРїСЊСЋС‚РµСЂ?В», GET РЅРµ consume, POST С‚РѕР»СЊРєРѕ РїРѕ РєРЅРѕРїРєРµ; РїРѕСЃР»Рµ СѓСЃРїРµС…Р° `applyDeviceAccess` вЂ” С‚РѕР»СЊРєРѕ РєРѕСЂРѕС‚РєРёР№ access JWT Р±РµР· refresh вЂ” + `ensureUser()` + `navigateByUrl('/', { replaceUrl: true })`). Device-СЃРµСЃСЃРёСЏ РІ SPA: `DEVICE_KEY` (localStorage), `renewDevice` (single-flight cookie-renew), `bootstrapDevice` (statusв†’sessionв†’me), `deviceDenied` (В«Р”РѕСЃС‚СѓРї СЌС‚РѕРіРѕ РєРѕРјРїСЊСЋС‚РµСЂР° РѕС‚РєР»СЋС‡С‘РЅ. РћР±СЂР°С‚РёС‚РµСЃСЊ Рє Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ.В») РЅР° `/login`; interceptor 401 в†’ cookie-renew + РѕРґРёРЅ retry (IS_RETRY), Р±РµР· С†РёРєР»РѕРІ; password-РїРѕС‚РѕРє РЅРµ Р·Р°С‚СЂРѕРЅСѓС‚. РђРґРјРёРЅ-СЃС‚СЂР°РЅРёС†Р° `/admin/devices`: С‡РёРї В«РЈСЃС‚СЂРѕР№СЃС‚РІР°В» (sibling РџРѕР»СЊР·РѕРІР°С‚РµР»Рё|Р РѕР»Рё), С‚Р°Р±Р»РёС†Р° (РёРјСЏ/СЃРѕСЃС‚РѕСЏРЅРёРµ В«Р Р°Р±РѕС‚Р°РµС‚|РћС‚РєР»СЋС‡С‘РЅВ»/СЂРѕР»СЊ/СЃСЂРѕРє/РїРѕСЃР»РµРґРЅРёР№ РІС…РѕРґ), В«РЎРѕР·РґР°С‚СЊ СЃСЃС‹Р»РєСѓВ» (СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»СЊРЅР° + СЃСЂРѕРє 1/3/7 + РґРѕСЃС‚СѓРї 30/90/365 в†’ URL + РљРѕРїРёСЂРѕРІР°С‚СЊ), owner-only В«Р”РѕР±Р°РІРёС‚СЊ РјРѕР№ РєРѕРјРїСЊСЋС‚РµСЂВ» (step-up РїР°СЂРѕР»СЊ, 15m, Р±РµР· СЂРѕР»Рё), В«РР·РјРµРЅРёС‚СЊ СЂРѕР»СЊВ»/В«РР·РјРµРЅРёС‚СЊ СЃСЂРѕРєВ»/В«РћС‚РєР»СЋС‡РёС‚СЊВ» (СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј); `PiDeviceEnrollmentService` вЂ” typed РєР»РёРµРЅС‚.
**Gates:** FE tsc PASS; auth.service 24/24; auth.interceptor 13/13 (device-renew + recursion-guard); enroll 6/6; devices-admin 6/6; login.page 4/4; permission-labels PASS; eslint/diff-check PASS. Backend-РєРѕРЅС‚СЂР°РєС‚: enroll/session в†’ `sessionKind: 'device'` (184f965d, e2e PASS).
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-304.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-304.md`
**Lock:** `.mimocode/locks/TZ-AUTH-304-device-enrollment-ui.lock`
**Known limit:** nginx Basic РґРѕ TZ-AUTH-305; `__Host-` cookie С‚СЂРµР±СѓРµС‚ HTTPS; СЃРјРµРЅР° СЂРѕР»Рё СѓСЃС‚СЂРѕР№СЃС‚РІР° вЂ” РїСЂРё СЃР»РµРґСѓСЋС‰РµРј renew (в‰¤5m). Pre-existing (РЅРµ СЂРµРіСЂРµСЃСЃРёСЏ): FormProfilesService вЂє isLocked РїР°РґР°РµС‚ РЅР° main (TZ-DICT-315).
**NEXT:** READY FOR DEPLOY вЂ” TZ-AUTH-305 (nginx auth_request + rollback) С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СЏРІРЅРѕР№ РєРѕРјР°РЅРґС‹ PO `РґРµРїР»РѕР№`; РґРѕ РІРєР»СЋС‡РµРЅРёСЏ auth_request Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊ owner-Р±СЂР°СѓР·РµСЂ (C1). Р’РѕР»РЅР° 3/5, РЅРµ DONE; TZ-AUTH-307 С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ PASS cutover.

## [2026-08-13] вЂ” TZ-AUTH-303 DONE вЂ” РІС…РѕРґ РїРѕ РїСЂРёРіР»Р°С€РµРЅРёСЋ (backend)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (coding agent)
**РЎС‚Р°С‚СѓСЃ:** DONE; backend-only; deploy РќР•
**Р§С‚Рѕ:** РќРѕРІС‹Р№ РјРѕРґСѓР»СЊ `backend/src/modules/device-enrollment/` вЂ” `DeviceInvite` (regular СЃ preselected Р°РєС‚РёРІРЅРѕР№ role / owner-device СЃ immutable ownerUserId, SHA-256 hash + display prefix, TTL 1/3/7d default 3d) Рё `BrowserDeviceGrant` (browser-only credential, SHA-256 hash, `deviceName` РЅРµ-unique, 365d default). РђС‚РѕРјР°СЂРЅРѕРµ РѕРґРЅРѕСЂР°Р·РѕРІРѕРµ РїРѕРіР°С€РµРЅРёРµ РІ Mongo-С‚СЂР°РЅР·Р°РєС†РёРё: regular в†’ `User(accountType=device)` СЃ random РЅРµРІС‹РґР°РІР°РµРјС‹Рј РїР°СЂРѕР»РµРј Рё СЂРѕРІРЅРѕ РІС‹Р±СЂР°РЅРЅРѕР№ СЂРѕР»СЊСЋ; owner-device в†’ grant РЅР° СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ РµРґРёРЅСЃС‚РІРµРЅРЅРѕРіРѕ owner (15m, password step-up). Cookie `__Host-kppdf-device` (Secure+HttpOnly+SameSite=Lax, Path=/, Р±РµР· Domain); cookie-only `GET /device/session` РІС‹РґР°С‘С‚ access JWT в‰¤5m Р±РµР· refresh; `GET /device/status`, `GET /device/auth-check` (nginx boolean gate Р±РµР· РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…). Admin `user:admin`: invites CRUD + devices list/PATCH/revoke; owner-only `POST /admin/devices/owner-invite` + `GET /admin/devices/owner`. РРЅРІР°СЂРёР°РЅС‚С‹: role С‚РѕР»СЊРєРѕ РёР· invite; admin-power (invite admin / PATCH РІ/РёР· admin) вЂ” owner-only (403, Р±РµР· РјСѓС‚Р°С†РёРё User); reset-password РґР»СЏ device в†’ 409; audit Р±РµР· plaintext. `accountType` РґРѕР±Р°РІР»РµРЅ РІ `User`; Desktop/nginx РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**Gates:** backend tsc PASS; device-enrollment 20/20; auth.service 15/15; desktop-pairing-key 7/7; enrollment e2e 8/8 + auth 6/6 + owner-invariant 8/8; eslint/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-303.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-303.md`
**Lock:** `.mimocode/locks/TZ-AUTH-303-device-enrollment-backend.lock`
**Known limit:** РґРѕ 304 РЅРµС‚ UI `/enroll` + `/admin/devices`; nginx Basic РґРѕ 305; `__Host-` cookie С‚СЂРµР±СѓРµС‚ HTTPS (dev С‡РµСЂРµР· proxy).
**NEXT:** TZ-AUTH-304 (UI `/enroll/:token` + `/admin/devices`). Deploy РќР•.

## [2026-08-13] вЂ” TZ-AUTH-306 DONE вЂ” РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ СЃРєСЂС‹С‚С‹Р№ РІР»Р°РґРµР»РµС† (hidden owner invariant)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (coding agent)
**РЎС‚Р°С‚СѓСЃ:** DONE; backend + frontend; deploy РќР•
**Р§С‚Рѕ:** `user.schema.ts` вЂ” `isOwner` (default false) + partial unique index `partialFilterExpression { isOwner:true }` (Р‘Р”-gate В«РЅРµ Р±РѕР»РµРµ РѕРґРЅРѕРіРѕ trueВ»). `admin.seed.ts` вЂ” idempotent fail-closed `backfillOwner()`: owner = С‚РѕС‡РЅС‹Р№ Р°РєС‚РёРІРЅС‹Р№ bootstrap admin РїРѕ `ADMIN_USERNAME`; 0/РЅРµР°РєС‚РёРІРЅС‹Р№/РЅРµСЃРѕРІРїР°РґР°СЋС‰РёР№/>1 owner в†’ startup error, РЅРёРєРѕРіРґР° РЅРµ СЃРѕР·РґР°С‘С‚ РІС‚РѕСЂРѕРіРѕ owner, Р±РµР· wipe/reseed. `jwt.strategy.ts` РіРёРґСЂРёСЂСѓРµС‚ `isOwner` РёР· Р‘Р” (РЅРµ РёР· JWT). Owner bypass РІ Roles/PermissionsGuard Р±РµР· owner-only permission key. `owner-only.guard.ts` (403 OWNER_ONLY) РЅР° roles-admin + permissions-admin; `owner-target.guard.ts` РЅР° users-admin mutators (non-owner в†’ owner 404; owner self delete/deactivate/demote 403 OWNER_SELF_PROTECTED; grant/revoke admin power 403 OWNER_ONLY). users-admin list/count/search/getById СЃРєСЂС‹РІР°СЋС‚ owner РґР»СЏ non-owner; create role=admin 403. FE: `isOwner` computed, `ownerOnlyRouteGuard` РЅР° /admin/roles, СЃРєСЂС‹С‚РёРµ self-destructive РґРµР№СЃС‚РІРёР№ owner-СЃС‚СЂРѕРєРё.
**Gates:** backend tsc PASS; frontend tsc PASS; backend tests 99/99 (owner-target/owner-only/roles.guard/permissions.guard/auth.service/users-admin/roles-admin/last-admin); e2e owner-invariant 8/8 + auth 6/6; frontend jest 27/27; eslint PASS (pre-existing warnings РІРЅРµ scope); architecture:check 1 pre-existing; git diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-306.done.md`
**Checklist:** `docs/agent-checklists/TZ-AUTH-306.md`
**Lock:** `.mimocode/locks/TZ-AUTH-306-hidden-owner-invariant.lock`
**Known limit:** ordinary admin РІСЃС‘ РµС‰С‘ РјРѕР¶РµС‚ РІС‹РґР°С‚СЊ `permissions: ['*']` (pre-existing wildcard break-glass RBAC-CONTRACT В§4/В§9.3) вЂ” РІРЅРµ scope 306.
**NEXT:** TZ-AUTH-303 (backend regular invite + owner-device self-link + BrowserDeviceGrant + 365d cookie + JWT в‰¤5m). Deploy РќР•.

## [2026-08-12] вЂ” TZD-46 DONE вЂ” Desktop ZIP semver РІ РёРјРµРЅРё С„Р°Р№Р»Р° + publish canon
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff/tzd-46 (agent-158a657202)
**РЎС‚Р°С‚СѓСЃ:** DONE; desktop publish + deploy scripts + FE URL + docs; deploy РќР•
**Р§С‚Рѕ:** publish-installer.mjs: Semver SoT = `desktop/package.json` (assert == `tauri.conf.json`, FAIL РїСЂРё СЂР°СЃС…РѕР¶РґРµРЅРёРё); РїСѓР±Р»РёРєСѓРµС‚ `kppdf-desktop-setup-v{semver}.exe/.zip` (РІРЅСѓС‚СЂРё ZIP вЂ” versioned exe) + unversioned aliases `kppdf-desktop-setup.exe/.zip` (РєРѕРїРёСЏ С‚РµС… Р¶Рµ Р±Р°Р№С‚); NSIS candidate `KPPDF Desktop_{semver}_x64-setup.exe` РІРјРµСЃС‚Рѕ С…Р°СЂРґРєРѕРґР° `0.1.0` (legacy = fallback WARN); С„РёРЅР°Р»СЊРЅС‹Р№ Р»РѕРі вЂ” versioned URL. deploy.py `publish_desktop_installer` вЂ” Р·РµСЂРєР°Р»Рѕ СЃС…РµРјС‹ (semver РёР· package.json РЅР° build-РјР°С€РёРЅРµ, versioned + alias РІ `frontend/browser/downloads/`, WARN РїСЂРѕ versioned zip). FE `DEFAULT_DESKTOP_DOWNLOAD_URL` РѕСЃС‚Р°С‘С‚СЃСЏ alias (РІР°СЂРёР°РЅС‚ A РєР°РЅРѕРЅР°) + РґРѕРєРєРѕРјРјРµРЅС‚ РїСЂРѕ meta-РёРЅР¶РµРєС‚ versioned; pairing РїРѕРєР°Р·С‹РІР°РµС‚ semver РёР· compat. INSTALL.md/PAIRING.md вЂ” РєР°РЅРѕРЅ РёРјС‘РЅ; deploy README + config.env.example СѓР¶Рµ РІ base (b91de8df).
**Gates:** desktop tsc PASS; version-compat tsx 10/10 PASS (tsx вЂ” РєР°РЅРѕРЅ TZD-40; `node --test` РЅРµ СЂРµР·РѕР»РІРёС‚ extensionless ESM); publish dry Р±РµР· exe в†’ FAIL c message (exit 1); publish functional (fake exe: 4 С„Р°Р№Р»Р° РІ РѕР±РѕРёС… РєР°С‚Р°Р»РѕРіР°С…, arcname versioned) PASS; deploy.py publish functional (python tmp root, alias zip byte-identical) PASS; FE tsc PASS; jest pairing+desktop-download-url 14/14 PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZD-46.done.md`
**Checklist:** `docs/agent-checklists/TZD-46.md`
**Lock:** `.mimocode/locks/TZD-46-desktop-zip-versioned-filename.lock`
**Known limit:** live Synology РѕР±РЅРѕРІРёС‚СЃСЏ С‚РѕР»СЊРєРѕ РЅР° СЃР»РµРґСѓСЋС‰РµРј warm deploy (tauri build + publish-installer РЅР° build-РјР°С€РёРЅРµ, VPN off + СЃР»РѕРІРѕ PO); Р»РѕРєР°Р»СЊРЅС‹Р№ С‚РµСЃС‚ вЂ” С„РµР№РєРѕРІС‹Р№ exe (СѓР±СЂР°РЅРѕ).
**NEXT:** idle desktop/backend С„РѕРЅ; В«РґРµРїР»РѕР№В» вЂ” С‚РѕР»СЊРєРѕ РїРѕ СЃР»РѕРІСѓ PO. РќРµ РІС‹РґСѓРјС‹РІР°С‚СЊ TZ.

## [2026-08-12] вЂ” TZ-UX-317 DONE вЂ” СЃРёСЃС‚РµРјРЅС‹Рµ в†ђ в†’ РІ РїРѕР»СЏС… app shell (WAVE-NAV-RETURN #2)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff/wave-nav-return (agent-158a657202)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only; deploy РќР•
**Р§С‚Рѕ:** РќРѕРІС‹Р№ `AppHistoryStore` (site-wide SPA history): СЃС‚РµРє same-app URL РёР· Router events, `popstate` РґРІРёРіР°РµС‚ РёРЅРґРµРєСЃ, replaceUrl-С‚РёРєРё РЅРµ СЂР°СЃС‚СЏС‚ СЃС‚РµРє, `/login` РЅРµ РїСЂРµРґС‹РґСѓС‰РёР№ URL, `Location.back()/forward()` вЂ” СЂРµР°Р»СЊРЅР°СЏ Р±СЂР°СѓР·РµСЂРЅР°СЏ РёСЃС‚РѕСЂРёСЏ. Р’ `app-layout` gutters-РєРЅРѕРїРєРё в†ђ (`data-test="app-nav-back"`) / в†’ (`app-nav-forward"`) вЂ” position:fixed РІ РїРѕР»СЏС… РІРЅРµ max-width РєРѕР»РѕРЅРєРё, РІРёРґРЅС‹ в‰Ґ1680px (РїРѕР»Рµ в‰Ґ76px, РЅРµ РЅР°РµР·Р¶Р°СЋС‚ РЅР° studio rails/palette/A4), disabled + aria-disabled Р±РµР· РёСЃС‚РѕСЂРёРё. page-chrome.md: Р·Р°РїСЂРµС‚ В«РіР»РѕР±Р°Р»СЊРЅС‹С… в†ђв†’ РЅРµС‚В» Р·Р°РјРµРЅС‘РЅ РєР°РЅРѕРЅРѕРј gutters + РїСЂРёРѕСЂРёС‚РµС‚ returnUrl vs history.
**Gates:** FE tsc PASS (0 errors); Jest app-layout 4/4 + app-history.store 6/6 + nav-order/catalog-return (РѕР±С‰РёР№ РїСЂРѕРіРѕРЅ СЃ picker+builder 57/57) PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-317.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-317.md`
**Lock:** `.mimocode/locks/TZ-UX-317-app-history-gutters.lock`
**Known limit:** live visual smoke gutters вЂ” РІСЂСѓС‡РЅСѓСЋ РїРѕСЃР»Рµ РґРµРїР»РѕСЏ; РїРѕСЂРѕРі РІС…РѕР¶РґРµРЅРёСЏ 1680px РїРѕ РіРµРѕРјРµС‚СЂРёРё РїРѕР»РµР№.
**NEXT:** WAVE-NAV-RETURN closed вЂ” idle, РіРѕС‚РѕРІРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ РґРµРїР»РѕР№; deploy РќР•.

## [2026-08-12] вЂ” TZ-UX-316 DONE вЂ” В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ С€Р°Р±Р»РѕРЅВ» в†’ /builder/:id + returnUrl (WAVE-NAV-RETURN #1)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** freebuff/wave-nav-return (agent-158a657202)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only; deploy РќР•
**Р§С‚Рѕ:** РР· Create В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ С€Р°Р±Р»РѕРЅВ» РѕС‚РєСЂС‹РІР°РµС‚ Р¶РёРІРѕР№ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ `/doc-constructor/builder/:id` (РЅРµ СЃРїРёСЃРѕРє `/templates?templateId=` вЂ” query С‚Р°Рј РЅРµ С‡РёС‚Р°Р»СЃСЏ) СЃ `?returnUrl` = С‚РµРєСѓС‰РёР№ Create path (РІРєР». query id С‡РµСЂРЅРѕРІРёРєР°). Builder В«в†ђВ»: РІР°Р»РёРґРЅС‹Р№ same-origin `returnUrl` в†’ С‚СѓРґР° (label В«в†ђ Рљ СЃРѕР·РґР°РЅРёСЋ РљРџВ»); РёРЅР°С‡Рµ `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')` (label В«в†ђ РЁР°Р±Р»РѕРЅС‹В»). Р’Р°Р»РёРґР°С†РёСЏ returnUrl: absolute same-origin path, Р±РµР· `//host` Рё СЃС…РµРј.
**Gates:** FE tsc PASS (0 errors); Jest picker 2/2 + builder.page 29/29 = 31/31 PASS; ESLint/Prettier/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-316.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-316.md`
**Lock:** `.mimocode/locks/TZ-UX-316-template-edit-return.lock`
**Known limit:** `proposal-create.page.ts` РЅРµ С‚СЂРѕРЅСѓС‚ (TZ-SALES-368 WIP РІ canonical); gutter-РєР°РЅРѕРЅ вЂ” РІ 317.
**NEXT:** TZ-UX-317 (СЃРёСЃС‚РµРјРЅС‹Рµ в†ђв†’ РІ gutters app shell); deploy РќР•.

## [2026-08-12] вЂ” TZ-SALES-368 DONE вЂ” Create РљРџ: РїРµС‡Р°С‚СЊ СЃРІРѕР±РѕРґРЅР°СЏ; PDF/РђСЂС…РёРІ РѕС‚РґРµР»СЊРЅРѕ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only; deploy РќР•
**Р§С‚Рѕ:** `requestOutput` СЂР°Р·РІРµРґС‘РЅ: РџРµС‡Р°С‚СЊ СЃСЂР°Р·Сѓ Р·РѕРІС‘С‚ `printCurrentPreview()` (Р±РµР· `canSaveDraft`/save/pendingOutput, РїСѓСЃС‚РѕРµ РїСЂРµРІСЊСЋ вЂ” РєРѕСЂРѕС‚РєРёР№ С‚РѕСЃС‚); PDF/РђСЂС…РёРІ С‚СЂРµР±СѓСЋС‚ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ draft id (РµСЃС‚СЊ id в†’ СЃСЂР°Р·Сѓ; РЅРµС‚ Рё РјРѕР¶РЅРѕ в†’ save Р·Р°С‚РµРј; РЅРµР»СЊР·СЏ в†’ СЃРІРѕР№ С‚РѕСЃС‚ В«Р”Р»СЏ PDF/Р°СЂС…РёРІР° РЅСѓР¶РЅС‹ С€Р°Р±Р»РѕРЅ, РіРѕС‚РѕРІРѕРµ РїСЂРµРІСЊСЋ Рё РЅР°С€Р° С„РёСЂРјР°В»). Autosave write-path РЅРµ С‚СЂРѕРЅСѓС‚.
**Gates:** FE tsc PASS; proposal-create.page Jest 41/41 PASS (+4 С‚РµСЃС‚Р°); diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-368.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-368.md`
**Lock:** `.mimocode/locks/TZ-SALES-368-kp-output-gates.lock`

## [2026-08-12] вЂ” TZ-SALES-367 DONE вЂ” Create РљРџ: savebar gone, output on rail
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only; deploy РќР•
**Р§С‚Рѕ:** РЈРґР°Р»РµРЅР° РїРѕР»РѕСЃР° РЅР°Рґ A4 (`kp-save-bar`: РЎРѕС…СЂР°РЅРµРЅРѕ/СЃС‚Р°С‚СѓСЃ/РІРµСЂСЃРёРё/Р·Р°РєР°Р·/РєРѕРїРёСЂРѕРІР°С‚СЊ/РЎРєР°С‡Р°С‚СЊ). A4 СЃСЂР°Р·Сѓ РїРѕРґ chips. Р’С‹РІРѕРґ вЂ” РїСЂР°РІС‹Р№ rail В«Р’С‹РІРѕРґВ» в†’ РџРµС‡Р°С‚СЊ В· PDF В· РђСЂС…РёРІ. Autosave Р±РµР· РІРёРґРёРјРѕР№ РїРѕР»РѕСЃС‹. Lifecycle вЂ” РЅР° Р’СЃРµ РљРџ.
**Gates:** FE tsc PASS; proposal-create.page Jest 37/37 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-367.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-367.md`
**Lock:** `.mimocode/locks/TZ-SALES-367-kp-create-no-savebar.lock`
**Known limit:** РѕС‚РґРµР»СЊРЅРѕР№ СЃС‚СЂР°РЅРёС†С‹ РїСЂРѕСЃРјРѕС‚СЂР° РіРѕС‚РѕРІРѕРіРѕ РљРџ РЅРµС‚ (park).
**NEXT:** idle; deploy РќР•.

## [2026-08-12] вЂ” TZ-SALES-366 DONE вЂ” Р±СЂР°СѓР·РµСЂРЅР°СЏ В«РџРµС‡Р°С‚СЊВ» РљРџ РІРЅРµ sandbox-РїСЂРµРІСЊСЋ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** kppdf-8.0/freebuff (agent-adeea875e2)
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only; deploy РќР•
**Р§С‚Рѕ:** В«РЎРєР°С‡Р°С‚СЊ в–ѕ в†’ РџРµС‡Р°С‚СЊВ» Р±РѕР»СЊС€Рµ РЅРµ Р·РѕРІС‘С‚ `print()` РІРЅСѓС‚СЂРё sandboxed A4 iframe (`Ignored call to 'print()'`): `printPreview()` СЃРѕР±РёСЂР°РµС‚ С‚РѕС‚ Р¶Рµ build HTML РІСЃРµС… Р»РёСЃС‚РѕРІ (`previewHtml` вЂ” РїРѕР»РЅС‹Р№ РґРѕРєСѓРјРµРЅС‚ СЃ `.doc-page` Рё `@page A4`) Рё РїРµС‡Р°С‚Р°РµС‚ РµРіРѕ РІРѕ РІСЂРµРјРµРЅРЅРѕРј РЅРµРІРёРґРёРјРѕРј СЂРѕРґРёС‚РµР»СЊСЃРєРѕРј iframe (`data-test="kp-temp-print-frame"`, Р±РµР· sandbox вЂ” РјРѕРґР°Р»РєРё СЂР°Р·СЂРµС€РµРЅС‹; srcdoc Р·Р°РґР°С‘С‚СЃСЏ РґРѕ РІСЃС‚Р°РІРєРё, РїРµС‡Р°С‚СЊ РїРѕ load СЃ guard `about:srcdoc`, РєР°РґСЂ СѓР±РёСЂР°РµС‚СЃСЏ РїРѕ `afterprint`/С‚Р°Р№РјР°СѓС‚Сѓ). Р’ head РґРѕР±Р°РІР»СЏРµС‚СЃСЏ РїРµС‡Р°С‚РЅС‹Р№ CSS (`print-color-adjust:exact` вЂ” С„РѕРЅ В«РєР°Рє РЅР° СЌРєСЂР°РЅРµВ», РїР°СЂРёС‚РµС‚ СЃ PDF `printBackground`; СЏРІРЅС‹Р№ page-break РјРµР¶РґСѓ Р»РёСЃС‚Р°РјРё). РџСЂРµРІСЊСЋ-Р»РµРЅС‚Р° РѕСЃС‚Р°Р»Р°СЃСЊ `sandbox="allow-same-origin"` Р±РµР· scripts; СѓР±СЂР°РЅ РЅРµРЅСѓР¶РЅС‹Р№ `#previewFrame` viewChild. `proposal-create.page.ts` РЅРµ С‚СЂРѕРЅСѓС‚; PDF/РђСЂС…РёРІ/puppeteer/Desktop РЅРµ С‚СЂРѕРЅСѓС‚С‹; 320 РѕСЃС‚Р°С‘С‚СЃСЏ PARK.
**Gates:** FE tsc PASS (exit 0, 0 diagnostics); focused Jest proposal-create-template-center + proposal-create.page 42/42 PASS (РЅРѕРІС‹Р№ spec template-center 5/5: sandbox Р±РµР· allow-scripts, print path, temp frame РІСЃРµС… Р»РёСЃС‚РѕРІ, РїСѓСЃС‚РѕРµ РїСЂРµРІСЊСЋ Р±РµР· РєР°РґСЂР°); changed ESLint/Prettier/diff-check PASS; `git diff` Р±РµР· page.ts / PDF / puppeteer / Desktop.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-366.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-366.md`
**Lock:** `.mimocode/locks/TZ-SALES-366-kp-browser-print-sandbox.lock`
**Known limit:** РЅР°С‚РёРІРЅС‹Р№ РґРёР°Р»РѕРі РїРµС‡Р°С‚Рё РІ headless-СЃРµСЃСЃРёРё РЅРµ РѕС‚РєСЂС‹С‚СЊ вЂ” print-РїСѓС‚СЊ РїРѕРєСЂС‹С‚ Jest; live smoke В«Р’СЃРµ РљРџ в†’ ?action=printВ» вЂ” РІСЂСѓС‡РЅСѓСЋ РїРѕСЃР»Рµ РґРµРїР»РѕСЏ.
**NEXT:** TZ-SALES-362 (С‚РёСЂС‹ S/L + РёРєРѕРЅРєР° РЈСЃР»РѕРІРёР№) РїРѕСЃР»Рµ merge 359 РЅР° page.ts; deploy РќР•.

## [2026-08-12] вЂ” TZ-SALES-363 DONE вЂ” chrome polish РїР°РЅРµР»РµР№ Create РљРџ (WAVE-KP-STUDIO-CHROME #1)
**РђРІС‚РѕСЂ:** Buffy / freebuff-kppdf-8.0-d8650b12
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend-only (LAYER 2, parallel OK); deploy РќР•
**Р§С‚Рѕ:** РџР°РЅРµР»Рё-РґРµС‚Рё СЃС‚СѓРґРёРё Create РљРџ СѓР¶Р°С‚С‹ РїРѕ Paper & Ink: (1) РїСѓСЃС‚РѕРµ В«РЈСЃР»РѕРІРёСЏВ» вЂ” РєРѕСЂРѕС‚РєРѕРµ В«Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІРѕРµ СѓСЃР»РѕРІРёРµ.В» Р±РµР· РїРѕРІС‚РѕСЂР° РєРЅРѕРїРєРё Р±РёР±Р»РёРѕС‚РµРєРё; (2) В«РЁР°Р±Р»РѕРЅВ» вЂ” СѓР±СЂР°РЅ РґСѓР±Р»СЊ РёРјРµРЅРё С€Р°Р±Р»РѕРЅР° РїРѕРґ СЃРµР»РµРєС‚РѕРј (РёРјСЏ Рё С‚Р°Рє РІ trigger); (3) В«РџРѕР»СѓС‡Р°С‚РµР»СЊВ» вЂ” РєР»РёРµРЅС‚ РІС‹Р±РёСЂР°РµС‚СЃСЏ searchable `PiOverflowSelect` (334-РєР°РЅРѕРЅ) РІРјРµСЃС‚Рѕ В«РїРѕРёСЃРє + native selectВ»; (4) В«РџР°СЂР°РјРµС‚СЂС‹В» вЂ” С‚СЂРё РїРѕРІС‚РѕСЂР° В«С‚РѕР»СЊРєРѕ РІ СЌС‚РѕРј РљРџВ» СЃРІРµРґРµРЅС‹ Рє РѕРґРЅРѕР№ РїРѕРґСЃРєР°Р·РєРµ РїСЂРѕ РЅР°С†РµРЅРєСѓ. Product rail РЅРµ РјРµРЅСЏР»СЃСЏ (С€СѓРјР° РЅРµС‚; С€РёСЂРёРЅР° = 362).
**Gates:** frontend tsc PASS; proposal-create + terms Jest 38/38 PASS; changed-file ESLint PASS; `git diff --check` PASS; diff РЅРµ СЃРѕРґРµСЂР¶РёС‚ `proposal-create.page.ts`. DOM self-verify PASS РЅР° dev :4203 (РЈСЃР»РѕРІРёСЏ/РџРѕР»СѓС‡Р°С‚РµР»СЊ/РЁР°Р±Р»РѕРЅ/РџР°СЂР°РјРµС‚СЂС‹ РІР¶РёРІСѓСЋ, console С‡РёСЃС‚).
**Archive:** `tasks/_archive/2026-08/TZ-SALES-363.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-363.md`
**Lock:** `.mimocode/locks/TZ-SALES-363-kp-studio-panels-chrome.lock`
**Known limit:** Prettier-Р±Р°Р·Р»Р°Р№РЅ СЂРµРїРѕ РЅРµ С‡РёСЃС‚ (warn РЅР° untouched С„Р°Р№Р»Р°С…); РјРѕРё РїСЂР°РІРєРё СЃС‚РёР»СЋ РѕРєСЂСѓР¶РµРЅРёСЏ РЅРµ РїСЂРѕС‚РёРІРѕСЂРµС‡Р°С‚. Live backend-data smoke РЅРµ С‚СЂРµР±СѓРµС‚СЃСЏ (РїСЂР°РІРєРё UI-РєРѕРїРёСЂР°Р№С‚Р°/РІС‹Р±РѕСЂР°).
**NEXT:** TZ-SALES-362 РїРѕСЃР»Рµ merge 359 РЅР° page.ts; deploy РќР•.

## [2026-08-12] вЂ” TZD-44 DONE вЂ” MCP data hygiene
**РђРІС‚РѕСЂ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; Desktop/MCP only; deploy РќР•
**Р§С‚Рѕ:** Added read-only duplicate grouping for material/product/module/counterparty and gated `kppdf_cleanup_test_data` with exactly one non-empty prefix/regex/id filter, explicit `userOk:true`, dry-run mode, and existing Nest DELETE soft-delete guards only. No hard delete, wipe, or production cleanup.
**Gates:** desktop/mcp 110/110 PASS; MCP tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-44.done.md`
**Checklist:** `docs/agent-checklists/TZD-44.md`
**Lock:** `.mimocode/locks/TZD-44-mcp-data-hygiene.lock`
**Known limitation:** production cleanup waits for explicit PO В«РґР°, С‡РёСЃС‚Рё РўРµСЃС‚*В»; TZD-45 remains parked.
**NEXT:** MCP audit queue complete; deploy РќР•.

## [2026-08-12] вЂ” TZD-43 DONE вЂ” MCP product category/status contract
**РђРІС‚РѕСЂ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; Desktop/MCP + backend mutation-journal mapping; deploy РќР•
**Р§С‚Рѕ:** Product proposals now accept optional `categoryId` and backend status whitelist `new|active|archived|draft`; journal payload preserves both through confirm. Product domain schema and `kppdf_validate_product` expose/validate the fields; omitted fields remain backward-compatible.
**Gates:** desktop/mcp 105/105 PASS; MCP tsc PASS; backend mutation-journal 26/26 PASS; backend tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-43.done.md`
**Checklist:** `docs/agent-checklists/TZD-43.md`
**Lock:** `.mimocode/locks/TZD-43-mcp-product-category-status.lock`
**Known limitation:** no live product create was run; no category API/backfill/frontend/production/deploy changes.
**NEXT:** TZD-44; TZD-45 parked; deploy РќР•.

## [2026-08-12] вЂ” TZD-42 DONE вЂ” MCP mutation-journal confirm 404 recovery
**РђРІС‚РѕСЂ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; Desktop/MCP + backend mutation-journal; deploy РќР•
**Р§С‚Рѕ:** Reproduced a stable proposeв†’confirm path through 100 immediate backend confirms and material/product MCP mock chains. Root cause was consistent with clients passing a nested/derived id instead of TZD-41вЂ™s top-level `proposalId`; no delete, overwrite, ownership race, or TTL expiry reproduced. Proposal confirm/cancel 404s now echo the received id with a recovery hint, and MCP confirm repeats it on HTTP 404.
**Gates:** backend mutation-journal 23/23 PASS; backend tsc PASS; desktop/mcp 100/100 PASS; MCP tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-42.done.md`
**Checklist:** `docs/agent-checklists/TZD-42.md`
**Lock:** `.mimocode/locks/TZD-42-mcp-confirm-404.lock`
**Known limitation:** live replay of В«РЁРµСЃС‚ РґР»СЏ Р»Р°Р·Р°РЅРёСЏ РЁР›-300В» was not run; unit + MCP chain close the investigated hypotheses. No frontend, TZD-43/44/45, production cleanup, or deploy changes.
**NEXT:** TZD-43 в†’ TZD-44; TZD-45 parked; deploy РќР•.

## [2026-08-12] вЂ” TZD-41 DONE вЂ” MCP envelope, outputSchema and canonical list aliases
**РђРІС‚РѕСЂ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; Desktop/MCP contract hardening; deploy РќР•
**Р§С‚Рѕ:** РћР±С‰РёР№ success envelope `{ok,result,id?,proposalId?}` С‚РµРїРµСЂСЊ РѕС‚РґР°С‘С‚СЃСЏ Рё С‡РµСЂРµР· `structuredContent`; `_id` РЅРѕСЂРјР°Р»РёР·СѓРµС‚СЃСЏ РІ `id`, proposal ids вЂ” РІ top-level `proposalId`. Р”РѕР±Р°РІР»РµРЅС‹ `outputSchema` РЅР° TZD-41 tool surface Рё РєР°РЅРѕРЅРёС‡РµСЃРєРёРµ `kppdf_list_*` СЃ one-wave aliases РґР»СЏ doc/import/text list tools.
**Gates:** `cd desktop/mcp && pnpm test` 98/98 PASS; `pnpm exec tsc --noEmit` PASS; tools/list smoke 81 tools/outputSchema PASS; `git diff --check` PASS. Prettier/ESLint РґР»СЏ desktop/mcp РЅРµ РЅР°СЃС‚СЂРѕРµРЅС‹ (N/A).
**Archive:** `tasks/_archive/2026-08/TZD-41.done.md`
**Checklist:** `docs/agent-checklists/TZD-41.md`
**Lock:** `.mimocode/locks/TZD-41-mcp-envelope-output-schema.lock`
**Known limitation:** domain/validate registrations remain outside this conflict-key schema sweep; TZD-42 в†’ TZD-43 в†’ TZD-44 next, TZD-45 parked.
**NEXT:** TZD-42; deploy РќР•.

## [2026-08-11] вЂ” TZ-SALES-355 DONE вЂ” РЎРѕСЃС‚Р°РІ РљРџ: wide table + edit in place
**РђРІС‚РѕСЂ:** Cursor
**РЎС‚Р°С‚СѓСЃ:** DONE (РєРѕРґ); deploy РїРѕР·Р¶Рµ
**Р§С‚Рѕ:** РџСЂР°РІС‹Р№ В«РЎРѕСЃС‚Р°РІ РљРџВ» вЂ” С‚Р°Р±Р»РёС†Р° РЅР° ~ВЅ СЌРєСЂР°РЅР° РІРјРµСЃС‚Рѕ РєСѓС‡Рё РєР°СЂС‚РѕС‡РµРє; РєР°СЂР°РЅРґР°С€ РѕС‚РєСЂС‹РІР°РµС‚ FullEditor Р±РµР· СѓС…РѕРґР° СЃРѕ СЃС‚СѓРґРёРё; A4 = РїСЂРµРІСЊСЋ.
**Gates:** FE tsc PASS; proposal-create 34/34 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-355.done.md`
**Audit:** `docs/audits/2026-08-11-kp-composition-table-audit.md`
**NEXT:** PO СЃРјРѕС‚СЂРёС‚ Р»РѕРєР°Р»СЊРЅРѕ/РїРѕСЃР»Рµ РґРµРїР»РѕСЏ; РґРµРїР»РѕР№ РїРѕ РєРѕРјР°РЅРґРµ.

## [2026-08-11] вЂ” TZ-CATALOG-339 DONE вЂ” С„РѕС‚Рѕ РёР·РґРµР»РёСЏ Р±РµР· В«СѓР¶Рµ РёР·РјРµРЅРµРЅРѕВ»
**РђРІС‚РѕСЂ:** Cursor
**РЎС‚Р°С‚СѓСЃ:** DONE (РєРѕРґ); warm deploy вЂ” Р¶РґС‘С‚ PO В«РґРµРїР»РѕР№В»
**Р§С‚Рѕ:** VersionError РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё photoIds: optimisticLockPlugin Р±РѕР»СЊС€Рµ РЅРµ С‚СЂРѕРіР°РµС‚ __v РІСЂСѓС‡РЅСѓСЋ; Product/Material update С‡РµСЂРµР· findOneAndUpdate; attachPhoto вЂ” РЅРѕСЂРјР°Р»СЊРЅС‹Р№ append.
**Gates:** Jest product.service + optimistic-lock PASS; backend tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-339.done.md`
**Checklist:** `docs/agent-checklists/TZ-CATALOG-339.md`
**NEXT:** РґРµРїР»РѕР№ РїРѕ РєРѕРјР°РЅРґРµ PO в†’ СЃРЅРѕРІР° WAVE-MCP-AUDIT-P0 (TZD-41).

## [2026-08-11] вЂ” TZ-OPS-312 DONE вЂ” catalog page specs dictionary-labels flush
**РђРІС‚РѕСЂ:** Buffy / buffy-ops-312
**РЎС‚Р°С‚СѓСЃ:** DONE; specs-only harness fix; deploy РќР•
**Р§С‚Рѕ:** Р’ products/module-detail page specs РґРѕР±Р°РІР»РµРЅ СЏРІРЅС‹Р№ flush РІСЃРµС… GET `/dictionary-labels` РјР°СЃСЃРёРІРѕРј `[]`; generic leftover cleanup РІ module-detail Р±РѕР»СЊС€Рµ РЅРµ РѕС‚РїСЂР°РІР»СЏРµС‚ `{}` РІ dictionary service. Production pages/services/BOM РЅРµ Р·Р°С‚СЂРѕРЅСѓС‚С‹.
**Gates:** focused Jest 25/25; frontend app tsc PASS; ESLint PASS; Prettier code style PASS СЃ checkout CRLF override; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-312.done.md`
**Checklist:** `docs/agent-checklists/TZ-OPS-312.md`
**Lock:** `.mimocode/locks/TZ-OPS-312-catalog-specs-dict-flush.lock`
**NEXT:** idle; Deploy РќР•.

## [2026-08-11] вЂ” TZ-OPS-311 DONE вЂ” sharedв†’pages BOM СѓР±СЂР°РЅ (architecture:check)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / freebuff executor (land Cursorв†’main)
**РЎС‚Р°С‚СѓСЃ:** DONE; FE gates + archive + lock; landed on main
**Р§С‚Рѕ:** BOM panel + composition picker РїРµСЂРµРЅРµСЃРµРЅС‹ `pages/products/` в†’ `shared/ui/composition`; quick-create (shared) Р±РѕР»СЊС€Рµ РЅРµ РёРјРїРѕСЂС‚РёСЂСѓРµС‚ `pages/*`. Р’ РїР°РЅРµР»Рё module/material edit-РґРёР°Р»РѕРіРё СЃС‚Р°Р»Рё lazy dynamic imports (РїР°С‚С‚РµСЂРЅ product-form, Р±РµР· ESM-С†РёРєР»Р°, РѕРґРёРЅ write-path СЃРѕСЃС‚Р°РІР°). РћР±РЅРѕРІР»РµРЅС‹ РёРјРїРѕСЂС‚С‹ quick-create / product-form-dialog / product-detail / module-detail (+spec'С‹).
**Gates:** FE tsc PASS; `pnpm architecture:check` baseline 7 в†’ 3 (resolved: quick-create:52, module-detail:33, bom-panel:41/42; РЅРѕРІС‹С… РЅРµС‚) PASS; Jest focused 4/4 suites (63) PASS; Prettier/ESLint PASS. Pre-existing (С‡РёСЃС‚С‹Р№ HEAD, stash-С‚РµСЃС‚): module-detail.page.spec/products.page.spec 24 fail вЂ” dictionary-labels flush, РЅРµ СЂРµРіСЂРµСЃСЃРёСЏ.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-311.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-311-shared-bom-extract.lock`
**NEXT:** idle; WAVE-KP-SHAME-POLISH already DONE on main; deploy РќР•.

## [2026-08-11T18:30:00Z] вЂ” TZ-SALES-354 DONE вЂ” self-pass РјРµРЅРµРґР¶РµСЂР°, WAVE-KP-SHAME-POLISH DONE
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / buffy-sales354
**РЎС‚Р°С‚СѓСЃ:** DONE; manager self-pass, frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** РћРґРёРЅ РїСЂРѕС…РѕРґ В«Р’СЃРµ РљРџ в†’ РЎРѕР·РґР°С‚СЊ РљРџВ» РїРѕРґС‚РІРµСЂРґРёР» RU empty/status chrome, create/edit/copy/print routes, РІРёС‚СЂРёРЅР°/qty/modules/materials, СЃРѕСЃС‚Р°РІ/СЃРІРѕСЏ СЃС‚СЂРѕРєР°/СѓСЃР»РѕРІРёСЏ, status/F5/preview. РўРѕС‡РµС‡РЅРѕ СѓР±СЂР°РЅС‹ legacy `strip-commerce` Рё `master` РёР· РїРѕРґС‚РІРµСЂР¶РґРµРЅРёР№.
**Gates:** FE tsc PASS; proposals + proposal-create + product-rail Jest 68/68 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS. Browser/auth smoke unavailable headlessly.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-354.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-354-kp-manager-selfpass.lock`
**CHECKPOINT:** WAVE-KP-SHAME-POLISH DONE; idle; РіРѕС‚РѕРІРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ РґРµРїР»РѕР№; deploy РќР•.

## [2026-08-11T18:05:00Z] вЂ” TZ-SALES-353 DONE вЂ” РїСЂРµРІСЊСЋ A4, F5 Рё СЃС‚СЂР°РЅРёС†С‹
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / buffy-sales353
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** РџСЂРµРІСЊСЋ РїРѕРєР°Р·С‹РІР°РµС‚ РєРѕСЂРѕС‚РєРёРµ RU loading/error, РѕРґРёРЅ Р»РёСЃС‚ вЂ” В«РЎС‚СЂР°РЅРёС†Р° 1В», РЅРµСЃРєРѕР»СЊРєРѕ вЂ” В«РЎС‚СЂР°РЅРёС†Р° 1 РёР· NВ»; iframe sandboxed/view-only. F5 РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ СЃРѕСЃС‚Р°РІ Рё СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ `sheetLayout` РїРѕСЃР»Рµ РІС‹Р±РѕСЂР° С€Р°Р±Р»РѕРЅР°.
**Gates:** FE tsc PASS; proposal-create Jest 34/34 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-353.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-353-kp-preview-f5-shame.lock`
**NEXT:** TZ-SALES-354; deploy РќР•.

## [2026-08-11T17:20:00Z] вЂ” TZ-SALES-352 DONE вЂ” chrome СЃРѕСЃС‚Р°РІР°, СѓСЃР»РѕРІРёР№ Рё СЃС‚Р°С‚СѓСЃР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / buffy-sales352
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Empty В«РЎРѕСЃС‚Р°РІ РљРџВ» РІРµРґС‘С‚ РІ В«РўРѕРІР°СЂС‹В» Рё РЅРѕСЂРјР°Р»РёР·СѓРµС‚ РїСѓСЃС‚СѓСЋ В«РЎРІРѕСЏ СЃС‚СЂРѕРєР°В»; В«РЈСЃР»РѕРІРёСЏВ» РёРјРµСЋС‚ СЏРІРЅС‹Р№ В«Р”РѕР±Р°РІРёС‚СЊ СѓСЃР»РѕРІРёРµВ»; status chrome РёСЃРїРѕР»СЊР·СѓРµС‚ В«РџСЂРёРЅСЏС‚РѕВ», Р° В«РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·В» РІРёРґРёРј Рё РѕР±СЉСЏСЃРЅСЏРµС‚ disabled РґРѕ РїСЂРёРЅСЏС‚РёСЏ.
**Gates:** FE tsc PASS; proposal-create + terms Jest 36/36 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-352.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock`
**NEXT:** TZ-SALES-353; deploy РќР•.

## [2026-08-11T16:58:00Z] вЂ” TZ-SALES-351 DONE вЂ” РІРёС‚СЂРёРЅР° Create РљРџ Р±РµР· РєСЂР°РµРІС‹С… Р»РѕРІСѓС€РµРє
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / buffy-sales351
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’РёС‚СЂРёРЅР° Create РљРџ РїРѕР»СѓС‡РёР»Р° СЂСѓСЃСЃРєРёРµ empty-РїРѕРґСЃРєР°Р·РєРё РґР»СЏ РїСѓСЃС‚РѕРіРѕ РІРёРґР°/РїРѕРёСЃРєР°, СЃРѕС…СЂР°РЅРµРЅРёРµ РїРѕРёСЃРєР° РїСЂРё СЃРјРµРЅРµ chip, qty РјРёРЅРёРјСѓРј 1 СЃ РїРѕРґРґРµСЂР¶РєРѕР№ РґСЂРѕР±РЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ Рё badge В«Р’ РљРџВ» РёР· Р°РєС‚СѓР°Р»СЊРЅРѕРіРѕ `draftLines`.
**Gates:** FE tsc PASS; proposal-product-rail Jest 12/12 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; DOM self-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-351.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock`
**NEXT:** TZ-SALES-352; deploy РќР•.

## [2026-08-11T16:40:00Z] вЂ” TZ-SALES-350 DONE вЂ” Р¶СѓСЂРЅР°Р» В«Р’СЃРµ РљРџВ» Р±РµР· СЃС‚С‹РґР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / buffy-sales350
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** РЎРїРёСЃРѕРє В«Р’СЃРµ РљРџВ» РІС‹СЂРѕРІРЅРµРЅ СЃРѕ СЃС‚СѓРґРёРµР№ Create РљРџ 347: `accepted` = В«РџСЂРёРЅСЏС‚РѕВ», `converted` = В«Р’ Р·Р°РєР°Р·РµВ»; РЅРµРёР·РІРµСЃС‚РЅС‹Рµ РєРѕРґС‹ РЅРµ РїСЂРѕС‚РµРєР°СЋС‚ РІ UI РєР°Рє СЃС‹СЂРѕР№ EN. РџСѓСЃС‚РѕР№ Р¶СѓСЂРЅР°Р» РїРѕР»СѓС‡РёР» СЂСѓСЃСЃРєРѕРµ РѕР±СЉСЏСЃРЅРµРЅРёРµ Рё СЏРІРЅСѓСЋ РєРЅРѕРїРєСѓ В«РЎРѕР·РґР°С‚СЊ РљРџВ» в†’ `/proposals/create`; РїСЂРё РїСѓСЃС‚РѕРј РїРѕРёСЃРєРµ CTA РЅРµ РІРІРѕРґРёС‚ РІ Р·Р°Р±Р»СѓР¶РґРµРЅРёРµ.
**Gates:** FE tsc PASS; proposals.page Jest 21/21 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; `pnpm architecture:check` PASS; DOM self-check PASS. Root Markdown Prettier unavailable in environment.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-350.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock`
**NEXT:** TZ-SALES-351; deploy РќР•.

## [2026-08-11] вЂ” Adopt vibe org: ledger + task modes + architecture:check
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-architect
**РЎС‚Р°С‚СѓСЃ:** docs + tooling on main; product code РќР•
**Р§С‚Рѕ:** Capability ledger; AGENT-TASK-MODES (primary/secondary); `scripts/architecture-check.mjs` + baseline (7 keys); wire AI-AGENT-GUIDE/GEMINI/PROJECT-MEMORY/FIC/SECTION-READINESS/ARCHITECTURE/skill; backlog TZ-OPS-311 (sharedв†’pages BOM).
**Gates:** `pnpm architecture:check` PASS
**NEXT:** claim TZ-OPS-311 РєРѕРіРґР° СЃРІРѕР±РѕРґРµРЅ РёСЃРїРѕР»РЅРёС‚РµР»СЊ; deploy РќР•.

## [2026-08-11] вЂ” Warm deploy OK вЂ” AUTH-302 + KP РЅР° РїСЂРѕРґ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-architect-ops
**РЎС‚Р°С‚СѓСЃ:** warm deploy WIPE=false complete
**SHA:** `c8ebdeb6`
**Smoke:** LAN+prod health ok; prod index Р±РµР· inline desktop script (meta OK); admin login 200 РїРѕСЃР»Рµ Basic.
**NEXT:** idle.

## [2026-08-11] вЂ” TZ-AUTH-302 CODE DONE вЂ” CSP inline desktop URL removed
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-architect-ops
**РЎС‚Р°С‚СѓСЃ:** code DONE + archive; warm deploy Р¶РґС‘С‚ PO В«РґРµРїР»РѕР№В»
**Р§С‚Рѕ:** РЈР±СЂР°РЅ inline script РёР· `index.html`; URL СѓСЃС‚Р°РЅРѕРІС‰РёРєР° С‡РµСЂРµР· meta `kppdf-desktop-download-url`; `deploy.py` РїРёС€РµС‚ content; Helmet scriptSrc Р±РµР· unsafe-inline.
**Gates:** FE tsc; jest desktop-download-url 7/7.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-302.done.md`
**NEXT:** warm deploy РїРѕ В«РґРµРїР»РѕР№В»; РЅР° РїСЂРѕРґРµ РїСЂРѕРІРµСЂРёС‚СЊ РѕС‚СЃСѓС‚СЃС‚РІРёРµ CSP inline + РІС…РѕРґ admin.

## [2026-08-11] вЂ” TZ-OPS-310 DONE вЂ” server harden (deploy gate)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-architect-ops
**РЎС‚Р°С‚СѓСЃ:** DONE; evidence + archive + lock; deploy РќР•
**Р§С‚Рѕ:** VPN OFF в†’ SSH jump VMв†’VPS. Inventory SUID/SGID РЅР° box-946037 Рё ubuntuserver (Р±РµР· СЃРЅСЏС‚РёСЏ Р±РёС‚РѕРІ вЂ” РІСЃС‘ РїР°РєРµС‚РЅРѕРµ/allowlist). UFW VPS С‚РѕР»СЊРєРѕ 22/80/443; :4200 listen РЅРѕ СЃРЅР°СЂСѓР¶Рё Р·Р°РєСЂС‹С‚. Basic Auth 401/200. htpasswd root:www-data 640. Tunnel + LAN health 200.
**Evidence:** `docs/ops/server-harden-evidence.md`
**Archive:** `tasks/_archive/2026-08/TZ-OPS-310.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-310-server-harden.lock`
**NEXT:** warm deploy С‚РѕР»СЊРєРѕ РїРѕ PO В«РґРµРїР»РѕР№В»; РїРѕСЃР»Рµ РІС‹РєР°С‚Р° РїСЂРѕРІРµСЂРёС‚СЊ РІС…РѕРґ (AUTH-302). Wipe РќР•.

## [2026-08-11] вЂ” TZ-SALES-348 DONE вЂ” РІРёС‚СЂРёРЅР° РљРџ: В«Р’ РљРџВ», qty, РјРѕРґСѓР»Рё/РјР°С‚РµСЂРёР°Р»С‹
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-sales348
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’РёС‚СЂРёРЅР° Create РљРџ вЂ” chips РР·РґРµР»РёСЏ/РњРѕРґСѓР»Рё/РњР°С‚РµСЂРёР°Р»С‹; В«Р’ РљРџ: NВ» РёР· СЂРµР°Р»СЊРЅРѕРіРѕ СЃРѕСЃС‚Р°РІР°; РїРѕР»Рµ РєРѕР»-РІР° РЅР° РєР°СЂС‚РѕС‡РєРµ (Add & continue / В«Р•С‰С‘ +NВ»). Module/material РїРёС€СѓС‚ `lineKind` + `refId` СЃРѕ СЃРЅРёРјРєРѕРј; СЃС‚Р°СЂС‹Рµ catalog `productId` С‡РёС‚Р°СЋС‚СЃСЏ; GET populate РїРѕ РІРёРґСѓ.
**Gates:** backend tsc + quotation 40/40; frontend tsc + proposal-create/rail 41/41 + Angular development build; Prettier/ESLint/diff-check PASS; DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-348.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-348-kp-vitrine-added-badge-modules.lock`
**Commit/push:** `e23a665d` on canonical `main` and `origin/main`.
**NEXT:** idle coding в†’ VPN OFF в†’ OPS-310 в†’ warm deploy (PO); Deploy РќР•; desktop ZIP publish РќР•.

## [2026-08-11] вЂ” TZ-SALES-347 DONE вЂ” СЃС‚Р°С‚СѓСЃ, РІРµСЂСЃРёРё Рё Р·Р°РєР°Р· РёР· РљРџ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Create РљРџ РїРѕР»СѓС‡РёР» RU status badge Рё СЂР°Р·СЂРµС€С‘РЅРЅС‹Рµ РїРµСЂРµС…РѕРґС‹, РёСЃРїРѕР»СЊР·СѓСЋС‰РёР№ existing API `freeze` version viewer Р±РµР· PATCH/autosave, РєРЅРѕРїРєСѓ В«РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·В» РґР»СЏ РїСЂРёРЅСЏС‚РѕРіРѕ РљРџ СЃ РїРµСЂРµС…РѕРґРѕРј РІ `/orders/:id` Рё В«РљРѕРїРёСЂРѕРІР°С‚СЊ РљРџВ» С‡РµСЂРµР· duplicate.
**Gates:** frontend tsc + proposal-create/terms 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS; DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-347.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-347-kp-status-versions-in-studio.lock`
**Commit/push:** pending closeout commit.
**NEXT:** TZ-SALES-348; Deploy РќР•; desktop ZIP publish РќР•.

## [2026-08-11] вЂ” TZ-SALES-346 DONE вЂ” РјРЅРѕРіРѕСЃС‚СЂР°РЅРёС‡РЅС‹Р№ Р»РёСЃС‚ РљРџ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ `Quotation.sheetLayout` СЃ Р»РёРјРёС‚Р°РјРё СЃС‚СЂРѕРє, СЂР°Р·РјРµСЂРѕРј/РѕР±СЂРµР·РєРѕР№ С„РѕС‚Рѕ Рё РїРµСЂРµРєР»СЋС‡Р°С‚РµР»РµРј photo column. Backend build СЂРµР¶РµС‚ РґР»РёРЅРЅС‹Р№ СЃРѕСЃС‚Р°РІ РЅР° СЃС‚СЂР°РЅРёС†С‹, РїРѕРІС‚РѕСЂСЏРµС‚ С€Р°РїРєСѓ С‚Р°Р±Р»РёС†С‹ Рё С„РѕРЅ, РІС‹РІРѕРґРёС‚ РёС‚РѕРіРё/СѓСЃР»РѕРІРёСЏ С‚РѕР»СЊРєРѕ РЅР° РїРѕСЃР»РµРґРЅРµР№ СЃС‚СЂР°РЅРёС†Рµ Рё РґРѕР±Р°РІР»СЏРµС‚ РЅСѓРјРµСЂР°С†РёСЋ РїСЂРё `pageNumbering`.
**Preview:** Р¦РµРЅС‚СЂ Create РљРџ РїРѕРєР°Р·С‹РІР°РµС‚ РІРµСЂС‚РёРєР°Р»СЊРЅС‹Р№ СЃС‚РµРє A4 iframe-Р»РёСЃС‚РѕРІ Рё В«РЎС‚СЂР°РЅРёС†Р° 1 РёР· NВ»; РѕРґРЅРѕС€РёС‚РЅС‹Р№ СЂРµР¶РёРј Рё frozen shell 317 СЃРѕС…СЂР°РЅРµРЅС‹.
**Gates:** backend tsc + document-template/table-template/quotation 102/102; frontend tsc + proposal-create 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS (ESLint 0 errors, 3 existing any warnings); DOM/component self-check PASS; authenticated browser/data smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-346.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-346-kp-multipage-sheet-layout.lock`
**Commit/push:** `ad476607` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-347 в†’ 348; Deploy РќР•; desktop ZIP publish РќР•.

## [2026-08-11] вЂ” TZ-SALES-342 DONE вЂ” СЃРІРѕРё СЃС‚СЂРѕРєРё РљРџ Рё line-level commerce
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’ В«РЎРѕСЃС‚Р°РІ РљРџВ» РґРѕР±Р°РІР»РµРЅР° В«РЎРІРѕСЏ СЃС‚СЂРѕРєР°В» Р±РµР· СЃРѕР·РґР°РЅРёСЏ РєР°СЂС‚РѕС‡РєРё РєР°С‚Р°Р»РѕРіР°. РџРѕР·РёС†РёРё РїРѕР»СѓС‡РёР»Рё РЅР°Р·РІР°РЅРёРµ/РѕРїРёСЃР°РЅРёРµ, РµРґ. РёР·Рј., СЃРєРёРґРєСѓ %, Рё С„Р»Р°Рі В«РќРµ РІС…РѕРґРёС‚ РІ СЃС‚РѕРёРјРѕСЃС‚СЊВ»; custom/catalog discriminator СЃРѕС…СЂР°РЅСЏРµС‚ СЃС‚Р°СЂС‹Рµ РљРџ.
**Persistence/render:** Backend СЃС‡РёС‚Р°РµС‚ `quantity Г— unitPrice Г— (1 в€’ discountPercent/100)`, optional lines РЅРµ РІС…РѕРґСЏС‚ РІ РґРѕРєСѓРјРµРЅС‚РЅС‹Р№ РёС‚РѕРі, РЅРѕ РѕСЃС‚Р°СЋС‚СЃСЏ РЅР° Р»РёСЃС‚Рµ СЃ РѕС‚РґРµР»СЊРЅС‹Рј В«Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ (РЅРµ РІС…РѕРґРёС‚ РІ СЃС‚РѕРёРјРѕСЃС‚СЊ)В». Build Рё PDF РїРѕР»СѓС‡Р°СЋС‚ РѕРїРёСЃР°РЅРёРµ, СЃРєРёРґРєСѓ Рё optional marker.
**Gates:** backend tsc + quotation/generated-document 48/48; frontend tsc + proposal-create/terms 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS. DOM/component self-check PASS; authenticated browser data smoke unavailable Р±РµР· backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-342.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-342-kp-custom-lines.lock`
**Commit/push:** `2736d28e` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-346 в†’ 347 в†’ 348; Deploy РќР•; desktop ZIP publish РќР•.


## [2026-08-11] вЂ” TZ-SALES-344 DONE вЂ” РљРџ СѓСЃР»РѕРІРёСЏ, Р±РёР±Р»РёРѕС‚РµРєР° Рё РїРµСЂРµРјРµРЅРЅС‹Рµ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’ РїСЂР°РІРѕРј СЂРµР№Р»Рµ СЃС‚СѓРґРёРё РґРѕР±Р°РІР»РµРЅР° СЂСѓСЃСЃРєР°СЏ РїР°РЅРµР»СЊ В«РЈСЃР»РѕРІРёСЏВ»: СЃС‚СЂРѕРєРё СѓСЃР»РѕРІРёР№ СЃ multiline-СЂРµРґР°РєС‚РѕСЂРѕРј, в†‘/в†“, СѓРґР°Р»РµРЅРёРµРј, Р±РёР±Р»РёРѕС‚РµРєРѕР№ TextBlock РїРѕ Р°РєС‚РёРІРЅС‹Рј РєР°С‚РµРіРѕСЂРёСЏРј Рё РІСЃС‚Р°РІРєРѕР№ РїРµСЂРµРјРµРЅРЅС‹С… РІ РїРѕР·РёС†РёСЋ РєСѓСЂСЃРѕСЂР°. Shell 317/A4 geometry РЅРµ РёР·РјРµРЅСЏР»РёСЃСЊ.
**Persistence/render:** `Quotation.terms` СЃРѕС…СЂР°РЅСЏРµС‚СЃСЏ Рё РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ РїРѕСЃР»Рµ F5; build РїРѕР»СѓС‡Р°РµС‚ terms, РЅРѕРјРµСЂ/РґР°С‚Сѓ/РёС‚РѕРі Рё РїРµС‡Р°С‚Р°РµС‚ РёР·РІРµСЃС‚РЅС‹Рµ РїРµСЂРµРјРµРЅРЅС‹Рµ РІ Р±Р»РѕРє СѓСЃР»РѕРІРёР№ РёР»Рё fallback-СЃРµРєС†РёСЋ. РќРµРёР·РІРµСЃС‚РЅС‹Рµ С‚РѕРєРµРЅС‹ РѕСЃС‚Р°СЋС‚СЃСЏ Р»РёС‚РµСЂР°Р»РѕРј; PDF rebuild payload РІРєР»СЋС‡Р°РµС‚ terms.
**Gates:** backend tsc + document-template/quotation 96/96; frontend tsc + proposal-create/terms 32/32; Angular development build; ESLint/Prettier/diff-check PASS. DOM/component self-check PASS; authenticated browser data smoke unavailable Р±РµР· backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-344.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-344-kp-terms-panel.lock`
**Commit/push:** `36601821` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•; desktop ZIP publish РќР•.


## [2026-08-11] вЂ” TZ-SALES-343 DONE вЂ” РљРџ РїРѕР»СѓС‡Р°С‚РµР»СЊ, РєРѕРЅС‚Р°РєС‚ Рё РѕР±СЉРµРєС‚
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ Р»РµРІС‹Р№ overlay В«РџРѕР»СѓС‡Р°С‚РµР»СЊВ» Р±РµР· РёР·РјРµРЅРµРЅРёСЏ frozen A4 geometry: Р°РєС‚РёРІРЅС‹Рµ Counterparty СЃ РїРѕРёСЃРєРѕРј, РєР°СЂС‚РѕС‡РєР° СЂРµРєРІРёР·РёС‚РѕРІ, РЅР°Р·РЅР°С‡РµРЅРЅС‹Р№ Person, Site РѕР±СЉРµРєС‚/Р°РґСЂРµСЃ Рё quick-create РєР»РёРµРЅС‚Р°. В«РџР°СЂР°РјРµС‚СЂС‹В» РѕСЃС‚Р°РІР»СЏРµС‚ РѕРґРЅСѓ summary-СЃС‚СЂРѕРєСѓ СЃ В«РР·РјРµРЅРёС‚СЊВ» РІ С‚РѕС‚ Р¶Рµ overlay.
**Persistence/build:** Quotation С…СЂР°РЅРёС‚ Рё populate-РёС‚ `contactPersonId`/`siteId`; autosave/F5 РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°СЋС‚ refs; build РїРѕР»СѓС‡Р°РµС‚ buyer/contact/site ids Рё РґРѕР±Р°РІР»СЏРµС‚ `contactName`, `contactPosition`, `siteName`, `siteAddress` Рє `counterparty` source.
**Gates:** backend tsc + quotation 35/35; frontend tsc + proposal-create 28/28; Angular development build; ESLint/Prettier/diff-check PASS. DOM/test self-check PASS; authenticated browser data smoke unavailable Р±РµР· backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-343.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-343-kp-recipient-panel.lock`
**Commit/push:** `5299db91` on canonical `main` and `origin/main`.
**NEXT:** TZ-SALES-344 в†’ 342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•; desktop ZIP publish РќР•.


## [2026-08-11] вЂ” TZ-SALES-345 DONE вЂ” РљРџ PDF, РџРµС‡Р°С‚СЊ and archive
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅС‹ `POST /quotations/:id/pdf` РёР· СЃРѕС…СЂР°РЅС‘РЅРЅРѕРіРѕ/build HTML СЃ `puppeteer-core`, RU 503 fallback РїСЂРё РѕС‚СЃСѓС‚СЃС‚РІРёРё Chrome, final archive `GeneratedDocument`, РµРґРёРЅРѕРµ РјРµРЅСЋ В«РЎРєР°С‡Р°С‚СЊ в–ѕВ» РІ СЃС‚СѓРґРёРё Рё PDF/РџРµС‡Р°С‚СЊ РІ В«Р’СЃРµ РљРџВ». РџРµС‡Р°С‚СЊ РёСЃРїРѕР»СЊР·СѓРµС‚ С‚РµРєСѓС‰РёР№ A4 iframe; РїРѕРІС‚РѕСЂРЅС‹Р№ Р°СЂС…РёРІ СЃРѕР·РґР°С‘С‚ РЅРѕРІСѓСЋ Р·Р°РїРёСЃСЊ.
**Gates:** backend tsc + quotation/generated-document 31/31 focused Рё 13/13 generated-document; frontend tsc + proposal-create 27/27 + proposals 20/20 + development build; ESLint/Prettier/diff-check PASS. DOM self-check PASS; real browser/PDF smoke unavailable without Chrome/backend data stack, 503 path tested.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-345.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-345-kp-pdf-print-archive.lock`
**Scope:** frozen shell 317, recipient/terms/custom lines/multipage/status/versions/vitrine, deploy, ZIP publish and foreign WIP untouched.
**NEXT:** TZ-SALES-343 в†’ 344 в†’ 342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•.

## [2026-08-10T23:50:00Z] вЂ” TZ-SALES-341 DONE вЂ” РљРџ commercial fields and VAT persistence
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’ В«РџР°СЂР°РјРµС‚СЂС‹В» РґРѕР±Р°РІР»РµРЅС‹ СЃРµРєС†РёРё В«Р”РѕРєСѓРјРµРЅС‚В», В«Р”РµРЅСЊРіРёВ» Рё В«РЎСЂРѕРєРёВ»; РЅРѕРјРµСЂ/РЅР°Р·РІР°РЅРёРµ/РґР°С‚С‹, РќР”РЎ, СЃРєРёРґРєР° %/в‚Ѕ, РїСЂРµРґРѕРїР»Р°С‚Р° Рё СЃСЂРѕРєРё РёРґСѓС‚ РІ autosave Рё РіРёРґСЂР°С‚РёСЂСѓСЋС‚СЃСЏ РїРѕСЃР»Рµ F5. Backend С…СЂР°РЅРёС‚ РЅРѕРІС‹Рµ РїРѕР»СЏ Рё РїРµСЂРµСЃС‡РёС‚С‹РІР°РµС‚ РёС‚РѕРі РєР°Рє РЅР°С†РµРЅРєР° в†’ СЃРєРёРґРєР°; A4 footer РїРѕР»СѓС‡Р°РµС‚ С‚РѕС‚ Р¶Рµ dealTotals Р±РµР· РєРѕР»РѕРЅРєРё СЃРєРёРґРєРё.
**Gates:** frontend tsc + proposal-create 26/26 PASS; backend tsc + quotation 32/32 PASS; ESLint/Prettier/diff-check PASS; Angular DOM self-check PASS. Live authenticated browser smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-341.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-341-kp-commercial-fields.lock`
**Scope:** shell 317, catalog, shared table presets, PDF/print and foreign WIP untouched.
**NEXT:** TZ-SALES-345 в†’ 343 в†’ 344 в†’ 342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•.

## [2026-08-10T23:25:00Z] вЂ” TZ-SALES-340 DONE вЂ” РљРџ composition panel
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; fullstack gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** Р’ СЃС‚СѓРґРёРё `/proposals/create` РґРѕР±Р°РІР»РµРЅ РІР·Р°РёРјРѕРёСЃРєР»СЋС‡Р°СЋС‰РёР№ overlay В«РЎРѕСЃС‚Р°РІ РљРџВ»: РїРѕР·РёС†РёРё СЃ С„РѕС‚Рѕ/Р°СЂС‚РёРєСѓР»РѕРј, quantity в€’/+, С†РµРЅР°, РµРґ. РёР·Рј., СЃСѓРјРјР°, РґСѓР±Р»РёСЂРѕРІР°РЅРёРµ, СѓРґР°Р»РµРЅРёРµ Рё РїРѕСЂСЏРґРѕРє. РџРѕРІС‚РѕСЂРЅРѕРµ РґРѕР±Р°РІР»РµРЅРёРµ РёР·РґРµР»РёСЏ СѓРІРµР»РёС‡РёРІР°РµС‚ РєРѕР»РёС‡РµСЃС‚РІРѕ; РёР·РјРµРЅРµРЅРёСЏ РёРґСѓС‚ С‡РµСЂРµР· СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ build/autosave РїСѓС‚СЊ.
**Gates:** frontend tsc PASS; proposal-create 25/25 PASS; backend tsc PASS; ESLint/Prettier/diff-check PASS; Angular DOM self-check PASS. Live authenticated browser smoke unavailable without backend data stack.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-340.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-340-kp-composition-panel.lock`
**Scope:** shell 317, shared TableTemplate, catalog prices, PDF/print and foreign WIP untouched.
**NEXT:** TZ-SALES-341 в†’ 345 в†’ 343 в†’ 344 в†’ 342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•.

## [2026-08-10T23:05:00Z] вЂ” TZ-AUTH-301 DONE вЂ” login personal-project notice
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-d2515d7a53
**РЎС‚Р°С‚СѓСЃ:** DONE; frontend gates, archive and lock complete; deploy РќР•
**Р§С‚Рѕ:** РќР° `/login` РґРѕР±Р°РІР»РµРЅ СЂСѓСЃСЃРєРѕСЏР·С‹С‡РЅС‹Р№ РјСЏРіРєРёР№ notice В«Р›РёС‡РЅС‹Р№ РїСЂРѕРµРєС‚ РґР»СЏ РѕР±СѓС‡РµРЅРёСЏ Рё С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏВ» СЃ РєР°РЅРѕРЅ-С‚РµРєСЃС‚РѕРј, Р±РµР· Р·Р°РїСЂРµС‰С‘РЅРЅРѕР№ copy. `index.html` РїРѕР»СѓС‡РёР» РјСЏРіРєРѕРµ description Рё `robots noindex, nofollow`; РґРѕРєСѓРјРµРЅС‚Р°С†РёСЏ СЏРІРЅРѕ РѕС‚РґРµР»СЏРµС‚ notice РѕС‚ РєРѕРЅС‚СЂРѕР»СЏ РґРѕСЃС‚СѓРїР°.
**Gates:** frontend app tsc PASS; `pnpm test -- login.page --runInBand` 4/4 PASS; `git diff --check` PASS. `verify-status.sh` РёРјРµРµС‚ 72 pre-existing historical FWD mismatches, РЅРµ РѕС‚РЅРѕСЃСЏС‰РёС…СЃСЏ Рє AUTH-301.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-301.done.md`
**Lock:** `.mimocode/locks/TZ-AUTH-301-personal-project-notice.lock`
**Scope:** auth API/guards, backend, nginx/VPS, deploy Рё foreign WIP РЅРµ Р·Р°С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** TZ-SALES-340 в†’ 341 в†’ 345 в†’ 343 в†’ 344 в†’ 342 в†’ 346 в†’ 347 в†’ 348; Deploy РќР•.

## [2026-08-10T19:01:12Z] вЂ” TZD-38 DONE вЂ” hierarchical specification в†’ BOM composition HITL
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical-main
**РЎС‚Р°С‚СѓСЃ:** DONE; archive/lock/closeout complete; Deploy РќР•; desktop ZIP publish РќР•
**Р§С‚Рѕ:** Desktop Import Studio СЂР°СЃРїРѕР·РЅР°С‘С‚ `level/parentArticle/article/name/qty/unit/kind`, СЃС‚СЂРѕРёС‚ РґРµСЂРµРІРѕ РёР·РґРµР»РёРµ в†’ РјРѕРґСѓР»СЊ в†’ РјР°С‚РµСЂРёР°Р»С‹, Р±Р»РѕРєРёСЂСѓРµС‚ qtyв‰¤0, missing parent, duplicate article/link Рё invalid root/type. РЇРІРЅРѕРµ HITL-РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ СЃРѕР·РґР°С‘С‚ РЅРµРґРѕСЃС‚Р°СЋС‰РёРµ Product/Module/Material Рё РІС‹Р·С‹РІР°РµС‚ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ Product/Module composition REST endpoints; flat TZD-37 path РЅРµ РёР·РјРµРЅС‘РЅ. MCP РїРѕР»СѓС‡РёР» draft-only module/composition tools Рё `userOk:true` confirm gate. TZD-35 PARK Р·Р°РєСЂС‹С‚ СЌС‚РёРј TZ.
**Gates:** desktop typecheck PASS; svelte-check 0/0 PASS; desktop build PASS; specification parser 4/4 PASS; MCP typecheck + 93/93 tests PASS; diff-check PASS. Native Tauri/live catalog smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-38.done.md`
**Lock:** `.mimocode/locks/TZD-38-spec-bom-composition-import.lock`
**Scope:** `desktop/mcp-runtime/**`, orders/quotes bulk, EAV, deploy, ZIP publish, and foreign dirty WIP untouched. Deploy РќР•
**РС‚РѕРі:** WAVE-EXCEL-IMPORT-STUDIO TZD-36в†’38 DONE; РіРѕС‚РѕРІРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ desktop publish РѕС‚РґРµР»СЊРЅРѕ, РЅРѕ publish РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ.

## [2026-08-10T18:52:06Z] вЂ” TZD-37 DONE вЂ” Excel mapping profiles + validation HITL
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical-main
**РЎС‚Р°С‚СѓСЃ:** DONE; desktop/backend gates, archive/lock/closeout complete; Deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅС‹ multi-sheet РІС‹Р±РѕСЂ, РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Р№ mapping HITL СЃ РєСЂР°СЃРЅС‹РјРё unfit/conflict Рё ignore, canonical reshape, row statuses `ok_new/ok_update/skip/conflict/error`, journal-only proposal confirmation, MCP classify suggestion Рё org-scoped `import_mapping_profiles` CRUD СЃ РµРґРёРЅСЃС‚РІРµРЅРЅС‹Рј в… default.
**Gates:** desktop typecheck + svelte-check 0/0 + build PASS; MCP typecheck + 91/91 tests PASS; backend tsc PASS; mapping profile service 6/6 PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-37.done.md`
**Lock:** `.mimocode/locks/TZD-37-excel-validation-hitl-studio.lock`
**Scope:** `desktop/mcp-runtime/**`, deploy, ZIP publish, commercial MCP, BOM composition and foreign dirty WIP untouched. Deploy РќР•
**NEXT:** claim TZD-38 strictly after conflict scan.

## [2026-08-10T18:43:36Z] вЂ” TZD-36 DONE вЂ” Desktop Import Studio shell
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical-main
**РЎС‚Р°С‚СѓСЃ:** DONE; desktop typecheck, Svelte check, build, MCP tests, archive/lock complete; Deploy РќР•
**Р§С‚Рѕ:** Desktop РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РЅР° РІРєР»Р°РґРєРµ В«РРјРїРѕСЂС‚ ExcelВ» СЃ РѕС‚РґРµР»СЊРЅРѕР№ РІРєР»Р°РґРєРѕР№ В«MCPВ», connected-user chip, Р±РѕР»СЊС€РѕР№ dropzone/preview table Рё РІС‚РѕСЂРёС‡РЅС‹Рј Inbox. Pairing/MCP host controls СЃРѕС…СЂР°РЅРµРЅС‹ РІРЅСѓС‚СЂРё MCP; РѕРєРЅРѕ Tauri СѓРІРµР»РёС‡РµРЅРѕ РґРѕ `1280Г—800` (`1080Г—720` minimum). README/INSTALL РѕР±РЅРѕРІР»РµРЅС‹; TZD-37 mapping/multi-sheet Рё TZD-38 BOM hierarchy РѕСЃС‚Р°СЋС‚СЃСЏ РѕС‚РґРµР»СЊРЅС‹РјРё.
**Gates:** desktop typecheck PASS; svelte-check 0 errors / 0 warnings PASS; desktop build PASS; MCP typecheck + 91/91 tests PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
**Archive:** `tasks/_archive/2026-08/TZD-36.done.md`
**Lock:** `.mimocode/locks/TZD-36-desktop-import-studio-shell.lock`
**Scope:** `desktop/mcp/**`, `desktop/mcp-runtime/**`, deploy, ZIP publish, WAVE-MCP-GAP implementation, and foreign dirty WIP untouched.
**NEXT:** claim TZD-37 strictly after conflict scan. Deploy РќР•

## [2026-08-10T22:10:00Z] вЂ” TZD-34 DONE вЂ” WAVE-MCP-GAP CLOSED (31в†’34)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** WAVE DONE; 4/4 TZ РІ archive + locks; `_active/` РїСѓСЃС‚; deploy РќР• (РіРѕС‚РѕРІРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ РґРµРїР»РѕР№)
**Р§С‚Рѕ:** NEW `stock-tools.ts`: `kppdf_list_stock_movements` (GET /api/stock-movements, С„РёР»СЊС‚СЂС‹) + `kppdf_stock_movement_create` (POST /api/stock-movements вЂ” РїСЂРёС…РѕРґ/СЂР°СЃС…РѕРґ/РїРµСЂРµРІРѕРґ/РєРѕСЂСЂРµРєС‚РёСЂРѕРІРєР°; SoT СЃСЂР°Р·Сѓ, Р±РµР· journal). Р’Р°Р»РёРґР°С†РёСЏ РґРѕ POST: СЂРѕРІРЅРѕ РѕРґРёРЅ РёР· materialId|productId; transfer С‚СЂРµР±СѓРµС‚ toWarehouseId в†’ toolFail, 0 Р·Р°РїСЂРѕСЃРѕРІ. Body РёР· whitelist CreateStockMovementDto. Register РІ tools.ts; registry toolCount 68 в†’ 70. MCP.md: В«СЃРєР»Р°Рґ С‡РµСЂРµР· stock-movements, РЅРµ storage-items POSTВ».
**Gates:** desktop/mcp test 91/91 PASS; mcp tsc PASS; live healthz toolCount 70 PASS.
**РђСЂС…РёРІС‹:** TZD-31/32/33/34 `.done.md` РІ `tasks/_archive/2026-08/`; locks TZD-31вЂ¦34.
**РС‚РѕРі РІРѕР»РЅС‹:** healthz toolCount = source registry (70); material propose СЃ С†РµРЅРѕР№ в†’ SoT; MCP draft РљРџ/Р·Р°РєР°Р· + gated ship/convert; stock-movement create.
**Checkpoint:** WAVE-MCP-GAP DONE В· NEXT idle В· РіРѕС‚РѕРІРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ РґРµРїР»РѕР№ В· Deploy РќР•

## [2026-08-10T21:40:00Z] вЂ” TZD-33 DONE: commercial MCP HITL (WAVE-MCP-GAP #3)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; MCP read + draft write РґР»СЏ РљРџ/Р·Р°РєР°Р·/РєР»РёРµРЅС‚; userOk-РіРµР№С‚С‹; deploy РќР•
**Р§С‚Рѕ:** NEW `commercial-tools.ts` (17 tools): 9 read (counterparties/persons/sites/quotations/orders/contracts, slim Р±РµР· HTML snapshot), 4 draft write (counterparty_create вЂ” SoT СЃСЂР°Р·Сѓ, site_create, quotation/order_create_draft вЂ” РџР РРќРЈР”РРўР•Р›Р¬РќРћ status draft), 4 gated (quotation_set_status draft|sent|accepted|rejected, convert_to_order/contract, order_ship) вЂ” С‚РѕР»СЊРєРѕ СЃ `userOk:true`, РёРЅР°С‡Рµ toolFail Рё 0 backend call. РџРѕР»СЏ СЃРІРµСЂРµРЅС‹ СЃ СЂРµР°Р»СЊРЅС‹РјРё DTO (QuotationItemDto, OrderItemDto unitPrice optional, CreateCounterpartyDto inn/roles). Register РІ tools.ts; registry toolCount 51 в†’ 68.
**Gates:** desktop/mcp test 86/86 PASS; mcp tsc PASS; live healthz toolCount 68 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-33.done.md`
**Lock:** `.mimocode/locks/TZD-33-commercial-mcp-hitl.lock`
**Checkpoint:** NEXT = claim TZD-34. Deploy РќР•

## [2026-08-10T21:00:00Z] вЂ” TZD-32 DONE: material propose fields (WAVE-MCP-GAP #2)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; propose create price/kind/description/dimensions в†’ SoT; deploy РќР•
**Р§С‚Рѕ:** `ProposeMaterialCreateDto` СЂР°СЃС€РёСЂРµРЅ whitelist-РїРѕР»СЏРјРё `pricePerUnit` (в‰Ґ0), `materialKind` (MATERIAL_KINDS), `description` (в‰¤2000), `dimensions` (`DimensionDto` РїРµСЂРµРёСЃРїРѕР»СЊР·РѕРІР°РЅ). proposeв†’confirm РїРµСЂРµРґР°С‘С‚ РїРѕР»СЏ РІ `MaterialService.create` Р±РµР· РїРѕС‚РµСЂСЊ; batch items вЂ” С‚Рµ Р¶Рµ РїРѕР»СЏ. MCP zod (`materialCreateInput`/`batchItemSchema`) Р·РµСЂРєР°Р»РёС‚ DTO + `buildMaterialCreateProposal` (default unit `С€С‚`); MCP.md write-С‚Р°Р±Р»РёС†Р° РѕР±РЅРѕРІР»РµРЅР°. Invalid kind/С†РµРЅР°/СЂР°Р·РјРµСЂ в†’ 400/zod reject, 0 SoT; regression Р±РµР· РЅРѕРІС‹С… РїРѕР»РµР№ PASS.
**Gates:** BE tsc PASS; mutation-journal Jest 20/20 PASS; desktop/mcp test 79/79 PASS; mcp tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-32.done.md`
**Lock:** `.mimocode/locks/TZD-32-material-propose-fields.lock`
**Checkpoint:** NEXT = claim TZD-33. Deploy РќР•

## [2026-08-10T20:30:00Z] вЂ” TZD-31 DONE: MCP runtime sync (WAVE-MCP-GAP #1)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; live /healthz toolCount 51 в‰Ґ 40; deploy РќР•
**Р§С‚Рѕ:** Р РµРµСЃС‚СЂ РёРјС‘РЅ tools РІ `desktop/mcp` (РµРґРёРЅС‹Р№ РёСЃС‚РѕС‡РЅРёРє РёР· `*_TOOL_NAMES` + `kppdf_ping`, Р±РµР· СЂСѓС‡РЅРѕРіРѕ РґСѓР±Р»РёСЂРѕРІР°РЅРёСЏ); `/healthz` РѕС‚РґР°С‘С‚ `ok/port/toolCount/packageVersion/hostDir/toolsSample` (sample РІРєР»СЋС‡Р°РµС‚ `kppdf_list_categories` + `kppdf_propose_product_create`); СЃС‚Р°СЂС‚РѕРІС‹Р№ Р»РѕРі РїРµС‡Р°С‚Р°РµС‚ hostDir + toolCount. Desktop host: `KPPDF_MCP_HOST_DIR` (import.meta.env `KPPDF_` / process.env) РёРјРµРµС‚ РїСЂРёРѕСЂРёС‚РµС‚ РЅР°Рґ resourceDir walk; `package.json name в‰  @kppdf/desktop-mcp` в†’ РїРѕРЅСЏС‚РЅР°СЏ RU РѕС€РёР±РєР°, РїСЂРѕС†РµСЃСЃ РЅРµ СЃРїР°РІРЅРёС‚СЃСЏ. Docs MCP.md/INSTALL.md: РїРѕСЃР»Рµ `git pull` в†’ Restart MCP в†’ РїСЂРѕРІРµСЂРєР° healthz в†’ Cursor Reload MCP.
**Gates:** desktop/mcp `pnpm test` 74/74 PASS (РЅРѕРІС‹Рµ suites registry + healthz payload); mcp `tsc --noEmit` PASS; desktop zone `pnpm typecheck` PASS (mcpHost.ts).
**Smoke:** `GET /healthz` в†’ `toolCount: 51`, `packageVersion: 0.1.0`, abs hostDir, startup log `tools 51 registered`.
**Archive:** `tasks/_archive/2026-08/TZD-31.done.md`
**Lock:** `.mimocode/locks/TZD-31-mcp-runtime-sync.lock`
**Checkpoint:** `_active/` РїСѓСЃС‚ РґР»СЏ 31; NEXT = claim TZD-32. Deploy РќР•

## [2026-08-10T18:03:51.7524650Z] вЂ” TZ-UX-DIALOG-307 DONE: save & continue hotkey
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE gates + archive/lock/closeout complete; deploy РќР•
**Р§С‚Рѕ:** Product/Module/Material/Color reference Рё QuickCreate РїРѕР»СѓС‡РёР»Рё РѕР±С‰РёР№ Ctrl+Enter/вЊ+Enter save-and-continue pattern. Create СЃР±СЂР°СЃС‹РІР°РµС‚ default values Рё С„РѕРєСѓСЃРёСЂСѓРµС‚ РїРµСЂРІРѕРµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕРµ РїРѕР»Рµ; edit РѕСЃС‚Р°С‘С‚СЃСЏ РѕС‚РєСЂС‹С‚; РѕР±С‹С‡РЅС‹Р№ Save/Create close behavior СЃРѕС…СЂР°РЅС‘РЅ. Р”РѕР±Р°РІР»РµРЅС‹ RU footer hints, helper tests Рё РѕР±РЅРѕРІР»РµРЅС‹ `ui-add-and-continue.md` / `DIALOG-COOKBOOK.md`.
**Gates:** frontend tsc PASS; focused Jest 6 suites / 92 tests PASS; changed-file ESLint PASS; Prettier PASS; FE build PASS; `git diff --check` PASS СЃ CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-307.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-307-save-and-continue-hotkey.lock`
**NEXT:** land DICT wave into canonical `D:\\kppdf-8.0` main. Deploy РќР•

## [2026-08-10T17:54:56.7912096Z] вЂ” TZ-UX-DIALOG-306 DONE: composition quantity
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE gates + archive/lock/closeout complete; deploy РќР•
**Р§С‚Рѕ:** Picker РїРѕР»СѓС‡РёР» РїРѕР»Рµ В«РљРѕР»-РІРѕВ» СЃ РјРёРЅРёРјСѓРјРѕРј `0,001` Рё default `1`; quantity С‚РµРїРµСЂСЊ РІС…РѕРґРёС‚ РІ result/session feedback. BOM РїРµСЂРµРґР°С‘С‚ quantity РІ POST РІРјРµСЃС‚Рѕ hardcoded `1`; Add & continue СЃР±СЂР°СЃС‹РІР°РµС‚ quantity РІ `1`. Canonical `ui-add-and-continue.md` Рё focused specs РѕР±РЅРѕРІР»РµРЅС‹.
**Gates:** frontend tsc PASS; focused Jest 2 suites / 22 tests PASS; changed-file ESLint PASS; Prettier PASS; `git diff --check` PASS СЃ CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-306.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-306-composition-picker-qty.lock`
**NEXT:** claim TZ-UX-DIALOG-307 strictly. Deploy РќР•

## [2026-08-10T17:51:30.8247358Z] вЂ” TZ-DICT-320 DONE: kind labels FE wire + nav
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE gates + archive/lock/closeout complete; deploy РќР•
**Р§С‚Рѕ:** Shared `PiDictionaryLabelsService` now loads/caches active product/material labels with one RU fallback warning; `/dictionaries/kind-labels` supports admin/manager rename/active PATCH. Product/material FullEditors, QuickCreate, catalog filters/rails, detail, BOM and composition picker use the same service; stable keys remain unchanged.
**Gates:** frontend tsc PASS; focused Jest 6 suites / 103/103; ESLint PASS; new-file Prettier PASS; FE build PASS; diff-check PASS with CRLF warnings only.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-320.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-320-kind-labels-fe-nav.lock`
**NEXT:** claim TZ-UX-DIALOG-306 strictly. Deploy РќР•

## [2026-08-10T17:37:39.9429139Z] вЂ” TZ-DICT-319 DONE: kind labels backend
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; backend gates + archive/lock/closeout complete; deploy РќР•
**Р§С‚Рѕ:** Added idempotent global RU seeds for product/material kind labels, organization-plus-global read/active endpoints, admin/manager rename/order/active patch with immutable keys, and unique `(organizationId, scope, key)` identity with RU duplicate handling. FE dropdown/nav wire remains TZ-DICT-320.
**Gates:** backend tsc PASS; dictionary-label Jest 2 suites / 9 tests PASS; ESLint PASS with one non-blocking test-helper warning; diff-check PASS; backend Prettier unavailable because no formatter dependency is declared.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-319.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-319-kind-labels-dictionary-be.lock`
**NEXT:** claim TZ-DICT-320 strictly. Deploy РќР•

## [2026-08-10T17:32:05.3769468Z] вЂ” TZ-CATALOG-338 DONE: article identity contract
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; BE/FE gates, archive, lock, and closeout metadata complete; deploy РќР•
**Р§С‚Рѕ:** Product `sku` СЃС‚Р°Р» РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рј Р°СЂС‚РёРєСѓР»РѕРј, Product.name вЂ” optional СЃ SKU fallback; Module/Material `article` РѕР±СЏР·Р°С‚РµР»СЊРЅС‹ Рё СѓРЅРёРєР°Р»СЊРЅС‹ РІ РѕСЂРіР°РЅРёР·Р°С†РёРё; E11000 РїРµСЂРµРІРѕРґРёС‚СЃСЏ РІ RU 409 В«РђСЂС‚РёРєСѓР» СѓР¶Рµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏВ». QuickCreate, FullEditor, LockedRequired profiles, DTO/schema/service tests and page docs aligned. Material clone receives an `-COPY` article suffix.
**Gates:** backend tsc PASS; backend focused Jest 63/63; frontend tsc PASS; focused FE Jest 95/95; FE build PASS; ESLint PASS with legacy warnings; diff-check PASS; Prettier CRLF/style baseline documented.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-338.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-338-article-required-unique.lock`
**Known limit:** legacy rows without article remain readable and need migration/backfill before schema-validating edits; no cross-entity uniqueness.
**NEXT:** claim TZ-DICT-319 strictly. Deploy РќР•

## [2026-08-10T16:52:42.9338327Z] вЂ” TZ-MATERIALS-312 DONE: supplier states + half-width dimensions
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE gates + focused Jest 43/43 + archive/lock; deploy РќР•
**Р§С‚Рѕ:** Material supplier lookup РѕСЃС‚Р°С‘С‚СЃСЏ РЅР° Organization `type=supplier`; РїСѓСЃС‚РѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РїРѕРєР°Р·С‹РІР°РµС‚ RU hint Рё `/organizations`, РѕС€РёР±РєР° РІРёРґРЅР° РїРѕРґ РїРѕР»РµРј, loading РѕС‚РєР»СЋС‡Р°РµС‚ selector. В«Р“Р°Р±Р°СЂРёС‚С‹В» РѕРіСЂР°РЅРёС‡РµРЅС‹ `w-full lg:w-1/2 max-w-xl`; contract/isImmutable РЅРµ РјРµРЅСЏР»РёСЃСЊ.
**Gates:** frontend tsc PASS; material-form Jest 43/43 PASS; ESLint PASS; `git diff --check` PASS; Prettier baseline CRLF mismatch documented.
**Archive:** `tasks/_archive/2026-08/TZ-MATERIALS-312.done.md`
**Lock:** `.mimocode/locks/TZ-MATERIALS-312-supplier-empty-dims-half.lock`
**NEXT:** claim TZ-CATALOG-338 strictly. Deploy РќР•

 freebuff/kppdf-8-0-wave-mcp-gap-d933f405-1386-42a7-acf9-965bef47b771

## [2026-08-09T20:10:00Z] вЂ” Warm deploy OK + deploy docs for agents
**РЎС‚Р°С‚СѓСЃ:** prod `https://kppdf-crm.ru` health/ready ok; LAN `:3000` ok; wipe РќР•
**Р‘Р°Р·Р° РєРѕРґР°:** `fe98e763` (+ commit Unicode-fix `deploy.py` / docs)
**РЈСЂРѕРє:** Windows cp1251 Р»РѕРјР°Р» Р»РѕРі СЃ `в†’` вЂ” `_safe_print` + `PYTHONUTF8=1`
**Docs:** `deploy/synology/README.md` В§ В«Р”Р»СЏ РР-Р°РіРµРЅС‚Р°В»; RUNBOOK/DEPLOY РѕР±РЅРѕРІР»РµРЅС‹
**NEXT:** idle

## [2026-08-09T20:00:36Z] вЂ” TZ-OPS-309 DONE: deploy-prep hygiene + admin smoke
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / ops executor
**РЎС‚Р°С‚СѓСЃ:** DONE; READY TO PROPOSE DEPLOY; Deploy РќР•
**Р§С‚Рѕ:** DOC-343 archive committed; DOC-344 parked without implementation. Existing single Nest on :3000 returned `/api/health` HTTP 200 (`status: ok`, Mongo/memory/disk up); existing FE on :4200 passed admin browser smoke for `Р’СЃРµ РљРџ`, `РЎРѕР·РґР°С‚СЊ РљРџ`, and `Р РѕР»Рё` (system rows `РЎРёСЃС‚РµРјРЅР°СЏ` + `Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ`, no Delete).
**Gates:** FE tsc `--noEmit` PASS; BE tsc `--noEmit` PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-309.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-309-deploy-prep-hygiene-smoke.lock`
**Checkpoint:** READY TO PROPOSE DEPLOY В· NEXT idle В· Deploy NO.

## [2026-08-09T19:44:49Z] вЂ” WAVE-KP-USABLE DONE: 339 в†’ 334 в†’ 349 в†’ 335 в†’ 336
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** WAVE DONE; all scoped commits pushed to canonical `main`; deploy РќР•
**Р¤РёРЅР°Р»СЊРЅС‹Р№ РѕС‚С‡С‘С‚ PO:**

| TZ | Feature SHA | Closeout SHA | Archive |
|---|---|---|---|
| TZ-SALES-339 | `8a3186f1` | `e183a663` | `tasks/_archive/2026-08/TZ-SALES-339.done.md` |
| TZ-SALES-334 | `fa14bcec` | `fa14bcec` | `tasks/_archive/2026-08/TZ-SALES-334.done.md` |
| TZ-SALES-349 | `a16d2845` | `a16d2845` | `tasks/_archive/2026-08/TZ-SALES-349.done.md` |
| TZ-SALES-335 | `d6bd43b9` | `592d5980` | `tasks/_archive/2026-08/TZ-SALES-335.done.md` |
| TZ-SALES-336 | `b8edffd7` | `b8edffd7` | `tasks/_archive/2026-08/TZ-SALES-336.done.md` |

Merge landing for 339/334: `69752397`. `_active/` is empty; WAVE-KP-COMPLETE was not started; Deploy NO.

## [2026-08-09T19:44:49Z] вЂ” TZ-SALES-336 DONE: hard-lock В«РћРїР»Р°С‡РµРЅР°В» Рё РєРѕРїРёСЂРѕРІР°РЅРёРµ РљРџ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; browser self-verify + FE/BE gates + archive/lock/closeout; deploy РќР•
**Р§С‚Рѕ:** `accepted` РїРѕРєР°Р·С‹РІР°РµС‚СЃСЏ РєР°Рє В«РћРїР»Р°С‡РµРЅР°В» Рё Р±Р»РѕРєРёСЂСѓРµС‚ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ С‚РѕРІР°СЂРѕРІ, РєРѕР»РёС‡РµСЃС‚РІР°, С€Р°Р±Р»РѕРЅР°, РїР°СЂР°РјРµС‚СЂРѕРІ Рё С‚Р°Р±Р»РёС†С‹; СЃРЅСЏС‚РёРµ СЃС‚Р°С‚СѓСЃР° РІРѕР·РІСЂР°С‰Р°РµС‚ draft/editable. РџСЂРё РїРѕРІС‚РѕСЂРЅРѕРј РѕС‚РєСЂС‹С‚РёРё РѕРїР»Р°С‡РµРЅРЅРѕР№ РљРџ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ `templateSnapshot.html`, Р±РµР· live template build. В«РљРѕРїРёСЂРѕРІР°С‚СЊВ» РІС‹Р·С‹РІР°РµС‚ duplicate API Рё РѕС‚РєСЂС‹РІР°РµС‚ РЅРѕРІС‹Р№ draft РІ Create РљРџ.
**Gates:** frontend/backend tsc PASS; proposal-create + proposals Jest 44/44; quotation service Jest 27/27; ESLint/Prettier/diff-check PASS.
**Browser evidence:** template + С„РёСЂРјР° в†’ В«РЎРѕС…СЂР°РЅРµРЅРѕВ» в†’ В«РћРїР»Р°С‡РµРЅР° В· Р±Р»Р°РЅРє Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅВ» в†’ unlock restores controls; В«РљРѕРїРёСЂРѕРІР°С‚СЊВ» HTTP 201 в†’ `/proposals/create?id=вЂ¦`, RU toast В«РЎРѕР·РґР°РЅР° РєРѕРїРёСЏ вЂ¦В».
**Archive:** `tasks/_archive/2026-08/TZ-SALES-336.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-336-kp-lock-paid-copy.lock`
**Scope:** foreign DOC-343/344 and system-role/admin WIP excluded; frozen 317/320 untouched. Deploy РќР•
**NEXT:** close WAVE-KP-USABLE; do not start WAVE-KP-COMPLETE.

## [2026-08-09T19:18:00Z] вЂ” TZ-SALES-349 DONE: hygiene СЃС‚Р°СЂС‹С… СѓРЅРёРєР°Р»СЊРЅС‹С… РёРЅРґРµРєСЃРѕРІ quotations
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; migration/unit/e2e/browser self-verify PASS; deploy РќР•
**Р§С‚Рѕ:** РЎС‚Р°СЂС‚РѕРІР°СЏ guarded-РјРёРіСЂР°С†РёСЏ РїРµСЂРµС‡РёСЃР»СЏРµС‚ РёРЅРґРµРєСЃС‹ `quotations`, СѓРґР°Р»СЏРµС‚ С‚РѕР»СЊРєРѕ РЅРµРєР°РЅРѕРЅРёС‡РµСЃРєРёРµ unique (РѕСЃС‚Р°РІР»СЏРµС‚ `_id_`, `number_1`, `masterId_1_organizationId_1`), Р±РµР·РѕРїР°СЃРЅР° РЅР° РїСѓСЃС‚РѕР№ Р±Р°Р·Рµ Рё РїСЂРё РіРѕРЅРєРµ СѓРґР°Р»РµРЅРёСЏ РёРЅРґРµРєСЃР°; `DatabaseModule` Р·Р°РїСѓСЃРєР°РµС‚ РµС‘ РїРѕСЃР»Рµ РїРѕРґРєР»СЋС‡РµРЅРёСЏ Mongo.
**Gates:** backend tsc PASS; migration Jest 4/4; quotation e2e 7/7; frontend tsc PASS; proposal/Create Jest 21/21; Prettier/diff-check PASS.
**Browser evidence:** browser-context create в†’ delete в†’ create в†’ create: HTTP `[201, 200, 201, 201]`, РЅРѕРјРµСЂР° `QTN-2026-025/026/027` СЂР°Р·Р»РёС‡РЅС‹, СѓРґР°Р»С‘РЅРЅР°СЏ РљРџ СЃРєСЂС‹С‚Р°, РґРІРµ Р¶РёРІС‹Рµ РІРёРґРЅС‹; `/proposals/create?new=1` РѕС‚РєСЂС‹Р»СЃСЏ СЃ СЂСѓСЃСЃРєРёРј UI.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-349.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-349.md` СѓРґР°Р»С‘РЅ.
**Scope:** quotation schema/numbering/soft-delete, frozen 317/320, foreign system-role/admin Рё DOC-343/344 WIP РЅРµ С‚СЂРѕРЅСѓС‚С‹. Deploy РќР•
**NEXT:** claim TZ-SALES-335 separately. Deploy РќР•

## [2026-08-09T20:10:00Z] вЂ” Warm deploy OK + deploy docs for agents
**РЎС‚Р°С‚СѓСЃ:** prod `https://kppdf-crm.ru` health/ready ok; LAN `:3000` ok; wipe РќР•
**Р‘Р°Р·Р° РєРѕРґР°:** `fe98e763` (+ commit Unicode-fix `deploy.py` / docs)
**РЈСЂРѕРє:** Windows cp1251 Р»РѕРјР°Р» Р»РѕРі СЃ `в†’` вЂ” `_safe_print` + `PYTHONUTF8=1`
**Docs:** `deploy/synology/README.md` В§ В«Р”Р»СЏ РР-Р°РіРµРЅС‚Р°В»; RUNBOOK/DEPLOY РѕР±РЅРѕРІР»РµРЅС‹
**NEXT:** idle

## [2026-08-09T18:18:00Z] вЂ” TZ-ADMIN-303 DONE: Р°РґРјРёРЅ РїСЂР°РІРёС‚ СЃРёСЃС‚РµРјРЅС‹Рµ СЂРѕР»Рё / delete Р·Р°РїСЂРµС‰С‘РЅ
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; self-verify PASS; deploy РќР•
**Р§С‚Рѕ:** Site-admin PATCH СЃРёСЃС‚РµРјРЅС‹С… СЂРѕР»РµР№ (permissions/pages); DELETE РІСЃРµРіРґР° 403 `SYSTEM_ROLE_FROZEN`; FE В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊВ» РїСЂРё `role:write`; RU toast; Р±РµР№РґР¶ В«РЎРёСЃС‚РµРјРЅР°СЏВ»; filter СЃРѕС…СЂР°РЅСЏРµС‚ `code`.
**Gates:** BE/FE tsc PASS; system-role Jest 7/7; roles-admin.page Jest 13/13; Prettier/diff-check PASS; browser Editв†’Save PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-303.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-ADMIN-303.md` СѓРґР°Р»С‘РЅ.
**Scope:** WAVE-KP-USABLE / TZ-SALES-* / freebuff worktree / deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** idle. Deploy РќР•

## [2026-08-09T17:00:00Z] вЂ” TZ-SALES-339 READY FOR REVIEW: visible Save РљРџ, autosave, soft-delete
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual autosave/delete PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Implementation:** `da1d83e7de29b58276c063c71071675c69b5a44c`.
**Р§С‚Рѕ:** В«РЎРѕС…СЂР°РЅРёС‚СЊ РљРџВ» РІС‹РЅРµСЃРµРЅР° РІ РІРµСЂС…РЅСЋСЋ СЃС‚СЂРѕРєСѓ Create-СЃС‚СѓРґРёРё; РїРѕСЃР»Рµ С€Р°Р±Р»РѕРЅР° + РЅР°С€РµР№ С„РёСЂРјС‹ Р·Р°РїСѓСЃРєР°РµС‚СЃСЏ debounce-Р°РІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёРµ С‚РѕРіРѕ Р¶Рµ draft; F5 РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ С‚РѕРІР°СЂС‹/С€Р°Р±Р»РѕРЅ РёР· Quotation. Soft-deleted РљРџ РёСЃРєР»СЋС‡Р°СЋС‚СЃСЏ РёР· СЃРїРёСЃРєР° Рё РѕР±С‹С‡РЅРѕРіРѕ GET.
**Gates:** frontend/backend tsc PASS; proposal/Create Jest 38/38; quotation service 26/26; quotation e2e 6/6; FE Prettier/ESLint PASS; diff-check PASS.
**Scope:** 334 client, 335 qty/photo, 336 lock/copy, 317 shell, DOC-343/admin WIP, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** Cursor/PO visual: Save РљРџ РЅР° РІРёРґСѓ, autosave в†’ F5, СѓРґР°Р»РёС‚СЊ РљРџ в†’ СЃС‚СЂРѕРєР° РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ РїРѕСЃР»Рµ reload. РџРѕСЃР»Рµ PASS archive/lock/remove `_active` в†’ TZ-SALES-334. Deploy РќР•

## [2026-08-09T18:43:14Z] вЂ” TZ-SALES-334 DONE: all-counterparty client picker
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; browser self-verify + FE gates + archive/lock/closeout; deploy РќР•
**Feature:** client-only Create changes, pushed in the closeout commit for this TZ.
**Р§С‚Рѕ:** Р’ `РЎРґРµР»РєРё в†’ РЎРѕР·РґР°С‚СЊ РљРџ` РїРѕР»Рµ В«РљР»РёРµРЅС‚В» СЃС‚Р°Р»Рѕ `PiOverflowSelect` РїРѕ РІСЃРµРј Р°РєС‚РёРІРЅС‹Рј Counterparty Р±РµР· С„РёР»СЊС‚СЂР° СЂРѕР»Рё; searchable auto; РІС‹Р±СЂР°РЅРЅС‹Р№ РєР»РёРµРЅС‚ РІС…РѕРґРёС‚ РІ autosave Рё РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ РїРѕСЃР»Рµ F5.
**Gates:** frontend tsc PASS; focused proposal/Create Jest 21/21 PASS; frontend Prettier PASS; diff-check PASS.
**Browser evidence:** 5 client options; `Р”РµРјРѕ В· РљР»РёРµРЅС‚ 3 В· РРќРќ 7700002038` в†’ В«РЎРѕС…СЂР°РЅРµРЅРѕВ» в†’ reload `/proposals/create` Р±РµР· `new=1` в†’ РєР»РёРµРЅС‚ РѕСЃС‚Р°Р»СЃСЏ РІ В«РџР°СЂР°РјРµС‚СЂС‹В». Р’СЂРµРјРµРЅРЅС‹Р№ self-check draft СѓРґР°Р»С‘РЅ.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-334.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-334-kp-counterparty-picker.lock`
**NEXT:** claim TZ-SALES-335 separately. Deploy РќР•

## [2026-08-09T21:35:00Z] вЂ” TZ-SALES-339 DONE: autosave, resume, delete closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; browser self-verify + archive + lock + closeout commit/push; deploy РќР•
**Implementation:** `8a3186f1` (already on `main`).
**Р§С‚Рѕ:** Create РљРџ РїРѕРєР°Р·С‹РІР°РµС‚ С‚РѕР»СЊРєРѕ СЂСѓСЃСЃРєРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ Р°РІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёСЏ В«РЎРѕС…СЂР°РЅРµРЅРѕВ»; РїРѕСЃР»Рµ РІС‹Р±РѕСЂР° С€Р°Р±Р»РѕРЅР°, РЅР°С€РµР№ С„РёСЂРјС‹ Рё С‚РѕРІР°СЂР° draft СЃРѕС…СЂР°РЅСЏРµС‚СЃСЏ Рё РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ РІРјРµСЃС‚Рµ СЃ РєР»РёРµРЅС‚РѕРј. РЈРґР°Р»С‘РЅРЅРѕРµ РљРџ РґР°С‘С‚ В«РљРџ СѓРґР°Р»РµРЅРѕВ», РёСЃС‡РµР·Р°РµС‚ РїРѕСЃР»Рµ reload Рё РЅРµ РІРѕСЃРєСЂРµСЃР°РµС‚ РІ РЅРѕРІРѕРј Р»РёСЃС‚Рµ.
**Gates:** frontend tsc PASS; backend tsc PASS; focused proposal/Create Jest 21/21 PASS; quotation service 26/26 + quotation e2e 6/6 baseline PASS; Prettier/diff-check PASS.
**Browser evidence:** `РЎРґРµР»РєРё в†’ РЎРѕР·РґР°С‚СЊ РљРџ` autosave/no Save button; `/proposals/create` F5 inspector restored firm/client/product; `РЎРґРµР»РєРё в†’ РљРџ` delete toast + row gone; empty new sheet after deletion.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-339.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-339-save-autosave-delete.lock`
**NEXT:** claim TZ-SALES-334 client-only. Deploy РќР•


## [2026-08-09T16:53:54Z] вЂ” TZ-SALES-338 DONE: edit through Create studio
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor/PO visual PASS; deploy РќР•
**Implementation:** `fb04b05689a9dc557840781791c469b80e6c91e4`.
**Р§С‚Рѕ:** РЎРїРёСЃРѕРє В«РЎРѕР·РґР°С‚СЊВ»/В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊВ» РІРµРґС‘С‚ РІ СЃС‚СѓРґРёСЋ РЎРѕР·РґР°С‚СЊ РљРџ; Edit РїРµСЂРµРґР°С‘С‚ `?id=`, draft РіРёРґСЂР°С‚РёСЂСѓРµС‚СЃСЏ Р±РµР· РІС‚РѕСЂРѕРіРѕ form-РґРёР°Р»РѕРіР°, EN hints СѓР±СЂР°РЅС‹.
**Gates:** frontend tsc PASS; proposals + Create Jest 37/37; Prettier PASS; ESLint PASS; diff-check PASS.
**Visual:** PO РїРѕРґС‚РІРµСЂРґРёР» same РљРџ РІ СЃС‚СѓРґРёРё Рё РЅРѕРІС‹Р№ Р»РёСЃС‚ Р±РµР· РґРёР°Р»РѕРіР°.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-338.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-338.md` СѓРґР°Р»С‘РЅ.
**Scope:** DOC-343/admin/system-role WIP, 339, 334/335/336, 317 shell, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** TZ-SALES-339. Deploy РќР•

## [2026-08-09T16:47:00Z] вЂ” TZ-SALES-338 READY FOR REVIEW: edit through Create studio
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual Edit в†’ studio PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Implementation:** `fb04b05689a9dc557840781791c469b80e6c91e4`.
**Р§С‚Рѕ:** РЎРїРёСЃРѕРє В«РЎРѕР·РґР°С‚СЊВ» Рё В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊВ» Р±РѕР»СЊС€Рµ РЅРµ РѕС‚РєСЂС‹РІР°РµС‚ РІС‚РѕСЂРѕР№ form-РґРёР°Р»РѕРі: РѕР±Р° РїСѓС‚Рё РІРµРґСѓС‚ РІ `/proposals/create`, Edit РїРµСЂРµРґР°С‘С‚ `?id=`, Create РіРёРґСЂР°С‚РёСЂСѓРµС‚ С‚РѕС‚ Р¶Рµ editable draft. РќРµРІР°Р»РёРґРЅС‹Р№/Р·Р°РєСЂС‹С‚С‹Р№ id РґР°С‘С‚ RU РѕС€РёР±РєСѓ Рё С‡РёСЃС‚С‹Р№ Р»РёСЃС‚; Create hints РїРµСЂРµРІРµРґРµРЅС‹ РЅР° RU.
**Gates:** frontend tsc PASS; proposals + Create Jest 37/37; Prettier PASS; ESLint PASS; diff-check PASS.
**Scope:** 339 autosave/delete, 334 client, 335 qty/photo, 336 lock/copy, 317 shell, DOC-343/admin WIP, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** Cursor/PO visual: `/proposals` в†’ Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ в†’ same РљРџ in studio; РЎРѕР·РґР°С‚СЊ в†’ no dialog. РџРѕСЃР»Рµ PASS archive/lock/remove `_active` в†’ TZ-SALES-339. Deploy РќР•

## [2026-08-09T16:44:27Z] вЂ” TZ-SALES-333 DONE: Save and resume draft
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; PO confirmed continuation; deploy РќР•
**Implementation:** `b1d51453b1e06d2e21f724028164836526c2959b`; closeout metadata `cc4ffd87`.
**Р§С‚Рѕ:** Save СЃРѕР·РґР°С‘С‚ draft СЃ items/templateId/templateSnapshot; РїРѕРІС‚РѕСЂРЅС‹Р№ Save РѕР±РЅРѕРІР»СЏРµС‚ С‚РѕС‚ Р¶Рµ draft; editable draft/template resume СЂР°Р±РѕС‚Р°РµС‚ Р±РµР· РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕР№ Р±Р»РѕРєРёСЂРѕРІРєРё F5. Save visibility/autosave UX РїРµСЂРµРґР°РЅС‹ TZ-SALES-339.
**Gates:** backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-333.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-333.md` СѓРґР°Р»С‘РЅ.
**Scope:** DOC-343 WIP, dirty admin/system-role WIP, 338/339, 334/335/336, 317 shell, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** TZ-SALES-338. Deploy РќР•

## [2026-08-09T19:30:00Z] вЂ” TZ-SALES-333 READY FOR REVIEW: Save and resume draft
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual Save в†’ reload/F5 PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Implementation:** `b1d51453b1e06d2e21f724028164836526c2959b`, pushed to `origin/main`.
**Р§С‚Рѕ:** Save СЃРѕР·РґР°С‘С‚ draft quotation СЃ items/templateId/templateSnapshot; РїРѕРІС‚РѕСЂРЅС‹Р№ Save PATCH-РёС‚ С‚РѕС‚ Р¶Рµ draft; editable last draft/template РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°СЋС‚СЃСЏ Р±РµР· Р±Р»РѕРєРёСЂРѕРІРєРё F5.
**Gates:** backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
**Scope:** 334 Client, 335 qty/photo, 336 paid/lock/copy, 332 rail, 317 shell, DOC-343 WIP, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** Cursor/PO visual Save в†’ reload/F5 PASS в†’ archive/lock/remove `_active` в†’ 334. Deploy РќР•

## [2026-08-09T16:19:16Z] вЂ” TZ-SALES-337 DONE: no duplicate Table section in Parameters
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; quick DOM visual PASS; deploy РќР•
**Implementation:** `0d3ea7faa34752e9765bddc378d01107e72eca9e`.
**Р§С‚Рѕ:** Parameters РѕСЃС‚Р°РІР»СЏРµС‚ С„РёСЂРјСѓ/РЅР°С†РµРЅРєСѓ/РќР”РЎ/РѕС†РµРЅРєСѓ/РєР»РёРµРЅС‚Р°; columns, hide/reorder Рё CTA В«РћС‚РєСЂС‹С‚СЊ С€Р°Р±Р»РѕРЅ С‚Р°Р±Р»РёС†С‹В» РѕСЃС‚Р°СЋС‚СЃСЏ С‚РѕР»СЊРєРѕ РІ rail РўР°Р±Р»РёС†Р°.
**Gates:** frontend tsc PASS; proposal-create Jest 15/15; Prettier PASS; ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-337.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-337.md` СѓРґР°Р»С‘РЅ.
**Scope:** 332 sync/layout, backend, Save/Client/qty/photo/lock, 317 shell, DOC-343 WIP, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** claim TZ-SALES-333. Deploy РќР•.

## [2026-08-09T16:08:44Z] вЂ” TZ-SALES-332 DONE: Cursor visual PASS on hotfix
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor visual PASS; deploy РќР•
**Feature:** `f5e0f401`; **hotfix:** `272550ab946600045970e31f110d3d72bd121ccd`.
**Visual:** Cursor РїРѕРґС‚РІРµСЂРґРёР» target selection РґР»СЏ multi-table template, СЃРѕРІРїР°РґРµРЅРёРµ labels РїР°РЅРµР»Рё СЃ A4, hide/show Рё reorder.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-332.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-332.md` СѓРґР°Р»С‘РЅ.
**Gates:** frontend/backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
**Scope:** DOC-343 dirty WIP, 317 shell, 330/331 behavior, Save/Counterparty, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** idle РїРѕ KP-vitrine. Deploy РќР•.

## [2026-08-09T16:01:50Z] вЂ” TZ-SALES-332 HOTFIX READY FOR REVIEW: selected live-table binding
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Root cause:** РїСЂРё 2+ live tables Р±РµР· `kpLineItems` FE РІС‹Р±РёСЂР°Р» DEFAULT_KP, РїРѕСЌС‚РѕРјСѓ labels РїР°РЅРµР»Рё РЅРµ СЃРѕРІРїР°РґР°Р»Рё СЃ A4 Рё hide/reorder СѓС…РѕРґРёР»Рё РЅРµ РІ С‚Сѓ С‚Р°Р±Р»РёС†Сѓ.
**Hotfix:** `272550ab` pushed to `origin/main`; Table rail РїРѕРєР°Р·С‹РІР°РµС‚ СЃРїРёСЃРѕРє live tables, РІС‹Р±СЂР°РЅРЅР°СЏ С‚Р°Р±Р»РёС†Р° Р·Р°РіСЂСѓР¶Р°РµС‚ СЂРµР°Р»СЊРЅС‹Рµ columns, `tableTargetId` РїСЂРѕС…РѕРґРёС‚ request-only build Рё BE РїСЂРёРјРµРЅСЏРµС‚ layout С‚РѕР»СЊРєРѕ Рє РІС‹Р±СЂР°РЅРЅРѕР№ live table.
**Gates:** frontend tsc PASS; backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
**Scope:** 317 A4 rails|center, 330 copy-on-write layout, 331 footer/VAT, CTA/flyout polish, DOC-343 WIP, Save/Counterparty, 320/322 Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** Cursor/PO visual PASS в†’ archive/lock/remove `_active`. Deploy РќР•.

## [2026-08-09T15:45:00Z] вЂ” TZ-SALES-332 READY FOR REVIEW: flyout/table rail polish
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Implementation:** `f5e0f401` pushed to `origin/main`.
**Р§С‚Рѕ:** Layout Create РљРџ СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµС‚СЃСЏ СЃ СЂРµР°Р»СЊРЅС‹РјРё columns РІС‹Р±СЂР°РЅРЅРѕР№ live line-items TableTemplate; в†ђ/в†’ Рё В«Р’РёРґРЅР°/РЎРєСЂС‹С‚Р°В» rebuild request-only A4 layout, РїРѕСЃР»РµРґРЅРёР№ РІРёРґРёРјС‹Р№ СЃС‚РѕР»Р±РµС† Р·Р°С‰РёС‰С‘РЅ. РџСЂР°РІС‹Р№ rail СЂР°Р·РґРµР»С‘РЅ РЅР° РџР°СЂР°РјРµС‚СЂС‹/РўР°Р±Р»РёС†Р°; CTA = PiButton В«РћС‚РєСЂС‹С‚СЊ С€Р°Р±Р»РѕРЅ С‚Р°Р±Р»РёС†С‹В»; products Р·Р°РєСЂС‹РІР°РµС‚ right overlay, flyouts РїРѕР»СѓС‡РёР»Рё РІРѕР·РґСѓС…/content-height/Р»С‘РіРєСѓСЋ РїСЂРѕР·СЂР°С‡РЅРѕСЃС‚СЊ.
**Gates:** frontend tsc PASS; proposal-create Jest 14/14; Prettier PASS; diff-check PASS.
**Scope:** frozen A4 rails|center, 330 tableLayout, 331 footer/VAT, Save/Counterparty, 320/322, global tokens, DOC-343 WIP Рё deploy РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**NEXT:** Cursor/PO visual PASS в†’ archive/lock/remove `_active`. Deploy РќР•.

## [2026-08-09T15:35:06Z] вЂ” TZ-SALES-331 DONE: markup + VAT footer
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; PO visual PASS; deploy РќР•
**Feature:** `25512c2a` вЂ” request-only effective prices from immutable catalog base, whole-deal VAT footer under live line-items table.
**Gates:** backend tsc PASS; document-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Visual:** PO confirmed `РС‚РѕРіРѕ`/РќР”РЎ on the A4 sheet and markup changes displayed figures.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-331.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-331.md` СѓРґР°Р»С‘РЅ.
**Scope:** DOC-343 dirty WIP excluded; discount column, 317 shell rewrite, snapshots, quotation persistence, 320/322, deploy untouched.
**NEXT:** TZ-SALES-332. Deploy РќР•
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Р§С‚Рѕ:** РќР°С†РµРЅРєР° РІС‹С‡РёСЃР»СЏРµС‚ request-only `previewLines.unitPrice` РёР· immutable catalog base price; inspector РґРѕР±Р°РІР»СЏРµС‚ РќР”РЎ % (default 20). Build СЃС‡РёС‚Р°РµС‚ РС‚РѕРіРѕ Рё РґРѕР±Р°РІР»СЏРµС‚ right-aligned `РІ С‚.С‡. РќР”РЎ` С‚РѕР»СЊРєРѕ РїРѕРґ live line-items table; VAT-inclusive mode Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ РєР°Рє `sum Г— vat/(100+vat)`, VAT 0 СЃРєСЂС‹РІР°РµС‚ VAT row.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Scope:** 330 `tableLayout` Рё shell 317 СЃРѕС…СЂР°РЅРµРЅС‹; Product/listPrice РЅРµ PATCH, СЃРєРёРґРѕС‡РЅР°СЏ РєРѕР»РѕРЅРєР° РЅРµ РґРѕР±Р°РІР»РµРЅР°; foreign DOC-343 WIP РёСЃРєР»СЋС‡С‘РЅ.
**NEXT:** Cursor/PO visual PASS РЅР° `/proposals/create` в†’ archive/lock/remove `_active`. Deploy РќР•.

## [2026-08-09T15:01:58Z] вЂ” TZ-SALES-330 DONE: Create РљРџ table layout instance
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor/PO visual PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** Create РљРџ РїРѕР»СѓС‡РёР» request-only copy-on-write `kpTableLayout`: РїСЂР°РІС‹Р№ flyout В«РўР°Р±Р»РёС†Р°В» РјРµРЅСЏРµС‚ РїРѕСЂСЏРґРѕРє Рё visibility РєРѕР»РѕРЅРѕРє, Р° build РїСЂРёРјРµРЅСЏРµС‚ РёС… С‚РѕР»СЊРєРѕ Рє РЅР°Р·РЅР°С‡РµРЅРЅРѕР№ live line-items table. Shared TableTemplate, snapshots Рё frozen shell РЅРµ РјРµРЅСЏСЋС‚СЃСЏ.
**Implementation:** `8c5662fe5783631c5b352d5a5e8bad8547a5dd59`
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-330.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-SALES-330.md` СѓРґР°Р»С‘РЅ.
**Scope:** DOC-343 dirty WIP РёСЃРєР»СЋС‡С‘РЅ; discount column, 317 shell rewrite, 320/322, deploy untouched.
**NEXT:** TZ-SALES-331. Deploy РќР•.

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; Cursor/PO visual PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive; deploy РќР•
**Р§С‚Рѕ:** РџСЂР°РІС‹Р№ flyout В«РўР°Р±Р»РёС†Р°В» С‚РµРїРµСЂСЊ СѓРїСЂР°РІР»СЏРµС‚ in-memory copy-on-write `kpTableLayout`: РїРѕСЂСЏРґРѕРє в†‘/в†“ Рё visibility, СЃ hint В«РњРµРЅСЏРµС‚ С‚РѕР»СЊРєРѕ СЌС‚Рѕ РљРџ, РЅРµ РѕР±С‰РёР№ С€Р°Р±Р»РѕРЅВ» Рё СЃСЃС‹Р»РєРѕР№ РЅР° РїСЂРµСЃРµС‚ РІ Р”РѕРєСѓРјРµРЅС‚Р°С…. Build DTO/backend РїСЂРёРјРµРЅСЏСЋС‚ РїРѕСЂСЏРґРѕРє/СЃРєСЂС‹С‚РёРµ С‚РѕР»СЊРєРѕ Рє РЅР°Р·РЅР°С‡РµРЅРЅРѕР№ live line-items table, `index` = 1-based; snapshots Рё shared TableTemplate РЅРµ РјРµРЅСЏСЋС‚СЃСЏ.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; diff-check PASS; FE Prettier PASS.
**Implementation:** pending scoped commit after READY marker; foreign DOC-343 dirty WIP preserved/excluded.
**NEXT:** Cursor/PO visual PASS в†’ archive/lock/remove `_active` в†’ commit/push в†’ TZ-SALES-331. Deploy РќР•.

## [2026-08-09T14:26:00Z] вЂ” TZ-OPS-308 DONE: page.md drift audit + thin P0 fix
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-308 В· docs-only
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РђСѓРґРёС‚ routes.ts в†” page.md/README/INDEX/DOMAIN-MAP: 36/36 Р±РёР·РЅРµСЃ-routes РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅС‹, 0 MISMATCH РїРѕ РїСѓС‚СЏРј. РќР°Р№РґРµРЅ 1 ORPHAN page (foundations вЂ” РЅРµС‚ route РІ app.routes.ts, FE-РєРѕРјРїРѕРЅРµРЅС‚Р° РЅРµС‚): P0 Р»РѕР¶РЅС‹Р№ `/foundations` РІ README row 36. РўРѕРЅРєРёР№ P0-fix: СЏС‡РµР№РєР° Route + footer РІ README (Р±РµР· rewrite body). P1: 5 РєРѕСЃРјРµС‚РёС‡РµСЃРєРёС… title-СЂР°СЃС…РѕР¶РґРµРЅРёР№ РѕС‚РјРµС‡РµРЅС‹, РЅРµ С‡РёРЅРёР»РёСЃСЊ.
**Gates:** Test-Path Р°СѓРґРёС‚ True; 84 в‰¤120; diff Р±РµР· product code; С‡СѓР¶РѕР№ WIP РЅРµ С‚СЂРѕРЅСѓС‚.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-308.done.md`; lock СЃРѕР·РґР°РЅ.
**NEXT:** idle; successor P2 вЂ” Р°РІС‚Рѕ-drift gate routesв†”page.md; deploy РќР•.

## [2026-08-09T14:42:11Z] вЂ” TZ-DOC-TABLES-307 DONE: KP category + preset
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; gates PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅС‹ `kp`/В«РљРџВ», РєР°РЅРѕРЅРЅС‹Р№ preset В«РљРџ вЂ” РїРѕР·РёС†РёРёВ» СЃ С€РµСЃС‚СЊСЋ keys, idempotent seed Рё В«РџСЂРµСЃРµС‚ РљРџВ» РІ dialog СЃ confirm РґР»СЏ РЅРµРїСѓСЃС‚С‹С… РєРѕР»РѕРЅРѕРє.
**Gates:** BE tsc PASS; table-template e2e 9/9; FE tsc PASS; tables/dialog Jest 52/52; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-307.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-DOC-TABLES-307.md` СѓРґР°Р»С‘РЅ.
**Scope:** DOC-343 WIP, 306 chips, 308 layout, 330/331, discount column, Catalog routes, deploy untouched.
**NEXT:** TZ-SALES-330. Deploy РќР•.

## [2026-08-09T14:37:14Z] вЂ” TZ-DOC-TABLES-308 DONE: dialog layout + preview skeleton
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; gates PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** Source/fields controls РІС‹СЂРѕРІРЅРµРЅС‹ РїРѕ baseline СЃ СЃРѕРїРѕСЃС‚Р°РІРёРјРѕР№ С€РёСЂРёРЅРѕР№; С€Р°РїРєРё РєРѕР»РѕРЅРѕРє РІС‹С€Рµ; РїСѓСЃС‚РѕР№ preview РїРѕРєР°Р·С‹РІР°РµС‚ skeleton cells Рё RU guidance РІРјРµСЃС‚Рѕ СЃРµСЂРѕРіРѕ void.
**Gates:** frontend tsc PASS; dialog Jest 44/44; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-308.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-DOC-TABLES-308.md` СѓРґР°Р»С‘РЅ.
**Scope:** 306 chips, 307 enum/preset, backend registry, DOC-343 WIP, deploy untouched.
**NEXT:** TZ-DOC-TABLES-307. Deploy РќР•.

## [2026-08-09T14:33:25Z] вЂ” TZ-DOC-TABLES-306 DONE: tables query routing fix
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; gates PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** GroupChip/PiGroupWorkspace С‚РµРїРµСЂСЊ СЂР°Р·РґРµР»СЏСЋС‚ route path Рё queryParams; `РР· РґР°РЅРЅС‹С…` РѕСЃС‚Р°С‘С‚СЃСЏ РЅР° `/doc-constructor/tables?view=from-data`, `Р’СЃРµ С‚Р°Р±Р»РёС†С‹` вЂ” РЅР° `?view=all`, Р±РµР· fallthrough РІ `/materials`.
**Gates:** frontend tsc PASS; workspace/tables Jest 2 suites / 14 tests; Prettier PASS; diff-check PASS; generated RouterLink href contract PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-306.done.md`; lock СЃРѕР·РґР°РЅ; `_active/TZ-DOC-TABLES-306.md` СѓРґР°Р»С‘РЅ.
**Scope:** 307 dialog/preset, Catalog routes, KP Create, DOC-343 WIP, deploy untouched.
**NEXT:** TZ-DOC-TABLES-308. Deploy РќР•.

## [2026-08-09T14:30:45Z] вЂ” TZ-DOC-TABLES-305 DONE: PO visual closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-ccee39fec2
**РЎС‚Р°С‚СѓСЃ:** DONE; PO visual PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** Table dialog compact settings, enum В«РўРёРїВ» overflow, multi-field overlay with search, and taller column headers. Preview/alignment polish remains TZ-DOC-TABLES-308.
**Gates:** frontend tsc PASS; focused table-template-dialog + overflow-select 2 suites / 49 tests; ESLint PASS; Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md`; lock created; `_active/TZ-DOC-TABLES-305.md` removed.
**Scope:** DOC-343 dirty WIP, 307 preset, Sales, and deploy untouched.
**NEXT:** TZ-DOC-TABLES-306. Deploy РќР•.

## [2026-08-09T14:10:00Z] вЂ” TZ-OPS-307 DONE: page.md stubs design/shipping + README hygiene (WAVE CLOSED)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-307 В· WAVE-PAGE-DOCS-GAPS #3 (РїРѕСЃР»РµРґРЅСЏСЏ)
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only; deploy РќР•
**Р§С‚Рѕ:** Stub page.md `design` + `shipping` (36 СЃС‚СЂРѕРє в‰¤60; TZ-NAV-301, data-test, API РЅРµС‚ вЂ” РЅРµ РёР·РѕР±СЂРµС‚Р°С‚СЊ). README hygiene: `/dashboard`в†’`/inventory`, РґРѕР±Р°РІР»РµРЅС‹ 12 Р¶РёРІС‹С… СЃС‚СЂР°РЅРёС† (25вЂ“36), СЃС‡С‘С‚С‡РёРє 36/36. DOMAIN-MAP: former-6 РІСЃРµ yes (design/shipping stub-documented), РёС‚РѕРі **0 Г— NO**, 4 domain-СЏС‡РµР№РєРё РѕР±РЅРѕРІР»РµРЅС‹, drift-РїРѕРјРµС‚РєР° СЃРЅСЏС‚Р°. PAGE-TZ-INDEX OPS-307 DONE.
**Gates:** Test-Path РѕР±Р° True; Select-String NO = 0; page.md в‰¤60 PASS; diff Р±РµР· product code.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-307.done.md`; lock СЃРѕР·РґР°РЅ.
**NEXT:** idle вЂ” РІРѕР»РЅР° WAVE-PAGE-DOCS-GAPS (305в†’306в†’307) Р—РђРљР Р«РўРђ, DOMAIN-MAP gaps = 0; deploy РќР•.

## [2026-08-09T14:02:00Z] вЂ” TZ-OPS-306 DONE: page.md admin users + roles
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-306 В· WAVE-PAGE-DOCS-GAPS #2
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only; deploy РќР•
**Р§С‚Рѕ:** РЎРѕР·РґР°РЅС‹ `docs/pages/admin-users.page.md` (90 в‰¤120) Рё `admin-roles.page.md` (89 в‰¤120): route/chips, capability-РіРµР№С‚С‹ (user:admin / role:read + systemRoles admin), API `/admin/users` (+activate/deactivate/reset-password) Рё `/admin/roles`, РґРёР°Р»РѕРіРё (UserForm/ResetPassword/RoleForm view), PAGE_SIZE=10, TZ-257/262/ADMIN-301/302/306.
**Wiring:** README 23/24 (24в†’26); PAGE-TZ-INDEX OPS-306 DONE; DOMAIN-MAP gap NOв†’yes (РёС‚РѕРі 4в†’2: design/shipping).
**Gates:** Test-Path РѕР±Р° True; в‰¤120 PASS; diff Р±РµР· product code; С‡СѓР¶РѕР№ WIP РЅРµ С‚СЂРѕРЅСѓС‚.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-306.done.md`; lock СЃРѕР·РґР°РЅ.
**NEXT:** TZ-OPS-307 (design/shipping stubs + README hygiene) вЂ” СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё; deploy РќР•.

## [2026-08-09T13:52:00Z] вЂ” TZ-OPS-305 DONE: page.md doc-template-categories + text-block-categories
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-305 В· WAVE-PAGE-DOCS-GAPS #1
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only; deploy РќР•
**Р§С‚Рѕ:** РЎРѕР·РґР°РЅС‹ `docs/pages/document-template-categories.page.md` (88 СЃС‚СЂРѕРє в‰¤120) Рё `text-block-categories.page.md` (93 в‰¤120) вЂ” route/chips, API `/document-template-categories` Рё `/text-block-categories`, dialogs, services (РєСЌС€ activeOnly-РєР°С‚Р°Р»РѕРіР°), signals, TZ-DOC-308/316/334/DICT-307/310, В«СЃРёСЃС‚РµРјРЅС‹РµВ» isSystem РЅРµ edit/delete.
**Wiring:** README СЃС‚СЂРѕРєРё 12a/12b (СЃС‡С‘С‚С‡РёРє 22в†’24); PAGE-TZ-INDEX OPS-305 DONE; DOMAIN-MAP gap NOв†’yes Г—2, РёС‚РѕРі 6в†’4.
**Gates:** Test-Path РѕР±Р° True; page.md в‰¤120 PASS; diff Р±РµР· frontend/backend/desktop PASS; С‡СѓР¶РѕР№ WIP РЅРµ С‚СЂРѕРЅСѓС‚.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-305.done.md`; lock СЃРѕР·РґР°РЅ.
**NEXT:** TZ-OPS-306 (admin users/roles) вЂ” СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё; deploy РќР•.

## [2026-08-09T13:40:00Z] вЂ” TZ-OPS-304 DONE: Domain Canon Map + gap inventory
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-304 В· WAVE-PROJECT-KNOWLEDGE #3 (РїРѕСЃР»РµРґРЅСЏСЏ)
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only self-archive OK (AC Р·РµР»С‘РЅС‹Рµ); deploy РќР•
**Р§С‚Рѕ:** РЎРѕР·РґР°РЅ `docs/DOMAIN-MAP.md` (84 СЃС‚СЂРѕРєРё в‰¤180): 12 РґРѕРјРµРЅРѕРІ (РґРѕРјРµРЅ в†’ BE modules в†’ FE routes в†’ page.md в†’ SoT) + В«РќРµ РїСѓС‚Р°С‚СЊВ» СЃ 4 РєР°РЅРѕРЅР°РјРё (Counterpartyв‰ Organization, StorageItem SoT, РљРџв‰ Order, compositionв‰ stock) + gap inventory 36 routes в†’ 6 NO Р±РµР· page.md (`/design`, `/shipping`, `/doc-template-categories`, `/dictionaries/text-block-categories`, `/admin/users`, `/admin/roles`) вЂ” page.md РЅРµ СЃРѕР·РґР°РІР°Р»РёСЃСЊ, С‚РѕР»СЊРєРѕ С‚Р°Р±Р»РёС†Р°. РџСЂРѕРІРѕРґРєР°: PROJECT-MEMORY, DOCS-INTEGRITY, ARCHITECTURE pointer (1 СЃС‚СЂРѕРєР°), pages/README (1 СЃС‚СЂРѕРєР°).
**Gates:** DOMAIN-MAP 84 в‰¤180 PASS; rg DOMAIN-MAP РІ 3 С„Р°Р№Р»Р°С… PASS; `git diff --name-only` Р±РµР· frontend/backend PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-304.done.md`; `_active` СѓРґР°Р»С‘РЅ.
**NEXT:** idle вЂ” РІРѕР»РЅР° WAVE-PROJECT-KNOWLEDGE (302в†’303в†’304) Р—РђРљР Р«РўРђ; successors = missing page.md РїРѕ gap-С‚Р°Р±Р»РёС†Рµ (РѕС‚РґРµР»СЊРЅС‹Рµ TZ, РЅРµ СЌС‚Р° РІРѕР»РЅР°); deploy РќР•.

## [2026-08-09T13:51:37Z] вЂ” TZ-SALES-328 DONE: shop-РІРёС‚СЂРёРЅР° final visual closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor/PO visual PASS; archive + lock; deploy РќР•
**Р§С‚Рѕ:** Create РљРџ product rail accepted as `PiShowcaseCard md` cards in exactly 3 columns inside the 58rem products flyout, with scoped compactness, photos/placeholders, equal-height rows, search/category filters, API-backed pager, and Add/Edit/Create actions.
**Commits:** `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (mdГ—3 + 58rem final visual).
**Gates:** frontend tsc PASS; focused rail Jest 4/4; proposal-create 11/11; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-328.done.md`; lock created; `_active/TZ-SALES-328.md` removed.
**Scope:** DOC-343/document-template.service.ts, OPS WIP, 325 bind, 322/320, and deploy untouched.
**NEXT:** idle РїРѕ KP-vitrine; do not invent. Deploy РќР•.

## [2026-08-09T13:15:28Z] вЂ” TZ-SALES-328 READY FOR REVIEW: shop-РІРёС‚СЂРёРЅР°
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; visual Cursor/PO PASS РѕР±СЏР·Р°С‚РµР»РµРЅ РґРѕ archive
**Р§С‚Рѕ:** Create РљРџ product rail Р·Р°РјРµРЅС‘РЅ РЅР° `PiShowcaseCard md` grid СЃ С„РѕС‚Рѕ/placeholder, search/category filters, API-backed page/limit=12 pagination, `Р”РѕР±Р°РІРёС‚СЊ`, `Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ` Рё `РЎРѕР·РґР°С‚СЊ РёР·РґРµР»РёРµ` С‡РµСЂРµР· СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ ProductForm/QuickCreate dialogs. Add-and-continue Рё A4 rails|center geometry СЃРѕС…СЂР°РЅРµРЅС‹.
**Gates:** frontend tsc PASS; focused rail Jest 4/4 PASS; proposal-create Jest 11/11 PASS; diff-check PASS.
**Canonical:** `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (mdГ—3 + 58rem final visual).
**Scope:** foreign DOC-343 backend/docs WIP preserved/excluded; 325, 322, 320, BuilderCanvas, deploy untouched.
**NEXT:** superseded by the DONE closeout above; deploy РќР•.

## [2026-08-09T13:20:00Z] вЂ” TZ-OPS-303 DONE: Docs Integrity Closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-303 В· WAVE-PROJECT-KNOWLEDGE #2
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only self-archive OK (AC Р·РµР»С‘РЅС‹Рµ); deploy РќР•
**Р§С‚Рѕ:** РЎРѕР·РґР°РЅ `docs/DOCS-INTEGRITY.md` (60 СЃС‚СЂРѕРє в‰¤100): РїСЂР°РІРёР»Рѕ В«РєРѕРґ + docs = РѕРґРёРЅ PR/TZВ», РјР°С‚СЂРёС†Р° С‚СЂРёРіРіРµСЂв†’С„Р°Р№Р»С‹, Integrity slot, Р°РЅС‚Рё-РґСЂРµР№С„ (РєРѕРґ + Р¶РёРІР°СЏ schema РїРѕР±РµР¶РґР°СЋС‚). `_TEMPLATE.md` РїРѕР»СѓС‡РёР» СЃРµРєС†РёСЋ **Integrity slot** РїРѕСЃР»Рµ Acceptance; FIC В§F вЂ” РїСѓРЅРєС‚ РїСЂРѕ slot; PROJECT-MEMORY вЂ” Р¶РёРІР°СЏ СЃСЃС‹Р»РєР° DOCS-INTEGRITY + Integrity slot РІ В«РќРµ РїРѕС‚РµСЂСЏС‚СЊВ»; GEMINI.md DoD вЂ” Integrity slot РґРѕ READY/archive.
**Gates:** rg Integrity slot/DOCS-INTEGRITY в†’ 14 hits РІ 6 С†РµР»РµРІС‹С… С„Р°Р№Р»Р°С… PASS; DOCS-INTEGRITY 60 в‰¤100 СЃС‚СЂРѕРє PASS; product code РЅРµ С‚СЂРѕРЅСѓС‚ PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-303.done.md`; `_active` СѓРґР°Р»С‘РЅ.
**NEXT:** TZ-OPS-304 (Domain Canon Map + gap inventory) вЂ” СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё РІРѕР»РЅС‹; deploy РќР•.

## [2026-08-09T13:05:00Z] вЂ” TZ-OPS-302 DONE: Project Memory Pack
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-ops-302 В· WAVE-PROJECT-KNOWLEDGE #1
**РЎС‚Р°С‚СѓСЃ:** DONE; docs-only self-archive OK (AC Р·РµР»С‘РЅС‹Рµ); deploy РќР•
**Р§С‚Рѕ:** РЎРѕР·РґР°РЅ `docs/PROJECT-MEMORY.md` (67 СЃС‚СЂРѕРє в‰¤140, 6 СЃРµРєС†РёР№: Р—Р°С‡РµРј / Р РёС‚СѓР°Р» 60 СЃРµРє / Р“РґРµ РїСЂР°РІРґР° / РќРµ РїРѕС‚РµСЂСЏС‚СЊ РїСЂРё DONE / РќРµ Р»РѕРјР°С‚СЊ / РљСѓРґР° РёРґС‚Рё РїРѕ Р·Р°РґР°С‡Рµ) СЃ Р·Р°РіР»СѓС€РєР°РјРё DOCS-INTEGRITY (OPS-303) Рё DOMAIN-MAP (OPS-304). РџСЂРѕРІРѕРґРєР° РІС…РѕРґР°: GUIDE В§1.2 С€Р°Рі 1a РґРѕ ARCHITECTURE, GEMINI.md РїРѕСЃР»Рµ PO-DIARY, how-to-connect-ai Рї.6 РїРѕСЃР»Рµ CLAIM.
**Gates:** rg PROJECT-MEMORY в†’ 3 С„Р°Р№Р»Р° PASS; СЃС‚СЂРѕРє в‰¤140 PASS; product code РЅРµ С‚СЂРѕРЅСѓС‚ PASS.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-302.done.md`; `_active` СѓРґР°Р»С‘РЅ.
**NEXT:** TZ-OPS-303 (Docs Integrity Closeout) вЂ” СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё РІРѕР»РЅС‹; deploy РќР•.

## [2026-08-09T11:17:19Z] вЂ” TZ-SALES-321 + TZ-SALES-319 DONE: KP build-preview fidelity closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-ccee39fec2
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor integration PASS; PO visual PASS; archive + locks; deploy РќР•
**Р§С‚Рѕ:** РЎРµСЂРІРµСЂРЅС‹Р№ build HTML СЃРѕС…СЂР°РЅСЏРµС‚ layout С‡РµСЂРµР· `toObject()`, РїСѓСЃС‚Р°СЏ С‚Р°Р±Р»РёС†Р° РїРѕРєР°Р·С‹РІР°РµС‚ В«РќРµС‚ РґР°РЅРЅС‹С…В», Р° frozen Create РљРџ shell РѕС‚РѕР±СЂР°Р¶Р°РµС‚ С„РѕРЅ Рё РїРѕР·РёС†РёРѕРЅРёСЂРѕРІР°РЅРЅС‹Рµ Р±Р»РѕРєРё РІ sandboxed A4 iframe СЃ absolute `/uploads` URLs, contain-scale, ResizeObserver Рё Р±РµР· H/V scroll.
**Gates:** backend tsc PASS; document-templates-build e2e 7/7 PASS; frontend tsc PASS; proposal-create 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-321.done.md` + `tasks/_archive/2026-08/TZ-SALES-319.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-321-create-kp-preview-fidelity.lock` + `.mimocode/locks/TZ-SALES-319-create-kp-template-build-preview.lock`
**NEXT:** idle; DOC-344 and DOC-TABLES-305 remain separate active WIP; deploy РќР•.

## [2026-08-09] пїЅ TZ-SALES-317 DONE: Create пїЅпїЅ focus shell
**пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ:** agent-3e757640b7
**пїЅпїЅпїЅпїЅпїЅпїЅ:** DONE; archive + lock; deploy пїЅпїЅ
**пїЅпїЅпїЅ:** Focus shell /proposals/create пїЅ A4 center, icon-rails, overlay flyouts (пїЅпїЅпїЅпїЅпїЅпїЅ/пїЅпїЅпїЅпїЅпїЅпїЅ/пїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅпїЅ), пїЅпїЅпїЅ H1/zone titles; flushBody; spec пїЅ0 FROZEN.
**Gates:** FE tsc PASS; proposal-create Jest PASS; Cursor Verdict PASS (visual shell).
**Archive:** `tasks/_archive/2026-08/TZ-SALES-317.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-317-create-kp-focus-shell.lock`
**NEXT:** TZ-SALES-319 (build HTML preview); deploy пїЅпїЅ.
## [2026-08-09] вЂ” TZ-DOC-342 DONE: upload-background missing file в†’ 400
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy closeout / agent-ccee39fec2
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; deploy РќР•
**Р§С‚Рѕ:** Multipart upload Р±РµР· РїРѕР»СЏ `file` С‚РµРїРµСЂСЊ РІРѕР·РІСЂР°С‰Р°РµС‚ РїРѕРЅСЏС‚РЅС‹Р№ RU 400 РґР»СЏ document-template background Рё template-block image; РІР°Р»РёРґРЅС‹Р№ PNG РѕСЃС‚Р°С‘С‚СЃСЏ 201.
**Gates:** backend tsc PASS; document-templates-upload-background e2e 6/6 PASS; diff-check PASS; Cursor/PO evidence PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-342.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-342-upload-background-null-file-400.lock`
**NEXT:** idle; TZ-SALES-317 РѕСЃС‚Р°С‘С‚СЃСЏ РЅР° visual PO; deploy С‚РѕР»СЊРєРѕ РїРѕ СЏРІРЅРѕР№ РєРѕРјР°РЅРґРµ.

## [2026-08-09] вЂ” TZ-DOC-TABLES-304 DONE: Registry schema auto-sync
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-doc-tables-304
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; deploy РќР•
**Р§С‚Рѕ:** Product registry fields СЃС‚СЂРѕСЏС‚СЃСЏ РёР· `ProductSchema.paths`, РІРЅСѓС‚СЂРµРЅРЅРёРµ/ref/composition paths РѕС‚С„РёР»СЊС‚СЂРѕРІР°РЅС‹ deny-list; labels/types mapping РґРµС‚РµСЂРјРёРЅРёСЂРѕРІР°РЅ, entity source allowlist СЃРѕС…СЂР°РЅС‘РЅ СЏРІРЅС‹Рј. Р”РѕР±Р°РІР»РµРЅ unit proof РґР»СЏ РЅРѕРІРѕРіРѕ mock path.
**Gates:** backend tsc PASS; registry unit 1 suite / 2 tests Рё e2e 1 suite / 8 tests PASS; registry ESLint, Prettier Рё diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-304.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-304-registry-schema-autosync.lock`
**NEXT:** idle вЂ” WAVE-DOC-TABLES #1вЂ“#4 DONE; deploy РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ.

## [2026-08-09] вЂ” TZ-DOC-TABLES-303 DONE: Product registry fields + photo slot
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-doc-tables-303
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; deploy РќР•
**Р§С‚Рѕ:** Р РµРµСЃС‚СЂ Product РґРѕРїРѕР»РЅРµРЅ РїРѕР»СЏРјРё РёР· schema SoT (notes/status/RAL/РіР°Р±Р°СЂРёС‚С‹/РЅР°Р·РЅР°С‡РµРЅРёРµ/РјРѕРЅС‚Р°Р¶/С„Р»Р°РіРё) Рё `photoIds` text photo-slot; schema reflection/autosync РѕСЃС‚Р°РІР»РµРЅС‹ TZ-DOC-TABLES-304.
**Gates:** backend tsc PASS; registry e2e 1 suite / 8 tests PASS (baseline had stale 5-source assertion); registry ESLint, Prettier Рё diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-303.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-303-registry-product-fields-photo.lock`
**NEXT:** TZ-DOC-TABLES-304.

## [2026-08-09] вЂ” TZ-DOC-TABLES-302 DONE: dialog overflow-select UX
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-doc-tables-302
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; deploy РќР•
**Р§С‚Рѕ:** РСЃС‚РѕС‡РЅРёРє Рё С‚РёРї СЃС‚РѕР»Р±С†Р° РІ РґРёР°Р»РѕРіРµ С‚Р°Р±Р»РёС†С‹ РёСЃРїРѕР»СЊР·СѓСЋС‚ `PiOverflowSelect` СЃ overlay; РїРѕР»СЏ registry С‡РёС‚Р°РµРјС‹Рµ, СЃ СЏРІРЅС‹Рј empty state; native selects СѓР±СЂР°РЅС‹ РёР· РґРёР°Р»РѕРіР°.
**Gates:** FE tsc PASS; table dialog Jest 1 suite / 41 tests PASS; changed-file ESLint, Prettier Рё diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-302.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-302-table-dialog-overflow-select.lock`
**NEXT:** TZ-DOC-TABLES-303.

## [2026-08-09] вЂ” TZ-DOC-TABLES-301 DONE: Documents TOC + Tables subchips
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-doc-tables-301
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; deploy РќР•
**Р§С‚Рѕ:** Р§РµС‚С‹СЂРµ СЃС‚СЂР°РЅРёС†С‹ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂР° РґРѕРєСѓРјРµРЅС‚РѕРІ РёСЃРїРѕР»СЊР·СѓСЋС‚ С‚С‘РјРЅС‹Р№ Documents TOC; РўР°Р±Р»РёС†С‹ РїРѕР»СѓС‡РёР»Рё Р¶С‘Р»С‚С‹Рµ В«Р’СЃРµ С‚Р°Р±Р»РёС†С‹В»/В«РР· РґР°РЅРЅС‹С…В». `view=from-data` РѕС‚РєСЂС‹РІР°РµС‚ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ registry dialog, Р° `+ РќРѕРІР°СЏ С‚Р°Р±Р»РёС†Р°` РѕСЃС‚Р°С‘С‚СЃСЏ С‚РѕР»СЊРєРѕ РЅР° `view=all`; РґСѓР±Р»РёСЂСѓСЋС‰РёР№ CTA СѓРґР°Р»С‘РЅ.
**Gates:** FE tsc PASS; focused Jest baseline 4 suites / 28 tests в†’ final 4 suites / 29 tests PASS; changed-file ESLint, Prettier Рё diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-301.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-301-documents-toc-tables-subchips.lock`
**NEXT:** TZ-DOC-TABLES-302.

## [2026-08-09] вЂ” TZ-UI-GOLD-332 DONE: light fill gold + gold-deep line role

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE in scoped files; deploy РќР•
**Р§С‚Рѕ:** РЎРІРµС‚Р»РѕРµ Р·РѕР»РѕС‚Рѕ Р·Р°Р»РёРІРєРё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРѕ РјРµР¶РґСѓ РєРЅРѕРїРєРѕР№/С‡РёРїР°РјРё/Р°Р»РёР°СЃР°РјРё; `gold-deep` РѕС‚РґРµР»С‘РЅ РґР»СЏ focus/border/ring/edit/text СЂРѕР»РµР№; С‚СЂРё requested pages and paper-and-ink docs updated.
**Gates:** baseline/final Jest 136 suites / 1276 tests; FE tsc, changed-file ESLint/Prettier, Angular development build, diff-check вЂ” PASS.
**Known limitation:** global `text-sunrise-warm` search retains 22 existing files outside the explicit TZ file list; do not expand scope without PO.
**Archive:** `tasks/_archive/2026-08/TZ-UI-GOLD-332.done.md`
**Lock:** `.mimocode/locks/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.lock`
**NEXT:** TZ-DOC-TABLES-301 READY.

## [2026-08-09] вЂ” TZ-UI-THEME-331 DONE: dark depth + readable gold states

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ invariant `text-on-gold` РґР»СЏ Р·РѕР»РѕС‚С‹С… active/primary СЃРѕСЃС‚РѕСЏРЅРёР№, Р·Р°С‚РµРјРЅРµРЅС‹ Рё РІС‹СЂРѕРІРЅРµРЅС‹ dark surface ladders, РїСЂРёРіР»СѓС€С‘РЅ dark text, РґРѕР±Р°РІР»РµРЅ inset highlight, РёСЃРїСЂР°РІР»РµРЅС‹ selection Рё scrollbar РїСЂР°РІРёР»Р°; РґРѕРєСѓРјРµРЅС‚Р°С†РёСЏ РѕР±РЅРѕРІР»РµРЅР°.
**Gates:** Prettier, changed-file ESLint, FE tsc, full Jest 136 suites / 1276 tests, Angular development build, diff-check вЂ” PASS. Focused requested specs РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‚; `--passWithNoTests` PASS. РљРѕРЅС‚СЂРѕР»СЊРЅС‹Р№ РїРѕРёСЃРє `bg-sunrise-warm text-paper`: 0.
**Archive:** `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md`
**Lock:** `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`
**NEXT:** TZ-UI-GOLD-332 READY; РЅРµ claim РІ СЌС‚РѕРј closeout.

## [2026-08-09] вЂ” TZ-SALES-316 DONE: Create KP template center

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #7
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р¦РµРЅС‚СЂ РЎРѕР·РґР°С‚СЊ РљРџ вЂ” РІС‹Р±РѕСЂ DocumentTemplate, A4 preview zone, deep-link РІ builder. РџРµС‡Р°С‚СЊ 320 РѕСЃС‚Р°С‘С‚СЃСЏ PARKED.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-316.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-316-create-kp-template-center.lock`
**Gates:** FE tsc PASS; Jest 5/5 PASS.
**NEXT:** idle вЂ” WAVE fill done; Р¶РґР°С‚СЊ PO unpark 320; РјРѕР¶РЅРѕ РїСЂРµРґР»РѕР¶РёС‚СЊ РґРµРїР»РѕР№.

## [2026-08-09] вЂ” TZ-SALES-315 DONE: Create KP right inspector

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #6
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РџСЂР°РІР°СЏ РїР°РЅРµР»СЊ РЎРѕР·РґР°С‚СЊ РљРџ: Organization, % РЅР°С†РµРЅРєРё, РѕС†РµРЅРєР° СЃСѓРјРјС‹ (UI), deep-link РІ РѕСЂРіР°РЅРёР·Р°С†РёРё.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-315.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-315-create-kp-inspector.lock`
**Gates:** FE tsc PASS; Jest 4/4 PASS.
**NEXT:** TZ-SALES-316 template center.

## [2026-08-09] вЂ” TZ-SALES-314 DONE: Create KP left product rail

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #5
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р›РµРІС‹Р№ СЂРµР№Р» РёР·РґРµР»РёР№ РЅР° `/proposals/create` (РїРѕРёСЃРє + Р”РѕР±Р°РІРёС‚СЊ С‡РµСЂРµР· ProductsService). Draft РїРѕР·РёС†РёРё вЂ” in-memory `draftLines`, Р±РµР· PATCH quotation. Center РїРѕРєР°Р·С‹РІР°РµС‚ С‡РµСЂРЅРѕРІРёРє.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-314.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-314-create-kp-product-rail.lock`
**Gates:** FE tsc PASS; Jest 3/3 PASS.
**NEXT:** TZ-SALES-315 inspector.

## [2026-08-09] вЂ” TZ-UX-315 DONE: drop pathLabel + dense group chrome

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `PiGroupWorkspace` Р±РѕР»СЊС€Рµ РЅРµ СЂРёСЃСѓРµС‚ eyebrow `pathLabel` (СЂР°Р·РґРµР» = С‚РѕРї-РјРµРЅСЋ); TOC/chips `pt-0` РІРїР»РѕС‚РЅСѓСЋ РїРѕРґ header; jest РЅР° no-render + sticky; СЃРЅСЏС‚С‹ РјС‘СЂС‚РІС‹Рµ `pathLabel=` СЃРѕ СЃС‚СЂР°РЅРёС† РєСЂРѕРјРµ proposals*/create (peer SALES).
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** pi-group-workspace (+spec), 16 pages attr strip, page-chrome docs.
**Gates:** FE tsc PASS; Jest pi-group-workspace 5/5 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-315.done.md`
**Lock:** `.mimocode/locks/TZ-UX-315-drop-pathlabel-dense-chrome.lock`
**NEXT:** TZ-SALES-315 inspector (KP-VITRINE); 314 already DONE peer.

## [2026-08-09] вЂ” TZ-SALES-313 DONE: Р’СЃРµ РљРџ family expand (ex-304)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #4
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РќР° `/proposals` РѕС‚РґРµР»СЊРЅР°СЏ РєРѕР»РѕРЅРєР° РЎРµРјСЊСЏ: expand variants, attach В«РќРµСЃРєРѕР»СЊРєРѕ С„РёСЂРјВ» СЃ UI-РѕС†РµРЅРєРѕР№, РѕС‚РґРµР»СЊРЅС‹Р№ read-only variant dialog, sync+confirm. List СЃРєСЂС‹РІР°РµС‚ variants. SALES-304 РЅРµ РІРѕСЃРєСЂРµС€Р°Р»СЃСЏ; attach РѕСЃС‚Р°С‘С‚СЃСЏ РѕРґРЅРёРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРј API write-path.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** pi-proposals.service (+spec), proposals.page (+spec), proposal-family-attach-dialog, proposal-variant-dialog, page docs.
**Gates:** FE tsc PASS; Jest 31/31 PASS; prettier/eslint PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-313.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-313-all-kp-family-expand.lock`
**NEXT:** idle вЂ” WAVE-KP-VITRINE 310вЂ“316 DONE; TZ-SALES-320 PARKED.

## [2026-08-09] вЂ” TZ-UI-LIGHT-330 DONE: СЃРІРµС‚Р»Р°СЏ С‚РµРјР° Р±РµР· РїРµСЂРµСЃРІРµС‚Р°

РљР°РЅРІР°/raised/rule-strong, РєРЅРѕРїРєРё gold/secondary, РєРѕРЅС‚СѓСЂС‹ РїРѕР»РµР№, muted-Р»РµСЃС‚РЅРёС†Р°; docs paper-and-ink. Build СЂР°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅ С„РёРєСЃРѕРј attach-dialog.

**Archive:** `tasks/_archive/2026-08/TZ-UI-LIGHT-330.done.md`  
**NEXT:** idle / PO visual light+dark; deploy С‚РѕР»СЊРєРѕ РїРѕ РєРѕРјР°РЅРґРµ.

## [2026-08-09] вЂ” TZ-SALES-312 DONE: РѕР±РѕР»РѕС‡РєР° В«РЎРѕР·РґР°С‚СЊ РљРџВ» (3 Р·РѕРЅС‹)

РўСЂС‘С…РєРѕР»РѕРЅРѕС‡РЅС‹Р№ shell `/proposals/create` РїРѕ design-spec: placeholders RU, toggles РЅР° СѓР·РєРѕРј viewport, Deals chrome СЃРѕС…СЂР°РЅС‘РЅ. Р‘РµР· РїРёРєРµСЂР°/СЃРѕС…СЂР°РЅРµРЅРёСЏ/РїРµС‡Р°С‚Рё.

**Archive:** `tasks/_archive/2026-08/TZ-SALES-312.done.md`  
**Lock:** `.mimocode/locks/TZ-SALES-312-create-kp-shell.lock`  
**NEXT:** TZ-SALES-313 (Р’СЃРµ РљРџ+СЃРµРјСЊСЏ) Рё/РёР»Рё 314вЂ“315 РЅР°РїРѕР»РЅРµРЅРёРµ.

## [2026-08-09] вЂ” TZ-SALES-312 DONE: Create РљРџ three-zone shell

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #3
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** `/proposals/create` РїРѕР»СѓС‡РёР» С‚СЂС‘С…Р·РѕРЅРЅС‹Р№ shell (Left/Center/Right) СЃ RU empty-copy РёР· spec 311, toggles РЅР° СѓР·РєРёС… viewport Рё `data-test` РґР»СЏ Jest. Deals TOC + Р¶С‘Р»С‚С‹Рµ chips СЃРѕС…СЂР°РЅРµРЅС‹. Picker/save/template/print вЂ” СЃР»РµРґСѓСЋС‰РёРµ TZ.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `proposal-create.page.ts` + spec, page doc, WAVE/ARCHITECTURE, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 5/5 PASS; prettier/eslint PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-312.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-312-create-kp-shell.lock`
**NEXT:** TZ-SALES-313 (Р’СЃРµ РљРџ + СЃРµРјСЊСЏ) Р·Р°С‚РµРј 314/315.

## [2026-08-09] вЂ” TZ-SALES-311 DONE: Create РљРџ design-spec (3 columns)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #2
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РЈС‚РІРµСЂР¶РґР°РµРјС‹Р№ layout SoT РґР»СЏ `/proposals/create`: desktop Left 280вЂ“320 / Center flex A4 / Right 300вЂ“340; tablet/mobile drawers; РїСѓСЃС‚С‹Рµ RU-С„СЂР°Р·С‹; РєР°СЂС‚Р° Р·РѕРЅ в†’ 312/314/315/316. Page doc + WAVE/ARCHITECTURE РѕР±РЅРѕРІР»РµРЅС‹. Angular-shell РѕСЃС‚Р°С‘С‚СЃСЏ Р·Р° 312.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `docs/ux/kp-create-studio-spec.md`, `docs/pages/proposals-create.page.md`, PAGE-TZ-INDEX, WAVE, ARCHITECTURE, checklist/archive/lock.
**Gates:** docs-only Markdown review PASS; `git diff --check` PASS; product tsc/tests N/A.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-311.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-311-create-kp-design-spec.lock`
**NEXT:** TZ-SALES-312 shell РЎРѕР·РґР°С‚СЊ РљРџ.

## [2026-08-09] вЂ” TZ-SALES-310 DONE: Deals TOC and РљРџ subchips

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-KP-VITRINE #1
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РЎРґРµР»РєРё РїРµСЂРµРІРµРґРµРЅС‹ РЅР° РѕР±С‰РёР№ С‚С‘РјРЅС‹Р№ TOC **РљРџ | Р”РѕРіРѕРІРѕСЂС‹ | Р—Р°РєР°Р·С‹**; РїРѕРґ РљРџ РґРѕР±Р°РІР»РµРЅС‹ Р¶С‘Р»С‚С‹Рµ **РЎРѕР·РґР°С‚СЊ РљРџ | Р’СЃРµ РљРџ**. Р”РѕР±Р°РІР»РµРЅ guarded lazy `/proposals/create` route-stub СЃ Р·Р°РіРѕР»РѕРІРєРѕРј В«РЎРѕР·РґР°С‚СЊ РљРџВ». Contracts/orders РёСЃРїРѕР»СЊР·СѓСЋС‚ С‚РѕС‚ Р¶Рµ TOC СЃ РїСѓСЃС‚С‹Рј Р¶С‘Р»С‚С‹Рј СЂСЏРґРѕРј; СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ `/proposals` Рё quotation API РЅРµ РјРµРЅСЏР»РёСЃСЊ.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** FE navigation/chips/routes, focused chips spec, page docs, PAGE-TZ-INDEX, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 2 suites / 18 tests PASS; Angular development build PASS; Prettier PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-310.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-310-deals-kp-subchips.lock`
**NEXT:** TZ-SALES-311 design-spec `/proposals/create`; full three-zone studio remains 312+.

## [2026-08-09] вЂ” TZ-PHOTO-303 DONE: legacy originals backfill script

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-PERF-PHOTOS #3
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ РёРґРµРјРїРѕС‚РµРЅС‚РЅС‹Р№ `backend/scripts/tz-photo-303-backfill-thumbs.ts` Рё РєРѕРјР°РЅРґР° `pnpm photos:backfill-thumbs`. РЎРєСЂРёРїС‚ РЅР°С…РѕРґРёС‚ СЃС‚Р°СЂС‹Рµ `original` Р±РµР· thumb, СЃРѕР·РґР°С‘С‚ СЃРІСЏР·Р°РЅРЅС‹Р№ Sharp WebP thumb, РїСЂРѕРїСѓСЃРєР°РµС‚ missing/unsupported/broken С„Р°Р№Р»С‹ СЃ Р»РѕРіРѕРј, РЅРµ РјРµРЅСЏРµС‚ Рё РЅРµ СѓРґР°Р»СЏРµС‚ originals. РџРѕРІС‚РѕСЂРЅС‹Р№ Р·Р°РїСѓСЃРє РЅРµ РїР»РѕРґРёС‚ РґСѓР±Р»Рё.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** backend script, focused photo backfill spec, backend package script, checklist/archive/lock.
**Gates:** BE tsc PASS (`--noEmit` Рё build config); focused photos Jest 3 suites / 6 tests PASS; ESLint PASS; `git diff --check` PASS. `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-303.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-303-backfill-thumbs.lock`
**Run:** РёР· `backend/` в†’ `pnpm photos:backfill-thumbs`; live Mongo backfill РЅР°РјРµСЂРµРЅРЅРѕ РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ, РѕРїРµСЂР°С‚РѕСЂ РґРѕР»Р¶РµРЅ РІС‹РїРѕР»РЅРёС‚СЊ РїРѕСЃР»Рµ РїСЂРѕРІРµСЂРєРё РѕРєСЂСѓР¶РµРЅРёСЏ.

## [2026-08-09] вЂ” TZ-PHOTO-302 DONE: catalogue lists use linked thumbs

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-PERF-PHOTOS #2
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ РѕР±С‰РёР№ frontend helper `photoListUrl()`: direct/linked `thumb` РІС‹Р±РёСЂР°РµС‚СЃСЏ РґР»СЏ list/grid, legacy original РѕСЃС‚Р°С‘С‚СЃСЏ fallback. `/products` table+grid, `/materials` list Рё production read-facade order/catalogue thumbs РїРµСЂРµРІРµРґРµРЅС‹ РЅР° helper; `/modules` audit РЅРµ РЅР°С€С‘Р» list-photo surface. Detail/form/lightbox/picker РѕСЃС‚Р°РІР»РµРЅС‹ РЅР° original СЃРѕР·РЅР°С‚РµР»СЊРЅРѕ.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `frontend/src/app/shared/services/photos.service.ts` (+spec), products/materials pages, production read facade, products/materials page docs, checklist/archive/lock.
**Gates:** FE tsc PASS; focused Jest 5 suites / 33 tests PASS; changed FE ESLint PASS; Prettier PASS; `git diff --check` PASS. `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-302.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-302-lists-use-thumb.lock`
**Known:** СЃС‚Р°СЂС‹Рµ original Р±РµР· thumb РґРѕСЂР°Р±Р°С‚С‹РІР°СЋС‚СЃСЏ TZ-PHOTO-303; upload/pickers/business logic/layout/PAGE_SIZE/deploy РЅРµ Р·Р°С‚СЂРѕРЅСѓС‚С‹.

## [2026-08-09] вЂ” TZ-PHOTO-301 DONE: original + lightweight thumb on upload

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-PERF-PHOTOS #1
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Backend `POST /photos/upload` СЃРѕС…СЂР°РЅСЏРµС‚ РѕСЂРёРіРёРЅР°Р» Р±РµР· РїРµСЂРµРєРѕРґРёСЂРѕРІР°РЅРёСЏ Рё СЃРѕР·РґР°С‘С‚ РѕС‚РґРµР»СЊРЅС‹Р№ WebP thumb С‡РµСЂРµР· `sharp` (long side в‰¤320px, quality 80, Р±РµР· enlargement). Thumb СЂРµРіРёСЃС‚СЂРёСЂСѓРµС‚СЃСЏ РґРѕС‡РµСЂРЅРёРј `Photo` СЃ `parentPhotoId`, СЂР°Р·РјРµСЂР°РјРё Рё СЂР°Р·РјРµСЂРѕРј С„Р°Р№Р»Р°; API СЃРѕС…СЂР°РЅСЏРµС‚ РёСЃС…РѕРґРЅС‹Рµ РїРѕР»СЏ РѕС‚РІРµС‚Р° Рё РґРѕР±Р°РІР»СЏРµС‚ `variants.thumb`. РћС€РёР±РєР° РіРµРЅРµСЂР°С†РёРё thumb РѕСЃС‚Р°РІР»СЏРµС‚ РѕСЂРёРіРёРЅР°Р» РґРѕСЃС‚СѓРїРЅС‹Рј Рё Р»РѕРіРёСЂСѓРµС‚ WARN.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `backend/src/modules/photos/*`, `backend/package.json`, `backend/pnpm-lock.yaml`, photo specs, checklist/archive/lock.
**Gates:** BE tsc PASS; photo Jest 2 suites / 4 tests PASS; changed-photo ESLint PASS; full backend Jest 72 suites / 694 tests PASS with one unrelated pre-existing text-block-category failure; `git diff --check` PASS. `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-301.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-301-upload-variants-sharp.lock`
**Known:** TZ-PHOTO-302 РїРµСЂРµРІРѕРґРёС‚ СЃРїРёСЃРєРё РЅР° thumb; TZ-PHOTO-303 РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ СЃС‚Р°СЂС‹Рµ original; UI/pickers/business logic/deploy РЅРµ Р·Р°С‚СЂРѕРЅСѓС‚С‹.

## [2026-08-08] вЂ” TZ-PRODUCTS-309 DONE: СЃРѕСЃС‚Р°РІ РёР·РґРµР»РёСЏ РІ FullEditor С‡РµСЂРµР· ProductBomPanel

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-PRODUCT-EDITOR #2
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р’ edit FullEditor РІСЃС‚СЂРѕРµРЅ С‚РѕС‚ Р¶Рµ `ProductBomPanel`, С‡С‚Рѕ Рё РЅР° РєР°СЂС‚РѕС‡РєРµ РёР·РґРµР»РёСЏ; composition API Рё РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ write-path РїРµСЂРµРёСЃРїРѕР»СЊР·РѕРІР°РЅС‹ Р±РµР· ModuleMaterials. Create mode РїРѕРєР°Р·С‹РІР°РµС‚ СЂСѓСЃСЃРєСѓСЋ РїРѕРґСЃРєР°Р·РєСѓ В«РЎРЅР°С‡Р°Р»Р° СЃРѕС…СЂР°РЅРёС‚Рµ РёР·РґРµР»РёРµ вЂ” Р·Р°С‚РµРј РѕС‚РєСЂРѕР№С‚Рµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ, С‡С‚РѕР±С‹ СЃРѕР±СЂР°С‚СЊ СЃРѕСЃС‚Р°РІВ», Р° РїР°РЅРµР»СЊ РѕРіСЂР°РЅРёС‡РµРЅР° scrollable viewport РІРЅСѓС‚СЂРё РґРёР°Р»РѕРіР°.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `frontend/src/app/pages/products/product-form-dialog.component.ts` Рё spec, `docs/pages/products.page.md`, checklist/archive/lock.
**Gates:** FE tsc PASS; Angular development build PASS; focused Jest form + BOM 32/32 PASS; targeted ESLint PASS; Prettier PASS РґР»СЏ РёР·РјРµРЅС‘РЅРЅС‹С… form-С„Р°Р№Р»РѕРІ; `git diff --check` PASS. `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-309.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-309-composition-in-fulleditor.lock`

## [2026-08-08] вЂ” TZ-PRODUCTS-308 DONE: FullEditor В«РР·РґРµР»РёРµВ» РїР»РѕС‚РЅРµРµ Рё РїРѕРЅСЏС‚РЅРµРµ

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 В· WAVE-PRODUCT-EDITOR #1
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Product FullEditor РїРѕР»СѓС‡РёР» РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёР№ РєР°РЅРѕРЅ В«РР·РґРµР»РёРµВ» Р±РµР· РїРµСЂРµРёРјРµРЅРѕРІР°РЅРёСЏ `Product`/API, С‚СЂРё responsive-РєРѕР»РѕРЅРєРё В«РћСЃРЅРѕРІРЅС‹РµВ» / В«Р¦РµРЅР° Рё СѓС‡С‘С‚В» / В«Р“Р°Р±Р°СЂРёС‚С‹ Рё С†РІРµС‚В», СѓР·РєРёРµ controls РґР»СЏ Р”/РЁ/Р’/РµРґ./РІРµСЃР°/RAL Рё РїРѕР»РЅРѕС€РёСЂРёРЅРЅС‹Рµ РїРѕР»СЏ РѕРїРёСЃР°РЅРёСЏ/С„РѕС‚Рѕ. РЎС‚Р°СЂС‹Р№ hint РїСЂРѕ РїСЂРѕС„РёР»СЊ L СѓРґР°Р»С‘РЅ; composition write-path РЅРµ С‚СЂРѕРіР°Р»СЃСЏ Рё РѕСЃС‚Р°С‘С‚СЃСЏ Р·Р° TZ-PRODUCTS-309.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `frontend/src/app/pages/products/product-form-dialog.component.ts`, focused spec, `docs/pages/products.page.md`, checklist/archive/lock.
**Gates:** FE tsc PASS; Angular development build PASS; focused Jest 24/24 PASS; targeted ESLint PASS; Prettier PASS; `git diff --check` PASS. `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-308.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-308-izdelie-dense-fulleditor.lock`

## [2026-08-08] вЂ” TZ-UX-FORM-307 DONE: СЃРµРєС†РёРё С„РѕСЂРј РґРѕРіРѕРІРѕСЂРѕРІ Рё РІРёРґРѕРІ СЂР°Р±РѕС‚

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-e51db87918 В· WAVE-SHOP-NORTH-B #7
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РџР»РѕСЃРєРёРµ С„РѕСЂРјС‹ РґРѕРіРѕРІРѕСЂР° Рё РІРёРґР° СЂР°Р±РѕС‚ РїРµСЂРµРІРµРґРµРЅС‹ РЅР° РѕР±С‰РёР№ `app-pi-form-section` РІ СЃС‚РёР»Рµ РјР°С‚РµСЂРёР°Р»Р°: В«РћСЃРЅРѕРІРЅС‹Рµ РґР°РЅРЅС‹РµВ», В«РџРѕР·РёС†РёРёВ»/В«Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕВ». Organization FullEditor СѓР¶Рµ РёРјРµР» С‚РѕС‚ Р¶Рµ РїСЂРёРјРёС‚РёРІ Рё kind-C 1120 РїРѕСЃР»Рµ Party wave, РїРѕСЌС‚РѕРјСѓ РЅРµ РґСѓР±Р»РёСЂРѕРІР°Р»СЃСЏ Рё РЅРµ РјРµРЅСЏР»СЃСЏ. Control names, DTO/payload Рё Р±РёР·РЅРµСЃ-Р»РѕРіРёРєР° СЃРѕС…СЂР°РЅРµРЅС‹.
**Gates:** FE tsc PASS; Angular production build PASS (С‚РѕР»СЊРєРѕ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ budget warnings); targeted ESLint PASS; Jest 132 suites / 1247 tests PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-307.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-307-form-sections.lock`
**Known:** РіР»РѕР±Р°Р»СЊРЅС‹Р№ `verify-status.sh` СЃРѕС…СЂР°РЅСЏРµС‚ pre-existing drift 72 legacy kit-era entries; РІРЅРµ frontend TZ. Wave Shop-north B Р·Р°РєСЂС‹С‚Р°, idle; deploy NO.

## [2026-08-08] вЂ” TZ-DESKTOP-SOT-301 DONE: canonical desktop/mcp source of truth

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #7)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р Р°Р·РѕР±СЂР°РЅ РєРѕРЅС„Р»РёРєС‚ `desktop/mcp` vs `desktop/mcp-runtime`: РµРґРёРЅСЃС‚РІРµРЅРЅС‹Рј SoT
РѕСЃС‚Р°РІР»РµРЅ tracked `desktop/mcp`, РЅР° РєРѕС‚РѕСЂС‹Р№ СѓР¶Рµ СѓРєР°Р·С‹РІР°РµС‚ Desktop host. Р’ root desktop
РґРѕР±Р°РІР»РµРЅС‹ `mcp:typecheck`, `mcp:test`, `mcp:check`, Р° README/MCP/INSTALL СЏРІРЅРѕ С„РёРєСЃРёСЂСѓСЋС‚,
С‡С‚Рѕ runtime staging РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ Рё installer/sidecar вЂ” РѕС‚РґРµР»СЊРЅС‹Р№ follow-up. Р§СѓР¶РѕР№
`mcp-runtime` РёР· РґСЂСѓРіРѕРіРѕ worktree РЅРµ РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°Р»СЃСЏ Рё РЅРµ РєРѕРјРјРёС‚РёР»СЃСЏ. РџРѕ РїСѓС‚Рё Р·Р°РєСЂС‹С‚РёСЏ
РїРѕС‡РёРЅРµРЅ stale Desktop shell check Р±РµР· РёР·РјРµРЅРµРЅРёСЏ MCP tools.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `desktop/package.json`, `desktop/src/App.svelte`, `desktop/README.md`,
`desktop/docs/MCP.md`, `desktop/docs/INSTALL.md`, checklist, archive, lock.
**Gates:** `pnpm mcp:check` (typecheck + 69/69), desktop `pnpm typecheck`, `pnpm check`,
`pnpm build`, `git diff --check` вЂ” PASS. deploy NO.
**Archive:** `tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md`
**Lock:** `.mimocode/locks/TZ-DESKTOP-SOT-301-mcp-sot.lock`
**Known:** installer-sidecar packaging is intentionally not added; INN-301 remains PARKED.

## [2026-08-08] вЂ” TZ-ORG-ASSETS-302 DONE: СЂРµРєРІРёР·РёС‚С‹ Рё vault-СЃР»РѕС‚С‹ РІ РїРµС‡Р°С‚РЅРѕРј pipeline

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #6)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РЎСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ `DocumentTemplateService.build()` С‚РµРїРµСЂСЊ РїСЂРёРЅРёРјР°РµС‚ РљРџ/СЃС‡С‘С‚ РєР°Рє
РёСЃС‚РѕС‡РЅРёРє Рё РєР°СЃРєР°РґРёСЂСѓРµС‚ СЃРІСЏР·Р°РЅРЅСѓСЋ stub-РљРџ/РєРѕРЅС‚СЂР°РіРµРЅС‚Р° РґР»СЏ Р·Р°РєР°Р·Р°. РћСЂРіР°РЅРёР·Р°С†РёСЏ-СЌРјРёС‚РµРЅС‚ Р±РµСЂС‘С‚СЃСЏ
РёР· С€Р°Р±Р»РѕРЅР°, Р° registry РїРѕР»СѓС‡РёР» РїРѕР»СЏ `legalAddress`, `ogrnip`, Р±Р°РЅРєРѕРІСЃРєРёРµ/РїРѕРґРїРёСЃР°РЅС‚СЃРєРёРµ
СЂРµРєРІРёР·РёС‚С‹ Рё typed-vault aliases `logoUrl`/`sealUrl`/`signatureUrl`. РќР° СЂРµРЅРґРµСЂРµ assets[]
СЂР°Р·РІРѕСЂР°С‡РёРІР°СЋС‚СЃСЏ РїРѕ СЂРѕР»Рё; РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‰РёР№ СЃР»РѕС‚ РѕСЃС‚Р°РІР»СЏРµС‚ image/seal РїСѓСЃС‚С‹Рј, Р° signature вЂ”
РєР°РЅРѕРЅРёС‡РµСЃРєРёР№ placeholder, Р±РµР· РїР°РґРµРЅРёСЏ. РЎРіРµРЅРµСЂРёСЂРѕРІР°РЅРЅС‹Р№ snapshot СЃРѕС…СЂР°РЅСЏРµС‚ sourceType
`quotation`/`invoice` РІРјРµСЃС‚Рµ СЃ РїСЂРµР¶РЅРёРјРё `order`/`contract`.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `backend/src/modules/document-template/*`, `generated-document/*`,
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

## [2026-08-08] вЂ” TZ-ORG-ASSETS-301 DONE: С‚РёРїРёР·РёСЂРѕРІР°РЅРЅРѕРµ С…СЂР°РЅРёР»РёС‰Рµ logo/seal/signature

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #5)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РЈ РѕСЂРіР°РЅРёР·Р°С†РёРё Р±С‹Р» Р±РµР·С‹РјСЏРЅРЅС‹Р№ `photoIds[]`, РєРѕС‚РѕСЂС‹Р№ РЅРµ РѕС‚РІРµС‡Р°Р» РЅР° РІРѕРїСЂРѕСЃ В«С‡С‚Рѕ
РїРµС‡Р°С‚Р°С‚СЊВ»: РґРѕРєСѓРјРµРЅС‚Сѓ РЅСѓР¶РµРЅ РёРјРµРЅРЅРѕ Р»РѕРіРѕС‚РёРї, РёРјРµРЅРЅРѕ РїРµС‡Р°С‚СЊ Рё РёРјРµРЅРЅРѕ РїРѕРґРїРёСЃСЊ. Р”РѕР±Р°РІР»РµРЅС‹ СЃР»РѕС‚С‹ РїРѕ
СЂРѕР»Рё вЂ” `Organization.assets[]` (`role` в€€ `logo|seal|signature`, `photoId`, `storageUrl`,
mime/СЂР°Р·РјРµСЂ, `uploadedAt`/`uploadedBy`), `PUT /organizations/:id/assets/:role` (multipart
`file`) Рё `DELETE` С‚РѕРіРѕ Р¶Рµ Р°РґСЂРµСЃР°. РЎР»РѕС‚ РѕРґРёРЅ РЅР° СЂРѕР»СЊ: РїРѕРІС‚РѕСЂРЅР°СЏ Р·Р°РіСЂСѓР·РєР° **Р·Р°РјРµРЅСЏРµС‚** С„Р°Р№Р» Рё
СѓРґР°Р»СЏРµС‚ РїСЂРµР¶РЅРµРµ `Photo` (РёРЅР°С‡Рµ РґРёСЃРє РѕР±СЂР°СЃС‚Р°Р» Р±С‹ РјСѓСЃРѕСЂРѕРј РЅР° РєР°Р¶РґРѕР№ Р·Р°РјРµРЅРµ), РёСЃС‚РѕСЂРёРё РІРµСЂСЃРёР№ РЅРµС‚
вЂ” РѕРЅР° РЅРёРєРѕРјСѓ РЅРµ РЅСѓР¶РЅР° Рё РїСѓС‚Р°Р»Р° Р±С‹ В«РєР°РєР°СЏ РїРµС‡Р°С‚СЊ Р°РєС‚СѓР°Р»СЊРЅР°В». РџСѓСЃС‚РѕР№ СЃР»РѕС‚ РЅР° DELETE РѕС‚РІРµС‡Р°РµС‚ 404,
Р° РЅРµ РјРѕР»С‡Р°Р»РёРІС‹Рј СѓСЃРїРµС…РѕРј. **РџРµС‡Р°С‚СЊ РјРµРЅСЏРµС‚ С‚РѕР»СЊРєРѕ admin** вЂ” Рё РЅР° upload, Рё РЅР° remove; РјРµРЅРµРґР¶РµСЂ
СЃР»РѕС‚ Рё РїСЂРµРІСЊСЋ РІРёРґРёС‚, РЅРѕ РІРјРµСЃС‚Рѕ РєРЅРѕРїРѕРє С‡РёС‚Р°РµС‚ В«РџРµС‡Р°С‚СЊ РјРµРЅСЏРµС‚ С‚РѕР»СЊРєРѕ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂВ» (РѕС‚РєР°Р· Р¶РёРІС‘С‚
РІ СЃРµСЂРІРёСЃРµ, UI Р»РёС€СЊ РЅРµ РѕР±РјР°РЅС‹РІР°РµС‚). Multer-РєРѕРЅС„РёРі РІС‹РЅРµСЃРµРЅ РІ
`photos/image-upload.options.ts` Рё РїРµСЂРµРёСЃРїРѕР»СЊР·РѕРІР°РЅ вЂ” Р»РёРјРёС‚ 10 РњР‘ Рё СЃРїРёСЃРѕРє mime РЅРµ СЂР°Р·СЉРµР·Р¶Р°СЋС‚СЃСЏ
СЃ `POST /photos/upload`, Р° СЂРµРіРёСЃС‚СЂР°С†РёСЏ `Photo` РґР°С‘С‚ РіРѕС‚РѕРІСѓСЋ СѓР±РѕСЂРєСѓ С„Р°Р№Р»Р°. Р’РјРµСЃС‚Рµ СЃ С…СЂР°РЅРёР»РёС‰РµРј
РґРѕР±Р°РІР»РµРЅ `legalAddress` (Р±РµР· Р°РґСЂРµСЃР° С€Р°РїРєР° РґРѕРєСѓРјРµРЅС‚Р° РЅРµРїРѕР»РЅР°СЏ вЂ” РґРµС€РµРІР»Рµ СЃРµР№С‡Р°СЃ, С‡РµРј РѕС‚РґРµР»СЊРЅРѕР№
РјРёРіСЂР°С†РёРµР№). РќР° С„СЂРѕРЅС‚Рµ вЂ” СЃРµРєС†РёСЏ В«Р¤Р°Р№Р»С‹ РґР»СЏ РґРѕРєСѓРјРµРЅС‚РѕРІВ» РІ Org FullEditor: С‚СЂРё СЃР»РѕС‚Р° СЃ РїСЂРµРІСЊСЋ,
В«Р—Р°РіСЂСѓР·РёС‚СЊ/Р—Р°РјРµРЅРёС‚СЊ/РЎРЅСЏС‚СЊВ». Р¤Р°Р№Р»С‹ РїРёС€СѓС‚СЃСЏ СЃСЂР°Р·Сѓ (РІ JSON-payload С„Р°Р№Р» РЅРµ РїРѕР»РѕР¶РёС€СЊ), РїРѕСЌС‚РѕРјСѓ
В«РћС‚РјРµРЅР°В» РїРѕСЃР»Рµ СЂР°Р±РѕС‚С‹ СЃ С„Р°Р№Р»Р°РјРё РІСЃС‘ СЂР°РІРЅРѕ РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±РЅРѕРІР»С‘РЅРЅСѓСЋ РѕСЂРіР°РЅРёР·Р°С†РёСЋ вЂ” РёРЅР°С‡Рµ СЃРїРёСЃРѕРє
РїРѕРєР°Р·С‹РІР°Р» Р±С‹ СЃС‚Р°СЂРѕРµ.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `backend/src/modules/organization/organization.schema.ts`,
`organization.service.ts` (+ spec), `organization.controller.ts`, `organization.module.ts`,
`dto/create-organization.dto.ts`, `backend/src/modules/photos/image-upload.options.ts` (РЅРѕРІС‹Р№),
`photos.module.ts`, `backend/test/e2e/organization-assets.e2e-spec.ts` (РЅРѕРІС‹Р№),
`frontend/src/app/shared/services/organizations.service.ts`,
`frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts` (+ spec),
`docs/pages/organizations.page.md`, `ARCHITECTURE.md`, checklist, lock.
**Gates:** BE `tsc --noEmit` С‡РёСЃС‚Рѕ; BE unit organization 19/19; BE e2e
`organization-assets` 6/6 (Р·Р°РјРµРЅР° РЅРµ С‚СЂРѕРіР°РµС‚ СЃРѕСЃРµРґРЅРёР№ СЃР»РѕС‚, seal manager в†’ 403 / admin в†’ 200,
РїРѕРІС‚РѕСЂРЅС‹Р№ DELETE в†’ 404, С‡СѓР¶Р°СЏ РѕСЂРіР°РЅРёР·Р°С†РёСЏ в†’ 404); FE `npm run typecheck` + `npm run build`
PASS; FE `pages/organizations` 20/20; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORG-ASSETS-301.done.md`
**Lock:** `.mimocode/locks/TZ-ORG-ASSETS-301-typed-vault.lock`
**Р“СЂР°Р±Р»Рё/РЅР°С…РѕРґРєРё:** (1) `optimisticLockPlugin` РІСЂСѓС‡РЅСѓСЋ РїРѕРґРЅРёРјР°РµС‚ `__v`, РїРѕСЌС‚РѕРјСѓ Р»СЋР±РѕР№
`doc.save()` СЃ РёР·РјРµРЅС‘РЅРЅС‹Рј РјР°СЃСЃРёРІРѕРј РїР°РґР°РµС‚ `VersionError` вЂ” СЃР»РѕС‚С‹ РїРёС€СѓС‚СЃСЏ `findOneAndUpdate`
(`$set`/`$pull`). РџР»Р°РіРёРЅ С‡СѓР¶РѕР№, С‡РёРЅРёС‚СЊ РµРіРѕ вЂ” РѕС‚РґРµР»СЊРЅР°СЏ TZ. (2) Aggregation-pipeline update
Mongoose РєР°СЃС‚СѓРµС‚ РїРѕ СЃС…РµРјРµ Рё `$concatArrays` С‚РёС…Рѕ РїСЂРµРІСЂР°С‰Р°Р»СЃСЏ РІ РїСѓСЃС‚РѕР№ РјР°СЃСЃРёРІ вЂ” Р·Р°РїРёСЃСЊ СѓС…РѕРґРёР»Р°
В«СѓСЃРїРµС€РЅРѕВ» РІ РЅРёРєСѓРґР°; РїРѕР№РјР°РЅРѕ e2e-С‚РµСЃС‚РѕРј, Р° РЅРµ С‚РёРїР°РјРё. (3) `catalog-314.archive.spec.ts` РЅРµ
РєРѕРјРїРёР»РёСЂРѕРІР°Р»СЃСЏ РїРѕСЃР»Рµ TZ-COST-302 (6-Р№ Р°СЂРіСѓРјРµРЅС‚ `ProductModuleService`) вЂ” РІРµСЃСЊ `tsc` Р±С‹Р»
РєСЂР°СЃРЅС‹Р№, РїРѕРїСЂР°РІР»РµРЅРѕ РґРІСѓРјСЏ СЃС‚СЂРѕРєР°РјРё РјРѕРєР°, С‡С‚РѕР±С‹ РіРµР№С‚ СЃРЅРѕРІР° С‡С‚Рѕ-С‚Рѕ Р·РЅР°С‡РёР».
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** РїСЂРёРІСЏР·РєР° СЃР»РѕС‚РѕРІ Рє РїРµС‡Р°С‚Рё PDF вЂ” `TZ-ORG-ASSETS-302`; SVG РїСЂРёРЅРёРјР°РµС‚СЃСЏ
РєР°Рє Рё СЂР°РЅСЊС€Рµ (РѕР±С‰РёР№ mime-СЃРїРёСЃРѕРє), СЃР°РЅРёС‚РёР·Р°С†РёРё РЅРµС‚; `photoIds[]` Сѓ РѕСЂРіР°РЅРёР·Р°С†РёРё РѕСЃС‚Р°Р»СЃСЏ РєР°Рє
legacy-РіР°Р»РµСЂРµСЏ; unit-С„РµР№Р» `text-block-category.service.spec.ts` (`resolveDefault` в†’ system
В«РћР±С‰РµРµВ») Р±С‹Р» РґРѕ СЌС‚РѕР№ TZ Рё РѕС‚РЅРѕСЃРёС‚СЃСЏ Рє Р·РѕРЅРµ TZ-DOC-315 вЂ” РЅРµ РїСЂР°РІРёР». deploy NO.

## [2026-08-08] вЂ” TZ-ORDERS-306 DONE: РљРџ-Р·Р°РіР»СѓС€РєР° РёР· РїСЂСЏРјРѕРіРѕ Р·Р°РєР°Р·Р°

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #4)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РџСЂСЏРјРѕР№ Р·Р°РєР°Р· СЃРѕР·РґР°С‘С‚СЃСЏ Р±РµР· РљРџ, РїРѕСЌС‚РѕРјСѓ Сѓ РЅРµРіРѕ РЅРµ Р±С‹Р»Рѕ `quotationId` вЂ” Рё РІСЃС‘, С‡С‚Рѕ
РїСЂРѕСЃРёС‚ СЃСЃС‹Р»РєСѓ РЅР° РљРџ, РґР»СЏ С‚Р°РєРѕРіРѕ Р·Р°РєР°Р·Р° Р±С‹Р»Рѕ РЅРµРґРѕСЃС‚РёР¶РёРјРѕ. Р”РѕР±Р°РІР»РµРЅ
`POST /orders/:id/stub-proposal` в†’ `OrderService.ensureStubProposal()`: С‡РµСЂРЅРѕРІРёРє РљРџ РёР· РїРѕР·РёС†РёР№
Р·Р°РєР°Р·Р°, `status: 'draft'`, `isStub: true`, `sourceOrderId` = Р·Р°РєР°Р·, СЃРІСЏР·СЊ РґРІСѓСЃС‚РѕСЂРѕРЅРЅСЏСЏ
(`Order.quotationId` в†” `Quotation.sourceOrderId`). РЎС‚Р°С‚СѓСЃ `converted` РЅРµ РёСЃРїРѕР»СЊР·СѓРµРј: РЅРёРєР°РєРѕР№
РєРѕРЅРІРµСЂС‚Р°С†РёРё РЅРµ Р±С‹Р»Рѕ Рё С†РµРЅС‹ РЅРёРєС‚Рѕ РЅРµ СЃС‡РёС‚Р°Р». Р¤Р»Р°Рі `isStub` РЅСѓР¶РµРЅ, С‡С‚РѕР±С‹ Р·Р°РіР»СѓС€РєР° РЅРµ РІС‹РіР»СЏРґРµР»Р° РІ
СЃРїРёСЃРєРµ РљРџ РєР°Рє РЅР°СЃС‚РѕСЏС‰РµРµ РїРѕСЃС‡РёС‚Р°РЅРЅРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ. РРґРµРјРїРѕС‚РµРЅС‚РЅРѕСЃС‚СЊ: Сѓ Р·Р°РєР°Р·Р° СЃ РљРџ РјРµС‚РѕРґ
РІРѕР·РІСЂР°С‰Р°РµС‚ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРµ СЃ `created: false` вЂ” РґРІР° РєР»РёРєР° в‰  РґРІР° РљРџ; РІРёСЃСЏС‡РёР№ `quotationId`
(РљРџ СѓРґР°Р»РёР»Рё) РїРµСЂРµСЃРѕР·РґР°С‘С‚СЃСЏ СЃ warn РІ Р»РѕРі. РћС‚РєР°Р·С‹ СЏРІРЅС‹Рµ Рё РїРѕ-СЂСѓСЃСЃРєРё: РѕС‚РјРµРЅС‘РЅРЅС‹Р№ Р·Р°РєР°Р· Рё Р·Р°РєР°Р·
Р±РµР· РїРѕР·РёС†РёР№ (РїСѓСЃС‚РѕРµ РљРџ Р±РµСЃРїРѕР»РµР·РЅРѕ РґР»СЏ РґРѕРєСѓРјРµРЅС‚Р°). РћСЂРіР°РЅРёР·Р°С†РёСЋ (В«РєС‚Рѕ РІС‹СЃС‚Р°РІР»СЏРµС‚В») Р±РµСЂС‘Рј С‡РµСЂРµР·
`OrganizationService.findCurrent` вЂ” JWT в†’ `isOurCompany` в†’ РµРґРёРЅСЃС‚РІРµРЅРЅР°СЏ (PARTY-301), Р° РЅРµ
СѓРіР°РґС‹РІР°РµРј, РёРЅР°С‡Рµ РљРџ СѓРµС…Р°Р»Рѕ Р±С‹ РѕС‚ С‡СѓР¶РѕР№ С„РёСЂРјС‹. РќР° РєР°СЂС‚РѕС‡РєРµ Р·Р°РєР°Р·Р° вЂ” С„Р°РєС‚ В«РљРџВ»: В«РќРµС‚ вЂ” РїСЂСЏРјРѕР№
Р·Р°РєР°Р·В» + РєРЅРѕРїРєР° В«РЎРѕР·РґР°С‚СЊ С‡РµСЂРЅРѕРІРёРє РљРџВ», Р»РёР±Рѕ В«в„–QTN-вЂ¦ В· С‡РµСЂРЅРѕРІРёРє-Р·Р°РіР»СѓС€РєР°В» + СЃСЃС‹Р»РєР°.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `backend/src/modules/order/order.service.ts` (+ spec),
`order.controller.ts`, `order.module.ts`, `backend/src/modules/quotation/quotation.schema.ts`
(+`isStub`, +`sourceOrderId`), `backend/test/e2e/orders.e2e-spec.ts`,
`frontend/src/app/pages/orders/order-detail.page.ts` (+ spec), `orders.service.ts` (+ spec),
`docs/pages/orders.page.md`, checklist, lock.
**Gates:** BE tsc РІ Р·РѕРЅРµ С‡РёСЃС‚Рѕ; BE unit 71/71 (order 18); BE e2e orders 7/7 (РЅРѕРІС‹Р№ РєРµР№СЃ: РґРІР°
РІС‹Р·РѕРІР° в†’ РѕРґРёРЅ `quotationId`, Р·Р°РєР°Р· СЃСЃС‹Р»Р°РµС‚СЃСЏ РЅР° РљРџ); FE tsc + development build PASS;
FE pages/orders 21/21; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-306.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-306-stub-proposal.lock`
**Р Р°СЃС€РёСЂРµРЅРёРµ CONFLICT KEYS:** `quotation.schema.ts` (2 РїРѕР»СЏ), `order.module.ts`, e2e Рё unit
spec Р·Р°РєР°Р·Р°. Р’ `_active/` РїР°СЂР°Р»Р»РµР»СЊРЅС‹С… TZ РЅРµС‚ вЂ” РєРѕРЅС„Р»РёРєС‚Р° РЅРµ Р±С‹Р»Рѕ.
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** `BuildDocumentDto` РїРѕ-РїСЂРµР¶РЅРµРјСѓ Р±РµР· `quotationId` вЂ” Р·Р°РіР»СѓС€РєР° РґРµР»Р°РµС‚
РљРџ РґРѕСЃС‚РёР¶РёРјС‹Рј, РЅРѕ РїСЂРёРІСЏР·РєР° РљРџ Рє builder-РґРѕРєСѓРјРµРЅС‚Р°Рј СЌС‚Рѕ РѕС‚РґРµР»СЊРЅРѕРµ TZ; СЃРїРёСЃРѕРє РљРџ РїРѕРєР° РЅРµ
С„РёР»СЊС‚СЂСѓРµС‚ Р·Р°РіР»СѓС€РєРё (С„Р»Р°Рі РµСЃС‚СЊ, UI-С„РёР»СЊС‚СЂР° РЅРµС‚); supply/line-ready РЅРµ С‚СЂРѕРЅСѓС‚С‹; Сѓ Order РЅРµС‚
`organizationId`, tenant РїРѕ-РїСЂРµР¶РЅРµРјСѓ РєРѕСЃРІРµРЅРЅС‹Р№ С‡РµСЂРµР· РєРѕРЅС‚СЂР°РіРµРЅС‚Р°. deploy NO.

## [2026-08-08] вЂ” TZ-PARTY-303 DONE: Counterparty FullEditor + CRUD СЃРѕ СЃС‚СЂР°РЅРёС†С‹

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #3)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РЎС‚СЂР°РЅРёС†Р° В«Р—Р°РєР°Р·С‡РёРєРёВ» Р±С‹Р»Р° read-only, РїРѕСЌС‚РѕРјСѓ РєР»РёРµРЅС‚, СЃРѕР·РґР°РЅРЅС‹Р№ Р±С‹СЃС‚СЂС‹Рј СЃРѕР·РґР°РЅРёРµРј
(РёРјСЏ + С‚РµР»РµС„РѕРЅ + Р°РґСЂРµСЃ, РРќРќ-Р·Р°РіР»СѓС€РєР°), РЅРµР»СЊР·СЏ Р±С‹Р»Рѕ РґРѕРІРµСЃС‚Рё РґРѕ В«РіРѕРґРµРЅ РґР»СЏ РґРѕРєСѓРјРµРЅС‚Р°В»: СЂРµР°Р»СЊРЅС‹Р№
РРќРќ, РљРџРџ/РћР“Р Рќ, Р±Р°РЅРє, РїРѕРґРїРёСЃР°РЅС‚ РЅРµ РёРјРµР»Рё UI РІРѕРѕР±С‰Рµ. Р”РѕР±Р°РІР»РµРЅ FullEditor С‚РѕРіРѕ Р¶Рµ РєР°РЅРѕРЅР°, С‡С‚Рѕ Сѓ
РѕСЂРіР°РЅРёР·Р°С†РёРё: `variant="content"` + `min(1120px, calc(100vw - 2rem))`, СЃРµРєС†РёРё РћСЃРЅРѕРІРЅС‹Рµ /
Р РµРєРІРёР·РёС‚С‹ / Р‘Р°РЅРє / РџРѕРґРїРёСЃР°РЅС‚. РќР° СЃС‚СЂР°РЅРёС†Рµ вЂ” В«+ РЎРѕР·РґР°С‚СЊВ» РІ tools, `app-pi-row-actions` (вњЋ / Г—),
СѓРґР°Р»РµРЅРёРµ С‡РµСЂРµР· `AlertDialogComponent` (РЅР° СЃРµСЂРІРµСЂРµ soft delete, Р·Р°РєР°Р·С‹ РѕСЃС‚Р°СЋС‚СЃСЏ).
Р РѕР»Рё РѕР±СЏР·Р°С‚РµР»СЊРЅС‹ (РёС… С‚СЂРµР±СѓРµС‚ create DTO) Рё С‡РёС‚Р°СЋС‚СЃСЏ РёР· `/counterparty-roles`, С‡С‚РѕР±С‹
РґРѕР±Р°РІР»РµРЅРЅР°СЏ Р°РґРјРёРЅРѕРј СЂРѕР»СЊ Р±С‹Р»Р° РІС‹Р±РёСЂР°РµРјР°; РµСЃР»Рё СЃРїСЂР°РІРѕС‡РЅРёРє РЅРµРґРѕСЃС‚СѓРїРµРЅ вЂ” fallback РЅР° РїРѕСЃРµСЏРЅРЅС‹Р№
РЅР°Р±РѕСЂ, РёРЅР°С‡Рµ СѓРїР°РІС€РёР№ GET Р±Р»РѕРєРёСЂРѕРІР°Р» Р±С‹ СЃРѕС…СЂР°РЅРµРЅРёРµ. `organizationId` СЃ РєР»РёРµРЅС‚Р° РЅРµ СѓС…РѕРґРёС‚ вЂ”
С‚РµРЅР°РЅС‚ С€С‚Р°РјРїСѓРµС‚ СЃРµСЂРІРµСЂ РїРѕСЃР»Рµ PARTY-301, РЅР° СЌС‚Рѕ РµСЃС‚СЊ С‚РµСЃС‚. РџСЂРё РїСЂР°РІРєРµ Р·Р°РєР°Р·С‡РёРєР° СЃ РІСЂРµРјРµРЅРЅС‹Рј
РРќРќ РІ СЂРµРґР°РєС‚РѕСЂРµ РІРёСЃРёС‚ РїРѕРґСЃРєР°Р·РєР°; СЃР°Рј С„Р»Р°Рі СЃРЅРёРјР°РµС‚ СЃРµСЂРІРµСЂ.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts`
(+ spec), `counterparties.page.ts` (+ spec),
`frontend/src/app/shared/services/pi-counterparty.service.ts` (`listRoles()`, `CounterpartyRole`),
`docs/pages/counterparties.page.md` (СЃРѕР·РґР°РЅ), `docs/pages/PAGE-TZ-INDEX.md`, checklist, lock.
**Gates:** FE tsc вЂ” РІ Р·РѕРЅРµ С‡РёСЃС‚Рѕ; Angular development build PASS; counterparty tests 18/18 PASS;
targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-303.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-303-counterparty-fulleditor.lock`
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** РРќРќ-lookup/DaData вЂ” `TZ-INN-301` PARKED; С„РѕС‚Рѕ РєРѕРЅС‚СЂР°РіРµРЅС‚Р° вЂ”
`ASSETS-301`; РѕР±СЉРµРєС‚С‹ (РїР»РѕС‰Р°РґРєРё) Рё РєР°СЂС‚РѕС‡РєР° Р·Р°РєР°Р·С‡РёРєР° вЂ” `ORDERS-303`; СЃРїРёСЃРѕРє Р±РµР· РїРѕРёСЃРєР° Рё
РїР°РіРёРЅР°С†РёРё (limit 200), СЃРѕСЂС‚РёСЂРѕРІРєРё РЅРµС‚; `contactPersonId` Р±РµР· people-picker. Р РµРїРѕ-СѓСЂРѕРІРЅРµРІС‹Р№
`tsc` РїРѕ С‡СѓР¶РёРј spec-С„Р°Р№Р»Р°Рј РєСЂР°СЃРЅС‹Р№ РґРѕ СЌС‚РѕР№ РІРѕР»РЅС‹ вЂ” РЅРµ С‡РёРЅРёР». deploy NO.

## [2026-08-08] вЂ” TZ-PARTY-302 DONE: Organization FullEditor (kind C 1120)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #2)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Р”РёР°Р»РѕРі РѕСЂРіР°РЅРёР·Р°С†РёРё РїРѕРєР°Р·С‹РІР°Р» 7 РїРѕР»РµР№ РёР· ~25, РїРѕСЌС‚РѕРјСѓ СЂРµРєРІРёР·РёС‚С‹, Р±РµР· РєРѕС‚РѕСЂС‹С… РЅРµ
СЃРґРµР»Р°С‚СЊ РґРѕРєСѓРјРµРЅС‚ (Р±Р°РЅРє, Р‘РРљ, СЂ/СЃ, РєРѕСЂСЂ/СЃ, РћР“Р Рќ/РћР“Р РќРРџ, РїРѕРґРїРёСЃР°РЅС‚, РїР°СЃРїРѕСЂС‚ РРџ), РёР· UI Р±С‹Р»Рё
РЅРµРґРѕСЃС‚РёР¶РёРјС‹. РЎРґРµР»Р°РЅ FullEditor РїРѕ РєР°РЅРѕРЅСѓ material/product: `variant="content"` +
`min(1120px, calc(100vw - 2rem))`, СЃРµРєС†РёРё `app-pi-form-section` вЂ” РћСЃРЅРѕРІРЅС‹Рµ / Р РµРєРІРёР·РёС‚С‹ /
Р‘Р°РЅРє / РџРѕРґРїРёСЃР°РЅС‚ / РџР°СЃРїРѕСЂС‚ РРџ. РџР°СЃРїРѕСЂС‚ РїРѕСЏРІР»СЏРµС‚СЃСЏ **С‚РѕР»СЊРєРѕ** РїСЂРё `legalType = ip` Рё РЅРµ
РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РґР»СЏ РћРћРћ. Р®СЂРёРґРёС‡РµСЃРєРёР№ С‚РёРї вЂ” overflow-select (РєР°РЅРѕРЅ РєР°С‚Р°Р»РѕР¶РЅРѕРіРѕ dropdown), РЅРµ
native. В«РќР°С€Р° С„РёСЂРјР°В» Рё В«РђРєС‚РёРІРЅР°В» вЂ” switch; РІ СЃРїРёСЃРєРµ Сѓ РЅР°Р·РІР°РЅРёСЏ Р±РµР№РґР¶ В«РЅР°С€Р° С„РёСЂРјР°В».
РЎС‚Р°СЂС‹Р№ СѓР·РєРёР№ РґРёР°Р»РѕРі СѓРґР°Р»С‘РЅ: РѕРґРёРЅ write-path РЅР° РѕСЂРіР°РЅРёР·Р°С†РёСЋ, Р° РЅРµ В«Р±С‹СЃС‚СЂС‹Р№В» Рё В«РїРѕР»РЅС‹Р№В» СЃ
СЂР°Р·РЅРѕР№ Р»РѕРіРёРєРѕР№. Payload РЅРµ РїРёС€РµС‚ РїСѓСЃС‚С‹Рµ СЃС‚СЂРѕРєРё РІ СЂРµРєРІРёР·РёС‚С‹ (API СЃ `forbidNonWhitelisted`),
РґР°С‚С‹ СѓС…РѕРґСЏС‚ ISO.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts`
(+ spec), `organizations.page.ts` (+ spec), `organization-form-dialog.component.ts` (СѓРґР°Р»С‘РЅ),
`frontend/src/app/shared/services/organizations.service.ts` (`findCurrent()`, РїР°СЃРїРѕСЂС‚/isOurCompany),
`docs/pages/organizations.page.md`, `docs/pages/PAGE-TZ-INDEX.md`, checklist, lock.
**Gates:** FE tsc PASS; Angular development build PASS (РїРѕР№РјР°Р» `type="date"` РІРЅРµ `PiInputType`
вЂ” Р·Р°РјРµРЅРµРЅРѕ РЅР°С‚РёРІРЅС‹Рј input); organizations 13/13 PASS; targeted ESLint 0 errors; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-302.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-302-org-fulleditor.lock`
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** Р»РѕРіРѕС‚РёРї/РїРµС‡Р°С‚СЊ/С„РѕС‚Рѕ вЂ” `TZ-ORG-ASSETS-301` (typed vault), РІ РґРёР°Р»РѕРіРµ
`photoIds` РЅРµ С‚СЂРѕРіР°РµРј; `contactPersonId` РїРѕРєР° Р±РµР· people-picker; РРќРќ-lookup вЂ” `TZ-INN-301` PARKED;
СЃРѕСЂС‚РёСЂРѕРІРєР° СЃРїРёСЃРєР° РїРѕ-РїСЂРµР¶РЅРµРјСѓ С‚РѕР»СЊРєРѕ РїРѕ С‚РµРєСѓС‰РµР№ СЃС‚СЂР°РЅРёС†Рµ. deploy NO.

## [2026-08-08] вЂ” TZ-PARTY-301 DONE: party hygiene (tenant В· soft-delete В· INN В· stub badge)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor, WAVE-PARTY-DOCS #1)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** РљРѕРЅС‚СЂР°РіРµРЅС‚С‹ Рё РѕСЂРіР°РЅРёР·Р°С†РёРё РїРµСЂРµСЃС‚Р°Р»Рё Р±С‹С‚СЊ РґС‹СЂРѕР№ РІ multi-tenant. `organizationId`/`isSystem`
Р±РѕР»СЊС€Рµ РЅРµ С‡РёС‚Р°СЋС‚СЃСЏ РёР· body (mass-assign guard) вЂ” С‚РѕР»СЊРєРѕ РёР· JWT, РІ С‚.С‡. РІ quick-create. Р§СѓР¶РѕР№
Counterparty/Organization РѕС‚РґР°С‘С‚ **404**, Р° РЅРµ 403 (IDOR Р·Р°РєСЂС‹С‚), Р·Р°РїРёСЃРё Р±РµР· `organizationId`
РѕСЃС‚Р°СЋС‚СЃСЏ РѕР±С‰РёРјРё legacy. `deletedAt` РґРѕР±Р°РІР»РµРЅ РІ РѕР±Рµ СЃС…РµРјС‹ вЂ” РґРѕ СЌС‚РѕРіРѕ `remove()` РїРёСЃР°Р» РїРѕР»Рµ, РєРѕС‚РѕСЂРѕРіРѕ
РЅРµС‚ РІ schema, Рё strict-mode РјРѕР»С‡Р° РµРіРѕ РІС‹РєРёРґС‹РІР°Р»: В«СѓРґР°Р»С‘РЅРЅС‹Р№В» РєРѕРЅС‚СЂР°РіРµРЅС‚ РѕСЃС‚Р°РІР°Р»СЃСЏ РІ СЃРїРёСЃРєРµ.
Р“Р»РѕР±Р°Р»СЊРЅС‹Р№ unique РЅР° `Counterparty.inn` СЃРЅСЏС‚ (РїРµСЂРІС‹Р№ tenant В«Р·Р°РЅРёРјР°Р»В» РРќРќ СЂРµР°Р»СЊРЅРѕР№ РєРѕРјРїР°РЅРёРё РґР»СЏ
РІСЃРµС…) вЂ” СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ per-tenant С‡РµСЂРµР· compound `{organizationId, inn}` sparse unique + РјРёРіСЂР°С†РёСЏ СЃ
РѕС‚С‡С‘С‚РѕРј РєРѕР»Р»РёР·РёР№. Quick-created РРќРќ РїРѕРјРµС‡Р°РµС‚СЃСЏ `innIsStub`, РЅР° `/counterparties` Р±РµР№РґР¶ В«РІСЂРµРјРµРЅРЅС‹Р№В»
Рё СЃС‡С‘С‚С‡РёРє РІ С‚СѓР»Р±Р°СЂРµ; СЂСѓС‡РЅРѕР№ РІРІРѕРґ РРќРќ СЃРЅРёРјР°РµС‚ С„Р»Р°Рі. Р”Р»СЏ РґРѕРєСѓРјРµРЅС‚РѕРІ РїРѕСЏРІРёР»Р°СЃСЊ В«РЅР°С€Р° С„РёСЂРјР°В»:
`Organization.isOurCompany` + `GET /organizations/current` (JWT-org в†’ С„Р»Р°Рі в†’ РµРґРёРЅСЃС‚РІРµРЅРЅР°СЏ Org в†’
РёРЅР°С‡Рµ 404 СЃ РїРѕРґСЃРєР°Р·РєРѕР№ РЅР°СЃС‚СЂРѕРёС‚СЊ, Р±РµР· СѓРіР°РґС‹РІР°РЅРёСЏ).
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `backend/src/modules/counterparty/*` (service/controller/schema/spec),
`backend/src/modules/organization/*` (service/controller/schema/dto + РЅРѕРІС‹Р№ spec),
`backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts` (+ spec),
`frontend/src/app/pages/counterparties/counterparties.page.ts` (+ spec),
`frontend/src/app/shared/services/pi-counterparty.service.ts`, ARCHITECTURE.md, checklist, lock.
**Gates:** backend tsc PASS; backend jest 31/31 (counterparty, organization, migration) PASS;
targeted ESLint 0 errors; frontend tsc PASS; Angular development build PASS; counterparties.page 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PARTY-301.done.md`
**Lock:** `.mimocode/locks/TZ-PARTY-301-party-hygiene.lock`
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** `Organization.inn` РѕСЃС‚Р°С‘С‚СЃСЏ РіР»РѕР±Р°Р»СЊРЅРѕ unique (Org = СЃР°Рј tenant,
single-org РїРѕР»РёС‚РёРєР°). РњРёРіСЂР°С†РёСЏ Р·Р°РїСѓСЃРєР°РµС‚СЃСЏ РІСЂСѓС‡РЅСѓСЋ (`npx ts-node backend/src/database/migrations/2026-08-08-TZ-PARTY-301-party-hygiene.ts`),
РЅРµ bootstrap-hook. FullEditor РєР°СЂС‚РѕС‡РµРє вЂ” TZ-PARTY-302/303; undelete UI РІРЅРµ TZ. deploy NO.

## [2026-08-08] вЂ” TZD-30 DONE: MCP text-block drafts + category shelves

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-d782972d63 (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE; deploy РќР•
**Р§С‚Рѕ:** Desktop MCP РїРѕР»СѓС‡РёР» list РєР°С‚РµРіРѕСЂРёР№/Р±Р»РѕРєРѕРІ, СЏРІРЅРѕРµ СЃРѕР·РґР°РЅРёРµ TextBlockCategory Рё create-draft: `categoryId` РѕР±СЏР·Р°С‚РµР»РµРЅ, РёРјСЏ `Р§РµСЂРЅРѕРІРёРє РР вЂ” вЂ¦`, `isActive=false`, `ai-draft`, pre-check РґСѓР±Р»РµР№, РїРѕРЅСЏС‚РЅС‹Р№ 409 Р±РµР· overwrite. РџРѕСЃР»Рµ СЃРѕР·РґР°РЅРёСЏ СЃРѕР·РґР°С‘С‚СЃСЏ todo СЃРѕ СЃСЃС‹Р»РєРѕР№ `/doc-constructor/texts?editId=<id>`; РѕС€РёР±РєР° todo РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РєР°Рє `todoError`. РџРѕР»СЏ `notes` РЅРµС‚.
**Р—Р°С‚СЂРѕРЅСѓС‚Рѕ:** `desktop/mcp/src/text-block-tools.ts`, `desktop/mcp/src/text-block-tools.test.ts`, `desktop/mcp/src/tools.ts`, `docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md`, checklist/status/active task.
**Gates:** MCP test 69/69 PASS; MCP tsc PASS; `git diff --check` PASS.
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** TextBlock Р±РµР· `organizationId`; idempotency-key Рё sync `mcp` в†’ `mcp-runtime` РѕСЃС‚Р°СЋС‚СЃСЏ follow-up/packaging gate; deploy NO.

## [2026-08-08] вЂ” TZ-CATALOG-337 DONE: material-detail A+ shell

**Р§С‚Рѕ:** `/materials/:id` РїРѕР»СѓС‡РёР» sibling-РєР°СЂРєР°СЃ product/module: `PiPageChrome` crumbs, sticky left hero + FACT-304 passport + Photo/Price accordion, right where-used + stock. Populated photo cover/gallery Рё empty state; Р±РµР· `ProductBomPanel`, composition-tree, backend/API Рё ModuleMaterials.
**Gates:** FE tsc PASS; Angular development build PASS; material-detail 6/6 PASS; targeted ESLint/Prettier PASS; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-337.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-337-material-detail-a-plus.lock`
**Known:** dimensions normalization вЂ” РѕС‚РґРµР»СЊРЅС‹Р№ thin follow-up; substitute graph РІРЅРµ scope; desktop/orders/supply/products.page РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ; deploy NO.

## [2026-08-08] вЂ” TZ-UX-FACT-304 DONE: material-detail passport FactStack

**Р§С‚Рѕ:** material detail passport РїРµСЂРµРІРµРґС‘РЅ СЃ РїР»РѕС‚РЅРѕРіРѕ `dl` РЅР° shared FactStack: РёРґРµРЅС‚РёС„РёРєР°С†РёСЏ, РєР°С‚РµРіРѕСЂРёСЏ, РµРґРёРЅРёС†Р°, С‚РёРї, РїСЂРѕС„РёР»СЊ, СЃС‚Р°РЅРґР°СЂС‚, РјР°СЂРєР°, РІРµСЃ, РіР°Р±Р°СЂРёС‚С‹; С†РµРЅР° РїРѕР»СѓС‡РёР»Р° caption В«Р—Р°РєСѓРїРѕС‡РЅР°СЏ / СѓС‡С‘С‚РЅР°СЏ С†РµРЅР° РјР°С‚РµСЂРёР°Р»Р°В». Dimensions table, stock link Рё where-used СЃРѕС…СЂР°РЅРµРЅС‹; material adoption audit = ADOPTED.
**Gates:** FE tsc PASS; material-detail 6/6 PASS; targeted ESLint PASS; `git diff --check` PASS. Prettier check РѕС‚РјРµС‡РµРЅ РєР°Рє line-ending-only mismatch: СЂРµРїРѕР·РёС‚РѕСЂРёР№ CRLF, config С‚СЂРµР±СѓРµС‚ LF.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-304-material-detail-factstack.lock`
**Known:** A+ chrome/layout вЂ” СЃР»РµРґСѓСЋС‰РёР№ `TZ-CATALOG-337`; dimensions-normalize utility РЅРµ РЅР°Р№РґРµРЅ РІ materials-Р·РѕРЅРµ Рё РЅРµ РІРєР»СЋС‡С‘РЅ. Desktop/orders/supply/products.page/composition РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ; deploy NO.

## [2026-08-08] вЂ” TZ-UX-DIALOG-303 DONE: add-and-continue composition pickers

**Р§С‚Рѕ:** composition picker `onAdded` вЂ” Add РїРёС€РµС‚ СЃС‚СЂРѕРєСѓ Рё РѕСЃС‚Р°РІР»СЏРµС‚ РґРёР°Р»РѕРі; session list; BomPanel `applyCompositionLine`; toast В«Р”РѕР±Р°РІР»РµРЅРѕВ»; docs РєР°РЅРѕРЅ.
**Gates:** FE tsc PASS; composition-picker + bom-panel 15/15; ESLint/Prettier PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-303-add-and-continue.lock`
**Known:** photo multi-add в†’ DIALOG-304; FACT-303/orders/desktop/supply РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ.

## [2026-08-08] вЂ” TZ-UX-FACT-303 DONE: order-detail FactStack

**Р§С‚Рѕ:** order passport migrated to shared FactStack facts; materials selector remains in actions slot; order money stays absent.
**Gates:** FE tsc PASS; order-detail 4/4; targeted ESLint/Prettier + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-303-order-detail-factstack.lock`

## [2026-08-08] вЂ” TZ-SALES-302 DONE: immutable quotation versions

**Р§С‚Рѕ:** atomic freeze with immutable embedded snapshots (lines, totals, family/template metadata, actor), version list/detail APIs, and proposals-page freeze/history UI.
**Gates:** BE tsc PASS; BE quotation 25/25; FE tsc PASS; FE proposals 16/16; targeted ESLint/Prettier + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-302.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-302-kp-send-versions.lock`
**Known:** email/PDF outbox remains later scope.

## [2026-08-08] вЂ” TZ-UI-TYPE-303 DONE: content label 13px (pi-label)

**Р§С‚Рѕ:** `--text-label` + `.pi-label`; table th / fact / passport names off eyebrow; sort glyph text-xs; eyebrow = compact chrome only.
**Gates:** FE tsc PASS; jest fact-card+pi-table+module-detail 29/29.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-303.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-303-content-label.lock`
**Known:** FACT-303 shared fact-card key вЂ” label class only; Adoption section kept.

## [2026-08-08] вЂ” TZ-UI-COLOR-301 DONE: contrast light+dark P0/P1

**Р§С‚Рѕ:** badge ink+gold-soft / success / paper-2; table selected fill; gantt zebra paper-2; surface dark; docs sync.
**Gates:** FE tsc PASS; jest badge+pi-table 40/40.
**Archive:** `tasks/_archive/2026-08/TZ-UI-COLOR-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-COLOR-301-contrast-light-dark.lock`
**Known:** PO eyeball `/modules/:id` + table light/dark; WAVE-UI-TYPE-COLOR complete.

## [2026-08-08] вЂ” TZ-UI-TYPE-302 DONE: type scale hotspots

**Р§С‚Рѕ:** nav 11px; tree badge/depth/chevron on ERP ladder; fact mono text-sm; titles already aligned.
**Gates:** FE tsc PASS; jest 22/22 (tree/fact/nav/module-detail).
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-302.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-302-type-scale-hotspots.lock`
**Known:** order-detail title в†’ successor; next COLOR-301.

## [2026-08-08] вЂ” TZ-UI-TYPE-301 DONE: ERP type scale canon

**Р§С‚Рѕ:** CSS tokens `--text-micro`/`--text-title`; `.eyebrow`+`.pi-tech-label` = 11px; design-spec + foundations hint = Hanken/Inter/JetBrains + 5 roles.
**Gates:** FE tsc PASS; docs sync; В«ERP type scaleВ» marker in styles.css.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TYPE-301-type-scale-canon.lock`
**Known:** page hotspots в†’ TYPE-302; contrast в†’ COLOR-301.

## [2026-08-08] вЂ” TZ-ORDERS-305 DONE: soft materials source gate

**Р§С‚Рѕ:** `materialsSource=own|customer` persists on Order; order detail selector + non-blocking own-materials warning when ready lines lack confirmed supply.
**Gates:** BE+FE tsc PASS; BE order 15/15; FE order 9/9; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-305.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-305-materials-source.lock`
**Known:** confirmed supply lookup is best-effort; exact stock remains INVENTORY-301.

## [2026-08-08] вЂ” TZ-ORDERS-304 DONE: line ready-for-work gate

**Р§С‚Рѕ:** line-level `readyForWork` + audit metadata, validated toggle API, and order-detail control; ordinary line updates preserve readiness metadata.
**Gates:** BE+FE tsc PASS; BE order 14/14; FE order 9/9; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-304.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-304-line-ready.lock`
**Known:** readiness is available for order lines; module-specific persisted readiness remains a later refinement.

## [2026-08-08] вЂ” TZ-SUPPLY-302 DONE: BOM explode в†’ SupplyTasks

**Р§С‚Рѕ:** `POST /supply-tasks/explode` recursively expands order/module BOM, aggregates materials, creates idempotent draft tasks; `/supply` gets В«РЎРѕР·РґР°С‚СЊ РёР· Р·Р°РєР°Р·Р°В».
**Gates:** BE+FE tsc PASS; BE supply 7/7; FE supply 3/3; targeted ESLint + diff check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SUPPLY-302.done.md`
**Lock:** `.mimocode/locks/TZ-SUPPLY-302-bom-explode-tasks.lock`
**Known:** no auto-confirm / PO creation; concurrent safety uses unique open-task index.

## [2026-08-08] вЂ” TZD-29 DONE: manager import todos (wave #7 вЂ” WAVE COMPLETE)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** BE `backend/src/modules/import-todo/**` (NEW) вЂ” `import_todos` schema (title/body?/href?/importTaskId?/templateId?/org?/createdByUserId/status open|done), REST POST/GET?status=/PATCH :id, RBAC admin|manager, org-scope РєР°Рє import-tasks; seed pages admin+manager. MCP `kppdf_import_todo_create|list|set_status` (tools.ts). FE thin page `/import-todos` (PiGroupWorkspace chrome, С„РёР»СЊС‚СЂС‹ Р’СЃРµ/РћС‚РєСЂС‹С‚С‹Рµ/Р’С‹РїРѕР»РЅРµРЅРЅС‹Рµ, В«Р“РѕС‚РѕРІРѕВ» PATCH done, href link, DatePipe); nav Р”РѕРєСѓРјРµРЅС‚С‹ В«Р—Р°РґР°С‡Рё РёРјРїРѕСЂС‚Р°В»; docs page.md + PAGE-TZ-INDEX + MCP.md + FEATURE checklist + WAVE checkpoint DONE.
**Gates:** BE tsc PASS; jest import-todo 3/3; MCP test 62/62; MCP tsc PASS; FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-29.done.md`
**Lock:** `.mimocode/locks/TZD-29-manager-import-todos.lock`
**Known:** Deploy NO. **Р’РѕР»РЅР° desktop bulk-import Р—РђРљР Р«РўРђ (РІСЃРµ 7 TZ РЅР° main). NEXT idle.**

## [2026-08-08] вЂ” TZD-28 DONE: doc-constructor MCP drafts (wave #6)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** NEW `desktop/mcp/src/doc-tools.ts` вЂ” `kppdf_doc_types_list`/`kppdf_doc_template_categories_list`/`kppdf_doc_templates_list` (GET) + `kppdf_doc_template_create_draft` (isActive=false, isDefault=false, notes `[AI-DRAFT]вЂ¦`, **Р±РµР·** set-default); doc-draft protocol РІ MCP.md (в†’ id РІ todo TZD-29).
**Gates:** MCP tsc PASS; MCP test 60/60 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-28.done.md`
**Lock:** `.mimocode/locks/TZD-28-doc-constructor-mcp.lock`
**Known:** Deploy NO. Next TZD-29 (manager import todos).

## [2026-08-08] вЂ” TZD-27 DONE: journal product.create/update (wave #5)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `MUTATION_KINDS` += product.create|product.update (proposeв†’confirmв†’undo, org scope, **РЅРµ** ProductService РґРѕ confirm); MCP `kppdf_propose_product_create|_update`, `kppdf_validate_product`, domain schema product; `aiReport.rows[].entity` РІРµС‚РєР° РІ apply_plan (С‚РѕС‚ Р¶Рµ batch); MCP.md product path protocol.
**Gates:** BE tsc PASS; jest journal+import-task 27/27; MCP test 58/58; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-27.done.md`
**Lock:** `.mimocode/locks/TZD-27-journal-product-writes.lock`
**Known:** Deploy NO. Next TZD-28 (doc-constructor MCP).

## [2026-08-08] вЂ” TZD-19 DONE: MCP product graph + integrity (wave #4)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** 5 graph read tools (composition/where_used: products/modules/materials) + `kppdf_run_integrity_suite` (read-only smoke, sample ids) + `kppdf_list_modules`; graph protocol РІ MCP.md РїРµСЂРµРґ product.update / mass material.update.
**Gates:** MCP tsc PASS; MCP test 51/51 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-19.done.md`
**Lock:** `.mimocode/locks/TZD-19-mcp-graph-integrity.lock`
**Known:** Deploy NO. Next TZD-27 (journal product.*).

## [2026-08-08] вЂ” TZD-18 DONE: batch propose/confirm + scaled ImportTask (wave #3)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `POST /api/mutation-journal/propose-batch|confirm-batch|cancel-batch` (all-or-nothing + idempotencyKey); MCP `kppdf_propose_material_batch`/`confirm_batch`/`cancel_batch`; `apply_plan` С‡Р°РЅРєР°РјРё РїРѕ 100; ImportTask cap 500в†’2000; inbox limit/offset.
**Gates:** BE tsc PASS; jest journal+import-task 22/22; MCP test 47/47; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-18.done.md`
**Lock:** `.mimocode/locks/TZD-18-mcp-batch-scale.lock`
**Known:** Deploy NO. Next TZD-19 (graph).

## [2026-08-08] вЂ” TZD-26 DONE: columns ready/unfit + AI reshape (wave #2)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `kppdf_inbox_classify_columns` (canonical|unknown|conflict, mapping, sample) + `PATCH /api/import-tasks/:id/rows` (`kppdf_import_task_reshape`; С‚РѕР»СЊРєРѕ pre-apply; СЃР±СЂРѕСЃ aiReport в†’ re-match; 0 journal); protocol Column ready/reshape РІ MCP.md; FEATURE checklist В§E.
**Gates:** BE tsc PASS; jest import-task 12/12; MCP test 44/44; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-26.done.md`
**Lock:** `.mimocode/locks/TZD-26-column-ready-reshape.lock`
**Known:** Deploy NO. Next TZD-18 (batch).

## [2026-08-08] вЂ” TZD-23 DONE: AI matching + HITL plan в†’ propose (wave #1)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** buffy-desktop-ex (Freebuff desktop executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** BE `PATCH /api/import-tasks/:id/report` (aiReport+awaiting_user; whitelist вЂ” rows intact) + `/proposals` (proposalIds+applying); MCP `kppdf_import_task_set_report` (0 journal) + `kppdf_import_task_apply_plan` (userOk gate; new/updateв†’propose, skip/doubtвЂ”РЅРµС‚); MCP.md Variant C protocol; FEATURE checklist В§E.
**Gates:** BE tsc PASS; jest import-task 10/10; MCP test 38/38; MCP tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZD-23.done.md`
**Lock:** `.mimocode/locks/TZD-23-ai-import-matching-hitl.lock`
**Known:** Deploy NO. Next TZD-26 (reshape).

## [2026-08-08] вЂ” TZ-UX-FACT-302 DONE: FactCard site adoption audit

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** docs-only adoption audit; successors FACT-303вЂ¦306.
**Gates:** N/A (docs).
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-302-fact-card-site-audit.lock`
**Known:** Deploy NO. Wave complete В· idle.

## [2026-08-08] вЂ” TZ-UX-DETAIL-304 DONE: module detail parity

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** passport FactCards; cost РІ Р°РєРєРѕСЂРґРµРѕРЅРµ СЃ captions; shared BomPanel inspector.
**Gates:** FE tsc PASS; Jest module-detail 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-304-module-detail-parity.lock`
**Known:** Deploy NO. Next FACT-302.

## [2026-08-08] вЂ” TZ-UX-DETAIL-303 DONE: bom inspector FactCards

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** inspector FactStack; PiButton Edit/Open/Remove/Reload; FormDialog РїРѕ kind.
**Gates:** FE tsc PASS; Jest product-bom-panel 5/5 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-303-bom-inspector-fact-cards.lock`
**Known:** Deploy NO. Next DETAIL-304.

## [2026-08-08] вЂ” TZ-UX-DETAIL-302 DONE: cost panel vertical + autorecalc

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** С†РµРЅС‹+captions; РІРµСЂС‚РёРєР°Р»СЊРЅС‹Р№ Р¶СѓСЂРЅР°Р»; auto-recalc 400ms РЅР° BomPanel.changed.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-302-cost-panel-vertical-autorecalc.lock`
**Known:** Deploy NO. Next DETAIL-303.

## [2026-08-08] вЂ” TZ-UX-DETAIL-301 DONE: product passport cleanup

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** СѓР±СЂР°РЅС‹ в‚Ѕ-РїР»РёС‚РєРё РёР· hero; dims/РІРµСЃ/RAL С‡РµСЂРµР· FactCard; В«Р’ СЃРѕСЃС‚Р°РІРµВ» meta.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DETAIL-301-product-passport-cleanup.lock`
**Known:** Deploy NO. Next DETAIL-302.

## [2026-08-08] вЂ” TZ-UX-310 DONE: chrome drift audit

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** docs-only audit pathв†’chrome PASS/FAIL; successors UX-313вЂ¦315.
**Gates:** N/A (docs).
**Archive:** `tasks/_archive/2026-08/TZ-UX-310.done.md`
**Lock:** `.mimocode/locks/TZ-UX-310-design-system-chrome-audit.lock`
**Known:** Deploy NO. Phase B в†’ DETAIL-301.

## [2026-08-08] вЂ” TZ-UX-309 DONE: page chrome unify

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** supply/shipping/design/documents в†’ PiGroupWorkspace pathLabel+chips; docs/pages/ui-page-chrome.md.
**Gates:** FE tsc PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-309.done.md`
**Lock:** `.mimocode/locks/TZ-UX-309-page-chrome-unify.lock`
**Known:** Deploy NO. Next UX-310.

## [2026-08-08] вЂ” TZ-CATALOG-DEDUP-304 DONE: detail edit opener

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** product/material detail В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊВ» в†’ С‚РѕС‚ Р¶Рµ FullEditor/MaterialForm, С‡С‚Рѕ СЃРїРёСЃРѕРє; reload РїРѕСЃР»Рµ close.
**Gates:** FE tsc PASS; Jest material-detail 6/6 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-304.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-304-detail-edit-opener.lock`
**Known:** Deploy NO. Next UX-309.

## [2026-08-08] вЂ” TZ-UX-FORM-306 DONE: Module QuickCreate L + BomPanel

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** module L РїРѕСЃР»Рµ create РѕСЃС‚Р°С‘С‚СЃСЏ РѕС‚РєСЂС‹С‚С‹Рј СЃ ProductBomPanel rootKind=module; В«Р“РѕС‚РѕРІРѕВ»; product L РЅРµ СЃР»РѕРјР°РЅ.
**Gates:** FE tsc PASS; Jest quick-create-dialog 14/14 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-306.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-306-module-quickcreate-L-bom.lock`
**Known:** Deploy NO. Next DEDUP-304.

## [2026-08-08] вЂ” TZ-CATALOG-DEDUP-303 DONE: delete orphan CompositionEditor

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** СѓРґР°Р»С‘РЅ unused CompositionEditor (+spec); composition-tree / BomPanel РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE tsc PASS; Jest composition 15/15 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-303.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-303-delete-orphan-composition-editor.lock`
**Known:** Deploy NO. Next FORM-306.

## [2026-08-08] вЂ” TZ-CATALOG-DEDUP-302 DONE: retire ModuleMaterials dialog

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** СѓР±СЂР°РЅР° РєРЅРѕРїРєР° В«Р‘С‹СЃС‚СЂРѕРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµВ» СЃ module-detail; СѓРґР°Р»С‘РЅ ModuleMaterialsFormDialog (+spec). РЎРѕСЃС‚Р°РІ РјРѕРґСѓР»СЏ = С‚РѕР»СЊРєРѕ BomPanel.
**Gates:** FE tsc PASS; Jest modules zone 9/9 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-302.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-302-retire-module-materials-dialog.lock`
**Known:** Deploy NO. Next DEDUP-303.

## [2026-08-08] вЂ” TZ-UX-FACT-301 DONE: PiFactCard + FactStack UI kit

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** shared `app-pi-fact-card` / `app-pi-fact-stack` (labelВ·valueВ·captionВ·actions; variants). Docs + jest. Product-detail **РЅРµ** РїРѕРґРєР»СЋС‡Р°Р»Рё.
**Gates:** FE tsc PASS; Jest fact-card 3/3 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FACT-301-pi-fact-card.lock`
**Known:** Deploy NO. Wiring в†’ DETAIL-301+.

## [2026-08-08] вЂ” TZ-UX-313 DONE: catalog detail smart back

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `CatalogReturnStore` (previousUrl + Location.back/fallback); wire product/module/material detail; label В«в†ђ РќР°Р·Р°РґВ» РїСЂРё referrer; docs page-chrome В§ Р’РѕР·РІСЂР°С‚. РќРµ С‚СЂРѕРіР°Р»Рё supply/desktop/PRODUCTS-307.
**Gates:** FE tsc PASS; Jest catalog-return + module-detail + material-detail 19/19 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-313.done.md`
**Lock:** `.mimocode/locks/TZ-UX-313-catalog-smart-back.lock`
**Known:** Deploy NO. Crumbs remain structural.

## [2026-08-08] вЂ” TZ-UX-312 DONE: composition-tree larger thumb + denser row

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** thumb `w-9 h-9` (36px); row `min-h-11 px-1.5 py-1 gap-1`; line-clamp-2 СЃРѕС…СЂР°РЅС‘РЅ. Nest/BomPanel/QC/DEDUP РЅРµ С‚СЂРѕРіР°Р»Рё.
**Gates:** FE tsc PASS; Jest composition-tree 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-312.done.md`
**Lock:** `.mimocode/locks/TZ-UX-312-composition-tree-thumb-density.lock`
**Known:** Deploy NO.

## [2026-08-08] вЂ” TZ-CATALOG-DEDUP-301 DONE: strip composition from Product FullEditor

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** FullEditor = РїР°СЃРїРѕСЂС‚/С„РѕС‚Рѕ/RAL; BOM UI Рё composition sync СѓРґР°Р»РµРЅС‹; hint РЅР° РєР°СЂС‚РѕС‡РєСѓ / QuickCreate L. BomPanel Рё QC РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**Gates:** FE tsc PASS; Jest product-form-dialog 22/22 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-301.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-DEDUP-301-strip-fulleditor-composition.lock`
**Known:** Deploy NO. Next DEDUP-302.

## [2026-08-08] вЂ” TZ-UX-311 DONE: composition-tree thumb + name wrap

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `TreeNode.photoUrl` РІ catalog-graph (main/first Photo.storageUrl); РІ `app-composition-tree` РјРёРЅРё-thumb РїРѕСЃР»Рµ Р±РµР№РґР¶Р° + Lucide placeholder; РёРјСЏ `line-clamp-2`/`break-words` РІРјРµСЃС‚Рѕ `truncate`. Docs В§11. РќРµ С‚СЂРѕРіР°Р»Рё QuickCreate/chrome/deploy.
**Gates:** FE tsc PASS; BE tsc PASS; Jest composition-tree 7/7 + catalog-graph 13/13 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-311.done.md`
**Lock:** `.mimocode/locks/TZ-UX-311-composition-tree-thumb-wrap.lock`
**Known:** Deploy NO. Org-scope jest expectations aligned with intentional global module parents.

## [2026-08-08] вЂ” TZ-GIT-301 DONE: merge FORM-302вЂ¦305 в†’ main

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** FORM wave `7bc88e17вЂ¦e485f521` landed on main as merge commit `c4f4d830` (parents `b4146581` + `e485f521`). NAV-302 IA preserved (`b3f6948b` ancestor). Closeout: archive/lock/checklist; backlog stub GIT-301 removed; FORM-304/305 locks restored.
**Gates:** FE tsc PASS; Jest quick-create + photo-dropzone + material-form-dialog 3/3 suites, 55/55 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-GIT-301.done.md`
**Lock:** `.mimocode/locks/TZ-GIT-301-merge-form-wave-to-main.lock`
**Known:** Deploy NO. Unrelated desktop/chrome WIP was stashed as `wip-before-TZ-GIT-301`.

## [2026-08-08] вЂ” TZ-UX-FORM-305 DONE: form-dialog sections sweep Wave A

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** Wave A form-dialogs РїРѕР»СѓС‡РёР»Рё РѕР±С‰РёР№ `PiFormSection`: Product, Module, color/category/document/text categories, Order, Proposal, People, Warehouse Рё Stock Movement. Payload/API/FormControl/business logic РЅРµ РёР·РјРµРЅСЏР»РёСЃСЊ; outliers РІС‹РЅРµСЃРµРЅС‹ РІ audit.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 5 suites / 58 tests PASS; scoped ESLint PASS with one pre-existing order raw-HttpClient warning; scoped Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-305.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-305-dialog-sections-sweep.lock`
**Known:** Wave B deferred and listed in `docs/audits/2026-08-08-dialog-layout-canon.md`; Material remains canon reference. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-FORM-304 DONE: QuickCreate L composition reuse

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** Product QuickCreate L РїРѕСЃР»Рµ create РѕСЃС‚Р°С‘С‚СЃСЏ РІ С‚РѕРј Р¶Рµ РѕРєРЅРµ СЃ Р¶РёРІС‹Рј `productId`; СЃРµРєС†РёСЏ В«РЎРѕСЃС‚Р°РІВ» РЅР°РїСЂСЏРјСѓСЋ РїРµСЂРµРёСЃРїРѕР»СЊР·СѓРµС‚ `ProductBomPanel`, РІРєР»СЋС‡Р°СЏ picker/actions; В«Р“РѕС‚РѕРІРѕВ» Р·Р°РєСЂС‹РІР°РµС‚, РїСѓСЃС‚РѕР№ BOM РґРѕРїСѓСЃС‚РёРј; max-width СЃРѕСЃС‚Р°РІР° РѕРіСЂР°РЅРёС‡РµРЅ `min(1100px, 100vw - 2rem)`.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest QuickCreate + BOM 18/18 PASS; scoped ESLint/Prettier PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-304-quickcreate-L-composition.lock`
**Known:** Module L remains product-only and closes after create; extending that flow was outside the required Product L path. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-FORM-303 DONE: QuickCreate L photo dropzone

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ shared `app-pi-photo-dropzone` СЃ drag/drop, picker, preview/remove Рё PhotosService upload. Product QuickCreate L РїРѕРєР°Р·С‹РІР°РµС‚ С„РѕС‚Рѕ РІ СЃРµРєС†РёРё В«Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕВ» Рё РїРµСЂРµРґР°С‘С‚ `photoIds` РІ create; РЅРѕРІС‹Рµ upload IDs С‡РёСЃС‚СЏС‚СЃСЏ РїСЂРё cancel/destroy.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 2 suites / 14 tests PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-303.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-303-quickcreate-L-photo.lock`
**Known:** FullEditor migration deferred because its Layer-3 file is outside the minimal AC path; module photos remain out of scope. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-FORM-302 DONE: Shared form sections for Material and QuickCreate

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-acfffc1331 (landed main via TZ-GIT-301)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** Р”РѕР±Р°РІР»РµРЅ shared `app-pi-form-section`; Material dialog РїРµСЂРµРІРµРґС‘РЅ РЅР° РЅРµРіРѕ; QuickCreate M/L РїРѕР»СѓС‡РёР» СЃРµРєС†РёРё В«РћСЃРЅРѕРІРЅС‹Рµ РґР°РЅРЅС‹Рµ / Р“Р°Р±Р°СЂРёС‚С‹ / Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕВ» СЃ РїСѓСЃС‚С‹РјРё РіСЂСѓРїРїР°РјРё hidden. FORM-301 capacity/packing СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** FE tsc PASS; Angular development build PASS; targeted Jest 2 suites / 49 tests PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-302-form-sections-canon-quickcreate.lock`
**Known:** FORM-303 photo, FORM-304 BOM, FORM-305 sweep РЅРµ Р·Р°С‚СЂР°РіРёРІР°Р»РёСЃСЊ. Deploy: NO.

## [2026-08-08] вЂ” TZ-NAV-302 DONE: peopleв†’РљР»РёРµРЅС‚С‹, work-typesв†’Р¦РµС…, chips

- Menu + yellow highlight: `/people` under РљР»РёРµРЅС‚С‹; `/work-types` under Р¦РµС…
- Section chips: РљР»РёРµРЅС‚С‹ / Р¦РµС… / РЎРґРµР»РєРё (PiGroupWorkspace reuse)
- Orders: В«+ РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·В» + empty hint; deals chip path from РљРџ
- Gates: jest `app-layout.nav-order` + frontend tsc PASS; Deploy NO

**Archive:** `tasks/_archive/2026-08/TZ-NAV-302.done.md`  
**Lock:** `.mimocode/locks/TZ-NAV-302-ia-people-worktypes-chips.lock`

## [2026-08-08] вЂ” TZ-UX-308 DONE: Nav В«РЎРїСЂР°РІ.В» yellow on /categories

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive; PO CLAIM)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** reference `entryPath`+item в†’ `/categories`; `activeAliases` classification/appearance/documents-ref; `matchActiveCategoryId()` + jest; docs-ref leaf РґСѓР±Р»СЊ СѓР±СЂР°РЅ (alias в†’ doc-template-categories).
**Gates:** FE tsc PASS; jest app-layout.nav-order 4/4
**Archive:** `tasks/_archive/2026-08/TZ-UX-308-nav-reference-active-highlight.done.md`
**Lock:** `.mimocode/locks/TZ-UX-308-nav-reference-active-highlight.lock`
**Known:** dialogs/QuickCreate/admin/deploy РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-FORM-301 DONE: QuickCreate field capacity packing

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `field-capacity.ts` (nanoвЂ¦full в†’ 12-col spans); QuickCreate M/L `md:grid-cols-12` + `gap-x-3 gap-y-2`; РіР°Р±Р°СЂРёС‚С‹+РІРµСЃ РѕРґРЅР° nano-Р»РµРЅС‚Р° (`col-start-1`); textarea rows=2 + min-h-0; controls sm; DIALOG-302 width РЅРµ РѕС‚РєР°С‚С‹РІР°Р»Рё.
**Gates:** FE tsc PASS; jest quick-create 8/8; browser AC product L вЂ” overflowPx=0, contentH 464 < ~504 budget @720p, dimSameRow=true
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-FORM-301-quickcreate-field-capacity.lock`
**Known:** FullEditor capacity в†’ FORM-303 successor. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-307 DONE: nav shortLabel + compact height

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** header h-14 / РєРЅРѕРїРєРё h-10; shortLabel (РџСЂРѕРµРєС‚/РЎРЅР°Р±Р¶./Р¦РµС…/Р”РѕРєСѓРј./РЎРїСЂР°РІ.вЂ¦); РїРѕР»РЅС‹Р№ RU РІ aria/title; equal-width РѕС‚ РєРѕСЂРѕС‚РєРёС…; РїРѕСЂСЏРґРѕРє 304 СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** FE tsc PASS; jest app-layout.nav-order 2/2
**Archive:** `tasks/_archive/2026-08/TZ-UX-307-nav-shorter-labels-compact-height.done.md`
**Lock:** `.mimocode/locks/TZ-UX-307-nav-shorter-labels-compact-height.lock`
**Known:** PO CLAIM РєР°Рє В«306В» в†’ РєР°РЅРѕРЅ **307** (306 = people-route). admin/dialogs/deploy РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-DIALOG-302 DONE: QuickCreate balanced + dialog canon

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** SIZE_TO_WIDTH S/M/Lв†’md/lg/xl (~920); M/L 2-col; body max-h~70vh; openers Р±РµР· width:md; cookbook kinds AвЂ“D + ui-dialog-canon + outliers table.
**Gates:** FE tsc PASS; jest quick-create 7/7
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-302.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-302-quickcreate-balanced-panels.lock`
**Known:** FullEditor legacyв†’kind C РЅРµ РІ scope. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-305 DONE: nav equal width + full RU labels

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** РїРѕР»РЅС‹Рµ RU РїРѕРґРїРёСЃРё РїРѕРґ РёРєРѕРЅРєРѕР№; РєРѕР»РѕРЅРєРё РѕРґРЅРѕР№ С€РёСЂРёРЅС‹ (grid auto-cols-fr РѕС‚ longest); shortLabel СѓР±СЂР°РЅ; dropdown compact = host contents; caption 9pxв†’10px @1280+.
**Gates:** FE tsc PASS (peer admin WIP isolated); jest app-layout.nav-order 2/2
**Archive:** `tasks/_archive/2026-08/TZ-UX-305-nav-equal-width.done.md`
**Lock:** `.mimocode/locks/TZ-UX-305-nav-equal-width-full-labels.lock`
**Known:** admin/** РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-ADMIN-302 DONE: system role all-checked read-only

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** В«РЎРјРѕС‚СЂРµС‚СЊВ» СЃРёСЃС‚РµРјРЅРѕР№ СЂРѕР»Рё вЂ” РїРѕР»РЅС‹Р№ РєР°С‚Р°Р»РѕРі pageKeys+capabilities вњ“ disabled; Р±Р°РЅРЅРµСЂ В«РЎРёСЃС‚РµРјРЅР°СЏ В· РЅРµР»СЊР·СЏ РёР·РјРµРЅРёС‚СЊ (РїРѕР»РЅС‹Р№ РґРѕСЃС‚СѓРї)В»; РєР°СЃС‚РѕРј/РЅРµСЃРёСЃС‚РµРјРЅС‹Рµ Edit Р±РµР· РёР·РјРµРЅРµРЅРёР№.
**Gates:** FE tsc PASS; jest role-form+roles-admin+permission-labels 30/30
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-302.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-302-system-role-checked-readonly.lock`
**Known:** peer users-admin/chrome WIP РЅРµ staged. Deploy: NO. app-layout РЅРµ С‚СЂРѕРіР°Р»Рё.

## [2026-08-08] вЂ” TZ-UX-304 DONE: nav icon+caption + Dictionaries after Docs

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** С‚РѕРї-nav rect + РёРєРѕРЅРєР° СЃРІРµСЂС…Сѓ + РїРѕРґРїРёСЃСЊ СЃРЅРёР·Сѓ; РїРѕСЂСЏРґРѕРє РљР°С‚Р°Р»РѕРівЂ¦Р”РѕРєСѓРјРµРЅС‚С‹ в†’ РЎРїСЂР°РІРѕС‡РЅРёРєРё в†’ РђРґРјРёРЅ; shortLabel РґР»СЏ РґР»РёРЅРЅС‹С…; dropdown compact С‚РѕС‚ Р¶Рµ СЏР·С‹Рє.
**Gates:** FE tsc PASS; jest app-layout.nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-UX-304.done.md`
**Lock:** `.mimocode/locks/TZ-UX-304-nav-icon-caption-and-order.lock`
**Known:** admin/** РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-ADMIN-301 DONE: roles permissions UX + pageKey ACL

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** СЃРёСЃС‚РµРјРЅС‹Рµ СЂРѕР»Рё вЂ” RU badge + РЎРјРѕС‚СЂРµС‚СЊ (read-only); РєР°СЃС‚РѕРј вЂ” РјР°С‚СЂРёС†Р° СЂР°Р·РґРµР»РѕРІ РјРµРЅСЋ (pages) + capabilities; API pages; PAGE_KEYS + text-block-categories; RU labels.
**Gates:** FE+BE tsc PASS; fe admin jest 56; be admin jest 23
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-301.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-301-roles-permissions-ux.lock`
**Known:** peer chrome WIP / users-admin dirty РЅРµ staged. Deploy: NO.

## [2026-08-08] вЂ” TZ-UX-301 DONE: compact icon top nav

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** С‚РѕРї-nav icon-first + tooltip/aria; active wash+border; Р”РµСЃРєС‚РѕРї/Р’С‹Р№С‚Рё icon-only; user truncate md+; dropdown compact input.
**Gates:** FE tsc PASS; jest app-layout.nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-UX-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-301-compact-icon-top-nav.lock`
**Known:** mobile hamburger out of P0. Admin/production РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-DICT-316 DONE: QuickCreate wire products/modules

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `QuickCreateDialog` (S/M/L profiles, LockedRequired); В«РЎРѕР·РґР°С‚СЊВ» РЅР° `/products`+`/modules`; edit в†’ FullEditor.
**Gates:** FE tsc PASS; jest quick-create 6/6 (+ form-profiles 13 green)
**Archive:** `tasks/_archive/2026-08/TZ-DICT-316.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-316-quick-create-wire.lock`
**Known:** module notes UI-only (BE upsert Р±РµР· notes, РєР°Рє FullEditor). Deploy: NO.

## [2026-08-08] вЂ” TZ-DICT-315 DONE: form profiles settings UI

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `/dictionaries/form-profiles` вЂ” entity overflow-select, S|M|L, checkbox matrix, LockedRequired locked; PUT API; nav+route; docs.
**Gates:** FE tsc PASS; jest form-profiles service+page 13/13
**Archive:** `tasks/_archive/2026-08/TZ-DICT-315.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-315-form-profiles-settings-ui.lock`
**Known:** QuickCreate wire в†’ DICT-316. Peer dirty dict pages РЅРµ С‚СЂРѕРіР°Р»Рё. Deploy: NO.

## [2026-08-08] вЂ” TZ-SALES-303 DONE: KP family schema + thin API (D21 L1)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ:** `familyRole`/`masterId`/`familyVersion`/`orgMarkupPercent` + attach/sync/GET family; convert variant в†’ 400; FE skip; stub 304 READY.
**Gates:** BE tsc PASS; jest quotation 21/21 PASS
**Archive:** `tasks/_archive/2026-08/TZ-SALES-303.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-303-kp-family-schema.lock`
**Known:** UI СЃРµРјСЊСЏ в†’ TZ-SALES-304. Deploy: NO.

## [2026-08-08] вЂ” TZ-SUPPLY-301 DONE: SupplyTask + confirm + /supply UI

**Р§С‚Рѕ:** СЃРєРµР»РµС‚ СЃРЅР°Р±Р¶РµРЅРёСЏ (D9/D18): schema/API confirm audit; `/supply` С‚Р°Р±Р»РёС†Р° + manual create; РЅРµ stub.
**Gates:** BE+FE tsc PASS; jest BE 6 + FE 2 PASS; eslint supply PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SUPPLY-301.done.md`
**Known:** BOM auto в†’ SUPPLY-302. Deploy: NO.

## [2026-08-08] вЂ” TZ-NAV-301 DONE: lifecycle menu Lв†’R + stubs

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-nav301 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** С‚РѕРї-РјРµРЅСЋ РїРѕС‚РѕРє Lв†’R; Р›СЋРґРёв†’РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ; РћСЂРіР°РЅРёР·Р°С†РёРёв†’РђРґРјРёРЅ; stubs РљР»РёРµРЅС‚С‹/РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ/РЎРЅР°Р±Р¶РµРЅРёРµ/РћС‚РіСЂСѓР·РєР°; PAGE_KEYS seed.
**Gates:** FE+BE tsc PASS; jest nav-order 1/1
**Archive:** `tasks/_archive/2026-08/TZ-NAV-301.done.md`
**Lock:** `.mimocode/locks/TZ-NAV-301-lifecycle-menu-stubs.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] вЂ” TZ-ORDERS-303 DONE: Р·Р°РєР°Р·С‡РёРє+РѕР±СЉРµРєС‚+owner Р»РёРЅРёРё

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Site API; order.siteId; quick-create CP+Site; line ownerUserId + plannedShipDate; convert/activate default site; FE form+detail.
**Gates:** BE+FE tsc PASS; BE unit zone 36; FE orders/site 12
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-303.done.md`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] вЂ” TZ-ORDERS-302 DONE: order detail live composition-tree

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `/orders/:id` chrome В«Р—Р°РєР°Р· в„–вЂ¦В»; РєРѕСЂРЅРё = Р»РёРЅРёРё; live `getProductTree`; С‚РѕС‚ Р¶Рµ `app-composition-tree`; Р±РµР· РїСЂР°Р№СЃР° РљРџ; empty/404 warn.
**Gates:** FE tsc PASS; jest order-detail+orders.page 10/10
**Archive:** `tasks/_archive/2026-08/TZ-ORDERS-302.done.md`
**Lock:** `.mimocode/locks/TZ-ORDERS-302-order-detail-composition-tree.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] вЂ” TZ-DICT-314 DONE: form profiles BE API (S/M/L)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** FormProfile schema + unique org/entity/size; GET list/one + PUT; seed defaults audit В§4; LockedRequired 400; jest 12/12.
**Gates:** BE tsc PASS; jest form-profiles 12/12
**Archive:** `tasks/_archive/2026-08/TZ-DICT-314.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-314-form-profiles-api.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] вЂ” TZ-COST-305 DONE: product-line РІ CostCalculation

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** bucket productLines; overrideГ—qty РёРЅР°С‡Рµ child.costPriceГ—qty (+infos); overhead Р±РµР· product-line; picker В«Р¦РµРЅР° РІ СЃРѕСЃС‚Р°РІРµВ» + prefill; BOM inspector hint.
**Gates:** BE tsc PASS; jest cost-calculation 10/10; FE tsc PASS; jest picker+bom 12/12
**Archive:** `tasks/_archive/2026-08/TZ-COST-305.done.md`
**Lock:** `.mimocode/locks/TZ-COST-305-product-line-in-cost.lock`
**Cursor Verdict:** PASS (executor self)

## [2026-08-08] вЂ” TZD-21 DONE: desktop pairing keys (TTL/multi/revoke)

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Opaque `kppd_вЂ¦` keys; API issue/list/revoke; dual Bearer in JwtAuthGuard; FE dialog; expiresAt null; docs.
**Gates:** BE tsc + jest 6/6; FE tsc + pairing 4/4; desktop tsc
**Archive:** `tasks/_archive/2026-08/TZD-21.done.md`
**Cursor Verdict:** PASS

## [2026-08-08] вЂ” TZ-DICT-313 DONE: quick-create form profiles audit

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (docs PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР•; product code NOT TOUCHED
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** D1вЂ“D8; FieldKey P0 product+module; drafts 314вЂ“316; IA РЎРїСЂР°РІРѕС‡РЅРёРєРё в‰  appearance.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-313.done.md`
**Audit:** `docs/audits/2026-08-09-quick-create-form-profiles.md`
**Cursor Verdict:** PASS

## [2026-08-08] вЂ” TZ-CATALOG-335 DONE: composition-tree dark depth

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Dark nest ladder 12/22/34/46% + rule chroma + inset; light 334 Р±РµР· СЂРµРіСЂРµСЃСЃРёРё; Р±РµР· kind-wash.
**Gates:** frontend tsc PASS; Jest composition-tree 5/5 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-335.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-335-composition-tree-dark-depth.lock`
**Cursor Verdict:** PASS

## [2026-08-08] вЂ” TZ-CATALOG-336 DONE: module detail = product A+ layout

**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** continuous-executor-composer (self PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `/modules/:id` split A+ (РїР°СЃРїРѕСЂС‚+С„РѕС‚Рѕ+cost-preview СЃР»РµРІР°; BOM СЃРїСЂР°РІР°). `ProductBomPanel.rootKind=module`; Р±РµР· product-Р»РёРЅРёР№; legacy showcase СѓР±СЂР°РЅ.
**Gates:** frontend tsc PASS; Jest module-detail|product-bom-panel 8/8 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-336.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-336-module-detail-parity.lock`
**Cursor Verdict:** PASS

## [2026-08-08] вЂ” TZD-24 DONE: Desktop installer ZIP + SPA skip /downloads

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** default РєРЅРѕРїРєР° в†’ `.zip`; Nest РЅРµ РѕС‚РґР°С‘С‚ SPA РЅР° `/downloads/*`;
publish-installer + deploy.py РєР»Р°РґСѓС‚ zip СЂСЏРґРѕРј СЃ exe.
**Archive:** `tasks/_archive/2026-08/TZD-24.done.md`
**Lock:** `.mimocode/locks/TZD-24-desktop-installer-zip-download.lock`
**Gates:** BE+FE tsc PASS; Jest download/pairing 14/14; smoke zip 200 / missing 404
**Deploy:** NO
**Commit:** `1ae611e`

## [2026-08-08] вЂ” TZD-22 DONE: AI Import Task (assembly point)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-tzd22 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** ImportTask BE `/api/import-tasks` + Desktop В«РЎРѕР·РґР°С‚СЊ Р·Р°РґР°С‡Сѓ РґР»СЏ РРВ» + MCP `kppdf_import_task_*`. Create в†’ `ready_for_ai`, 0 journal proposals. Propose path СЃРѕС…СЂР°РЅС‘РЅ. Matching в†’ TZD-23 (С‚РѕР»СЊРєРѕ РїРѕ PO).
**Gates:** backend tsc PASS; jest import-task 6/6 PASS; desktop/mcp test 33/33 PASS; desktop typecheck PASS
**Archive:** `tasks/_archive/2026-08/TZD-22.done.md`
**Lock:** `.mimocode/locks/TZD-22-ai-import-task.lock`
**Commit:** `e64e81fca6514e0ad2ad9ae6a9b9a8820a7d8871`
**Cursor Verdict:** PASS
**Known limits:** no matching/chat; no web UI task list; TZD-23 park until PO

---

## [2026-08-08] вЂ” TZ-COST-303 DONE: cost visibility UI (lists + BOM)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-cost303 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РњРѕРґСѓР»Рё list В«РЎРµР±РµСЃС‚.В»в†’В«СЃРј. РєР°СЂС‚РѕС‡РєСѓВ»; РёР·РґРµР»РёСЏ list/detail/grid `costPrice` СЂСЏРґРѕРј СЃ РџСЂР°Р№СЃ; BOM inspector РІРєР»Р°Рґ СЃС‚СЂРѕРєРё (РјР°С‚Г—qty / previewГ—qty). РќРµ СЂСѓС‡РЅР°СЏ С†РµРЅР° РјРѕРґСѓР»СЏ; РЅРµ desktop/TZD.
**Gates:** frontend tsc PASS; Jest products + bom-panel + modules PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-303.done.md`
**Lock:** `.mimocode/locks/TZ-COST-303-cost-visibility-ui.lock`
**Commit:** `cec4804`
**Cursor Verdict:** PASS

---

## [2026-08-08] вЂ” TZ-CATALOG-334 DONE: composition nest visual cohesion
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-catalog334 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РЈСЃРёР»РµРЅ РІРёР·СѓР°Р» `.comp-tree__nest`: sibling gap, left rail 3px kind, stronger wash, indent РґРµС‚РµР№. Expand/РєР»РёРє Р±РµР· РёР·РјРµРЅРµРЅРёР№. РќРµ Excel.
**Gates:** frontend tsc PASS; Jest composition-tree 3/3 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-334.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-334-composition-block-cohesion.lock`
**Commit:** `0f90243`
**Cursor Verdict:** PASS

---

## [2026-08-08] вЂ” TZ-CATALOG-333 DONE: composition containment nest
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** agent-3e757640b7 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р Р°СЃРєСЂС‹С‚С‹Рµ СѓР·Р»С‹ `app-composition-tree` РѕР±РѕСЂР°С‡РёРІР°СЋС‚ РґРµС‚РµР№ РІ `.comp-tree__nest` (hairline + wash kind СЂРѕРґРёС‚РµР»СЏ); module-in-module = СЂР°РјРєР° РІ СЂР°РјРєРµ; РЅР° BOM вЂ” РєРѕРјРїР°РєС‚РЅР°СЏ Р»РµРіРµРЅРґР° kind С‡РµСЂРµР· `catalogKindOklch`. РљР»РёРє РїРѕ СЃС‚СЂРѕРєРµ СЃРѕС…СЂР°РЅС‘РЅ. РќРµ Excel-РєРѕР»РѕРЅРєРё, РЅРµ COST/desktop.
**Gates:** frontend tsc PASS; Jest composition-tree + bom-panel + composition-editor 3/9 PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-333.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-333-composition-containment.lock`
**Commit:** `f2aedfdbec37c4ab16d733643085153f21fb6c6a`
**Cursor Verdict:** PASS

---

## [2026-08-08] вЂ” TZ-CATALOG-332 READY CLOSEOUT
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-3e757640b7 (Cursor PASS)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РћР±С‰РёР№ С‚РѕРЅРєРёР№ kind-marker РїРѕРґРєР»СЋС‡С‘РЅ Рє СЃРїРёСЃРєР°Рј Products/Modules/Materials Рё РІРєР»Р°РґРєР°Рј composition picker; `PiOverflowSelect` Рё `materialKind`-РєРѕРЅС‚СЂР°РєС‚ СЃРѕС…СЂР°РЅРµРЅС‹. RAL, Gantt, BOM, desktop, COST Рё TZ-333 РЅРµ Р·Р°С‚СЂР°РіРёРІР°Р»РёСЃСЊ.
**Gates:** frontend tsc PASS; related Jest 5 suites / 33 tests PASS; scoped ESLint PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-332.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-332-kind-colors.lock`
**Commits:** implementation `23c47b0c564bfba55cff9619818fb54b63d32239`; closeout `06d74f7e9423d6c879d5bafc2ea4bc8ea62e2565`

---

## [2026-08-08] вЂ” TZ-COST-303 DONE: Cost visibility UI (lists + BOM)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РєРѕР»РѕРЅРєР° РЎРµР±РµСЃС‚. РІ РјРѕРґСѓР»СЏС… (hint В«СЃРј. РєР°СЂС‚РѕС‡РєСѓВ»); РџСЂР°Р№СЃ+РЎРµР±РµСЃС‚. РІ РёР·РґРµР»РёСЏС…;
BOM inspector вЂ” РІРєР»Р°Рґ СЃС‚СЂРѕРєРё material/module read-only.
**Archive:** `tasks/_archive/2026-08/TZ-COST-303.done.md`
**Lock:** `.mimocode/locks/TZ-COST-303-cost-visibility-ui.lock`
**Gates:** FE tsc PASS; bom-panel jest 4/4 PASS; Cursor PASS; deploy NO.

## [2026-08-08] вЂ” TZ-COST-302 DONE: Recursive cost rollup + costPrice sync
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-cost302 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р РµРєСѓСЂСЃРёРІРЅС‹Р№ rollup nested moduleГ—qty; cycleв†’infos; activateв†’Product.costPrice; overhead A (materials only); GET /modules/:id/cost-preview; FE module-detail read-only В«РЎРµР±РµСЃС‚РѕРёРјРѕСЃС‚СЊ (СЂР°СЃС‡С‘С‚)В».
**Gates:** backend tsc PASS; frontend tsc PASS; jest cost-calculation + product-module 14/14 PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-302.done.md`
**Lock:** `.mimocode/locks/TZ-COST-302-recursive-cost-rollup.lock`
**Commit:** `96761553fc2f2dfc643c66c61bdede539fd3b183`
**Known limits:** COST-303 С‚РѕР»СЊРєРѕ РїРѕ PO; productв†’product lines PARK; deploy NO

---

## [2026-08-08] вЂ” TZ-COST-301 DONE: WorkType hourlyRate required
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-cost301 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `hourlyRate` РѕР±СЏР·Р°С‚РµР»РµРЅ РІ create/update DTO Рё FE-С„РѕСЂРјРµ; РєРѕР»РѕРЅРєР° В«в‚Ѕ/С‡Р°СЃВ»; boot backfill missingв†’0; Р’РёРґС‹ СЂР°Р±РѕС‚ РѕСЃС‚Р°СЋС‚СЃСЏ РІ РљР°С‚Р°Р»РѕРіРµ.
**Gates:** backend tsc PASS; frontend tsc PASS; jest work-type.service 8/8 PASS
**Archive:** `tasks/_archive/2026-08/TZ-COST-301.done.md`
**Lock:** `.mimocode/locks/TZ-COST-301-work-type-hourly-rate-required.lock`
**Commit:** `79edbea3c4c7957cb8ce7973f9acb1a29e2ca1a6`
**Known limits:** `0` СЂР°Р·СЂРµС€С‘РЅ; COST-302 С‚РѕР»СЊРєРѕ РїРѕ PO; CostCalculation РЅРµ С‚СЂРѕРіР°Р»Рё

---

## [2026-08-08] вЂ” TZ-CATALOG-331 DONE: catalog appearance settings
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical executor (`agent-3e757640b7`)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р”РѕР±Р°РІР»РµРЅ admin-only `/catalog/appearance` СЃ preset hue РґР»СЏ РёР·РґРµР»РёСЏ/РјРѕРґСѓР»СЏ/РјР°С‚РµСЂРёР°Р»Р°/СЃС‹СЂСЊСЏ; СЃРѕС…СЂР°РЅРµРЅРёРµ organization-scoped С‡РµСЂРµР· СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ settings API (`catalog.appearance.<organizationId>`), global/code defaults fallback; reactive palette РїРѕРґРєР»СЋС‡РµРЅР° Рє CompositionTree Рё BOM inspector; RAL Рё Gantt РЅРµ Р·Р°С‚СЂР°РіРёРІР°Р»РёСЃСЊ.
**Gates:** frontend/backend tsc PASS; targeted Jest FE 3 suites / 6 tests PASS; backend setting Jest 2 tests PASS; scoped ESLint Р±РµР· `--fix` PASS; Angular dev build PASS СЃ pre-existing NG8113 РІ DocumentsPage; `git diff --check` PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-331.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-331-catalog-appearance.lock`
**Known limits:** browser authenticated-admin smoke save/reload + light/dark РѕСЃС‚Р°С‘С‚СЃСЏ РїРµСЂРµРґ С„РёРЅР°Р»СЊРЅС‹Рј deploy-readiness.

---

## [2026-08-08] вЂ” TZD-20 DONE: MCP client JSON copy (Cursor / LM Studio)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-tzd20 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `buildMcpClientSnippet` full+fragment; РєРЅРѕРїРєРё В«РЎРєРѕРїРёСЂРѕРІР°С‚СЊ mcp.jsonВ» / В«РўРѕР»СЊРєРѕ С„СЂР°РіРјРµРЅС‚В» РІ Desktop; docs connect; clipboard only (РЅРµ РїРёС€РµС‚ РІ С‡СѓР¶РёРµ mcp.json). GET /mcp 405 СѓР¶Рµ Р±С‹Р» sync.
**Gates:** desktop typecheck PASS; svelte-check PASS; snippet tests 4/4 PASS
**Archive:** `tasks/_archive/2026-08/TZD-20.done.md`
**Lock:** `.mimocode/locks/TZD-20-mcp-client-json-copy.lock`
**Commit:** `f3ca1007947e2e727af4f24a05ac4f8ace71aade`
**Known limits:** JWT ~15m; disk write mcp.json вЂ” successor; `package.json` test script left unstaged (run via mcp tsx)

---

## [2026-08-08] вЂ” TZ-OPS-301 DONE: Quiet local boot logs (Nest DI + proxy race)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-ops301 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** QuietNestLogger РіР»СѓС€РёС‚ Nest DI INFO; `start.mjs` РЅРµ РїРµС‡Р°С‚Р°РµС‚ vite proxy ECONNREFUSED РґРѕ backend ready; `.env.example` LOG_LEVEL=info. TZ-248 WARN СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** backend tsc PASS; `node --check start.mjs` PASS; jest quiet-nest-logger 5/5 PASS
**Archive:** `tasks/_archive/2026-08/TZ-OPS-301.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-301-quiet-dev-boot-logs.lock`
**Commit:** `f12c2d8e227f3c38aa97775b96f10192684dbe54`
**Known limits:** HTTP pino-http access logs РІРЅРµ scope; cold-start evidence optional

---

## [2026-08-08] вЂ” TZD-17 DONE: MCP semantic domain layer (schema + validate + inbox audit)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** cursor-composer-tzd17 (Cursor PASS в†’ archive)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material`, `kppdf_inbox_audit_file` + propose `mode=validate`. Validate/audit РЅРµ СЃРѕР·РґР°СЋС‚ proposal Рё РЅРµ РїРёС€СѓС‚ SoT.
**Gates:** `desktop/mcp` typecheck PASS; tests 31/31 PASS
**Archive:** `tasks/_archive/2026-08/TZD-17.done.md`
**Lock:** `.mimocode/locks/TZD-17-mcp-semantic-domain-layer.lock`
**Commit:** `e88667f`
**Known limits:** TZD-18/19 PARK РґРѕ РєРѕРјР°РЅРґС‹ PO; encoding WIP РІ `inbox.ts` РЅРµ РІ РєРѕРјРјРёС‚Рµ

---

## [2026-08-07] вЂ” TZ-CATALOG-330 DONE: kind colors on composition tree
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor (session catalog colors wave)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `catalogKindOklch` defaults (product/module/material/raw); wash+border+Р±РµР№РґР¶ РЅР° `composition-tree`; С‚РѕС‡РєР° kind РІ BOM inspector. Persist UI в†’ 331.
**Gates:** Jest catalog-kind-oklch + bom-panel + composition-editor PASS
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-330.done.md`
**Known limits:** С†РІРµС‚Р° С‚РѕР»СЊРєРѕ РёР· РєРѕРґР°; СЌРєСЂР°РЅ В«РћС„РѕСЂРјР»РµРЅРёРµВ» вЂ” TZ-331

---

## [2026-08-07] вЂ” TZ-PRODUCTION-303.1b DONE: land Gantt hotfix + orders ?q= deep-link on main
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical executor (`agent-3e757640b7`)
**РЎС‚Р°С‚СѓСЃ:** DONE on `main`; deep-link landed, Gantt hotfix preserved from `cde23a5`, deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р’ main РїРѕРґС‚РІРµСЂР¶РґРµРЅС‹ Gantt hotfix (railв†”bars filter sync, WorkType.days confirm+rollback, bar context, legend/palette, toolbar, ACL UX) Рё deep-link `/orders?q=<РЅРѕРјРµСЂ>` С‡РµСЂРµР· `OrdersPage` search state. Catalog polish РёР· Р±Р°Р·С‹ СЃРѕС…СЂР°РЅС‘РЅ; `products/**` СЌС‚РѕР№ Р·Р°РґР°С‡РµР№ РЅРµ РјРµРЅСЏР»СЃСЏ. Р”СѓР±Р»РёСЂРѕРІР°РЅРЅР°СЏ РєРѕРјРїР°РєС‚РЅР°СЏ СЃСЃС‹Р»РєР° РІ inspector СѓРґР°Р»РµРЅР°, РѕСЃС‚Р°РІР»РµРЅР° РѕРґРЅР° РїРѕР»РЅР°СЏ СЃСЃС‹Р»РєР°.
**Gates:** frontend tsc PASS; targeted Jest 4 suites / 23 tests PASS; scoped ESLint Р±РµР· `--fix` PASS; Angular development build PASS СЃ pre-existing NG8113 warning РІ DocumentsPage; `git diff --check` PASS.
**Commits:** `cde23a5` base Gantt hotfix + catalog preservation; `c622db5` deep-link landing; `c6e2a29` prior closeout evidence; final landing closeout commit recorded in checklist.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.1b-land-hotfix-main.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303.1b-land-hotfix-main.lock`
**Known limits:** producer-side inspector unit spec and ProductionCockpitPage railв†”bars integration spec remain follow-up hardening; browser/PO smoke remains.

---

## [2026-08-07] вЂ” TZ-PRODUCTION-303.1 DONE: Gantt closeout + orders ?q= deep-link
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / Freebuff executor (`agent-d4d9f3dbfd`)
**РЎС‚Р°С‚СѓСЃ:** DONE; Gantt hotfix history already on main, deep-link wired and documented
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** OrdersPage С‡РёС‚Р°РµС‚ `ActivatedRoute.queryParamMap.q` Рё РїСЂРѕРєРёРґС‹РІР°РµС‚ Р·РЅР°С‡РµРЅРёРµ РІ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ search state; СѓРґР°Р»РµРЅРёРµ `q` РѕС‡РёС‰Р°РµС‚ С„РёР»СЊС‚СЂ. Inspector РїРѕР»СѓС‡РёР» СЏРІРЅСѓСЋ СЃСЃС‹Р»РєСѓ `/orders?q=<РЅРѕРјРµСЂ>`. Production page docs СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹.
**Gates:** FE tsc PASS; targeted Jest 4 suites / 20 tests PASS; scoped ESLint Р±РµР· `--fix` PASS; `git diff --check` PASS; development build PASS СЃ pre-existing NG8113 warning РІ DocumentsPage. Scoped Prettier check РІС‹СЏРІРёР» pre-existing formatting drift РІ С‚СЂС‘С… Р·Р°С‚СЂРѕРЅСѓС‚С‹С… Р±РѕР»СЊС€РёС… TS-С„Р°Р№Р»Р°С… Рё РЅРµ РёСЃРїРѕР»СЊР·РѕРІР°Р»СЃСЏ РєР°Рє success gate.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.lock`
**Commit:** `f731957` implementation closeout; metadata finalized in the follow-up documentation commit; deploy РќР• РІС‹РїРѕР»РЅСЏР»СЃСЏ.
**Known limits:** handoff-referenced `docs/audits/2026-08-06-production-gantt-verdict-response.md` РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ РЅР° branch; producer-side inspector unit spec РЅРµ РґРѕР±Р°РІР»СЏР»СЃСЏ, С‚Р°Рє РєР°Рє РѕС‚РґРµР»СЊРЅС‹Р№ spec path РЅРµ РІС…РѕРґРёС‚ РІ CONFLICT KEYS.

---

## [2026-08-06] вЂ” TZD-16 DONE: Pairing installer download
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (desktop/MCP executor)
**РЎС‚Р°С‚СѓСЃ:** DONE on main; Tauri build soft-waived
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РљРЅРѕРїРєР° В«РЎРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµВ» РІ pairing dialog; `DESKTOP_DOWNLOAD_URL` СЃ default/explicit-empty semantics; Jest, deploy runtime injection, static `/downloads/` docs; installer binaries РЅРµ РєРѕРјРјРёС‚РёР»РёСЃСЊ.
**Gates:** FE Jest 2 suites / 14 tests PASS; FE tsc/ESLint/Prettier PASS; desktop typecheck/svelte-check PASS; `pnpm tauri build` SOFT WAIVE вЂ” РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ pre-existing `desktop/src-tauri/icons/icon.ico`.
**Archive:** `tasks/_archive/2026-08/TZD-16.done.md`
**Lock:** `.mimocode/locks/TZD-16-pairing-download-installer.lock`
**Commits:** `873a70b`, `3d12fdf`, `103e7f1`; closeout `4c34814`
**Next:** `/production` verification / PO browser smoke; TZD-16.1 only if a real installer artifact is required.

---

## [2026-08-06] вЂ” TZ-PRODUCTION-303 DONE: Production Cockpit shell + Gantt plan-estimate
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor (implement + land; PO В«РґРѕР±РёРІР°РµРј РґРѕ РєРѕРЅС†Р°В»)
**РЎС‚Р°С‚СѓСЃ:** DONE on main (scoped)
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `/production` dense cockpit; orders rail (ACTIVE_COMMERCIAL + selected RO); Gantt bars РїРѕ `WorkType.days` С‡РµСЂРµР· FE facade (composition-first); Г—N display; PAGE_KEYS+seed+`production:read`; director РЅР° GET products/modules/work-types; lifecycle north-star РІ PO-DIARY/design.
**Gates:** FE jest production|gantt|cockpit 14/14 PASS; FE tsc PASS; BE tsc build PASS.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTION-303.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTION-303-gantt-board-page.lock`
**Checklist:** `docs/agent-checklists/TZ-PRODUCTION-303.md`
**Commit:** `08e7a45` on main
**Next:** PO browser smoke `/production`; then TZ-PRODUCTION-304+.

---

## [2026-08-06] вЂ” TZ-CATALOG-311 DONE: Unified CompositionTree + CompositionEditor
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (implement) + Cursor (PASS / land / closeout)
**РЎС‚Р°С‚СѓСЃ:** DONE on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Shared CompositionTree/Editor; getProductTree/getModuleTree; lazy depth-refetch + expand state; product/module detail; depth warn; soft jest/docs.
**Gates:** agent focused Jest PASS; tsc clean on land base.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-311.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-311-composition-tree.lock`
**Commit:** `c36eebf` (from `cd900c4`)
**Next:** optional 315; Production 303 independent.

---

## [2026-08-06] вЂ” TZD-15 DONE: Agent inbox workspace (drop в†’ audit в†’ propose fills)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (desktop/MCP) + Cursor (land on main)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock; on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Inbox dropв†’auditв†’proposeв†’confirm (journal only, no silent SoT); MCP kppdf_inbox_*; config v3 inbox.dir; busy-guard.
**Gates:** desktop typecheck/svelte-check/build PASS; mcp 17/17; cargo check PASS.
**Archive:** `tasks/_archive/2026-08/TZD-15.done.md`
**Lock:** `.mimocode/locks/TZD-15-agent-inbox-workspace.lock`
**Commit (Freebuff):** `594833f` В· **on main:** (cherry-pick)
**Next:** **TZD-16** (pairing download).

---

## [2026-08-06] вЂ” TZ-WAREHOUSE-UX-301 DONE: Dashboard dedupe + movements warehouse filter + type help
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (Freebuff executor) + Cursor (land on main)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock; on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** /inventory Р±РµР· РґСѓР±Р»СЏ TOC-РєРЅРѕРїРѕРє РІ tools; /stock-movements С„РёР»СЊС‚СЂ СЃРєР»Р°РґР° (chips в‰¤8 / select >8, warehouseId+type Рє API, type chips С‡РµСЂРµР· chipClick); С„РѕСЂРјР° СЃРєР»Р°РґР°: default type=main + RU-РїРѕРґСЃРєР°Р·РєР°; С„РёРєСЃ TS2353 в†’ QueryGroupChip.
**Gates:** FE tsc PASS РїРѕ Р·РѕРЅРµ TZ; jest 5/25 PASS. Catalog-РґСЂРµР№С„ materials.page.ts РІРЅРµ scope.
**Archive:** `tasks/_archive/2026-08/TZ-WAREHOUSE-UX-301.done.md`
**Lock:** `.mimocode/locks/TZ-WAREHOUSE-UX-301-archive.lock`
**Commit (Freebuff):** `65a936f` В· **on main:** (cherry-pick feat + closeout)
**Next:** optional catalog tsc-hygiene; ACL warehouse вЂ” РѕС‚РґРµР»СЊРЅС‹Рµ TZ.

---

## [2026-08-06] вЂ” TZD-14 DONE: Desktop hosts MCP (autostart + status UI)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (deepseek-v4-flash, desktop/MCP executor, session в„–3) + Cursor (land on main)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock; on main
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Tauri СЃР°Рј Р·Р°РїСѓСЃРєР°РµС‚ MCP host РїСЂРё РїР°СЂРёРЅРіРµ (spawn `node вЂ¦/tsx вЂ¦/http-server.ts` С‡РµСЂРµР· tauri-plugin-shell, CREATE_NO_WINDOW). UI: СЃС‚Р°С‚СѓСЃ, URL+copy, РїРѕСЂС‚, LAN OFF default, start/stop/restart; stop on quit; config v2 `mcp {port,allowLan}`; MCP.md Р±РµР· Cursor.
**Gates:** desktop typecheck/svelte-check/build PASS; mcp 8/8; cargo check PASS; MCP smoke healthz/auth PASS.
**Archive:** `tasks/_archive/2026-08/TZD-14.done.md`
**Lock:** `.mimocode/locks/TZD-14-desktop-mcp-autostart.lock`
**Commit (Freebuff):** `0cfca55` В· **on main:** (cherry-pick)
**Known limits:** Node РЅРµ РІ MSI; icons/ pre-existing gap.
**Next:** **TZD-15** GO (agent inbox).

---

## [2026-08-06] вЂ” TZ-CATALOG-320 DONE: FE composition gap (cascade / details / complex)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (implement) + Cursor (PASS review / closeout / tsc waive)
**РЎС‚Р°С‚СѓСЃ:** DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Composition `module|material|product` + product-only `unitPriceOverride`; РјРѕРґСѓР»СЊ вЂ” РјР°С‚РµСЂРёР°Р»С‹+РґРѕС‡РµСЂРЅРёРµ РјРѕРґСѓР»Рё; РёР·РґРµР»РёРµ вЂ” РјРѕРґСѓР»СЊ+non-raw+product + В«РљРѕРјРїР»РµРєСЃВ»; fix `formGroupName="dimensions"`; 4 page docs.
**Gates:** focused Jest 5/53 PASS; scoped eslint/prettier PASS; full-app tsc **WAIVED** (pre-existing warehouse/materials chips, РЅРµ conflict keys 320).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-320.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-320-composition-gap.lock`
**Commit:** `07ced5f`
**Next:** TZ-CATALOG-311 (CompositionTree). Soft: module-detail table РµС‰С‘ С‚РѕР»СЊРєРѕ materials.

---

## [2026-08-06] вЂ” TZ-ADMIN-306 DONE: Role select from API + /admin hub cleanup
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (Freebuff worktree a405897c, parallel session #2)
**РЎС‚Р°С‚СѓСЃ:** DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** User-form role <select> Р·Р°РіСЂСѓР¶Р°РµС‚СЃСЏ РёР· GET /admin/roles (PiRolesService): value=role name, RU-Р»РµР№Р±Р»С‹ (СЃРёСЃС‚РµРјРЅС‹Рµ: РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ/Р”РёСЂРµРєС‚РѕСЂ/РњРµРЅРµРґР¶РµСЂ/РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ + custom label), СЃРёСЃС‚РµРјРЅС‹Рµ РїРµСЂРІС‹РјРё, edit-mode safety; `/admin` в†’ redirect `/admin/users`, С„РµР№РєРѕРІС‹Р№ placeholder СѓРґР°Р»С‘РЅ.
**Gates:** FE tsc РЅР° allowlist PASS (0 РѕС€РёР±РѕРє pages/admin + app.routes); focused Jest 4 suites / 45 tests PASS; full-repo tsc red Г—9 вЂ” pre-existing group-chips WIP parallel session #1 (РЅРµ С‚СЂРѕРіР°Р»).
**Archive:** `tasks/_archive/2026-08/TZ-ADMIN-306.done.md`
**Lock:** `.mimocode/locks/TZ-ADMIN-306-role-select-hub.lock`
**Commit (Freebuff):** `68b6cc9` В· **on main:** `69d8a22` (cherry-pick)
**Next:** optional WAREHOUSE-UX-301 or close agent.

---

## [2026-08-06] вЂ” TZ-CATALOG-314 DONE: Archive / soft-delete / auth consistency
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (implement) + Cursor (closeout / PO deploy path)
**РЎС‚Р°С‚СѓСЃ:** DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** ProductModule hard-delete в†’ soft archive; deletedAt + active-read РЅР° Product/Material/WorkType/Category/Module; 409 РЅР° structured refs; org-scope РЅР° owned CRUD + Product composition/tree; 313 photo dual-write СЃРѕС…СЂР°РЅС‘РЅ.
**Gates (closeout):** backend tsc PASS; focused Jest 5/46 PASS; scoped ESLint PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-314.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-314-archive.lock`
**Next:** deploy; Р·Р°С‚РµРј TZ-CATALOG-320.

---

## [2026-08-06] вЂ” TZD-13 DONE: MCP writes + mutation journal
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor / Auto (desktop/MCP owner)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive; push with closeout
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Backend MutationJournal (proposeв†’confirmв†’undo Material, ring 50); MCP write tools; MCP.md connect+safety; unit default `С€С‚`.
**Gates:** backend tsc PASS; jest 5/5; mcp tests 8/8.
**Archive:** `tasks/_archive/2026-08/TZD-13.done.md`
**Next:** TZD-14 Tauri MCP autostart (РїРѕСЃР»Рµ РІРµС‡РµСЂРЅРµРіРѕ РґРµРїР»РѕСЏ web вЂ” РјРѕР¶РЅРѕ РѕС‚РґРµР»СЊРЅРѕ).

---

## [2026-08-06] вЂ” TZ-CATALOG-313 DONE: Photo/document attachment unify
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / openai/gpt-5.6-luna
**РЎС‚Р°С‚СѓСЃ:** DONE; PO accepted READY FOR REVIEW; archive + lock created.
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р”РѕР±Р°РІР»РµРЅ typed CatalogAttachment РґР»СЏ Product/ProductModule/Material; ProductModule РїРѕР»СѓС‡РёР» photoIds/mainPhotoId; ProductModulePhoto Рё legacy document collections СЃРѕС…СЂР°РЅРµРЅС‹; legacy module-photo paths РёСЃРїРѕР»СЊР·СѓСЋС‚ non-destructive dual-write РґР»СЏ РѕР±С‰РёС… Photo references.
**Gates:** backend tsc PASS; focused Jest 3 suites / 15 tests PASS; scoped ESLint PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-313.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-313-attachments.lock`
**Commit:** pending closeout commit

---

## [2026-08-05] вЂ” TZ-CATALOG-312 DONE: Material detail page /materials/:id
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РљР°СЂС‚РѕС‡РєР° РјР°С‚РµСЂРёР°Р»Р° /materials/:id (4 СЃРµРєС†РёРё: РѕСЃРЅРѕРІРЅРѕРµ, РіР°Р±Р°СЂРёС‚С‹, СЃРєР»Р°Рґ, where-used backlinks). Р РѕСѓС‚ + СЃСЃС‹Р»РєР° РёР· СЃРїРёСЃРєР° РјР°С‚РµСЂРёР°Р»РѕРІ. РџР°С‚С‚РµСЂРЅ product/module detail.
**Gates:** FE tsc PASS; jest material-detail 6/6 PASS.
**Commit:** `7eb60f4`
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-312.done.md` (hygiene 2026-08-06: stale `_active` + backlog stub removed)
**Lock:** `.mimocode/locks/TZ-CATALOG-312-material-detail.lock`
**Next:** TZ-CATALOG-314 closeout (DAY-07) в†’ 320.

---

## [2026-08-05] вЂ” TZD-05 DONE: Web В«РџРѕРґРєР»СЋС‡РёС‚СЊ РґРµСЃРєС‚РѕРїВ» вЂ” pairing JSON packet
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy
**РЎС‚Р°С‚СѓСЃ:** DONE; archive created; commit pending
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РљРЅРѕРїРєР° В«Р”РµСЃРєС‚РѕРїВ» РІ С…РµРґРµСЂРµ (Monitor icon); dialog СЃ JSON-РїР°РєРµС‚РѕРј + Copy/Close; apiBaseUrl = backend origin (dev: http://127.0.0.1:3000, prod: window.location.origin); RU-РѕС€РёР±РєРё РЅР° РёСЃС‚С‘РєС€РёР№/РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‰РёР№ С‚РѕРєРµРЅ; pure FE, Р±РµР· РЅРѕРІРѕРіРѕ backend-СЌРЅРґРїРѕРёРЅС‚Р°.
**Gates:** FE tsc (tsconfig.app.json) PASS; jest pairing-dialog 8/8 PASS.
**Archive:** `tasks/_archive/2026-08/TZD-05.done.md`
**Next:** TZD-11/12 СѓР¶Рµ РЅР° main; TZD-14 desktop autostart РёР»Рё СЃР»РµРґСѓСЋС‰РёР№ backlog.

---

## [2026-08-05] вЂ” TZD-13 DONE: MCP writes + mutation journal
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor / Auto (desktop/MCP owner)
**РЎС‚Р°С‚СѓСЃ:** DONE on main after push
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Backend MutationJournal (proposeв†’confirmв†’undo, ring 50) РґР»СЏ Material; MCP write tools; docs connect+safety; unit default `С€С‚`.
**Gates:** backend tsc PASS; jest 5/5; mcp tests 8/8.
**Archive:** `tasks/_archive/2026-08/TZD-13.done.md`
**Next:** TZD-14 autostart MCP in Tauri (usability). FE pairing TZD-05 parallel.

---

## [2026-08-05] вЂ” TZD-12 DONE: MCP read tools
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor / Auto
**РЎС‚Р°С‚СѓСЃ:** DONE; archive; on main after push
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** 6 read-only MCP tools РїРѕРІРµСЂС… СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёС… GET (materials/products/storage-items/warehouses) + slim product fields; РѕР±РЅРѕРІР»С‘РЅ `desktop/docs/MCP.md`.
**Gates:** `pnpm typecheck` PASS; `pnpm test` 7/7 PASS.
**Archive:** `tasks/_archive/2026-08-05/TZD-12.done.md`
**Lock:** `.mimocode/locks/TZD-12-mcp-reads.lock`
**Next:** TZD-13 writes + journal. РџР°СЂР°Р»Р»РµР»СЊРЅРѕ: TZD-05.

---

## [2026-08-05] вЂ” TZD-11 DONE: MCP server foundation
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor / Auto
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock; on main `de27bf2` (TZD-12 unblocked)
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РџР°РєРµС‚ `desktop/mcp` (`@kppdf/desktop-mcp`): Streamable HTTP РЅР° `127.0.0.1:9743` + stdio; auth pairing JWT (`KPPDF_API_KEY` + Bearer); tool `kppdf_ping`; docs `desktop/docs/MCP.md`; workspace member РІ `desktop/pnpm-workspace.yaml`.
**Gates:** `pnpm typecheck` PASS; `pnpm test` 2/2 PASS; smoke `/healthz` ok + Bearer mismatch в†’ 401.
**Archive:** `tasks/_archive/2026-08/TZD-11.done.md`
**Lock:** `.mimocode/locks/TZD-11-mcp-foundation.lock`
**Next:** TZD-12 read tools (РїРѕСЃР»Рµ push РЅР° main). РџР°СЂР°Р»Р»РµР»СЊРЅРѕ OK: TZD-05.

---

## [2026-08-05] вЂ” TZ-CATALOG-310 DONE: Where-used API
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / openai/gpt-5.6-luna
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; commit/push pending
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р”РѕР±Р°РІР»РµРЅС‹ authenticated read-only where-used routes РґР»СЏ Product, Module, Material Рё WorkType; РѕР±С‰РёР№ paginated response, org scope РґР»СЏ owned parent records, legacy composition fallback, orphan tolerance Рё Swagger docs.
**Gates:** backend tsc PASS; focused Jest 4 suites / 46 tests PASS; scoped ESLint PASS (0 errors, 6 existing test-mock warnings); diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-310.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-310-where-used.lock`
**Known limit:** ProductModule/WorkType РѕСЃС‚Р°СЋС‚СЃСЏ shared, С‚Р°Рє РєР°Рє С‚РµРєСѓС‰РёРµ СЃС…РµРјС‹ РЅРµ РёРјРµСЋС‚ organizationId.

---

## [2026-08-05] вЂ” TZ-CATALOG-UI-301 DONE: Catalog Group Chip Workspace
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor Architect (+ FE subagent)
**РЎС‚Р°С‚СѓСЃ:** DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РљР°С‚Р°Р»РѕРі (РїСЂРѕРґСѓРєС†РёСЏ/РјРѕРґСѓР»Рё/РјР°С‚РµСЂРёР°Р»С‹/РІРёРґС‹ СЂР°Р±РѕС‚/Р»СЋРґРё) РЅР° `PiGroupWorkspace`; top-nav РљР°С‚Р°Р»РѕРі Рё РЎРїСЂР°РІРѕС‡РЅРёРєРё вЂ” entry Р±РµР· dropdown; SoT + DEVELOPMENT-PATTERNS В§18; table mapping Expandable+Card grid / Flat+photo.
**Gates:** fe tsc PASS; jest catalog list specs PASS (32).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-UI-301.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-UI-301-group-chip.lock`
**Canon:** `docs/superpowers/specs/2026-08-05-group-chip-workspace-canon.md`

---

## [2026-08-05] вЂ” TZ-UI-TABLE-303 DONE: shared Expandable contract
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** openai/gpt-5.6-luna (Buffy)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created per session close-board
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `app-pi-table` РїРѕР»СѓС‡РёР» active-row predicate and named detail-region API; Products С‚РµРїРµСЂСЊ single-expand СЃ keyboard Enter/Space, `aria-expanded` and one detail row.
**Gates:** fe tsc PASS; targeted Jest 4 suites / 45 tests PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-303.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-303-expandable.lock`

---

## [2026-08-05] вЂ” TZ-UI-TABLE-305 DONE: raw registries on shared Flat kit
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** openai/gpt-5.6-luna (Buffy)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created per session close-board
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** СЃРµРјСЊ raw registry tables РїРµСЂРµРІРµРґРµРЅС‹ РЅР° `app-pi-table`; CRUD, filters, actions, loading/empty, sorting and pagination preserved. Added focused smoke specs for Documents, Forms and Inventory Dashboard.
**Gates:** fe tsc PASS; targeted Jest 11 suites / 86 tests PASS; raw registry scan PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-305.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-305-flat-kit.lock`

---

## [2026-08-05] вЂ” TZ-UI-TABLE-302 READY FOR REVIEW: shared Tree kit + categories
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** openai-gpt-5.6-luna (Buffy)
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; Cursor PASS в†’ archive; РЅРµ DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РґРѕР±Р°РІР»РµРЅ `app-pi-table-tree` РґР»СЏ nested rows, indent, expand/collapse Рё drag capability; CategoriesPage РїРµСЂРµРІРµРґС‘РЅ СЃ page-local grid/CDK markup РЅР° kit, reorder API СЃРѕС…СЂР°РЅС‘РЅ.
**Gates:** fe tsc PASS; targeted jest 6 suites / 59 tests PASS; diff --check PASS.
**Р”РѕРєСѓРјРµРЅС‚С‹:** categories.page.md, checklist, active marker/map.
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** MVP РґРІР° СѓСЂРѕРІРЅСЏ; filtered drag index behavior РїСЂРµР¶РЅРёР№; browser screenshot smoke РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ.

---

## [2026-08-05] вЂ” TZ-DICT-312 READY FOR REVIEW: Group Chip chrome polish
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** openai-gpt-5.6-luna (Buffy)
**РЎС‚Р°С‚СѓСЃ:** READY FOR REVIEW; Cursor PASS в†’ archive; РЅРµ DONE
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** СѓР±СЂР°РЅ gap headerв†’chips С‡РµСЂРµР· dense main РґР»СЏ dictionary group routes; chips+tools СЃРѕР±СЂР°РЅС‹ РІ Р°РґР°РїС‚РёРІРЅС‹Р№ sticky top-0 stack; CTA tools Р·Р°С‰РёС‰С‘РЅ РѕС‚ РїСЂР°РІРѕРіРѕ clip.
**Gates:** fe tsc PASS; targeted jest 10 suites / 91 tests PASS; diff --check PASS.
**Р”РѕРєСѓРјРµРЅС‚С‹:** checklist, DICT-WAVE1-REVIEW, page docs, PAGE-TZ-INDEX, active-map.
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** browser screenshot smoke РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ; UI-TABLE Tree/305 РЅРµ РІС…РѕРґСЏС‚.

---

## [2026-08-05] вЂ” TZ-DICT-312 + TZ-UI-TABLE-302 DONE (Architect PASS)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy + Cursor (tsc + 119 jest + archive)
**РЎС‚Р°С‚СѓСЃ:** PASS; archives `TZ-DICT-312.done.md`, `TZ-UI-TABLE-302.done.md`
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Group Chip sticky/dense polish; PiTableTree + categories migrate.
**РљСЂРёС‚РµСЂРёРё:** AC 312 + 302
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** UI-TABLE-305 backlog; browser smoke optional PO

---

## [2026-08-05] вЂ” Authored TZ-DICT-312 (Group Chip polish tomorrow)
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Cursor Mode A (docs)
**РЎС‚Р°С‚СѓСЃ:** TZ READY вЂ” РєРѕРґ Р·Р°РІС‚СЂР°
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р±Р°РіРё РїРѕСЃР»Рµ warm: gap headerв†’chips + clipped CTA; TZ+checklist.
**Р¤Р°Р№Р»С‹:** `tasks/TZ-DICT-312.md`, checklist, active-map, PO-DIARY
**РљСЂРёС‚РµСЂРёРё:** executable TZ
**РР·РІРµСЃС‚РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ:** РЅРµ С‡РёРЅРёС‚СЊ СЃРµРіРѕРґРЅСЏ Р±РµР· Р·Р°РїСЂРѕСЃР° PO

---

## [2026-08-08] вЂ” TZ-UI-SELECT-301 DONE: Catalog overflow search migration
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / openai/gpt-5.6-luna
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock created; commit/push in this closeout
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Р Р°СЃС‚СѓС‰РёРµ selectors РєР°С‚РµРіРѕСЂРёР№, РїРѕСЃС‚Р°РІС‰РёРєРѕРІ, Р·Р°РєР°Р·С‡РёРєРѕРІ, РѕР±СЉРµРєС‚РѕРІ, РѕСЂРіР°РЅРёР·Р°С†РёР№ Рё РїСЂРѕРґСѓРєС†РёРё РїРµСЂРµРІРµРґРµРЅС‹ РЅР° `app-pi-overflow-select` СЃ `searchable=auto`; enum selects СЃРѕС…СЂР°РЅРµРЅС‹; inventory docs РѕР±РЅРѕРІР»РµРЅС‹.
**Gates:** targeted Jest 35 PASS; scoped ESLint 0 errors (one existing architecture warning); Prettier PASS; diff-check PASS. Full FE tsc has one unrelated baseline error from existing materials list WIP importing untracked `material-dimensions` helper.
**Archive:** `tasks/_archive/2026-08/TZ-UI-SELECT-301.done.md`
**Lock:** `.mimocode/locks/TZ-UI-SELECT-301.lock`

---

## [2026-08-08] вЂ” TZ-UX-COMPOSE-301 DONE: Module composition discoverability
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (freebuff claim worktree)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock + checklist; commit/push РІ СЌС‚РѕРј closeout
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** ModuleForm РїРѕРєР°Р·С‹РІР°РµС‚ hint В«РЎРѕСЃС‚Р°РІ (РјРѕРґСѓР»Рё Рё РјР°С‚РµСЂРёР°Р»С‹) вЂ” РЅР° РєР°СЂС‚РѕС‡РєРµ РјРѕРґСѓР»СЏ РёР»Рё РІ QC LВ»; picker `restrictToModule` РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РЅР° РІРєР»Р°РґРєРµ **РњР°С‚РµСЂРёР°Р»** (РњРѕРґСѓР»СЊ РѕСЃС‚Р°С‘С‚СЃСЏ) + hint В«РјРѕРґСѓР»СЊ РёР»Рё РјР°С‚РµСЂРёР°Р»В»; РїСЂРё РІС‹Р±РѕСЂРµ РјР°С‚РµСЂРёР°Р»Р°/Р»РёСЃС‚Р° РІ РґРµСЂРµРІРµ РєРЅРѕРїРєР° В«+ Р’ РєРѕСЂРµРЅСЊ РёР·РґРµР»РёСЏ/РјРѕРґСѓР»СЏВ» РѕСЃС‚Р°С‘С‚СЃСЏ РґРѕСЃС‚СѓРїРЅРѕР№ (`bom-add-root-into`) вЂ” РЅРµС‚ С‚СѓРїРёРєР°. РњР°С‚СЂРёС†Р° РІРєР»СЋС‡С‘РЅРЅРѕСЃС‚Рё Р·Р°РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅР° РІ module/product-detail. Р‘РѕРЅСѓСЃ-С„РёРєСЃ: quick-create spec override РґРѕРїРѕР»РЅРµРЅ `PiOverflowSelectComponent` (РїР°РґР°Р» РїРѕР»РЅС‹Р№ СЃСЊСЋС‚ РїРѕСЃР»Рµ SELECT-301).
**Gates:** tsc PASS; targeted Jest 20/20 PASS; РїРѕР»РЅС‹Р№ СЃСЊСЋС‚ 129 suites / 1212 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-COMPOSE-301.done.md`
**Lock:** `.mimocode/locks/TZ-UX-COMPOSE-301.lock`

---

## [2026-08-08] вЂ” TZ-UX-DIALOG-305 DONE: Catalog kind-C width parity
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy (freebuff claim worktree)
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock + checklist; commit/push РІ СЌС‚РѕРј closeout
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Module FullEditor РїРµСЂРµРІРµРґС‘РЅ СЃ form lg (~640) РЅР° kind C `variant="content"` + `maxWidth min(1120px, calc(100vw - 2rem))`; composition picker В«Р”РѕР±Р°РІРёС‚СЊ РІ СЃРѕСЃС‚Р°РІВ» вЂ” СЃ form xl (~920) РЅР° С‚Сѓ Р¶Рµ 1120 clamp (`form` + `maxWidth`). Opener `width` РёРЅРµСЂС‚РµРЅ (РєРѕРјРїРѕРЅРµРЅС‚ СЂРµС€Р°РµС‚ СЃР°Рј). Cookbook kind C + canon РґРѕРїРѕР»РЅРµРЅС‹; Р°СѓРґРёС‚ `docs/audits/2026-08-09-catalog-dialog-width-parity.md`.
**Gates:** tsc PASS; targeted Jest 15/15 PASS; РїРѕР»РЅС‹Р№ СЃСЊСЋС‚ 129 suites / 1214 tests PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-305.done.md`
**Lock:** `.mimocode/locks/TZ-UX-DIALOG-305.lock`

---

## [2026-08-09] вЂ” TZ-SALES-323 DONE: Create РљРџ A4 fit Р±РµР· scrollbar
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; PO visual PASS on canonical `main`; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** FE contain-scale СЃ safety inset/ResizeObserver Рё bounded portrait/landscape A4 build page box; РїРѕРґС‚РІРµСЂР¶РґРµРЅС‹ РѕС‚СЃСѓС‚СЃС‚РІРёРµ H/V scrollbar Рё scrollWidth/scrollHeight <= client + 1px.
**Gates:** backend tsc PASS; document build e2e 8/8 PASS; frontend tsc PASS; proposal-create 9/9 PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-323.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-323-create-kp-a4-fit-no-scroll.lock`

---

## [2026-08-09] вЂ” TZ-SALES-324 DONE: Empty table skeleton
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** `TableTemplateService.preview()` РїСЂРё РїСѓСЃС‚С‹С… sampleRows Рё РѕР±СЉСЏРІР»РµРЅРЅС‹С… columns СЃРѕС…СЂР°РЅСЏРµС‚ РіРµРѕРјРµС‚СЂРёСЋ С‚Р°Р±Р»РёС†С‹: thead СЃ labels + СЂРѕРІРЅРѕ РѕРґРЅР° РїСѓСЃС‚Р°СЏ data-row; plain В«РќРµС‚ РґР°РЅРЅС‹С…В» Р±РѕР»СЊС€Рµ РЅРµ Р·Р°РјРµРЅСЏРµС‚ С‚Р°Р±Р»РёС†Сѓ.
**Gates:** backend tsc PASS; table-template e2e 8/8 PASS; document-template build e2e 9/9 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-324.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-324-empty-table-skeleton-blank.lock`

---

## [2026-08-09] вЂ” TZ-SALES-329 DONE: Deals в†’ Create РљРџ default landing
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** РІС…РѕРґ В«РЎРґРµР»РєРёВ» Рё С‚С‘РјРЅС‹Р№ chip В«РљРџВ» РІРµРґСѓС‚ РЅР° `/proposals/create`; Р¶С‘Р»С‚С‹Р№ В«Р’СЃРµ РљРџВ» СЃРѕС…СЂР°РЅСЏРµС‚ `/proposals`, Р° `/proposals` РѕСЃС‚Р°С‘С‚СЃСЏ active alias РґР»СЏ Deals.
**Gates:** frontend tsc PASS; deals-group-chips 2/2 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-329.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-329-default-land-create-kp.lock`

---

## [2026-08-09] вЂ” TZ-SALES-326 DONE: Wider products flyout + outside dismiss
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor visual PASS; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** products flyout capped at 40rem; transparent backdrop closes left/right panels through center and iframe; A4 rails|center|rails geometry remains unchanged; template binding compile fix included.
**Gates:** frontend tsc PASS; ng build PASS with existing budget warnings; proposal-create 11/11 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-326.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-326-products-flyout-wide-dismiss.lock`

---

## [2026-08-09] вЂ” TZ-DOC-344 DONE: Builder default background star fill closeout
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-3e757640b7
**РЎС‚Р°С‚СѓСЃ:** DONE; PO accepted one-background behavior; star-fill fix self-checked; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** active/default background star now visibly uses yellow fill through the nested Lucide SVG/path; inactive stars stay outline-only. Existing single-default canvas and upload healing remain unchanged.
**Gates:** frontend tsc PASS; builder-inspector + builder.page 43/43 PASS; diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-344.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-344-builder-single-default-background.lock`
**Scope:** foreign DOC-343 checklist/backend WIP and dirty `document-template.service.ts` excluded; DOC-342, SALES-*, 322/320, deploy untouched.

---

## [2026-08-09] вЂ” TZ-SALES-325 DONE: draftLines в†’ assigned line-items table
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / agent-6c3d05b80e
**РЎС‚Р°С‚СѓСЃ:** DONE; Cursor/PO visual PASS; archive + lock + checkpoint completed
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** Create РљРџ sends request-only `previewLines`; explicit `kpLineItems`/`line-items` target selection fills only the assigned live table, while empty lines preserve the 324 skeleton and snapshots remain untouched.
**Gates:** backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 11/11; diff-check PASS.
**Implementation:** `e1e84cb8`
**Archive:** `tasks/_archive/2026-08/TZ-SALES-325.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-325-draftlines-table-bind.lock`
**Scope:** foreign DOC-343 dirty WIP and `document-template.service.ts` orientation change preserved/excluded; deploy NO.

---

## [2026-08-09] вЂ” TZ-SALES-335 DONE: KP line-item columns, quantity and photo cell
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / canonical `D:\\kppdf-8.0` `main`
**РЎС‚Р°С‚СѓСЃ:** DONE; feature `d6bd43b9` pushed; closeout archive + lock + active removal in progress
**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ РєСЂР°С‚РєРѕ:** СЌРєР·РµРјРїР»СЏСЂ РІС‹Р±СЂР°РЅРЅРѕР№ live line-items С‚Р°Р±Р»РёС†С‹ РїРѕР»СѓС‡Р°РµС‚ request-only В«РљРѕР»-РІРѕВ»/В«Р¦РµРЅР°В»/В«РЎСѓРјРјР°В»; РєРѕР»РёС‡РµСЃС‚РІРѕ СЂРµРґР°РєС‚РёСЂСѓРµС‚СЃСЏ РІ rail В«РўРѕРІР°СЂС‹В» Рё РїРµСЂРµСЃС‚СЂР°РёРІР°РµС‚ A4; `photoUrl` СЂРµРЅРґРµСЂРёС‚СЃСЏ РєР°Рє thumb С‚РѕР»СЊРєРѕ РІ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµР№ РєРѕР»РѕРЅРєРµ В«Р РёСЃСѓРЅРѕРєВ».
**Gates:** frontend/backend tsc PASS; proposal/Create Jest 23/23; table-template Jest 2/2; Prettier/ESLint/diff-check PASS.
**Browser:** template + product with photo selected; quantity `1 в†’ 3`; A4 showed В«РљРѕР»-РІРѕВ» 3, В«Р¦РµРЅР°В» 7 000,00 в‚Ѕ, В«РЎСѓРјРјР°В» 21 000,00 в‚Ѕ; shared TableTemplate received no PATCH.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-335.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-335-kp-line-items-columns-photo.lock`
**Next:** TZ-SALES-336; deploy NO.

## [2026-08-10T16:34:00Z] вЂ” TZ-PRODUCTS-310 DONE: Product edit Йµcmp cycle removed
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE typecheck/build/focused tests/static import check PASS; deploy РќР•
**Р§С‚Рѕ:** `ProductBomPanelComponent` Р±РѕР»СЊС€Рµ РЅРµ РёРјРїРѕСЂС‚РёСЂСѓРµС‚ `ProductFormDialogComponent` СЃС‚Р°С‚РёС‡РµСЃРєРё. Nested edit Р·Р°РіСЂСѓР¶Р°РµС‚ FullEditor РґРёРЅР°РјРёС‡РµСЃРєРё РїРѕСЃР»Рµ `ProductsService.findById`, РїРѕСЌС‚РѕРјСѓ `ProductFormDialog` РјРѕР¶РµС‚ Р±РµР·РѕРїР°СЃРЅРѕ РІСЃС‚СЂР°РёРІР°С‚СЊ BOM panel Р±РµР· undefined `Йµcmp`.
**Gates:** frontend tsc PASS; focused `product-form-dialog` + `product-bom-panel` Jest 33/33 PASS; Angular development build PASS; ESLint PASS; diff-check PASS. Madge РїРѕРєР°Р·С‹РІР°РµС‚ intentional dynamic edge Рё РѕС‚РґРµР»СЊРЅС‹Р№ pre-existing template-block cycle; СЃС‚Р°С‚РёС‡РµСЃРєР°СЏ РІР·Р°РёРјРЅР°СЏ СЃРІСЏР·СЊ РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-310.done.md`
**Lock:** `.mimocode/locks/TZ-PRODUCTS-310-product-bom-circular-cmp.lock`
**Known limit:** live browser/data smoke РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ РІ РёР·РѕР»РёСЂРѕРІР°РЅРЅРѕР№ СЃРµСЃСЃРёРё; deploy РќР•.
**NEXT:** claim TZ-DICT-317 СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё.

## [2026-08-10T16:43:00Z] вЂ” TZ-DICT-317 DONE: Units CRUD edit + manager roles
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE/BE typecheck, focused tests, FE build, ESLint and diff-check PASS; deploy РќР•
**Р§С‚Рѕ:** РќР° СЃС‚СЂР°РЅРёС†Рµ В«РР·РјРµСЂРµРЅРёСЏВ» РєР°СЂР°РЅРґР°С€ С‚РµРїРµСЂСЊ РѕС‚РєСЂС‹РІР°РµС‚ РєРѕРјРїР°РєС‚РЅС‹Р№ РґРёР°Р»РѕРі СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ РЅР°Р·РІР°РЅРёСЏ, СЃРёРјРІРѕР»Р° Рё РєР°С‚РµРіРѕСЂРёРё; РїРѕСЃР»Рµ PATCH СЃРїРёСЃРѕРє РѕР±РЅРѕРІР»СЏРµС‚СЃСЏ. POST/PATCH/DELETE РµРґРёРЅРёС† СЂР°Р·СЂРµС€РµРЅС‹ `admin` Рё `manager`, С‡С‚РµРЅРёРµ РѕСЃС‚Р°РІР»РµРЅРѕ `user`; СѓРґР°Р»РµРЅРёРµ СЃРёСЃС‚РµРјРЅС‹С… РµРґРёРЅРёС† РїРѕ-РїСЂРµР¶РЅРµРјСѓ Р·Р°РїСЂРµС‰РµРЅРѕ.
**Gates:** Measurements Jest 6/6; Unit RBAC Jest 2/2; frontend/backend tsc PASS; frontend development build PASS; ESLint/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-317.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-317-units-crud-edit-roles.lock`
**Known limit:** live browser/data smoke РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ РІ РёР·РѕР»РёСЂРѕРІР°РЅРЅРѕР№ СЃРµСЃСЃРёРё; deploy РќР•.
**NEXT:** claim TZ-DICT-318 СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё.

## [2026-08-10T16:47:00Z] вЂ” TZ-DICT-318 DONE: RAL auto-prefix and digit input
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / continuous executor
**РЎС‚Р°С‚СѓСЃ:** DONE; FE typecheck/build/focused tests/ESLint/diff-check PASS; deploy РќР•
**Р§С‚Рѕ:** Р’ СЃРїСЂР°РІРѕС‡РЅРёРєРµ С†РІРµС‚РѕРІ РєРѕРґ RAL РІРІРѕРґРёС‚СЃСЏ С‡РµС‚С‹СЂСЊРјСЏ С†РёС„СЂР°РјРё СЃ readonly-РїСЂРµС„РёРєСЃРѕРј `RAL`; РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕРµ РЅР°Р·РІР°РЅРёРµ С„РѕСЂРјРёСЂСѓРµС‚ `RAL 9003 вЂ” РЎРёРіРЅР°Р»СЊРЅС‹Р№ Р±РµР»С‹Р№`. Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ СЂР°Р·Р±РёСЂР°РµС‚ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ RAL name, Р° РЅРµ-RAL РёРјРµРЅР° РЅРµ РјРµРЅСЏРµС‚. РќРµРёСЃРїРѕР»СЊР·СѓРµРјС‹Р№ plural dialog twin СѓРґР°Р»С‘РЅ РїРѕСЃР»Рµ grep РёРјРїРѕСЂС‚РѕРІ.
**Gates:** focused dialog/page Jest 21/21; frontend tsc PASS; frontend development build PASS; ESLint/dead-twin grep/diff-check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-DICT-318.done.md`
**Lock:** `.mimocode/locks/TZ-DICT-318-ral-auto-prefix.lock`
**Known limit:** live browser/data smoke РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ РІ РёР·РѕР»РёСЂРѕРІР°РЅРЅРѕР№ СЃРµСЃСЃРёРё; deploy РќР•.
**NEXT:** claim TZ-MATERIALS-312 СЃС‚СЂРѕРіРѕ РїРѕ РѕС‡РµСЂРµРґРё.

## [2026-08-12T16:29:00Z] вЂ” TZD-40 DONE: Desktop version gate
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / С„РѕРЅРѕРІС‹Р№ desktop РёСЃРїРѕР»РЅРёС‚РµР»СЊ
**РЎС‚Р°С‚СѓСЃ:** DONE; BE tsc + jest desktop 10/10; FE tsc + jest desktop 12/12; desktop typecheck + svelte-check + mcp:check 110/110; diff-check PASS; deploy РќР•
**Р§С‚Рѕ:** РџСѓР±Р»РёС‡РЅС‹Р№ GET /api/desktop/compat (env DESKTOP_MIN_VERSION / DESKTOP_RECOMMENDED_VERSION / DESKTOP_DOWNLOAD_URL / APP_VERSION, fail-open). Desktop РїРѕСЃР»Рµ /auth/me СЃРІРµСЂСЏРµС‚ СЃРІРѕСЋ РІРµСЂСЃРёСЋ (tauri) СЃ РєРѕРЅС‚СЂР°РєС‚РѕРј: РЅРёР¶Рµ min в†’ РєСЂР°СЃРЅС‹Р№ Р±Р°РЅРЅРµСЂ + MCP РЅРµ СЃС‚Р°СЂС‚СѓРµС‚, РјРµР¶РґСѓ min Рё recommended в†’ Р¶С‘Р»С‚С‹Р№ Р±Р°РЅРЅРµСЂ, в‰Ґ recommended в†’ С‚РёС€РёРЅР°. Р’РµР±-РґРёР°Р»РѕРі РїР°СЂРёРЅРіР° РїРѕРєР°Р·С‹РІР°РµС‚ В«РђРєС‚СѓР°Р»СЊРЅР°СЏ РІРµСЂСЃРёСЏ Desktop: X (РјРёРЅ. Y)В». Docs INSTALL/PAIRING + config.env.example.
**Archive:** tasks/_archive/2026-08/TZD-40.done.md
**Lock:** .mimocode/locks/TZD-40-desktop-version-gate.lock (local, gitignored)
**Known limit:** Р±РµР· warm deploy env Р±Р°РЅРЅРµСЂ РЅРµ РїРѕСЏРІРёС‚СЃСЏ; СЃС‚Р°СЂС‹Р№ Desktop Р±РµР· РєРѕРґР° Р±Р°РЅРЅРµСЂ РЅРµ РїРѕРєР°Р¶РµС‚ (СЂСѓС‡РЅРѕР№ update).
**NEXT:** TZD-45 MCP production/supply READ.

## [2026-08-12T16:36:00Z] вЂ” TZD-45 DONE: MCP production + supply read-first
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / С„РѕРЅРѕРІС‹Р№ desktop РёСЃРїРѕР»РЅРёС‚РµР»СЊ
**РЎС‚Р°С‚СѓСЃ:** DONE; desktop/mcp tsc + tests 114/114 PASS; deploy РќР•
**Р§С‚Рѕ:** read-first MCP: production-tools.ts (work-types / production-orders / work-orders) + supply-tools.ts (supply-tasks / purchase-requests / purchase-orders) вЂ” 10 РЅРѕРІС‹С… GET-tools РїРѕ Р¶РёРІС‹Рј Nest routes (grep controllers, РЅРµ invent). Р РµРµСЃС‚СЂ toolCount 83 в†’ 93; MCP.md СЂР°Р·РґРµР»С‹ production/supply.
**Archive:** tasks/_archive/2026-08/TZD-45.done.md
**Known limit:** С‚РѕР»СЊРєРѕ read; write-heavy HITL / С‚РµРЅРґРµСЂС‹ / СЃРµР±РµСЃС‚РѕРёРјРѕСЃС‚СЊ / Р“Р°РЅС‚ вЂ” successor РїРѕСЃР»Рµ smoke PO.
**NEXT:** Р¤РѕРЅРѕРІС‹Р№ Р°РіРµРЅС‚ СЃРІРѕР±РѕРґРµРЅ (40/45 Р·Р°РєСЂС‹С‚С‹).

## [2026-08-12T19:20:00Z] вЂ” TZ-MIG-301 DONE: РљРџ3 extract + field mapping audit
**РСЃРїРѕР»РЅРёС‚РµР»СЊ:** Buffy / data migration analyst (read-only Рє РљРџ3)
**РЎС‚Р°С‚СѓСЃ:** DONE; SSH BatchMode OK; counts 699/23/28; media 690 в‰€82MB; git check-ignore РґР°РјРїРѕРІ OK; deploy РќР•
**Р§С‚Рѕ:** Р’С‹РіСЂСѓР¶РµРЅ РљРџ3 (Mongo `kp-app` + `/opt/kppdf/media`) в†’ `data/from-kp3/` (raw JSON c `_id` СЃС‚СЂРѕРєР°РјРё, media, photos-index 661, id-map 699/23/28). РђСѓРґРёС‚ `docs/audits/2026-08-12-kp3-to-kp8-field-map.md`: РїРѕР»РЅС‹Р№ field-map СЃ РІРµСЂРґРёРєС‚Р°РјРё. gap-block (3): С„РѕС‚Рѕ (РЅРµС‚ MCP upload), Counterparty.email (РЅРµС‚ РїРѕР»СЏ), Р±СЂРµРЅРґРёРЅРі РљРџ (РЅРµС‚ СЃР»РѕС‚Р°). Р’ SoT РљРџ8 РЅРёС‡РµРіРѕ РЅРµ РїРёСЃР°Р»; FE/BE schema РЅРµ С‚СЂРѕРЅСѓС‚С‹.
**Archive:** tasks/_archive/2026-08/TZ-MIG-301.done.md
**Lock:** .mimocode/locks/TZ-MIG-301-kp3-extract-map.lock (local, gitignored)
**NEXT:** Р¶РґР°С‚СЊ РІРµСЂРґРёРєС‚ PO РїРѕ gap-СЃРїРёСЃРєСѓ в†’ MIG-302 (map/rename С‡Р°СЃС‚СЊ) РїРѕСЃР»Рµ OK.

-   2 0 2 6 - 0 8 - 1 9   025@H5=>:   T Z - S A L E S - 3 8 0   ( d e f a u l t S h e e t L a y o u t   4;O  H01;>=>2)  
 2 0 2 6 - 0 8 - 1 9 :   025@H5=>  T Z - S A L E S - 3 8 0   ( k p - t e m p l a t e - p a g e - b r e a k - d e f a u l t s )      45D>;B=K5  =0AB@>9:8  p a g e   b r e a k s   =0  C@>2=5  1;0=:0.  
 -   2 0 2 6 - 0 8 - 1 9   025@H5=>:   T Z - S A L E S - 3 7 7   ( C o n t i n u a t i o n   p a g e s      D>=  +   B01;8F0)  
 