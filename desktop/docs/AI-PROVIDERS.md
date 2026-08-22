# AI-провайдеры: локальный Ollama и удалённый endpoint

> Как настроить AI для десктоп-компаньона. Абстракция — `desktop/src/core/ai/providers.ts`.
> По умолчанию — локальный Ollama (данные не покидают машину).
>
> Где это в Desktop: вкладка **«AI»** = чат + модель. Встроенный движок —
> `node-llama-cpp` + `.gguf` в `app-data/models` (не Ollama, канон:
> `docs/superpowers/specs/2026-08-22-desktop-local-ai-onboarding.md`). «Открыть
> чат» (TZD-62) — один клик, если файл модели уже на диске: раннер стартует
> сам и модель грузится в память без «Перезапустить». Папка моделей принимает
> **любой** `.gguf` (TZD-63) — не только три модели из каталога скачивания:
> скопируйте файл с флешки и нажмите «Обновить список» (`core/gguf-scan.ts`
> отсеивает мусор по размеру 200 МБ…20 ГБ и magic-байтам `GGUF`). «Скачать
> модель» тоже не требует раньше жать «Запустить»/«Перезапустить» — раннер
> поднимается сам, если ещё не работает, и сразу перезагружается с новым
> файлом. Модель подсказывает сопоставление колонок на вкладке «Импорт» и
> отвечает в чате — LIMITED_HELPER, без записи в базу из чата (TZD-64). Ниже
> на этой же вкладке — отдельный блок «MCP для агентов»: для внешних клиентов
> (Cursor, LM Studio), не для этого чата. Порядок всех шагов подключения —
> раздел «С чего начать» в [`INSTALL.md`](./INSTALL.md).
>
> Разделы ниже (Ollama / удалённый endpoint) описывают отдельную абстракцию
> `providers.ts` для remote-провайдеров — не встроенный чат-раннер выше.

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
