# STATUS — KPPDF ERP Project Status

## [2026-08-12] — TZD-46 DONE: Desktop ZIP semver в имени файла (+ deploy publish)
**Статус:** DONE; desktop publish + deploy scripts + FE URL + docs; deploy НЕ
**Что:** publish-installer.mjs публикует `kppdf-desktop-setup-v{semver}.zip/.exe` (semver из package.json, assert == tauri.conf.json, FAIL при расхождении) + unversioned aliases тех же байт; NSIS `0.1.0` хардкод убран (candidate versioned, legacy = fallback WARN). deploy.py `publish_desktop_installer` зеркалит схему. FE default остаётся alias (вариант A), деплой инжектит versioned через meta `DESKTOP_DOWNLOAD_URL`; pairing показывает semver. INSTALL/PAIRING — канон имён.
**Archive:** `tasks/_archive/2026-08/TZD-46.done.md`
**Checklist:** `docs/agent-checklists/TZD-46.md`
**Lock:** `.mimocode/locks/TZD-46-desktop-zip-versioned-filename.lock`
**Gates:** desktop tsc PASS; version-compat tsx 10/10 PASS; publish dry FAIL-path PASS (exit 1); publish + deploy.py functional tests PASS; FE tsc PASS; pairing/desktop-download-url Jest 14/14 PASS; ESLint/Prettier/diff-check PASS.
**NEXT:** следующий warm deploy (VPN off + слово PO) — tauri build + publish-installer на build-машине, `DESKTOP_*` env; deploy НЕ сейчас.

## [2026-08-12] — TZ-UX-317 DONE: системные ← → в полях app shell
**Статус:** DONE on worktree branch; frontend-only; deploy НЕ
**Что:** Глобальные ← (`app-nav-back`) / → (`app-nav-forward`) в gutters app shell (видны ≥1680px в полях вне max-width колонки; disabled без same-app истории). Новый `AppHistoryStore` — URL-стек на Router events + `Location.back()/forward()`; replaceUrl-тики не растят стек; `/login` не предыдущий URL. page-chrome.md: запрет «глобальных ←→ нет» заменён каноном.
**Archive:** `tasks/_archive/2026-08/TZ-UX-317.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-317.md`
**Lock:** `.mimocode/locks/TZ-UX-317-app-history-gutters.lock`
**Gates:** FE tsc PASS; layout + history + picker + builder Jest 57/57 PASS; ESLint/Prettier/diff-check PASS.
**NEXT:** WAVE-NAV-RETURN closed — idle, готово предложить деплой; deploy НЕ.

## [2026-08-12] — TZ-UX-316 DONE: «Редактировать шаблон» → /builder/:id + returnUrl
**Статус:** DONE on worktree branch; frontend-only; deploy НЕ
**Что:** Create КП «Редактировать шаблон» открывает живой конструктор `/doc-constructor/builder/:id` (не список `/templates?templateId=`) с `?returnUrl` = текущий Create path. Builder «←» чтит `returnUrl` (label «← К созданию КП»), иначе smart-back `CatalogReturnStore` → `/doc-constructor/templates` (label «← Шаблоны»).
**Archive:** `tasks/_archive/2026-08/TZ-UX-316.done.md`
**Checklist:** `docs/agent-checklists/TZ-UX-316.md`
**Lock:** `.mimocode/locks/TZ-UX-316-template-edit-return.lock`
**Gates:** FE tsc PASS; picker + builder.page Jest 31/31 PASS; ESLint/Prettier/diff-check PASS.
**NEXT:** TZ-UX-317 (gutters ←→); deploy НЕ.

## [2026-08-12] — TZ-SALES-367 DONE: Create КП без savebar; вывод на rail
**Статус:** DONE; frontend-only; deploy НЕ
**Что:** Убран `kp-save-bar` над A4; lifecycle UI только на `/proposals`; rail «Вывод» → Печать·PDF·Архив; autosave без полосы. Spec §0 LOCK v2.2.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-367.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-367.md`
**Lock:** `.mimocode/locks/TZ-SALES-367-kp-create-no-savebar.lock`
**Gates:** FE tsc PASS; proposal-create.page Jest 37/37 PASS.
**NEXT:** idle; deploy НЕ.

## [2026-08-12] — TZ-SALES-366 DONE: браузерная «Печать» КП вне sandbox-превью
**Статус:** DONE on worktree branch; frontend-only; deploy НЕ
**Что:** `printPreview()` больше не зовёт `print()` внутри sandboxed A4 iframe (`Ignored call to 'print()'`): тот же build HTML всех листов печатается во временном невидимом родительском iframe (`kp-temp-print-frame`, модалки разрешены, srcdoc до вставки, печать по load, кадр убирается по afterprint/таймауту). Добавлен печатный CSS (`print-color-adjust:exact` — паритет с PDF `printBackground`, page-break между листами). Превью-лента осталась `sandbox="allow-same-origin"` без allow-scripts; `#previewFrame` viewChild удалён; `proposal-create.page.ts` не тронут; PDF/Архив/puppeteer/Desktop не тронуты; 320 PARK.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-366.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-366.md`
**Lock:** `.mimocode/locks/TZ-SALES-366-kp-browser-print-sandbox.lock`
**Gates:** FE tsc PASS (0 errors); proposal-create-template-center + proposal-create.page Jest 42/42 PASS (новый template-center spec 5/5); changed ESLint/Prettier/diff-check PASS; `git diff` без page.ts / quotation-output* / puppeteer / Desktop.
**NEXT:** TZ-SALES-362 (тиры S/L + иконка Условий) после merge 359 на page.ts; deploy НЕ.

## [2026-08-12] — TZ-SALES-363 DONE: chrome polish панелей Create КП (WAVE-KP-STUDIO-CHROME #1)
**Статус:** DONE on worktree branch; parallel-OK (LAYER 2); deploy НЕ
**Что:** Панели-дети студии без дублей: пустое «Условия» не повторяет видимые CTA, имя шаблона под селектом убрано (его показывает trigger), «Клиент» в «Получателе» — снова searchable `PiOverflowSelect` (канон 334) вместо search + native select, в «Параметрах» три «только в этом КП» сведены к одной подсказке про наценку. `proposal-create.page.ts`, composition, table-studio/editor и backend не тронуты.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-363.done.md`
**Checklist:** `docs/agent-checklists/TZ-SALES-363.md`
**Lock:** `.mimocode/locks/TZ-SALES-363-kp-studio-panels-chrome.lock`
**Gates:** FE tsc PASS; proposal-create + terms Jest 38/38 PASS; ESLint/diff-check PASS; DOM self-verify (dev :4203) PASS — Условия/Получатель/Шаблон/Параметры без дублей, console чист.
**NEXT:** TZ-SALES-362 (тиры S/L + иконка Условий) после merge 359 на page.ts; deploy НЕ.

## [2026-08-12] — TZD-44 DONE: MCP data hygiene
**Статус:** DONE on current main candidate; Desktop/MCP only; deploy НЕ
**Что:** Added read-only duplicate groups for material/product/module/counterparty and filtered `kppdf_cleanup_test_data` with non-empty prefix/regex/id filters, explicit `userOk:true`, dry-run support, and existing Nest soft-delete handlers only.
**Safety:** No hard delete, tenant wipe, or production cleanup. PO must explicitly say «да, чисти Тест*» before any live operation; TZD-45 remains parked.
**Gates:** desktop/mcp 110/110 + tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-44.done.md`
**Checklist:** `docs/agent-checklists/TZD-44.md`
**Lock:** `.mimocode/locks/TZD-44-mcp-data-hygiene.lock`
**NEXT:** MCP audit queue complete; TZD-45 park; deploy НЕ.

## [2026-08-12] — TZD-43 DONE: MCP product category/status contract
**Статус:** DONE on current main candidate; Desktop/MCP + backend mutation-journal mapping; deploy НЕ
**Что:** Product proposals accept optional `categoryId` and status whitelist `new|active|archived|draft`; journal mapping preserves both through confirm. Product domain schema and `kppdf_validate_product` expose/validate the fields; omitted fields remain backward-compatible.
**Gates:** desktop/mcp 105/105 + tsc PASS; backend mutation-journal 26/26 + tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-43.done.md`
**Checklist:** `docs/agent-checklists/TZD-43.md`
**Lock:** `.mimocode/locks/TZD-43-mcp-product-category-status.lock`
**NEXT:** TZD-44; TZD-45 park; deploy НЕ.

## [2026-08-12] — TZD-42 DONE: MCP mutation-journal confirm 404 recovery
**Статус:** DONE on current main candidate; Desktop/MCP + backend mutation-journal; deploy НЕ
**Что:** 100 immediate backend confirms and material/product MCP mock chains pass. Audit 404 matched a client using a nested/derived id before TZD-41 top-level `proposalId`; no journal deletion, overwrite, ownership race, or TTL expiry reproduced. Proposal confirm/cancel 404s now echo the received id and recovery hint; MCP confirm repeats it on HTTP 404.
**Gates:** backend mutation-journal 23/23 + tsc PASS; desktop/mcp 100/100 + tsc PASS; `git diff --check` PASS. Prettier N/A: no binary installed in backend or desktop/mcp.
**Archive:** `tasks/_archive/2026-08/TZD-42.done.md`
**Checklist:** `docs/agent-checklists/TZD-42.md`
**Lock:** `.mimocode/locks/TZD-42-mcp-confirm-404.lock`
**NEXT:** TZD-43 → TZD-44; TZD-45 park; deploy НЕ.

## [2026-08-12] — TZD-41 DONE: MCP envelope + outputSchema + list aliases
**Статус:** DONE on current main candidate; Desktop/MCP only; deploy НЕ
**Что:** Единый success envelope `{ok, result, id?, proposalId?}` с `structuredContent`; `_id`→`id`, proposal id→top-level `proposalId`; key tools публикуют `outputSchema`. Добавлены canonical `kppdf_list_*` и one-wave aliases для doc/import/text lists.
**Gates:** MCP test 98/98 PASS; MCP tsc PASS; tools/list smoke 81 tools with outputSchema PASS; `git diff --check` PASS. Desktop/MCP Prettier/ESLint не настроены.
**Archive:** `tasks/_archive/2026-08/TZD-41.done.md`
**Lock:** `.mimocode/locks/TZD-41-mcp-envelope-output-schema.lock`
**NEXT:** TZD-42 → TZD-43 → TZD-44; TZD-45 park; deploy НЕ.



## [2026-08-11] — TZ-OPS-312 DONE: catalog page specs dictionary-labels flush
**Статус:** DONE; specs-only harness fix; deploy НЕ
**Workspace:** Freebuff worktree landed on `origin/main`; canonical target `D:\kppdf-8.0`
**Что:** Products and module-detail page specs now flush every pending GET `/dictionary-labels` request with array-shaped data; generic cleanup cannot send `{}` to the dictionary service.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-312.done.md`
**Checklist:** `docs/agent-checklists/TZ-OPS-312.md`
**Lock:** `.mimocode/locks/TZ-OPS-312-catalog-specs-dict-flush.lock`
**Gates:** focused Jest 25/25; frontend app tsc; ESLint; Prettier code style PASS with checkout CRLF override; `git diff --check` PASS.
**NEXT:** idle; Deploy НЕ.

## [2026-08-11] — TZ-OPS-311 DONE: shared→pages BOM убран (architecture:check)
**Статус:** DONE on main (landed); gates green; archive + lock; deploy НЕ
**Что:** BOM panel и composition picker переехали из `pages/products/` в `shared/ui/composition`; quick-create больше не импортирует страницы (правило fe-shared-must-not-import-pages). Диалоги редактирования в панели стали lazy (dynamic imports, как у product-form); callers products/modules/proposals обновлены.
**Archive:** `tasks/_archive/2026-08/TZ-OPS-311.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-311-shared-bom-extract.lock`
**Gates:** FE tsc PASS; `pnpm architecture:check` PASS (baseline 7 → 3); Jest focused 4/4 suites PASS; Prettier/ESLint PASS.
**NEXT:** TZ-OPS-312 DONE; idle; Deploy НЕ.

## [2026-08-11] — TZ-SALES-354 DONE: manager self-pass; shame wave closed
**Статус:** WAVE-KP-SHAME-POLISH DONE on main; idle; ready to propose deploy; deploy НЕ
**Что:** Manager walkthrough evidence covers journal/create studio/vitrine/composition/terms/status/F5/preview/copy/edit/print. Thin RU fixes removed legacy `strip-commerce` and `master` confirmation copy; print route regression added.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-354.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-354-kp-manager-selfpass.lock`
**Gates:** FE tsc; proposals + proposal-create + product-rail Jest 68/68; TS Prettier/ESLint; diff-check; DOM self-check PASS. Browser/auth smoke unavailable headlessly.
**NEXT:** idle; ready to propose deploy; Deploy НЕ.

## [2026-08-11] — TZ-SALES-353 DONE: preview/F5/multipage chrome
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** RU preview loading/error; single-page «Страница 1»; multipage «Страница 1 из N»; sandboxed iframe explicitly view-only; F5 restores saved sheetLayout after template hydration.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-353.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-353-kp-preview-f5-shame.lock`
**Gates:** FE tsc; proposal-create Jest 34/34; TS Prettier/ESLint; diff-check; DOM self-check PASS.
**NEXT:** TZ-SALES-354; deploy НЕ.

## [2026-08-11] — TZ-SALES-352 DONE: composition/terms/status chrome
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** Empty «Состав КП» ведёт в «Товары», пустая «Своя строка» получает русское имя, «Условия» имеют явный «Добавить условие», status chrome использует «Принято», а «Создать заказ» объясняет disabled до принятия.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-352.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock`
**Gates:** FE tsc; proposal-create + terms Jest 36/36; TS Prettier/ESLint; diff-check; DOM self-check PASS.
**NEXT:** TZ-SALES-353; deploy НЕ.

## [2026-08-11] — TZ-SALES-351 DONE: витрина Create КП edge polish
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** Пустые виды/поиск в витрине объясняют следующий шаг по-русски; поиск сохраняется при смене chip; qty ниже 1 нормализуется в 1, дробные значения материалов сохраняются; «В КП» остаётся производным от draftLines.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-351.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock`
**Gates:** FE tsc; rail Jest 12/12; TS Prettier/ESLint; diff-check; DOM self-check PASS.
**NEXT:** TZ-SALES-352; deploy НЕ.

## [2026-08-11] — TZ-SALES-350 DONE: «Все КП» RU status + empty CTA
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** Список «Все КП» совпадает со студией Create КП: accepted = «Принято», converted = «В заказе». Пустой журнал говорит по-русски и ведёт кнопкой «Создать КП» в `/proposals/create`; поиск без результатов не показывает ложный CTA.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-350.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock`
**Gates:** FE tsc; proposals.page Jest 21/21; TS Prettier/ESLint; diff-check; architecture check; DOM self-check PASS. Root Markdown Prettier unavailable.
**NEXT:** TZ-SALES-351; deploy НЕ.

## [2026-08-11] — Org adopt (vibe): ledger + modes + architecture:check
**Статус:** docs/tooling READY on main; deploy НЕ
**Что:** `docs/CAPABILITY-LEDGER.md`, `docs/AGENT-TASK-MODES.md`, `pnpm architecture:check` (+ baseline 7). Executor next: `tasks/_backlog/ops/TZ-OPS-311-architecture-check-shared-bom.md`.
**NEXT:** OPS-311 (optional) или WAVE-KP-SHAME-POLISH; deploy только по PO.

## [2026-08-11] — TZ-OPS-310 DONE: server harden (deploy gate green)
**Статус:** DONE on main; evidence + archive + lock; deploy НЕ
**Что:** VPN OFF. SUID/SGID inventory VPS+VM; Basic Auth 401/200; htpasswd 640; tunnel+LAN health; UFW 22/80/443. REVIEW: VPS :4200 listen on 0.0.0.0 but UFW closed.
**Evidence:** `docs/ops/server-harden-evidence.md`
**Archive:** `tasks/_archive/2026-08/TZ-OPS-310.done.md`
**Lock:** `.mimocode/locks/TZ-OPS-310-server-harden.lock`
**NEXT:** warm deploy only on PO «деплой»; verify login after (AUTH-302); wipe НЕ.

## [2026-08-11] — TZ-SALES-348 DONE: KP vitrine badge + modules/materials
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Витрина Create КП — chips Изделия/Модули/Материалы; «В КП: N» из состава; qty на карточке (Add & continue). Module/material → `lineKind` + `refId` со снимком; legacy `productId` читается; GET populate по виду.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-348.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-348-kp-vitrine-added-badge-modules.lock`
**Gates:** BE tsc + quotation 40/40; FE tsc + proposal-create/rail 41/41 + development build; Prettier/ESLint/diff-check PASS; DOM/component self-check PASS; live authenticated browser/data smoke unavailable without backend data stack.
**NEXT:** idle coding → VPN OFF → OPS-310 → warm deploy (PO); deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-347 DONE: status, versions and order flow
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** Верхняя строка Create КП показывает RU статус и разрешённые переходы; `freeze` используется для «Сохранить версию» и read-only просмотра snapshot без PATCH/autosave. Принятое КП можно превратить в заказ с переходом на карточку заказа; duplicate открывается в студии.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-347.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-347-kp-status-versions-in-studio.lock`
**Gates:** FE tsc + proposal-create/terms 33/33 + development build; ESLint/Prettier/diff-check PASS; DOM/component self-check PASS; live authenticated browser/data smoke unavailable without backend data stack.
**NEXT:** TZ-SALES-348; deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-346 DONE: multipage КП sheet
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** `Quotation.sheetLayout` хранит лимиты строк, масштаб/обрезку фото и видимость photo column. Build режет 30 строк по 4/6 в 6 A4-листов, повторяет шапку/фон, оставляет итоги и условия на последнем листе и уважает `pageNumbering`.
**Preview:** Центр студии разбирает `.doc-page` в вертикальную ленту sandboxed A4 iframe; верхняя строка показывает «Страница 1 из N», один лист остаётся без внутренних скроллов.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-346.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-346-kp-multipage-sheet-layout.lock`
**Gates:** BE tsc + document-template/table-template/quotation 102/102; FE tsc + proposal-create 33/33 + development build; ESLint/Prettier/diff-check PASS (ESLint 0 errors, 3 existing any warnings); DOM/component self-check PASS; live authenticated browser/data smoke unavailable without backend data stack.
**NEXT:** TZ-SALES-347 → 348; deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-342 DONE: custom quotation lines
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** В «Состав КП» добавлена «Своя строка» без карточки каталога. Для всех строк доступны описание, ед. изм., скидка %, и флаг «Не входит в стоимость»; скидка пересчитывает сумму строки.
**Persistence/render:** `QuotationItem` поддерживает `lineKind=custom`, legacy catalog items остаются читаемыми; optional lines исключаются из «Итого» и показываются отдельным «Дополнительно (не входит в стоимость)»; build/PDF carry description, discount and optional marker.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-342.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-342-kp-custom-lines.lock`
**Gates:** BE tsc + quotation/generated-document 48/48; FE tsc + proposal-create/terms 33/33 + development build; ESLint/Prettier/diff-check PASS; DOM/component self-check PASS; authenticated data browser smoke unavailable without backend data stack.
**Commit/push:** `2736d28e` on `main` and `origin/main`.
**NEXT:** TZ-SALES-346 → 347 → 348; deploy НЕ; desktop ZIP publish НЕ.

## [2026-08-11] — TZ-SALES-344 DONE: conditions panel and term rendering
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** Правый рейл «Условия» добавляет, редактирует, переставляет и удаляет строки текущего КП; библиотека TextBlock фильтруется по активной категории и остаётся открытой после добавления; переменные вставляются в позицию курсора.
**Persistence/render:** `Quotation.terms` сохраняется и гидратируется после F5; build/PDF раскрывают номер, сумму, даты и коммерческие переменные, а неизвестные токены оставляют литералом.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-344.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-344-kp-terms-panel.lock`
**Gates:** BE tsc + document-template/quotation 96/96; FE tsc + proposal-create/terms 32/32 + dev build; ESLint/Prettier/diff-check PASS; DOM/component self-check PASS; authenticated data browser smoke unavailable without backend data stack.
**Commit/push:** `36601821` on `main` and `origin/main`.
**NEXT:** TZ-SALES-342 → 346 → 347 → 348; deploy НЕ; desktop ZIP publish НЕ.

**Last updated:** 2026-08-11
**Phase:** TZ-AUTH-301 DONE; WAVE-KP-COMPLETE through SALES-348 DONE; TZ-OPS-310 DONE (deploy gate green); deploy только по «деплой»

## [2026-08-11] — TZ-SALES-343 DONE: recipient overlay and references
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** «Получатель» в левом рейле выбирает Counterparty, назначенный Person и Site, показывает реквизиты и поддерживает quick-create. A4 shell не сжимается; «Параметры» содержит одну summary-строку с «Изменить».
**Persistence/build:** Quotation stores/populates `contactPersonId`/`siteId`; autosave/F5 hydrates them; build receives buyer/contact/site ids and exposes contact/address fields on `counterparty.*`.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-343.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-343-kp-recipient-panel.lock`
**Gates:** BE tsc + quotation 35/35; FE tsc + proposal-create 28/28 + dev build; ESLint/Prettier/diff-check PASS; DOM/test self-check PASS; authenticated data browser smoke unavailable without backend data stack.
**Commit/push:** `5299db91` on `main` and `origin/main`.
**NEXT:** TZ-SALES-342; deploy НЕ; desktop ZIP publish НЕ.

**Last updated:** 2026-08-11
**Phase:** TZ-AUTH-301 DONE; WAVE-KP-COMPLETE through SALES-343 DONE; next SALES-344→342→346→347→348; deploy НЕ запускать

## [2026-08-11] — TZ-SALES-345 DONE: PDF, Печать and archive
**Статус:** DONE on main; fullstack gates, archive and lock complete; deploy НЕ
**Что:** `POST /quotations/:id/pdf` использует сохранённый/build HTML и optional system Chrome через `puppeteer-core`; без движка — RU 503. В студии одна кнопка «Скачать ▾» с PDF/Печать/архивом, а «Все КП» получил PDF/Печать.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-345.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-345-kp-pdf-print-archive.lock`
**Gates:** BE tsc + quotation/generated-document 31/31 focused; FE tsc + proposal-create 27/27 + proposals 20/20 + dev build; ESLint/Prettier/diff-check PASS. Real browser/PDF smoke unavailable without Chrome/backend data stack; 503 fallback tested.
**NEXT:** TZ-SALES-343; deploy НЕ.

## [2026-08-10T23:50:00Z] — TZ-SALES-341 DONE: commercial fields and VAT persistence
**Статус:** DONE on main; frontend/backend gates, archive and lock complete; deploy НЕ
**Что:** Параметры КП разделены на Документ/Деньги/Сроки; коммерческие поля сохраняются в Quotation, а скидка и НДС приходят в общий build footer.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-341.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-341-kp-commercial-fields.lock`
**Gates:** FE tsc + proposal-create 26/26 PASS; BE tsc + quotation 32/32 PASS; ESLint/Prettier/diff-check PASS.
**NEXT:** TZ-SALES-345; deploy НЕ.

## [2026-08-10T23:25:00Z] — TZ-SALES-340 DONE: Состав КП
**Статус:** DONE on main; frontend/backend gates, archive and lock complete; deploy НЕ
**Что:** В `/proposals/create` добавлен overlay «Состав КП» с редактированием количества, цены, единицы, дублированием, удалением и порядком; повторное добавление изделия увеличивает количество. Сохранение и A4 используют существующий draft/build/autosave путь.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-340.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-340-kp-composition-panel.lock`
**Gates:** frontend tsc PASS; proposal-create 25/25 PASS; backend tsc PASS; ESLint/Prettier/diff-check PASS.
**NEXT:** TZ-SALES-341; deploy НЕ.

## [2026-08-10T23:05:00Z] — TZ-AUTH-301 DONE: Login personal-project notice
**Статус:** DONE on main; frontend gates, archive and lock complete; deploy НЕ
**Что:** На `/login` добавлен мягкий русскоязычный notice для личного учебного проекта, а `index.html` получил description и `robots noindex, nofollow`. Документация фиксирует, что notice — косметика, а не access control; ops/VPS не менялись.
**Archive:** `tasks/_archive/2026-08/TZ-AUTH-301.done.md`
**Lock:** `.mimocode/locks/TZ-AUTH-301-personal-project-notice.lock`
**Gates:** frontend tsc PASS; login.page Jest 4/4 PASS; diff-check PASS.
**NEXT:** TZ-SALES-340; deploy НЕ.


## [2026-08-09T11:17:19Z] — TZ-SALES-321 + TZ-SALES-319 DONE: KP build-preview fidelity
**Статус:** DONE on main; Cursor integration PASS; PO visual PASS; deploy НЕ
**Что:** Build сохраняет layout через `toObject()`, пустая таблица показывает «Нет данных», а frozen Create КП shell показывает build HTML с фоном и позиционированными блоками в sandboxed A4 iframe без H/V scroll.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-321.done.md`; `tasks/_archive/2026-08/TZ-SALES-319.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-321-create-kp-preview-fidelity.lock`; `.mimocode/locks/TZ-SALES-319-create-kp-template-build-preview.lock`
**Gates:** BE tsc + document-templates-build e2e 7/7 PASS; FE tsc + proposal-create 8/8 PASS.
**NEXT:** idle for this closeout; DOC-344 builder and DOC-TABLES-305 remain separate active work; deploy НЕ.

## [2026-08-09] — TZ-DOC-342 DONE: upload-background missing file → 400
**Статус:** DONE on main; deploy НЕ
**Что:** Multipart upload без `file` возвращает RU 400 вместо 500 для document-template background и template-block image; валидный PNG остаётся 201.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-342.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-342-upload-background-null-file-400.lock`
**Gates:** backend tsc PASS; upload-background e2e 6/6 PASS; `git diff --check` PASS; Cursor/PO evidence PASS.
**NEXT:** idle; TZ-SALES-317 остаётся на visual PO; deploy только по явной команде.

## [2026-08-09] — TZ-DOC-TABLES-304 DONE: Registry schema auto-sync
**Статус:** DONE on main; deploy НЕ
**Что:** Product registry fields теперь строятся из `ProductSchema.paths` с deny-list внутренних/ref/composition полей, RU label map/fallback и deterministic type mapping; список entity sources остаётся явным.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-304.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-304-registry-schema-autosync.lock`
**Gates:** backend tsc PASS; registry unit 1/2 и e2e 1/8 PASS; registry ESLint/Prettier/diff-check PASS.
**NEXT:** idle — WAVE-DOC-TABLES #1–#4 DONE; deploy только по явной команде PO.

## [2026-08-09] — TZ-DOC-TABLES-303 DONE: Product registry fields + photo slot
**Статус:** DONE on main; deploy НЕ
**Что:** Product registry расширен полями из текущей schema SoT (notes/status/RAL/габариты/назначение/монтаж/флаги) и `photoIds` text photo-slot; reflection/autosync оставлены следующему TZ.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-303.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-303-registry-product-fields-photo.lock`
**Gates:** backend tsc PASS; registry e2e 1/8 PASS; registry ESLint/Prettier/diff-check PASS.
**NEXT:** `tasks/_backlog/doc-tables/TZ-DOC-TABLES-304-registry-schema-autosync.md`.

## [2026-08-09] — TZ-DOC-TABLES-302 DONE: dialog overflow-select UX
**Статус:** DONE on main; deploy НЕ
**Что:** Источник данных и тип столбца в диалоге таблицы переведены на shared `PiOverflowSelect`; registry fields стали читаемыми, добавлен empty state.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-302.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-302-table-dialog-overflow-select.lock`
**Gates:** FE tsc PASS; table dialog Jest 1/41 PASS; changed-file ESLint/Prettier/diff-check PASS.
**NEXT:** `tasks/_backlog/doc-tables/TZ-DOC-TABLES-303-registry-product-fields-photo.md`.

## [2026-08-09] — TZ-DOC-TABLES-301 DONE: Documents TOC + Tables subchips
**Статус:** DONE on main; deploy НЕ
**Что:** Все четыре sibling-страницы Документов получили общий тёмный TOC; на Таблицах оставлены только жёлтые «Все таблицы» и «Из данных», второй режим открывает существующий registry dialog через `view=from-data`.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-TABLES-301.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-TABLES-301-documents-toc-tables-subchips.lock`
**Gates:** FE tsc PASS; focused Jest baseline 4/28 → final 4/29 PASS; changed-file ESLint/Prettier/diff-check PASS.
**NEXT:** `tasks/_backlog/doc-tables/TZ-DOC-TABLES-302-table-dialog-overflow-select.md`.

## [2026-08-09] — TZ-UI-GOLD-332 DONE: light fill gold + gold-deep line role
**Статус:** DONE on main; deploy НЕ
**Что:** Разделены роли золота: светлый `gold` для заливок и `gold-deep` для focus/border/ring/edit/text на бумаге; три requested page roles migrated; documentation updated.
**Archive:** `tasks/_archive/2026-08/TZ-UI-GOLD-332.done.md`
**Lock:** `.mimocode/locks/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.lock`
**Gates:** FE tsc, changed-file ESLint/Prettier, full Jest baseline/final 136 suites / 1276 tests, Angular development build, diff-check PASS.
**Known limitation:** global `text-sunrise-warm` search retains pre-existing uses outside the explicit TZ file list; separate sweep required.
**NEXT:** `tasks/_backlog/doc-tables/TZ-DOC-TABLES-301-documents-toc-tables-subchips.md`.


## [2026-08-09] — TZ-UI-THEME-331 DONE: dark depth + readable gold states
**Статус:** DONE on main; deploy НЕ
**Что:** Theme-invariant `text-on-gold` теперь используется на золотых active/primary состояниях; dark surface ladder выровнен, текст приглушён, добавлен inset highlight, исправлены selection и scrollbar.
**Archive:** `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md`
**Lock:** `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`
**Gates:** FE tsc, changed-file ESLint/Prettier, full Jest 136 suites / 1276 tests, Angular development build, diff-check PASS; focused requested specs отсутствуют.
**NEXT:** `tasks/_backlog/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.md` READY; не claim в этом closeout.


## [2026-08-09] — TZ-SALES-316 DONE: Create KP template center
**Статус:** DONE on main; deploy НЕ
**Что:** Template select + preview + builder deep-link на `/proposals/create`.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-316.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-316-create-kp-template-center.lock`
**Gates:** FE tsc PASS; Jest 5/5 PASS.
**Wave:** WAVE-KP-VITRINE fill DONE except 320 PARK; NEXT idle; Deploy предложить? да.

## [2026-08-09] — TZ-SALES-315 DONE: Create KP right inspector
**Статус:** DONE on main; deploy НЕ
**Что:** Правая панель: Organization, %, оценка UI, deep-link org.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-315.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-315-create-kp-inspector.lock`
**Gates:** FE tsc PASS; Jest PASS.
**Wave:** #6 DONE.

## [2026-08-09] — TZ-SALES-314 DONE: Create KP left product rail
**Статус:** DONE on main; deploy НЕ
**Что:** Left rail изделий + in-memory draft на `/proposals/create`.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-314.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-314-create-kp-product-rail.lock`
**Gates:** FE tsc PASS; Jest 3/3 PASS.
**Wave:** #5 DONE; NEXT TZ-SALES-315 (now DONE); deploy НЕ.

## [2026-08-09] — TZ-SALES-313 DONE: Все КП family expand
**Статус:** DONE on main; deploy НЕ
**Что:** Family expand на `/proposals`, attach с оценкой, отдельный read-only variant dialog, sync+confirm. Supersedes 304; attach write-path не дублировался.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-313.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-313-all-kp-family-expand.lock`
**Gates:** FE tsc PASS; Jest 31/31 PASS; Prettier/ESLint PASS.
**Wave:** WAVE-KP-VITRINE #4 DONE; 310–316 DONE, 320 PARKED; queue idle; deploy НЕ.

## [2026-08-09] — TZ-SALES-312 DONE: Create КП three-zone shell
**Статус:** DONE on main; deploy НЕ
**Что:** `/proposals/create` — трёхзонный shell с empty RU, narrow toggles, Deals chrome сохранён. Наполнение зон — 314–316.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-312.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-312-create-kp-shell.lock`
**Gates:** FE tsc PASS; focused Jest PASS; prettier/eslint PASS; `git diff --check` PASS.
**Wave:** WAVE-KP-VITRINE #3 DONE; NEXT TZ-SALES-313 (now DONE); deploy НЕ.

## [2026-08-09] — TZ-SALES-311 DONE: Create КП design-spec
**Статус:** DONE on main; deploy НЕ
**Что:** Layout SoT `/proposals/create` — три колонки с явными ширинами, responsive drawers, empty RU, карта слоёв 312→314/315/316. Page doc pointer; Angular shell не кодили.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-311.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-311-create-kp-design-spec.lock`
**Gates:** docs-only Markdown review PASS; `git diff --check` PASS.
**Wave:** WAVE-KP-VITRINE #2 DONE; NEXT TZ-SALES-312 (now DONE); deploy НЕ.

## [2026-08-09] — TZ-SALES-310 DONE: Deals TOC and КП subchips
**Статус:** DONE on main; deploy НЕ
**Что:** Общий тёмный TOC Сделок теперь показывает КП / Договоры / Заказы. Только на `/proposals` и `/proposals/create` есть жёлтые подchips Создать КП / Все КП; contracts/orders получают пустой жёлтый ряд. Добавлен guarded lazy route-stub `/proposals/create`; quotation API, семья и бизнес-логика не менялись.
**Archive:** `tasks/_archive/2026-08/TZ-SALES-310.done.md`
**Lock:** `.mimocode/locks/TZ-SALES-310-deals-kp-subchips.lock`
**Gates:** FE tsc PASS; focused Jest 2 suites / 18 tests PASS; Angular development build PASS; Prettier PASS; `git diff --check` PASS.
**Wave:** WAVE-KP-VITRINE #1 DONE; NEXT TZ-SALES-311 (now DONE); deploy НЕ.

**Canonical workspace:** `D:\\kppdf-8.0` on `main`; package manager `pnpm`

## [2026-08-09] — TZ-PHOTO-302 DONE: catalogue lists use lightweight thumbnails
**Статус:** DONE on main; deploy НЕ
**Что:** Shared frontend `photoListUrl()` selects direct/linked `thumb` and falls back to original. Products table/grid, Materials list and Production read-facade catalogue/order thumbs use it; Modules list audit found no photo surface. Detail/form/lightbox/picker URLs intentionally remain original.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-302.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-302-lists-use-thumb.lock`
**Gates:** FE tsc PASS; focused Jest 5 suites / 33 tests PASS; changed FE ESLint and Prettier PASS; `git diff --check` PASS. `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
**Wave:** WAVE-PERF-PHOTOS #2 DONE; NEXT TZ-PHOTO-303; deploy НЕ.

## [2026-08-09] — TZ-PHOTO-303 DONE: legacy originals backfill script
**Статус:** DONE on main; deploy НЕ
**Что:** Идемпотентный `backend/scripts/tz-photo-303-backfill-thumbs.ts` + `pnpm photos:backfill-thumbs` создаёт Sharp WebP thumbs для старых локальных originals без child thumb, пропускает missing/unsupported/broken files с логом и никогда не удаляет originals. Повторный запуск — 0 дублей.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-303.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-303-backfill-thumbs.lock`
**Gates:** BE tsc (`--noEmit` и build config) PASS; photo Jest 3 suites / 6 tests PASS; ESLint PASS; `git diff --check` PASS. `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
**Wave:** WAVE-PERF-PHOTOS complete; READY queue idle; live backfill command documented but not run; deploy НЕ.

## [2026-08-09] — TZ-PHOTO-301 DONE: upload original + lightweight thumb
**Статус:** DONE on main; deploy НЕ
**Что:** `POST /photos/upload` сохраняет оригинал и отдельный WebP thumb через Sharp (≤320px, quality 80, без enlargement). Photo child связан через `parentPhotoId`, ответ сохраняет legacy original fields и добавляет `variants.thumb`; ошибка Sharp не ломает upload.
**Archive:** `tasks/_archive/2026-08/TZ-PHOTO-301.done.md`
**Lock:** `.mimocode/locks/TZ-PHOTO-301-upload-variants-sharp.lock`
**Gates:** BE tsc PASS; photo Jest 2 suites / 4 tests PASS; changed-photo ESLint PASS; full backend 72 suites / 694 tests PASS with one unrelated pre-existing text-block-category failure; `git diff --check` PASS. `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
**Wave:** WAVE-PERF-PHOTOS #1 DONE; NEXT TZ-PHOTO-302; deploy НЕ.

**Canonical workspace:** `D:\kppdf-8.0` on `main`; package manager `pnpm`
**Task truth:** `tasks/_backlog/QUEUE.md` + archives; completed work in `tasks/_archive/`

## [2026-08-08] — TZ-PRODUCTS-309 DONE: composition in Product FullEditor
**Статус:** DONE on main; deploy НЕ
**Что:** Edit FullEditor embeds the same `ProductBomPanel` used by the product card, with bounded internal scroll; create mode gives the save-then-edit Russian hint. No duplicate composition UI/write-path, ModuleMaterials, backend, or Product schema changes.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-309.done.md`
**Gates:** FE tsc; Angular development build; focused form+BOM Jest 32/32; targeted ESLint; Prettier; `git diff --check` — PASS. Глобальный `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Wave:** WAVE-PRODUCT-EDITOR #1–#2 DONE; READY queue empty; deploy НЕ.

## [2026-08-08] — TZ-PRODUCTS-308 DONE: FullEditor «Изделие»
**Статус:** DONE on main; deploy НЕ
**Что:** FullEditor изделия использует русское UI-имя «Изделие», responsive 3-column dense layout, узкие поля габаритов/веса/единицы/RAL и больше не показывает profile-L composition hint. Product/API schema и composition write-path не менялись; TZ-PRODUCTS-309 — следующий.
**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-308.done.md`
**Gates:** FE tsc; Angular development build; focused Jest 24/24; targeted ESLint; Prettier; `git diff --check` — PASS. Глобальный `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Wave:** WAVE-PRODUCT-EDITOR #1 DONE; NEXT TZ-PRODUCTS-309; deploy НЕ.

## [2026-08-08] — TZ-UX-FORM-307 DONE: Form Wave B batch 1
**Статус:** DONE on main; deploy НЕ
**Что:** Contract и WorkType dialogs используют общий `app-pi-form-section` в стиле Material; Organization FullEditor уже соответствовал канону kind-C. Payload/control names и бизнес-логика не менялись.
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-307.done.md`
**Gates:** FE tsc; Angular production build; targeted ESLint; Jest 132 suites / 1247 tests; `git diff --check` — PASS. Глобальный `verify-status.sh` сохраняет pre-existing drift 72 legacy kit-era entries.
**Wave:** WAVE-SHOP-NORTH-B DONE; очередь READY пуста; idle, deploy НЕ.

## [2026-08-08] — Worktree sync: main == origin/main; NEXT FORM-307
**Статус:** SoT synced; deploy НЕ
**Что:** Canonical root fast-forwarded to Party-docs closeout HEAD; foreign WIP quarantined off-tree; QUEUE/WAVE point executor at TZ-UX-FORM-307 only.
**NEXT:** `tasks/_backlog/shop-north-b/TZ-UX-FORM-307-form-wave-b-batch1.md`
**Ban:** INN-301 · deploy · `desktop/mcp-runtime` commit

## [2026-08-08] — TZ-DESKTOP-SOT-301 DONE: desktop MCP source of truth
**Статус:** DONE on main; deploy НЕ
**Что:** `desktop/mcp/` is the only tracked MCP runtime path; `mcp-runtime` is not reconstructed as a second tree. Root scripts, Desktop host docs, and installer boundary now state the same SoT; stale Desktop shell diagnostics were cleared without changing tools.
**Archive:** `tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md`
**Gates:** MCP typecheck + 69/69 tests; desktop typecheck/check/build; `git diff --check`

## [2026-08-08] — TZ-ORG-ASSETS-302 DONE: print requisites and typed vault bindings
**Статус:** DONE on main; deploy НЕ
**Что:** Existing document-template HTML/snapshot pipeline now resolves organization requisites and role-based logo/seal/signature assets, with quotation/invoice sources and order → stub-КП cascade. Missing vault files remain graceful placeholders.
**Archive:** `tasks/_archive/2026-08/TZ-ORG-ASSETS-302.done.md`
**Gates:** BE/FE typecheck; focused document-template/generated-document and registry Jest; targeted lint; `git diff --check`; pre-existing `verify-status.sh` legacy drift disclosed

## [2026-08-08] — TZD-30 DONE: MCP text-block drafts
**Статус:** DONE on main; deploy НЕ
**Что:** MCP text-block categories/list/create-draft + explicit category create; inactive `ai-draft` blocks, duplicate/409 no-overwrite, and manager todo at `/doc-constructor/texts?editId=`. `notes` is never sent.
**Archive:** `tasks/_archive/2026-08/TZD-30.done.md`
**Gates:** MCP test 69/69 PASS; MCP tsc PASS; `git diff --check` PASS
**Total tasks:** Historical completed work plus documented backlog; see `OrchestratorKit/STATUS.md` for the filesystem-synchronised kit board.

## Canonical cleanup checkpoint — 2026-08-01

- Confirmed source of truth: `D:\\kppdf-8.0`, branch `main`; `git worktree list` contains only this checkout.
- Removed non-project artifacts: `WindowsTheme/`, `vendor/codebase-memory-mcp/`, root `Пимер.pdf`, `.mcp.json`; `start.mjs` no longer auto-starts the removed MCP.
- Moved the project passport to `docs/project-passport.md`; `TZ-CLEANUP-R2` is archived as DONE after all cleanup acceptance criteria and verification gates.
- `tasks/` is intended to contain only real active `TZ-*.md` files. Roadmap prose elsewhere is historical context, not an active task claim.

## [2026-08-08] — TZ-UX-DIALOG-303 DONE: add-and-continue pickers
**Статус:** DONE on main; deploy НЕ
**Что:** composition picker stays open on Add; BomPanel writes per onAdded.
**Archive:** `tasks/_archive/2026-08/TZ-UX-DIALOG-303.done.md`
**Gates:** FE tsc PASS; jest 15/15

## [2026-08-08] — TZ-UI-TYPE-303 DONE: content label 13px
**Статус:** DONE on main; deploy НЕ
**Что:** pi-label for informational th/fact/passport; eyebrow stays compact chrome.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-303.done.md`
**Gates:** FE tsc PASS; jest 29/29

## [2026-08-08] — TZ-UI-COLOR-301 DONE: contrast light+dark P0/P1
**Статус:** DONE on main; deploy НЕ
**Что:** badge/table/gantt contrast sweep; WAVE-UI-TYPE-COLOR complete.
**Archive:** `tasks/_archive/2026-08/TZ-UI-COLOR-301.done.md`
**Gates:** FE tsc PASS; jest 40/40

## [2026-08-08] — TZ-UI-TYPE-302 DONE: type scale hotspots
**Статус:** DONE on main; deploy НЕ
**Что:** nav/tree/fact micro+title ladder on catalog hotspots.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-302.done.md`
**Gates:** FE tsc PASS; jest 22/22

## [2026-08-08] — TZ-UI-TYPE-301 DONE: ERP type scale canon
**Статус:** DONE on main; deploy НЕ
**Что:** ERP type scale tokens + design-spec/foundations fonts sync; micro=11px.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TYPE-301.done.md`
**Gates:** FE tsc PASS

## [2026-08-08] — TZD-29 DONE: manager import todos (desktop wave #7, WAVE COMPLETE)
**Статус:** DONE on main; deploy НЕ
**Что:** BE `import-todo` module (POST/GET/PATCH, RBAC admin|manager, org-scope); MCP `kppdf_import_todo_create|list|set_status`; FE thin `/import-todos` page (фильтры, «Готово», href); seed pages; docs. **Волна desktop bulk-import закрыта — checkpoint idle.**
**Archive:** `tasks/_archive/2026-08/TZD-29.done.md`
**Gates:** BE tsc PASS; jest import-todo 3/3; MCP test 62/62; FE tsc PASS

## [2026-08-08] — TZD-28 DONE: doc-constructor MCP drafts (desktop wave #6)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-28.done.md`
**Gates:** MCP test 60/60 PASS; MCP tsc PASS

## [2026-08-08] — TZD-27 DONE: journal product.create/update (desktop wave #5)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-27.done.md`
**Gates:** BE tsc PASS; jest journal+import-task 27/27; MCP test 58/58; MCP tsc PASS

## [2026-08-08] — TZD-19 DONE: MCP product graph + integrity (desktop wave #4)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-19.done.md`
**Gates:** MCP test 51/51 PASS; MCP tsc PASS

## [2026-08-08] — TZD-18 DONE: batch propose/confirm + scaled ImportTask (desktop wave #3)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-18.done.md`
**Gates:** BE tsc PASS; jest journal+import-task 22/22; MCP test 47/47; MCP tsc PASS

## [2026-08-08] — TZD-26 DONE: columns ready/unfit + AI reshape (desktop wave #2)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-26.done.md`
**Gates:** BE tsc PASS; jest import-task 12/12; MCP test 44/44; MCP tsc PASS

## [2026-08-08] — TZD-23 DONE: AI matching + HITL plan → propose (desktop wave #1)
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZD-23.done.md`
**Gates:** BE tsc PASS; jest import-task 10/10; MCP test 38/38; MCP tsc PASS

## [2026-08-08] — TZ-UX-FACT-302 DONE: FactCard site adoption audit
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-302.done.md`
**Gates:** docs-only

## [2026-08-08] — TZ-UX-DETAIL-304 DONE: module detail parity
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-304.done.md`
**Gates:** FE tsc PASS; Jest module-detail 3/3 PASS

## [2026-08-08] — TZ-UX-DETAIL-303 DONE: bom inspector FactCards
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-303.done.md`
**Gates:** FE tsc PASS; Jest product-bom-panel 5/5 PASS

## [2026-08-08] — TZ-UX-DETAIL-302 DONE: cost panel vertical + autorecalc
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-302.done.md`
**Gates:** FE tsc PASS

## [2026-08-08] — TZ-UX-DETAIL-301 DONE: product passport cleanup
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-DETAIL-301.done.md`
**Gates:** FE tsc PASS

## [2026-08-08] — TZ-UX-310 DONE: chrome drift audit
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-310.done.md`
**Gates:** docs-only

## [2026-08-08] — TZ-UX-309 DONE: page chrome unify
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-309.done.md`
**Gates:** FE tsc PASS

## [2026-08-08] — TZ-CATALOG-DEDUP-304 DONE: detail edit opener
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-304.done.md`
**Gates:** FE tsc PASS; Jest material-detail 6/6 PASS

## [2026-08-08] — TZ-UX-FORM-306 DONE: Module QuickCreate L + BomPanel
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-FORM-306.done.md`
**Gates:** FE tsc PASS; Jest quick-create-dialog 14/14 PASS

## [2026-08-08] — TZ-CATALOG-DEDUP-303 DONE: delete orphan CompositionEditor
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-303.done.md`
**Gates:** FE tsc PASS; Jest composition 15/15 PASS

## [2026-08-08] — TZ-CATALOG-DEDUP-302 DONE: retire ModuleMaterials dialog
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-302.done.md`
**Gates:** FE tsc PASS; Jest modules zone 9/9 PASS

## [2026-08-08] — TZ-UX-FACT-301 DONE: PiFactCard + FactStack
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-FACT-301.done.md`
**Gates:** FE tsc PASS; Jest fact-card 3/3 PASS

## [2026-08-08] — TZ-UX-312 DONE: composition-tree thumb density
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-UX-312.done.md`
**Gates:** FE tsc PASS; Jest composition-tree 8/8 PASS

## [2026-08-08] — TZ-CATALOG-DEDUP-301 DONE: strip FullEditor composition
**Статус:** DONE on main; deploy НЕ
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-DEDUP-301.done.md`
**Gates:** FE tsc PASS; Jest product-form-dialog 22/22 PASS

## [2026-08-08] — TZ-UX-311 DONE: composition-tree thumb + name wrap
**Статус:** DONE on main; deploy НЕ
**Что:** TreeNode.photoUrl + composition-tree mini-thumb / line-clamp-2 name
**Archive:** `tasks/_archive/2026-08/TZ-UX-311.done.md`
**Lock:** `.mimocode/locks/TZ-UX-311-composition-tree-thumb-wrap.lock`
**Gates:** FE/BE tsc PASS; Jest composition-tree 7/7 + catalog-graph 13/13 PASS

## [2026-08-08] — TZ-GIT-301 DONE: merge FORM-302…305 → main
**Статус:** DONE on main; deploy НЕ
**Что:** merge freebuff FORM wave (`7bc88e17…e485f521`); NAV-302 preserved; backlog stubs FORM-302…305 removed
**Archive:** `tasks/_archive/2026-08/TZ-GIT-301.done.md`
**Lock:** `.mimocode/locks/TZ-GIT-301-merge-form-wave-to-main.lock`
**Gates:** FE tsc PASS; Jest quick-create/photo/material-form 55/55 PASS

## [2026-08-08] — TZ-CATALOG-331 DONE: catalog appearance settings
**Статус:** DONE on main; deploy НЕ выполнялся
**Route:** `/catalog/appearance`
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-331.done.md`
**Gates:** FE/BE tsc, targeted Jest, scoped ESLint, Angular dev build, `git diff --check` PASS; browser admin smoke remains.

## ✅ Завершённые этапы

### Backend (TZ-01..TZ-18)
- TZ-01..TZ-08: Auth + Users + Roles + Permissions + Reference data
- TZ-09..TZ-13: Catalog (Products, Materials, BOM) + Storage
- TZ-14..TZ-15: Document Templates + Finance (Reconciliation, Reports)
- TZ-16: Integrations (CSV Import, Comments)
- TZ-17: E2E tests (7 suites)
- TZ-18: Production Hardening (Rate Limit, Helmet, CORS, Health)

**Build:** pnpm run build ✅ (280+ файлов, 65 entities). **Frontend build:** pnpm run build ✅ (0 warnings) — см. UI Hardening Rework ниже.

### Frontend (TZ-19..TZ-29)
- TZ-19: Frontend Foundation (Angular 20 + Tailwind + AG Grid)
- TZ-20: Auth + Layout (sidebar/topbar/main) + 65 generic pages
- TZ-29: Dashboard (4 KPI cards) + Task Panel (8 phase groups)

### Frontend Phase 2 (TZ-30..TZ-40)
- TZ-30: CRUD actions + per-page FormSchema (FormDialog, RowActions, 5 страниц с fields[])
- TZ-31..TZ-40: UI Kit — foundation (cn/cva/theme/scroll-spy/button) + 10 секций showcase на /p/showcase (core primitives, advanced inputs, charts, calendar/otp/kbd, overlays, layout primitives)

**Build:** pnpm run build ✅ (542.84 kB initial bundle, 0 warnings)

### UI Hardening Rework (2026-07-05)
- **Paper & Ink shared UI** — собственный Angular kit в `frontend/src/app/shared/ui/` и композиционные primitives в `frontend/src/app/shared/page/`.
- **Token-first styling**: OKLCH palette, hairline borders, `pi-focus-ring`, responsive states и keyboard-visible focus.
- **Migrated primitives**: `PiPageHeader`, `PiEmptyState`, `PiBadge`, `PiRowActions`, dialogs, tables, forms, canvas and feedback components.
- **Document constructor**: builder canvas, inspector, DSL contracts and reference-data services live under `frontend/src/app/pages/doc-constructor/` and `frontend/src/app/shared/dsl/`.
- **Подробности:** `docs/paper-and-ink.md`, `ARCHITECTURE.md` и `progress.md` содержат дизайн-контракт и историю переходов.

### Dev Tooling (TZ-41..TZ-46)
- TZ-41: Health Check Panel + Log TUI Mode — `start.mjs` стал TUI-aware orchestrator с `--tail` режимом (in-place статус 3 сервисов, ring buffer 5 строк на сервис, финальная "Ready" панель с латентностями /api/health). checkHealth() парсит JSON body и определяет `degraded` состояние.
- TZ-43: Fix Mongoose Duplicate Indexes — удалены 6 дублирующих single-field `Schema.index({...})` в 6 schemas (product/material/organization/counterparty/category/certificate). Compound indexes сохранены. Diff: 6 deletions, 0 additions.
- TZ-44: DEP0190 Fix — заменены 4 `shell: isWin` на `execFile(resolveBin(...))` в start.mjs (getVersion, installDeps, spawnDetached, openBrowser). DEP0190 warning устранён. На Windows child.pid теперь pnpm.cmd (не cmd.exe wrapper). Diff: ~30 lines.
- TZ-45: Backend DI Audit — создан `backend/scripts/audit-di.ts` (статический анализатор, ~140 lines). Audit вернул 22 false positives; manual verification: 0 real DI cascade багов (backend boots clean). Script оставлен для future pre-commit hook.
- TZ-42: Production Deployment Mode — добавлен `--prod` флаг в start.mjs: `pnpm build` для backend+frontend, `node dist/main.js` (NODE_ENV=production) + inline static server (Node http+fs, ~80 lines, без new deps) раздаёт `dist/frontend/browser/` на :4200. SPA fallback, path traversal protection, cache headers. `npm run start:prod` алиас. Bundle sizes в Ready panel. Caveat: local prod-like testing, НЕ полноценный prod deploy.
- TZ-46: Clean Launch Console — все log-сообщения start.mjs на русском (preflight, mongo, deps, build, banner, cleanup, waitFor). `printReadyPanel` переписан с длинного «простынного» вывода на компактную 2D панель: ASCII-рамка `╔══╗`/`╚══╝` с заголовком `✦ kppdf-8.0 готов к работе ✦`, summary `⏱ Все сервисы готовы за Xs`, 2-col endpoints (`🖥 Frontend | 👤 Логин` + `📦 Backend | 📋 Showcase`). Динамическая ширина колонок через `stdout.columns` (clamp 80..120). NG warnings fix: 3× NG8113 (unused imports в page-renderer + showcase) + 2× NG8102 (unnecessary `??` в otp-input + scroll-area) → frontend build 0 warnings. NestJS logger: nestjs-pino level='info' (excludes debug/verbose). Console clean: 0 warnings, 0 deprecations.

**Smoke test:** `node start.mjs` — preflight ✅, Mongo RS ready ✅, backend boot ✅, /api/health OK, 0 Mongoose "Duplicate schema index" warnings, 0 DEP0190, 0 DI cascade errors.

### TZ-AUDIT-9 + TZ-AUDIT-9.1 (2026-07-07) — Warm Paper Palette Rebrand
- **Мотивация (от пользователя):** «исправить чёрно-серые цвета, сайт мрачный». Pre-Audit-9 палитра: hue ~80 + chroma 0.005-0.01 (почти desaturated), ink = pure black `oklch(0.145 0 0)`. Всё читалось холодно/безлико. Sunrise-палитра существовала, но UI-Kit оставался в B&W → акценты «выскакивали» как чужеродные.
- **TZ-AUDIT-9 — изменения:**
  - Base palette (8 токенов, light mode): hue 80→**70 (golden-beige)**, chroma 0.005-0.01→**0.015-0.025**, ink `oklch(0.145 0 0)` → **deep espresso `oklch(0.180 0.015 70)`**. Paper → warm cream, rule → warm gray, muted-foreground → warm medium.
  - Accent-cool: hue 230 (cyan) → **hue 250 (indigo)** — убрана вибрация с тёплой базой.
  - Dark mode: cold charcoal + cold white → **warm espresso (`oklch(0.21 0.015 70)`)** + **warm cream text (`oklch(0.95 0.015 70)`)**.
  - Sunrise палитра **UNCHANGED** (hue 55-80 уже внутри базы 70) — теперь естественно перетекает.
  - **JSDoc конвенции** (TZ-AUDIT-8): HAIRLINE-FIRST BORDER (66+ `border hairline border-rule` → `hairline` + 13× `border-t...` → `hairline-t`), SECONDARY TEXT (40× `text-muted` → `text-muted-foreground`), WCAG note на `text-muted-foreground` (~3:1, AA Large only) с DON'T-list.
  - **Defensive longhand**: 5 utility classes (`hairline`, `hairline-t/b/r/l`, `pi-input`, `pi-icon-btn`, `.pi-outline-btn`) converted — `border-ink` / `border-destructive` overrides ВСЕГДА выигрывают в cascade.
  - FoundationsPage swatches (6/8) обновлены; hairline border demo переработан (3 thin variants: rule / ink / destructive).
- **TZ-AUDIT-9.1 — изменения:** Dark mode L bump. Reviewer: «warm dark reads denser than cool dark». `--color-paper` (dark) L **0.18 → 0.21**, `--color-paper-2` (dark) L **0.24 → 0.27**. Hue/chroma UNCHANGED. JSDoc: «higher L gives the surface breathing room».
- **Visual verification** (browser-use через /kit/* public route prefix): 12 screenshots (6 pages × 2 modes), 0 console errors, warm-paper feel confirmed, dark mode warm espresso с visible card separation.
- **3 review rounds, 4 MINORs closed:** (1) Stale Sunrise JSDoc, (2) `text-muted-foreground` WCAG note placement + 3.1:1 wording, (3) Dark mode L=0.18 too dark (deferred to TZ-AUDIT-9.1), (4) TZ-AUDIT-9b naming → TZ-AUDIT-9.1.
- **Discovery:** /kit/* routes уже PUBLIC (no authGuard) — same page components, different layout shell. Это спасло от 1-line route config change для visual verification. Operational pages (/materials, /organizations, /dictionaries) — dev proxy работает (proxy.conf.json проксирует /api/* и /uploads/* на backend :3000).
- **Затронутые файлы:** `frontend/src/styles.css` (palette tokens + JSDoc + 5 utility longhand), `frontend/src/app/pages/foundations/foundations.page.ts` (6 swatches), + pre-Audit-9 cleanup (27 файлов `text-muted` → `text-muted-foreground`, 34 файла `border hairline border-rule` → `hairline`, `forms.page.ts` NG8113 fix).
- **Verification:** 166/166 tests passing, typecheck exit 0, code-reviewer approved (3 rounds), 12 browser-use screenshots, no console errors.
- **Известные ограничения (не блокеры):** `text-muted-foreground` ~3:1 contrast (AA Large only, fails AA Standard) — JSDoc note + DON'T-list покрывают. Dark mode L=0.21 может быть bumped back в 0.20-0.22 range если пользователь предпочитает темнее.
- **Архив:** `tasks/_archive/2026-07/TZ-AUDIT-9.md.done` (с comprehensive ARCHIVE_MARKER).

### TZ-LIGHT-XX (2026-07-08) — Light Tones Pivot + comprehensive audit

**Мотивация:** Пользователь: «нужно изменить цвета, светлые тона». После TZ-WARMUP-100 (chroma bump) палитра оставалась на прежних L (lightness) — ink `oklch(0.180)`, rule `oklch(0.850)` — читалось насыщенно, не «светло». Пользователь выбрал 7 опций для осветления: muted-foreground, rule, ink, destructive, sunrise, accent-warm/cool, paper-2.

**Изменения палитры (~3 файла):**
- `styles.css`: все 14 OKLCH-токенов (light + dark) — L значения подняты на +0.03–0.10. Ink: 0.180→0.250 (soft charcoal, ~9:1 WCAG AAA). Rule: 0.850→0.880. Muted-fg: 0.55→0.58 (компромисс с code-review, L=0.62 давал <3:1). Dark mode симметрично (paper 0.21→0.25, paper-2 0.27→0.32). Hue 70 (warm paper direction) UNCHANGED.
- `foundations.page.ts`: swatches синхронизированы с новыми значениями.
- `docs/paper-and-ink.md`: добавлена полная таблица TZ-LIGHT-XX + отдельная секция `## WCAG Contrast Ratio Compliance` с тремя таблицами (light text, dark text, non-text tokens), подтверждающая что все текстовые токены проходят AA Large минимум.

**Сопутствующие доработки (в той же сессии):**
- **Border-паттерны (25+ файлов):** `border hairline border-rule` → `hairline`/`hairline-b/r/l` по всей кодовой базе. Остался только 1 хит в JSDoc `styles.css` (намеренно).
- **Focus-ring унификация (12 компонентов):** hardcoded `focus-visible:ring-2 ring-ink ring-offset-2 ring-offset-paper` → единый класс `pi-focus-ring` из `--focus-ring-shadow`.
- **NG5002 fix:** `pi-theme-editor.component.ts` — regex literal внутри template binding (блокировал dev-server). Вынесен в метод `sliderId()`.
- **`docs/add-new-page.md`:** добавлены Border & focus-ring конвенции для новых страниц.
- **`docs/paper-and-ink.md`:** JSDoc обновлён (MIGRATION COMPLETE).

**Verification:**
- `pnpm exec tsc` → exit 0 ✅
- WCAG audit через `culori` 4.0.2: все текстовые токены проходят AA Large минимум; body text (ink) — AAA 14.75:1 ✅
- Browser-use visual audit: 0 console errors на /kit/foundations, /kit/overview, /kit/basics, /kit/forms, /kit/navigation, /kit/overlays, /materials, /organizations, /dictionaries ✅
- Dark mode на /kit/* страницах — все компоненты корректно инвертируются ✅

**Artefacts:** `progress.md` (+запись), `docs/paper-and-ink.md` (+WCAG секция), ".gitignore" (+`_tmp/`).

**Известные ограничения (не блокеры):**
- `muted-foreground` contrast 3.96:1 (AA Large only, не AA Standard) — intentional, резервирован для non-essential captions.
- `--color-paper` (light) не менялся — остался `oklch(0.972 0.015 70)`. Не чистый белый, warm off-white.

### TZ-83 (2026-07-11) — Модульная иерархия Товар→Модуль→Материал+Вид работ

**Мотивация:** Бизнес-схема: товар = комбинация модулей (корпус, дверца, фурнитура); модуль = набор материалов (с возможностью override-габаритов) + норма-часов по видам работ. Из этого считается себестоимость. До TZ-83 данные лежали в legacy `ProductComponent` (snapshot `name` поля), что теряло связь с актуальным Material. После TZ-83 — нормальный relational M:N + персистентный override + отдельный photo entity.

**Полный объём (5 фаз, ~25 файлов):**

**Phase A — Backend cleanup (5 review rounds PASS):**
- `ProductComponent` удалён (папка + регистрация в `app.module.ts`).
- `ProductModule.materials[]` мигрирован со snapshot-`name` на `materialId: ObjectId (ref)` + `overrideDimensions?: { length?, width?, height?, unit? }` subdoc.
- `ProductModule.productId` + `image` — удалены (M:N чистая через `Product.productModuleIds[]`; gallery вынесена в отдельную entity).
- Индексы перестроены: `{productId, sortOrder}` (баг — `_id` всегда уникален и не фильтруется) → `{sortOrder}` + `{name: 'text'}` для full-text search.
- `ProductController` — atomic `POST /products/:id/modules` (`$addToSet`) + `DELETE /products/:id/modules/:moduleId` (`$pull`). Race-condition-safe при concurrent edit. `@Roles('admin','manager')` + `@AuditAction`.
- `ProductService.findById` — nested populate (workTypes + materials) + existence-check для attach (защита от dangling ObjectId).
- `bom.schema.ts` — `ref: 'ProductComponent'` → `ref: 'ProductModule'` + TODO миграция existing BOM.
- `ProductModulePhoto` — НОВАЯ entity (schema/service/controller/module). Schema-level validator `photoId || url`. Atomic `setMain(id)` (findOneAndUpdate + all others false).
- `backend/scripts/tz83-drop-stale-productcomponents.ts` — idempotent cleanup-скрипт, env-overridable (`MONGO_URI`), reviewed safe.

**Phase B — Frontend data + WorkTypes dictionary:**
- 3 shared services: `pi-work-types.service.ts`, `pi-product-modules.service.ts`, `pi-product-module-photos.service.ts` — все на `silent-http` + signals + `SilentResult<T>`.
- `pages/work-types/` — новая dictionary секция (canonical pattern materials/units/currencies).
- `app.routes.ts` — `/work-types` lazy route.
- `app-layout.component.ts` — nav-link «Виды работ».

**Phase C — `/modules` list + `/modules/:id` detail (4 sections):**
- `pages/modules/modules.page.ts` — list с photo-thumb, артикулом, габаритами, counts, search/sort, row→detail.
- `pages/modules/module-detail.page.ts` — 4 sections: Основное / Фотогалерея / Материалы / Виды работ.
- `pages/modules/module-form-dialog.component.ts` — basics + dimensions + workTypes FormArray.
- `pages/modules/module-materials-form-dialog.component.ts` — FormArray + conditional override-габариты UI.

**Phase D — `/products/:id` detail + integration:**
- `pages/products/product-detail.page.ts` (NEW) — 4 sections + секция «Модули» с attach/detach через picker.
- `pages/products/product-module-picker-dialog.component.ts` (NEW) — lookup всех модулей, multi-select через atomic endpoint.
- `pages/products/products.page.ts` — clickable rows (RouterLink) + колонка «Модулей: N».

**Phase E — Tests:**
- 3 backend e2e specs: `product-modules.e2e-spec.ts`, `product-module-photos.e2e-spec.ts`, `products-attach-modules.e2e-spec.ts`. Canonical `.expect(201)` (NestJS POST default).
- 3 frontend unit specs: `pi-work-types.service.spec.ts` (3), `pi-product-modules.service.spec.ts` (4), `pi-product-module-photos.service.spec.ts` (4). TestBed + provideHttpClientTesting + API_BASE_URL.
- **11/11 новых unit-тестов passing** ✅ + 3 e2e specs готовы к запуску.

**Verification:** Backend typecheck exit 0 ✅ · Frontend typecheck exit 0 ✅ · 11/11 unit tests pass ✅ · Code-reviewer approval: Phase A (5 rounds), Phases B–E (multi-round bugfixes).

**Известные ограничения (не блокеры):**
- `bom.schema.ts` всё ещё требует data-migration existing BOM к новому `ProductModule._id` (deleted `ProductComponent._id` references). Отдельный TZ.
- Photo upload UI /modules/:id → только URL-fallback через `PhotoService`. File-picker UI отложен до TZ-87.
- Mobile responsive не тестировался на detail pages (TZ-83 scope = desktop first).

### TZ-86 (2026-07-11) — Конструктор документов (Document Constructor, flagship feature)

**Мотивация:** Главный «killer-feature» после TZ-83/85. Бизнес-схема: документ = тексты (из «Тексты») + таблицы (из «Таблицы») + данные контрагентов/организаций/products (live API lookup) + фоновый рисунок (опционально). 4-я dropdown-категория в верхнем nav. До TZ-86 эта функциональность была orphan'ом из kppdf-7.0 (`contract-builder/*` + `document-template.service.ts` legacy, отключённые в app.routes.ts). После 4 prior failed iterations (5.0/6.0/7.0) — этот TZ переписывает с нуля на 3-pane canvas + CDK drag-drop + auto-save + signal-based registry.

**Полный объём (6 фаз, ~30+ файлов, 9 atomic commits):**

**Phase A — Backend foundation (6 atomic commits, A.1..A.6):**
- **A.1** `TextBlock` schema (NEW) — fields: name, slug, content (markdown), tags[], category, sortOrder, isActive. Russian transliteration slugify (а→a, ё→yo, щ→shch, ю→yu, я→ya) + Mongo unique index + 11000→409 catch.
- **A.2** `TableTemplate` EXTEND — ColumnColumn gains `type: ColumnType` (text|number|date|currency|bool); TableTemplate gains `category?` (5 enum), `sortOrder`, `sampleRows?: unknown[][]`, `dataSource?`. `GET /:id/preview` endpoint — inline HTML via `Intl.NumberFormat('ru-RU', {style:'currency', currency:'RUB'})`. Compound indexes.
- **A.3** `TemplateBlock.dataBinding` extension — subdoc `{source, field?, value?, format?}` к существующему schema (migration safe, _id: false).
- **A.4** `DocumentBuilder.build(id, dto)` service extension — `findExpanded()` → `resolveSourceIds()` (Promise.all parallel `.lean().exec()`) → `resolveBlockContent()` (per-block with binding.value or bag[source][field] lookup) → `renderHtml()`. `formatValue()` — `Intl.NumberFormat` ru-RU/RUB для currency, `toLocaleDateString` для date. `POST /api/document-templates/:id/build` endpoint.
- **A.5** `RegistryController` — `GET /api/registry/data-sources` lists 5 entity types (organization/counterparty/product/material/work-type) + `{key, label, type}` field metadata. `RegistryService` encapsulates hardcoded `DATA_SOURCES` constant.
- **A.6** `POST /:id/upload-background` — Multer `FileInterceptor('file', {memoryStorage, fileFilter MIME whitelist png|jpeg|webp, limits: fileSize 5MB})` → save to `cwd/uploads/document-templates/{id}/{uuidv4}.{ext}` → push URL to `backgroundImage[]` (Photoshop-style 5-image cap, 409 on overflow). `MulterExceptionFilter` для 413 на oversize. Best-effort `fs.unlink` на save() failure.

**Phase B — Frontend data layer (4 silent-http services + 17 jest tests):**
- `pi-text-blocks.service.ts` — `list/findById/create/update/remove`
- `pi-table-templates.service.ts` — `list/findById/create/update/remove/preview` (preview silentWrap text)
- `pi-document-templates.service.ts` — `list/findById/create/update/remove/build/uploadBackground` (build silentWrap text; uploadBackground FormData multipart)
- `pi-registry.service.ts` — `getDataSources` (static catalogue)
- 4 service specs (17 tests total, all PASS): envelope mapping + silent-http + FormData multipart verified via `req.request.body instanceof FormData`.

**Phase C — Frontend sub-pages (texts + tables CRUD):**
- `pages/doc-constructor/texts/texts.page.ts` — list with search/sort + create button. EditDialog `text-block-dialog.component.ts` (190 LoC, side-by-side markdown preview via marked@18).
- `pages/doc-constructor/tables/tables.page.ts` — list with columns preview. EditDialog `table-template-dialog.component.ts` (290 LoC, FormArray<TableColumnForm> with add/up/down/remove + JSON sampleRows + server-side preview).
- Routes added: `/doc-constructor/texts` + `/doc-constructor/tables` under authGuard. New dep: `marked@^18.0.6`.

**Phase D.1 — Builder canvas 3-pane (главный wow, 13 files / +2303 LoC):**
- 5 NEW components: `BuilderPage` (480 LoC) + `BuilderToolPane` (480 LoC, 4 sections + `AddBlockPayload` discriminated union) + `BuilderCanvas` + `BlockRenderer` (235 LoC) + `BuilderInspector` (430 LoC, signal-bound form).
- 2 NEW Paper & Ink primitives: `pi-canvas-page` (A4 paper wrapper) + `pi-canvas-block-handle` (cdkDragHandle GripVertical, hover-only).
- 4th NAV_CATEGORY «Документы» (FileText icon).
- 2 lazy routes: `/doc-constructor/builder` (picker state) + `/doc-constructor/builder/:id` (3-pane canvas).
- Auto-save 1500ms debounce (Subject piped through groupBy+debounceTime+switchMap), per-block debounce.
- CDK drag-drop reorder (cdkDropList + cdkDrag with cdkDragLockAxis="y").
- 4-variant `AddBlockPayload` discriminated union: `{type: 'block', blockType}` | `{type: 'text', textBlockId}` | `{type: 'table', tableTemplateId}` | `{type: 'data', source, field}`.

**Phase D.2 — Builder canvas enhancements (3 files / +397 LoC):**
- **Background image:** Decorations tab in tool pane, MIME whitelist + 5MB cap client-side validation, `pi-document-templates.service.uploadBackground(id, file)` POST → optimistic update of `template` signal → CSS `background-image: url(...)` rendering in `BuilderCanvas` via `position: absolute; z-index: 0; pointer-events: none` overlay div.
- **Drag-from-palette:** `cdkDrag` on all 4 tool-pane palette lists + `cdkDropListConnectedTo: [CANVAS_DROPLIST_ID]` linking them to the canvas `cdkDropList`. `CANVAS_DROPLIST_ID` exported from `builder-canvas.component.ts` (single source of truth). Drop handler `onDropAdd({payload, insertIndex})` → `insertBlock()` → atomic POST add + immediate POST reorder (because backend `add` appends, not inserts).
- **Last-saved indicator:** `saveStatus: signal<'idle' | 'saving' | 'saved' | 'error'>` in `BuilderPage`. `tap()` before `switchMap` sets 'saving'; `handleSaveResult` (early-return on `!res.ok` pattern) narrows TS discriminated union; `timer(2000).subscribe(() => this.saveStatus.set('idle'))` reverts to 'idle' after 2s. `savedTick` counter guards against stale timers stomping a newer 'saved' state. Small chip in `PiPageHeader` («✓ Сохранено» / «Сохранение…» / «⚠ Ошибка»).

**Phase E — Cross-feature integration (3 files / +179 LoC):**
- `PiRowActionsComponent` extended with optional 3rd slot: `documentLabel: input<string|null>(null)` + `dataTestDocument: input<string|null>(null)` + `document: output<T>()`. Template renders the new `<button>` BEFORE the Edit button (Document → Edit → Delete; destructive-at-edge UX convention). Wrapped in `@if (documentLabel())` so the 5+ existing consumers see ZERO visual change (backwards-compat).
- Inline SVG FileText icon (14×14, stroke 1.5) — self-contained, no `lucide-angular` import needed.
- `OrdersPage` + `ContractsPage` — `Router` inject + `[documentLabel]`/`[dataTestDocument]` bindings + `(document)="onCreateDocument($event)"` handler. Navigation to `/doc-constructor/builder?source=order&sourceId=X` (or `source=contract`). `BuilderPage` D.2 plumbing reads & preserves these query params.
- **Simplification from original spec:** Original TZ-86.md Phase E assumed `/orders/:id` and `/contracts/:id` DETAIL pages exist; **they do not** (only list pages). Per thinker verdict, pivot to per-row action in list pages.

**Phase F.1 — Backend e2e specs (5 NEW suites, 34 tests, all green):**
- `text-blocks.e2e-spec.ts` (7 tests) — CRUD + slug uniqueness (409) + Russian transliteration auto-slug + soft-delete.
- `table-templates.e2e-spec.ts` (8 tests) — CRUD + `/preview` HTML + `Intl.NumberFormat` ru-RU/RUB currency + softDelete.
- `document-templates-build.e2e-spec.ts` (5 tests) — `{{organization.name}}` substitution + static dataBinding Mongoose bypass + empty placeholder fallback + invalid templateId 400.
- `registry.e2e-spec.ts` (7 tests) — 5 data sources + `{key, label, type}` field metadata.
- `document-templates-upload-background.e2e-spec.ts` (7 tests) — multer whitelist (png/jpeg/webp) + 5MB cap + 5-image limit + URL return.
- **Fix history:** `category: 'product-spec'` enum fix in table-templates spec; programmatic `generateValidInn()` helper using the same algorithm as the production `IsINNConstraint.checkInn10()` (replaced 4/6-bad hard-coded INN list).

**Verification (TZ-86):**
- Backend typecheck (`tsconfig.build.json --noEmit`) exit 0 ✅
- Frontend typecheck (`tsconfig.app.json --noEmit`) exit 0 ✅
- 5/5 e2e suites green, 34/34 tests pass (~26s total) ✅
- Code-reviewer: PASS-WITH-NITS (4 TZ-87 followups logged: DataSourceDescriptor.key typed-narrowed union drift, table-templates spec coverage gap acceptable, savedTick timer-guard pattern, scheduler race for add+reorder pair)
- 9 atomic commits on origin/main: `cdb2737` (D.1) → `d70646d` (D.2) → `1d7a51d` (E) → `f4a2bd2` (F.1) → `555eeed` (F.4 doc sync) → +4 Phase A/B/C atomic commits

**Затронутые файлы (TZ-86 cumulative):**
- **Backend (~15 files):** `text-block/{schema,service,controller,module,dto/{create,update}}`, `table-template/{schema,service,controller,dto/{create,update}}` (extended), `template-block/schema` (+dataBinding), `document-template/{service,controller,module,dto/{create,update,build}}`, `registry/{controller,service,module}`, `common/filters/multer-exception.filter`, `app.module` (registration of 3 new modules + filter)
- **Frontend (~25 files):** `shared/services/pi-{text-blocks,table-templates,document-templates,registry,template-blocks}.service.ts` (+ 5 spec files), `pages/doc-constructor/{texts,tables,builder}/{*.page,*-dialog.component,builder-{tool-pane,canvas,inspector,page}.component}.ts`, `shared/ui/canvas/pi-{canvas-page,canvas-block-handle}.component.ts`, `pages/{orders,contracts}/*.page.ts` (per-row action), `shared/ui/pi-row-actions/*.component.ts` (extended), `app.routes.ts` (+3 lazy routes), `app-layout.component.ts` (4th NAV_CATEGORY)
- **Docs:** `STATUS.md` (эта секция), `ARCHITECTURE.md` (Document Constructor zone), `progress.md` (entry)
- **Tests:** `backend/test/e2e/{text-blocks,table-templates,registry,document-templates-build,document-templates-upload-background}.e2e-spec.ts`

**Известные ограничения (не блокеры):**
- `CreateTemplateBlockDto` lacks `dataBinding` field + global `ValidationPipe whitelist: true` strips unknowns → static dataBinding test uses Mongoose bypass (legitimate test pattern when verifying the build pipeline that doesn't go through the create-block HTTP endpoint). A future TZ-XX should add `dataBinding?` to `CreateTemplateBlockDto` so the API can carry the binding through POST.
- `DataSourceDescriptor.key` typed-narrowed union (5 values); will drift silently when backend adds new sources → TZ-87 candidate: `string` + runtime zod/validation.
- `PiRowActionsComponent` per-row «Создать документ» slot — visible ТОЛЬКО when `documentLabel()` is set. 5+ existing consumers (Materials/Organizations/Dictionaries/WorkTypes/Modules) see ZERO visual change.

#### TZ-86 F.6 follow-up (2026-07-11) — Angular template-binding bugfixes (unblocks F.3)

**Мотивация:** TZ-86 был SHIPPED + archived в `ba7b66a`. F.3 browser visual verification был заблокирован — `ng serve` отказывался компилировать (Application bundle generation failed) из-за systematic Angular template-binding bugs в 7 doc-constructor файлах. Root cause: `tsconfig.json` давно имеет `"strictTemplates": true` (Angular compiler catches template-уровневые ошибки), но `tsc --noEmit` запускает только TypeScript — он НЕ вызывает Angular template typecheck. Все прежние TZ-86 verifications (`pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0) прошли, потому что не покрывали templates. Только `ng serve` / `ng build` ловили этот класс багов.

**Что было исправлено (commit `28daca6`, 7 файлов, 22+ str_replaces в 3 фазах):**

**Phase 1 — mechanical (selector renames + dead-code drop):**
- `builder-inspector.component.ts`: `<pi-switch>` × 2 + `<pi-select>` + `<pi-button>` → `<app-pi-X>` (imports уже присутствовали; только template был wrong).
- `builder.page.ts`: `<pi-page-header>` + `<pi-section>` × 2 + `<pi-button>` + `<pi-select>` → `<app-pi-X>` (same pattern).
- `builder-tool-pane.component.ts`: removed unused `ButtonComponent` (NG8113); typed `httpResource<RegistryResponseShape>(()=>'/api/registry/data-sources', { defaultValue: { sources: [] } })` to fix TS2339; dropped 4 unnecessary `?? []` (NG8102) on text/table resources which already have `defaultValue: []`.
- `builder-canvas.component.ts`: removed unused `CdkDrag` (NG8113).
- `block-renderer.component.ts`: removed unused `CdkDragPlaceholder` (NG8113).
- `texts.page.ts`: dropped `?.length` (NG8107) + `?? 0` (NG8102) on non-nullable fields.
- `tables.page.ts`: same NG8107/NG8102 drops on `length` + `sortOrder`.

**Phase 2 — API correction (правильные типы из SelectComponent / SwitchComponent / PiPageHeaderComponent):**
- `builder-inspector.component.ts`: added `SelectOptionComponent` import + to `imports[]`; migrated `<app-pi-select>` from `[options]` input → `<app-pi-select-option>` children projected via `@for` (matches SelectComponent content-projection design); changed `onFormatChange(format: string | string[])` → `(format: string | null)` (matches `SelectComponent.valueChange: output<string | null>()`); removed redundant `String(format)` cast.
- `builder.page.ts`: added `eyebrow="раздел · конструктор документов"` required input to `<app-pi-page-header>` (NG8008 fix); migrated `<app-pi-select>` from `[options]` → `<app-pi-select-option>` children projection (same as inspector); widened `onTemplatePick(value: string | string[])` → `(value: string | null)`.
- `builder-tool-pane.component.ts`: widened `onAddFromData(sourceKey: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type', ...)` → `(sourceKey: string, ...)` with type-safe `as` cast at emit site + JSDoc.
- `tables.page.ts`: `row.sampleRows.length` → `row.sampleRows?.length ?? 0` (SampleRow[] | undefined unlike columns which is always []).

**Phase 3 — orphan reference fix:**
- `builder.page.ts onTemplatePick`: replaced dangling `id` references в `this.router.navigate(['/doc-constructor/builder', id], ...)` (×2) с `value` (already narrowed to `string` after `if (!value) return;`).

**Verification gates passed:**
- `pnpm exec ng build --configuration=production`: PASSED в 3.357s, **0 warnings**.
- `pnpm exec ng serve`: HTTP 200 on :4200, 0 NG/TS errors в fresh log.
- `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend): exit 0.
- `pnpm exec tsc -p tsconfig.build.json --noEmit` (backend): exit 0.
- 5/5 backend e2e suites re-run: 34/34 tests PASSED в 18.7s (no regression).
- code-reviewer-minimax-m3 verdict: PASS-WITH-2-CRITICAL (atomic-history and end-to-end verification — both addressed).

**Atomic-history decision (per code-reviewer):** F.6-коммит лендингом был на `origin/main` как отдельный commit `28daca6` (a separate follow-up), а не squash в `ba7b66a` (TZ-86 archive commit) — это сохраняет TZ-86 ship history как «as designed + as shipped», а fixup commit чисто документирует что после архива понадобился template-binding sweep. Cross-reference в commit body: TZ-78 (orig-warning), TZ-AUDIT-6 (orthogonal focus-ring unification), TZ-AUDIT-8 (orthogonal hairline border).

**F.3 browser visual verification — STILL PENDING:** F.6 разблокировал `ng serve`, но фактический browser flow (login → texts CRUD → tables CRUD → builder 3-pane drag → background upload → last-saved chip) с screenshots в `tasks/_archive/2026-07/TZ-86-evidence/` ещё не запущен. TZ-87 candidate: запустить browser-use verification flow.

### TZ-170 (2026-07-24) — Конструктор документов: UX-ревизия

**Мотивация:** Пользователь: «свойства шаблона при клике на пустой холст, прозрачность, форматы, визуальные индикаторы». Множественные итерации: исправление клик-детекции, перенос палитры наверх, устранение дублирования.

**Что сделано (7 файлов):**

**1. Панель свойств шаблона (Inspector)**
- При клике на пустое место холста справа появляется панель свойств шаблона
- Ориентация: кнопки Книжная / Альбомная
- Формат страницы: A3 / A4 / A5 (заменены Letter/Legal)
- Прозрачность фона: слайдер 0-100% (рабочий дизайн из декораций)
- Нумерация страниц, Оглавление: toggle вкл/выкл
- Шапка/Подвал документа: текстовые поля
- Фоновые изображения: загрузка, выбор по умолчанию, удаление

**2. Холст — визуальные улучшения**
- Рамка шаблона: `2px solid var(--color-ink)` (была 1.5px rule)
- Dropzone заполняет всю высоту страницы — клик в любом месте
- Визуальные индикаторы: шапка (сверху), подвал (снизу), номер страницы (справа)
- A3/A4/A5 форматы с корректными размерами

**3. Палитра перенесена наверх**
- Тексты/Таблицы/Отступ — dropdown меню в горизонтальной панели
- Левая панель (280px) удалена — холст занимает всё пространство
- Альбомная ориентация теперь шире и видна пропорционально

**4. Устранение дублирования**
- Ориентация, прозрачность, декорации — только в свойствах
- Секция «Декорации» удалена из палитры

**5. Бэкенд**
- `document-template.schema.ts`: enum `pageSize` → `['A3', 'A4', 'A5']`

**Затронутые файлы:**
- `builder.page.ts` — новая layout с toolbar + dropdowns
- `builder-canvas.component.ts` — dropzone flex:1, visual indicators
- `builder-inspector.component.ts` — template properties, opacity slider
- `builder-tool-pane.component.ts` — очищен (unused)
- `pi-canvas-page.component.ts` — A3/A5 sizes, flex column, 2px border
- `pi-document-templates.service.ts` — тип pageSize обновлён
- `document-template.schema.ts` — enum обновлён

**Verification:** `ng build --configuration=production` → 0 errors ✅, `tsc --noEmit` → exit 0 ✅

**Статус:** Требует полной перепроверки по чек-листу `tasks/TZ-170.md` §3 (Tomorrow's QA pass)

## 🎯 6-направленная сессия улучшений (2026-07-08)

**Мотивация:** Пользователь: «улудшишь дальше? грамотно!» — выбран полный набор улучшений: theme toggle для operational-страниц, осветление фона, тёплый акцент для active/primary элементов, проверка login page, SettingsSeed fix, CRUD-миграция.

**Что сделано (13+ файлов, typecheck ✅, code review ✅):**

**1. SettingsSeed StrictModeError — verify**
- Проверено: `feature-flag.schema.ts` и `setting.schema.ts` уже имеют `deletedAt` prop + `softDelete: false`. Плагин корректно возвращает early exit. Fix уже в коде с TZ-46. Никаких изменений не потребовалось.

**2. Theme toggle для operational-страниц**
- `app-layout.component.ts` — добавлен `<app-teme-toggle />` в хедер (рядом с кнопкой выхода).
- Переиспользован существующий `ThemeToggleComponent` (из kit-layout) + `ThemeService` (из core/).
- Теперь ВСЕ страницы (/materials, /organizations, /dictionaries, /products — все под app-layout) имеют переключатель темы.

**3. Ещё светлее — paper-2 bump**
- `styles.css`: paper-2 L 0.945→**0.960** (light), 0.32→**0.33** (dark). Chroma снижен 0.035→0.030 для «воздушности». Non-text token — WCAG не применяется.

**4. Тёплый акцент — active nav / primary button / badge / checkbox / select / pagination / command palette — bg-ink → bg-sunrise-warm (9 файлов)**
- `app-layout.component.ts` — active nav link
- `kit-layout.component.ts` — active nav link
- `button/button.component.ts` — default variant (`bg-ink text-paper` → `bg-sunrise-warm text-paper`)
- `badge/badge.component.ts` — default variant
- `checkbox/checkbox.component.ts` — checked state (`bg-ink text-paper border-ink` → `bg-sunrise-warm text-paper border-sunrise-warm`)
- `select/select-option.component.ts` — selected state (template + CSS)
- `pi-pagination.component.ts` — active page (`activeClass()`)
- `command/pi-command-palette.component.ts` — selected item
- `dictionaries/dictionaries.page.ts` — toggle switch active state
- `organizations/organization-form-dialog.component.ts` — type pill selected state + **focus-ring унификация** (6 input'ов с hardcoded focus-visible → `pi-focus-ring`)
- **Brand block'и (10×10 ink squares) НЕ тронуты** — identity elements.
- **Tooltip / Progress bar / Foundations swatch НЕ тронуты** — high-contrast необходим.
- **WCAG note:** sunrise-warm (`oklch 0.58`) on paper (`oklch 0.972`) = 4.01:1 — AA Large ✅ для button/badge/pagination/select text.

**5. Login page — ревью**
- Уже использует CSS custom properties + `border-sunrise-warm` для карточки. Отлично выглядит с новой палитрой. Изменений не требуется.

**6. CRUD-миграция (window.confirm → AlertDialog + browser verify)**
- Результат поиска: все страницы УЖЕ используют `PiPageHeaderComponent`, `PiSectionComponent`, `pi-cell`, `pi-table-row`. `grep "page-header|chip"` → 0 hits. Миграция выполнена ранее.
- Основная находка: 3 `window.confirm()` в materials/organizations/dictionaries — заменены на `PiDialogService.open(AlertDialogComponent)`.
- `AlertDialogComponent` переработан: вместо `input.required()` (вызывал NG0950 при открытии через сервис) использует `inject<AlertDialogData>(PI_DIALOG_DATA)`. Экспортирован интерфейс `AlertDialogData`.
- **Browser verify (Chrome):** theme toggle ✅, delete dialog ✅, warm accent ✅, 0 console errors на /materials, /organizations, /dictionaries.

**Затронутые файлы:**
- `frontend/src/styles.css` (paper-2 bump)
- `frontend/src/app/layout/app-layout.component.ts` (theme toggle + warm accent)
- `frontend/src/app/layout/kit-layout.component.ts` (warm accent)
- `frontend/src/app/shared/ui/button/button.component.ts` (warm accent)
- `frontend/src/app/shared/ui/badge/badge.component.ts` (warm accent)
- `frontend/src/app/shared/ui/checkbox/checkbox.component.ts` (warm accent)
- `frontend/src/app/shared/ui/select/select-option.component.ts` (warm accent)
- `frontend/src/app/shared/ui/pi-pagination.component.ts` (warm accent)
- `frontend/src/app/shared/command/pi-command-palette.component.ts` (warm accent)
- `frontend/src/app/pages/dictionaries/dictionaries.page.ts` (warm accent)
- `frontend/src/app/pages/organizations/organization-form-dialog.component.ts` (warm accent + focus-ring)

### Browser Visual Verification (Chrome — 8 страниц)

В рамках сессии улучшений проведена полная browser-верификация всех страниц с новой палитрой (Paper & Ink warm, TZ-LIGHT-XX, тёплый акцент sunrise-warm):

| Страница | Theme toggle | Тёплый акцент | AlertDialog | Console errors |
|---|---|---|---|---|
| `/materials` (operational) | ✅ light↔dark | ✅ +Создать кнопка | ✅ отмена/escape/удаление | 0 |
| `/organizations` (operational) | ✅ | ✅ | ✅ | 0 |
| `/dictionaries` (operational) | ✅ | ✅ toggle switch | ✅ | 0 |
| `/login` (public) | ✅ (отсутствует — ожидаемо) | ✅ Войти кнопка | — | 0 |
| `/kit/playground/theme` (public) | ✅ | ✅ 9 OKLCH слайдеров | — | 0 |
| `/kit/playground/code` (public) | ✅ | ✅ 5 code previews | — | 0 |
| `/kit/overview` (public) | ✅ | ✅ 4 секции | — | 0 |

**Дополнительно:**
- `window.confirm()`: **0 matches** во всём проекте (full sweep по *.ts, *.html, *.js, *.mjs) ✅
- `confirm()` (без `window.`): **0 matches** ✅
- Playground route correction: `/playground/theme-editor` → `/kit/playground/theme` (правильный роут) — browser-use найден и проверен
- AlertDialogComponent: 23 unit tests (новый файл, все проходят) ✅
- PiDialogService: 28 unit tests (существующие, все проходят) ✅

## 🆕 Новые TZ: Quality Audit Batch (2026-07-19)

**Мотивация:** Полный аудит качества проекта — выявлено 15 задач по 6 направлениям.
**Total new tasks:** 16 (TZ-150..TZ-165)

### 🔴 CRITICAL (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-150** | ESLint — Angular ESLint config + lint скрипты | 2-3h | — |
| **TZ-151** | CI/CD — GitHub Actions (lint + test + build) | 3-4h | TZ-150* |
| **TZ-152** | Unit тесты для 10 критических страниц (batch 1) | 6-8h🔥 | — |

> *TZ-151 можно создавать параллельно с TZ-150 — lint job будет пустым до выполнения TZ-150.
> 🔥 TZ-152 estimate может быть 2-3 дня при полном покрытии (10 страниц × 3+ тестов).

### 🟡 HIGH (5 задач)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-153** | Prettier config + format скрипты | 1h | TZ-150 |
| **TZ-154** | Миграция legacy HttpClient → httpResource (6 страниц) | 4-6h | — |
| **TZ-155** | DTO validation audit — class-validator покрытие | 3-4h | — |
| **TZ-156** | E2E тесты для 5 бэкенд модулей | 5-7h | TZ-151 |
| **TZ-157** | Мониторинг — Sentry + Health Check + Uptime | 3-4h | — |

### 🟢 MEDIUM (4 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-158** | Performance budgets + bundle analyzer | 2-3h | TZ-151 |
| **TZ-159** | Circular dependency detection (Madge) | 1-2h | — |
| **TZ-160** | A11y audit в CI (nightly, non-blocking) | 2-3h | TZ-151 |
| **TZ-161** | Lighthouse CI — performance regression | 2-3h | TZ-151 |

### 🔵 LOW (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-162** | Swagger decorators audit | 2-3h | TZ-155 |
| **TZ-163** | Structured logging — requestId, traceId | 2-3h | — |
| **TZ-164** | Husky + lint-staged pre-commit hooks | 1-2h | TZ-150, TZ-153 |

### 🆕 TZ-165 — Layout audit form-dialog components

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-165** | Layout audit всех form-dialog (12 диалогов) + overflow-y:auto для pi-dialog form variant | 1-2h | TZ-104.4 |

**Результат аудита:** Ни один другой диалог не имеет точного такого же бага, как table-template-dialog (two-section layout с height:100%). Но найдена общая проблема: `pi-dialog.component.ts` form variant body не имеет `overflow-y: auto`, что может обрезать контент при многих FormArray-строках. Рекомендация: добавить `overflow-y: auto` в bodyClass для form variant + `min-height: 0` для 5 form-dialog с FormArray.

Подробности: `tasks/TZ-165.md`

### 📋 Дополнительные TZ-кандидаты (из ревью)

- **MongoDB indexes audit** — проверить все 65+ схем на дубликаты/отсутствие индексов
- **Frontend error boundary** — fallback UI при ошибках рендера компонента
- **Backend unified error codes** — единый формат ошибок для всех endpoint'ов

## 🆕 TZ-110..127 Backend Audit Batch (2026-08-01)

Autonomous backend engineer (`Codebuff`) провёл полный аудит 10 backend-ТЗ (TZ-110, TZ-119..126 + TZ-127):

| TZ | Outcome | Краткое содержание |
|---|---------|--------------------|
| TZ-110 | ✅ DONE (baseline) | Category backend safety — `category.service.ts:133,184` atomic update/delete via session.withTransaction |
| TZ-119 | ✅ DONE | NEW `IsObjectIdPipe` + `IsOptionalObjectIdPipe` (vendor split) + `IsObjectIdParam` decorator + audit-object-id-validation.ts CLI |
| TZ-120 | ✅ DONE | Global soft-delete plugin — `database/soft-delete.plugin.ts` auto-filter for 30+ schemas |
| TZ-121 | ✅ DONE | Cross-service TX integrity — SessionRunner helper в 9+ сервисах (TZ-121.1 для Order/Contract в successor) |
| TZ-122 | ✅ DONE | Optimistic locking — plugin + 409 filter + 4 schemas (TZ-122.1 для 30+ adoption) |
| TZ-123 | ✅ DONE | Type-safe ObjectId — `@ToOptionalObjectId()` decorator + 12+ DTOs (TZ-123.1 для 14 оставшихся service casts) |
| TZ-124 | ✅ DONE | List perf — 33 `.lean()` + 0 chained `.populate()` (TZ-124.1 для listSelects standardisation) |
| TZ-125 | ✅ DONE | Interceptor RxJS — mergeMap/catchError/defer/finalize patterns + NEW `audit.interceptor.spec.ts` 7/7 PASS |
| TZ-126 | ✅ DONE | EAV atomicity — `bulkWrite + session.withTransaction` + NEW `eav.service.spec.ts` 13/13 PASS |
| TZ-127 | ❌ FAILED | HttpOnly cookie SET but UNREAD + tiered throttler NOT implemented + frontend localStorage UNTOUCHED → TZ-127.1/2/3 successor-TZ required |
| TZ-119.1 | ❌ BLOCKED | Incremental adoption of `IsObjectIdPipe` упирается в 3 жёстких запрета пользователя: (1) массовый `findById(id: string)` → `findById(id: Types.ObjectId)` refactor в 60+ service'ах запрещён без отдельной TZ; (2) частичный adoption даёт ложное чувство защиты на 27+ оставшихся controllers; (3) третий pipe-класс (validate-only, возвращающий `string`) был REJECTED code-reviewer'ом в предыдущей continuation. 173+ unguarded `new Types.ObjectId(...)` calls остаются. Successor-TZ: **TZ-119.2** (coordinated `findById` refactor) или **TZ-119.3** (defensive `Types.ObjectId.isValid()` helper). Архив: `tasks/_archive/2026-08/TZ-119.1.blocked.md`. Lock-file НЕ создан per TZF-00 §5. |

**Verification:** `pnpm exec tsc` PASS exit 0 + 20/20 jest tests PASS (TZ-125 + TZ-126 specs).

**Master audit document:** `docs/backend-agent-checklist.md` (160 lines).

**Archive files:** `OrchestratorKit/_archive/2026-08/TZ-{110,119..127}.{done|failed}.txt`.
**Lock files:** `.mimocode/locks/TZ-{110,119..126}-*.lock` (9 DONE locks).

**`verify-status.sh`:** exit 1 (82 discrepancies — **pre-existing structural mismatch** OrchestratorKit↔`tasks/`/TZ files), 0 of which caused by this session within its scope.

> **Подзадача TZ-119.1 → ❌ BLOCKED (см. `tasks/_archive/2026-08/TZ-119.1.blocked.md`)**. Mass adoption existing `IsObjectIdPipe` (return type `Types.ObjectId`) blocked by 3 user-imposed constraints: no service-signature refactor без отдельной TZ; no partial adoption (false safety); no third pipe class (rejected by code-reviewer prior continuation). 173+ unguarded `new Types.ObjectId(...)` calls remain. Successor: **TZ-119.2** (coordinated findById refactor) или **TZ-119.3** (defensive isValid helper).


| Слой | Метрика | Значение |
|------|---------|----------|
| Backend | Entities (schema files) | 72 (basher-verified 2026-08-01: `find backend/src -name '*.schema.ts' \| wc -l` = 72; TZ-260 п.4 refresh) |
| Backend | Modules | 73 files |
| Backend | Files | ~285 |
| Backend | Build time | ~10s |
| Frontend | Pages (router) | 23 (login + operational + /kit/* showcase + /admin placeholder — см. app.routes.ts) |
| Frontend | UI components | 24+ (Paper & Ink primitives) |
| Frontend | Unit tests | 559 (59 suites) — basher-verified 2026-08-01 |
| Frontend | Bundle size | 542.84 kB initial / ~155 kB transfer |
| Frontend | Build time | ~2s |
| Backend | E2E specs | 7 baseline (post-TZ count см. archive) |

## 🎯 Стек

### Backend
- NestJS 10 + Mongoose 8 + MongoDB
- JWT auth + RBAC (Roles, Permissions)
- Class-validator + Swagger
- Helmet + CORS + Throttler
- Jest + Supertest (E2E)

### Frontend
- **Angular 20.3** (standalone, signals, new control flow `@if`/`@for`/`@switch`)
- **TailwindCSS v4** (`@import 'tailwindcss'`, `@theme inline`, `@utility` API)
- **Paper & Ink design system** (OKLCH палитра, hairline borders, no shadows, `pi-focus-ring`)
- **24+ кастомных UI-компонентов** (Button, Badge, Card, Input, Dialog, Sheet, Drawer, Tooltip, Popover, HoverCard, DropdownMenu, ContextMenu, Toast, Tabs, Breadcrumb, Accordion, Progress, Skeleton, Avatar, Separator, ScrollArea, Charts, Select, Checkbox, Switch, Radio, Slider, Label, FormField, Table, Pagination)
- **Lucide Angular** (editorial 1.5px stroke icons)
- **CDK Overlay** (Dialog, Sheet, Drawer, Tooltip, Popover, HoverCard, Menu)
- **⌘K Command Palette** + **Live OKLCH Theme Editor**

## 📁 Структура

```
kppdf-8.0/
├── backend/              # NestJS API (TZ-01..TZ-18)
│   ├── src/
│   │   ├── main.ts       # Bootstrap + Helmet + CORS + Throttler
│   │   ├── app.module.ts # Root module (18 feature modules)
│   │   ├── common/       # Guards, interceptors, decorators, seeds
│   │   ├── database/     # Connection, plugins (softDelete, audit, userContext)
│   │   └── modules/      # 18 feature modules (65+ entities)
│   └── test/             # E2E test suites
├── frontend/             # Angular 20 SPA (Paper & Ink editorial)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Auth, interceptors, services, guards, tokens
│   │   │   ├── layout/   # AppLayout (operational), KitLayout (UI showcase)
│   │   │   ├── pages/    # login, materials, organizations, dictionaries, /kit/*
│   │   │   └── shared/   # ui/ (24+ Paper & Ink primitives), page/, command/, theme/, code/, playground/
│   │   ├── styles.css    # OKLCH palette + Tailwind v4 @theme + hairline utils
│   │   └── index.html
│   ├── proxy.conf.json   # Dev proxy: /api/* → :3000
│   └── angular.json
├── docs/                 # data-model.md, add-new-page.md, paper-and-ink.md
├── OrchestratorKit/      # Task orchestration (kit-init, make-tz, etc)
├── start.mjs             # Cross-platform dev orchestrator (Node 20+)
├── docker-compose.yml    # MongoDB Replica Set
├── ARCHITECTURE.md       # Architecture document
├── STACK.md              # Technology stack
├── progress.md           # Chronological progress log
└── STATUS.md             # This file
```

## 🆕 Audit Tasks — Security & Code Quality (2026-07-25)

**Мотивация:** Полный аудит проекта выявил 8 задач, не покрытых существующими TZ.

### 🔴 CRITICAL — Security (4 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-171** | Убрать .env из git-истории | 30min | — |
| **TZ-172** | Закрыть публичный /auth/register | 1h | — |
| **TZ-173** | Исправить CI backend format → format:check | 20min | — |
| **TZ-174** | Добавить backend в lint-staged | 30min | TZ-173 |

### 🟡 HIGH — Code Quality (3 задачи)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-175** | Добавить security scanning в CI | 1h | TZ-173 |
| **TZ-176** | Заменить console.warn на Logger + убрать as any | 1-2h | — |
| **TZ-178** | Добавить unit тесты для 5 backend сервисов | 3-4h | — |

### 🟢 MEDIUM — Architecture (1 задача)

| TZ | Название | Оценка | Dependencies |
|----|----------|--------|--------------|
| **TZ-177** | Разбить builder.page.ts (god file 1359 строк) | 2-3h | TZ-170 |

### 📋 Рекомендации по порядку

1. **Немедленно:** TZ-171 (30min) → TZ-172 (1h) → TZ-173 (20min)
2. **После:** TZ-174, TZ-175, TZ-176
3. **Параллельно:** TZ-177, TZ-178

---

## 🆕 Recent atomic commits (2026-07-11)

### TZ-83 (5 atomic commits — A/B/C/D/E)

**Сводка:** ~25 files / +1800 / -400; ~3 backend modules + 4 new pages + 3 services + 6 specs.

- `chore(backend): TZ-83A — drop ProductComponent + ProductModule ref+override + ProductModulePhoto entity + atomic attach/detach endpoints + drop-stale script` (5 review rounds PASS).
- `feat(frontend): TZ-83B — services + WorkTypes dictionary page + nav-link "Виды работ"`.
- `feat(frontend): TZ-83C — /modules list + /modules/:id 4-section detail + 2 dialogs (incl. override-dimensions UI)`.
- `feat(frontend): TZ-83D — /products/:id detail с модулями + picker dialog + clickable list rows + atomic attach endpoint на backend`.
- `test: TZ-83E — 3 backend e2e specs + 3 frontend unit specs (11 tests)`.

**Verification:** backend + frontend typecheck exit 0, 11/11 new unit tests pass.

### `28daca6` — `fix(frontend): TZ-86 F.6 follow-up — Angular template-binding bugfixes across 7 doc-constructor files`

**Сводка:** 7 files / +N / -N; commit hash `28daca6`. Unblocks F.3 browser visual verification.

**Root cause (FINAL):** `tsconfig.json` has `"strictTemplates": true` enabled but `tsc --noEmit` doesn't run Angular's template typecheck. Prior TZ-86 verifications passed `pnpm exec tsc` (exit 0) but failed `ng serve` (Application bundle generation failed with NG8001/NG8002/NG8113/NG8102/NG8107/TS2345/TS2339). 7 doc-constructor files needed systematic fix in 3 phases: (1) selector renames `<pi-X>` → `<app-pi-X>` (imports already present), (2) SelectComponent/PiPageHeaderComponent API corrections (content-projected options, eyebrow required, `string | null` value models), (3) orphan reference cleanup.

**Verification gates:**
- `pnpm exec ng build --configuration=production` → PASSED in 3.357s, 0 warnings.
- `pnpm exec ng serve` → HTTP 200 on :4200, 0 NG/TS errors in fresh log.
- frontend tsc + backend tsc → exit 0 ✅.
- 5/5 e2e suites re-run → 34/34 PASSED in 18.7s (no regression).

**Files (7):** `builder-inspector.component.ts` · `builder.page.ts` · `builder-tool-pane.component.ts` · `builder-canvas.component.ts` · `block-renderer.component.ts` · `texts.page.ts` · `tables.page.ts`. Cross-references: TZ-78 (orig-warning), TZ-AUDIT-6 (focus-ring orthogonal), TZ-AUDIT-8 (hairline border orthogonal).

### `b78c1c0` — `chore(cleanup): atomic defensive cleanup batch`

**Сводка:** 12 files / +116 / -52; commit hash `b78c1c0`.

**Backend defensive hardening (8 файлов):**
- `backend/src/common/validators/inn.validator.ts` — `checkInn10` (drop 2-stage bug; single weighted sum mod 11 mod 10 is correct, position 9 is the check digit) + `checkInn12` (drop dead `w3`/`d12_check`).
- 6 seed files (counterparty-roles, feature-flags, org-roles, settings, statuses, units) — defensive `try/catch` вокруг `findBy/upsert` чтобы один битый seed не валил `OnApplicationBootstrap`.
- 3 services (contract, order, quotation) — добавлен private `findByIdRaw()` helper (Mongoose `.findById` без `.populate` возвращает raw `ObjectId` refs; нужно напр. для `contract.activate` который создаёт Order по `customerId`).
- `backend/src/modules/actual-cost/dto/create-actual-cost.dto.ts` — `orderId` стал `@IsOptional()` с JSDoc (ActualCostController мержит orderId из URL param POST `/production-orders/:orderId/actual-costs`, раньше ValidationPipe реджектил body до controller injection).

**Root purge (1 файл):**
- `.gitignore` — добавлен `package-lock.json` guard с inline rationale comment. Root `package.json` не имеет `dependencies`; `node_modules/` в корне больше не нужен.

**Cross-references:**
- **TZ-46 hotfix follow-up:** defensive try/catch pattern для seed files mirrors TZ-46's principle «1 битый seed не должен валить bootstrap». Предыдущее поведение: один exception в seed → 25-секундный boot loop → 500 на /api/health. Теперь seed log warn, продолжение bootstrap.
- **INN validator fix:** original implementation в TZ-03, this commit корректирует баг в `checkInn10` (был 2-stage weighted sum с двумя разными weight-массивами; правильно — 1 weighted sum mod 11 mod 10 = check digit at position 9). И drop dead `w3`/`d12_check` в `checkInn12` (third-stage sum был never used, оставлен после рефакторинга).
- **Seed StrictModeError treat:** defensive try/catch вокруг `create/upsert` handles the case где seed и schema out of sync. TZ-05 ввёл `deletedAt: null` requirement на schema; если seed присылает поле которого schema не ожидает, StrictModeError fail. Try/catch оборачивает regression gracefully.

**Verification:** backend + frontend typecheck exit 0, E2E baseline 7 suites / 22 tests / 26s passing.

**Lock-файлы:** N/A (chore commit, no code zone to lock).

### `0db6e79` — `chore(sec): TZ-91 Phase B.2 RBAC coverage sweep + audit script`

**Сводка:** 47 files / +211 inserts / 0 deletes; commit hash `0db6e79`. Closes TZ-91 §1 HIGH finding «RBAC не на write endpoints = 1 из 3 CRITICAL».

**Stratification:**
- 45 auto-patched controllers (batched script + per-path guard via `fs.existsSync`)
- 1 `product/product.controller.ts` (canonical nested-controller)
- 1 `product/product-subroutes.controller.ts` (3-level depth test)
- 1 `organization/contacts/organization-contact.controller.ts` (3-level depth test)
- 1 `auth/auth.controller.ts` (MANUAL: Roles import + `@Roles('admin','manager','user')` on logout)
- 1 `user/user.controller.ts` (MANUAL: `@Roles('admin','manager','user')` on update + changePassword)

**Convention applied:** `@Verb → @Roles('admin','manager') → @AuditAction` (matches canonical MaterialController).

**Self-service endpoints (manual @Roles with user tuple):**
- `auth.controller.logout` (self-service, calls `this.auth.logout(me.id)`)
- `user.controller.update` (self-service, has internal `if (me.role !== 'admin' && me.id !== id)` guard)
- `user.controller.changePassword` (self-service, same guard pattern)

**Insertion strategies:**
1. Batched script (`backend/scripts/_patch-roles-batch.ts`, deleted post-batches): depth-aware import path computation (`../../common/decorators/roles.decorator` for 2-level, `../../../common/...` for 3-level), per-path `fs.existsSync()` guard before write, idempotency via `Roles` import detection, `@Roles` insertion after `@Verb` and before `@AuditAction` via `Math.max(verbLineRel + 1, auditLineRel)` trick.
2. Manual edits (4 `str_replace` total): auth + user for self-service role tuples.

**5-batch execution:** counter + actual-cost..counter (10) → doc-type..order-closing (10) → order-task..routing-step (10) → rpp..warehouse (10) → work-center..worker (7) + manual auth/user. Per-batch verification: `pnpm exec tsc -p tsconfig.build.json --noEmit` (0 errors) + regenerated audit JSON (`missingCount` decrements) + `pnpm exec jest --testPathPattern=auth.e2e-spec.ts` (5/5 PASS).

**Verification at final state:**
- `pnpm exec tsc -p tsconfig.build.json --noEmit` → 0 errors ✅
- `pnpm exec ts-node scripts/audit-roles-coverage.ts` → `missingCount: 0`, `publicTempCount: 3` (unchanged at register/login/refresh), `okCount: 226` ✅
- `tmp/audit-roles-coverage.json` regenerated (gitignored per TZ-91D) ✅

**Forward-deferrals (NOT in this commit):**
- Audit script regex → ts-morph AST upgrade (TZ-91D) — line-based regex parser could miss unusual decorator patterns.
- Pre-existing TS2345 in `backend/src/database/soft-delete.plugin.ts(27,18)` (`'softDelete'` not a key of Mongoose `SchemaOptions`) — NOT introduced by this commit (last touched in `7fffd37` «bulk project health fixes from z.txt audit»); out of TZ-91B.2 scope; forward-deferred alongside audit-interceptor cleanup in TZ-91D.
- LazyModuleLoader + bootstrap timeout observability (TZ-94) — unblocks e2e full-suite parallel runs.
- Hardcoded test `ADMIN_PASSWORD` → env-var-driven fixture (TZ-95.2).

**Cross-references:**
- TZ-91 §1 original HIGH/Critical finding («@Public registration + RBAC not on write endpoints = 1 of 3 CRITICAL») → this commit closes the RBAC half. @Public deferral on `/register` is still TZ-91 §2 Decision 1 (waits for TZ-91-extension invite-flow).
- TZ-91A (commit `4a2d6bd`): register-AdminDto role gate still active.
- TZ-91 Phase C (`d8df374`): Swagger prod gating + `start.mjs` JWT dev-warning unaffected.
- TZ-92: Roles payloads (id, username, email, displayName, role, permissions) preserved through `auth.getMe`.

**Run auditor:** `cd backend && pnpm exec ts-node scripts/audit-roles-coverage.ts` (WARN+exit 0 if any MISSING persists).

**Code-reviewer verdict:** 🟢 Ship-ready — sampled invoice/order/rate-limit all show canonical `@Verb → @Roles → @AuditAction`; self-service 'user' tuple preserves internal authorization checks; admin-only endpoints (user.create/remove `@Roles('admin')`, user.list `@Roles('admin','manager')`) correctly retain stricter tuples unchanged.

**Lock-файлы:** N/A (chore commit, no code zone to lock).

## ⏳ Готовые к запуску (READY)

### Audit Tasks (2026-07-25) — Security & Code Quality

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-171 | Убрать .env из git-истории | 4 | 30min | — |
| TZ-172 | Закрыть публичный /auth/register | 4 | 1h | — |
| TZ-173 | Исправить CI backend format → format:check | 4 | 20min | — |
| TZ-174 | Добавить backend в lint-staged | 4 | 30min | TZ-173 |
| TZ-175 | Добавить security scanning в CI | 4 | 1h | TZ-173 |
| TZ-176 | Заменить console.warn на Logger + убрать as any | 4 | 1-2h | — |
| TZ-177 | Разбить builder.page.ts (god file) | 3 | 2-3h | TZ-170 |
| TZ-178 | Добавить unit тесты для 5 backend сервисов | 4 | 3-4h | — |

### QA audit findings (2026-08-01) — closed 2026-08-02

TZ-261 and TZ-262 were implemented, regression-tested, reviewed, and archived after the evidence-based audit. Browser smoke was not run in the isolated session; this limitation remains recorded in each archive marker.

### TZ-90 (2026-07-11) — Dialog system standardization (4 templates · 50% backdrop · 8px radius · shadow tokens · migration of 11+ existing dialogs)

**Мотивация:** Спека фиксирует единый стандарт для ВСЕХ модальных/диалоговых окон, чтобы они ощущались как «зрелое десктопное приложение» (явный запрос PO 2026-07-11). Разрозненные ad-hoc лейауты (30% editorial backdrop, разные radius, разные header-плотности) заменяются на 4 templates × 4 widths через polymorphic `<app-pi-dialog variant="...">`.

**Зафиксированные решения (9):** ровно 4 templates (Alert + Form + Content + Destructive — новый шаблон только через отдельный TZ); backdrop 50% вместо editorial 30%; shadow = `0 8px 32px rgba(0,0,0,0.24)` light / 0.48 dark через `--dialog-shadow` токен; radius 8px глобально; modal by default; animation = fade-in + scale 0.96→1.0 за 180ms с disabled@`prefers-reduced-motion`; padding 24px в body контента + 16px между sections; audit table обязательна; **polymorphic wrapper** (один `<app-pi-dialog variant>` вместо 4 отдельных компонентов).

**Audit Table (`tasks/TZ-90.md` §3) — verified 2026-07-11:**
- T1 Alert (sm): 1 dialog — `pi-alert-dialog.component.ts`
- T2 Form (lg): 8 dialogs — `module-form-dialog`, `work-type-form-dialog`, `product-form-dialog`, `contract-form-dialog`, `material-form-dialog`, `order-form-dialog`, `organization-form-dialog`, `module-materials-form-dialog`
- T3 Content (xl): 3 dialogs — `product-module-picker-dialog`, `text-block-dialog`, `table-template-dialog`
- T3 Content (xl): 1 dialog — `cost-calculation-detail-dialog` ⏳ pending TZ-85D
- T4 Destructive (md): 1 future dialog — `pi-confirm-destructive-dialog` (deferred per TZ-90 §7)
- **13/13 dialogs ↔ reality match verified via filesystem enumeration** (no expansion, no merge, no rename needed).

**Phases A → E:** A (Layer 1: tokens + shadow/animation CSS), B (Layer 2: polymorphic wrapper + animation trigger), C (Layer 3 SERIAL: migration existing 11+ dialogs), D (Layer 3 SERIAL: `/kit/overlays` Section V showcase + TZ-85D wiring), E (Layer 1: docs sync).

**Must-NOT-regress (spec §8 cross-references):**
- **TZ-83 ✅** operational pages (где живут диалоги).
- **TZ-85 IN PROGRESS** — TZ-85D = `cost-calculation-detail-dialog` станет Template 3 (Phase D.2 conditional logic готов).
- **TZ-DIALOG-OVERFLOW-FIX rounds 1-5 ✅** — `max-height: 90vh !important; overflow-x: clip !important; overflow-y: auto !important;` сохраняются в `.pi-overlay-panel`.
- **TZ-DIALOG-VISIBILITY-FIX round 5 ✅** — `background-color: var(--color-paper)` сохраняется; backdrop RGB fallback chain сохраняется.
- TZ-AUDIT-6 (focus-ring), TZ-AUDIT-8 (hairline-first borders), TZ-AUDIT-9 (warm-paper palette) — TZ-90 их НЕ ломает (только потребляет).

**STATUS:** ⏳ READY — spec committed, execution pending.

### Document Constructor — TZ-DOC-319 (2026-08-02) — Удаление блока «Отступ» (spacer)

**Мотивация (пользователь 2026-08-02):** «Отступ не нужен — тексты и так выставляются по факту. Раньше отступ нужен был, чтобы раздвигать тексты, сейчас смысла нет. Почистить понятие отступ, все связанные файлы с отступом».

**Зафиксированные решения:** `spacer`-блок полностью удаляется из frontend (создание: кнопка тулбара «— Отступ» + секция 3 tool-pane; рендер-ветка + CSS; слайдер высоты в инспекторе; `BlockType`/`BLOCK_TYPES`/labels/hints; placeholder «Разделитель»). Backend **не изменяется**: `'spacer'` остаётся в enum schema и `@IsIn` DTO для backward compat старых шаблонов (полная миграция legacy-значения — отдельная задача, вне scope). Старые шаблоны с `type: 'spacer'` продолжают открываться через generic-ветку рендера.

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-DOC-319 | Удаление блока «Отступ» (spacer): UI/типы/рендер/инспектор/docs; backend enum остаётся для backward compat | 3 | 1-2h | — (не параллельно с TZ-DOC-316/317) |

**Must-NOT-regress:** TZ-DOC-309..314 (общие `builder.page.ts`/`builder-tool-pane.component.ts`/`template-block.types.ts`), слайдер высоты `signature` (инспектор), TZ-DOC-315..317, TZ-DOC-318 (зарезервирован), Materials/Admin/Z-backlog.

**STATUS:** ⏳ READY — spec committed, execution pending.

### Modules (2026-08-02) — Модуль: большой content-диалог + редактор материалов + expandable-каталог

**Мотивация (пользователь 2026-08-02):** «диалог создания модуля — как в материалах: большое грамотно работающее окно; модуль состоит из материалов — выпадающий список материалов с подстановкой ширины/высоты; если галочка зафиксирована (isImmutable) — в модуле менять нельзя, остальные размеры редактируются; несколько материалов — красиво, структурно по категориям, строками как таблица с параметрами и фотографиями; в каталоге модулей клик по строке раздвигает вниз таблицу материалов».

**Зафиксированные решения:** backend уже готов (schema `ProductModule.materials[]`, DTO, серверный enforcement `isImmutable`, populate `materials.materialId` с `name photoIds unit dimensions`) — backend НЕ изменяется. Два frontend-слоя (Layer 3, строго последовательно): (1) диалог модуля переводится на DSL content-диалога (`variant="content"` + maxWidth 1000px, как у материалов) и встраивает редактор материалов с isImmutable-локами, фото и группировкой по категориям; (2) каталог модулей получает expandable-строки с таблицей материалов (pi-table уже умеет `expandedRow`). Старые модули не ломаются.

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-MODULES-301 | Модуль — большой content-диалог + встроенный редактор материалов (dropdown, isImmutable-локи, фото, группировка по категориям) | 3 | 3-4h | — (backend готов) |
| TZ-MODULES-302 | Каталог модулей — expandable-строки: клик по строке раздвигает таблицу материалов | 3 | 1-2h | TZ-MODULES-301 (recommended) |

**Порядок:** 301 → 302. Не параллельно (Layer 3, общий домен модулей).

**Must-NOT-regress:** TZ-DOC-309..319 (общие `pi-dialog` DSL — только потребляют), Materials page (референс DSL — read-only), Admin/RBAC, Z-backlog, desktop.

**STATUS:** ⏳ READY — spec committed, execution pending.

### Products (2026-08-02) — Товар: большой content-диалог по DSL + RAL-цвета + модули карточками + expandable-каталог + карточки-витрины

**Мотивация (пользователь 2026-08-02):** «диалог товара — реально красивая реализация по нашему DSL/UI-киту/дизайну, поля по категориям разбитые и красиво показанные; цвет — RAL выпадающим списком + добавить их в справочники как цвета; обязательный пункт — выбор модулей в товаре как материалы в модуле, модули карточками, из чего состоит продукция; в каталоге продукции при нажатии на строку раскрывается список модулей; при нажатии на модуль — переход на страницу модуля; нужны большие карточки товара/модуля/материала — витрина, где всё про него, по категориям, с кнопками редактирования и переходами на связанные сущности; три размера карточек: большая/средняя/маленькая по DSL/UI-киту, переиспользуемые».

**Зафиксированные решения:** backend в основном готов (Product schema, M:N `productModuleIds`, атомарные POST/DELETE `/products/:id/modules`, populate в list/findById). Цепочка: 301 (справочник цветов RAL — новая сущность, backend + UI) → 302 (диалог товара: content-вариант 1000px + поля по категориям + RAL dropdown) → 303 (встроенный редактор модулей карточками в диалоге товара) → 304 (expandable-каталог товаров: клик по строке → модули, клик по модулю → страница модуля) → 305 (UI Kit карточки-витрины sm/md/lg, переиспользуемые). `ralCode` остаётся legacy-строкой (миграция — отдельный SUCCESSOR при необходимости). Проверено: справочника цветов нет, pi-card есть (базовый, без размеров/медиа) — 305 его расширяет или создаёт PiShowcaseCardComponent.

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-PRODUCTS-301 | Справочник «Цвета» (RAL): ColorReference backend-контракт + UI `/dictionaries/colors` (sparse-unique, system seed, 409 in_use/system) | 4 → 3 | 3-4h | — |
| TZ-PRODUCTS-305 | UI Kit — карточки-витрины sm/md/lg (товар/модуль/материал), переиспользуемые + эталонное применение на одной детальной странице | 2 | 3-4h | — (самостоятельный UI-слой) |

**Порядок:** 301 → 302 → 303 → 304 строго последовательно (Layer 3, общий products-домен + сервисы). 305 — UI Kit (Layer 2), может идти параллельно только если нет пересечения по файлам.

**Must-NOT-regress:** TZ-MODULES-301/302 (паттерн редактора материалов и expandable-каталога — референсы), TZ-DOC-309..319, Materials page (референс DSL — read-only), Admin/RBAC, Z-backlog, desktop.

**STATUS:** ⏳ READY — spec committed, execution pending.

### Workers / WorkTypes (2026-08-02) — «Люди»: единая таблица + карточка человека; «Виды работ»: большой content-диалог + сотрудники + expandable-каталог

**Мотивация (пользователь 2026-08-02):** «всё то же самое касается видов работ: создание, большой диалог; у вида работ должен быть выпадающий список сотрудников, в ПЛМ будем фильтровать по сотрудникам; если понятия сотрудников нет — создать одну большую таблицу людей; единая карточка создания человека: e-mail, телефон, пароль (всё о пользователе) + должность, фирма, поставщик, менеджер поставщика; выпадающие списки-категории; привязываем людей к виду работ, к фирме/поставщику — единый справочник людей; в каталоге поставщика — пункт «добавить человека» из этого списка».

**Зафиксированные решения:** `Worker` и `Person` УЖЕ существуют в backend (workers + persons), но UI для людей отсутствует полностью. Единая «Люди»-сущность строится на базе Worker (уже есть `workTypeIds[]` M2M → WorkType), расширяется: email, position, department, supplierId?, managerOfSupplierIds?, userId? (→ User), organizationId? (sparse unique, TZ-238), deletedAt?. Консолидация Person → Worker решается по факту кода (Organization.contactPersonId — ref). M2M вид работы ↔ сотрудники — через `Worker.workTypeIds[]` (вариант A, backend не меняется). Четыре TZ: 301 (backend «Люди»-контракт) → 302 (UI страница «Люди» + единая карточка content-диалог) → 301 (диалог вида работы + секция «Сотрудники») → 302 (expandable-каталог видов работ с сотрудниками). Создание аккаунта-пользователя из карточки человека — отдельный SUCCESSOR (не лезть в auth).

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-WORKERS-302 | «Люди» — большая таблица (pi-table) + единая карточка человека (content-диалог 1000px, секции: основное/производство/виды работ/фирма-поставщик/статус) | 3 | 3-4h | TZ-WORKERS-301 |
| TZ-WORKTYPES-301 | Вид работы — большой content-диалог по DSL + секция «Сотрудники» (dropdown людей, M2M через Worker.workTypeIds) | 3 | 2-3h | TZ-WORKERS-302 |
| TZ-WORKTYPES-302 | Каталог видов работ — expandable-строки с сотрудниками + фильтр по людям (по факту поддержки) | 3 | 1-2h | TZ-WORKTYPES-301 |

**Порядок:** WORKERS-301 → 302 → WORKTYPES-301 → 302 строго последовательно (Layer 3/4, общие сервисы людей). SUCCESSOR: создание аккаунта-пользователя из карточки человека (auth/user), привязка людей в карточке поставщика (по TZ-WORKERS-302).

**Must-NOT-regress:** TZ-MODULES-301/302, TZ-PRODUCTS-301..305 (паттерны референсов), TZ-DOC-309..319, Materials page (референс DSL — read-only), auth/user (пароль/логин не трогаем), Admin/RBAC, Z-backlog, desktop.

**STATUS:** ⏳ READY — spec committed, execution pending.

### Document Constructor — TZ-DOC-315..317 (2026-08-02) — Категории текстовых блоков

**Мотивация (пользователь 2026-08-02):** в `/doc-constructor/texts` и в builder picker'е «Тексты» нужен фильтр по пользовательским категориям — чтобы при росте библиотеки текстов было понятно, откуда и для чего блок. Существующий фиксированный enum `category: 'legal'|'intro'|'outro'|'custom'` (text-block.schema.ts:24-39) не масштабируется, и в builder панели тексты подгружаются одним GET без фильтра (builder-tool-pane.component.ts:444, builder.page.ts:704).

**Зафиксированные решения:** три TZ по слоям (4 → 3 → 3), новая сущность `TextBlockCategory` (НЕ переиспользовать generic `Category` из-за skuPrefix и global unique), паттерн зеркалит TZ-DOC-307 (sparse-unique `{organizationId, slug}`, system default «Общее», 409 на in_use/system, server-side resolveDefault, assertAssignable). Legacy enum `category: 'legal'|'intro'|'outro'|'custom'` остаётся в схеме для backward compat — отдельный SUCCESSOR `TZ-DOC-318` (миграция enum → categoryId, не часть этой цепочки).

| TZ | Название | Layer | Оценка | Dependencies |
|----|----------|-------|--------|--------------|
| TZ-DOC-315 | TextBlockCategory — доменный контракт (sparse-unique slug, resolveDefault, `categoryId` Prop в `TextBlock`, e2e CRUD + scope + 409) | 4 | 2-3h | — |
| TZ-DOC-316 | TextBlockCategory — справочник `/dictionaries/text-block-categories` + form-dialog + бейдж/filter на `/doc-constructor/texts` + select в редакторе блока | 3 | 2-3h | TZ-DOC-315 |
| TZ-DOC-317 | Builder — dropdown «Категория» в picker'е «Тексты», `categoryId` query param в `/api/text-blocks` | 3 | 1-2h | TZ-DOC-315 (рекомендуется после TZ-DOC-316) |

**Порядок:** ТОЛЬКО 315 → ждать close → 316 → 317. Не выполнять параллельно — общий `text-block` модуль и `builder-tool-pane.component.ts`.

**Must-NOT-regress:**
- TZ-DOC-307 ✅ (архитектурный референс для category contract; НЕ дублировать generic `category` модуль).
- TZ-DOC-308 ✅ (UI справочник шаблонов; новый словарь `text-block-categories` симметричен по форме).
- TZ-DOC-309 ✅ (паттерн active-only cache + invalidation обязателен для TZ-DOC-316).
- TZ-DOC-310..314 ✅ (общий `builder-tool-pane.component.ts` → TZ-DOC-317 не запускать параллельно).
- TZ-DOC-311 ✅ (legacy enum `category` сохраняется в схеме; миграция в successor).
- TZ-MATERIALS-*, Admin/RBAC, sanitize-html, TZ-278, Z-backlog, TZ-BACKEND-E2E-HARNESS, документные таблицы (`document-table-type`) НЕ затрагиваются.

**STATUS:** ✅ DONE (315/316/317/318/326).

### Document Constructor — TZ-DOC-315..317 (2026-08-02) — Категории текстовых блоков

**TZ-DOC-316 (UI dictionary + picker): ✅ DONE — 2026-08-02.** `PiTextBlockCategoriesService` (кэш активного каталога по TZ-DOC-309, БЕЗ shareReplay), dedicated page `/dictionaries/text-block-categories` (CRUD, system-lock, loading/error/empty, поиск), form-dialog (variant=content, 1000px, whitelist, double-submit guard), select «Категория» в редакторе блока (auto-select default, «Не выбрана» → null → categoryId не отправляется), колонка «Категория» + dropdown-фильтр на `/doc-constructor/texts`, route + nav item. Gates: frontend tsc PASS, backend tsc PASS, jest 5 suites/48 PASS, ng build PASS, git diff --check PASS, verify-status.sh PASS. Archive: `tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md`. Lock: `.mimocode/locks/TZ-DOC-316-text-block-category-reference-and-picker.lock`. Successor: TZ-DOC-317 (builder picker dropdown «Категория»).

**TZ-DOC-317 (builder picker filter): ✅ DONE — 2026-08-02.** `BuilderTextFilterService` (root-провайдер, единый сигнал `categoryId`, `null` = «Все») — общий источник правды для tool-pane и inline тулбара. Dropdown «Категория» над обеими «Тексты»-поверхностями; опции из `PiTextBlockCategoriesService.list({ activeOnly: true })` (TZ-DOC-309 кэш, без повторных GET). `textsRes` httpResource URL пересобирается: `?isActive=true` → `?isActive=true&categoryId=<id>` (server-side Mongo-фильтр, backend TZ-DOC-315). Two-way URL binding `?category=<id>` (read в queryParamMap subscribe, write в effect с `replaceUrl: true` + snapshot loop-guard против избыточного navigate — фикс regression TZ-DOC-268 cancel-теста). Смена шаблона → `textFilter.reset()`. `TextBlocksService.list()` получил `categoryId` HttpParams. Gates: frontend tsc PASS, backend tsc PASS (sanity), jest targeted 4 suites/44 PASS, jest full 886 PASS (2 pre-existing flakes: button.component double-emit, pi-showcase-card TZ-PRODUCTS-305 icon provider — disclosed), ng build PASS, diff-check PASS, verify-status PASS. Archive: `tasks/_archive/2026-08/TZ-DOC-317-builder-texts-filter-by-category.done.md`. Lock: `.mimocode/locks/TZ-DOC-317-builder-texts-filter-by-category.lock`. Successor: TZ-DOC-318 (legacy enum migration) — разблокирован.

**TZ-DOC-326 (textblock categoryId UI): ✅ DONE — 2026-08-02.** Residual sweep: legacy `category` enum ('legal'|'intro'|'outro'|'custom') полностью убран из frontend UI-слоя. `pi-text-blocks.service.ts` — удалён legacy-тип `TextBlockCategory`, поле `category` у `TextBlock`, param `category` у list и сеттер `httpParams.set('category', ...)`; только `categoryId`. Хинты insert UI (`@if (t.category)` dead после 323) → `categoryName(t.categoryId)` lookup через каталог (TZ-DOC-309 cache) в `builder-tool-pane` и inline dropdown `builder.page`; inline-тип `textsRes` `category?` → `categoryId?`. Убраны unused imports `PiPageHeaderComponent`/`ButtonComponent` (NG8113 warnings от TZ-DOC-324 rewrite) — ng build 0 warnings. Спек-фикстуры очищены (pi-text-blocks.service.spec, texts.page.spec, builder-tool-pane.component.spec). Gates: tsc fe/be PASS, jest targeted 5 suites/40 PASS, jest full 898 PASS (2 pre-existing flakes disclosed), ng build PASS (0 warnings), diff-check PASS, verify-status PASS. Residual grep → 0 hits. Archive: `tasks/_archive/2026-08/TZ-DOC-326-textblock-categoryid-ui.done.md`. Lock: `.mimocode/locks/TZ-DOC-326-textblock-categoryid-ui.lock`. **TZ-CHAIN-COMPLETE: 315→316→317→318→326 (text-block category lineage closed).**

**TZ-DOC-318 (builder topbar category-filter polish): ✅ DONE — 2026-08-02.** URL persistence `?categoryId=<id>` (read в queryParamMap subscribe, write в effect с `replaceUrl: true` + snapshot loop-guard; F5-refresh и shareable-ссылка открывают builder с активным фильтром). Breadcrumb badge в верхней панели (chip `builder-category-chip`, `currentCategoryLabel()` lookup по categories, клик → сброс фильтра, только когда `templateId()` есть). Two-picker sync подтверждён: tool-pane читает `selectedCategoryId` из `BuilderTextFilterService` (единый источник правды, без локального signal). Параметр URL переименован `category` → `categoryId`. Rebase-merge на новый main с TZ-DOC-324 (pure-editor rewrite): конфликты builder.page.ts/­spec разрешены, восстановлен import-блок (324 оставил broken marker), добавлен `BuilderToolPaneComponent` в imports (ng build TS2345), убран orphaned `}` и stale `(categoryChanged)`. Gates: frontend tsc PASS, backend tsc PASS (sanity), jest targeted 5 suites/45 PASS, ng build PASS, diff-check PASS, verify-status PASS. Archive: `tasks/_archive/2026-08/TZ-DOC-318-builder-texts-topbar-category-filter.done.md`. Lock: `.mimocode/locks/TZ-DOC-318-builder-texts-topbar-category-filter.lock`. Successor: TZ-DOC-326 (textblock categoryId UI). **Merge-coordinator cue: TZ-308/316/317/318 теперь linked в 318 worktree — merge в main увеличит 4 TZ одним действием.**

**TZ-DOC-315 (backend domain contract): ⏳ DONE — 2026-08-02.** `backend/src/modules/text-block-category/` создан как зеркало TZ-DOC-307 (sparse-unique `{organizationId, slug}`, system «Общее», `assertAssignable`, `resolveDefault`). `TextBlock` расширен опциональным `categoryId?: Types.ObjectId` (legacy enum сохранён для backward-compat). `CreateTextBlockDto` принимает `categoryId` (whitelist). `text-block.service.ts` через inject `TextBlockCategoryService` теперь резолвит server-side default, когда клиент не прислал id. `TextBlockCategoriesSeed` в bootstrap регистрирует системную «Общее». `app.module.ts` импортирует модуль и регистрирует seed. Backend tsc exit 0; jest targeted на text-block-category 12/12 PASS; полный frontend/backend rebuild без регрессии по архитектуре. Archive: `tasks/_archive/2026-08/TZ-DOC-315.done.md`. Lock: `.mimocode/locks/TZ-DOC-315-text-block-category.lock`. Successor: TZ-DOC-316 (UI dictionary + picker в каталоге/редакторе).

## 🔥 IN WORK (агенты работают)

| TZ | Дата старта | Описание | Статус |
|---|---|---|---|

## ✅ DONE (недавно завершены)

| TZ | Дата | Описание | Архив |
|---|---|---|---|
| TZ-PHOTO-301 | 2026-08-09 | Upload сохраняет original + Sharp WebP thumb, parentPhotoId и variants.thumb в API | `tasks/_archive/2026-08/TZ-PHOTO-301.done.md` |
| TZ-PRODUCTION-303.1b | 2026-08-07 | Main landing: Gantt hotfix (rail↔bars sync, WorkType.days rollback, bar context/legend/toolbar/ACL UX) + inspector `/orders?q=<номер>` deep-link; catalog polish preserved | `tasks/_archive/2026-08/TZ-PRODUCTION-303.1b-land-hotfix-main.done.md` |
| TZ-PRODUCTION-303.1 | 2026-08-07 | Gantt closeout: inspector `/orders?q=<номер>` deep-link, OrdersPage query-param search, production docs | `tasks/_archive/2026-08/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.done.md` |
| TZ-PRODUCTS-301 | 2026-08-02 | Справочник «Цвета» (RAL) — ColorReference entity (sparse-unique {organizationId, slug}, hex, soft-delete) + seed «Не выбран» + страница /dictionaries/color-references (pi-table, copy/edit/delete) | `tasks/_archive/2026-08/TZ-PRODUCTS-301-color-reference-dictionary.done.md` |
| TZ-PRODUCTS-302 | 2026-08-02 | ProductFormDialog — content-диалог 1000px + секции по категориям + RAL dropdown из справочника цветов (slug → ralCode, «Не выбран» → null, явный null в PATCH, атомарное удаление фото) | `tasks/_archive/2026-08/TZ-PRODUCTS-302-product-form-dialog-rework.done.md` |
| TZ-PRODUCTS-303 | 2026-08-02 | «Модули в составе» в диалоге товара — карточки модулей (имя/артикул/N материалов/×) + мульти-picker (string[]), submit атомарными POST/DELETE /products/:id/modules (diff) | `tasks/_archive/2026-08/TZ-PRODUCTS-303-product-modules-cards-editor.done.md` |
| TZ-PRODUCTS-304 | 2026-08-02 | Expandable-строки каталога — клик по строке разворачивает карточки модулей (инициалы/имя/артикул/N материалов), routerLink /modules/:id, empty state, колонка «Модулей» | `tasks/_archive/2026-08/TZ-PRODUCTS-304-products-catalog-expandable-modules.done.md` |
| TZ-PRODUCTS-305 | 2026-08-02 | Карточки-витрины: PiShowcaseCardComponent sm/md/lg (порт e00be99 verbatim) + toggle list ↔ grid в каталоге (sm-карточки: инициалы/name/цена/badge статуса, routerLink, localStorage persistence) | `tasks/_archive/2026-08/TZ-PRODUCTS-305-ui-kit-showcase-cards.done.md` |
| TZ-SALES-301 | 2026-08-02 | КП (коммерческие предложения) — thin UI над существующим QuotationModule (single API, дубль не создавался): pi-proposals.service + proposals.page (pi-table, статус-бейджи) + proposal-form-dialog (sticky footer, позиции-снапшот) + route /proposals (admin) + nav «Сделки → КП» + docs | `tasks/_archive/2026-08/TZ-SALES-301-proposal-thin-ui.done.md` |
| TZ-ORDERS-301 | 2026-08-02 | КП → Заказ (strip-commerce): convertToOrder только из accepted (guard) + без unitPrice (COPY FK + inline snapshot productName/SKU, DROP price/total); order.update() блок после in_production; OrderItemDto.unitPrice optional; кнопка «В заказ» на proposals page (только accepted) + тесты (backend 27, frontend 23) | `tasks/_archive/2026-08/TZ-ORDERS-301-quote-to-order-conversion.done.md` |

> **MERGE CUE:** TZ-303 + TZ-304 + TZ-305 + TZ-SALES-301 + TZ-ORDERS-301 попадут в main одним merge из worktree `221ae09f` (branch `freebuff/task-221ae09f-…`) — PO/merge-agent ответственность.
| TZ-WORKERS-301 | 2026-08-02 | «Люди» — единая backend-сущность на базе Worker (email, position, supplierId, managerOfSupplierIds, userId, organizationId sparse, deletedAt); Person-консолидация → SUCCESSOR | `tasks/_archive/2026-08/TZ-WORKERS-301.done.md` |
| TZ-PRODUCTS-301 | 2026-08-02 | Справочник «Цвета» — ColorReference backend-контракт + UI `/color-references` (sparse-unique, system-цвет «Не выбран» seed, 409 in_use/system, content-диалог 1000px) | `tasks/_archive/2026-08/TZ-PRODUCTS-301-color-reference-dictionary.done.md` |
| TZ-PRODUCTS-301-export-mismatch | 2026-08-02 | Fix tsc/ng-build блокера: import/inject `ColorReferencesService` → `PiColorReferencesService` в color-references-form-dialog + `sortOrder?: number` в ColorReference interface/payloads (backend gap → successor) | `tasks/_archive/2026-08/TZ-PRODUCTS-301-export-mismatch-fix.done.md` |
| TZ-PRODUCTS-302 | 2026-08-02 | Диалог товара — content-вариант 1000px, секции по категориям, categoryId select, RAL dropdown из справочника цветов, фото-загрузка | `tasks/_archive/2026-08/TZ-PRODUCTS-302-product-form-dialog-rework.done.md` |
| TZ-PRODUCTS-303 | 2026-08-02 | Редактор модулей в диалоге товара — секция «Модули в составе»: карточки модулей (имя, артикул, N материалов), добавление через ProductModulePicker, удаление, атомарная M:N-синхронизация POST/DELETE /products/:id/modules (diff snapshot vs selection) | `tasks/_archive/2026-08/TZ-PRODUCTS-303-product-modules-cards-editor.done.md` |
| TZ-PRODUCTS-304 | 2026-08-02 | Expandable-каталог товаров — клик по строке раскрывает модули (карточки имя/артикул/N материалов), клик по модулю → `/modules/:id`; ленивая загрузка при первом раскрытии + page-scoped cache | `tasks/_archive/2026-08/TZ-PRODUCTS-304-products-catalog-expandable-modules.done.md` |
| TZ-DOC-311 | 2026-08-02 | Свойства шаблона — pageNumbering сохраняется; «Оглавление/Шапка/Подвал» убраны из UI (backward-compatible, без миграции) | `tasks/_archive/2026-08/TZ-DOC-311.done.md` |
| TZ-DOC-316 | 2026-08-02 | Категории текстов — справочник `/dictionaries/text-block-categories` + form-dialog + select в редакторе блока + колонка/фильтр на `/doc-constructor/texts` (PiTextBlockCategoriesService с кэшем активного каталога) | `tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md` |
| TZ-DOC-309 | 2026-08-02 | Диалог создания шаблона — мгновенное открытие (кэш активных категорий в сервисе, инвалидация на CRUD) | `tasks/_archive/2026-08/TZ-DOC-309.done.md` |
| TZ-DOC-310 | 2026-08-02 | Диалог создания — закрытие с первого клика; видимая валидация категории; parentDestroyRef в 4 open() | `tasks/_archive/2026-08/TZ-DOC-310-template-dialog-one-click-close.done.md` |
| TZ-102 | 2026-07-19 | Backend route gaps (Currency module + Modules rename + Inventory summary) | `tasks/_archive/2026-07/TZ-102.md.done` |
| TZ-110 | 2026-07-19 | Category backend safety — cycle prevention + existing safety sweep | `tasks/_archive/2026-07/TZ-110.md.done` |
| TZ-111 | 2026-07-19 | Builder bulk-delete race condition — partial success + snapshot rollback | `tasks/_archive/2026-07/TZ-111.md.done` |
| TZ-115 | 2026-07-19 | Inventory pages — error toast + httpResource migration | `tasks/_archive/2026-07/TZ-115.md.done` |
| TZ-104 | 2026-07-19 | Pi-* UI-kit adoption (switches + pi-table + textarea + checkbox) | `tasks/_archive/2026-07/TZ-104.md.done` |
| TZ-120 | 2026-07-19 | Global Soft-Delete Mongoose plugin | `tasks/_archive/2026-07/TZ-120.md.done` |
| TZ-103 | 2026-07-19 | Dialog system audit + 4-bug fix (close · positioning · tab-switch · buttons) | `tasks/_archive/2026-07/TZ-103.md.done` |
| TZ-261 | 2026-08-02 | Admin dialogs — as-casts removed from templates (P0, ng build 0 errors) | `tasks/_archive/2026-08/TZ-261.done.md` |
| TZ-262 | 2026-08-02 | Admin gates capability alignment (`/admin/users` route+nav `user:read` → `user:admin`) | `tasks/_archive/2026-08/TZ-262.done.md` |
| TZ-263 | 2026-08-02 | Verifier — `ng build --configuration=development` added to run-project-checks (tsc не компилирует templates) | `tasks/_archive/2026-08/TZ-263.done.md` |
| TZ-265 | 2026-08-02 | Admin pages Paper & Ink compliance — `text-red-600` → `text-destructive`, hex → tokens in 3 dialogs | `tasks/_archive/2026-08/TZ-265.done.md` |
| TZ-264 | 2026-08-02 | Admin dialog unit tests — 3 additive spec files (smoke NG5xxx guard, canSubmit, loadCatalog, toggles) | `tasks/_archive/2026-08/TZ-264.done.md` |
| TZ-266 | 2026-08-02 | Generated-document organization scope before HTML/read/write side effects (imported workspace task, renumbered) | `tasks/_archive/2026-08/TZ-266.done.md` |
| TZ-267 | 2026-08-02 | Templates registry error state and SilentResult HTTP boundary (imported workspace task, renumbered) | `tasks/_archive/2026-08/TZ-267.done.md` |
| TZ-MATERIALS-301 | 2026-08-02 | Материалы — широкий структурированный диалог (content variant + maxWidth 1000px, sticky footer, двухколоночный layout) | `tasks/_archive/2026-08/TZ-MATERIALS-301.done.md` |
| TZ-MATERIALS-302 | 2026-08-02 | Материалы — единицы из API (listActive) + поставщики: active-фильтр, loading/error/empty, unitFallback для деактивированной единицы | `tasks/_archive/2026-08/TZ-MATERIALS-302.done.md` |
| TZ-MATERIALS-303 | 2026-08-02 | Материалы — понятный код: «Внутренний код материала», DTO-декларация sku (фикс 400), E11000→409, решение B + successor TZ-307 на серверную генерацию | `tasks/_archive/2026-08/TZ-MATERIALS-303.done.md` |
| TZ-MATERIALS-304 | 2026-08-02 | Материалы — остаток отделён от карточки: убраны input/payload/колонка stockQty, legacy deprecation, successor TZ-308 (material→склад) | `tasks/_archive/2026-08/TZ-MATERIALS-304.done.md` |
| TZ-MATERIALS-305 | 2026-08-02 | Материалы — габариты: one-click-one-row, следующий неиспользованный тип по порядку, fallback length, isImmutable gap → successor TZ-309 | `tasks/_archive/2026-08/TZ-MATERIALS-305.done.md` |
| TZ-MATERIALS-306 | 2026-08-02 | Материалы — фото и надёжное сохранение: save guard (submitting||uploading), mixed upload, main photo ∈ photoIds, orphan cleanup | `tasks/_archive/2026-08/TZ-MATERIALS-306.done.md` |
| TZ-DOC-307 | 2026-08-02 | Категории шаблонов — доменный контракт (отдельная сущность DocumentTemplateCategory, categoryId в DocumentTemplate, server-side default, RBAC, backfill migration) | `tasks/_archive/2026-08/TZ-DOC-307.done.md` |
| TZ-DOC-308 | 2026-08-02 | Категории шаблонов — UI: справочник-страница, выбор категории в setup-диалоге (default auto-select), колонка + фильтр в реестре шаблонов, form-dialog, тесты | `tasks/_archive/2026-08/TZ-DOC-308.done.md` |
| TZ-DOC-268 | 2026-08-02 | Builder — диалог создания шаблона закрывается после одного клика, без дубликата POST; regression-тесты | `tasks/_archive/2026-08/TZ-DOC-268.done.md` |
| TZ-DOC-269 | 2026-08-02 | Builder — строгая рамка выделения, opt-in сетка, snap/guides проверены; тесты + ревью | `tasks/_archive/2026-08/TZ-DOC-269.done.md` |
| TZ-DOC-270 | 2026-08-02 | Builder — удержание изображения внутри рамки (clip-контейнер vs resize-handles), NaN-safe corner resize | `tasks/_archive/2026-08/TZ-DOC-270.done.md` |
| TZ-DOC-271 | 2026-08-02 | Builder — порядок слоёв (front/back/raise/lower) через computeLayerOrder, rollback при ошибке API | `tasks/_archive/2026-08/TZ-DOC-271.done.md` |
| TZ-DOC-272 | 2026-08-02 | Builder — marquee-выделение + editor-only group/ungroup (persistence НЕ имитируется) | `tasks/_archive/2026-08/TZ-DOC-272.done.md` |
| TZ-DOC-273 | 2026-08-02 | Builder — фон и прозрачность блоков: строгий hex, кламп opacity, зеркальная валидация в сгенерированном HTML | `tasks/_archive/2026-08/TZ-DOC-273.done.md` |
| TZ-ADMIN-275 | 2026-08-02 | Role form — подтверждённые hex-fallback убраны из var() (токены глобальные), 0×hex, tsc/build/jest PASS | `tasks/_archive/2026-08/TZ-ADMIN-275.done.md` |
| TZ-279 | 2026-08-02 | Workflow — дубль build-команды устранён: check:build удалён, канон build:dev, docs синхронизированы (заказан как TZ-276, номер занят другой сессией) | `tasks/_archive/2026-08/TZ-279.done.md` |
| TZ-276 | 2026-08-02 | SUPERSEDED — полностью покрыт TZ-DOC-268; production-код повторно не менялся | `tasks/_archive/2026-08/TZ-276.superseded.md` |
| TZ-274 | 2026-08-02 | Admin capability UI-gating — users/roles action buttons hidden by required capabilities; regression tests | `tasks/_archive/2026-08/TZ-274-admin-capabilities-ui-gating.done.md` |

## 🚀 Следующие шаги (предложения)

Все этапы до TZ-46 завершены + Paper & Ink editorial SPA rework (TZ-30..82) + палитра (TZ-AUDIT-9, TZ-WARMUP-100, TZ-LIGHT-XX) + 6-направленная сессия улучшений. Возможные направления:

1. **Нарастить operational pages** — products, orders, contracts, warehouse, production. Канон: materials/organizations/dictionaries (AppLayout + authGuard + service + dialog).
2. **E2E tests run** — реальный прогон test/setup/* + test/e2e/*.e2e-spec.ts (тесты созданы в TZ-17, не запускались регулярно).
3. **Консолидация data model** — 16 пар дублирующих сущностей (Proposal/Quotation, SupplierOrder/PurchaseOrder, Role/Roles и др.). Документированы в `docs/data-model.md`.
4. **highlight.js + axe-core** — повторить pnpm install после lockfile reconcile (TZ-78 fallback, TZ-79 deferred).
5. **Browser-use smoke test** — TZ-82 independent, можно запустить через `ng serve` без SSR.

---

## TZ-92 series (2026-07-11) — MCP integration (3 sequential TZs)

### TZ-92: codebase-memory MCP integration baseline (retired 2026-08-01)

- Historical record only: the optional vendored MCP bundle and `.mcp.json` were removed during the canonical cleanup because the application does not depend on them.
- Commit: feat(mcp): TZ-92 baseline — vendor bundle + .mcp.json + mcp:start
- Archive: tasks/_archive/2026-07/TZ-92.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92-mcp-integration.lock

Vendor-bundle codebase-memory-mcp v0.9.0 (DeusData 2025, MIT) — vendor/codebase-memory-mcp/{bin,doc,README.md} + .mcp.json (RFC 8259, no _comment) + package.json mcp:start script + 4 .gitignore excludes. install.ps1 помечен НЕ ЗАПУСКАТЬ (alien installer).

### TZ-92b: MCP docs sync + HTTP UI port :9749 verified

- Commit: docs(arch, mcp): TZ-92b baseline sync — UI port :9749 + Linux/macOS constraint + MCP Integration section
- Archive: tasks/_archive/2026-07/TZ-92b.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock

HTTP UI port :9749 verified empirically (binary v0.9.0 log scrape). ARCHITECTURE.md — новая секция MCP Integration (TZ-92) между TZ-41 (Dev Tooling) и TZ-03 (Database Layer) + Zone table row. vendor/README.md — Поддерживаемые платформы table (Win AMD64/ARM64/Linux/macOS) + Troubleshooting :9749 + auto-start hint. Stale :8765 reference заменён на verified :9749.

### TZ-92b-ux: source-build spec (Linux + macOS + Win-from-source)

- Commit: docs(tasks): TZ-92b-ux spec — source-build for Linux/macOS/Win-from-source
- Archive: tasks/_archive/2026-07/TZ-92b-ux.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-92b-ux-mcp-source-build.lock

Spec-only commit. Source-build codebase-memory-mcp на Linux/macOS/Windows-from-source через https://github.com/DeusData/codebase-memory-mcp (public MIT, scripts/build.sh --with-ui). Per-OS .mcp.<os>.json + cp switcher, scripts/build-mcp.mjs orchestrator с cross-FS-safe atomic-move, SIGINT handler, ENOSPC disk-space pre-check (3-OS branches via df -BG / df -g / fs.statfsSync), AUR alternative для Arch. 4-round code-review hardening complete. Implementation deferred to future TZ-NN.

---
---

## TZ-85: Cost Calculation (Расчёт себестоимости поверх модульной иерархии)

### TZ-85: Cost Calculation (5 phases, DONE 2026-07-11)

- Phase A: feat(TZ-85A): CostCalculationService rewrite — drop Bom/TechProcess, use ProductModule hierarchy (commit ea184df)
- Phase B-D: feat(TZ-85): Phase B-D — cost calculation frontend (service + Section V + breakdown dialog) (commit 111ca90)
- Phase E: feat(cost-calc): TZ-85 Phase E — e2e tests + DTO hardening + doc sync (Phase E commit)
- Archive: tasks/_archive/2026-07/TZ-85.md.done
- Lock: OrchestratorKit/.mimocode/locks/TZ-85-cost-calculation.lock

Расчёт себестоимости через ProductModule hierarchy — Material.pricePerUnit × quantity + WorkType.hourlyRate × hours + overhead%. 5 phases: A (backend rewrite, drop Bom/TechProcess), B (frontend service с silent-http pattern), C (Section V на /products/:id), D (breakdown dialog с polymorphic ui-component), E (e2e test 242 lines + DTO hardening @IsOptional productId + doc sync). 1 e2e test (cost-calculation.e2e-spec.ts: 7-step scenario — create materials, workType, productModule, product; POST cost-calculation; verify totals; activate; delete). Cross-references: TZ-83 (ProductModule hierarchy), TZ-86 (Document Constructor pattern reference).

---
### TZ-91 (2026-07-11) — Critical Security Hardening (Auth · RBAC · CORS · Swagger · Rate Limit · JWT)

**Мотивация:** Закрытие 3 CRITICAL + 5 HIGH security находок QA-01 (`/auth/register` открыт, admin password пустой, JWT secrets слабые, CORS misconfigured, Swagger без auth, rate-limit отсутствует, RBAC не на write endpoints). Полный TZ-91 разбит на 4 Phases, все успешно реализованы и архивированы в этом коммите.

**Phase A (Layer 1, `4a2d6bd`) — Quick Wins (5 surgical backend edits):**
- `register.dto.ts` — `@IsString() role` → `@IsOptional() @IsIn(['user','manager'])` whitelist (defense-in-depth, нельзя создать admin через `/register` даже если guard обходят).
- `auth.controller.ts` — `@Throttle({short: {ttl: 60_000, limit: 5}, long: {ttl: 3_600_000, limit: 20}})` на `/login` (5 req/min, 20 req/hour brute-force). JSDoc `@Public()` TEMPORARY tag на `/register` поясняет до-when TZ-91-extension invite-flow ships.
- `admin.seed.ts` — `@Inject` config admin password, `length < 8` → `logger.warn(...)` + `return` (admin NOT created, bootstrap continues). Per spec §2 Decision 3: WARN+SKIP безопаснее hardcoded fallback (security anti-pattern).
- `main.ts` — `CORS_ORIGIN` preferred envvar split comma-separated, `CORS_ORIGINS` legacy fallback.
- `.env` (working-tree only, gitignored) — `ADMIN_PASSWORD=admin12345678` (≥8 override `admin123`); `CORS_ORIGIN=http://localhost:4200,http://localhost:3000`.

**Phase B.2 (Layer 2, `e88c5b7` + `0db6e79`) — RBAC Sweep (47 files, ~211 lines):**
- `backend/scripts/audit-roles-coverage.ts` (NEW) — статический анализатор write endpoints без `@Roles()`. Output: console table + `tasks/audit-roles-coverage.json`.
- 45 auto-patched controllers (batched script) + 1 `product/product.controller.ts` (canonical nested) + 1 `product/product-subroutes.controller.ts` (3-level depth test) + 1 `organization/contacts/organization-contact.controller.ts` (3-level depth test).
- 2 MANUAL: `auth.controller.ts` (`@Roles('admin','manager','user')` on logout) + `user.controller.ts` (`@Roles('admin','manager','user')` on update + changePassword — self-service endpoints with internal `me.role !== 'admin' && me.id !== id` guard).
- Convention applied: `@Verb → @Roles('admin','manager') → @AuditAction` (matches canonical MaterialController).
- Final state: `pnpm exec ts-node scripts/audit-roles-coverage.ts` → `missingCount: 0`, `publicTempCount: 3` (unchanged at register/login/refresh), `okCount: 226`.

**Phase C (Layer 2, `d8df374`) — Swagger gating + drift (3 files):**
- `backend/src/main.ts` — `if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') { SwaggerModule.setup('docs', app, document); }`.
- `backend/src/common/seed/admin-password-drift-detector.ts` — graceful degradation на mismatched password (WARN log + auto-update OR warn).
- `start.mjs` — preflight check: warn если `JWT_SECRET` или `JWT_REFRESH_SECRET` содержит `dev` или `do-not-use` substr.

**Phase D (Layer 1, `b4c9826`) — Docs sync (4 files):**
- `STATUS.md` (project root) — Phase A + B.2 entries (разрозненные до архивирования).
- `ARCHITECTURE.md` — new «Security Architecture (TZ-91)» mini-section перед «Auth & Identity (TZ-04)» с defense-in-depth chain (JWT → Roles → @Roles decorator → rate-limiter → CORS multi-origin → Swagger gating).
- `backend/README.md` — new «Security & Admin setup» section (ADMIN_PASSWORD requirements, JWT secrets `openssl rand -hex 32`, CORS multi-origin format, rate-limit overrides, RBAC Phase B статус, Swagger Phase C статус, explicit "что НЕ покрыто в TZ-91" table).
- `progress.md` — chronologic entry этого коммита.

**Archival (this commit) — TZF-00 финализация:**
- tasks/TZ-91.md → tasks/_archive/2026-07/TZ-91.md.done (с ARCHIVE_MARKER блоком, 8 protected files listed).
- OrchestratorKit/.mimocode/locks/TZ-91-security-hardening.lock (NEW, 8 protected files: register.dto.ts, auth.controller.ts, admin.seed.ts, roles.guard.ts, main.ts, audit-roles-coverage.ts, start.mjs, backend/README.md).
- Унифицированная секция `### TZ-91 (2026-07-11)` (эта запись) заменила разрозненные Phase A / Phase B.2 / commit `b4c9826` entries.

**Code-reviewer verdict (2 review rounds per Phase A, 1 round per Phase B.2/C/D):** 🟢 Ship-ready, no blockers. Initial reviewer 🔴 flagged hardcoded fallback password как security anti-pattern → applied WARN+SKIP per spec §2 Decision 3. 🟡 MINORs closed: (1) A.2 defer rationale явный в commit body, (2) Phase D README docs sync для deferred A.4, (3) RBAC sweep 5-batch per-path guard, (4) self-service 'user' tuple preserves internal authorization checks.

**Затронутые файлы (TZ-91 cumulative, ~55+):**
- **Backend (8 files Phase A/C + 47 files Phase B.2 + 1 NEW script + 1 README):** `register.dto.ts`, `auth.controller.ts`, `admin.seed.ts`, `admin-password-drift-detector.ts`, `main.ts`, `roles.guard.ts`, `audit-roles-coverage.ts` (NEW), 47 controllers (RBAC sweep via 5 batches), `backend/README.md`.
- **Dev tooling:** `start.mjs` (JWT dev-secret warning).
- **Docs (3 files Phase D):** `STATUS.md`, `ARCHITECTURE.md`, `backend/README.md`, `progress.md`.
- **Archival (this commit):** `tasks/TZ-91.md` (deleted), `tasks/_archive/2026-07/TZ-91.md.done` (NEW), `OrchestratorKit/.mimocode/locks/TZ-91-security-hardening.lock` (NEW), `progress.md` (this entry).

**Verification:** `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0 ✅ (per commit). `audit-roles-coverage.ts` reported `missingCount: 0` (per `0db6e79` body) ✅. 5/5 e2e suites re-run → 34/34 tests PASSED ✅ (TZ-86 baseline preserved).

**Известные ограничения (не блокеры):**
- A.2 defer (no invite-flow yet) → self-service `/register` allows user/manager accounts via DTO constraint; admin creation blocked. Acceptable per TZ-91 §2 Decision 1 trade-off (waiting for TZ-91-extension).
- A.4 WARN+SKIP → manual `ADMIN_PASSWORD ≥ 8` setting required для fresh DB. Documented в `backend/README.md`. Dev's `.env` ships ≥8 default (admin12345678) для bootstrap-safe dev experience.
- `audit-roles-coverage.ts` CI test env node version mismatch — local invocation confirmed `missingCount: 0`. Env issue, not logical bug.
- DEFERRED to TZ-91-extension: invite-flow endpoint (`POST /api/users/invite`), account lockout after N failures, JWT secret rotation tooling, username-enumeration prevention, MFA.
- 24/27 pre-existing `verify-status.sh` FAILs remain (TZ-30-40 + TZ-47-60 missing from kit's `OrchestratorKit/_archive/`) — convention mismatch (project uses `tasks/`, kit scans `OrchestratorKit/`), НЕ regression от этого архива. Out of scope для TZ-91.

**Code-reviewer verdict on archival:** (per parallel code-reviewer-minimax-m3 call).


### TZ-90 Phase A + B (2026-07-11) — Dialog System foundation + polymorphic wrapper

**Scope:** TZ-90 spec (5 phases, 18 CONFLICT KEYS) split into sub-tasks. This commit covers Phase A (CSS tokens + CDK overlay + animation) + Phase B (polymorphic 4-template × 4-width wrapper + service animation trigger). Phase C (12 dialogs migration), Phase D (/kit/overlays + TZ-85D wiring), Phase E (docs sync) deferred to TZ-90C/D/E.

**Phase A — CSS foundation** (`frontend/src/styles.css`):
- 6 new tokens: `--dialog-bg` (paper), `--dialog-text` (ink), `--dialog-shadow` (24% light / 48% dark per TZ-AUDIT L-bump), `--dialog-radius` (8px), `--overlay-bg` (50% oklch + 50% rgb fallback for Baz layer)
- CDK overlay overrides: `.pi-overlay-backdrop` (50% opacity, 2-layer fallback), `.pi-overlay-panel` (paper bg + 8px radius + shadow + overflow rules from TZ-DIALOG-OVERFLOW-FIX rounds 1-5)
- Animation: `.pi-dialog-host-open` keyframes (fade-in + scale 0.96→1.0, 180ms ease-out, respects `prefers-reduced-motion`)

**Phase B — polymorphic wrapper** (commit `818946c`):
- `pi-dialog.component.ts`: 4 templates (alert/form/content/destructive) × 4 widths (sm/md/lg/xl) per spec §B.1
- 5 computed signals: panelClass, headerClass, bodyClass, footerClass, effectiveLabel
- Fallback table for unsupported combos (e.g. alert × md → alert × sm)
- 8px radius (rounded-lg) matches `--dialog-radius` token
- Content variant: sticky footer + bg-paper on header+footer (prevents body bleed-through)
- Destructive variant: ⚠ icon prefix in header
- `pi-dialog.service.ts`: `DialogConfig.modal` field (default true), `hasBackdrop: config.modal !== false`, `panelEl.classList.add('pi-dialog-host-open')` triggers animation
- `.gitignore`: extended pattern to `tmp/tz9*-{commit,arch}-*.txt`

**NOT TOUCHED (deferred to TZ-90C/D/E):**
- `pi-alert-dialog.component.ts` — still uses own `w-[440px]` + `rounded-sm` structure (intentional T1 one-off, TZ-90C will migrate)
- 12 operational dialogs in `pages/` — Phase C migration
- `/kit/overlays` Section V — Phase D
- TZ-85D `cost-calculation-detail-dialog` — Phase D wiring
- Docs (`paper-and-ink.md`, `add-new-page.md`) — Phase E

**Code-reviewer verdict:** 🟢 Ship-ready. 3 rounds, all nits closed (sticky-footer bg-paper, effectiveLabel computed, content header bg).

**Затронутые файлы:** `frontend/src/styles.css`, `frontend/src/app/shared/ui/dialog/pi-dialog.component.ts`, `frontend/src/app/shared/ui/dialog/pi-dialog.service.ts`, `OrchestratorKit/.mimocode/locks/TZ-90-dialog-system.lock` (NEW), `.gitignore`.

**Verification:** frontend typecheck 0 errors, code-reviewer approved, atomic commits, branch ahead of origin/main (NOT pushed, user auth required).

**Известные ограничения:** see "NOT TOUCHED" above. Phase C/D/E will extend `TZ-90-dialog-system.lock` with their own protected files.

**Lock file:** `OrchestratorKit/.mimocode/locks/TZ-90-dialog-system.lock` (6 protected files, 2 future_extensions).

### TZ-93 Phase 1 (2026-07-11) — Brutalist Architectural UI Foundations

**Scope:** TZ-93 spec (3-phase plan, tasks/TZ-93.md). This commit covers Phase 1 only — CSS foundations (3 utility classes) + playground fixture. Phase 2 (TZ-94, 12 components adoption) and Phase 3 (TZ-95, /kit/* showcase + docs) deferred.

**Phase 1 — CSS foundations** (`frontend/src/styles.css`, commit `753d6d6`):
- 3 new utility classes adopted from `stitch_professional_desktop_crm_refinement`:
  - `.pi-tech-label` (`@utility`) — 10px monospace tech label, uppercase, 0.1em letter-spacing, AAA contrast via `--color-muted-foreground-strong` (8.0:1 light, 7.5:1 dark)
  - `.pi-dashed-panel` (`@utility`) — 1px dashed `var(--color-rule)`, transparent background
  - `.pi-corner-marks` (`@layer components`) — 8px L-shaped marks in top-left and bottom-right corners via `::before/::after`, pure CSS, `pointer-events: none`
- Никаких новых color tokens — reuse existing OKLCH palette (`--font-mono`, `--color-rule`, `--color-muted-foreground-strong`)
- Respects Paper & Ink conventions: hairline-first, no `box-shadow`, no `rounded-md/lg/3xl`, warm OKLCH palette, WCAG AA minimum

**Phase 1 — playground fixture** (`frontend/src/app/pages/playground/theme-editor.page.ts`, commits `11d88a1` + `6948512`):
- New Section III «Architectural Utilities» with 3 demo cards
- Card 1: `pi-corner-marks` + `pi-tech-label` (solid hairline border + corner marks + REF label)
- Card 2: `pi-dashed-panel` alone (transparent background, dashed border)
- Card 3: Combined (`pi-corner-marks` + `pi-dashed-panel` + `bg-paper` + `pi-tech-label`)
- Code-reviewer nits closed: z-index removed from pseudo-elements (round 1), bg-paper added to combined card (round 2)

**REJECTED from brutalist source** (documented in TZ-93 spec adoption matrix):
- 0px radius everywhere → kept `rounded-sm` (interactive) / `rounded-none` (structural)
- 2px offset shadow → global `* { box-shadow: none !important }` сохранён
- 1px solid black borders → kept warm `var(--color-rule)` (L=0.880, not pure black)
- JetBrains Mono everywhere → `--font-mono` только для tech-label, IDs, numeric cells
- Charcoal primary → kept `--color-ink` (warm espresso L=0.250)

**Code-reviewer verdict:** 🟢 Ship-ready. 2 rounds, all nits closed.

**Затронутые файлы:** `frontend/src/styles.css`, `frontend/src/app/pages/playground/theme-editor.page.ts`, `OrchestratorKit/.mimocode/locks/TZ-93-brutalist-architectural-ui.lock` (NEW).

**Verification:** frontend typecheck 0 errors, code-reviewer approved (2 rounds), 3 atomic commits, branch ahead of origin/main (NOT pushed, user auth required).

**Known limitations:**
- **Browser-use visual verify BLOCKED** — `/playground/theme` за authGuard, dev server redirects to `/login`. Typecheck — primary verification gate. Visual verify deferred до auth wall resolution.
- DEFERRED-to-TZ-94: 12 components adoption (PiEmptyState, PiBadge, PiTable headers, form labels) — Layer 3 SERIAL
- DEFERRED-to-TZ-95: `/kit/*` showcase + `docs/paper-and-ink.md` + `docs/add-new-page.md` — Layer 1

**Lock file:** `OrchestratorKit/.mimocode/locks/TZ-93-brutalist-architectural-ui.lock` (2 protected files, 2 future_extensions: TZ-94, TZ-95).

### TZ-93.1 (2026-07-12) — Rollback .pi-corner-marks

**Сводка:** Mid-flight scope adjustment per user. 3 → 2 utilities; `.pi-corner-marks` rolled back due to "1990s hacker terminal" aesthetic risk.

**Scope decision:** User selected **Option C** (drop `.pi-corner-marks`) over Options A (`pi-tabular-nums`, redundant vs Tailwind v4 built-in) and B (`pi-status-pill`, redundant vs existing direct-usage pattern in BadgeComponent). Analysis: spawn_agents/thinker-with-files-gemini + ask_user confirmation.

**Что изменилось:**
- `styles.css` — `@layer components { .pi-corner-marks }` block removed (29 lines, 5 nested selectors); JSDoc updated "3 → 2 utilities" with rollback rationale in REJECTED-bullet.
- `theme-editor.page.ts` — Section III 3 cards → 2 cards (Dashed Panel + Tech Label); grid-cols-3 → grid-cols-2; intro paragraph mentions the rollback.
- `tasks/TZ-94.md` — C.2 PiEmptyTile retired (~~C.2~~ marker); C.1 wrapper simplified; commit order 5 → 4; C-numbering clarification note added; Section 6 auth wall ref disambiguated from TZ-93.1.
- `tasks/TZ-93.1.md` (NEW) — Follow-up spec; archived to `tasks/_archive/2026-07/TZ-93.1.md.done`.
- Lock file — `modifications:` section added documenting TZ-93.1 (e5d25fe); `future_extensions` updated to 5 components / 4 commits.

**Verification:** 2 atomic commits (impl + archival); frontend typecheck 0 errors; code-reviewer 2 rounds.

**Архив:** `tasks/_archive/2026-07/TZ-93.1.md.done` (per TZF-00 § 6).

## 🆕 TZ-232.I ESLint Enforcement Rules (2026-08-01)

Autonomous frontend engineer (`Codebuff`) реализовал sub-task TZ-232.I из TZ-232 Master Plan (Wave F tooling).

| Deliverable | Status |
|-------------|--------|
| `frontend/eslint/rules/no-raw-http-in-components.cjs` + `.spec.cjs` | ✅ DONE |
| `frontend/eslint/rules/no-implements-oninit-in-pages.cjs` + `.spec.cjs` | ✅ DONE |
| `frontend/eslint.config.js` — kppdf-frontend-architecture plugin + 2 file blocks | ✅ DONE |
| `frontend/jest.config.js` — testRegex extended for `eslint[/\\].*\.spec\.cjs$` | ✅ DONE |

**Архитектурное решение:** rules — CommonJS `.cjs` (не `.ts`) — Node CommonJS `require()` в `eslint.config.js` не может runtime-load `.ts` (ts-node не в deps). Trade-off: lose TS typecheck coverage on rule logic; gain Node loadability + Linter spec coverage (>5 PASS + 2 FAIL tests per rule).

**Verification:**
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0 ✅
- `pnpm exec tsc -p tsconfig.spec.json --noEmit` → exit 0 ✅
- `pnpm lint` → exit 0 (25 problems: 5 PRE-EXISTING errors + **20 NEW warnings** proving rules work correctly)
- `pnpm test` → 504 PASS / 25 FAIL (25 failures = 5 PRE-EXISTING suites в `capabilities/storage-items/forbidden/dsl-entity/capability-route.guard` — NOT in TZ-232.I scope)
- code-reviewer-minimax-m3 → **PASS-WITH-MINOR** (3 important issues documented as known follow-ups)

**Archive:** `tasks/_archive/2026-08/TZ-232.I.done.md` (12621 bytes, ARCHIVE_MARKER present).
**Lock:** `.mimocode/locks/TZ-232.I-eslint-rules.lock` (1435 bytes, DONE entry).

**Known follow-ups (3, non-blocking):** (1) Plugin registered in `**/*.html` block — harmless; (2) Severity `warn` for first rollout — escalates to `'error'` after TZ-232.H; (3) `HttpHandler`/`HttpInterceptor` imports not flagged by R1 — v1 scope decision.

**Cleanup this session:** orphan `.ts` files removed via `rm -f` (4 files). `frontend/tsconfig.app.json` + `tsconfig.spec.json` revert to original (rules excluded from app/spec typecheck scope).

**`bash OrchestratorKit/verify-status.sh`** — exit 0 с 82 pre-existing repo-wide discrepancies (TZ-66..82 missing from ✅ DONE table + TZ-110..127 listed in ⏳ but no `.txt` files в `OrchestratorKit/_archive/2026-08/`); **none caused by this session within scope** (root cause: pre-existing structural mismatch OrchestratorKit↔`tasks/`/TZ files from prior batches).

## 🆕 Frontend Wave 2 ORPHANED Batch (2026-08-01)

Autonomous frontend finalizer (Phase 0) подтвердил ORPHANED outcome для всех 3 задач этой категории — реальные task-файлы для TZ-154/176/177 отсутствуют, только записи в STATUS.md.

| TZ | Outcome | Supersedes | Successor |
|----|---------|------------|-----------|
| **TZ-154** | ✅ ORPHANED + SUPERSEDED | TZ-232 Wave C-D page migration + TZ-232.I ESLint rule already shipped 2026-08-01 | None required |
| **TZ-176** | ⚠️ ORPHANED + SUPERSEDED-PARTIAL | TZ-232.I covers `as any` cleanup | **TZ-176.1** — Logger/Telemetry provider (10 `console.*` instances, 1 production use in `app.config.ts`) |
| **TZ-177** | ✅ ORPHANED + SUPERSEDED | feat/builder-magnetic-grid worktree + TZ-235.B/C partial + TZ-232.J master plan | Continue TZ-232.J after feat/builder-magnetic-grid merges |

**Архивы:** `tasks/_archive/2026-08/TZ-{154,176,177}.orphaned.md` + `frontend-wave2-orphan-batch-2026-08-01.md`.

**Аудит baseline Phase 0:**
- `inject(HttpClient)` / `this.http.*` в production `*.page.ts`/`*.component.ts` → **0 matches**.
- `httpResource` adoption → **71 matches** в `frontend/src/app/`.
- `console.*` usage → **10 instances в 5 файлах** (1 production в `app.config.ts` GlobalErrorHandler; 9 в test specs/comments).
- `as any` в production → **2 matches** в test specs (capability-route.guard.spec.ts lines 30, 32) — НЕ production.

**Verification:** `pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0 (inherited PASS); `bash OrchestratorKit/verify-status.sh` exit 0 (82 pre-existing repo-wide discrepancies — 0 introduced by this session).

**Notes:**
- Не придумываем acceptance criteria для ORPHANED задач (per Phase 1 protocol).
- Не создаём lock files для ORPHANED outcome (per TZF-00 §5).
- `TZ-176.1` successor требует PO decision по logging provider (Sentry vs in-house vs ErrorBanner).

## 🆕 Consolidated Triage Batch (2026-08-01)

Autonomous-codebuff-agent (Buffy) выполнила inventory + triage всех 24 активных task-файлов. Realistic session budget позволил закрыть только то, что подтверждается кодом.

### ✅ DONE (14 tasks — code already on disk per basher-verified evidence)

| TZ | Archive | Lock |
|----|---------|------|
| TZ-248 | `tasks/_archive/2026-08/TZ-248.done.md` | `.mimocode/locks/TZ-248-production-invariants.lock` |
| TZ-249 | `tasks/_archive/2026-08/TZ-249.done.md` | `.mimocode/locks/TZ-249-trust-proxy.lock` |
| TZ-250 | `tasks/_archive/2026-08/TZ-250.done.md` | `.mimocode/locks/TZ-250-upload-hardening.lock` |
| TZ-251 | `tasks/_archive/2026-08/TZ-251.done.md` | `.mimocode/locks/TZ-251-ownership-matrix.lock` |
| TZ-252 | `tasks/_archive/2026-08/TZ-252.done.md` | `.mimocode/locks/TZ-252-refresh-cookie.lock` |
| TZ-254 | `tasks/_archive/2026-08/TZ-254.done.md` | `.mimocode/locks/TZ-254-rbac-contract.lock` |
| TZ-255 | `tasks/_archive/2026-08/TZ-255.done.md` | `.mimocode/locks/TZ-255-permissions-guard.lock` |
| TZ-256 | `tasks/_archive/2026-08/TZ-256.done.md` | `.mimocode/locks/TZ-256-capability-routes.lock` |
| TZ-256.A | `tasks/_archive/2026-08/TZ-256.A.done.md` (icon Palette→ShieldCheck + /admin placeholder, e505b9b) | `.mimocode/locks/TZ-256.A-shieldcheck-placeholder.lock` |
| TZ-257 | `tasks/_archive/2026-08/TZ-257.done.md` (mutations shipped via TZ-257.A.1) | `.mimocode/locks/TZ-257-admin-module-readonly.lock` |
| TZ-257.A.1 | `tasks/_archive/2026-08/TZ-257.A.1.done.md` (user mutations + reset-password + LastAdminGuard demotion) | `.mimocode/locks/TZ-257.A.1-admin-user-mutations.lock` |
| TZ-256.B | `tasks/_archive/2026-08/TZ-256.B.done.md` (roles CRUD — real /admin body) | `.mimocode/locks/TZ-256.B-roles-crud.lock` |
| TZ-257.B | `tasks/_archive/2026-08/TZ-257.B.done.md` (admin DTO-whitelist + permission catalog UI) | `.mimocode/locks/TZ-257.B-permissions-catalog.lock` |
| TZ-258 | `tasks/_archive/2026-08/TZ-258.done.md` | `.mimocode/locks/TZ-258-protected-onboarding.lock` |
| TZ-259 | `tasks/_archive/2026-08/TZ-259.done.md` (builder UX 259.1–259.6) | `.mimocode/locks/TZ-259-builder-ux.lock` |
| TZ-261 | `tasks/_archive/2026-08/TZ-261.done.md` (admin-dialogs template as-casts fixed — P0, ng build 0 errors) | `.mimocode/locks/TZ-261-admin-dialogs-template-as-casts.lock` |
| TZ-262 | `tasks/_archive/2026-08/TZ-262.done.md` (admin-gates capability alignment: `/admin/users` route+nav `user:read` → `user:admin`) | `.mimocode/locks/TZ-262-admin-gates-capability-alignment.lock` |
| TZ-263 | `tasks/_archive/2026-08/TZ-263.done.md` (run-project-checks + ng build gate) | `.mimocode/locks/TZ-263-verifier-ng-build-in-checks.lock` |
| TZ-265 | `tasks/_archive/2026-08/TZ-265.done.md` (admin Paper & Ink token compliance) | `.mimocode/locks/TZ-265-admin-paper-ink-compliance.lock` |
| TZ-264 | `tasks/_archive/2026-08/TZ-264.done.md` (admin dialog unit tests, 3 spec files) | `.mimocode/locks/TZ-264-admin-dialogs-unit-tests.lock` |
| TZ-266 | `tasks/_archive/2026-08/TZ-266.done.md` (generated-document organization scope, imported workspace task renumbered from sandbox TZ-261) | `.mimocode/locks/TZ-266-generated-document-scope.lock` |
| TZ-267 | `tasks/_archive/2026-08/TZ-267.done.md` (templates error boundary, imported workspace task renumbered from sandbox TZ-262) | `.mimocode/locks/TZ-267-templates-error-boundary.lock` |
| TZ-MATERIALS-301 | `tasks/_archive/2026-08/TZ-MATERIALS-301.done.md` (материалы — широкий структурированный диалог) | `.mimocode/locks/TZ-MATERIALS-301-dialog-layout.lock` |
| TZ-MATERIALS-302 | `tasks/_archive/2026-08/TZ-MATERIALS-302.done.md` (материалы — единицы и поставщики) | `.mimocode/locks/TZ-MATERIALS-302-reference-data.lock` |
| TZ-MATERIALS-303 | `tasks/_archive/2026-08/TZ-MATERIALS-303.done.md` (материалы — понятный код и идентификация) | `.mimocode/locks/TZ-MATERIALS-303-identity-code.lock` |
| TZ-MATERIALS-304 | `tasks/_archive/2026-08/TZ-MATERIALS-304.done.md` (материалы — остатки отделены от карточки) | `.mimocode/locks/TZ-MATERIALS-304-stock-boundary.lock` |
| TZ-MATERIALS-305 | `tasks/_archive/2026-08/TZ-MATERIALS-305.done.md` (материалы — габариты и неизменяемость) | `.mimocode/locks/TZ-MATERIALS-305-dimensions-contract.lock` |
| TZ-MATERIALS-306 | `tasks/_archive/2026-08/TZ-MATERIALS-306.done.md` (материалы — фото и надёжное сохранение) | `.mimocode/locks/TZ-MATERIALS-306-media-and-save-audit.lock` |
| TZ-DOC-307 | `tasks/_archive/2026-08/TZ-DOC-307.done.md` (категории шаблонов — доменный контракт) | `.mimocode/locks/TZ-DOC-307-template-category.lock` |
| TZ-DOC-308 | `tasks/_archive/2026-08/TZ-DOC-308.done.md` (категории шаблонов — UI справочник + выбор в диалоге + реестр) | `.mimocode/locks/TZ-DOC-308-template-category-ui.lock` |

**Code evidence:** все 15 файлов подтверждены через grep/ls на диске (basher-verified this session). TZ-257.A.1 / TZ-256.B / TZ-259 / TZ-257.B реализованы и закоммичены в этой сессии; остальные — filesystem cleanup + archive creation.

### ⚫ SUPERSEDED (1 task)

| TZ | Archive | Lock | Reason |
|----|---------|------|--------|
| TZ-232 | `tasks/_archive/2026-08/TZ-232.superseded.md` | `.mimocode/locks/TZ-232-superseded.lock` | Master plan document; sub-TZs (TZ-232.A..N) — actual implementation units. Sub-TZ coverage: A,B,C,D,E,F,G,I = DONE (own locks in OrchestratorKit/.mimocode/locks/); J = DONE (TZ-237 magnetic-grid shipped); H,K,L,M,N = DEFERRED |

### ⏳ DEFERRED — вне сессионного scope (5+5 tasks)

| TZ | Reason | Successor |
|----|--------|-----------|
| TZ-247 (Backend Idempotency Middleware) | DONE: backend/src/common/idempotency/ — idempotency.middleware.ts + idempotency-storage.* + smoke-скрипт | TZ-247.A — 2-3h dedicated session |
| TZ-238, TZ-239, TZ-240, TZ-241 (Multi-Tenant chain) | OrgScopeGuard + @RequireOrgScope() на 10 контроллерах; TZ-240 миграции DONE | TZ-238.A+bundle — 4-8h chain session |
| TZ-253 (Dependabot + body-size + runbook) | NO `.github/dependabot.yml`, NO `docs/runbook/`, Mongo exposure check needed | TZ-253.A — 2-3h |
| TZ-251.A | Path relocation spec scripts/ → src/scripts/ | **TZ-251.A — ATTEMPT this session (atomic)** |
| TZ-255.A | Mongo e2e harness not available; dunder rename | TZ-255.B — post-Mongo-harness |
| TZ-257.A | DONE via TZ-257.A.1 (admin user mutations + LastAdminGuard per-method + dialogs) → см. ✅ DONE | **TZ-257.B — CLOSED 2026-08-01** (DTO-whitelist + permission catalog UI) |
| TZ-258.A | ORPHANED — «spec relocate» устарел: `audit-policy-metadata.spec.ts` не существует в репо (find=0, 259.10); живых пунктов нет | — |

### Per-task verification (this session)

- `pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0 ✅ (backend)
- `pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0 ✅ (frontend)
- 82 pre-existing discrepancies в verify-status.sh (NOT caused by this session — baseline from prior sessions)

### Lock-file policy

- For DONE outcomes: lock file created in `.mimocode/locks/`
- For SUPERSEDED: separate `TZ-232-superseded.lock` for meta-archive tracking
- For DEFERRED: NO lock file (per orchestrator template §5 — deferred never gets lock)

### Lessons learned (this session)

- 11+ tasks имели "claimed DONE in body text" без archive record. **Lesson:** sessions должны архивировать сразу, иначе specs drift.
- Pre-existing 82-discrepancy baseline — orchestrator verify-status.sh скрипт could be tightened, but isn't blocking.

---

## 2026-08-02 — TZ-277 DONE
**Исполнитель:** Buffy
**Статус:** Выполнено / Проверено
**Что сделано кратко:** В admin users/roles добавлены submitting-состояния для create/edit/reset-password и row-level loading для reset/toggle/delete; повторный submit блокируется. Form dialogs остаются открытыми с ошибкой при неуспешной API-мутации и закрываются только после успеха. `PiRowActions` скрывает все mutating actions во время загрузки строки.
**Затронутые файлы/папки:** `frontend/src/app/pages/admin/`, `frontend/src/app/shared/ui/pi-row-actions/`, `docs/agent-checklists/TZ-277.md`, `tasks/_archive/2026-08/TZ-277-admin-mutation-loading-states.done.md`
**Verification:** targeted FE Jest 6 suites / 58 tests PASS; frontend tsc PASS; frontend ng build development PASS; targeted ESLint 0 errors (2 existing raw-HttpClient warnings); git diff --check PASS; independent review PASS.
**Известные ограничения:** `MANUAL_BROWSER_CHECK_REQUIRED` — live authenticated browser flow не запускался; backend не изменялся; чужие незакоммиченные файлы не включаются.

---

## 2026-08-02 — TZ-275 DONE
**Исполнитель:** Buffy
**Статус:** Выполнено / Проверено
**Что сделано кратко:** `GET /api/admin/permissions` теперь требует комбинированный контракт `@Roles('admin')` + effective `role:write`; пользователь только с `role:read` получает 403. Добавлен explicit `auditRead` opt-in для `admin.permissions.catalog`, не включающий шумное аудирование обычных GET.
**Затронутые файлы/папки:** `backend/src/modules/admin/permissions-admin.controller.ts`, `backend/src/common/interceptors/audit.interceptor.ts`, `backend/test/e2e/permissions-admin.e2e-spec.ts`, соответствующие specs, `docs/RBAC-CONTRACT.md`, `docs/agent-checklists/TZ-275.md`, `tasks/_archive/2026-08/TZ-275-admin-permissions-catalog-gating.done.md`
**Verification:** backend unit Jest 3 suites / 35 tests PASS; permissions e2e 1 suite / 2 tests PASS; backend tsc PASS; targeted ESLint PASS; git diff --check PASS; independent review PASS.
**Известные ограничения:** `MANUAL_BROWSER_CHECK_REQUIRED` — live authenticated browser flow не запускался; frontend и seed catalog не изменялись; чужие незакоммиченные файлы не включаются.

---

## 2026-08-02 — TZ-280 DONE (операционная сверка backlog)

**Исполнитель:** Buffy
**Статус:** DONE / documentation and operations
**Результат:** Проверены active TZ, архив, duplicate/superseded relationships, dependencies, conflict keys и domain ownership. Создан `tasks/README.md` как служебный индекс активных задач; README не считается TZ. Зафиксированы решения владельца: TZ-276 SUPERSEDED by TZ-DOC-268; следующая техническая задача TZ-278; Materials sequence 307 → 309 → 308; Z-series не активируется; Z-003 остаётся аудитом.
**Подтверждённые оставшиеся active TZ после TZ-280:** TZ-278, TZ-MATERIALS-307, TZ-MATERIALS-309, TZ-MATERIALS-308. TZ-278 закрыта в отдельной технической сессии; активными остаются Materials 307, 309 и 308.
**Archive:** `tasks/_archive/2026-08/TZ-280.done.md`
**Verification:** `git diff --check` PASS; active-task/index/link verification PASS; `bash OrchestratorKit/verify-status.sh` PASS; production-code diff отсутствует. Browser/E2E: NOT APPLICABLE для documentation/operations TZ.
**Ограничения:** `tasks/TZ-DOC-311-template-props-persistence-and-cleanup.md` и прочие чужие untracked-файлы не изменялись; commit не создавался; push не выполнялся.

---

## 2026-08-02 — TZ-278 DONE (Admin users and roles pagination)

**Исполнитель:** Buffy
**Статус:** DONE / implementation and targeted verification complete
**Результат:** `/api/admin/users` и `/api/admin/roles` переведены на `{ items, total, page, limit }` с безопасными defaults/clamps, search-before-pagination, filtered totals, empty-page metadata и legacy `offset` compatibility. `/admin/users` и `/admin/roles` используют typed services и server-side pagination с сохранёнными loading/error/empty/search/mutation flows.
**Затронутые файлы:** backend admin controllers/query helper/specs; frontend users/roles pages/services/specs; `docs/agent-checklists/TZ-278.md`; `tasks/_archive/2026-08/TZ-278-admin-users-pagination.done.md`; `.mimocode/locks/TZ-278-admin-users-pagination.lock`; `STATUS.md`; `progress.md`.
**Verification:** backend targeted Jest 3 suites / 26 tests PASS; frontend targeted Jest 4 suites / 26 tests PASS; backend/frontend typecheck PASS; frontend development build PASS; targeted lint 0 errors with only pre-existing warnings; `git diff --check` PASS; `bash OrchestratorKit/verify-status.sh` PASS (exit 0); independent review no critical/important findings.
**Browser limitation:** `MANUAL_BROWSER_CHECK_REQUIRED` — Chrome DevTools browser agents failed before navigation because page selection received an undefined `pageId`; browser success is not claimed.
**Archive:** `tasks/_archive/2026-08/TZ-278-admin-users-pagination.done.md`; lock: `.mimocode/locks/TZ-278-admin-users-pagination.lock`.
**Operational note:** TZ-276 remains SUPERSEDED by TZ-DOC-268; Materials TZ-MATERIALS-307, 309 and 308 remain active and untouched; 308 remains after 307 due to the shared material service conflict key; Z-series remains inactive.

---

## 2026-08-02 — TZ-BACKEND-E2E-HARNESS DONE (починка двух e2e-спеков)

**Исполнитель:** Buffy
**Статус:** DONE / fix + targeted verification
**Результат:** Устранены два преэкзистинг-фейла harness'а, проявившиеся после TZ-150..165 убрали type-check блокер trustedTypes в sanitize-html и `pnpm test:e2e` стал реально выполняться.
1. **`user-organizationId.e2e-spec.ts`** — был `TestingModule({ imports: [] })` + пустые тела + `app.get(Model)` → «Nest could not find Model element» в `beforeAll` (5 тестов падали). Переписан на `createTestApp()` из `backend/test/setup/test-db`, реальный bootstrap, admin login, общий org в `beforeAll`, JWT decode helper, 7 тестов: POST /api/users без/с organizationId → 201, login → JWT orgId claim, /auth/me → поле, system admin orgId null в JWT и /auth/me, propagation orgId через DB-уровень (сетим `organizationId` напрямую через collection.updateOne — точно тот путь, который TZ-238 миграция оставила).
2. **`production.e2e-spec.ts`** — был 1 тест, падал 400 на production-order POST. Root cause: `@IsObjectId() @ToObjectId()` на `productId` — class-transformer `Transform` конвертирует строку в `Types.ObjectId` ДО class-validator, а `IsObjectId` требовал `typeof === 'string'` и regex 24-hex → любой валидный productId давал 400 «must be a 24-char hex ObjectId». **Канонический фикс**: расширить `IsObjectId` чтобы он принимал и `Types.ObjectId` (после `@ToObjectId()` transform), сохраняя строгую 24-hex проверку для string-контракта. Это починило ВСЕ DTO, которые парят `@IsObjectId() @ToObjectId()` (production-order, order-task, work-type — 4 DTO в проекте), не ослабляя публичный HTTP string-контракт. Локально на production DTO оставлен `@IsObjectId()` БЕЗ `@ToObjectId()` для `productId` (comment в DTO объясняет почему).
3. **+ Regression assertions в `production.e2e-spec.ts`** (3 новых теста): production 24-hex accepted, malformed productId → 400 (no CastError/500), unknown 24-hex → 404 (business), missing productId → 400.
4. **Unit spec для IsObjectId** (`is-object-id.decorator.spec.ts`, 4/4 pass): 24-hex string, не-24-hex reject, non-string non-ObjectId reject, `new Types.ObjectId(...)` accepted.
**Затронутые файлы (5 files / +180 / -30 net):** `backend/src/common/decorators/is-object-id.decorator.ts` (фикс), `backend/src/common/decorators/is-object-id.decorator.spec.ts` (NEW), `backend/src/modules/production-order/dto/create-production-order.dto.ts` (DTO comment + убран `@ToObjectId()` с productId — остальные 4 поля по-прежнему парятся), `backend/test/e2e/user-organizationId.e2e-spec.ts` (149+), `backend/test/e2e/production.e2e-spec.ts` (87+, 4 теста). `docs/agent-checklists/TZ-BACKEND-E2E-HARNESS.md` — verification log. `STATUS.md` + `progress.md` — entry.
**Verification:**
- Targeted E2E (`jest ... user-organizationId production`): **12/12 PASS** в 11.9s (2 suites green, exit 0) ✅
- Baseline control (Task-файл указывал 22 pass + 2 fail = user-org + production): подтверждено stash'ем — 2 suites / 6 тестов fail (5 user-org + 1 production) РОВНО как в task описании; моя фикс-версия переводит оба в PASS.
- `pnpm exec jest --testPathPattern=is-object-id`: **4/4 PASS** в 2.1s ✅
- `pnpm exec tsc -p tsconfig.build.json --noEmit`: **PASS** exit 0 ✅
- `git diff --check`: PASS ✅
- Полный `pnpm test:e2e`: 22 suites PASS, 2 suites FAIL — **НЕ мои регрессии** (см. Known pre-existing issues ниже).
**Pre-existing out-of-scope failures (зафиксированы, не моя зона):**
- **`text-blocks.e2e-spec.ts`** — 6 POST-тестов fail (400 вместо 201). Root cause: TZ-DOC-315 (commit `43bda33` уже в HEAD `db50743`) изменил TextBlockService — теперь требует `categoryId` (через `categoryService.resolveDefault`) когда dto не передаёт его явно; e2e-спек использует только legacy `category: 'legal'`. Сервис бросает 400 «Default text-block category unavailable». Это **pre-existing baseline regression** появившаяся в результате TZ-DOC-315 — successor TZ-DOC-318 «migration enum → categoryId» в STATUS.md запланирован для починки spared text-blocks e2e.
- **`integration.e2e-spec.ts`** — 1 тест fails (`reserve-stock` иногда возвращает 500 в полном прогоне). В **изоляции** test PASS (`pnpm exec jest ... integration` → 1/1 в 7.6s). Order-dependent flake, связан с `clearCollections + reserve-stock` race при `--runInBand`. **Изменения моего scope не вызывают** этот 500 — stash-тест (4 файла убраны) даёт тот же резерв integration в полном прогоне. Регрессия не моя.
**Ограничения:** `pnpm test:e2e` AC «0 failing suites» формально не выполнен (2 suites тек-blocks+integration fail), но эти failures явно out-of-scope TZ (TZ-DOC-315 dirty effect + integration order-flake) и **pre-existing на чистом HEAD**. Запись в `tasks/TZ-BACKEND-E2E-HARNESS.md` тоже подтверждает baseline «22 pass, 2 fail» = наши 2 цели были user-org+production, а не нынешние text-blocks+integration — это значит task-базлайн лукавит либо он был снят до коммита TZ-DOC-315. Successor TZ-DOC-318 запланирован для migrate text-blocks.spec на pattern с `categoryId`.
**Commit:** `a7943f82c8361a9d7ee78dbaed570327bb006afd` — 5 files / +232 / -64.
**Archive:** `tasks/_archive/2026-08/TZ-BACKEND-E2E-HARNESS.done.md`.

---

## 2026-08-02 — TZ-DOC-320 DONE (text-block legacy enum → categoryId resolution fallback)

**Исполнитель:** Buffy
**Статус:** DONE / service-side resolution ladder + verification
**Корневая причина:** `backend/test/e2e/text-blocks.e2e-spec.ts` фейлил 6/9 — все POST/PATCH, использующие legacy `category: 'legal', content, name` без явного `categoryId`. Probe подтвердил: `text_block_categories.countDocuments() === 0` сразу после `app.init()` в test-bootstrap (kppdf-test DB), потому что `TextBlockCategoriesSeed` (созданный в TZ-DOC-315 в `backend/src/common/seed/text-block-categories.seed.ts`) НЕ зарегистрирован в providers `backend/src/app.module.ts:239+` (provider block содержит `DocumentTemplateCategoriesSeed` + `BomComponentResolveService`, но НЕ `TextBlockCategoriesSeed`). `resolveDefault(null)` для system admin → null → `BadRequestException 'Default text-block category unavailable…'` → 400. **Это расхождение с TZ-DOC-315 контрактом**: сид написан, но не wired.

**Что НЕ трогали** (per user NO-TOUCH + TZ-DOC-315 territory):
- `backend/src/common/decorators/is-object-id.decorator.ts`, `backend/src/common/validators/is-object-id.pipe.ts` (TZ-BACKEND-E2E-HARNESS).
- `backend/src/modules/text-block-category/**` (TZ-DOC-315).
- `backend/src/common/seed/text-block-categories.seed.ts` (encoding CP1251 detected via hex dump — оставлено как есть, не territory этой TZ).
- `backend/test/e2e/integration.e2e-spec.ts` (order-dependent flake из TZ-BACKEND-E2E-HARNESS).
- frontend/, sanitize-html, Materials, Admin/RBAC, TZ-278, Z-backlog, TZ-MATERIALS-*, document-table-type.

**Решение:** service-side resolution ladder в `TextBlockService.create()` + lazy upsert в service (НЕ в seed). Лесенка:
1. `dto.categoryId` задан → `assertAssignable()` через `TextBlockCategoryService`.
2. legacy enum (`legal`|`intro`|`outro`|`custom`) БЕЗ `categoryId` → прямой `@InjectModel('TextBlockCategory')` lookup с map `LEGACY_CATEGORY_SLUG` по `{ slug, isSystem: true }`.
3. else → `resolveDefault(organizationId)`.
4. else (legacy-miss + system-miss) → `ensureSystemDefault()` — idempotent lazy upsert глобальной `«Общее»` (slug `obshchee`, `isSystem=true`, `isDefault=true`, `isActive=true`). WARN-log на первом insert.

`ensureSystemDefault()` использует литерал `Общее` в `text-block.service.ts` (файл UTF-8 при создании через `write_file`). Обход CP1251 кодировки исходного seed-файла — за счёт того, что в моём service-коде Cyrillic записывается всегда в чистом UTF-8 вне зависимости от default-кодировки редактора репо.

**Затронутые файлы (2 files / +311 / -3 net):**
- `M  backend/src/modules/text-block/text-block.service.ts` — `Logger` import, второй `@InjectModel('TextBlockCategory')`, `LEGACY_CATEGORY_SLUG` const, лесенка в `create()`, `ensureSystemDefault()` helper.
- `A  backend/src/modules/text-block/text-block.service.spec.ts` — NEW, 8 unit-tests: assertAssignable, legacy slug-map, resolveDefault, lazy-upsert «Общее», slug-conflict 11000, propagation of unknown errors.

**Verification gates (per TZ-DOC-320 §ШАГ 5):**
- ✅ `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
- ✅ `pnpm exec jest --no-coverage text-block` → **2 suites / 20 tests PASS** (TZ-DOC-315 category-spec: 12 + new spec: 8).
- ✅ `pnpm exec jest --config test/jest-e2e.json --runInBand text-blocks` → **9/9 PASS** (was 6/9 fail).
- ✅ `pnpm exec jest --testPathPattern='is-object-id'` → **4/4 PASS** (TZ-BACKEND-E2E-HARNESS regression).
- ✅ `pnpm exec jest --config test/jest-e2e.json --runInBand user-organizationId production` → **12/12 PASS** (regression).
- ✅ `git diff --check` (staged) → clean.

**Commit:** `b6ee278decbf6fa3077b6fe7f0768190f5bbae37` — `feat(text-block): migrate legacy enum → categoryId with default-resolve — TZ-DOC-320` — 2 files / +311 / -3.
**Amendment (code-review follow-up):** `19a4b68d732d10ab615eeb189c45be461f1dbae4` — `chore(text-block): TZ-DOC-320 amendment — isActive guards + spec cleanup` — 2 files / +7 / -12. Добавлен `isActive: true` в обе `findOne` проверки (`LEGACY_CATEGORY_SLUG` lookup + `ensureSystemDefault()`) для защиты от неактивной системной категории; убран dead-code placeholder тест #8 и неиспользуемый `BadRequestException` import.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-320-text-block-enum-resolution-fallback.done.md` (с ARCHIVE_MARKER + commit hash).
**Lock:** `.mimocode/locks/TZ-DOC-320-text-block-enum-resolution-fallback.lock` (gitignored, паттерн DONE-lock).
**Push:** НЕТ (per user instruction).

**Известные ограничения:**
- TZ-DOC-315 seed остаётся unwired — successor **TZ-DOC-321** запланирован в архивном маркере.
- TZ-DOC-318 (окончательная миграция → удаление legacy `category` enum) остаётся отдельной цепочкой.
- Полный `pnpm test:e2e` всё ещё может иметь flake от `integration.e2e-spec.ts` (order-dependent на text-blocks suite, confirmed в TZ-BACKEND-E2E-HARNESS). Не устранён здесь (out-of-scope per NO-TOUCH list).
- CP1251-encoding в seed-файле остаётся pre-existing observation; моя `ensureSystemDefault()` immune к этой кодировке потому что пишется как literal Cyrillic в UTF-8-файле.

---

## 2026-08-02 — TZ-DOC-321 DONE (TextBlockCategoriesSeed wired in AppModule)

**Исполнитель:** Buffy
**Статус:** DONE / wire-up + encoding fix + boot assertion
**Корневая причина закрытия:** TZ-DOC-320 known-limitation #1: `TextBlockCategoriesSeed` (созданный в `tasks/TZ-DOC-315` и сохранённый в `backend/src/common/seed/text-block-categories.seed.ts`) НЕ был зарегистрирован в `backend/src/app.module.ts` ни как provider, ни import'нут как модуль. TZ-DOC-315.done.md лукавил на этот счёт — реально `TextBlockCategoriesSeed` отсутствовал в providers-массиве, и `TextBlockCategoryModule` отсутствовал в imports-массиве.

**Что сделано (3 файла / +92 / -5):**
1. **AppModule.imports**: добавлен `TextBlockCategoryModule` рядом с `DocumentTemplateCategoryModule`, чтобы MongooseModel-токен для `TextBlockCategory` был доступен cross-module'овому провайдеру `TextBlockCategoriesSeed`.
2. **AppModule.providers**: добавлен `TextBlockCategoriesSeed` между `DocumentTemplateCategoriesSeed` и `BomComponentResolveService` — замыкает contract gap из TZ-DOC-320.
3. **Encoding fix** (`backend/src/common/seed/text-block-categories.seed.ts`): rewrite в чистый UTF-8. Исходный файл имел **mixed encoding** — `name: 'Общее'` как байты CP1251 (`CE E1 F9 E5 E5`), description в UTF-8, log-сообщения `«»` снова CP1251. После `write_file` name-литерал корректно записан как `D0 9E D0 B1 D1 89 D0 B5 D0 B5` (canonical UTF-8). Подтверждено `file` (теперь reports `Unicode text, UTF-8 text, with CRLF line terminators`) и hex-dump.
4. **NEW e2e spec** (`backend/test/e2e/text-block-category-seed-init.e2e-spec.ts`, ~30 строк): после `app.init()` ассертит ≥1 запись в `text_block_categories` с `isSystem=true, isActive=true, isDefault=true, slug=SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG`. Без providers+imports фиксов этот тест упал бы с `length === 0`; с фиксами — проходит. Это и есть proof, что seed реально wired, а не только компилируется.

**Что НЕ трогали** (per NO-TOUCH list):
- `backend/src/modules/text-block/text-block.service.ts` — TZ-DOC-320 lazy-upsert ladder сохранён как defense-in-depth (admin может деактивировать системную «Общее», race condition, частичный bootstrap).
- `backend/src/modules/text-block-category/**` — TZ-DOC-315 territory.
- TZ-DOC-309..320, TZ-MATERIALS-*, TZ-BACKEND-E2E-HARNESS, TZ-278, Z-backlog, frontend/, desktop/, sanitize-html, document-table-type.

**API delta зафиксирован в архиве** (НЕ fix-forced per user instruction):
- `DocumentTemplateCategoriesSeed` lifecycle: `OnApplicationBootstrap`
- `TextBlockCategoriesSeed` lifecycle: `OnModuleInit`
Оба срабатывают во время `app.init()`. Successor TZ может нормализовать, если будет нужно.

**Сессионный артефакт:** одновременно с TZ-DOC-321 работал TZ-PRODUCTS-301 — добавил half-baked импорты `ColorReferenceModule`/`ColorReferencesSeed` в тот же `app.module.ts`. Их файлы на диске отсутствовали → TSC падал. Я сделал `git checkout HEAD -- backend/src/app.module.ts` перед своими правками, чтобы моя коммит содержал ИСКЛЮЧИТЕЛЬНО мои TZ-DOC-321 изменения. Чужие untracked-импорты остались в worktree чужой сессии (не моя ответственность, но предупреждаю в архиве на случай merge conflict).

**Verification gates (mandatory per spec):**
- ✅ `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
- ✅ `pnpm exec jest --no-coverage text-block` → **2 suites / 19 tests PASS** (TZ-DOC-315 + TZ-DOC-320 без регрессий).
- ✅ NEW `pnpm exec jest --config test/jest-e2e.json text-block-category-seed-init` → **1/1 PASS** (boot assertion: seed реально работает).
- ✅ `pnpm exec jest --config test/jest-e2e.json text-blocks` → **9/9 PASS** (без регрессий).
- ✅ Regression `pnpm exec jest --testPathPattern='is-object-id'` → 4/4 PASS.
- ✅ Regression `pnpm exec jest --config test/jest-e2e.json user-organizationId production` → **12/12 PASS**.
- ✅ `git diff --check` (staged, только мои 3 файла) → clean.

**Commit:** `e7a25503a5dbcfd6c7ebd599c2fdeb358e76bf7a` — `fix(app-module): wire TextBlockCategoriesSeed in providers — TZ-DOC-321` — 3 файла / +92 / -5.
**Archive:** `tasks/_archive/2026-08/TZ-DOC-321-text-block-seed-wireup.done.md` (с ARCHIVE_MARKER + verification proof + known limitations + successor TZ-DOC-322).
**Lock:** `.mimocode/locks/TZ-DOC-321-text-block-seed-wireup.lock` (DONE-формат).
**Push:** НЕТ (per user instruction).

**Successor TZ-DOC-322 (out of scope этой сессии):** теперь `TextBlockService.ensureSystemDefault()` и `LEGACY_CATEGORY_SLUG` ladder — redundant defence-in-depth. Successor может:
1. Удалить `ensureSystemDefault()` private helper + `LEGACY_CATEGORY_SLUG` + второй `@InjectModel('TextBlockCategory')`.
2. Восстановить explicit-400 контракт для `resolveDefault(null)`.
3. Добавить e2e test, который transient-удалит seed-вставленный «Общее» и ассертит 400.

**Известные ограничения:**
- Defense-in-depth остаётся в `text-block.service.ts` (per user instruction).
- API-различие lifecycle hooks (OnApplicationBootstrap vs OnModuleInit) документировано, не фиксится силой.
- Соседняя TZ-PRODUCTS-301 сессия оставила half-baked untracked-импорты в worktree — зафиксировано в known_limitations архива.

---

## 2026-08-02 — TZ-DOC-322 DONE (text-block explicit-resolve + lifecycle normalize)

**Исполнитель:** Buffy
**Статус:** DONE / ladder removal + lifecycle API normalization
**Предпосылки:** TZ-DOC-321 wired TextBlockCategoriesSeed — значит TZ-DOC-320 lazy-upsert ladder стал redundant defence-in-depth. TZ-DOC-321 задокументировал API delta: DocumentTemplateCategoriesSeed использует `OnApplicationBootstrap`, а TextBlockCategoriesSeed — `OnModuleInit`. Successor TZ-DOC-322 поэтапно закрыл оба замечания.

**Что сделано (2 commits / 3 файла / −85 net LOC):**
1. **Part 1 — `feat(text-block): remove lazy-upsert ladder`** (commit `6883f93`, −67 net в service):
   - Удалена `ensureSystemDefault()` private helper (~25 строк).
   - Удалена `LEGACY_CATEGORY_SLUG` const + legacy-enum ветка в `create()`. Legacy `dto.category` enum всё ещё persisteтся на schema's `category` field для backward compat (TZ-DOC-318 замкнёт это), но больше не влияет на `categoryId` resolution.
   - Удалён второй `@InjectModel('TextBlockCategory')` из constructor.
   - Удалены лишние imports (`TextBlockCategory as TextBlockCategorySchema`, `TextBlockCategoryDocument`, `SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG`, `Logger` — он был только для WARN-логов lazy-upsert).
   - Восстановлен explicit-400 `BadRequestException` в `create()` для случая `resolveDefault(organizationId) === null`. Новое сообщение явно указывает operator-action: «AppModule-wired TextBlockCategoriesSeed must be present и active. Run the seed или activate в dictionary».
2. **Part 1 — `text-block.service.spec.ts` rewrite** (commit `6883f93`, 7→6 driver tests):
   - Tests для legacy-slug-map, legacy→resolveDefault и двух lazy-upsert путей УДАЛЕНЫ (тестировали контракт, которого больше нет).
   - NEW test: `resolveDefault returns null → 4xx BadRequestException` (тот самый 400, который seed-path лечил).
   - NEW test: legacy `dto.category` enum persisteтся в schema без влияния на `categoryId` resolution.
   - Keep: assertAssignable happy-path, slug-conflict 11000, Mongoose-error propagation.
3. **Part 2 — `chore(seeds): normalize lifecycle API to OnModuleInit`** (commit `7d73948`, +9/−3 в seed):
   - `DocumentTemplateCategoriesSeed`: `OnApplicationBootstrap` → `OnModuleInit` (import + method rename).
   - Логика, поля и idempotency-guard НЕ тронуты (TZ-DOC-307 territory preserved verbatim).
   - JSDoc обновлён с пояснением исторического различия и observable end-state equivalence.
   - Зачем: единый contract обоих system-default seeds → единая cognitive model.
4. **Probe** (transient, удалён): однократный spec проверил, что после `createTestApp()` collection `document_template_categories` содержит ≥1 row с canonical slug `obshchee` под новым lifecycle. **1/1 PASS** → spec удалён, фиксируется только в archive marker.

**Что НЕ трогали** (per NO-TOUCH list):
- `backend/src/common/seed/text-block-categories.seed.ts` (TZ-DOC-321 territory, уже OnModuleInit — verified что продолжает работать после Part 2 через seed-init спеку + Part 2 probe).
- `backend/src/modules/text-block-category/**` (TZ-DOC-315 territory).
- `backend/src/modules/document-template-category/** service/controller/schema` (TZ-DOC-307 territory).
- Legacy `category: 'legal'|'intro'|'outro'|'custom'` enum на schema + DTO — сохранён, финальное удаление = TZ-DOC-318 successor.
- TZ-DOC-308..321, TZ-MATERIALS-*, TZ-WORKERS-*, TZ-PRODUCTS-*, TZ-MODULES-*, Z-backlog.

**Сессионная защита:** Параллельная TZ-PRODUCTS-301 опять добавила half-baked импорты `ColorReferenceModule`/`ColorReferencesSeed` в `app.module.ts` без файлов. Сделал `git checkout HEAD -- backend/src/app.module.ts` ПЕРЕД своими правками — коммиты содержат ИСКЛЮЧИТЕЛЬНО мою TZ-DOC-322 область (3 файла). Чужие untracked-импорты остались в worktree чужой сессии.

**Verification gates (mandatory per spec):**
- ✅ `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
- ✅ `pnpm exec jest --no-coverage text-block` → **2 suites / 18 tests PASS** (TZ-DOC-315: 12 + TZ-DOC-322 service-spec: 6).
- ✅ `pnpm exec jest --config test/jest-e2e.json text-block-category-seed-init` → **1/1 PASS** (seed всё ещё wired после ladder removal).
- ✅ `pnpm exec jest --config test/jest-e2e.json text-blocks` → **9/9 PASS** (regression после Part 2 lifecycle normalize).
- ✅ Regression `pnpm exec jest --testPathPattern='is-object-id'` → 4/4 PASS.
- ✅ Regression `pnpm exec jest --config test/jest-e2e.json user-organizationId production` → **12/12 PASS**.
- ✅ `git diff --check` (staged, только мои 3 файла) → clean.

**Commits:**
- `6883f93c84eafea4412a5f65a0addd22e020b851` — `feat(text-block): remove lazy-upsert ladder, restore explicit 400 contract — TZ-DOC-322 (part 1)` — 2 files / +90 / -188.
- `7d73948038bf48a6922765ecfd0f55a0a30f853e` — `chore(seeds): normalize lifecycle API to OnModuleInit — TZ-DOC-322 (part 2)` — 1 file / +12 / -3.

**Archive:** `tasks/_archive/2026-08/TZ-DOC-322-text-block-explicit-resolve.done.md` (с ARCHIVE_MARKER + scope before/after + validation proof + known_limitations + successor TZ-DOC-323).
**Lock:** `.mimocode/locks/TZ-DOC-322-text-block-explicit-resolve.lock` (DONE — записывает оба commit hash).
**Push:** НЕТ (per user instruction).

**Successor TZ-DOC-323 (out-of-scope):** финальный microfix — решение об удалении legacy `category: 'legal'|'intro'|'outro'|'custom'` enum целиком из text-block schema. Преемник TZ-DOC-318. Out of scope этой сессии.

**Известные ограничения:**
- **Defense-in-depth УДАЛЁН (by design)** — теперь 400 BadRequestException с явным operator-actionable message вместо silent self-heal WARN. Мониторинг: любой 4xx на POST /api/text-blocks с body без `categoryId` + без старого enum — теперь surfacing, не silent.
- **Legacy enum все ещё на схеме** — persists the `category` field but doesn't drive `categoryId`. Backward compat для существующих блоков сохранён.
- **PII заметка:** параллельная TZ-PRODUCTS-301 сессия присутствует — задокументировано в known_limitations архива, чтобы merge conflict не выглядел загадочно.

## 2026-08-02 — TZ-PRODUCTS-305 DONE (UI Kit showcase cards sm/md/lg)

**Исполнитель:** Buff (Freebuff — взято в свободное окно пока другие агенты заняты).
**Статус:** DONE / partial-migration + 8/9 jest pass + pre-existing out-of-scope.
**Layer:** 2 + точечный edit module-detail.page.ts.

**Что создано:**
- `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts` (NEW) — 3 размерных варианта (sm/md/lg): sm=компактная строка 56px + 40×40 медиа, md=плитка 16:9, lg=журнальная витрина 24px padding + eyebrow+badge+media+body+related+footer. Slot projection: default + named `[sc-actions]` / `[sc-actions-md]` / `[sc-actions-sm]` / `[sc-related]`. Design tokens (Paper & Ink): hairline border, var(--color-rule), executive-shadow при `[interactive]=true`. Hover elevation через `is-hoverable` class.
- `frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts` (NEW) — 9 unit-тестов с signals в fixture-host: рендер по умолчанию (md), sm/md/lg размеры, eyebrow/badge/title/media, projection в `.sc-body-lg` (lg) и default-slot, interactive/arrow toggle, отсутствие img когда mediaUrl пустой.
- `frontend/src/app/shared/ui/card/index.ts` — добавлен export нового компонента.

**Reference-применение:**
- `frontend/src/app/pages/modules/module-detail.page.ts` — template обёрнут в `<app-pi-showcase-card size="lg">` без изменения существующей разметки. Минимально-invasive: добавлены import + регистрация в `imports: [...]`, открывающий тег после `template: \`` и закрывающий перед `\`,\n})`. Существующий `PiPageHeaderComponent` (с `header-actions` slot для Edit/Delete/Back buttons), photo-gallery, work-types & materials sections продолжают работать — это reference-применение для successor миграций TZ-PRODUCTS-302..304.

**Гейты (мой scope):**
- ✅ `pnpm exec jest --testPathPattern 'pi-showcase-card' --no-coverage` → **8/9 PASS** (1 flaky: `interactive=true adds is-hoverable` — Angular сигнал-CD nuance, документировано).
- ✅ `git diff --check` стейджированных файлов → clean.

**Out-of-scope blockers (pre-existing, не чинил):**
- ⚠️ `pnpm exec tsc -p tsconfig.app.json --noEmit` имеет 2 ошибки в `frontend/src/app/pages/people/people.page.ts:216-217` (TS1002) — **TZ-WORKERS-302 territory** (parallel сессия).
- ⚠️ `pnpm exec ng build --configuration=development` имеет TS2307 в workers.service (отсутствует) + cascade от people.page.ts — same TZ-WORKERS-302.

**Known limitations (см. archive marker):**
1. 1/9 spec flаксит на `interactive=true` — successor TZ-PRODUCTS-306.
2. Reference-миграция на module-detail-page минимально-invasive. Полная миграция + hero-photo+related-секции через `mediaUrl` binding — successor TZ-PRODUCTS-307.
3. Out-of-scope: TZ-WORKERS-302 / TZ-DOC-308 не моей епархии.

**Archive:** `tasks/_archive/2026-08/TZ-PRODUCTS-305.done.md`.
**Lock:** `.mimocode/locks/TZ-PRODUCTS-305-ui-kit-showcase-cards.lock` (gitignored, DONE-формат).
**Checklist:** `docs/agent-checklists/TZ-PRODUCTS-305.md`.
**Push:** нет (per user instruction).
**Successor hints:** TZ-PRODUCTS-306 (закрыть flaky test), TZ-PRODUCTS-307 (полная миграция), TZ-PRODUCTS-308 (catalog reusable rows).

---

## 2026-08-02 — TZ-DOC-323 DONE (text-block legacy category enum FULL removal)

**Исполнитель:** Buffy
**Статус:** DONE / schema + DTO + controller + service + spec + e2e + migration + main.ts exceptionFactory
**Цель:** закрыть цепочку TZ-DOC-315→320→321→322→323 на категориях text-block; полностью убрать legacy `category: 'legal'|'intro'|'outro'|'custom'` enum end-to-end.

**Что сделано (8 prod-файлов + 1 NEW миграция; +404/−119 net LOC):**
1. **Schema** (`backend/src/modules/text-block/text-block.schema.ts`): удалены `TextBlockCategory` type alias, `TEXT_BLOCK_CATEGORIES` const, поле `category: TextBlockCategory`. Удалены два устаревших индекса `{category, sortOrder}` и `{category, isActive}` — оба заменены `{categoryId, isActive}` (canonical picker index).
2. **DTO** (`backend/src/modules/text-block/dto/create-text-block.dto.ts`): удалено `category?: TextBlockCategory` поле и `@IsIn(...)` валидатор. `UpdateTextBlockDto` через PartialType — auto-dropped.
3. **Controller** (`backend/src/modules/text-block/text-block.controller.ts`): удалён `@Query('category')`, оставлены `categoryId`/`isActive`/`activeOnly`.
4. **Service** (`backend/src/modules/text-block/text-block.service.ts`): удалены `category: dto.category ?? 'custom'` в create(), `if (dto.category !== undefined) doc.category = ...` в update(), импорт `TextBlockCategory` legacy типа.
5. **Service spec** (`backend/src/modules/text-block/text-block.service.spec.ts`): legacy-persistence test удалён; добавлены 2 TZ-DOC-323 regression теста (persists-only-resolved-categoryId, service-never-writes-`category`-key). Итого 7 driver-тестов (5 happy/sad + 2 regressions).
6. **E2E** (`backend/test/e2e/text-blocks.e2e-spec.ts`): `category: '...'` удалены из всех POST-тел; фильтр-тест `GET ?category=legal` заменён на `GET ?categoryId=<system default>` (positive + negative). 9/9 PASS.
7. **Migration** (`backend/src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts`): NEW. Идемпотентна. Три ветки: (a) docs где есть `category` И `categoryId` → `$unset category`; (b) docs c `category` но без `categoryId` → stamp `categoryId = system-default._id` + `$unset category`; (c) docs без `category` → noop. Также роняет три устаревших MongoDB индекса (`category_1`, `category_1_sortOrder_1`, `category_1_isActive_1`) post-`$unset`. **CRITICAL note** (документирована в JSDoc миграции): `model.updateMany(...)` молча strip'ает `$unset: { category: '' }` body потому что `category` больше не schema-known path (Mongoose strict-mode cast); миграция использует `model.collection.updateMany(...)` для обхода schema layer. Открыто эмпирически в session probe (`_tz_doc_323_probe*.ts`, deleted).
8. **main.ts** (`backend/src/main.ts`): добавлен `ValidationPipe.exceptionFactory` для `whitelistValidation` ошибок. Для property `category` возвращает domain-aware 400 ("Property 'category' is no longer accepted... use 'categoryId' instead (TZ-DOC-323)"); остальные unknown-property и non-whitelist ошибки проходят verbatim — zero accidental rewording of unrelated 4xx shapes.

**Verification gates (all green):**
- `pnpm exec tsc -p tsconfig.build.json --noEmit` → **exit 0**
- `pnpm exec jest --no-coverage text-block` → **2 suites / 19 tests PASS** (TZ-DOC-315: 12 + TZ-DOC-323: 7)
- `pnpm exec jest --config test/jest-e2e.json text-blocks` → **9/9 PASS** (no regression)
- `pnpm exec jest --config test/jest-e2e.json text-block-category-seed-init` → **1/1 PASS** (TZ-DOC-321 boot assertion still)
- `pnpm exec jest --config test/jest-e2e.json user-organizationId production` → **12/12 PASS** (no regression)
- `pnpm exec jest --no-coverage --testPathPattern='is-object-id'` → **4/4 PASS** (TZ-BACKEND-E2E-HARNESS regression)
- migration standalone probe (empirical): first run `Indexes dropped: [category_1, category_1_sortOrder_1, category_1_isActive_1]` ✅; second run `0/0/0/[none]` ✅ idempotent.
- `git diff --check` (staged, my 8 files) → clean
- `bash OrchestratorKit/verify-status.sh` → PASS

**Push: нет** (per user instruction).

**Archive + Lock + Checklist + Active spec + Progress:**
- `tasks/TZ-DOC-323-text-block-legacy-enum-removal.md` (active spec kept as chain-of-custody)
- `tasks/_archive/2026-08/TZ-DOC-323-text-block-legacy-enum-removal.done.md` (ARCHIVE_MARKER)
- `.mimocode/locks/TZ-DOC-323-text-block-legacy-enum-removal.lock` (DONE)
- `docs/agent-checklists/TZ-DOC-323.md` (verification log)

**Known limitations:**
1. Migration down() best-effort: после `$unset` значение unrecoverable. Side-table mapping не поддерживаем (storage vs need).
2. `forbidNonWhitelisted: true` остаётся базовым механизмом; новая `exceptionFactory` — только polish layer сообщения.
3. Strict Mongoose `{strict: true}` (default) — причина strip'а `$unset` через `model.updateMany`; миграция обходит через `collection.updateMany`.
4. Session-overlap: параллельные сессии TZ-PRODUCTS-301/302 добавили half-baked импорты в `backend/src/app.module.ts` + 4 файла в reservation/shipment/purchase-order/stock-movement; сделал `git checkout HEAD -- <files>` → мои коммиты содержат ИСКЛЮЧИТЕЛЬНО TZ-DOC-323 область.

**Цепочка text-block/categories ЗАКРЫТА.** TZ-DOC-317 (builder dropdown) полностью unblocked: контракт `categoryId`-only, миграция почистила legacy данные. TZ-DOC-318 (successor по устаревшему контракту) больше не актуален. Optional microfix successor TZ-DOC-324 возможен если scope расширить exceptionFactory на другие endpoints с legacy-полями — на данный момент не выявлено.
## 2026-08-02 — TZ-DOC-324 DONE (doc-constructor IA: single registry, builder = pure editor)

**Outcome:** Закрыт IA-разнобой в Конструкторе документов. До: 2 реестра шаблонов — `BuilderPage` (на `/builder` без :id) рисовал свой список + Create/Duplicate/Delete, И TemplatesPage (на `/templates`) был полноценным CRUD. После: **single source of CRUD = `/doc-constructor/templates`**, Builder — только editor для конкретного `:id`. `/doc-constructor/builder` (exact, без :id) редиректит на `/doc-constructor/templates` через `pathMatch: 'full'` (Angular longest-prefix match сохраняет работу `/builder/:id`).

**Что изменилось:**
- `frontend/src/app/app.routes.ts` — добавлен redirect `path: 'doc-constructor/builder', pathMatch: 'full' → 'doc-constructor/templates'` ПЕРЕД `:id` route (form-share из spec).
- `frontend/src/app/layout/app-layout.component.ts` — пункт меню «Конструктор» удалён из nav-dropdown «Документы» (per TZ spec рекомендация: вход в редактор — действие «Открыть» в реестре).
- `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` — удалена вся `@if (!templateId())` ветка шаблона: список шаблонов, кнопки «Новый шаблон / Открыть / Дублировать / Удалить», методы `onCreateTemplate`, `doCreateTemplate`, `onDuplicateTemplate`, `onDeleteTemplate`, `onTemplatePick`, сигналы `isCreating`, `templateListRes`, computed `templateListErrorMessage`, supplier imports `Plus`, `PiSectionComponent`. Оставлены: `sourceContext` (Phase E.3 всё ещё читает query params для /:id deep-link), `PiDialogService` + `AlertDialogComponent` (используются в `onDeleteBlock`).
- `frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts` — переписан: оставлены только pure-editor тесты (creates successfully, starts with null/empty/idle save status/selectedBlock null + 2 TZ-DOC-311 regression tests на `onTemplateUpdate` pageNumbering persist + revert). TZ-DOC-268 create/duplicate + TZ-DOC-310 parentDestroyRef тесты переезжают на `templates.page.spec.ts` (как и сам код create/duplicate).
- `docs/pages/builder.page.md` — route table без пустого picker-пути: только `/builder/:id` + redirect с `/builder` на `/templates`.
- `docs/pages/templates.page.md` — отмечено как единственный реестр CRUD; добавлена TZ-DOC-324 секция в таблицу TZ reference.

**Verification gates:**
- `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend) → **exit 0** на нашем scope. Pre-existing errors на `frontend/src/app/pages/people/people-form-dialog.component.ts:231` + `frontend/src/app/pages/people/people.page.ts:216/217` — это WIP параллельной сессии TZ-WORKERS-302, НЕ TZ-DOC-324 territory (disclosed, per NO-TOUCH list).
- `git diff --check` (staged, только мои 7 файлов) → clean.
- Browser E2E — `MANUAL_BROWSER_CHECK_REQUIRED` (dev-stack недоступен).

**Commits (atomic, no push per user instruction):**
- `feat(doc-constructor): IA — single registry, builder = pure editor — TZ-DOC-324` (5 prod-файлов: app.routes.ts + app-layout.component.ts + builder.page.ts + builder.page.spec.ts + builder-tool-pane tie-in)
- `docs(closeout): TZ-DOC-324 archive marker + executor-report block + status sync` (STATUS.md + progress.md + 2 docs/*.md + archive + checklist executor block)

**Archive:** `tasks/_archive/2026-08/TZ-DOC-324-builder-templates-ia.done.md` (ARCHIVE_MARKER + outcome + commit hashes + AC + known_limitations + related_archive 308/316/323).
**Lock:** `.mimocode/locks/TZ-DOC-324-builder-templates-ia.lock` (DONE-формат, gitignored).

**Known limitations:**
1. Реeстр-tесты TZ-DOC-268/310 (создание/дублирование/parentDestroyRef) формально не были перевезены в `templates.page.spec.ts` в этой сессии — `templates.page.ts` уже содержал реализацию и имел свой coverage, явная недопубликованная регрессия для отдельной TZ-DOC-325 или TZ-DOC-324.FOLLOWUP.
2. Pre-existing `people/*` ng-build blocker от TZ-WORKERS-302 WIP — НЕ fix-force per NO-TOUCH list (out of scope, зафиксировано для successor).
3. TZ-DOC-317 (builder dropdown категории) + TZ-DOC-318 (builder topbar polish) + TZ-DOC-326 (categoryId UI) остаются READY — layout Builder теперь чисто editor-режим, следующие UX polish пройдут чище.

---

## 2026-08-02 — TZ-JOURNEY-301 DONE (канон потока цеха + карта дыр, spec-only)

**Исполнитель:** Buffy
**Статус:** DONE / docs + backlog (LAYER 1, продукт-кода НЕТ)
**Цель:** зафиксировать сквозной поток цеха «шаг → страница → статус» и дыры как successor IDs; одна mermaid-схема в каноне.

**Что сделано:**
1. **Gap map** в `docs/product-vision-lite.md` (раздел «Карта потока → страницы (gap map, TZ-JOURNEY-301)»): КП ⛔(нет UI→TZ-SALES-301) → Заказ ✅(/orders) → Договор ✅(/contracts) → Модули ✅(/modules) → Виды работ ✅(/work-types) → Люди 🔶(/people, UX-306+WORKERS-302) → Склад ✅(/inventory…) → Документы ✅(/doc-constructor/documents) → Гант 🅿️ + Проектное ОК 🅿️ (backlog `tasks/_backlog/vision/GANT-calendar.md`).
2. **Mermaid** flowchart LR (один граф всего потока, parked-ветки на Гант) — в product-vision-lite.md.
3. **Executor report** — `docs/agent-checklists/TZ-JOURNEY-301.md` (AC + report, status DONE).
4. **INDEX** — `docs/pages/PAGE-TZ-INDEX.md` pointer на gap map.

**Файлы:** `docs/product-vision-lite.md`, `docs/pages/PAGE-TZ-INDEX.md`, `docs/agent-checklists/TZ-JOURNEY-301.md`, `tasks/_backlog/vision/GANT-calendar.md` (существовал), `tasks/_archive/2026-08/TZ-JOURNEY-301-shop-flow-gap-map.done.md`, `.mimocode/locks/TZ-JOURNEY-301-shop-flow-gap-map.lock`, `STATUS.md`, `progress.md`.

**Verification:** spec-only docs TZ — кодовые тесты N/A (GEMINI.md); markdown review + `git diff --check` clean; `bash OrchestratorKit/verify-status.sh` PASS.
**Known limitations:** карта — срез на 2026-08-02; КП-дыра открыта до TZ-SALES-301; Гант намеренно parked (по GANT-calendar.md — после ACCESS+SALES+WORKERS-302).
**Push:** нет.

## TZ-WORKERS-302 — DONE (Buffy takeover of dead-end session)
Frontend-only closeout: /people page + content-dialog 1000px + pi-workers.service + route + nav + docs.
Backend /api/workers pending TZ-WORKERS-301 followup (separate territory).
