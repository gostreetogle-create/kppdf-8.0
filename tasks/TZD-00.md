# TZD-00: Десктоп-приложение (Tauri) — мастер-контекст и roadmap

**Status:** MASTER (контекст-хранитель · не реализация) · **Owner:** Buffy · **Создано:** 2026-08-01
**Префикс задач:** `TZD-NN` (TZ Desktop) — **все задачи `desktop/` и `mobile/` используют префикс `TZD-`**.

---

## 1. Префикс-конвенция `TZD-`

- `TZD` = **T**ask **Z**-номер **D**esktop — короткий префикс, отделяющий десктоп-бэклог от `TZ-` (основной веб-платформы).
- Файлы: `tasks/TZD-NN.md` (по конвенции репо: короткое имя, заголовок — первая строка файла).
- `TZD-00` = этот мастер-файл (контекст + roadmap, НЕ реализация). Реализационные задачи начинаются с `TZD-01`.
- В коммит-сообщениях использовать `desktop` как scope: `feat(desktop): ...`, `fix(desktop): ...`.
- `mobile/` — будущее Android-приложение: тоже `TZD-*` (отдельный под-префикс — только если mobile станет самостоятельным потоком работ).

---

## 2. Назначение

Десктоп-компаньон kppdf-8.0: **массовый ввод данных через AI** с единым backend
(multi-device — актуальные данные везде: веб, десктоп, телефон).

- пользователь открывает файл на десктопе (Excel/CSV/PDF);
- AI нормализует данные по схеме сущности (поля, форматы, справочники);
- пользователь подтверждает, десктоп отправляет батчем на **тот же backend**;
- один backend = единый источник правды (RBAC/аудит/идемпотентность уже на сервере).

---

## 3. Что уже сделано (v0.1–v0.3, все на `main`)

| Версия | Содержимое | Коммит |
|---|---|---|
| v0.1 | Скелет: Tauri 2 + Svelte 5 + Vite + TS strict, стабы, mobile/ DRAFT | `850b716` |
| fix(backend) | CORS allowlist + desktop origins (localhost:1420, tauri://localhost) | `71a0d70` |
| v0.2 | Паринг + конфиг: load/save app-data (атомарная запись), экран «Подключение», /auth/me | `574bb2b` |
| refactor | Контракт импортёров: `ImportSource {name, data: ArrayBuffer\|Uint8Array}`, `importerFor(fileName)` | `7d83ad3` |
| v0.3 | Импортёры excel (SheetJS) + csv (papaparse) → `RawRow[]`; @types/papaparse | `157846c` |
| v0.3 | UI импорта: dialog open + drag&drop, preview-таблица (10 строк), статусы, capabilities | `305c27f` |
| fix | Edge guards: pickFile try/catch, TODO-пометки (csv-дубли заголовков, excel-обрезание) | `60fd4b8` |

**Гейты v0.3:** `tsc --noEmit` ✅ · `svelte-check` 0/0 ✅ · `vite build` ✅ · `git diff --check` ✅
**Ревью:** 6 раундов в v0.2–v0.3, все замечания закрыты до коммитов.

---

## 4. Архитектура (актуальная)

```
desktop/
├── package.json           ← скрипты: tauri / dev / build (tsc && vite) / typecheck / check
├── tsconfig.json          ← strict, moduleResolution: bundler
├── vite.config.ts         ← svelte-плагин, clearScreen false, server.port 1420
├── svelte.config.js
├── src/
│   ├── main.ts            ← точка входа Svelte
│   ├── App.svelte         ← экраны «Подключение» + «Импорт» (v0.2/v0.3)
│   ├── core/
│   │   ├── config.ts      ← load/save конфига в app-data (атомарно: tmp→remove→rename), миграция версии
│   │   ├── api.ts         ← fetch-обёртка: baseUrl + Bearer + idempotencyKey() (crypto.randomUUID)
│   │   ├── pairing.ts     ← parsePairing(): валидация {apiBaseUrl, apiKey, username, expiresAt}, русские ошибки
│   │   ├── pipeline.ts    ← стаб: parse → normalize → confirm → batchPost (TODO; parseStep(File) устарел → ImportSource)
│   │   └── ai/
│   │       ├── types.ts   ← ChatMessage/ChatRequest/ChatResponse (OpenAI-совм.)
│   │       ├── client.ts  ← chatCompletion(): POST {baseUrl}/v1/chat/completions
│   │       ├── defaults.ts← ЕДИНЫЙ источник дефолта Ollama (no дубля с providers.ts)
│   │       ├── providers.ts ← LocalOllama (default) / Remote; селектор
│   │       ├── prompts.ts ← buildSystemPrompt(entitySchema)
│   │       └── index.ts
│   └── importers/
│       ├── index.ts       ← реестр: Importer {id,label,extensions,parse(ImportSource)}
│       ├── excel.ts       ← SheetJS: листы→строки, 1-я строка=заголовки, пустые строки/колонки отброшены,
│       │                    normalizeCell (string/number/boolean/Date иначе null), русские ошибки
│       ├── csv.ts         ← papaparse: UTF-8 + BOM-strip, header:true, автоделимитер, guard row (NaN-фикс)
│       ├── text.ts / pdf.ts ← стабы с TODO (v0.4+)
├── src-tauri/
│   ├── Cargo.toml / tauri.conf.json  ← Tauri 2, плагины dialog+fs, окно 1100x760 (min 800x600)
│   ├── capabilities/default.json     ← core:default + dialog:allow-open + fs:allow-read-file, scope $APPDATA + $HOME/**
│   └── src/{main.rs,lib.rs} + build.rs
├── ai/system-prompts/     ← general.md (черновик промпта) + entities.md (карта полей сущностей)
└── docs/                  ← PAIRING.md (контракт связи) + AI-PROVIDERS.md (Ollama/remote)
```

**Ключевые решения:**
- `defaults.ts` — единый источник дефолта Ollama (`http://localhost:11434`, `qwen2.5:7b`), переиспользуется config.ts и providers.ts.
- Атомарная запись конфига (tmp → remove → rename) — защита от повреждения при сбое.
- fs-scope `$HOME/**` расширен, т.к. диалог Tauri НЕ добавляет выбранный путь в scope автоматически; при сужении до `$DOCUMENT/$DOWNLOAD/$DESKTOP` проверить чтение с реального десктопа.
- Контракт импортёров браузеро-независим: `parse({name, data: ArrayBuffer|Uint8Array})` (dialog/fs дают path/Uint8Array; drag&drop — ArrayBuffer).

---

## 5. Roadmap (будущие задачи)

| Задача | Содержимое | Статус |
|---|---|---|
| TZD-01 | v0.4 AI-pipeline: client.ts (chatCompletion), providers.ts (Ollama/remote), prompts.ts (buildSystemPrompt), pipeline.ts шаги normalize/confirm/batchPost | ⏳ планируется |
| TZD-02 | v0.5 батч-POST + прогресс + отчёт об ошибках (per-row Idempotency-Key) | ⏳ планируется |
| TZD-03 | Импортёр text.ts (TXT/логи) | ⏳ |
| TZD-04 | Импортёр pdf.ts (pdfjs-dist) | ⏳ |
| TZD-05 | Паринг-кнопка на вебе — генерация JSON-пакета «Подключить десктоп» (десктоп-включающая задача; backend `/desktop/pairing` — будущий TZ) | ⏳ |
| TZD-06 | Смена сервера в UI + регенерация паринга (перезапись конфига) | ⏳ |
| TZD-07 | Иконки `src-tauri/icons/*` + первый `pnpm tauri build` (нужен Rust/WebView2) | ⏳ |
| TZD-08 | AI-уточнения (вопросы к пользователю в пайплайне) | ⏳ |
| TZD-09 | mobile/ Android: паринг по QR, оффлайн-очередь, push; стек Capacitor/Ionic vs Flutter (README-DRAFT уже есть) | ⏳ DRAFT |
| TZD-10 | Сузить fs-scope ($HOME/** → $DOCUMENT/$DOWNLOAD/$DESKTOP) после проверки на tauri dev | ⏳ |

---

## 6. DEFERRED / verify-пункты (первый `pnpm tauri dev` у пользователя)

Нет Rust/WebView2 в песочнице — `tauri build/dev` не гонялись, иконки отсутствуют. На первой живой проверке:

1. **Атомарная запись config.ts** (tmp→remove→rename) — проверить повторное сохранение (смена сервера / «Отключить») на Windows.
2. **CORS-паринг** — `localhost:1420` в allowlist добавлен; проверить `GET /api/auth/me` с десктопа.
3. **fs scope** — `$HOME/**` добавлен; если чтение из `$DOCUMENT` работает и без него — сузить (TZD-10).
4. **Иконки** — до первого `tauri build` нужен `pnpm tauri icon` (TZD-07).
5. **dialog:allow-open** — в capabilities есть; проверить, что выбранный файл читается через plugin-fs.

---

## 7. Открытые TODO-пометки в коде (из ревью)

- `core/pipeline.ts`: `parseStep(_file: File)` — сигнатура устарела относительно `ImportSource` (исправить в TZD-01).
- `importers/excel.ts`: TODO — колонки шире строки заголовков молча отбрасываются (не терять данные при рефакторинге).
- `importers/csv.ts`: TODO — дублирующиеся заголовки CSV молча перезаписываются (papaparse header:true).

---

## 8. Ссылки

- `desktop/README.md` — главный документ десктопа (назначение, стек, запуск).
- `desktop/docs/PAIRING.md` — контракт связи веб↔десктоп (формат JSON, эндпоинты, смена сервера).
- `desktop/docs/AI-PROVIDERS.md` — Ollama локально / удалённый OpenAI-совместимый endpoint.
- `desktop/ai/system-prompts/` — черновик системного промпта + карта полей сущностей.
- `mobile/README.md` — DRAFT Android-приложения (пожелания, не реализация).

---

**End of TZD-00 · контекст зафиксирован. Следующие задачи — по roadmap §5.**
