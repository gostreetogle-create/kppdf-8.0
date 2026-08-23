# Canon — Desktop download version visible + next warm deploy

> 2026-08-12 · PO: скачал ZIP с сайта, в UI всё ещё «0.5», MCP `/healthz` на 9743 не отвечает;
> в имени файла версии нет — непонятно, что скачал. VPN сейчас on → деплой later.

## Диагноз (почему так)

| Факт | Следствие |
|------|-----------|
| В **коде** Desktop уже `0.5.1` (`desktop/package.json`, `tauri.conf.json`, `Cargo.toml`, футер читает semver) | Репозиторий новее того, что на Synology/кнопке «Скачать» |
| Публикуемый артефакт всегда **`kppdf-desktop-setup.zip`** без semver (`publish-installer.mjs`, `deploy.py`) | По имени файла **нельзя** отличить 0.5.0 от 0.5.1 |
| Warm deploy с **новым** `tauri build` + publish на прод **не делали** после бампа версии / TZD-40 | На `kppdf-crm.ru/downloads/…` лежит **старый** installer |
| TZD-40: без деплоя env `DESKTOP_MIN/RECOMMENDED_VERSION` на VM не появляются | Сайт не «гонит» PO на обновление |
| MCP host `C:\Users\User\mcp` + timeout 45 s на `:9743` | Симптом **старого/битого** Desktop или пустого каталога без `node_modules/tsx` — лечится **новым** installer + Node, не правкой КП8 API |

**Вывод:** это не «версия откатилась в git», а **артефакт на сайте не обновлён** + **имя ZIP без версии**. Деплой сейчас нельзя (VPN) — подготовка в docs/TZ обязана попасть в следующий warm deploy автоматически.

## Канон имён артефактов (обязателен)

### Desktop installer

1. Канонический файл для кнопки «Скачать» / compat `downloadUrl`:
   - **`kppdf-desktop-setup-v{semver}.zip`**  
     пример: `kppdf-desktop-setup-v0.5.1.zip`
2. Внутри ZIP по-прежнему один exe: предпочтительно  
   `kppdf-desktop-setup-v{semver}.exe` (или стабильный `kppdf-desktop-setup.exe` + versioned zip — **TZ выбирает один вариант и везде одинаково**; рекомендация: **versioned zip + versioned exe arcname**).
3. Дополнительно публиковать **stable alias** (копия/symlink того же байта):
   - `kppdf-desktop-setup.zip` → тот же билд (чтобы старые закладки не 404).
4. `DESKTOP_DOWNLOAD_URL` / meta / `DEFAULT_DESKTOP_DOWNLOAD_URL` / pairing / compat API → **versioned** URL текущего semver из `desktop/package.json` (или `tauri.conf.json`), не голый unversioned-only.
5. NSIS candidate path в publish/deploy **не** хардкодить `0.1.0` — читать semver из package/tauri.
6. В pairing UI уже есть «Актуальная версия Desktop: X» (TZD-40) — после деплоя должно совпадать с semver в имени ZIP.

### PDF КП (зафиксировать, не потерять)

- Браузерный download уже: `КП-{number}.pdf` (`proposal-create.page.ts`, `proposals.page.ts`).
- Канон на будущее / server Content-Disposition: **`КП-{number}.pdf`** (номер из Quotation.number; draft без номера — `КП-черновик-{shortId}.pdf`, не `download.pdf` / не `blob`).
- Отдельный thin audit/TZ если server PDF отдаёт другое имя — см. `TZ-SALES-369` (ниже в волне).

## Что должен сделать следующий warm deploy (чеклист)

Пока VPN off → когда PO скажет «деплой»:

1. `git pull` на чистом `main` с TZD-46 (versioned zip) **уже в коде**.
2. На build-машине: `cd desktop && pnpm tauri build && pnpm run publish-installer` → в `frontend/downloads/` лежат **versioned** zip+exe (+ alias).
3. `.\deploy\synology\deploy.ps1` (warm) — `deploy.py` копирует installer в `frontend/browser/downloads/` **и** (TZD-66, см. ниже) сам пишет `DESKTOP_MIN_VERSION`/`DESKTOP_RECOMMENDED_VERSION`/`DESKTOP_DOWNLOAD_URL`/`APP_VERSION` в remote `.env` из фактического опубликованного semver — шаг 4 (было «руками в config.env») **больше не нужен** при обычном релизе.
4. ~~В `config.env` на VM руками прописать DESKTOP_MIN/RECOMMENDED_VERSION/DOWNLOAD_URL~~ — только если нужно явно **запинить** версию/URL отличные от текущего semver (см. `config.env.example`).
5. Smoke: открыть URL ZIP → имя файла в браузере содержит `v0.5.1` (или актуальный); футер Desktop после установки = тот же semver; `/api/desktop/compat` отдаёт тот же downloadUrl.
6. **Не** считать деплой «FE-only ok», если installer WARN «exe not found» — для Desktop-потока это FAIL по смыслу PO.
7. **Имя ZIP ≠ билд:** перед publish обязателен свежий `pnpm tauri build` для текущего semver. Переименовать старый exe в `…-v0.5.1.zip` **запрещено** (урок 2026-08-12: PO ставил «0.5.1», футер оставался v0.5, MCP мёртв).
8. **2026-08-18 (0.5.6):** `publish-installer.mjs` брал **первым** `dist-installers/kppdf-desktop-setup.exe` (остался 0.5.4) и публиковал как `v0.5.6`. **Исправление:** publish только из `KPPDF Desktop_{semver}_x64-setup.exe` (+ PE-check на Windows); команда `pnpm run release-installer` = build + publish.
9. **2026-08-23 (TZD-66):** PO скачал с сайта — кнопка/подпись показывали `v0.0.0`. Причина: `make_env_file()` в `deploy.py` вообще не прокидывал `DESKTOP_MIN_VERSION`/`DESKTOP_RECOMMENDED_VERSION`/`DESKTOP_DOWNLOAD_URL` в remote `.env` — `DesktopCompatService` fail-open давал `0.0.0` независимо от того, что было в (gitignored, локальном) `config.env` на машине деплоя. **Исправление:** `deploy.py` теперь резолвит semver из `desktop/package.json` при каждом деплое (та же SoT, что `publish-installer.mjs`) и сам пишет все четыре переменные в remote `.env`; `config.env` — только explicit override. См. `tasks/_archive/2026-08/TZD-66.done.md`.

См. executable: `tasks/_archive/2026-08/TZD-46.done.md`, `tasks/_archive/2026-08/TZD-66.done.md`; gate в `desktop/scripts/publish-installer.mjs` и `deploy/synology/deploy.py::make_env_file`.
