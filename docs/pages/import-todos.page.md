# Страница: Задачи импорта (ImportTodosPage)

**Краткое описание:** Тонкий список задач менеджеру «что доделать после импорта»
(TZD-29). Агент создаёт todo через MCP (`kppdf_import_todo_create`) — например
«Проверить сомнительные строки» или «Доделать шаблон {name}» с href — а менеджер
видит и закрывает их здесь. Не email/push; нет Gantt/CRM.

## Route

```
/import-todos — «KPPDF — Задачи импорта»
```

## Query params

Нет — всё через сигналы (statusFilter = 'open' по умолчанию).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/import-todos` | Список (items + total + page + limit) |
| POST | `/api/import-todos` | Создание todo (MCP/агент) |
| PATCH | `/api/import-todos/:id` | Смена status open→done (кнопка «Готово») |

RBAC: `admin | manager` (как import-tasks).

## Dialogs

Нет.

## Services

| Сервис | Методы |
|--------|--------|
| (нет отдельного сервиса) | Страница напрямую: `httpResource` GET + `silentPatch` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `statusFilter` | `Signal<'all'\|'open'\|'done'>` | Фильтр списка (default 'open') |
| `listRes` | `HttpResource<ImportTodoListResponse>` | GET /api/import-todos |
| `items` | `Computed<ImportTodo[]>` | `value()?.items ?? []` |
| `filtered` | `Computed<ImportTodo[]>` | По `statusFilter` |
| `loading` / `error` | `Computed` | Загрузка / extractErrorMessage |

## Особенности

- **Chrome:** `PiGroupWorkspaceComponent` (pathLabel «Документы», пустые chips —
  страница в nav-категории Документы рядом с Конструктором).
- **Фильтры:** Все / Открытые / Выполненные (чипы-кнопки в tools-слоте).
- **«Готово»:** PATCH `{ status: 'done' }` → toast + reload; done-строка
  перечёркнута и полупрозрачна.
- **href:** если у todo есть ссылка — иконка «открыть» (ExternalLink).
- Дата форматируется `DatePipe` (`dd.MM.yyyy HH:mm`, `DatePipe` импортирован
  из `@angular/common`).

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZD-29 | Создание страницы + route + nav + seed page (admin/manager) |

---

_Создано: 2026-08-08 (TZD-29)._
