═══════════════════════════════════════════════════════════════
TZD-52: Desktop 0.5.4 bump + publish + warm deploy
═══════════════════════════════════════════════════════════════

> PO слово (2026-08-16): «кати Desktop 0.5.4» + «проверить сайт и сделать деплой».
> WIPE=false (warm). Не wipe Mongo / не start.mjs recreate.

РОЛЬ АГЕНТА: Desktop release + ops deploy (Synology warm). Один агент end-to-end
(не параллелить bump и deploy на разных машинах без handoff артефакта).

ЗАВИСИМОСТИ: TZD-50 DONE + TZD-51 DONE (Form Studio V1+V2 в main).
TZ-OPS-310 DONE (gate есть: `tasks/_archive/2026-08/TZ-OPS-310.done.md`).

LAYER: 3 (desktop version files) + ops deploy

CONFLICT KEYS: `desktop/package.json` ; `desktop/src-tauri/tauri.conf.json` ; `desktop/src-tauri/Cargo.toml` ; `desktop/src-tauri/Cargo.lock` (если cargo обновит) ; `deploy/synology/config.env` (локальный, **не** в git) ; `docs/agent-checklists/TZD-52.md` ; `docs/agent-checklists/_NOW.md` ; `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`

PAGES: N/A
PAGE_DOCS: N/A ; `desktop/docs/INSTALL.md` ; `deploy/synology/README.md` § Desktop installer

STATUS: READY (PO authorized warm deploy)

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT / ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Проверено Cursor 2026-08-16 ~19:05:
- Local: `:3000` + `:4200` listen; `GET /api/health` и `GET :4200/api/health` → mongo/memory/disk **up**.
- Ошибки `vite http proxy error ECONNREFUSED /api/auth/refresh` при старте — **гонка**: frontend открылся до Nest listen. Не блокер деплоя, если health сейчас ok.
- Semver drift: `package.json`/`tauri.conf.json` = **0.5.3**, `Cargo.toml` = **0.5.2** → перед publish **обязательно** выровнять все на **0.5.4**.
- На сайте у PO раньше качался **0.5.2** — артефакт не обновляли после Form Studio.
- Worktree **грязный** чужим WIP (seeds, PO-*, data/, scripts/seed-*) — **не коммитить**. Коммит только version bump (+ checklist/NOW).
- `main` == `origin/main` по product commits; локальные uncommitted — оставить.

Канон: `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`,
`desktop/docs/INSTALL.md`, `deploy/synology/README.md` § Desktop.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0: Preflight (STOP если FAIL)

  0.1. `Get-Location` → `D:\kppdf-8.0`; `git rev-parse --abbrev-ref HEAD` → `main`.
  0.2. Local smoke: `Invoke-WebRequest http://127.0.0.1:3000/api/health` и
       `http://127.0.0.1:4200/api/health` → status ok + mongo up.
       Если BE down — поднять с **`$env:PORT='3000'`** (не `PORT=0`), без `start.mjs` wipe.
  0.3. Browser/curl: `http://localhost:4200/` открывается (Обзор или login — без 502).
  0.4. `Test-Path tasks/_archive/2026-08/TZ-OPS-310.done.md` → true.
  0.5. VPN off / LAN к VM (как RUNBOOK). Если нет доступа к Synology — STOP, доложи PO.
  0.6. Claim: `tasks/_active/TZD-52.md` + `docs/agent-checklists/TZD-52.md`.

ШАГ 1: Bump 0.5.4 (все три файла)

  1.1. Выставить **одинаково** `0.5.4` в:
       - `desktop/package.json`
       - `desktop/src-tauri/tauri.conf.json`
       - `desktop/src-tauri/Cargo.toml` (поле `version` пакета, не deps)
  1.2. При необходимости `cd desktop/src-tauri && cargo check` / update Cargo.lock только если cargo требует.
  1.3. Commit (только version files ± lock):  
       `chore(desktop): bump version to 0.5.4 (Form Studio TZD-50/51)`  
       Push `origin/main`.

ШАГ 2: Build + publish-installer

  2.1. `cd desktop && pnpm mcp:check` (если падает несущественно — зафиксируй; hard FAIL только если ломает build).
  2.2. `cd desktop && pnpm tauri build` — дождаться NSIS
       `KPPDF Desktop_0.5.4_x64-setup.exe`.
  2.3. `cd desktop && pnpm run publish-installer` — FAIL при mismatch semver.
       Ожидаемо в `frontend/downloads/`:
       - `kppdf-desktop-setup-v0.5.4.zip` (+ `.exe`)
       - alias `kppdf-desktop-setup.zip` (те же байты)
  2.4. **Запрет:** переименовать старый 0.5.2/0.5.3 exe в v0.5.4.zip.

ШАГ 3: config.env (локально, не git)

  3.1. В `deploy/synology/config.env` выставить:
       - `WIPE=false` (обязательно)
       - `DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v0.5.4.zip`
       - `DESKTOP_MIN_VERSION=0.5.3` (или 0.5.2 — политика: не ниже прошлого прод)
       - `DESKTOP_RECOMMENDED_VERSION=0.5.4`
  3.2. Не коммитить `config.env` / credentials.

ШАГ 4: Warm deploy

  4.1. `.\deploy\synology\preflight.ps1` — PASS (или починить по RUNBOOK).
  4.2. `.\deploy\synology\deploy.ps1` — warm (`WIPE=false`).
  4.3. Если WARN «Desktop installer .exe not found» → **FAIL** этой TZ (не «FE-only ok»).

ШАГ 5: Prod smoke + closeout

  5.1. `https://kppdf-crm.ru/api/health/ready` → ok.
  5.2. Скачать/HEAD `https://kppdf-crm.ru/downloads/kppdf-desktop-setup-v0.5.4.zip` → 200; имя с `v0.5.4`.
  5.3. Alias `/downloads/kppdf-desktop-setup.zip` → тот же билд (или 200 на alias).
  5.4. WAVE DoD: отметить Deploy ZIP; Smoke Forms — PO вручную после установки (можно оставить [ ] с note «нужен install 0.5.4»).
  5.5. Archive `TZD-52.done.md` + lock `TZD-52-desktop-054-publish-deploy.lock`; `_active` clear; `_NOW` update.
  5.6. `## Executor report (auto)` с commit SHA bump (+ note deploy evidence URL/time).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `WIPE=true`, `start.mjs` mongo recreate, drop DB
- backend/frontend product features (кроме staging downloads через publish/deploy)
- Чужой WIP: seeds, PO-CANON/DIARY uncommitted, data/paspots, seed-catalog scripts
- Google Sheets, TZD-49 PARK
- Force-push

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Preflight local health PASS перед bump
- [ ] package.json == tauri.conf.json == Cargo.toml == **0.5.4**; bump commit pushed
- [ ] `tauri build` + `publish-installer` PASS; versioned zip существует локально
- [ ] Warm deploy PASS; installer WARN absent
- [ ] Prod health/ready ok; `/downloads/kppdf-desktop-setup-v0.5.4.zip` 200
- [ ] Archive + lock + Executor report (auto); Cursor/PO PASS на closeout evidence
- [ ] Чужой WIP не в коммитах

known_limitation:
- Ручной smoke Form Studio (скачал Материалы → дубль/ok) — после установки 0.5.4 PO/агент.
- Dev DeprecationWarning nest shell / weak admin password length в local — не блокеры prod deploy.

═══════════════════════════════════════════════════════════════
HANDOFF
═══════════════════════════════════════════════════════════════

CLAIM первым (до кода):
1) Get-Location + git → D:\kppdf-8.0 main
2) Local /api/health (+ proxy) PASS
3) tasks/_active/TZD-52.md + checklist _TEMPLATE
4) Status CLAIMED; agent_id + claimed_at
Затем: этот файл + deploy/synology/README.md + desktop/docs/INSTALL.md
WIPE=false. Archive после Cursor/PO PASS на smoke evidence.
