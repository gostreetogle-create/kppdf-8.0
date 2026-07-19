# Шаблон документации страницы

> **Назначение:** Единый формат описания страницы для разработчиков и AI-агентов.
> Каждый файл в `docs/pages/<name>.page.md` описывает одну page-компоненту.
> MCP-сервер (codebase-memory) автоматически индексирует эти файлы при старте.

---

## Страница: `<Название>` (`<ClassName>`)

**Краткое описание:** 1-2 предложения, что делает страница.

### Route

```
<путь> — <title>
```

Пример: `/products` — «KPPDF — Продукция»

### Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| — | — | если нет, указать «(none — всё через сигналы)» |

### API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/<entity>` | Список (пагинация/поиск/сортировка) |
| DELETE | `/api/<entity>/:id` | Удаление |
| ... | ... | ... |

### Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ExampleFormDialogComponent` | create / edit | `null` / `Entity` |
| `AlertDialogComponent` | confirm delete | `{ title, description }` |

### Services

| Сервис | Методы |
|--------|--------|
| `ExampleService` | `list()`, `findById()`, `create()`, `update()`, `remove()` |

### State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `sortKeySig` | `Signal<SortKey\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'\|null>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<Response>` | GET-запрос с авто-refire |

### Computed

| Computed | Назначение |
|----------|-----------|
| `listParams` | Собирает `page`+`search`+`sort` в один объект |
| `data` | `listRes.value()?.items ?? []` |
| `total` | `listRes.value()?.total ?? 0` |
| `loading` | `listRes.isLoading()` |
| `error` | `listRes.error()` → extractErrorMessage |

### Cell templates (pi-table)

| Имя шаблона | Колонка | Назначение |
|-------------|---------|-----------|
| `nameTpl` | `name` | RouterLink на детальную страницу |
| `rowActionsTpl` | (actions) | Edit/Delete кнопки |

### TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-XXX | Первая реализация / миграция |
| TZ-XXX | Фикс багов / улучшение |

### Особенности

- Server-side pagination или client-side?
- Server-side sort или client-side?
- Кастомные format() функции
- Lookup tables (FK-резолв)
- Особенности поведения (сброс page на search, и т.д.)

---

_Создано: YYYY-MM-DD. Последнее обновление: YYYY-MM-DD._
