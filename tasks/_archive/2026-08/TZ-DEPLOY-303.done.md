# TZ-DEPLOY-303: Свежий PRE-DEPLOY под текущий main (без кати)

PAGES: N/A
PAGE_DOCS: N/A
РОЛЬ АГЕНТА: Ops / release engineer
ЗАВИСИМОСТИ: TZD-65 DONE. Freebuff волна B (UI-412…417) шла параллельно —
не ждал, но фиксировал в §A/§B, если ещё IN WORK на момент таблицы.
LAYER: 4 (docs + local gates; не product Angular/desktop UI)
CONFLICT KEYS: docs/agent-checklists/PRE-DEPLOY-2026-08-19.md; docs/agent-checklists/_NOW.md; docs/agent-checklists/TZ-DEPLOY-303.md

Проверено: `PRE-DEPLOY-2026-08-19.md` target был всё ещё `ba98a4a5` (19 августа).
На `main` уже стол, каталог, Desktop 62–65, TEST-420. Prod отстаёт. Канон:
warm `WIPE=false`. PO ещё не сказал «кати».

## ИСХОДНОЕ

Чеклист деплоя устарел. Катить по старому SHA нельзя. Нужна таблица «можно ли
катить HEAD» с живыми гейтами.

## ЧТО СДЕЛАНО

- `git fetch origin && git rev-parse origin/main` — записан полный SHA в
  `PRE-DEPLOY-2026-08-19.md` как `deploy_sha_target`. Не `git add -A`; чужой
  dirty WIP (`backend/**/*.schema.ts` и пр.) не тронут. Repo — общая рабочая
  копия с параллельными Freebuff-агентами: target SHA пересчитывался дважды
  прямо во время работы (`ba98a4a5` → `08ae164e` → финальный
  `832eeab66f25e1cefa080f8a5a4fa99be896a3c3`), когда волна B (UI-415…417,
  затем UI-412) landing и пушилась; FE tsc перепрогнан на каждом новом
  финальном SHA, чтобы таблица не фиксировала устаревший коммит.
- §C: `frontend`/`backend`/`desktop` `tsc --noEmit` — все exit 0; focused jest
  desk+orders (FE 74/74, BE 88/88) + desktop `chat-url`/`snippet-parse`
  (11/11). Полный FE/BE jest suite и `pnpm architecture:check` НЕ
  перепрогонялись заново (>15 мин, layer-4 docs-refresh) — known_limitation
  явно записан, с ссылкой на последний известный зелёный full-suite
  (`ede2444d`, TZ-TEST-420, тот же день).
- §A: `_active/` пуст, кроме этой TZ (Freebuff волна B полностью landed на
  момент archive), `main == origin/main` (`git rev-list --left-right --count`
  → `0 0`), staged-индекс пуст (secrets/exe/zip не заstage).
- §D: найден существующий installer 0.5.6 (exe 42 138 073 B, zip
  42 131 752 B, собран 2026-08-22 17:35–17:36) — сверен с первым коммитом
  TZD-62 (`3ee42820`, 20:47) и помечен **STALE**: не содержит Desktop
  AI-чат/API-карту. Не пересобирался — TZ прямо запретил собирать «заодно»
  без нужды; нужен `pnpm tauri build` + publish при реальном «кати».
- §E: честно зафиксировано, что review-рой в этой TZ не запускался (docs-only
  refresh, не code-review волна) — не выдуман несуществующий PASS.
- §F: все чекбоксы деплоя оставлены пустыми; `deploy.ps1`/`deploy.py` не
  вызывались, SSH на Synology не открывался, wipe не запускался.
- `_NOW.md`: одна строка в `QUEUE` (по ШАГ4 TZ, target SHA + «кати только по
  слову PO») + полная запись в `ACTIVE` по конвенции остальных TZ этой сессии.

## Acceptance (из TZ)

- [x] PRE-DEPLOY `deploy_sha_target` = актуальный `origin/main` (40 hex: `832eeab66f25e1cefa080f8a5a4fa99be896a3c3`)
- [x] §C заполнен сегодняшними гейтами (PASS + явные known_limitation по не-перепрогнанным полным suite)
- [x] В отчёте фраза: деплой **не** выполнялся
- [x] `_active` этой TZ снят

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit                    → exit 0 (на финальном target SHA)
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit                  → exit 0
cd desktop  && npx tsc --noEmit                                               → exit 0

FE focused jest (manager-desk.page, orders.page, orders-rail.component,
orders.service, order-form-panel.component, order-hub-tray.component)        → 74/74 PASS

BE focused jest (desk-note.service, order.service)                            → 88/88 PASS

Desktop tsx --test (core/ai/chat-url.test.ts, core/ai/snippet-parse.test.ts)  → 11/11 PASS
```

## known_limitation

- live §F (SSH/VPN) — только после «кати» (не проверялось: SSH на Synology не
  открывался в этой TZ).
- TZD-60 GUI-установка — PO.
- COMP-402 — после кати.
- Полный FE jest (1841) и полный BE jest (958/960) не перепрогонялись заново
  в этой TZ; `pnpm architecture:check` тоже. Прогнать перед реальным «кати».
- Installer 0.5.6 (exe/zip в `frontend/downloads/`) собран **до** Desktop
  AI-чата (TZD-62→65) — republish нужен перед выдачей свежей ссылки.
- Review-рой (`/code-review`) не прогонялся на диапазоне `ba98a4a5..832eeab6`.

**Деплой в этой TZ не выполнялся.**

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: f2a720f6
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend/backend/desktop, все exit 0)
  - tests: PASS (focused: FE 74/74, BE 88/88, desktop 11/11; full-suite known_limitation зафиксирован)
  - lint: N/A (не запрашивался в TZ; docs-only refresh)
  - checklist: ADDED (`docs/agent-checklists/TZ-DEPLOY-303.md`)
  - progress.md: N/A (ops-трек использует `_NOW.md`, не root progress.md)
  - status synchronization: PASS (`_NOW.md`, `PRE-DEPLOY-2026-08-19.md`)
