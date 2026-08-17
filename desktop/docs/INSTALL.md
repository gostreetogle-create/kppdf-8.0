# Установка и обновление KPPDF Desktop (Windows)

Канон для **клиентского** установщика NSIS и локальной сборки артефакта.
Не дублирует паринг (`PAIRING.md`) и MCP-tools (`MCP.md`).

---

## Что ставить клиенту

> **Канон имён (TZD-46):** версия видна в имени файла — `kppdf-desktop-setup-v{semver}.zip`;
> unversioned `kppdf-desktop-setup.zip` — это **alias** (копия тех же байт) для старых закладок.
> Полный канон: `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`.

| Артефакт | Путь после сборки |
|----------|-------------------|
| NSIS setup (основной) | `desktop/src-tauri/target/release/bundle/nsis/KPPDF Desktop_{semver}_x64-setup.exe` (semver из `package.json`/`tauri.conf.json`) |
| Копия для раздачи / ручной выдачи | `desktop/dist-installers/kppdf-desktop-setup.exe` (gitignored) |
| Staging для сайта (кнопка «Скачать») | `frontend/downloads/kppdf-desktop-setup-v{semver}.zip` (+ `-v{semver}.exe` рядом, + unversioned aliases) → `/downloads/…` |
| MSI (доп.) | `desktop/src-tauri/target/release/bundle/msi/*.msi` |

Бинарники **не** коммитить. На сайте кнопка открывает versioned URL
`/downloads/kppdf-desktop-setup-v{semver}.zip` (same-origin; внутри ZIP — `kppdf-desktop-setup-v{semver}.exe`)
через `DESKTOP_DOWNLOAD_URL` / compat `downloadUrl`; alias `/downloads/kppdf-desktop-setup.zip` — тот же билд для старых ссылок.

После `pnpm tauri build` опубликовать файл для веба:

```text
cd desktop
pnpm run publish-installer
```

Это копирует versioned setup **и ZIP** (`kppdf-desktop-setup-v{semver}.exe/.zip`)
плюс unversioned aliases в `frontend/downloads/` и в `frontend/browser/downloads/`
(если browser уже собран). `deploy/synology/deploy.py` при FE build тоже
подкладывает installer + zip в `frontend/browser/downloads/` по той же схеме имён.

Сборка desktop:

```text
cd desktop
pnpm install
pnpm tauri build
pnpm run publish-installer
```

`desktop/mcp/` — единственный исходный и dev-runtime путь MCP. `desktop/mcp-runtime/`
не существует в canonical worktree и не должен создаваться как вторая копия: Tauri config
сейчас не объявляет MCP resource, поэтому installer packaging/sidecar остаётся отдельным
follow-up, а не скрытым staging SoT.

Проверки MCP перед сборкой:

```text
cd desktop
pnpm mcp:check
```

Требование на машине клиента: **Node.js** в PATH (MCP host пока не sidecar; AI-раннер с 0.5.6 — bundled `.mjs`, но spawn всё ещё через `node.exe`).

### Import Studio и вкладки (TZD-36)

После запуска Desktop открывается вкладка **«Импорт Excel»**. Она содержит большую зону
перетаскивания и основную таблицу предпросмотра для `.xlsx`, `.xls` и `.csv`; Inbox
остаётся вторичной панелью ниже. Вкладка **«MCP»** содержит pairing, статус host,
Start/Stop, URL, порт/LAN и кнопки копирования `mcp.json`.

Переключение между вкладками не сбрасывает pairing и не перезапускает MCP. В TZD-37
после выбора листа нужно подтвердить сопоставление: красные unfit/conflict нельзя отправить,
профиль можно сохранить как ★ default, а статусы строк показываются до journal proposal.
BOM hierarchy остаётся в TZD-38.

### Обновление dev Desktop после `git pull` (TZD-31)

MCP host стартует из canonical `desktop/mcp/` рабочей копии, поэтому после
`git pull` **перезапустите MCP** (карточка «MCP» → «Перезапустить»), иначе
host продолжит держать старую версию tools. Проверка: `GET /healthz` →
`toolCount` ≥ 40 (актуально 51). Клиенты (Cursor / LM Studio) — **Reload MCP**.

Если Desktop стартует host не из ожидаемой папки: задайте каталог явно в
`desktop/.env` (для `tauri dev`):

```text
KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp
```

Desktop проверит `package.json` (`name = @kppdf/desktop-mcp`) и покажет
понятную ошибку при неверном каталоге — молча поднимать host из чужого дерева
не будет. В собранном MSI (sidecar пока не поставляется) это ограничение
dev-раскладки — см. `MCP.md`.

---

## Куда ставится приложение

| | |
|--|--|
| Файлы приложения | `%LOCALAPPDATA%\KPPDF Desktop\` |
| Конфиг паринга / настройки | `%APPDATA%\ru.kppdf.desktop\` (или эквивалент Tauri app-data) |

Переустановка **поверх** обычно сохраняет Roaming-конфиг (паринг); Local/`_up_` перезаписывается.

---

## Обновление: почему раньше ломалось

При будущей упаковке MCP runtime нужно учитывать, что запущенный `node` + `tsx`
держит файлы вроде `node_modules\@esbuild\win32-x64\esbuild.exe` **занятыми** → NSIS:
«Error opening file for writing». Текущий dev-host запускается из canonical `desktop/mcp/`.

### Исправление (обязательно в каждом новом setup)

В текущем `desktop/src-tauri/tauri.conf.json` MCP runtime resource **не** объявлен
(канон `desktop/mcp/` только в dev). AI-раннер с **0.5.6** упакован как resource
(`resources/ai-runner/ai-runner.mjs` + `node-llama-cpp` CPU win-x64) скриптом
`desktop/scripts/bundle-ai-runner.mjs` в `beforeBuildCommand`. `hooks.nsh` перед
update/uninstall делает `taskkill` дерева `KPPDF Desktop.exe`, чтобы не лочить
native `.node`.

| Макрос | Когда | Действие |
|--------|--------|----------|
| `NSIS_HOOK_PREINSTALL` | каждый setup 0.5.6+ | `taskkill /T` `KPPDF Desktop.exe`; пауза ~2 с |
| `NSIS_HOOK_PREUNINSTALL` | до удаления | то же |

Чужие `node` (Cursor, другие инструменты) **не** трогаем.

Когда MCP будет включён в setup, без такого хука сохранится риск locked `esbuild` при update.

---

## Чеклист для PO / поддержки

1. Для текущей dev-раскладки запускать MCP из canonical `desktop/mcp/`; installer-sidecar пока не поставляется.
2. После установки Desktop: запустить → паринг (если нужно) → MCP «Запущен», когда runtime packaging будет включён.
3. Для Cursor/LM Studio: кнопка **«Скопировать mcp.json»** (TZD-20) — см. `MCP.md`.
4. Если setup всё же ругается на запись — «Повтор» после закрытия окна Desktop; при повторе — убить процессы как в hooks (или переустановить свежий setup с хуками).

## Баннер совместимости версий (TZD-40)

Desktop после подключения вызывает `GET /api/desktop/compat` и сравнивает
свою версию (из `tauri.conf.json`) с `minDesktopVersion` /
`recommendedDesktopVersion` сервера:

- **Красный баннер** «Нужно обновить приложение» — версия ниже минимальной,
  MCP host **не** стартует. Нажмите «Скачать» → установите свежий setup.
- **Жёлтый баннер** «Рекомендуем обновить» — версия между min и recommended,
  MCP работает, но стоит обновиться.
- Без баннера — версия актуальна.

Пороги задаются env на сервере: `DESKTOP_MIN_VERSION`, `DESKTOP_RECOMMENDED_VERSION`
(см. `deploy/synology/config.env.example`). Без env баннер не показывается (fail-open).

---

## Локальная модель (вкладка AI)

Модели — открытые GGUF (Qwen2.5 Instruct, источник HF `bartowski`) из `model-catalog.ts`.
Файлы `.gguf` (~2 ГБ) кладутся в `app-data/models`; кнопка **«Открыть папку моделей»**
создаёт каталог и открывает его в проводнике — можно скачать кнопкой «Скачать модель»
или положить `.gguf` вручную с тем же именем, что в списке. Импорт и Excel-формы
работают без модели и без MCP.

**TZD-56 (0.5.6):** кнопка «Запустить» в установленном NSIS **не** требует
`KPPDF_AI_RUNNER_DIR` на дерево репозитория и **не** вызывает `tsx`. Раннер —
`ai-runner.mjs` из resource + `node-llama-cpp` (CPU win-x64). Dev (`tauri dev`)
по-прежнему `tsx` + `src/ai-runner`. Node.js на машине всё ещё нужен.

---

## Связанные документы

| Файл | Тема |
|------|------|
| [PAIRING.md](./PAIRING.md) | JSON паринга, кнопка «Скачать», публикация URL |
| [MCP.md](./MCP.md) | MCP URL, mcp.json, tools, GET `/mcp` → 405 |
| [../README.md](../README.md) | Обзор desktop, команды dev/build |
