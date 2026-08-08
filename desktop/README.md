# KPPDF Desktop

Десктоп-компаньон kppdf-8.0: **массовый ввод данных через AI** с сохранением
единого backend (multi-device — актуальные данные везде: веб, десктоп, телефон).

> **Статус: v0.5+ (2026-08-08).** Готово: скелет (v0.1), паринг + конфиг (v0.2),
> Excel/CSV-импорт + UI (v0.3), **MCP host в приложении (TZD-14)**: автозапуск при
> подключении, статус/URL/копирование, порт и LAN в config.ts, stop on quit,
> **Inbox для агента (TZD-15)**: каталог-капельница → аудит → propose (без записи
> в SoT) → confirm/cancel через журнал; MCP `kppdf_inbox_list` / `kppdf_inbox_propose_file`;
> **Import Task (TZD-22)**: кнопка «Создать задачу для ИИ» → `/api/import-tasks`
> (точка сборки; matching — TZD-23). Expert «Предложить строки» сохранён.
> Задачи десктопа ведутся с префиксом `TZD-NN` (см. `tasks/TZD-00.md`).

---

## Назначение

Веб-клиент хорош для поштучной работы, но массовое наполнение справочников
(товары, материалы, контрагенты) из Excel/CSV/PDF — боль. Десктоп решает её:

- пользователь открывает файл на десктопе;
- AI нормализует данные по схеме сущности (поля, форматы, справочники);
- пользователь подтверждает, десктоп отправляет данные батчем на **тот же backend**.

Один backend = единый источник правды: изменения из любого устройства видны
во всех (веб-справочники, заказы, документы — там же, где и раньше).

## Стек и почему

| Слой | Выбор | Почему |
|---|---|---|
| Оболочка | **Tauri 2** (Rust + WebView2) | В 10–30 раз меньше дистрибутива, чем Electron; ниже RAM; быстрее запуск; нативные диалоги/fs через плагины |
| UI | **Svelte 5** + Vite + TS strict | Лёгкий, быстрый, минимальный бойлерплейт; runes — реактивность без сложного рантайма |
| Парсинг | `xlsx` (SheetJS), `papaparse`, `pdfjs-dist` | Стандарт де-факто для Excel/CSV/PDF в браузере/WebView2 |
| AI | OpenAI-совместимый клиент (`/v1/chat/completions`) | Один контракт для Ollama и удалённых провайдеров |

## Структура папки

```
desktop/
├── README.md              ← этот документ
├── package.json           ← скрипты (tauri/dev/build/typecheck) и зависимости
├── tsconfig.json          ← strict, moduleResolution: bundler
├── vite.config.ts         ← Svelte-плагин, порт 1420 (Tauri default)
├── index.html
├── svelte.config.js
├── src/
│   ├── main.ts            ← точка входа Svelte
│   ├── App.svelte         ← pairing / MCP card / Inbox / ImportTask (TZD-15/22)
│   ├── core/
│   │   ├── config.ts      ← apiBaseUrl, pairing key, mcp{port,allowLan}, inbox{dir}
│   │   ├── api.ts         ← Bearer + idempotencyKey()
│   │   ├── pairing.ts     ← parsePairing()
│   │   ├── mcpHost.ts     ← TZD-14: spawn/stop MCP host
│   │   ├── mcpClientSnippet.ts ← TZD-20: mcp.json fragment
│   │   ├── inbox.ts       ← scan/audit/propose/confirm + ImportTask create
│   │   ├── pipeline.ts    ← STUB in-app AI (не блокер при Cursor/LM Studio)
│   │   └── ai/            ← OpenAI-совм. клиент (для будущего in-app)
│   └── importers/
│       ├── excel.ts csv.ts text.ts  ← working parse
│       └── pdf.ts                   ← stub TODO
├── src-tauri/             ← Tauri 2
├── ai/system-prompts/     ← entities.md (шире runtime; runtime domain = materials)
├── mcp/                   ← единственный MCP host: reads, writes, inbox, import_task_*
└── docs/                  ← PAIRING / MCP / INSTALL / AI-PROVIDERS
```

Дальше по PO-vision: matching+HITL (**TZD-23**), reshape колонок, products, doc drafts —
см. `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`.

## MCP source of truth (TZ-DESKTOP-SOT-301)

`desktop/mcp/` — единственный канонический MCP runtime: здесь живут `package.json`,
`src/http-server.ts`, `src/stdio-server.ts` и все tools от TZD-11 до TZD-30. Desktop
host (`src/core/mcpHost.ts`) и root scripts запускают именно этот путь.

`desktop/mcp-runtime/` не является вторым исходным деревом: в canonical worktree он
отсутствует и не должен восстанавливаться или коммититься как копия. Installer-side
packaging/sidecar остаётся отдельным follow-up: текущий Tauri config не объявляет
runtime resource, а development host требует Node.js и `desktop/mcp`.

Проверки из `desktop/`:

```bash
pnpm mcp:check       # typecheck + tests для canonical desktop/mcp
pnpm typecheck       # Svelte/desktop shell
pnpm build           # shell production build
```

## Паринг (веб ↔ десктоп)

1. В вебе нажмите «Подключить десктоп».
2. Нажмите «Скачать приложение», установите Windows `.exe` и запустите десктоп.
3. В веб-диалоге нажмите «Скопировать», затем вставьте JSON в десктоп.
4. Десктоп валидирует (`core/pairing.ts`) и сохраняет в app-data.
5. Проверка живости токена: `GET /api/auth/me`.
6. Смена сервера — вставка нового пакета; старый конфиг перезаписывается.

Ссылка на установщик задаётся `DESKTOP_DOWNLOAD_URL` в `deploy/synology/config.env`;
`deploy.py` записывает её в runtime `window.__DESKTOP_DOWNLOAD_URL__`. По умолчанию
используется same-origin
`/downloads/kppdf-desktop-setup.zip` (внутри — setup.exe). Локально кнопка идёт на
`:4200/downloads/…` → proxy на Nest (см. `frontend/proxy.conf.json`); без ZIP в
`frontend/downloads/` будет 404. Явно пустое `DESKTOP_DOWNLOAD_URL` отключает кнопку до
публикации файла. Сборочные `.exe`/`.msi`/`.zip` **не** коммитятся.

Установка / обновление / NSIS (остановка MCP перед копированием файлов):  
**[docs/INSTALL.md](docs/INSTALL.md)**.

Полный контракт паринга: **[docs/PAIRING.md](docs/PAIRING.md)**.  
MCP и mcp.json для Cursor/LM Studio: **[docs/MCP.md](docs/MCP.md)**.

## AI-провайдеры

- **Локальный Ollama** (по умолчанию): `http://localhost:11434`, модель `qwen2.5:7b`.
  Данные не покидают машину. Поднятие модели — [docs/AI-PROVIDERS.md](docs/AI-PROVIDERS.md).
- **Удалённый OpenAI-совместимый** endpoint — из конфига (ключ в app-data).
- Абстракция `core/ai/providers.ts`: один клиент, два источника.

## MCP socket (TZD-11+)

Локальная «розетка» для любого MCP-клиента: [docs/MCP.md](docs/MCP.md) · пакет `desktop/mcp/`.

## AI-импорт (пайплайн)

```
файл → parse (importers/*) → AI-нормализация (схема из /api/registry/data-sources)
     → уточнения (вопросы к пользователю) → подтверждение (таблица)
     → батч-POST с per-row Idempotency-Key
```

- Схема сущности подставляется в системный промпт: `prompts.buildSystemPrompt()`.
- Системный промпт и карта полей — `ai/system-prompts/`.
- Каждая строка уходит на сервер со своим `Idempotency-Key` — повторы безопасны.
- Все шаги — стабы в `core/pipeline.ts` (TODO), реализация — будущие TZ.

## Безопасность

- API-ключ хранится **локально** в app-data (не в коде, не в репозитории).
- Вся авторизация — на сервере (RBAC); клиент не доверяется.
- Паринг не хранит пароль; истёкший/отозванный токен → повторный паринг.

## Roadmap

| Версия | Содержимое | Статус |
|---|---|---|
| v0.1 | **Скелет**: структура, конфиги, типы, стабы | ✅ DONE `850b716` |
| v0.2 | Паринг + конфиг: вставка JSON, app-data, проверка /auth/me | ✅ DONE `574bb2b` (+CORS `71a0d70`) |
| v0.3 | Excel-импорт: xlsx/papaparse → таблица (диалог + drag&drop) | ✅ DONE `157846c`+`305c27f`+`60fd4b8` |
| v0.4 | MCP host в приложении: автозапуск при паринге, статус UI, порт/LAN в конфиге | ✅ DONE (TZD-14) |
| v0.5 | AI-pipeline: Ollama/remote, нормализация, подтверждение | ⏳ TZD-01 |
| v0.5 | Батч-отправка + прогресс + отчёт об ошибках | ⏳ TZD-02 |
| MCP | Универсальная розетка агента (localhost tools) | ✅ TZD-11–14; ⏳ TZD-15 |

Полный контекст v0.1–v0.3 — **`tasks/_archive/2026-08/TZD-00.done.md`**.  
MCP vision + safety (propose/confirm, mutation journal):  
**[`docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`](../docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md)**  
Очередь: **`tasks/_backlog/desktop/`** (TZD-11…15). Импорт TZD-01…10 — PARKED до PO.

## Запуск

Требуется: **Rust toolchain** (https://rustup.rs) и **WebView2** (на Win10/11 предустановлен).

```bash
cd desktop
pnpm install
pnpm tauri dev        # откроет окно Tauri (dev-сервер Vite на :1420)
```

Полезные команды:

```bash
pnpm typecheck        # tsc --noEmit
pnpm build            # tsc --noEmit && vite build
pnpm check            # svelte-check (проверка .svelte-файлов)
pnpm tauri build      # сборочный инсталлятор (нужны иконки в src-tauri/icons/)
```

Детали артефактов, AppData и хуков установщика — **[docs/INSTALL.md](docs/INSTALL.md)**  
(`src-tauri/windows/hooks.nsh`: stop Desktop + MCP перед update).

Установщик раздаётся из `frontend/browser/downloads/` (backend публикует
каталог на `/downloads/` **без** SPA fallback), например
`https://<host>/downloads/kppdf-desktop-setup.zip`. Рядом может лежать `.exe`.
Размещение файла и URL настраиваются отдельно от git; Node.js для MCP host
должен быть установлен на машине, пока sidecar не бандлится.
