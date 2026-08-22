# PRE-DEPLOY — 2026-08-19 (стол + Desktop), refreshed 2026-08-22 (TZ-DEPLOY-303)

> Заполнять только по evidence. Пустая галочка = не проверено.
> Warm deploy (`WIPE=false`). Wipe запрещён.
> **Деплой в этой TZ не выполнялся** — только обновление чек-листа под текущий `origin/main`.
> Катить только по явному слову PO («задеплой» / «кати» / «выкати»), см. `docs/GIT-POLICY.md`.

updated_at: 2026-08-22T19:26:00+03:00
deploy_sha_target: 832eeab66f25e1cefa080f8a5a4fa99be896a3c3
previous_target (2026-08-19, stale): ba98a4a5

## A. Git / гигиена

- [x] `_active/` пуст, кроме этой TZ (`TZ-DEPLOY-303.md`, снимается при archive) — Freebuff волна B (TZ-UI-412…417) landed и запушена во время сборки этой таблицы, `_active/` пере-проверен непосредственно перед archive
- [x] `main` == `origin/main` (`832eeab66f25e1cefa080f8a5a4fa99be896a3c3`), диапазон `git rev-list --left-right --count origin/main...main` → `0 0`
- [x] Нет secrets в staged (индекс пуст на момент проверки; `git ls-files` — нет `.env`/`.pem`/`id_rsa` кроме `.env.example`)
- [x] Не staged: `data/paspots/`, `data/products/`, exe/zip (индекс пуст; installer-артефакты лежат untracked в `desktop/src-tauri/target/**` и `frontend/downloads/**`, не в git)
- [x] Docs/TZ волны на момент таблицы закоммичены и запушены на `origin/main`

## B. Код волны на origin (с `ba98a4a5`, 69 коммитов)

Не полный changelog — темы, которые меняют поведение прод-инстанса:

- **Desktop AI-чат (TZD-57→65, весь трек DONE):** установщик 0.5.6 integrity (57/58),
  compat failsafe (59), встроенный чат вкладки AI одним кликом (62) с
  автосканом любых `.gguf` в папке моделей + скачивание без ритуала
  Start→Download→Restart (63), kppdf-глоссарий в системном промпте (64),
  карточка «Модель по API» (OpenAI-совместимый шлюз, TokenRouter-пресет,
  фикс двойного `/v1`) (65). TZD-60 (живой GUI-инсталл) — **DEFERRED**, не
  блокирует веб-деплой.
- **Стол/заказы:** `/desk` — подтверждённое удаление заказа (DESK-418),
  группировка очереди по заказчику (DESK-422); импорт заказов из Excel →
  mutation-journal (TZD-ORDER-IMPORT-01); организация-исполнитель на заказе
  (ORDERS-307); контактное лицо контрагента (PARTY-305).
- **Снабжение:** быстрый заказ MVP → guided-раскрытие блоков → PiDialog/token
  conformance (SUPPLY-304…315), smoke `supply-smoke.mjs` 23/23 на момент 315.
  Legacy PurchaseRequest/PurchaseOrder закрыт как read-only + MCP (SUPPLY-313).
- **Каталог/UI:** breadcrumb-унификация + TOC-парити (UI-403…407),
  micro-type 10/9px → 11px по всем спискам/диалогам/каталогу (UI-408…412,
  415…417, вся волна DONE), фикс краша `/dictionaries/form-profiles`
  (CRASH-401, отсутствующий Lucide-провайдер), KP PDF preview wrap (SALES-381).
- **Backend/данные:** soft-delete покрытие 53 схем + regression-тест
  (CORE-302); `.gitattributes` + renormalize (OPS-317); backup rotation +
  cron docs (OPS-318); pre-push typecheck hook (OPS-319).
- **Тесты:** 8 pre-existing FE Jest падений исправлены (TEST-420) —
  полный FE suite **1841/1841** на коммите `ede2444d` (тот же день, до этой
  таблицы; сегодня прогонялся только focused-срез, см. §C).
- **Ops-канон:** GitHub Actions/dependabot удалены — GitHub = только
  хранилище, проверки только локальные (см. `docs/GIT-POLICY.md`).

Prod по-прежнему на старом SHA (см. `_NOW.md` `hygiene`) — веб-деплой ещё не
выполнялся ни для PO wave 2026-08-19 (`ba98a4a5`), ни для чего-либо из
списка выше.

## C. Gates (свежий прогон, 2026-08-22, `deploy_sha_target`)

- [x] FE `tsc -p tsconfig.app.json --noEmit` — **exit 0** (перепрогнан дважды: на `08ae164e` и затем на финальном `832eeab6`, после того как волна B UI-412…417 доехала и запушилась во время сборки таблицы)
- [x] BE `tsc -p tsconfig.build.json --noEmit` — **exit 0** (на `69e7dad5`; backend волной B не тронут, до и после неё идентичен)
- [x] Desktop `tsc --noEmit` — **exit 0** (на `69e7dad5`; desktop волной B не тронут)
- [x] FE focused jest — **74/74 PASS**: `manager-desk.page`, `orders.page`,
      `orders-rail.component`, `orders.service`, `order-form-panel.component`,
      `order-hub-tray.component`
- [x] BE focused jest — **88/88 PASS**: `desk-note.service`, `order.service`
- [x] Desktop `tsx --test` — **11/11 PASS**: `core/ai/chat-url.test.ts`,
      `core/ai/snippet-parse.test.ts`
- known_limitation: полный FE jest suite (1841 тестов) сегодня не
  перепрогонялся заново (>15 мин) — доказательство зелёного full-suite:
  коммит `ede2444d` (TZ-TEST-420) тем же днём, до этой таблицы. Полный BE
  jest suite (958/960, 2 pre-existing) и `pnpm architecture:check` тоже не
  перепрогонялись в этой TZ (layer-4 docs-refresh, не полный pre-deploy
  прогон) — если PO скажет «кати», прогнать перед деплоем.

## D. Installer Desktop

- exe: `KPPDF Desktop_0.5.6_x64-setup.exe`, **42 138 073 B**, собран
  2026-08-22 17:35 (локальное время)
- zip: `frontend/downloads/kppdf-desktop-setup-v0.5.6.zip` /
  `kppdf-desktop-setup.zip`, **42 131 752 B**, 2026-08-22 17:36
- PE/`package.json`/`tauri.conf.json` версия — **0.5.6**, совпадает
- ⚠️ **STALE относительно `deploy_sha_target`**: артефакт собран в 17:35–17:36,
  а весь Desktop AI-чат (TZD-62→65, коммиты с `3ee42820` в 20:47 и позже)
  landing **после** сборки — установленное приложение из этого ZIP/EXE
  **не содержит** «Открыть чат», any-`.gguf` скан и карточку «Модель по API».
  Нужен свежий `pnpm tauri build` (+ `bundle-ai-runner.mjs`) и publish в
  `frontend/downloads/` **при кати**, если PO хочет отдавать актуальный чат;
  не собирать заново «заодно» без явной причины (сборка ~100 МБ дерева).

## E. Reviews (рой)

- Review swarm в этой TZ **не запускался** — layer-4 docs-only refresh, не
  code-review волна. Последний известный review-статус — из PRE-DEPLOY
  2026-08-19 (Bugbot/Security/Defect PASS на `ba98a4a5`); с тех пор 69
  коммитов без отдельного роя ревью. Если PO скажет «кати» — прогнать
  `/code-review` (хотя бы `high`) на диапазоне `ba98a4a5..832eeab6` перед
  реальным деплоем, отдельно от этой TZ.

## F. Deploy (только если A–E PASS) — **НЕ ВЫПОЛНЯЛСЯ**

> Эта TZ (TZ-DEPLOY-303) — только обновление чек-листа. Ничего ниже не
> запускалось: не `deploy.ps1`, не `deploy.py`, не SSH на Synology, не wipe.

- [ ] Preflight OK, SSH `192.168.1.103` reachable (VPN off)
- [ ] `.\deploy\synology\deploy.ps1` (WIPE=false) — target `832eeab66f25e1cefa080f8a5a4fa99be896a3c3`
- [ ] Блок `=== Deploy complete ===`
- [ ] Auth login OK
- [ ] Frontend HTTP 200
- [ ] `/api/health/ready` ok (200)
- [ ] `/downloads/kppdf-desktop-setup-v0.5.6.zip` свежий (см. §D — пересобрать перед кати)
- [ ] `/desk` не 404 (после login)

## G. После деплоя (PO / агент)

- [ ] `/orders`: PATCH номера сохраняется после reload
- [ ] `/orders`: DELETE — строка исчезает из списка
- [ ] `/counterparties`: пагинация «Показано X–Y из Z»
- [ ] `/desk`: фильтр статуса по умолчанию «Все», persist после F5, удаление заказа (DESK-418)
- [ ] `/desk`: очередь сгруппирована по заказчику (DESK-422)
- [ ] Вкладка AI Desktop: «Открыть чат» + карточка «Модель по API» (после переустановки со свежим ZIP — см. §D)
- [ ] `DESK-SMOKE.md` на проде (хотя бы очередь + expand + create)
- [ ] `DESKTOP-SMOKE.md` install с прод-кнопки **или** локального ZIP (свежего, см. §D)
- [ ] `_NOW.md`: SHA prod + warm deploy OK

## STOP (не деплоить)

- P0 от review (см. §E — рой не прогонялся, перед реальным кати прогнать)
- Gates FAIL
- Installer PE ≠ 0.5.6 (сейчас 0.5.6, но контент устарел — см. §D, не жёсткий STOP для веб-деплоя, но пересобрать перед выдачей ссылки)
- `git status` с неотправленным product-кодом волны (на момент таблицы — main == origin/main, `_active/` пуст кроме этой TZ)
- VPN on (SSH на VM не дойдёт)
- `tasks/_active/` содержит чужой IN WORK на конфликтующих файлах (на момент таблицы — нет; перепроверить `ls tasks/_active/` прямо перед реальным «кати», репозиторий общий с параллельными агентами)

## Shutdown

Только после F PASS: выключить ПК по явной просьбе PO.
