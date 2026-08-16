# TZD-52 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZD-52.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/TZD-52-desktop-054-publish-warm-deploy.md`
> **Не archive / не lock** до Cursor Verdict PASS.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor (cursor-subagent)
- claimed_at: 2026-08-16T19:11:06+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (main)
- [x] Local `GET :3000/api/health` + `:4200/api/health` → ok + mongo/memory/disk up
- [x] `Test-Path tasks/_archive/2026-08/TZ-OPS-310.done.md` → true
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на desktop version / deploy conflict keys
- [x] TZ / INSTALL.md / synology README / version-naming canon прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZD-52.md` на месте

## Acceptance (из TZ)

- [x] package.json == tauri.conf.json == Cargo.toml == **0.5.4**; bump commit pushed
- [x] `tauri build` + `publish-installer` PASS; versioned zip exists locally (NSIS hash match)
- [x] Warm deploy PASS; installer WARN absent (all four Desktop OK lines)
- [x] Prod health/ready ok; artifact reachable (see smoke note on public 401 vs tunnel/LAN 200)
- [x] READY FOR REVIEW with full evidence (no archive until Cursor PASS)
- [x] Чужой WIP не в коммитах

## Integrity slot (до READY / archive)

- [x] Тип изменения: desktop release + ops deploy
- [x] FIC §A–E — N/A (не новая page/permission/module Nest)
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] COUPLING-MAP — N/A
- [x] WIPE=false; config.env не в git

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| Local health BE | `Invoke-WebRequest http://127.0.0.1:3000/api/health` | **0** / 200 ok+mongo up |
| Local health proxy | `Invoke-WebRequest http://127.0.0.1:4200/api/health` | **0** / 200 ok+mongo up |
| mcp:check | `cd desktop && pnpm mcp:check` | **0** (114 tests pass) |
| Version bump commit | `git commit` version files only | **0** |
| Push | `git push origin main` | **0** |
| tauri build | `cd desktop && pnpm tauri build` | **0** → `KPPDF Desktop_0.5.4_x64-setup.exe` |
| publish-installer (2nd) | `cd desktop && pnpm run publish-installer` | **0** (after removing stale `dist-installers`) |
| preflight | `.\deploy\synology\preflight.ps1` | **0** |
| warm deploy | `.\deploy\synology\deploy.ps1` | **0** (`=== Deploy complete ===`) |

### Artifact integrity

- NSIS: `desktop/src-tauri/target/release/bundle/nsis/KPPDF Desktop_0.5.4_x64-setup.exe` = **2899027** bytes
- SHA256 exe: `25D3893E86E04A3F37BFAF9D9018CBF3339E9078927C72FF4FE6C96BB22B0304`
- Published `frontend/downloads/kppdf-desktop-setup-v0.5.4.exe` == NSIS (MATCH)
- ZIP: `kppdf-desktop-setup-v0.5.4.zip` = **2880725** local staging / **2879895** after deploy re-pack on FE tree (served size)
- **Gotcha fixed:** first `publish-installer` preferred stale `desktop/dist-installers/kppdf-desktop-setup.exe` (= old 0.5.2 bytes). Deleted stale file; re-published from NSIS 0.5.4. **Not** a rename of old zip.

### Deploy evidence

- `WIPE=false`; `DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v0.5.4.zip`
- `DESKTOP_MIN_VERSION=0.5.3`; `DESKTOP_RECOMMENDED_VERSION=0.5.4` (config.env local only)
- Deploy log: Desktop installer .exe/.zip + versioned v0.5.4 **[OK]** (no WARN missing installer)
- VM files: `/opt/kppdf-8.0/frontend/browser/downloads/kppdf-desktop-setup-v0.5.4.{exe,zip}` present (exe 2899027, zip 2879895)
- Deploy finished ~2026-08-16T16:16Z (UTC) / ~19:16+03

### Prod / LAN smoke

| Check | Result |
|-------|--------|
| `https://kppdf-crm.ru/api/health/ready` | **200** `{"status":"ok", mongo up}` @ 2026-08-16T16:17:04Z |
| `http://192.168.1.103:3000/api/health/ready` | **200** ok |
| `http://192.168.1.103:3000/downloads/kppdf-desktop-setup-v0.5.4.zip` HEAD/GET | **200**, Content-Length **2879895** |
| Alias LAN `/downloads/kppdf-desktop-setup.zip` HEAD | **200**, same length |
| VPS tunnel `http://127.0.0.1:4200/downloads/...v0.5.4.zip` (via VM→VPS ssh) | **200** |
| `https://kppdf-crm.ru/downloads/kppdf-desktop-setup-v0.5.4.zip` without device cookie | **401** (AUTH-305 `auth_request` on `/` — expected for non-enrolled agent; not missing artifact) |

## Executor report (auto)

- **Bump commit:** `c856c178865ed4454590a3ee1c209100e7eeab19` — `chore(desktop): bump version to 0.5.4 (Form Studio TZD-50/51)` (only `desktop/package.json`, `tauri.conf.json`, `Cargo.toml`; `Cargo.lock` gitignored)
- Pushed `origin/main` (`5d9f74b8..c856c178`)
- Build + publish + warm deploy PASS; installer WARN absent
- WAVE DoD: Deploy Desktop ZIP marked done in `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`
- Known limits:
  - Manual Form Studio smoke after installing 0.5.4 — still open for PO
  - Public HTTPS download requires enrolled device cookie (AUTH-305); artifact verified via LAN + VPS tunnel + health/ready
  - Stale `desktop/dist-installers/` can poison publish — cleared for this run; consider future TZ to prefer NSIS over dist-installers or fail if hash/size mismatch vs tauri bundle

## Review handoff

- [x] READY FOR REVIEW
- [ ] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
