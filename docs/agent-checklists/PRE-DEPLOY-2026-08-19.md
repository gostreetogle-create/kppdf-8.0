# PRE-DEPLOY — 2026-08-19 (стол + Desktop)

> Заполнять только по evidence. Пустая галочка = не проверено.  
> Warm deploy (`WIPE=false`). Wipe запрещён.

updated_at: 2026-08-19T18:45:00+03:00
deploy_sha_target: ba98a4a5

## A. Git / гигиена

- [x] `_active/` пуст
- [x] OPS-310 archive + evidence
- [x] `main` == `origin/main` после push (`ba98a4a5`)
- [ ] Нет secrets в staged
- [ ] Не staged: `data/paspots/`, `data/products/`, exe/zip
- [ ] Docs/TZ волны закоммичены и запушены

## B. Код волны (уже на origin)

- [x] Desk 10/10: 406, 402, 412, 403, 413, 410, 411, 407, 404, 408
- [x] Desktop: TZD-57, 49, 58
- [x] OPS-310 archive существует
- [x] PO wave 2026-08-19: **PARTY-304** `e41dec0d`, **DESK-417** `cda4417b`, **ORDERS-308** `ba98a4a5`

## C. Gates (свежий прогон)

- [x] FE `tsc -p tsconfig.app.json --noEmit` — exit 0
- [x] FE jest focused — **58/58** (manager-desk 20, order-hub-tray+orders 19, pairing, order-form-panel)
- [x] BE `tsc -p tsconfig.build.json --noEmit` — exit 0
- [x] BE jest `desk-note` — **10/10** (`pnpm exec jest`, TZ-DESK-415)
- [x] BE jest `order.service.spec` — **78/78** (TZ-ORDERS-308)
- [x] Desktop `tsc --noEmit` — exit 0
- [x] Review swarm: P1/P2 hotfixes 414–416 on main; нет открытого P0

## D. Installer Desktop

- [x] PE FileVersion = `0.5.6`
- [x] exe 45339307 B (18.08 22:12) — не stale 2.9 MB
- [x] ZIP 45333966 B рядом

## E. Reviews (рой)

- [x] Bugbot — **2 high** fixed in TZ-DESK-414 `54299be8` (RouterLink, stale notes, chip activeId)
- [x] Security — desk-note IDOR TZ-DESK-415 `1306424c`; deploy.py stale exe **FAIL** (uncommitted → this push)
- [x] Defect — 414 `54299be8`; tray from=desk 416 (this push)

## F. Deploy (только если A–E PASS)

> Предыдущий warm deploy: `404832c8` (KP 380+377). Ниже — **новый** deploy для PO wave.

- [ ] Preflight OK, SSH `192.168.1.103` reachable (VPN off)
- [ ] `.\deploy\synology\deploy.ps1` (WIPE=false) — target `ba98a4a5`
- [ ] Блок `=== Deploy complete ===`
- [ ] Auth login OK
- [ ] Frontend HTTP 200
- [ ] `/api/health/ready` ok (200)
- [ ] `/downloads/kppdf-desktop-setup-v0.5.6.zip` свежий
- [ ] `/desk` не 404 (после login)

## G. После деплоя (PO / агент)

- [ ] `/orders`: PATCH номера сохраняется после reload
- [ ] `/orders`: DELETE — строка исчезает из списка
- [ ] `/counterparties`: пагинация «Показано X–Y из Z»
- [ ] `/desk`: фильтр статуса по умолчанию «Все», persist после F5
- [ ] `DESK-SMOKE.md` на проде (хотя бы очередь + expand + create)
- [ ] `DESKTOP-SMOKE.md` install с прод-кнопки **или** локального ZIP
- [ ] `_NOW.md`: SHA prod + warm deploy OK

## STOP (не деплоить)

- P0 от review
- Gates FAIL
- Installer PE ≠ 0.5.6
- `git status` с неотправленным product-кодом волны
- VPN on (SSH на VM не дойдёт)

## Shutdown

Только после F PASS: выключить ПК по явной просьбе PO.
