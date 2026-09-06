# TZ-OPS-DESKTOP-INSTALLER-LOCAL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-06T07:20:39Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md` (Freebuff, warehouse/shell keys) — не пересекается с этим TZ
- [x] TZ / аудит прочитаны (`tasks/_ready/desktop/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md`, `docs/audits/2026-09-06-nx-desktop-download-404-audit.md`), канон `frontend/downloads/README.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md` на месте

## Acceptance (из TZ)

- [x] Alias zip на диске в `frontend/downloads/`
- [x] HEAD/GET `:3000` и `:4201` `/downloads/kppdf-desktop-setup.zip` = 200
- [x] Скачивание из NX pairing dialog работает — **PO PASS**: скрин v0.5.7, Connected admin
- [x] Desktop установлен локально; краткий smoke start — **PO PASS**: установлен, запущен, pairing к local API прошёл (Connected admin)
- [x] Бинарники не в git commit (подтверждено `.gitignore`, см. Gates)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (ops/packaging, не product code — сборка installer + docs)
- [x] FIC §A–E: N/A — не менял product page/permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route, chrome pairing download уже описан)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только `desktop/scripts/publish-installer.mjs`, `frontend/downloads/README.md`, audit, этот checklist)
- [x] Coupling map: N/A — не менял общее поле/статус
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён (bin не в git)

## Build integrity

- N/A — задача не трогает `frontend-nx` / `kppdf-web` код, только desktop packaging + backend static serving (уже существующий mount)

## Gates (факт)

```
cd desktop && pnpm run release-installer
→ tauri build: Finished `release` profile [optimized] target(s) in 1m 31s
→ Built: src-tauri/target/release/bundle/nsis/KPPDF Desktop_0.5.7_x64-setup.exe
→ publish-installer: source: fresh NSIS (tauri build)
   OK frontend/downloads/kppdf-desktop-setup-v0.5.7.exe (42142377 bytes, PE 0.5.7)
   OK frontend/downloads/kppdf-desktop-setup-v0.5.7.zip (42136055 bytes)
   alias frontend/downloads/kppdf-desktop-setup.exe / .zip (same bytes)
   OK frontend/browser/downloads/... (same, mirrored)
   Published v0.5.7 — exit 0

curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip
→ HTTP/1.1 200 OK, Content-Type: application/zip, Content-Length: 42136055 (без рестарта backend — mount подхватил файл live)

curl -I http://127.0.0.1:4201/downloads/kppdf-desktop-setup.zip
→ HTTP/1.1 200 OK, content-type: application/zip, content-length: 42136055 (через NX proxy)

git status --short frontend/downloads/ frontend/browser/downloads/ desktop/
→ (пусто — бинарники не отслеживаются)
git check-ignore -v ...
→ .gitignore:51-52 (frontend/downloads/*.exe|*.zip), .gitignore:48 (frontend/browser/) — все три файла подтверждённо игнорируются
```

## Executor report

**Semver:** 0.5.7 (SoT `desktop/package.json` == `src-tauri/tauri.conf.json`, PE FileVersion сверен `publish-installer.mjs`)
**Артефакты:** `frontend/downloads/kppdf-desktop-setup-v0.5.7.{exe,zip}` + aliases `kppdf-desktop-setup.{exe,zip}`; зеркалом в `frontend/browser/downloads/` (тот же набор, те же байты)
**Sizes:** exe 42 142 377 bytes, zip 42 136 055 bytes
**HEAD status:** `:3000` → 200 (Content-Length 42136055, application/zip); `:4201` (NX proxy) → 200, идентично — backend mount подхватил файл без рестарта
**Бинарники в git:** нет, подтверждено `.gitignore` + `git status --short` по путям артефактов
**Изменённые файлы (docs/claim only):** `tasks/_active/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md` (новый), `docs/agent-checklists/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md` (новый), `docs/agent-checklists/_NOW.md` (статус Claude). Продуктовый код НЕ менялся — только пересборка существующего `release-installer` pipeline.
**Known limits / что осталось:** GUI-часть smoke (скачивание из NX pairing dialog в браузере, установка `.exe`, короткий старт Desktop + pairing к local API) требует ручных действий человека — CLI-агент не может кликать в браузере/GUI-инсталляторе. HTTP-уровень (то, что реально отдаёт 404→200) полностью проверен и подтверждён; по решению PO GUI-smoke выполняет PO самостоятельно.

**PO smoke — PASS (2026-09-06):** скачано с NX pairing dialog, Desktop установлен и запущен,
pairing к local API прошёл — скрин показывает вкладку «ИИ», Connected: admin, версия v0.5.7.

## Review handoff

- [x] Отдельный wave-review не требуется (ops task); финальная приёмка = PO GUI-smoke — PASS

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-06T07:45:00Z
