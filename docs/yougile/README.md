# YouGile (UGL) — интеграция с kppdf

> **Статус:** документация + найденный рабочий API-ключ (локально).  
> **Код продукта в kppdf-8.0 пока не подключён** — только docs / env.  
> **Секреты в git не коммитить.**

Синонимы в речи PO: **YouGile / Юджайл / UGL / UGIL**.

## Целевая доска PO (скрин 2026-08-06)

| | |
|---|---|
| Компания (UI) | **СпортИН-ЮГ** |
| Проект | **Разработка ТД** |
| Доска | **Рабочая** (+ вкладка «Сопроводительная») |
| Колонки | На распределении · В работе · Завершены · Приостановлены |
| Карточки | Чертежи … ЗНП …, коды вида `D-49`, `D-64`, … |
| Режим | **только чтение** — карточки/доски в YouGile не трогаем |

### Доступ текущим ключом (legacy `.env.local`)

**Нет.** Ключ из `D:\my-project` видит только:

- проекты **СпортСтройЮг** / **Производство**
- доски **Продажи** / **Новая доска**

Проекта «Разработка ТД», доски «Рабочая» и карточек `D-*` / «Чертежи…» в ответе API **нет**.

### Что сделать PO (ничего на доске менять не нужно)

1. В YouGile убедиться, что активна компания **СпортИН-ЮГ** (как на скрине).
2. Выпустить **API-ключ для этой компании** (API v2 → companies → keys; логин/пароль аккаунта, у которого видна «Разработка ТД»).
3. Передать ключ агенту **или** вписать в `D:\kppdf-8.0\.env.local` как `YOUGILE_TOKEN=…` (файл уже в `.gitignore`).
4. Старый ключ можно оставить или отозвать позже — он к этой доске не относится.

После смены ключа агент проверит read-only: `GET /projects` → есть «Разработка ТД» → boards/columns/tasks с `D-*`.

## Зачем


1. Читать реальные карточки (задачи) вместо фиктивного seed.
2. Позже — двусторонняя связка (как в старом `crm-generator`: КП → задача YouGile).

## API

| | |
|---|---|
| Версия | **REST API v2.0** |
| Base URL (RU) | `https://ru.yougile.com/api-v2` |
| Base URL (alt) | `https://yougile.com/api-v2` |
| Auth | `Authorization: Bearer <API_KEY>` + `Content-Type: application/json` |
| Лимит | ≤ 50 запросов / мин на компанию |
| Docs | https://ru.yougile.com/api-v2 |
| Help | https://help.yougile.com/books/baza-znanii-yougile/page/rest-api-v20-v-yougile |

### Как получить новый ключ

1. `POST /auth/companies` — login + password → `companyId`.
2. `POST /auth/keys` — login + password + `companyId` → ключ.
3. Дальше только Bearer-ключ (логин/пароль в runtime не нужны).

Интерактивная консоль: на странице API v2 у каждого метода.

### Полезные endpoints (чтение)

| Метод | Путь | Заметка |
|-------|------|---------|
| GET | `/projects` | список проектов (`content[]`) |
| GET | `/boards` | доски (`projectId`) |
| GET | `/columns` | колонки (`boardId`) = статусы |
| GET | `/tasks` | задачи; ответ `{ paging, content }`; пагинация `limit`/`offset` |
| GET | `/tasks/{id}` | одна карточка |

Фильтр задач по `projectId` в API **ненадёжен / часто не поддерживается** — фильтруй по `columnId` (или клиентски по доске).

## Env для kppdf

Скопируй [`env.example`](./env.example) в **корневой** `.env.local` (уже в `.gitignore`):

```bash
# D:\kppdf-8.0\.env.local
YOUGILE_TOKEN=<ключ>
YOUGILE_BASE_URL=https://ru.yougile.com/api-v2
# опционально — целевая колонка для будущей записи:
# YOUGILE_COLUMN_ID=<uuid колонки>
```

Проверка (PowerShell, ключ из env):

```powershell
$h = @{ Authorization = "Bearer $env:YOUGILE_TOKEN"; 'Content-Type'='application/json' }
Invoke-RestMethod -Uri "$env:YOUGILE_BASE_URL/projects" -Headers $h
```

## Что видно по найденному ключу (снимок 2026-08-06)

Ключ из legacy `D:\my-project` **живой**: `GET /projects` и `GET /tasks` отвечают 200.

| Тип | Название | ID |
|-----|----------|-----|
| Проект | СпортСтройЮг | `04b60d02-2f8a-4f9d-b561-ca444021c01b` |
| Проект | Производство | `074d0218-2700-4e63-8665-57e0730b3d9f` |
| Доска | Продажи (СпортСтройЮг) | `f0b9ed15-1220-410c-92cf-ef23ec46770e` |
| Доска | Новая доска (Производство) | `9201e4d7-5e62-4723-b66c-320e07fccdb1` |

Колонки «Продажи»: Первое касание → Коммерческое предложение → Ожидание оплаты → ✅ Успешные → ❌ Отказы.  
Колонки «Новая доска»: Проектирование → Снабжение → Готово.

Задач много (`paging.next = true` при limit 50) — подходит как источник реальных данных для seed/маппинга.

> **Не путать** с чатом встроенного ИИ YouGile про проект «Разработка ТД» / доску «Рабочая» — это **другой контекст/компания**. Текущий ключ открывает **СпортСтройЮг / Производство**.

## Legacy-код на диске D: (источник)

Подробности путей: [`legacy-sources.md`](./legacy-sources.md).

Кратко:

| Где | Что |
|-----|-----|
| `D:\my-project\backend\routes\yougile.js` | **Рабочий** Bearer-ключ (хардкод!) + `GET /tasks` |
| `D:\crm-generator\backend\src\yougile\` | Nest `YougileService`: create/delete task через `YOUGILE_TOKEN` |
| `D:\crm-generator-1\...` | Копия той же интеграции |
| `D:\kppdf-5.0` … `8.0_02` | YouGile **не** найден |

Паттерн `crm-generator`: env `YOUGILE_TOKEN` + `YOUGILE_COLUMN_ID`; КП хранит `yougileTaskId`.

## Безопасность

- Ключ в `my-project` лежит **в открытом виде в исходниках** — риск утечки. После переноса в `.env.local` лучше **выпустить новый ключ** в YouGile и отозвать старый (`API → keys`).
- **Никогда** не коммитить токен в `docs/`, `tasks/`, backend code.
- Invite-ссылка (`/invite/...`) **не** даёт API-доступ — только регистрация/логин в UI.

## Следующие шаги (для TZ, не делать в этом PR)

1. Скрипт/модуль read-only: projects → boards → columns → tasks → JSON snapshot.
2. Маппинг карточек «Продажи» → сущности kppdf (КП / заказ / клиент) — отдельное TZ.
3. Опционально: MCP YouGile в Cursor (community servers есть) с ключом из env.

## Связанное

- [`docs/PO-DIARY.md`](../PO-DIARY.md) — намерение PO: реальные карточки вместо фиктивных.
- [`docs/FEATURE-INTEGRATION-CHECKLIST.md`](../FEATURE-INTEGRATION-CHECKLIST.md) — когда появится код модуля.
- OpenHands и прочие: [`docs/openhands-cloud-api.md`](../openhands-cloud-api.md).
