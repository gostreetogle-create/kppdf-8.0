# Staging folder for Windows desktop installer

Put `kppdf-desktop-setup.exe` here (from `desktop/dist-installers/` after `pnpm tauri build`),
then run publish — it also writes `kppdf-desktop-setup.zip` (one `.exe` inside, no folder).

| File | Role |
|------|------|
| `kppdf-desktop-setup.exe` | NSIS setup (also copied into ZIP) |
| `kppdf-desktop-setup.zip` | **Default** download for pairing button → `/downloads/kppdf-desktop-setup.zip` |

- Angular assets: `angular.json` `input: downloads` → `/downloads/*`
- Deploy (`deploy/synology/deploy.py`) copies `.exe` + builds `.zip` into `frontend/browser/downloads/`
- Nest serves `FRONTEND_PATH/downloads` (or staging) at `/downloads/`; **never** SPA `index.html` for that prefix (TZD-24)
- **Do not commit** `.exe` / `.zip` (root `.gitignore`)

Publish helper:

```text
cd desktop
pnpm run publish-installer
```
