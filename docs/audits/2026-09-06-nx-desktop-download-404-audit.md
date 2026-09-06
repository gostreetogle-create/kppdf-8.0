# Аудит 2026-09-06 — NX Desktop download 404

### Preflight Check Output
- **Context read:** `backend/src/main.ts` (downloads mount), `frontend-nx/.../proxy.conf.json`, `frontend/downloads/README.md`, `desktop/scripts/publish-installer.mjs`, live HEAD `:3000`/`:4201`
- **Key Constraints:** Mode A; zip не в git; не путать с RBAC pairing bug
- **Planned Deliverable:** `TZ-OPS-DESKTOP-INSTALLER-LOCAL` + prompt Claude
- **Validation Path:** `HEAD /downloads/kppdf-desktop-setup.zip` → 200; скачать с NX pairing dialog

## Для PO (просто)

Кнопка на NX **работает**. Сайт просит файл установщика по адресу `/downloads/kppdf-desktop-setup.zip`.  
На диске этого файла **нет** (папка `frontend/downloads/` только с README). Backend честно отвечает 404.  
Нужно **собрать Desktop** (`release-installer`) и положить zip на место — не чинить «сломанный NX-код».

## Facts

| Check | Result |
|-------|--------|
| NX proxy `/downloads` → `:3000` | есть (`proxy.conf.json`) |
| Nest mounts `frontend/downloads` | да; warn если нет zip |
| `kppdf-desktop-setup.zip` on disk | **отсутствует** |
| NSIS `src-tauri/target/.../nsis/` | **отсутствует** |
| HEAD localhost:3000/...zip | 404 Nest JSON (как у PO) |
| HEAD localhost:4201/...zip | 404 (proxy → backend) |

## Fix

`cd desktop && pnpm run release-installer` → появятся versioned + alias zip/exe в `frontend/downloads/` → повторный GET/скачивание с NX `:4201` без смены кода.

## Не invent

- Не менять pairing RBAC / dialog ради 404 файла
- Не коммитить `.exe`/`.zip`

## Resolution (2026-09-06, Claude, TZ-OPS-DESKTOP-INSTALLER-LOCAL)

`release-installer` собран (semver 0.5.7). Артефакты на диске:
`frontend/downloads/kppdf-desktop-setup-v0.5.7.{exe,zip}` + aliases
`kppdf-desktop-setup.{exe,zip}` (зеркалом в `frontend/browser/downloads/`).
zip 42 136 055 bytes, exe 42 142 377 bytes — не в git (`.gitignore`).

`curl -I` подтверждён 200 на обоих портах без рестарта backend:
- `:3000/downloads/kppdf-desktop-setup.zip` → 200, `application/zip`, `Content-Length: 42136055`
- `:4201/downloads/kppdf-desktop-setup.zip` (через NX proxy) → 200, идентично

HTTP-уровень 404 закрыт кодом/данными, без изменений в NX/proxy/pairing UI —
подтверждает исходный диагноз аудита. GUI-smoke (скачивание из pairing dialog,
установка `.exe`, старт + pairing к local API) — выполняет PO вручную,
см. checklist `docs/agent-checklists/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md` §Executor report.

**PO GUI-smoke — PASS (2026-09-06):** скрин Desktop v0.5.7, вкладка «ИИ», Connected: admin.
Скачивание/установка/pairing подтверждены. TZ archived: `tasks/_archive/2026-09/TZ-OPS-DESKTOP-INSTALLER-LOCAL.done.md`.
