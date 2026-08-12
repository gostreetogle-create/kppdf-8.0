# Паринг веб ↔ десктоп (контракт)

> Документ описывает **контракт связи** между веб-клиентом kppdf и
> десктоп-компаньоном. **TZD-21:** `apiKey` — отдельный desktop pairing key
> (`kppd_…`), не session JWT (~15m).
> **2026-08-11:** после HTTP Basic Auth («подъезд») на nginx pairing key идёт
> в `X-Access-Token`; `Authorization` может быть Basic.

---

## Идея

Веб выдаёт **pairing key** с выбранным TTL; десктоп сохраняет пакет локально
и ходит на API с `X-Access-Token: <apiKey>` (+ опционально Basic для подъезда).

```
[Веб: «Десктоп» → TTL → Выпустить ключ → Скопировать]
        │  JSON { apiBaseUrl, apiKey, username, expiresAt|null }
        ▼
[Десктоп: parsePairing + подъездные поля → app-data]
        │  GET /auth/me  (X-Access-Token + optional Basic)
        ▼
[Подключено → MCP host с теми же заголовками к Nest]
```

## Паринг ≠ mcp.json (TZD-20)

| Что | Куда | Формат |
|-----|------|--------|
| **Паринг-пакет** | карточка «Подключение» Desktop | `{ apiBaseUrl, apiKey, username, expiresAt }` |
| **mcp.json** | Cursor / LM Studio → **локальный** MCP | `mcpServers.kppdf` = url + `Bearer <apiKey>` |

mcp.json Bearer — только до `127.0.0.1` MCP host. До Nest host сам шлёт
`X-Access-Token` (+ Basic из env, если задан).

При 401: проверьте revoke/expiry **и** подъездный пароль → новый ключ / поля подъезда.

## Формат паринг-пакета

```json
{
  "apiBaseUrl": "https://kppdf-crm.ru",
  "apiKey": "kppd_…",
  "username": "ivanov",
  "expiresAt": "2026-09-07T12:00:00.000Z"
}
```

`expiresAt: null` — ключ без срока (`ttl: never`); отзывать вручную.

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `apiBaseUrl` | string | ✅ | Базовый URL сервера |
| `apiKey` | string | ✅ | Opaque pairing key (`kppd_…`), **не** session JWT |
| `username` | string | ✅ | Владелец ключа |
| `expiresAt` | string \| null | ✅ | ISO-8601 или `null` (never) |

Подъездный логин/пароль **не** входят в JSON — вводятся в Desktop отдельно
(тот же, что браузер спрашивает до `/login`).

## API (TZD-21+)

Все под session JWT пользователя (self-service):

| Method | Path | Body / result |
|--------|------|----------------|
| `POST` | `/api/desktop/pairing-keys` | `{ ttl, label?, apiBaseUrl }` → plaintext key **once** + `pairing` packet |
| `GET` | `/api/desktop/pairing-keys` | list **active only**, without secret |
| `POST` | `/api/desktop/pairing-keys/:id/revoke` | **удаляет** ключ (сразу недействителен и исчезает из списка) |
| `POST` | `/api/desktop/pairing` | alias of issue |

TTL presets: `1d` \| `7d` \| `30d` (default) \| `90d` \| `never`.  
Multi-key: до 10 активных; новый **не** отзывает старые.

Auth к Nest: `X-Access-Token: kppd_…` **или** legacy `Authorization: Bearer kppd_…`.
На проде с nginx Basic — только `X-Access-Token` + `Authorization: Basic …`.

## Получение пакета (веб)

1. Хедер → **Десктоп**
2. Выбрать срок (default 30д) / метку → **Выпустить ключ** → сразу **Скопировать** (рядом)
3. Вставить JSON в Desktop; если сайт с подъездом — заполнить подъездные поля
4. Список ключей → **Отозвать** (ключ пропадает из списка)

Новый ключ не отключает старые. Session JWT в пакет **не** кладётся.

## Смена сервера / переподключение

- После revoke/expiry — новый выпуск + повторный paste в Desktop / mcp.json.
- Desktop auto-refresh ключа — out of scope (successor).

## Совместимость версий (TZD-40)

После подключения Desktop читает `GET /api/desktop/compat` (публичный):

```json
{
  "minDesktopVersion": "0.5.0",
  "recommendedDesktopVersion": "0.5.1",
  "downloadUrl": "/downloads/kppdf-desktop-setup.zip",
  "serverBuildId": "…"
}
```

- версия Desktop < `minDesktopVersion` → красный баннер + MCP не стартует;
- `min` ≤ версия < `recommended` → жёлтый баннер, MCP можно;
- ≥ `recommended` → тишина.

Веб-диалог «Подключить десктоп» показывает строку «Актуальная версия Desktop: X (мин. Y)»
рядом с кнопкой «Скачать приложение».

---

_Обновлено: 2026-08-12 · TZD-40 version gate + Basic Auth coexist + revoke deletes_
