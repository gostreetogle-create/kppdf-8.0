# TZD-65: Desktop AI — подключить бесплатную модель по OpenAI-совместимому API

PAGES: N/A (вкладка AI, не четвёртая дверь)
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md
РОЛЬ АГЕНТА: Desktop UI + AI client
ЗАВИСИМОСТИ: TZD-62 DONE (`ChatPanel.svelte` есть). TZD-63/64 были DONE к моменту старта — DEFER не понадобился.
LAYER: 3
CONFLICT KEYS: desktop/src/App.svelte; desktop/src/ChatPanel.svelte; desktop/src/core/ai/client.ts; desktop/src/core/ai/providers.ts; desktop/src/core/ai/chat-url.ts; desktop/src/core/ai/snippet-parse.ts; desktop/src/core/ai/api-presets.ts; desktop/src/core/config.ts; desktop/docs/AI-PROVIDERS.md

Проверено: `config.ts` уже `aiProvider.type: 'local-ollama' | 'remote'` + `baseUrl`/`apiKey`/`model`;
`resolveProvider` умеет remote; UI этого не было. Чат TZD-62 ходил только в `aiEndpoint(port)`
(локальный раннер). `chatCompletion` клеил `baseUrl + '/v1/chat/completions'` слепо —
если PO вставит TokenRouter `https://api.tokenrouter.com/v1`, получался двойной `/v1` (баг).
`pingProvider` stub → всегда false (не тронут, отдельная проверка сделана прямо через `chatCompletion`).

Пример PO (TokenRouter, free): `base_url=https://api.tokenrouter.com/v1`,
`model=qwen/qwen3.8-max-free`, ключ — из кабинета, не в git.

## ИСХОДНОЕ

Оператор хочет проверить чат без скачивания 2 ГБ GGUF: вставить ключ бесплатного
OpenAI-совместимого шлюза (TokenRouter и аналоги). В коде remote уже заложен,
на экране — нет.

## ЧТО СДЕЛАНО

- `desktop/src/core/ai/chat-url.ts` (новый) + `chat-url.test.ts` (5 тестов):
  `normalizeChatCompletionsUrl(baseUrl)` — если `baseUrl` уже кончается на
  `/v1`, добавляет только `/chat/completions`; если это уже полный путь —
  оставляет как есть; иначе добавляет `/v1/chat/completions`. Никогда не
  строит `…/v1/v1/…`. `client.ts` `chatCompletion()` использует эту функцию
  вместо `${baseUrl.replace(...)}/v1/chat/completions`; добавлен класс
  `ChatApiError extends Error` с полем `status`, чтобы вызывающий код мог
  различить 401/429/прочее без парсинга текста сообщения.
- `desktop/src/core/ai/api-presets.ts` (новый): `API_PRESETS` — один пресет
  **TokenRouter · Qwen 3.8 Max Free** (`baseUrl: 'https://api.tokenrouter.com/v1'`,
  `model: 'qwen/qwen3.8-max-free'`); ключ пресет НЕ заполняет — вводится
  вручную.
- `desktop/src/core/ai/snippet-parse.ts` (новый) + `snippet-parse.test.ts`
  (6 тестов): `parseApiSnippet(text)` — regex-разбор `base_url`/`api_key`/
  `model` из Python-kwargs (`base_url="…"`), JSON (`"base_url": "…"` — учтена
  закрывающая кавычка перед двоеточием) и curl (`Authorization: Bearer …` +
  URL из самого запроса как fallback, если нет явного `base_url=`). Только
  регэкспы — никакого `eval`/`Function`; протестировано на «враждебном»
  тексте с попыткой инъекции кода. `isEmptySnippetResult()` — сигнал для UI
  показать «впиши три поля вручную».
- `App.svelte`: карточка **«Модель по API»** (`data-test="ai-api-card"`) на
  вкладке AI, после «Локальной модели», до «MCP для агентов» (НЕ четвёртая
  вкладка). Переключатель «На этом компьютере» / «По API»
  (`ai-api-mode-local`/`ai-api-mode-api`). В режиме «По API»: пресет-кнопка
  TokenRouter, три поля (URL/ключ `type=password`/id модели —
  `ai-api-url`/`ai-api-key`/`ai-api-model`), кнопка «Проверить»
  (`ai-api-check`) — один `chatCompletion` с коротким ping-сообщением,
  timeout 20с; RU-ошибки: 401 «ключ не принят», 429 «лимит бесплатного
  тарифа исчерпан», сеть/таймаут — «нет связи с сервером»; успех сохраняет
  `aiProvider: { type: 'remote', baseUrl, apiKey, model }` через `saveConfig`
  и делает чат готовым без локального раннера. `<details>` «Вставить пример»
  — textarea (`ai-api-snippet-input`) + «Разобрать»
  (`ai-api-snippet-parse`) вызывает `parseApiSnippet`, заполняет поля (не
  вместо них — можно потом поправить руками), при пустом разборе — RU
  подсказка вписать вручную. `loadProviderSettings()` восстанавливает
  сохранённый remote-конфиг при следующем запуске Desktop.
  `chatReady`/`chatDisabledReason`/`chatBaseUrl`/`chatApiKey`/`chatModelName`
  — `$derived`, переключаются между локальным раннером (как в TZD-62/63) и
  API-режимом по `providerMode`. Верхняя карточка «Чат» показывает баннер
  `data-test="ai-api-privacy"` (сообщения уходят на сервер провайдера, не
  вставлять данные клиентов, бесплатный слот может обрываться), когда режим
  «По API» активен.
- `ChatPanel.svelte`: prop `port` заменён на `baseUrl`+`apiKey` — панель
  больше не завязана на локальный `aiEndpoint(port)`, endpoint резолвит
  родитель. Логика отправки не изменилась (`chatCompletion` + история +
  системный промпт).
- `desktop/docs/AI-PROVIDERS.md`: раздел про TZD-65 в шапке (карточка, RU-
  ошибки, приватность, разница ключей); TokenRouter отмечен как один из
  примеров remote-провайдера, не единственный; заметка про
  `normalizeChatCompletionsUrl`.
- `docs/pages/PAGE-TZ-INDEX.md`: Desktop-строка → TZD-62/63/64/65 DONE.

## Acceptance (из TZ)

- [x] Двойной `/v1` на TokenRouter URL не строится
- [x] Пресет заполняет URL+model; без ключа «Проверить» → понятная RU-ошибка (реальный 401 от сервера → «Ключ не принят»)
- [x] С валидным ключом (ручной smoke PO) чат отвечает, раннер GGUF не нужен — структурно обеспечено (`chatReady`/`chatBaseUrl` не зависят от `aiState`/`port` в режиме API)
- [x] Баннер про чужой сервер виден в режиме API
- [x] Парсер питона из спеки PO заполняет три поля; код не исполняется (только regex, тест на образце TokenRouter Python с ключом `sk-test`)

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0
cd desktop && npx svelte-check --threshold error                        → 395 files, 0 errors, 0 warnings
cd desktop && npx tsx --test src/core/ai/chat-url.test.ts src/core/ai/snippet-parse.test.ts
                                                                          → 11/11 PASS
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/gguf-scan.test.ts src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 25/25 PASS (regression check; TZ acceptance is the two files above)
```

## known_limitation

- Бесплатный TokenRouter нестабилен — это не баг продукта.
- Трансгран ПДн через шлюз — запрещён баннером (`ai-api-privacy`); юр.оценка
  не в этой TZ.
- Живой smoke с реальным ключом не выполнялся в headless-сессии (ключ нельзя
  вставлять в git/среду разработки по требованию самого TZ) — PO/dev должен
  подтвердить вручную: вставить свой ключ TokenRouter → «Проверить» → PASS
  → написать сообщение в чате.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: (см. следующий docs-commit «record TZD-65 SHA»)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop package has no separate lint script; svelte-check + tsc are the gates)
  - checklist: ADDED (`docs/agent-checklists/TZD-65-desktop-openai-compat-api.md`)
  - progress.md: N/A (Desktop TZ track uses `_NOW.md`, not root progress.md)
  - status synchronization: PASS (`_NOW.md`, `docs/pages/PAGE-TZ-INDEX.md`)
