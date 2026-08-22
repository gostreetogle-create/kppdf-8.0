# AI-провайдеры: локальный Ollama и удалённый endpoint

> Как настроить AI для десктоп-компаньона. Абстракция — `desktop/src/core/ai/providers.ts`.
> По умолчанию — локальный Ollama (данные не покидают машину).
>
> Где это в Desktop: вкладка **«AI»** → карточка «Локальная модель». Это не чат —
> модель подсказывает сопоставление колонок на вкладке «Импорт». Порядок всех шагов
> подключения — раздел «С чего начать» в [`INSTALL.md`](./INSTALL.md).

---

## Вариант 1. Локальный Ollama (по умолчанию)

Подходит для офлайн-работы и конфиденциальных данных.

### Установка

```bash
# Windows (winget) или с сайта https://ollama.com/download
winget install Ollama.Ollama
```

### Модель (~7B, Q4 — золотая середина «качество × размер»)

```bash
ollama pull qwen2.5:7b
```

Рекомендации:

| Модель | Размер | Когда |
|---|---|---|
| `qwen2.5:7b` | ~4.7 GB | По умолчанию: хорошее качество на русском |
| `qwen2.5:3b` | ~2 GB | Слабые машины, черновики |
| `llama3.1:8b` | ~4.9 GB | Альтернатива, английские данные чаще |

### Проверка

```bash
ollama serve            # сервер на http://localhost:11434
curl http://localhost:11434/api/tags
```

В конфиге десктопа: `aiProvider = { type: "local-ollama", baseUrl: "http://localhost:11434", model: "qwen2.5:7b" }`.
API-ключ не нужен.

## Вариант 2. Удалённый OpenAI-совместимый endpoint

Любой провайдер с API `/v1/chat/completions`: OpenAI, OpenRouter, Mistral, YandexGPT (OpenAI-режим) и др.

```json
{
  "aiProvider": {
    "type": "remote",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "<ключ>",
    "model": "gpt-4o-mini"
  }
}
```

Десктоп шлёт `POST {baseUrl}/v1/chat/completions` с `Authorization: Bearer <apiKey>` —
тот же контракт, что у Ollama (см. `core/ai/client.ts`).

## Вариант 3 (будущее): Freebuff / Buffy через OpenAI-совместимый шлюз

Заметка: если у команды появится доступ к облачному AI-агенту (Freebuff/Buffy)
с OpenAI-совместимым шлюзом — его можно подключить как обычный remote-провайдер
(вариант 2): тот же `client.ts`, только `baseUrl`/`apiKey`/`model` берутся из
настроек шлюза. Отдельный код не нужен.

## Выбор провайдера

`providers.ts → resolveProvider(config)` возвращает `{ baseUrl, apiKey, model, isRemote }`:

- `isRemote: false` — локальный Ollama: без ключа, не выходит в сеть;
- `isRemote: true` — удалённый: с ключом, нужен интернет.

TODO: `pingProvider()` — проверка доступности (для Ollama `GET /api/tags`),
индикатор состояния в UI.
