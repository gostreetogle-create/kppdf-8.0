# OpenHands Cloud API — подключение и делегирование задач для AI-агентов

> **Назначение документа.** Дать любому AI-агенту (Buffy, другой ассистент, скрипт)
> полную, проверенную на практике инструкцию, как подключиться к **OpenHands Cloud**
> (облачная версия OpenHands, `app.all-hands.dev`), создавать беседы, давать задачи
> и забирать результаты через REST API v1.
>
> Документ написан по итогам реальной сессии (2026-08-01): ключ проверен, беседа
> создана, задача выполнена агентом, события получены — все шаги ниже **работают**.
>
> **⚠️ Ключ API в этом документе НЕ хранится.** Ключ должен передаваться отдельно
> (переменная окружения `OPENHANDS_CLOUD_API_KEY` или запрос у пользователя).
> Никогда не коммить ключ в репозиторий.

---

## 1. Что такое OpenHands Cloud

OpenHands Cloud — хостинговая версия OpenHands. Позволяет через REST API:
- создавать **беседы** (`app-conversations`) с произвольным заданием (initial_message);
- опционально привязывать репозиторий (`selected_repository: "owner/repo"`);
- отслеживать статус запуска (start-task) и статус исполнения;
- читать поток **событий** (действия, наблюдения, сообщения ассистента).

Внутри беседы работает агент `openhands` (модель по умолчанию
`openhands/minimax-m2.7`) с инструментами `terminal`, `file_editor`,
`task_tracker`, `browser_tool_set`.

---

## 2. Конфигурация подключения

| Параметр | Значение |
|---|---|
| **Base URL** | `https://app.all-hands.dev/api/v1/` |
| **Auth header** | `Authorization: Bearer <OPENHANDS_CLOUD_API_KEY>` |
| **Content-Type** (для POST) | `application/json` |
| **Формат задания** | `initial_message.content[]` — массив, `{ "type": "text", "text": "..." }` |
| **Модель по умолчанию** | `openhands/minimax-m2.7` |

**Где взять ключ:** войти в [app.all-hands.dev](https://app.all-hands.dev) →
**Settings → API Keys** → **Create API Key**. Ключ выглядит как `sk-oh-...`.

**Проверка ключа (endpoint `/users/me`):**

```bash
curl -sS -X GET "https://app.all-hands.dev/api/v1/users/me" \
  -H "Authorization: Bearer $OPENHANDS_CLOUD_API_KEY"
```

Успех = `HTTP 200` + JSON профиля пользователя (поля `email`, `org_id`, `role`,
`v1_enabled: true`). Ошибка `401` = неверный/просроченный ключ.

---

## 3. Endpoints (проверены 2026-08-01)

| Метод | Path | Назначение |
|---|---|---|
| `GET` | `/users/me` | Проверка авторизации, профиль пользователя |
| `POST` | `/app-conversations` | Создать беседу (асинхронно). Возвращает **start-task** |
| `GET` | `/app-conversations/start-tasks?ids={start_task_id}` | Поллинг запуска → `status: READY` + `app_conversation_id` |
| `GET` | `/app-conversations?ids={conversation_id}` | Статус беседы (`execution_status`: `running` / `finished` / `error`), метрики, title |
| `GET` | `/conversation/{app_conversation_id}/events/search?limit=N` | Поток событий беседы |

---

## 4. Полный рабочий процесс (7 шагов)

### ШАГ 1 — Проверка ключа
`GET /users/me` (см. выше). Ожидаем `HTTP 200`.

### ШАГ 2 — Создание беседы

```bash
cat > /tmp/oh_task.json << 'EOF'
{"initial_message": {"content": [{"type": "text", "text": "Твоё задание здесь"}]}}
EOF

curl -sS -X POST "https://app.all-hands.dev/api/v1/app-conversations" \
  -H "Authorization: Bearer $OPENHANDS_CLOUD_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/oh_task.json
```

**Ответ (HTTP 200):**
```json
{
  "id": "19d3173b1a6547ffad680cb4e86afb6e",   // ← start_task_id (для поллинга)
  "status": "WORKING",                        // WORKING / WAITING_FOR_SANDBOX / ...
  "app_conversation_id": null,                // ← заполнится после READY
  "sandbox_id": null,
  ...
}
```

> **⚠️ ГРАБЛИ №1 — НЕ передавай JSON инлайн в `-d '...'` с кириллицей.**
> В shell это даёт `HTTP 400 {"detail":"There was an error parsing the body"}`
> из-за экранирования/кодировки. Всегда пиши JSON в файл и используй `-d @файл`.

### ШАГ 3 — Поллинг start-task до READY

```bash
START_TASK_ID="19d3173b1a6547ffad680cb4e86afb6e"

for i in $(seq 1 30); do
  R=$(curl -sS "https://app.all-hands.dev/api/v1/app-conversations/start-tasks?ids=$START_TASK_ID" \
       -H "Authorization: Bearer $OPENHANDS_CLOUD_API_KEY")
  STATUS=$(echo "$R" | grep -o '"status":"[A-Z_]*"' | head -1)
  echo "poll $i: $STATUS"
  echo "$R" | grep -q '"status":"READY"' && break
  echo "$R" | grep -q '"status":"ERROR"' && break
  sleep 8
done
```

Статусы: `WORKING` → `WAITING_FOR_SANDBOX` → `PREPARING_REPOSITORY` → `READY`
(или `ERROR`). На практике READY наступает за **~25–30 секунд**.
После READY из ответа берём `app_conversation_id` (и `agent_server_url`).

### ШАГ 4 — Статус беседы (пока работает)

```bash
curl -sS "https://app.all-hands.dev/api/v1/app-conversations?ids=$CONVERSATION_ID" \
  -H "Authorization: Bearer $OPENHANDS_CLOUD_API_KEY"
```

Ключевые поля: `title` (автогенерация, напр. «✨ Create Hello World Python script»),
`execution_status` (`running` → `finished`), `metrics.accumulated_token_usage`,
`metrics.accumulated_cost`, `sandbox_status`, `tags.archiveworkspacepath`.

### ШАГ 5 — Чтение событий (опрос каждые 5–10 сек)

```bash
curl -sS "https://app.all-hands.dev/api/v1/conversation/$CONVERSATION_ID/events/search?limit=50" \
  -H "Authorization: Bearer $OPENHANDS_CLOUD_API_KEY"
```

### ШАГ 6 — Когда задача завершена
Критерий готовности: `execution_status == "finished"` из ШАГ 4
(либо последнее событие с `source == "environment"`, либо событие
`ConversationStateUpdateEvent` с `key: "execution_status"`).

### ШАГ 7 — Разбор ответа ассистента
Ответы и действия агента — в событиях (см. таблицу ниже).

---

## 5. События: как читать поток

| `kind` | `source` | Что это |
|---|---|---|
| `MessageEvent` | `user` | Входное сообщение (задание) |
| `MessageEvent` | `assistant` | **Сообщение-ответ ассистента** (`llm_message.content[].text`) |
| `ActionEvent` | `agent` | Действие агента: `tool_name` (`file_editor`, `terminal`, …), `action.command`, `action.path`, `action.file_text` |
| `ObservationEvent` | `environment` | **Результат действия**: `observation.content[].text`, `observation.is_error`, `observation.new_content` |
| `StreamingDeltaEvent` | `agent` | Стриминг ответа по кускам (`content`) + `<think>`-рассуждения |
| `ConversationStateUpdateEvent` | `environment` | Служебные обновления: `key` = `execution_status` / `stats` / `last_user_message_id` |
| `SystemPromptEvent` | `agent` | Системный промпт беседы (настройки, инструменты, skills) |

**Практика:** для «что агент сделал» фильтруй `ActionEvent`+`ObservationEvent`;
для «что агент ответил» собирай `StreamingDeltaEvent` воедино или бери итоговый
`MessageEvent` от `assistant`.

---

## 6. Готовые сниппеты

### 6.1 Bash — полный цикл (создать → дождаться → читать события)

```bash
#!/usr/bin/env bash
set -euo pipefail

KEY="${OPENHANDS_CLOUD_API_KEY:?задай OPENHANDS_CLOUD_API_KEY}"
BASE="https://app.all-hands.dev/api/v1"
TASK_TEXT="Привет! Напиши Hello World на Python в файл test.py"

# 1. Проверка ключа
curl -sS -o /dev/null -w "auth HTTP %{http_code}\n" \
  -H "Authorization: Bearer $KEY" "$BASE/users/me"

# 2. Создание беседы (JSON — через файл!)
printf '{"initial_message":{"content":[{"type":"text","text":"%s"}]}}' "$TASK_TEXT" > /tmp/oh_task.json
RESP=$(curl -sS -X POST "$BASE/app-conversations" \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d @/tmp/oh_task.json)
echo "$RESP"
START_TASK_ID=$(echo "$RESP" | grep -o '"id":"[a-f0-9]*"' | head -1 | cut -d'"' -f4)

# 3. Поллинг до READY
for i in $(seq 1 30); do
  R=$(curl -sS "$BASE/app-conversations/start-tasks?ids=$START_TASK_ID" -H "Authorization: Bearer $KEY")
  echo "$R" | grep -q '"status":"READY"' && break
  echo "$R" | grep -q '"status":"ERROR"' && { echo "START ERROR"; exit 1; }
  sleep 8
done
CONV_ID=$(echo "$R" | grep -o '"app_conversation_id":"[a-f0-9]*"' | cut -d'"' -f4)
echo "conversation_id: $CONV_ID"

# 4. Ожидание finished
for i in $(seq 1 60); do
  S=$(curl -sS "$BASE/app-conversations?ids=$CONV_ID" -H "Authorization: Bearer $KEY")
  echo "$S" | grep -q '"execution_status":"finished"' && break
  sleep 10
done

# 5. События
curl -sS "$BASE/conversation/$CONV_ID/events/search?limit=50" -H "Authorization: Bearer $KEY"
```

### 6.2 Python (`requests`) — полный цикл

```python
import time
import requests

API_KEY = "sk-oh-..."          # из OPENHANDS_CLOUD_API_KEY, НЕ хардкодь в репо
BASE_URL = "https://app.all-hands.dev/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# 1. Проверка ключа
r = requests.get(f"{BASE_URL}/users/me", headers=headers)
r.raise_for_status()
print("auth OK:", r.json().get("email"))

# 2. Создать беседу
resp = requests.post(
    f"{BASE_URL}/app-conversations",
    headers=headers,
    json={"initial_message": {"content": [{"type": "text", "text": "Напиши Hello World в test.py"}]}},
)
resp.raise_for_status()
data = resp.json()
print("create:", data)
start_task_id = data["id"]

# 3. Дождаться READY (появляется app_conversation_id)
conv_id = None
for _ in range(30):
    task = requests.get(f"{BASE_URL}/app-conversations/start-tasks?ids={start_task_id}", headers=headers).json()
    if isinstance(task, list):
        task = task[0]
    if task.get("status") == "READY":
        conv_id = task.get("app_conversation_id")
        break
    if task.get("status") == "ERROR":
        raise RuntimeError(f"start error: {task.get('detail')}")
    time.sleep(8)
if not conv_id:
    raise RuntimeError("conversation did not become READY in time")

# 4. Ждать finished
for _ in range(60):
    st = requests.get(f"{BASE_URL}/app-conversations?ids={conv_id}", headers=headers).json()
    if isinstance(st, list):
        st = st[0]
    if st.get("execution_status") == "finished":
        print("title:", st.get("title"))
        print("cost:", st.get("metrics", {}).get("accumulated_cost"))
        break
    time.sleep(10)

# 5. События
events = requests.get(
    f"{BASE_URL}/conversation/{conv_id}/events/search?limit=50", headers=headers
).json()
for e in events.get("items", []):
    if e.get("kind") == "MessageEvent" and e.get("source") == "assistant":
        msg = e.get("llm_message", {}).get("content", [])
        print("OpenHands:", "".join(c.get("text", "") for c in msg if c.get("type") == "text"))
    elif e.get("kind") == "ActionEvent":
        print("action:", e.get("tool_name"), e.get("action", {}).get("command"), e.get("action", {}).get("path"))
    elif e.get("kind") == "ObservationEvent":
        obs = e.get("observation", {})
        print("obs:", obs.get("kind"), obs.get("content", [{}])[0].get("text"))
```

> **⚠️ ГРАБЛИ №2 — путь `/tmp/` на Windows (git-bash).**
> В git-bash `curl` понимает `/tmp/...`, а нативный Python (Windows) — **нет**
> (`FileNotFoundError`). Если скрипт использует файлы, пиши их в локальный каталог
> проекта или используй `tempfile`/относительные пути.

---

## 7. Агент: имя и полное описание (для делегирования задач)

### Имя агента
**`openhands-cloud`** — «OpenHands Cloud Agent».

### Краткое описание (для других AI-агентов)
> Отправляет задачу во внешний облачный AI-агент OpenHands (app.all-hands.dev)
> через REST API v1, дожидается выполнения и возвращает итог. Используется, когда
> нужен **свежий контекст** (отдельная беседа), **длинная фоновая работа** или
> **делегирование** задачи другому исполнителю без переноса текущего диалога.

### Возможности
- Создание изолированной беседы с произвольным заданием (одно сообщение).
- Опциональная привязка репозитория `selected_repository: "owner/repo"` (+ `selected_branch`).
- Поллинг запуска и исполнения до `finished` / `error`.
- Чтение полного потока событий: действия (`terminal`, `file_editor`,
  `browser_tool_set`, `task_tracker`), результаты, ответы ассистента.
- Получение метрик: токены, стоимость, title.

### Ограничения
- Беседа стартует **асинхронно**: нужен поллинг (READY ~25–30 c).
- Нет прямого интерактивного чата: одно задание → поток событий → результат.
- Контекст беседы изолирован: она не знает текущего диалога, поэтому задание
  должно быть **самодостаточным** (см. шаблон ниже).
- Модель/инструменты — настройки аккаунта OpenHands Cloud, не контролируются из задания.

---

## 8. Шаблон задания (initial_message) для делегирования

Задание должно быть самодостаточным: репозиторий, ветка, объём, ограничения,
критерии, формат отчёта.

```
Repository: owner/repo (ветка: main)
Текущий статус: <что уже сделано / известные блокеры>
Область работ (точные файлы/папки):
  - <путь 1>
  - <путь 2>
Что НЕ трогать: <файлы вне зоны>
Задача: <что сделать, 2–5 шагов>
Проверка: <какие команды/тесты прогнать, ожидаемые критерии>
Формат ответа: <краткий отчёт: что сделано, файлы, результаты проверок>
```

Пример (проверенный 2026-08-01):
```json
{
  "initial_message": {
    "content": [{"type": "text", "text": "Привет! Напиши Hello World на Python в файл test.py"}]
  },
  "selected_repository": "owner/repo"
}
```

---

## 9. Доказательство работоспособности (сессия 2026-08-01)

| Этап | Результат |
|---|---|
| `GET /users/me` | `HTTP 200`, владелец org `user_7f6bdf70-…_org`, `v1_enabled: true` |
| `POST /app-conversations` | `HTTP 200`, start_task `19d3173b1a6547ffad680cb4e86afb6e`, status `WORKING` |
| Поллинг start-task | `WAITING_FOR_SANDBOX` → **`READY`** за ~26 c, conv_id `0809542b93db487d84a75af8b5804a04` |
| События | `ActionEvent` (`file_editor create /workspace/project/test.py`), `ObservationEvent` («File created successfully»), ответ ассистента «Готово! Файл test.py создан…» |
| `GET /app-conversations?ids=` | `execution_status: finished`, title «✨ Create Hello World Python script», cost `$0.00` |

---

## 10. Безопасность

- **Ключ НЕ хранить в репозитории.** Задавать через переменную окружения
  `OPENHANDS_CLOUD_API_KEY` или получать от пользователя в момент работы.
- В ответах API секреты маскируются (`**********`) — это нормально.
- Не выводить ключ в логи/отчёты; при передаче другому агенту — только по ссылке на
  секрет или по явному согласию пользователя.
- Все операции API в этой сессии были **read/create-only** (создание тестовой
  беседы), никаких destructive-действий.

---

## 11. Ссылки

- Веб-интерфейс: https://app.all-hands.dev
- Ключи API: app.all-hands.dev → Settings → API Keys
- Документация OpenHands Cloud: https://docs.openhands.dev/openhands/usage/cloud
- Этот файл: `docs/openhands-cloud-api.md`
