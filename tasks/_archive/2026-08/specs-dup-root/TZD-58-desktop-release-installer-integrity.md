# TZD-58: Desktop — честный installer v0.5.6 (build + publish gate)

> **P0.** PO скачал `kppdf-desktop-setup-v0.5.6.zip`, футер показывал v0.5.4.
> Причина: `publish-installer` брал stale exe и переименовывал. Gate уже в WIP
> (`desktop/scripts/publish-installer.mjs`) — закоммитить, собрать, опубликовать.

РОЛЬ АГЕНТА: Desktop packaging (scripts + tauri build на Windows)

ЗАВИСИМОСТИ: TZD-56 DONE (0.5.6 в package.json). **Не параллелить** с TZD-49 на `App.svelte`.

LAYER: 4 (долгий `tauri build`; один агент)

CONFLICT KEYS: `desktop/scripts/publish-installer.mjs` ; `desktop/package.json` ;
`deploy/synology/deploy.py` ; `frontend/downloads/README.md` ;
`docs/audits/2026-08-12-desktop-download-version-naming-canon.md`

CHECKLIST: `docs/agent-checklists/TZD-58.md` (создать при claim)

---

## ИСХОДНОЕ

- Semver SoT: **0.5.6** (`desktop/package.json` = `tauri.conf.json`).
- На диске NSIS только до `KPPDF Desktop_0.5.4_x64-setup.exe` (16.08); **0.5.6 NSIS нет**.
- `frontend/browser/downloads/kppdf-desktop-setup-v0.5.6.exe` = 2899027 B, дата **16.08** (= 0.5.4).
- Канон: audit `docs/audits/2026-08-12-desktop-download-version-naming-canon.md` §8 (2026-08-18).

---

## ЧТО ДЕЛАТЬ

1. **Закоммитить gate** (если ещё unstaged): strict source = versioned NSIS only; PE check на Windows; `release-installer` script в `package.json`.
2. **`cd desktop && pnpm run release-installer`** (build + publish). Ожидать **новый** NSIS `KPPDF Desktop_0.5.6_x64-setup.exe`.
3. **Verify:**
   - exe size **≠** 2899027 (старый 0.5.4) OR mtime сегодня;
   - PowerShell: `(Get-Item '…\kppdf-desktop-setup-v0.5.6.exe').VersionInfo.FileVersion` → начинается с `0.5.6`;
   - `node scripts/publish-installer.mjs` без build → **FAIL** (нет stale fallback).
4. Обновить `docs/agent-checklists/TZD-58.md` + archive.
5. **Deploy НЕ.** Commit + push только paths этого TZ.

---

## НЕ

- Bump semver выше 0.5.6 без PO
- `KPPDF_PUBLISH_ALLOW_STALE=1` кроме документированного emergency
- Трогать `App.svelte` / Import Studio logic (→ TZD-49)
- Warm deploy

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `publish-installer` падает, если нет `KPPDF Desktop_{semver}_x64-setup.exe`
- [ ] `frontend/browser/downloads/kppdf-desktop-setup-v0.5.6.*` от **свежего** build
- [ ] PE FileVersion = 0.5.6 (Windows) или manual install smoke: футер v0.5.6
- [ ] `cd desktop && npx tsc --noEmit` PASS
- [ ] Archive `tasks/_archive/2026-08/TZD-58.done.md` + lock

---

## known_limitation

- Prod `/downloads/` обновится только после PO «кати» + deploy.
