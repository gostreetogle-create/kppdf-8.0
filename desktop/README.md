# KPPDF Desktop

Десктоп-компаньон kppdf-8.0: **массовый ввод данных через AI** с сохранением
единого backend (multi-device — актуальные данные везде: веб, десктоп, телефон).

> **Статус: v0.4 (2026-08-06).** Готово: скелет (v0.1), паринг + конфиг (v0.2),
> Excel/CSV-импорт + UI (v0.3), **MCP host в приложении (TZD-14)**: автозапуск при
> подключении, статус/URL/копирование, порт и LAN в config.ts, stop on quit.
> Дальше — AI-pipeline (v0.4) и батч+прогресс (v0.5).
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
│   ├── App.svelte         ← окно-заглушка (Подключение / AI-импорт, disabled)
│   ├── core/
│   │   ├── config.ts      ← конфиг (apiBaseUrl, apiKey, aiProvider, mcp{port,allowLan}), load/save в app-data (v2)
│   │   ├── api.ts         ← fetch-обёртка: Bearer + idempotencyKey()
│   │   ├── pairing.ts     ← parsePairing(): валидация JSON-пакета паринга
│   │   ├── mcpHost.ts     ← TZD-14: жизненный цикл MCP host (spawn/stop/restart, статус)
│   │   ├── pipeline.ts    ← стаб: parse → normalize → confirm → batchPost
│   │   └── ai/
│   │       ├── types.ts   ← ChatMessage/ChatRequest/ChatResponse (OpenAI-совм.)
│   │       ├── client.ts  ← chatCompletion(): POST {baseUrl}/v1/chat/completions
│   │       ├── providers.ts ← LocalOllama (default) / Remote; селектор
│   │       ├── prompts.ts ← buildSystemPrompt(entitySchema)
│   │       └── index.ts
│   └── importers/
│       ├── index.ts       ← реестр импортёров (excel/csv/text/pdf)
│       ├── excel.ts csv.ts text.ts pdf.ts  ← стабы parse(file) → RawRow[], TODO
├── src-tauri/             ← Rust-оболочка Tauri 2 (dialog + fs + shell плагины)
├── ai/
│   └── system-prompts/
│       ├── general.md     ← черновик системного промпта AI
│       └── entities.md    ← карта полей сущностей (по реальным схемам backend)
├── mcp/                   ← MCP socket host (TZD-11): HTTP + stdio, pairing JWT
│   ├── package.json       ← @kppdf/desktop-mcp (+ @modelcontextprotocol/sdk)
│   └── src/               ← http-server / stdio-server / tools (kppdf_ping)
└── docs/
    ├── PAIRING.md         ← контракт связи веб↔десктоп
    ├── MCP.md             ← connect string, env, tools
    └── AI-PROVIDERS.md    ← Ollama локально / удалённый endpoint
```

## Паринг (веб ↔ десктоп)

1. В вебе — кнопка «Подключить десктоп» (будущая TZ): генерирует JSON-пакет.
2. Пользователь копирует JSON и вставляет в десктоп.
3. Десктоп валидирует (`core/pairing.ts`) и сохраняет в app-data.
4. Проверка живости токена: `GET /api/auth/me`.
5. Смена сервера — вставка нового пакета; старый конфиг перезаписывается.

Полный контракт (формат, эндпоинты, смена сервера, безопасность): **[docs/PAIRING.md](docs/PAIRING.md)**.

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
