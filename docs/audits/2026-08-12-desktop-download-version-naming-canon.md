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
3. `.\deploy\synology\deploy.ps1` (warm) — `deploy.py` копирует installer в `frontend/browser/downloads/`.
4. В `config.env` на VM (если ещё не):  
   `DESKTOP_MIN_VERSION=0.5.1` (или политика PO),  
   `DESKTOP_RECOMMENDED_VERSION=<текущий semver>`,  
   `DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v{semver}.zip` (или absolute https).
5. Smoke: открыть URL ZIP → имя файла в браузере содержит `v0.5.1` (или актуальный); футер Desktop после установки = тот же semver; `/api/desktop/compat` отдаёт тот же downloadUrl.
6. **Не** считать деплой «FE-only ok», если installer WARN «exe not found» — для Desktop-потока это FAIL по смыслу PO.

См. executable: `tasks/_backlog/desktop/TZD-46-desktop-zip-versioned-filename.md`.
