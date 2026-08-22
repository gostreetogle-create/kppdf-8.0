# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-22T21:45:00+03:00
hygiene: origin `ba98a4a5`; PO wave **304+417+308** on main; prod still on older SHA — **warm deploy pending**

## ПРАВИЛО (PO 2026-08-21): GitHub = только хранилище

Никаких GitHub Actions и dependabot — `.github/` удалён, не возвращать.
Проверки только локальные: pre-commit гейт + smoke-скрипты. Канон:
`docs/GIT-POLICY.md`; политика деплоя: `deploy/synology/README.md`.

## ACTIVE

**TZD-62** — DONE by `claude` (2026-08-22), SHA `3ee42820`: Desktop вкладка AI — «Открыть чат» (`data-test="ai-open-chat"`) один клик, если `.gguf` выбранной модели уже на диске (старт/рестарт раннера этим файлом, ждёт `modelLoaded`, фокус чата); новый `ChatPanel.svelte` (disabled + причина, пока раннер/модель не готовы); минимальный LIMITED_HELPER промпт `desktop/ai/system-prompts/desktop-chat.md` + `buildDesktopChatSystemPrompt()`; `ai-runner/index.ts` теперь грузит модель сразу после старта (не лениво на первый чат-запрос); блок «Это не чат» удалён (снимает TZD-61); архив `tasks/_archive/2026-08/TZD-62-desktop-ai-chat.done.md`; gates PASS (desktop tsc, svelte-check 0/0, targeted tsx --test 11/11 + regression 6/6); живой desktop smoke — PO/dev; deploy НЕ. Next: TZD-63 (любой .gguf в папке + скачать без ручного Start/Restart).
**TZ-UI-407** — DONE by `claude` (2026-08-22): catalog filter flyouts on products/modules/materials close on Escape, use `role="region"`, and labels use 11px; archive `tasks/_archive/2026-08/TZ-UI-407.done.md`; SHA `7a5d813b`; gates FE tsc/lint PASS; deploy НЕ.
**TZ-UI-408** — DONE by `claude` (2026-08-23): six admin dialog field labels use `var(--font-mono)` and 11px; archive `tasks/_archive/2026-08/TZ-UI-408.done.md`; SHA `546daf65`; gates FE tsc/lint + scoped static AC PASS; deploy НЕ.
**TZ-SALES-381** — DONE by `claude` (2026-08-22): backend preview rows now use conservative weighted wrap capacity for productName+description; archive `tasks/_archive/2026-08/TZ-SALES-381.done.md`; SHA `4ee24fec`; gates backend tsc, continuation Jest 3/3 PASS; deploy НЕ.
**TZ-DESK-418** — DONE by `claude` (2026-08-22): `/desk` delete action uses shared `AlertDialogComponent` + `OrdersService.remove`, stops row toggle, reloads list and clears expansion; archive `tasks/_archive/2026-08/TZ-DESK-418.done.md`; SHA `5a56c942`; gates FE tsc, focused Jest 25/25, lint PASS; deploy НЕ.
**TZ-OPS-320** — DONE by `claude` (2026-08-22): spent TZ/PROMPT moved from `tasks/` root to `tasks/_archive/2026-08/specs-dup-root/` and `prompts-spent/`; deploy НЕ.
**TZ-CORE-302** — DONE by `claude` (2026-08-22T21:15:00+03:00): soft-delete coverage — 53 schemas resolved (17 softDelete:false + 36 deletedAt + 1 subdoc skipped); regression test `soft-delete-coverage.spec.ts` added; archive `tasks/_archive/2026-08/TZ-CORE-302.done.md`; gates PASS (backend tsc, regression test 1/1, jest 958/960 pre-existing, lint 47 pre-existing).
**TZ-OPS-318** — DONE by `freebuff` (2026-08-22T19:11:51+03:00): backup.sh rotation + cron docs + volume-survives-deploy docs; commit `12178c2c`; archive `tasks/_archive/2026-08/TZ-OPS-318.done.md`; gates: bash -n PASS, supply-gate 50/50.
**TZ-OPS-319** — DONE by `freebuff` (2026-08-22T19:11:51+03:00): .husky/pre-push typecheck hook + GIT-POLICY --no-verify doc; commit `13810896`; archive `tasks/_archive/2026-08/TZ-OPS-319.done.md`; gates: bash -n PASS, pre-push hook live-tested during push (tsc both PASS).
**TZ-OPS-318** — DONE by `claude` (2026-08-22T21:25:00+03:00): backup rotation + cron string + volume docs; archive `tasks/_archive/2026-08/TZ-OPS-318.done.md`; gates PASS (bash -n).
**TZ-OPS-319** — DONE by `claude` (2026-08-22T21:30:00+03:00): `.husky/pre-push` typecheck hook + GIT-POLICY.md --no-verify note; archive `tasks/_archive/2026-08/TZ-OPS-319.done.md`; gates PASS (hook runs, both tsc OK).
**TZ-OPS-317** — DONE by `claude` (2026-08-22T21:40:00+03:00): `.gitattributes` + renormalize; archive `tasks/_archive/2026-08/TZ-OPS-317.done.md`; gates PASS (architecture check, backend tsc).
**TZD-60** — DEFERRED (2026-08-22T20:05:00+03:00): no real install possible in this session.
AUDIT (read-only): data-model refresh — Freebuff, 2026-08-22T08:36:56+03:00 — DONE
AUDIT (read-only): UI consistency — Freebuff, 2026-08-22T08:44:13+03:00 — DONE
**TZ-STRAT-01A** — DONE by `claude` (2026-08-22T11:05:00+03:00): PO/Cursor review PASS relayed; re-gate перед closeout (tsc + focused Jest 66/66) без расхождений; archive `tasks/_archive/2026-08/TZ-STRAT-01A.done.md`; deploy НЕ.
**TZ-SUPPLY-315** — DONE by `claude` (2026-08-22T10:20:00+03:00), commit `df4cd1fd` pushed: PiDialogService/app-pi-overflow-select/token conformance; archive `tasks/_archive/2026-08/TZ-SUPPLY-315.done.md`; target gates PASS (FE tsc, jest 28/28, lint, supply-smoke 23/23); browser pass PASS (Puppeteer 5/5 dialogs + catalogs, light/dark); unscoped FE Jest has 8 unrelated failures; deploy НЕ.
**TZ-SUPPLY-314** — DONE by `freebuff` (2026-08-22T10:52:01+03:00): гид-режим раскрытия блоков (whereExpanded/detailsExpanded), auto-expand по categoryId+materialId, gates PASS (tsc, jest 28/28, lint, smoke 23/23); archive `tasks/_archive/2026-08/TZ-SUPPLY-314.done.md`.
**TZ-DESK-419** — DONE by `claude` (2026-08-22T11:07:00+03:00); commits `2c6f840a` + `bdbbbc87`; archive `tasks/_archive/2026-08/TZ-DESK-419.done.md`; CSS queue height `calc(100dvh - 9.5rem)`; gates/browser PASS.
**TZ-DESK-421** — DONE by `claude` (2026-08-22T11:20:00+03:00); commit `d2f3e6a3`; docs-only audit `docs/audits/2026-08-22-desk-order-tray-execution-panel-audit.md`; archive `tasks/_archive/2026-08/TZ-DESK-421.done.md`; successor `TZ-DESK-422`.
**TZ-DESK-422** — DONE by `freebuff` (2026-08-22T14:06:42+03:00): группировка очереди по заказчику (groupedOrders computed, разделители с названием), gates PASS (tsc, jest 24/24, lint 0); archive `tasks/_archive/2026-08/TZ-DESK-422.done.md`.
**TZ-STRAT-01B** — DONE by `freebuff` (2026-08-22T16:53:50+03:00): конфликт раскладок разрешён — вариант A (`shared/orders/`) уже закоммичен как `9edadf5a`; gates PASS (architecture, tsc, jest 53/53, lint 0); archive `tasks/_archive/2026-08/TZ-STRAT-01B.done.md`.
**TZ-DESK-420** — DONE by `claude` (2026-08-22T11:36:00+03:00); commit `5975d443`; archive `tasks/_archive/2026-08/TZ-DESK-420.done.md`; label cleanup + shipping duplicate removal; gates/browser PASS.
**TZ-UI-344** — DONE by `claude` (2026-08-22T11:58:00+03:00); archive `tasks/_archive/2026-08/TZ-UI-344.done.md`; shared lightbox + product/module catalog/detail wiring; focused Jest 90/90, shared dialog 23/23, FE tsc/lint/Prettier, architecture PASS; live browser BLOCKED by missing helper/auth session.
**TZD-ORDER-IMPORT-01** — DONE by `claude` / closeout `freebuff` (2026-08-22T11:41:42+03:00); archive `tasks/_archive/2026-08/TZD-ORDER-IMPORT-01.done.md`; Order.source desktop-import + mutation-journal kinds (order.create/counterparty.create/site.create) + row-level proposalId + kppdf_import_task_finalize_order + MCP tools; gates PASS (backend tsc, jest 958/960, desktop 122/122, architecture).
**TZ-UI-403** — DONE by `claude` (2026-08-22T12:35:00+03:00); commit `cf42b1c4`; archive `tasks/_archive/2026-08/TZ-UI-403.done.md`; docs-only audit `docs/audits/2026-08-22-breadcrumb-consistency-audit.md`; duplicate `data-test="back-button"` on module/product/material-detail, kit-only `app-pi-breadcrumb` vs used `page-chrome[crumbs]`, inconsistent crumb depth, builder/:id has no crumbs (UNCERTAIN); 4 open questions, successor `TZ-UI-404`.
**tasks/ cleanup** — DONE by `freebuff` (2026-08-22T12:45:00+03:00): удалены фантомные черновики уже archived TZ из корня tasks/ (SUPPLY-304/305/306/307/308/311/312 git rm; SUPPLY-314/UI-401/UI-402 untracked rm).
**TZ-UI-405** — DONE by `claude` (2026-08-22T14:15:00+03:00); commit `647d21e1` after archive: detail-страницы — 2-уровневые крошки + один back (B-01..B-04 PO-решения из TZ); archive `tasks/_archive/2026-08/TZ-UI-405.done.md`; gates PASS (FE tsc, jest 23/23, eslint 0); browser primary env-BLOCKED (FE :4200 чужой контур упал, BE auth работает); deploy НЕ.
**TZ-UI-404** — DONE by `claude` (2026-08-22T13:35:00+03:00); commit `6f6b1362`; archive `tasks/_archive/2026-08/TZ-UI-404.done.md`; Клиенты/Каталог/Снабжение/Цех (10 маршрутов) переведены `[chips]`→`[toc]` по канону contracts/proposal-create; gates PASS (FE tsc, jest 420/424, lint, architecture); browser primary PASS (CDP smoke, `reports/TZ-UI-404-toc-parity-smoke.json`); deploy НЕ.
**TZ-UI-406** — DONE by `claude` (2026-08-22T14:45:00+03:00); commit `790e2fff`; archive `tasks/_archive/2026-08/TZ-UI-406.done.md`; Проект (`/design`+`/design/combine`) — два разных nav shell унифицированы под `[toc]`; gates PASS (tsc, jest 29/29, eslint); browser primary PASS (CDP smoke); deploy НЕ.
**TZ-CRASH-401** — DONE by `claude` (2026-08-22T15:20:00+03:00); commit `cd5241a4`; archive `tasks/_archive/2026-08/TZ-CRASH-401.done.md`; новый `scripts/full-route-crash-sweep.mjs` (CDP 50 routes) нашёл реальный краш `/dictionaries/form-profiles`; fix: `app.config.ts` `LucideAngularModule.pick({Check,Minus,ArrowUpRight})`; sweep 1/50→0/50; gates PASS (tsc, jest 60/60, eslint); deploy НЕ.
**TZD-59** — DONE by `claude-computer` (2026-08-22T19:10:00+03:00); commit `7bb76150` **pushed** (мой `git push` упал — schannel SEC_E_NO_CREDENTIALS, профиль `C:\Users\User` недоступен в этой сессии; коммит ушёл на origin вместе с push соседнего агента `a929ba38`); archive `tasks/_archive/2026-08/TZD-59.done.md`; литерал `v?` убран, `compatStatus` + объясняющий текст при ошибке `/desktop/compat`; gates PASS (FE tsc, jest focused 14/14 вкл. 3 новых, eslint 0; full FE suite 1832/1840 — 8 падений pre-existing в login.page.spec/production-read.facade.spec, вне scope); jest/eslint прогнаны в Linux-срезе (на Windows-хосте `spawn EPERM` на любой бинарь); pre-commit hook не смог запуститься (env.exe Win32 error 5) — гейты прогнаны вручную; deploy НЕ.

**TZD-61** — DONE by `claude-computer` (2026-08-22T19:50:00+03:00); commit `f1a2790d` **local, push blocked** (schannel SEC_E_NO_CREDENTIALS — нет git-креденшелов в сессии, main ahead 2: `94d3a47c` + `f1a2790d`, нужен push от PO/соседнего агента); archive `tasks/_archive/2026-08/TZD-61.done.md`; copy/docs-only: на вкладке «AI» добавлена строка `data-test="ai-not-a-chat"` («это не чат, модель подсказывает сопоставление колонок»), `INSTALL.md` получил раздел «С чего начать» (4 шага со ссылками на PAIRING/MCP/AI-PROVIDERS) и синхронизированные подписи вкладок вместо «вкладка «MCP»»; MCP/PAIRING/AI-PROVIDERS перелинкованы; findings: премисса TZ неточна — MCP host UI («MCP для агентов») живёт на вкладке «AI» (`App.svelte:2255`), а не на «Подключение», поэтому в доке зафиксирована фактическая раскладка; переименование вкладки в коде вне scope (ШАГ 4, тесты `tab-connection`); gates PASS (tsc exit 0 на Windows-хосте и в Linux-срезе, svelte-check 0 errors/0 warnings в Linux-срезе; на Windows-хосте svelte-check падает окруженчески — `spawn EPERM` в esbuild); deploy НЕ.

**TZD-60** — DEFERRED by `claude-computer` (2026-08-22T20:05:00+03:00); archive `tasks/_archive/2026-08/TZD-60.deferred.md` (lock НЕ создавался); причина: ШАГ 1 TZ (дословная фиксация диалогов живой установки на чистой машине) невыполним — доступ к Windows-хосту только неинтерактивный PowerShell без экрана и без ввода в GUI, а в silent (`/S`) диалоги NSIS подавляются; ШАГ 1 к тому же требует деинсталляции на рабочей машине PO (разрушающее действие, в этой волне разрешён только push). Артефакт для теста готов — `bundle/nsis/KPPDF Desktop_0.5.6_x64-setup.exe` (42 МБ, 2026-08-22 17:35). Правки `hooks.nsh`/`tauri.conf.json` по гипотезе сознательно НЕ внесены (нулевой диф). Нужно от PO: дословный текст окон установки (вариант A) либо явное разрешение на install/uninstall с частичным логом (вариант B) — детали в `docs/agent-checklists/TZD-60.md`. deploy НЕ.

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

**Desktop AI-чат** — TZD-62 DONE; 63→64 затем **TZD-65** API (`tasks/PROMPT-DESKTOP-AI-API-2026-08-22.md`). Не `App.svelte` параллельно. Deploy не.

**Freebuff wave 2026-08-22 READY** — промпт `tasks/PROMPT-FREEBUFF-WAVE-2026-08-22.md`
(OPS-320 → DESK-418 → SALES-381 → UI-407 → UI-408). Deploy не.

Backlog (не брать без PO):
- `tasks/_backlog/TZ-COMP-402-lock-password-login-wan.md` — блокировка парольного входа из WAN (требует deploy)
- `tasks/_backlog/TZ-ORDERS-307` — организация-исполнитель заказа (in-progress by other agent)

SUPPLY-304/305 — DONE (транзитивно закрыты: 304 archived 2026-08-19, 305→311→312→313→314→315 DONE; smoke 23/23).
TZ-SUPPLY-312 — READY_FOR_ACCEPTANCE: все gates/smoke PASS, остался только браузерный проход PO после deploy. Не блокирует новые TZ.

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
