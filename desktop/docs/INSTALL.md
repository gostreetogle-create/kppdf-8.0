# Установка и обновление KPPDF Desktop (Windows)

Канон для **клиентского** установщика NSIS и локальной сборки артефакта.
Не дублирует паринг (`PAIRING.md`) и MCP-tools (`MCP.md`).

---

## Что ставить клиенту

| Артефакт | Путь после сборки |
|----------|-------------------|
| NSIS setup (основной) | `desktop/src-tauri/target/release/bundle/nsis/KPPDF Desktop_0.1.0_x64-setup.exe` |
| Копия для раздачи / ручной выдачи | `desktop/dist-installers/kppdf-desktop-setup.exe` (gitignored) |
| Staging для сайта (кнопка «Скачать») | `frontend/downloads/kppdf-desktop-setup.zip` (+ `.exe` рядом) → `/downloads/…` |
| MSI (доп.) | `desktop/src-tauri/target/release/bundle/msi/*.msi` |

Бинарники **не** коммитить. На сайте кнопка открывает  
`/downloads/kppdf-desktop-setup.zip` (same-origin; внутри ZIP — `kppdf-desktop-setup.exe`)
или `DESKTOP_DOWNLOAD_URL`.

После `pnpm tauri build` опубликовать файл для веба:

```text
cd desktop
pnpm run publish-installer
```

Это копирует setup **и ZIP** в `frontend/downloads/` и в `frontend/browser/downloads/`
(если browser уже собран). `deploy/synology/deploy.py` при FE build тоже
подкладывает installer + zip в `frontend/browser/downloads/`.

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

Требование на машине клиента: **Node.js** в PATH (MCP host пока не sidecar).

### Import Studio и вкладки (TZD-36)

После запуска Desktop открывается вкладка **«Импорт Excel»**. Она содержит большую зону
перетаскивания и основную таблицу предпросмотра для `.xlsx`, `.xls` и `.csv`; Inbox
остаётся вторичной панелью ниже. Вкладка **«MCP»** содержит pairing, статус host,
Start/Stop, URL, порт/LAN и кнопки копирования `mcp.json`.

Переключение между вкладками не сбрасывает pairing и не перезапускает MCP. Multi-sheet,
профиль сопоставления полей и BOM hierarchy появятся в следующих TZD-37/38.

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

В текущем `desktop/src-tauri/tauri.conf.json` MCP runtime и NSIS hook не объявлены:
канонический `desktop/mcp/` работает в dev-раскладке, а installer packaging/sidecar
остаётся отдельным follow-up. При его выпуске конфигурация должна добавить hook,
который останавливает только собственный Desktop/MCP процесс.

Будущий hook:

| Макрос | Когда | Действие |
|--------|--------|----------|
| `NSIS_HOOK_PREINSTALL` | будущая упаковка MCP | `taskkill` `kppdf-desktop.exe`; останавливать только MCP-процессы, идентифицированные по `KPPDF Desktop` / canonical MCP path; пауза ~2 с |
| `NSIS_HOOK_PREUNINSTALL` | до удаления | то же |

Чужие `node` (Cursor, другие инструменты) **не** трогаем.

Когда MCP будет включён в setup, без такого хука сохранится риск locked `esbuild` при update.

---

## Чеклист для PO / поддержки

1. Для текущей dev-раскладки запускать MCP из canonical `desktop/mcp/`; installer-sidecar пока не поставляется.
2. После установки Desktop: запустить → паринг (если нужно) → MCP «Запущен», когда runtime packaging будет включён.
3. Для Cursor/LM Studio: кнопка **«Скопировать mcp.json»** (TZD-20) — см. `MCP.md`.
4. Если setup всё же ругается на запись — «Повтор» после закрытия окна Desktop; при повторе — убить процессы как в hooks (или переустановить свежий setup с хуками).

---

## Связанные документы

| Файл | Тема |
|------|------|
| [PAIRING.md](./PAIRING.md) | JSON паринга, кнопка «Скачать», публикация URL |
| [MCP.md](./MCP.md) | MCP URL, mcp.json, tools, GET `/mcp` → 405 |
| [../README.md](../README.md) | Обзор desktop, команды dev/build |
