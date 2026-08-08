# Паринг веб ↔ десктоп (контракт)

> Документ описывает **контракт связи** между веб-клиентом kppdf и
> десктоп-компаньоном. **TZD-21:** `apiKey` — отдельный desktop pairing key
> (`kppd_…`), не session JWT (~15m).

---

## Идея

Веб выдаёт **pairing key** с выбранным TTL; десктоп сохраняет пакет локально
и ходит на API с `Authorization: Bearer <apiKey>`.

```
[Веб: «Десктоп» → TTL → Выпустить ключ]
        │  JSON { apiBaseUrl, apiKey, username, expiresAt|null }
        ▼
[Десктоп: parsePairing → app-data]
        │  GET /auth/me
        ▼
[Подключено]
```

## Паринг ≠ mcp.json (TZD-20)

| Что | Куда | Формат |
|-----|------|--------|
| **Паринг-пакет** | карточка «Подключение» Desktop | `{ apiBaseUrl, apiKey, username, expiresAt }` |
| **mcp.json** | Cursor / LM Studio | `mcpServers.kppdf` = url + `Bearer <apiKey>` |

При 401: проверьте revoke/expiry → выпустите новый ключ → снова mcp.json.

## Формат паринг-пакета

```json
{
  "apiBaseUrl": "https://app.kppdf.ru",
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

## API (TZD-21)

Все под session JWT пользователя (self-service):

| Method | Path | Body / result |
|--------|------|----------------|
| `POST` | `/api/desktop/pairing-keys` | `{ ttl, label?, apiBaseUrl }` → plaintext key **once** + `pairing` packet |
| `GET` | `/api/desktop/pairing-keys` | list **without** secret (prefix, label, dates) |
| `POST` | `/api/desktop/pairing-keys/:id/revoke` | revoke one key |
| `POST` | `/api/desktop/pairing` | alias of issue |

TTL presets: `1d` \| `7d` \| `30d` (default) \| `90d` \| `never`.  
Multi-key: до 10 активных; новый **не** отзывает старые.

Auth: Bearer `kppd_…` принимается тем же `JwtAuthGuard` (lookup hash); иначе JWT.

## Получение пакета (веб)

1. Хедер → **Десктоп**
2. Выбрать срок (default 30д) / метку → **Выпустить ключ**
3. **Скопировать** JSON → вставить в Desktop
4. Список ключей в том же диалоге → **Отозвать**

Новый ключ не отключает старые. Session JWT в пакет **не** кладётся.

## Смена сервера / переподключение

- После revoke/expiry — новый выпуск + повторный paste в Desktop / mcp.json.
- Desktop auto-refresh ключа — out of scope (successor).

---

_Обновлено: 2026-08-08 · TZD-21_
