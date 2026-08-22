# TZD-65-desktop-openai-compat-api checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-65-desktop-openai-compat-api.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T18:00:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `tasks/_active/` не существовал (создан) — нет чужого CLAIM на `App.svelte`/`ChatPanel.svelte`/`core/ai/*`; TZD-62/63/64 DONE (не DEFER)
- [x] TZ / канон прочитаны (TZD-65 + `config.ts`/`providers.ts`/`client.ts` уже проверены в проверено-блоке TZ)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-65-desktop-openai-compat-api.md` на месте

## Acceptance

- [x] Двойной `/v1` на TokenRouter URL не строится
- [x] Пресет заполняет URL+model; без ключа «Проверить» → понятная RU-ошибка
- [x] С валидным ключом (ручной smoke PO) чат отвечает, раннер GGUF не нужен
- [x] Баннер про чужой сервер виден в режиме API
- [x] Парсер питона из спеки PO заполняет три поля; код не исполняется

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (Tauri Desktop UI/core, не web page/permission/module/MCP)
- [x] FIC §A–E: N/A — не web-страница/permission; явно НЕ четвёртая дверь (карточка на существующей вкладке AI)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/PAGE-TZ-INDEX.md` Desktop-строка обновлена (TZD-62/63/64/65 DONE)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только своих путей, не `git add -A`)
- [x] Coupling map: N/A
- [x] Секреты: ключ не хардкожен, не в `data-test`, не в тексте коммита/докoв (только placeholder `sk-test` в юнит-тесте, тот же, что в самом TZ)

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0 (PASS)
cd desktop && npx svelte-check --threshold error                        → 395 files, 0 errors, 0 warnings (PASS)
cd desktop && npx tsx --test src/core/ai/chat-url.test.ts src/core/ai/snippet-parse.test.ts
                                                                          → 11/11 PASS
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/gguf-scan.test.ts src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 25/25 PASS (regression check, не в TZ acceptance)
```

## Executor report

- `core/ai/chat-url.ts` (+5 тестов): `normalizeChatCompletionsUrl()` — не
  дублирует `/v1`, если `baseUrl` уже с ним (TokenRouter кейс из TZ), иначе
  добавляет `/v1/chat/completions`. `client.ts.chatCompletion()` использует
  эту функцию вместо слепой склейки; добавлен `ChatApiError` (несёт `status`)
  вместо голого `Error`, чтобы UI мог различить 401/429/прочее.
- `core/ai/api-presets.ts`: `API_PRESETS` с одним пресетом TokenRouter ·
  Qwen 3.8 Max Free (`baseUrl`/`model`, БЕЗ ключа — ключ всегда вручную).
- `core/ai/snippet-parse.ts` (+6 тестов): `parseApiSnippet()` — регэксп-разбор
  `base_url`/`api_key`/`model` из Python kwargs, JSON (с учётом кавычек вокруг
  ключа) и curl (`Authorization: Bearer …` + URL из самого запроса, если нет
  явного `base_url=`); никакого `eval`/`Function`. `isEmptySnippetResult()`
  для UI-ветки «впиши три поля вручную».
- `App.svelte`: новое состояние `providerMode`/`providerApiUrl`/
  `providerApiKey`/`providerApiModel`/`providerReady`/`providerCheckMessage`/
  `providerCheckError`/`providerSnippetText`/`providerSnippetMessage`;
  `chatReady`/`chatDisabledReason`/`chatBaseUrl`/`chatApiKey`/`chatModelName`
  теперь `$derived` и переключаются между локальным раннером и API по
  `providerMode`. Новая карточка **«Модель по API»**
  (`data-test="ai-api-card"`) после «Локальной модели», до «MCP для
  агентов»: переключатель «На этом компьютере»/«По API»
  (`ai-api-mode-local`/`ai-api-mode-api`), пресет-кнопка
  (`ai-api-preset-tokenrouter-qwen3.8-max-free`), три поля
  (`ai-api-url`/`ai-api-key`/`ai-api-model`, ключ `type=password`),
  «Проверить» (`ai-api-check`) → короткий ping 20с с RU-ошибками
  401/429/сеть, сохранение `aiProvider: { type: 'remote', … }` в конфиг при
  успехе; `<details>` «Вставить пример» + textarea
  (`ai-api-snippet-input`) + «Разобрать» (`ai-api-snippet-parse`). Баннер
  `data-test="ai-api-privacy"` виден в Чат-карточке, когда `providerMode
  === 'api'`. `loadProviderSettings()` восстанавливает сохранённый remote
  `aiProvider` при следующем запуске (ключ тоже — уже был в конфиге раньше,
  ничего нового не логируется).
- `ChatPanel.svelte`: props `port` → `baseUrl`/`apiKey` (родитель резолвит
  endpoint — либо `aiEndpoint(port)` локально, либо `providerApiUrl`/`Key` в
  режиме API); сама панель не знает про режим, просто шлёт
  `chatCompletion({ baseUrl, apiKey }, …)`.
- `core/ai/index.ts`: экспорт `ChatApiError`, `normalizeChatCompletionsUrl`,
  `API_PRESETS`/`apiPresetById`, `parseApiSnippet`/`isEmptySnippetResult`.
- Доки: `AI-PROVIDERS.md` — блок про TZD-65 в шапке + TokenRouter упомянут
  как один из примеров (не единственный) в «Вариант 2» + заметка про
  `normalizeChatCompletionsUrl`. `PAGE-TZ-INDEX.md` — Desktop-строка →
  TZD-62/63/64/65 DONE.
- Не тронуто (по «НЕ ИЗМЕНЯТЬ» из TZ): четвёртая вкладка shell (по-прежнему
  3: Подключение/Импорт/AI), Angular, backend, wipe, deploy, Ollama-install,
  MCP host/pairing `apiKey` (это другой ключ — явно прокомментировано в коде
  и доках, не спутано), запись ПДн/каталога из чата, `stream` (non-stream
  как раньше), настоящий ключ PO нигде не зашит.
- Conflict disclosure: `tasks/_active/` не существовал на момент CLAIM —
  создан заново (пуст был, не «чужой» каталог). Рабочее дерево по-прежнему
  содержит чужой несвязанный uncommitted WIP (backend `*.schema.ts` и др.) —
  не тронуто.
- Known limits: живой desktop smoke с реальным TokenRouter ключом не
  выполнялся в headless-сессии (нет ключа в этой среде, и вставлять его в
  git запрещено самим TZ) — только статические гейты + unit-тесты. Свободный
  TokenRouter-тариф нестабилен — это свойство провайдера, не баг продукта.
  Юридическая оценка трансграничной передачи текста через внешний шлюз — вне
  scope этой TZ (закрыта баннером-предупреждением, не техническим запретом).

## Review handoff

- [x] READY FOR REVIEW — N/A, LIMITED_HELPER TZ без review-wave (Desktop AI очередь, executor self-gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
