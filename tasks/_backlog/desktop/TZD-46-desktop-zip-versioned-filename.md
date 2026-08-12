# TZD-46: Desktop ZIP имя с semver (+ deploy publish)

> Канон: `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`  
> Deps: TZD-40 DONE (compat gate). Не требует деплоя для merge; деплой — отдельно по слову PO.

РОЛЬ АГЕНТА: Desktop + deploy scripts engineer

ЗАВИСИМОСТИ: TZD-40 DONE

LAYER: 3 (desktop publish + FE default URL + deploy.py; один агент)

CONFLICT KEYS: `desktop/scripts/publish-installer.mjs` ; `deploy/synology/deploy.py` ; `frontend/src/app/core/desktop-download-url.ts` ; `desktop/docs/INSTALL.md` ; `desktop/docs/PAIRING.md` ; `deploy/synology/README.md` ; `deploy/synology/config.env.example` ; `desktop/src/core/version-compat.test.ts` ; `frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts`

PAGES: (pairing dialog surface — no new route)  
PAGE_DOCS: N/A (обновить INSTALL/PAIRING)

Проверено:
- `desktop/package.json` / tauri / Cargo = **0.5.1**
- Publish всегда пишет `kppdf-desktop-setup.zip` без версии
- `deploy.py` candidate всё ещё ищет NSIS `KPPDF Desktop_0.1.0_x64-setup.exe` (устарело)
- FE default: `DEFAULT_DESKTOP_DOWNLOAD_URL = '/downloads/kppdf-desktop-setup.zip'`

Dictation: «в имени зипа версия» → `kppdf-desktop-setup-v{semver}.zip`.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. PO скачивает с сайта ZIP без semver → не видит, какая это сборка; на машине крутится старый Desktop («0.5»), MCP healthz падает.
2. Код в git уже 0.5.1, но артефакт на Synology и naming pipeline не несут версию в filename.
3. VPN сейчас мешает деплою — правки должны быть **в main**, чтобы следующий warm deploy подхватил сам.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1: Semver SoT для publish

- Читать версию из `desktop/package.json` (assert == `tauri.conf.json` version; при расхождении FAIL publish с явной ошибкой).
- Helper: `v{semver}` sanitized (`^[0-9]+\.[0-9]+\.[0-9]+`).

### ШАГ 2: `publish-installer.mjs`

Публиковать в `frontend/downloads/` и `frontend/browser/downloads/` (как сейчас):

| Файл | Обязателен |
|------|------------|
| `kppdf-desktop-setup-v{semver}.exe` | да |
| `kppdf-desktop-setup-v{semver}.zip` | да (внутри arcname = versioned exe **или** стабильный exe — выбери versioned exe и зафиксируй в INSTALL.md) |
| `kppdf-desktop-setup.exe` | да (копия того же байта — alias) |
| `kppdf-desktop-setup.zip` | да (alias того же zip-содержимого) |

- Убрать хардкод NSIS `0.1.0`; candidate: `KPPDF Desktop_{semver}_x64-setup.exe` (+ старый путь как fallback WARN).
- Лог в конце: printed versioned URL path.

### ШАГ 3: `deploy.py` `publish_desktop_installer`

- Зеркало той же схемы имён (versioned + alias).
- Semver читать из `desktop/package.json` на build-машине.
- WARN текст обновить: упомянуть versioned zip.

### ШАГ 4: FE / docs / env example

- `DEFAULT_DESKTOP_DOWNLOAD_URL` → `/downloads/kppdf-desktop-setup-v{semver}.zip`  
  **Проблема:** FE bundle не должен хардкодить устаревший patch. Варианты (выбрать A):
  - **A (рекомендуется):** default остаётся unversioned **alias** `/downloads/kppdf-desktop-setup.zip`, а **compat API** + inject meta `DESKTOP_DOWNLOAD_URL` на деплое указывают versioned; pairing показывает semver из compat. Alias всегда = latest publish.
  - **B:** FE читает version из `environment` / build-time define — тяжелее.
- Канон PO «вижу версию в имени файла»: при скачивании versioned URL (compat/downloadUrl) браузер сохраняет `…-v0.5.1.zip`. Alias для старых ссылок.
- Обновить: INSTALL.md, PAIRING.md, config.env.example (`DESKTOP_DOWNLOAD_URL=…-v0.5.1.zip`), deploy README § Desktop + чеклист next warm deploy (ссылка на audit canon).
- Тесты: version-compat + pairing specs — URL либо alias, либо versioned fixture; не ломать.

### ШАГ 5: Gates + archive

```text
cd desktop && node --test src/core/version-compat.test.ts
cd desktop && pnpm exec tsc --noEmit   # или существующий typecheck script
# publish dry: если нет exe — скрипт должен FAIL с понятным message (уже есть)
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
# jest pairing / desktop-download-url если затрагивали
git diff --check
```

- Checklist `docs/agent-checklists/TZD-46.md` + Executor report (auto).
- Archive `tasks/_archive/2026-08/TZD-46.done.md`; lock `TZD-46-desktop-zip-versioned-filename.lock`.
- **Не** запускать `deploy.ps1` в этой TZ.

---

## ИЗМЕНЯТЬ

- `desktop/scripts/publish-installer.mjs`
- `deploy/synology/deploy.py` (только publish_desktop_installer + сообщения)
- `frontend/src/app/core/desktop-download-url.ts` (+ specs при необходимости)
- docs: INSTALL, PAIRING, deploy README, config.env.example
- tests listed above

## НЕ ИЗМЕНЯТЬ

- bump semver 0.5.1→0.5.2 без нужды (если нужен bump только для «отличить от старого билда на сайте» — **один** patch bump допустим **только** если PO/канон скажет; иначе оставить 0.5.1 и сменить имя файла)
- MCP host bundling / Node sidecar
- wipe, deploy.ps1 execution
- MIG-301 / product schema

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] После `publish-installer` (при наличии exe) существуют versioned zip+exe **и** unversioned aliases
- [ ] Имя versioned zip содержит `v` + semver из package.json
- [ ] deploy.py не ссылается на NSIS `0.1.0` как единственный candidate
- [ ] Docs/README/example отражают канон; audit canon linked
- [ ] Gates PASS; нет deploy
- [ ] known_limitation: пока нет warm deploy — сайт всё ещё отдаёт старый файл (PO VPN)

known_limitation: live Synology обновится только на следующем «деплой» после merge TZD-46 + tauri build на build-машине.
