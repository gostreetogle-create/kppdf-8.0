# TZ-DEPLOY-303 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-DEPLOY-303.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T19:12:49Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `PRE-DEPLOY-2026-08-19.md`/`_NOW.md` (только TZ-UI-415/416/417 → потом TZ-UI-412, Angular Freebuff волна B, не конфликтует)
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DEPLOY-303.md` на месте

## Acceptance

- [x] PRE-DEPLOY `deploy_sha_target` = актуальный `origin/main` (40 hex: `832eeab66f25e1cefa080f8a5a4fa99be896a3c3`)
- [x] §C заполнен сегодняшними гейтами (PASS + явные known_limitation по не-перепрогнанным полным suite)
- [x] В отчёте фраза: деплой **не** выполнялся
- [x] `_active` этой TZ снят

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only (ops checklist, не product code)
- [x] FIC §A–E: N/A — docs-only
- [x] page.md / PAGE-TZ-INDEX: N/A (не UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только PRE-DEPLOY + _NOW + этот checklist + archive, не `git add -A`)
- [x] Coupling map: N/A
- [x] `deploy.ps1`/`deploy.py` логика НЕ тронута; `App.svelte`/Angular НЕ тронуты; SSH/wipe/deploy НЕ запускались

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit                    → exit 0 (перепрогнан на финальном target SHA)
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit                  → exit 0
cd desktop  && npx tsc --noEmit                                               → exit 0

FE focused jest (manager-desk.page, orders.page, orders-rail.component,
orders.service, order-form-panel.component, order-hub-tray.component)        → 74/74 PASS

BE focused jest (desk-note.service, order.service)                            → 88/88 PASS

Desktop tsx --test (core/ai/chat-url.test.ts, core/ai/snippet-parse.test.ts)  → 11/11 PASS
```

known_limitation: полный FE jest (1841 тестов) и полный BE jest (958/960) не
перепрогонялись заново в этой TZ (>15 мин, layer-4 docs refresh) —
доказательство зелёного full FE suite взято из коммита `ede2444d` (TZ-TEST-420,
тот же день, до этой таблицы). `pnpm architecture:check` тоже не
перепрогонялся. Всё это зафиксировано как known_limitation в самом
PRE-DEPLOY §C — прогнать перед реальным «кати».

## Executor report

- `docs/agent-checklists/PRE-DEPLOY-2026-08-19.md` переписан целиком под
  `deploy_sha_target = 832eeab66f25e1cefa080f8a5a4fa99be896a3c3` (финальный
  `origin/main` на момент таблицы). Freebuff волна B (UI-412…417) landing
  дважды во время работы над этой TZ — target SHA и §C пересчитаны на месте
  дважды (`08ae164e` → `832eeab6`), FE tsc перепрогнан на обоих, чтобы не
  фиксировать таблицу на устаревшем коммите.
- §A: `main == origin/main` подтверждено (`git rev-list --left-right --count`
  → `0 0`), staged индекс пуст (secrets/exe/zip не заstage), `_active/`
  перепроверен непосредственно перед archive — пуст, кроме этой TZ (Freebuff
  волна B полностью landed и запушена к этому моменту).
- §B: сжатая сводка 69 коммитов с `ba98a4a5` по темам (Desktop AI 57→65,
  стол/заказы, снабжение, каталог/UI, backend hygiene, TEST-420, ops-канон
  GitHub=хранилище) — не построчный changelog.
- §C: живые гейты сегодня (tsc ×3, focused jest FE 74/74 + BE 88/88, desktop
  unit 11/11); known_limitation про непрогнанные полные suite явно записан,
  не скрыт.
- §D: найден существующий installer 0.5.6 (exe 42 138 073 B, zip
  42 131 752 B, собран 2026-08-22 17:35–17:36) — сверил timestamp с первым
  коммитом TZD-62 (`3ee42820`, 20:47) и явно пометил артефакт **STALE**:
  установленное приложение из этого ZIP не содержит Desktop AI-чат/API-карту.
  Не пересобирал (TZ явно запретил собирать «заодно» без нужды).
- §E: честно зафиксировал, что review-рой в этой TZ не запускался (не
  выдумал несуществующий PASS).
- §F: все чекбоксы деплоя оставлены пустыми; явная фраза «деплой не
  выполнялся» в шапке файла и в этом отчёте; `deploy.ps1`/`deploy.py` не
  вызывались, SSH на Synology не открывался, wipe не запускался.
- `_NOW.md`: одна строка в `QUEUE` (по ШАГ4 TZ) + полная запись в `ACTIVE`
  (по конвенции остальных TZ этой сессии) — обе явно называют target SHA и
  «кати только по слову PO».
- Conflict disclosure: рабочее дерево параллельно менялось Freebuff волной B
  (TZ-UI-415/416/417, затем TZ-UI-412 — все закоммитились и запушились во
  время работы над этой TZ, до archive) — их файлы не стейджились, только
  прочитаны/наблюдались через `git log`/`git status`. Остальной большой объём
  чужого несвязанного uncommitted WIP (backend `*.schema.ts` и др.) — не
  тронут, не застейджен.

## Review handoff

- [x] READY FOR REVIEW — N/A, ops docs-only TZ без review-wave

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
