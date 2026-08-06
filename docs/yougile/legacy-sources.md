# Legacy-источники YouGile на D:

Поиск 2026-08-06 по деревьям kppdf / crm / my-project.

## Рабочее подключение (токен найден и проверен)

| Путь | Содержание |
|------|------------|
| `D:\my-project\backend\routes\yougile.js` | Хардкод `YOUGILE_TOKEN`, base `https://ru.yougile.com/api-v2`, `GET /tasks` |
| `D:\my-project\backend\server.js` | `app.use('/api/yougile', …)` |
| `D:\my-project\frontend\src\app\app.ts` | UI «Мои задачи из YouGile» → `localhost:3000/api/yougile/tasks` |

**Проверка:** Bearer из этого файла → `GET /projects` 200, `GET /tasks` 200 (пагинация).

Значение ключа **не** дублировать в git. Класть только в `.env.local`.

## Nest-интеграция (КП → YouGile), без сохранённого .env

| Путь | Содержание |
|------|------------|
| `D:\crm-generator\backend\src\yougile\yougile.service.ts` | `YOUGILE_BASE = https://yougile.com/api-v2`, env `YOUGILE_TOKEN`, create/delete task |
| `D:\crm-generator\backend\src\yougile\yougile.module.ts` | Nest module |
| `D:\crm-generator\backend\src\proposals\proposals.service.ts` | `sendToYougile` / `removeFromYougile`, env `YOUGILE_COLUMN_ID`, поле `yougileTaskId` |
| `D:\crm-generator-1\backend\src\yougile\` | Зеркало |

В `crm-generator` `.env` с токеном **не найден** (только `.env.example` без YouGile-переменных). Логика кода — эталон для будущего модуля kppdf.

## Упоминания без кода интеграции

| Путь | Заметка |
|------|---------|
| `D:\crmgenerator_nx_01\docs\api\API_FUTURE_CHECKLIST.md` | checklist / future |
| `D:\crmgenerator_nx_02\docs_02\api\API_FUTURE_CHECKLIST.md` | то же |
| `D:\crmgenerator_nx_source\docs\api\API_FUTURE_CHECKLIST.md` | то же |

## Пусто по YouGile

`D:\kppdf-5.0`, `D:\kppdf-6.0`, `D:\kppdf-7.0`, `D:\kppdf-8.0_01`, `D:\kppdf-8.0_02` — совпадений по `yougile` / `YOUGILE` нет (кроме нерелевантного Bearer JWT auth kppdf).
