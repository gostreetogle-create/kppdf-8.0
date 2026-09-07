# TZD-78-CHAT-HITL-MAPPING: чат предлагает сопоставление → Импорт HITL

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
lock_file: `.mimocode/locks/TZD-78-CHAT-HITL-MAPPING.lock` (local; ignored by Git)
implementation_sha: `7a3e576e`

## Verification

- acceptance criteria: PASS — все 3 пункта TZ (mapping draft из чата для файла Inbox; запись
  только через Импорт confirm; 0.5.10 published + gates + archive).
- typecheck: PASS — `tsc --noEmit` exit 0.
- svelte-check: PASS — 397 files, 0 errors, 0 warnings.
- tests: PASS — `tsx --test` (core+ai+importers+ai-runner) 135/135 (11 новых, без регрессий
  относительно baseline TZD-desktop-supply-excel-a 124/124).
- lint: N/A — desktop без отдельного lint-скрипта (канон TZD-46/68-77).
- checklist: `docs/agent-checklists/TZD-78-CHAT-HITL-MAPPING.md` — заполнен.
- status synchronization: `_NOW.md` + `STREAM-QUEUE.md` обновлены.

## Delivered

- `desktop/src/core/ai/chat-inbox-intent.ts` (+ `.test.ts`) — `matchInboxIntent(message,
  fileNames)`: локальная эвристика (слово-триггер + точное имя файла или его основа без
  расширения), без обращения к модели.
- `desktop/src/core/ai/suggest-mapping.ts` (+ `.test.ts`) — новые `pickBestTableSuggestion()`
  (лучшая таблица по числу готовых колонок из `analyzeTables()`) и
  `buildInboxMappingSummary(fileName, rowCount, best)` (короткая RU-сводка для чата). Та же
  логика без AI, что и fallback-ветка «Предложить сопоставление» на вкладке «Импорт»
  (`classifyHeaders`) — не второй классификатор.
- `desktop/src/ChatPanel.svelte`: новые props `inboxFileNames`/`onInboxAudit`/`onOpenInboxFile`;
  ряд быстрых кнопок с именами файлов Inbox над историей чата; текстовая команда «разбери файл
  X» перехватывается в `send()` до вызова `chatCompletion()` — локальный intent не уходит к
  модели и не требует настроенного AI-провайдера. Ответ-сводка несёт `inboxFile` → рендерится
  кнопка «Открыть в Импорте». LLM-путь чата не менялся.
- `desktop/src/App.svelte`: `auditInboxFileForChat()` (read-only: `auditInboxFile` +
  `analyzeTables` + два новых pure-хелпера) и `openInboxFileFromChat()` (`activeTab='import'` +
  вызов уже существующего `auditFile()` — той же функции, что кнопка «Разобрать» в списке Inbox
  на вкладке «Импорт»; второй parse/open-путь не заводился).
- `desktop/ai/system-prompts/desktop-chat.md` + `desktop/src/core/ai/prompts.ts`: одно
  синхронное предложение о новой локальной команде (тексты синхронны, канон TZD-64/77).
- Version bump lockstep **0.5.9 → 0.5.10**: `package.json`, `tauri.conf.json`, `Cargo.toml`
  (`Cargo.lock` для этого приложения в `.gitignore` — авто-обновлён сборкой, коммитить нечего).
- `release-installer` v0.5.10 опубликован в `frontend/downloads/` и `frontend/browser/downloads/`.
- `desktop/docs/AI-PROVIDERS.md` (новая секция «Чат предлагает mapping → Импорт HITL»),
  `desktop/README.md` (заметка в блоке вкладки AI).

## Smoke (evidence summary)

1. `tsc --noEmit` PASS.
2. `svelte-check` PASS (397/0/0).
3. `tsx --test` 135/135 (+11 vs baseline, no regression).
4. `pnpm run release-installer` — exit 0, PE FileVersion 0.5.10 verified (script's own assert
   against `package.json`/`tauri.conf.json`).
5. `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → 200,
   `Content-Length: 42139334` (local dev stack started solely for this check via
   `node start.mjs --no-browser`, stopped immediately after via `node start.mjs --stop` — no
   background service left running).
6. Визуальный скрин (кнопки-файлы над чатом, ответ-сводка, CTA «Открыть в Импорте») — не
   снимали (CLI-агент); реализация детерминирована (чистые функции + прямой callback-путь, не
   зависит от рантайма модели для сути функции — только для обычного диалога). PO подтверждает
   на следующем запуске Desktop.

## Known limits / follow-up

- Распознавание intent — простая эвристика (слово-триггер + имя файла), не полноценный NLU;
  нестандартные формулировки могут не сработать. Кнопки-быстрый-выбор — надёжный fallback без
  печати текста, всегда доступны, пока `onInboxAudit` подключён.
- TZD-76 (PARK): реальный локальный помощник (node-llama/NSIS) — отдельная задача, не в этом TZ.
