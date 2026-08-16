# TZD-53 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZD-53.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/TZD-53-desktop-excel-form-write-permission.md`
> **Не archive / не lock** до Cursor Verdict PASS.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor (cursor-subagent)
- claimed_at: 2026-08-16T19:28:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (main)
- [x] `_NOW.md` + `tasks/_active/` — нет чужого live CLAIM на `capabilities/default.json` / `App.svelte` / Desktop version bump
- [x] TZD-50/51/52 markers absent from `_active` (archived DONE) — no conflict
- [x] Claim slot заполнен; Status = CLAIMED
- [x] `tasks/_active/TZD-53.md` на месте

## Acceptance (из TZ)

- [x] `fs:allow-write-file` в default capabilities
- [x] Скачать форму без pairing → файл на диске по выбранному пути (полный путь в formMessage)
- [x] При ошибке — видимый RU `formMessage` с причиной (permission denied → «обновите Desktop»)
- [x] Gates desktop tsc + svelte-check PASS
- [ ] 0.5.5 на сайте/LAN zip 200 — **DEFERRED** (VPN off у PO; deploy по слову PO «кати» + VPN off)
- [x] Executor report READY FOR REVIEW (no archive until Cursor PASS)

## Integrity slot (до READY / archive)

- [x] Тип изменения: desktop hotfix capability + UX message + release 0.5.5
- [x] FIC §A–E — N/A
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] WIPE=false; config.env не в git (deploy DEFERRED)

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| desktop tsc | `cd desktop && npx tsc --noEmit` | **0** (0 ошибок) |
| svelte-check | `cd desktop && npx svelte-check --threshold error` | **0** (0 errors, 0 warnings) |

## Executor report (auto)

- **Commit:** `ac7a49ed3dca563404693a24c03546e27444a01b` (`chore(desktop): bump 0.5.5 — fs:allow-write-file for Excel form`)
- **Capabilities:** `desktop/src-tauri/capabilities/default.json` — добавлен `fs:allow-write-file` (бинарный `.xlsx` через `writeFile`); scope `$HOME/**` не расширялся.
- **UX:** `desktop/src/App.svelte` `downloadExcelForm()` — success: полный путь `… сохранена: ${path}`; catch: RU + текст ошибки плагина; permission-denied → «нет права записи файла (обновите Desktop)». Pairing не требуется (без изменений).
- **Release:** bump trio `package.json` == `tauri.conf.json` == `Cargo.toml` == **0.5.5**.
- **Deploy: DEFERRED** — VPN off у PO. `tauri build` + `publish-installer` + warm deploy (WIPE=false) — после слова PO «кати» + VPN off.
- **Known limits:** отмена диалога (`path` null) → файла нет (норма); ручной smoke сохранения — после install/rebuild 0.5.5.

## Deploy evidence

**DEFERRED** (VPN off у PO) — не деплоил. Warm deploy 0.5.5 после слова PO «кати» + VPN off.

## Smoke

Не выполнен (нужен rebuild/install 0.5.5): категория→таблица→«Скачать»→выбрать путь → файл на диске + лист «Данные» + скрытый `_kppdf`; регрессия CSV-отчёта (`writeTextFile`) intact.

## Notes / blockers

- Blocker: VPN off у PO → deploy 0.5.5 **DEFERRED** (не fake deploy).
- Чужой WIP (seeds, PO-CANON/DIARY, data/) не тронут.

## Review handoff

- [x] READY FOR REVIEW
- [ ] Cursor Verdict PASS (не archive до PASS)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
