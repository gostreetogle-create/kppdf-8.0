# codebase-memory MCP (vendor-bundled)

Локальный vendor-bundle MCP-сервера **codebase-memory-mcp** (DeusData 2025, MIT) для kppdf-8.0.

## Что внутри

```
vendor/codebase-memory-mcp/
├── bin/
│   ├── codebase-memory-mcp.exe     # 262 MB Windows console executable (gitignored, см. ниже)
│   └── install.ps1                 # ⚠️ Alien installer — НЕ ЗАПУСКАТЬ (см. warning ниже)
└── doc/
    ├── LICENSE                     # MIT
    └── THIRD_PARTY_NOTICES.md      # Tree-sitter + 159 parsers (MIT/BSD/Apache-2.0)
```

**Почему именно vendor/?** Решение TZ-проекта: project-local рядом с `start.mjs`, versioned для воспроизводимости. Альтернатива (system-wide install) рассматривалась — отвергнута из-за multi-developer workflow.

## ⚠️ Что НЕ в git

- `bin/codebase-memory-mcp.exe` — 262 MB, см. `.gitignore` строка `vendor/codebase-memory-mcp/bin/*.exe`. Слишком большой для репозитория (раздует clone/push на 30 %).
- `index/`, `cache/`, `.codebase-memory/` — runtime-артефакты MCP-сервера (появится после первого запуска), `.gitignore` их тоже покрывает.

Что **коммитится** в git: `README.md` (этот файл), `doc/LICENSE`, `doc/THIRD_PARTY_NOTICES.md`, `bin/install.ps1` (как reference, НЕ для запуска — см. warning ниже). Этого достаточно для воспроизводимой установки на новый клон.

## ⚠️ НЕ ЗАПУСКАЙТЕ `bin/install.ps1`!

Файл `bin/install.ps1` пришёл из исходного ZIP DeusData как **альтернативный** способ установки (скачивает бинарь с удалённого source по TLS 1.2). Запуск этого скрипта в working tree:

- **Скачает бинарь из удалённого source** (без integrity-check signature) — может не совпадать с тем, что вендорился в этом коммите.
- **Перезапишет** текущий `bin/codebase-memory-mcp.exe` (262 MB) неизвестной версией.
- **Привнесёт runtime dependencies** (MIT-licensed `tar` extraction, Windows-Registry touched), расходящиеся с заявленной vendor-семантикой.

**Что делать вместо этого:**
- Файл извлечён из локального ZIP, вы ему доверяете → просто **удалите `bin/install.ps1`** после извлечения (`git rm` или ручной `rm`), commit.
- Хотите сохранить как reference для понимания исходного installer → **оставьте, но никогда не запускайте** (этот README — единственный documentation reference).

`start.mjs` и `.mcp.json` используют ТОЛЬКО `bin/codebase-memory-mcp.exe`. `install.ps1` НЕ нужен для работы MCP.

## Поддерживаемые платформы

**Текущая версия:** `codebase-memory-mcp 0.9.0` (verified 2026-07-11).

| Платформа | Статус | Как получить |
|---|---|---|
| Windows AMD64 | ✅ Поддерживается | `codebase-memory-mcp-ui-windows-amd64.zip` (этот бандл). |
| Windows ARM64 | ❌ Не предоставляется | DeusData выпускает только AMD64. |
| Linux (любая) | ❌ Нет готового бинаря | Source build из DeusData repo — вне scope TZ-92b, tracked как open research question. |
| macOS (любая) | ❌ Нет готового бинаря | Source build из DeusData repo — вне scope TZ-92b. |

**HTTP UI port (verified):** `:9749` — авто-стартует при любом запуске бинаря (`./codebase-memory-mcp.exe` или `./codebase-memory-mcp.exe --ui`). Override порта НЕ предусмотрен в binary v0.9.0. Из лога запуска:
```
level=info msg=server.start version=0.9.0
level=info msg=watcher.start interval_ms=multi-sec
level=info msg=ui.serving url=http://127.0.0.1:9749 port=9749
```

**stdio transport (первичный use-case):** порт не имеет значения. Claude Code / Cursor / Cline / Continue общаются через stdin/stdout JSON-RPC. `.mcp.json` уже корректно настроен на этот режим.

## Установка на свежем клоне

> Только Windows. Для macOS/Linux см. секцию «Поддерживаемые платформы» выше.

1. **Скачать исходный ZIP** (должен совпадать с вендорированным): `codebase-memory-mcp-ui-windows-amd64.zip` (запросить у владельца репо или взять из backup `tmp/`).
2. **Извлечь напрямую в vendor** (canonical extract, не через install.ps1):
   ```bash
   unzip codebase-memory-mcp-ui-windows-amd64.zip -d /tmp/cb-mcp-extract/
   cp /tmp/cb-mcp-extract/codebase-memory-mcp.exe vendor/codebase-memory-mcp/bin/
   cp /tmp/cb-mcp-extract/LICENSE vendor/codebase-memory-mcp/doc/
   cp /tmp/cb-mcp-extract/THIRD_PARTY_NOTICES.md vendor/codebase-memory-mcp/doc/
   # НЕ копировать install.ps1 (см. warning выше) — либо скопировать и НЕ запускать, либо пропустить
   ```
3. **Проверить** (binary smoke test):
   ```bash
   ./vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe --help
   ```
   Ожидаемо: `codebase-memory-mcp 0.9.0` + Usage info.

   > **Пути:** `.mcp.json` и `start.mjs` используют forward-slashes (`vendor/codebase-memory-mcp/...`) — Node-native и работают на Windows. Если ваш MCP-клиент (не Node-обёрнутый) требует Windows-native path, замените на `vendor\\codebase-memory-mcp\\bin\\codebase-memory-mcp.exe`.

## Использование через MCP

Файл `.mcp.json` в корне проекта уже настроен на запуск `vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe` через stdio-транспорт. Поддерживается:

- **Claude Code / Cursor / Cline / Continue** — все читают `.mcp.json` автоматически при следующем запуске сессии.
- **Запуск напрямую (debug/smoke test)**:
  ```bash
  pnpm run mcp:start         # просто stdio-server, ждёт JSON-RPC на stdin
  ```

## Интеграция со start.mjs

`start.mjs` **НЕ** запускает MCP автоматически — это сознательное решение. MCP-сервер поднимается по запросу (Claude Code / Cursor стартуют его при открытии сессии). Если поднимать на каждом `pnpm start:all`, indexing 285 backend + frontend файлов будет резко замедлять boot (~30-60 s добавляется).

Авто-поднятие MCP в `start.mjs` сознательно отключено (см. выше). Если нужен auto-start для офлайн-режима — добавить в `start.mjs` после `step 5` (Spawn backend+frontend) опциональный блок с проверкой `if (existsSync('./vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe'))` и `isPortInUse(9749)` для HTTP UI. Это позволит открывать `http://127.0.0.1:9749` сразу после `pnpm start:all` без отдельного запуска `pnpm run mcp:start`. Tracked as future TZ-92c (вне scope TZ-92b).

## Troubleshooting

| Симптом | Причина / Fix |
|---|---|
| MCP server не появляется в Claude Code | Проверить что `.mcp.json` валиден (`node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8'))"` нет ошибки). Перезапустить Claude Code. |
| `binary not executable` при старте | На Windows проверить что путь в `.mcp.json` корректен (forward slashes OK, но без trailing whitespace). Проверить `binary executable`: `ls -la vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe` должен показать 262 MB. |
| HTTP UI не открывается | **HTTP UI авто-стартует на `:9749`** при любом запуске бинаря (default mode + `--ui` — оба ведут к `ui.serving url=http://127.0.0.1:9749`). Override порта НЕ предусмотрен (verified binary v0.9.0 from `--ui </dev/null 2>&1 | grep ui.serving`). Открой `http://127.0.0.1:9749` после `pnpm run mcp:start` (foreground, держать окно открытым) или автоподнятия через Claude Code / Cursor. |
| Index растёт > 1 GB | `vendor/codebase-memory-mcp/index/` — runtime, почистить вручную: `rm -rf vendor/codebase-memory-mcp/index/*`. MCP переиндексирует при следующем запуске. |
| `install.ps1` случайно запущен | Восстановить рабочее состояние: перезалить `bin/codebase-memory-mcp.exe` из локального ZIP (см. step 2 выше). Коммитить BEFORE запуска install.ps1 = иметь git-anchor для восстановления. |

## Cross-references

- **TZ-91 §4 Phase B (commit `0db6e79`):** RBAC coverage sweep — MCP будет полезен для navigation по 47 patched controllers + проверки `@Roles('admin','manager','user')` self-service endpoints.
- **TZ-86 Document Constructor:** MCP может использоваться Claude для symbol-extraction binding-format между `DocumentBuilder.build()` и Mongoose subdoc `dataBinding`.
- **TZ-83 ProductModule hierarchy:** MCP symbol-extraction особенно полезен для навигации по M:N связям и nested populate chains.
- **TZ-92b (future):** HTTP UI port documentation + Linux/Mac build instructions.
