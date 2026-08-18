# Staging folder for Windows desktop installer

Canon: `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`

## Правило (обязательно)

**Нельзя** бампнуть semver в `desktop/package.json` и только переименовать ZIP/exe.
Имя файла `kppdf-desktop-setup-v0.5.6.zip` должно совпадать с версией **внутри** установщика (футер Desktop).

```text
cd desktop
pnpm run release-installer
```

`release-installer` = `pnpm tauri build` + `publish-installer`.

`publish-installer` **откажется**, если нет свежего NSIS  
`src-tauri/target/release/bundle/nsis/KPPDF Desktop_{semver}_x64-setup.exe`  
(на Windows дополнительно сверяет PE FileVersion с semver).

Аварийный обход (только если осознанно): `KPPDF_PUBLISH_ALLOW_STALE=1 pnpm run publish-installer`.

## Артефакты

| File | Role |
|------|------|
| `kppdf-desktop-setup-v{semver}.exe` | Канонический NSIS setup |
| `kppdf-desktop-setup-v{semver}.zip` | **Default** download → `/downloads/kppdf-desktop-setup-v{semver}.zip` |
| `kppdf-desktop-setup.exe` / `.zip` | Alias (те же байты) для старых ссылок |

- Angular assets: `angular.json` copies `kppdf-desktop-setup.*` → `downloads/` in the FE build
- Local `ng serve`: `proxy.conf.json` forwards `/downloads` → Nest `:3000`
- Deploy (`deploy/synology/deploy.py`) копирует из staging / свежего NSIS в `frontend/browser/downloads/`
- Nest serves a folder that **contains** the ZIP/exe at `/downloads/`; **never** SPA `index.html` for that prefix (TZD-24)
- **Do not commit** `.exe` / `.zip` (root `.gitignore`)

If the pairing button opens a blank «Cannot GET /downloads/…» page: run `pnpm run release-installer`, restart `npm start`.

## Smoke после publish

1. Размер exe ≠ старому билду (если semver новый).
2. Дата exe ≈ время `tauri build`, не неделя назад.
3. После установки: футер Desktop = semver из имени ZIP.
