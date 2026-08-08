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

Перед `tauri build` в бандл попадает `desktop/mcp-runtime` (`tauri.conf.json` → `bundle.resources`).  
Исходники MCP: `desktop/mcp/`; staging для инсталлятора: `desktop/mcp-runtime/` (синхронизировать `http-server.ts` и deps при изменении MCP).

Требование на машине клиента: **Node.js** в PATH (MCP host пока не sidecar).

---

## Куда ставится приложение

| | |
|--|--|
| Файлы приложения / `_up_/mcp-runtime` | `%LOCALAPPDATA%\KPPDF Desktop\` |
| Конфиг паринга / настройки | `%APPDATA%\ru.kppdf.desktop\` (или эквивалент Tauri app-data) |

Переустановка **поверх** обычно сохраняет Roaming-конфиг (паринг); Local/`_up_` перезаписывается.

---

## Обновление: почему раньше ломалось

MCP поднимает `node` + `tsx` внутри `_up_\mcp-runtime\…`. Пока Desktop/MCP запущены, файлы вроде  
`node_modules\@esbuild\win32-x64\esbuild.exe` **заняты** → NSIS:  
«Error opening file for writing».

### Исправление (обязательно в каждом новом setup)

`desktop/src-tauri/windows/hooks.nsh` подключён в `tauri.conf.json`:

```json
"bundle": {
  "windows": {
    "nsis": {
      "installerHooks": "./windows/hooks.nsh"
    }
  }
}
```

Хуки:

| Макрос | Когда | Действие |
|--------|--------|----------|
| `NSIS_HOOK_PREINSTALL` | до копирования файлов | `taskkill` `kppdf-desktop.exe`; остановить **только** `node.exe`, у которых cmdline содержит `KPPDF Desktop` / `mcp-runtime` / `kppdf-desktop`; пауза ~2 с |
| `NSIS_HOOK_PREUNINSTALL` | до удаления | то же |

Чужие `node` (Cursor, другие инструменты) **не** трогаем.

Без этого хука в setup — снова риск locked `esbuild` при update.

---

## Чеклист для PO / поддержки

1. Закрывать Desktop перед ручной заменой файлов не обязательно, если setup **с** hooks.nsh.
2. После установки: запустить → паринг (если нужно) → MCP «Запущен».
3. Для Cursor/LM Studio: кнопка **«Скопировать mcp.json»** (TZD-20) — см. `MCP.md`.
4. Если setup всё же ругается на запись — «Повтор» после закрытия окна Desktop; при повторе — убить процессы как в hooks (или переустановить свежий setup с хуками).

---

## Связанные документы

| Файл | Тема |
|------|------|
| [PAIRING.md](./PAIRING.md) | JSON паринга, кнопка «Скачать», публикация URL |
| [MCP.md](./MCP.md) | MCP URL, mcp.json, tools, GET `/mcp` → 405 |
| [../README.md](../README.md) | Обзор desktop, команды dev/build |
