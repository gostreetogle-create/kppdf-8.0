# Staging folder for Windows desktop installer

Put `kppdf-desktop-setup.exe` here (from `desktop/dist-installers/` after `pnpm tauri build`),
then run publish — it also writes `kppdf-desktop-setup.zip` (one `.exe` inside, no folder).

| File | Role |
|------|------|
| `kppdf-desktop-setup.exe` | NSIS setup (also copied into ZIP) |
| `kppdf-desktop-setup.zip` | **Default** download for pairing button → `/downloads/kppdf-desktop-setup.zip` |

- Angular assets: `angular.json` copies `kppdf-desktop-setup.*` → `downloads/` in the FE build
- Local `ng serve`: `proxy.conf.json` forwards `/downloads` → Nest `:3000` (иначе Vite «Cannot GET»)
- Deploy (`deploy/synology/deploy.py`) copies `.exe` + builds `.zip` into `frontend/browser/downloads/`
- Nest serves a folder that **contains** the ZIP/exe at `/downloads/`; **never** SPA `index.html` for that prefix (TZD-24)
- **Do not commit** `.exe` / `.zip` (root `.gitignore`)

If the pairing button opens a blank «Cannot GET /downloads/…» page: ZIP missing on the server
or local stack without proxy — run `pnpm --dir desktop publish-installer`, restart `npm start`.

Publish helper:

```text
cd desktop
pnpm run publish-installer
```
