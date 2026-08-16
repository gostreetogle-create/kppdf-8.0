# TZD-52: Desktop 0.5.4 bump + publish + warm deploy

> **Финал волны** WAVE-DESKTOP-EXCEL-FORMS: собрать и опубликовать Desktop 0.5.4
> (Form Studio V1+V2 из TZD-50/51) и сделать warm deploy на prod.
>
> РОЛЬ АГЕНТА: Desktop release + ops deploy (Synology warm). Один агент end-to-end
> (bump → tauri build → publish-installer → preflight → warm deploy → prod smoke).
>
> ЗАВИСИМОСТИ: TZD-50 DONE + TZD-51 DONE (Form Studio V1+V2 в main);
> TZ-OPS-310 DONE (`tasks/_archive/2026-08/TZ-OPS-310.done.md`).

LAYER: 3 (desktop version files) + ops deploy

CONFLICT KEYS: `desktop/package.json` ; `desktop/src-tauri/tauri.conf.json` ;
`desktop/src-tauri/Cargo.toml` ; `docs/agent-checklists/TZD-52.md` ;
`docs/agent-checklists/_NOW.md` ; `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`

CHECKLIST: `docs/agent-checklists/TZD-52.md`
REVIEW: required (Cursor Verdict **PASS** 2026-08-16 до archive)

---

## Что сделано (коротко)

1. **Bump 0.5.4** — `desktop/package.json` == `tauri.conf.json` == `Cargo.toml` == **0.5.4**
   (было 0.5.3 / 0.5.3 / 0.5.2). Commit только version files + push.
2. **Build + publish** — `tauri build` → NSIS `KPPDF Desktop_0.5.4_x64-setup.exe`
   (2 899 027 bytes, SHA256 `25D3893E…B0304`); `publish-installer` → версионные
   `kppdf-desktop-setup-v0.5.4.{exe,zip}` (после удаления stale `dist-installers/` 0.5.2).
3. **Warm deploy** — `WIPE=false`; preflight + `deploy.ps1` PASS; installer WARN absent;
   `DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v0.5.4.zip`,
   `DESKTOP_MIN_VERSION=0.5.3`, `DESKTOP_RECOMMENDED_VERSION=0.5.4` (config.env local).
4. **Prod smoke** — `https://kppdf-crm.ru/api/health/ready` 200; LAN + VPS tunnel zip 200
   (Content-Length 2 879 895); public HTTPS без device cookie → 401 (AUTH-305, не missing artifact).

## Verification

- `cd desktop && pnpm mcp:check` → **PASS 114/114**
- `cd desktop && pnpm tauri build` → **PASS** (NSIS 0.5.4)
- `cd desktop && pnpm run publish-installer` → **PASS** (после удаления stale dist-installers)
- `.\\deploy\\synology\\preflight.ps1` → **PASS**
- `.\\deploy\\synology\\deploy.ps1` → **PASS** (`=== Deploy complete ===`, WIPE=false)
- Prod health/ready → **200** `{"status":"ok", mongo up}` @ 2026-08-16T16:17:04Z
- checklist: DONE (`docs/agent-checklists/TZD-52.md`)
- cursor verdict: PASS (2026-08-16, до closeout)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T19:25:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZD-52
DEP: TZD-50 + TZD-51 DONE; TZ-OPS-310 DONE

verification:
  - acceptance criteria: PASS (все чекбоксы TZD-52 + Cursor Verdict PASS)
  - version: PASS (package.json == tauri.conf.json == Cargo.toml == 0.5.4)
  - build: PASS (tauri build → NSIS 0.5.4, 2 899 027 bytes, SHA256 25D3893E86E04A3F37BFAF9D9018CBF3339E9078927C72FF4FE6C96BB22B0304)
  - publish: PASS (kppdf-desktop-setup-v0.5.4.exe == NSIS MATCH; zip 2 879 895 served)
  - warm deploy: PASS (WIPE=false; installer WARN absent)
  - prod smoke: PASS (health/ready 200; LAN + VPS tunnel zip 200; public HTTPS 401 = AUTH-305 без device cookie)
  - checklist: DONE (docs/agent-checklists/TZD-52.md, Status DONE + closed_at)
  - cursor verdict: PASS (2026-08-16; bump c856c178, health/ready 200, LAN zip 200)
  - commit: c856c178865ed4454590a3ee1c209100e7eeab19 (chore(desktop): bump version to 0.5.4 (Form Studio TZD-50/51))
  - ready commit: 2c5f6435 (docs(desktop): TZD-52 READY FOR REVIEW — 0.5.4 warm deploy evidence)
  - push: YES (origin/main, 5d9f74b8..c856c178..2c5f6435)

## Files

- `desktop/package.json`, `desktop/src-tauri/tauri.conf.json`, `desktop/src-tauri/Cargo.toml` (0.5.4)
- `docs/agent-checklists/TZD-52.md`, `tasks/_active/TZD-52.md` (marker, удалён при closeout)
- `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md` (DoD: Deploy Desktop ZIP done)
- `deploy/synology/config.env` (локально, не в git)

## Known limits (successor)

- Ручной Smoke Form Studio (скачал Материалы → дубль/ok) — после установки 0.5.4 PO/агент
- Public HTTPS download требует enrolled device cookie (AUTH-305) — артефакт подтверждён через LAN + VPS tunnel + health/ready
- Stale `desktop/dist-installers/` может отравить publish — будущий TZ: предпочитать NSIS или FAIL при hash/size mismatch
