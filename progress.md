
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
