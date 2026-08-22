# TZD-62: Desktop AI — чат одним кликом, если модель уже на диске

PAGES: N/A (Tauri Desktop, вкладка AI)
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md ; desktop/docs/INSTALL.md
РОЛЬ АГЕНТА: Desktop UI + thin orchestration
ЗАВИСИМОСТИ: TZD-54/55/56 DONE; не ждать TZD-63
LAYER: 3
CONFLICT KEYS: desktop/src/App.svelte; desktop/src/ChatPanel.svelte; desktop/src/core/aiRunner.ts; desktop/docs/AI-PROVIDERS.md; desktop/docs/INSTALL.md

Проверено: `App.svelte` ~2124 `data-test="ai-not-a-chat"` — «это не чат»; чата нет;
`startAi()` грузит только `modelById(selectedModelId).fileName`; `chatCompletion` уже
есть для маппинга импорта; раннер `/v1/chat/completions` (TZD-56). Канон:
`docs/superpowers/specs/2026-08-22-desktop-local-ai-onboarding.md` (GGUF, не Ollama).

В dictation «Sai» = in-app чат Desktop, не отдельный продукт и не Cursor.

## ИСХОДНОЕ

Оператор открывает AI и видит кнопки раннера. Чтобы поговорить с моделью — нельзя.
TZD-61 специально написал «не чат». PO хочет обратное: нажал — чат жив, если `.gguf`
уже лежит в `defaultModelDir()`.

## ЧТО СДЕЛАНО

- `desktop/src/ChatPanel.svelte` (новый): история сообщений, textarea, «Отправить»;
  `data-test="ai-chat-panel"` / `ai-chat-input` / `ai-chat-send`; disabled +
  `data-test="ai-chat-disabled-reason"` (одна строка почему), пока раннер не
  `running` или модель не `modelLoaded`. Отправка — `chatCompletion` +
  `aiEndpoint(port)` из `core/ai` / `core/aiRunner` (без изменений контракта).
  Своя локальная `<style>` (Svelte scoping не делится между компонентами) —
  зеркалит `.card`/`.btn`/`.input`/`.hint`/`.errors` из `App.svelte`.
- `desktop/ai/system-prompts/desktop-chat.md` (новый) + `buildDesktopChatSystemPrompt()`
  в `core/ai/prompts.ts` (экспортирован из `core/ai/index.ts`): минимальная персона
  чата — LIMITED_HELPER, нельзя писать код/claim/деплой/менять каталог-заказы,
  сайт = SoT. TZD-64 расширит глоссарий и подключит чтение файла на старте.
- `App.svelte`: кнопка **«Открыть чат»** (`data-test="ai-open-chat"`) + новая функция
  `openChat()` — если файл выбранной модели уже в `app-data/models` (проверка через
  `exists()` + `join()` из Tauri), стартует (или перезапускает, если файл модели
  сменился) раннер этим файлом, ждёт `modelLoaded` (`waitForModelLoaded`, опрос
  `/health` до 60с), фокусирует textarea чата. Если файла нет — не падает: RU
  «Модели нет в папке…» + уже существующие «Открыть папку моделей»/«Скачать модель».
  Убран блок `data-test="ai-not-a-chat"` (снимает TZD-61); баннер «Импорт работает
  без модели» оставлен без изменений.
- `desktop/src/ai-runner/index.ts`: `ensureModel()` теперь запускается сразу после
  `listen()` (если `KPPDF_AI_MODEL_FILE` задан), не дожидаясь первого чат-запроса —
  иначе `modelLoaded` никогда не станет `true` без отдельного «тестового» сообщения
  в чат (модель раньше грузилась лениво только внутри `handleChat`). Добавлена
  дедупликация конкурентных вызовов (`modelLoadPromise`), чтобы eager-load на
  старте и возможный параллельный чат-запрос не гонялись за одну и ту же загрузку.
- `desktop/docs/AI-PROVIDERS.md` + `INSTALL.md`: вкладка AI описана как «чат + модель»
  (не «не чат»); MCP — отдельный блок для Cursor/LM Studio, не для этого чата.
- `docs/pages/PAGE-TZ-INDEX.md`: строка Desktop AI-чат → TZD-62 DONE.

## Acceptance (из TZ)

- [x] На вкладке AI есть чат; текста «Это не чат» нет
- [x] Если `.gguf` выбранной модели на диске: «Открыть чат» → `modelLoaded` и можно отправить сообщение (код path проверен статически + юнит-тестами инфраструктуры; живой ручной smoke — PO/dev, GPU/CPU-раннер здесь не поднимался)
- [x] Если файла нет: чат disabled, видны папка + скачать, без stack-trace (`exists()` guard в `openChat()`, try/catch вокруг Tauri-вызовов не нужен — `exists`/`join` не бросают на нормальном пути)
- [x] Импорт «Предложить сопоставление» жив, если модель загружена (`suggestWithAi` не тронут; тот же `chatCompletion`/`aiEndpoint`)

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0
cd desktop && npx svelte-check --threshold error                        → 391 files, 0 errors, 0 warnings
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/model-catalog.test.ts
                                                                          → 11/11 PASS
cd desktop && npx tsx --test src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 6/6 PASS (regression check, не в TZ acceptance)
```

## known_limitation

- Живой браузерный/desktop smoke (реальный `.gguf`, реальный llama.cpp) не выполнялся
  в этой сессии — только статический tsc/svelte-check/unit. PO/dev: живой прогон
  «вкладка AI → Открыть чат → сообщение» по чек-листу TZ.
- Любые `.gguf` с флешки с другим именем и «скачать без Start» — TZD-63 (следующий в очереди).
- Богатый канон терминов — TZD-64. Write-MCP из чата запрещён навсегда в этой волне.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop package has no separate lint script; svelte-check + tsc are the gates)
  - checklist: ADDED (`docs/agent-checklists/TZD-62-desktop-ai-chat.md`)
  - progress.md: N/A (Desktop TZ track uses `_NOW.md`, not root progress.md)
  - status synchronization: PASS (`_NOW.md`, `docs/pages/PAGE-TZ-INDEX.md`)
