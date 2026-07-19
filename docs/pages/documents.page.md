# Страница: Сформированные документы (DocumentsPage)

**Краткое описание:** Журнал сгенерированных документов. Поиск, фильтр по периоду, просмотр HTML, удаление.

## Route

```
/doc-constructor/documents — «KPPDF — Сформированные документы»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/generated-documents` | Список сгенерированных документов |
| GET | `/api/generated-documents/:id/html` | Открыть HTML-предпросмотр |
| DELETE | `/api/generated-documents/:id` | Удалить документ |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `GeneratedDocumentsService` | `list()`, `findById(id)`, `openHtml(id)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<GeneratedDocument[]>` | Список (через RxJS subscribe) |
| `searchQuery` | `Signal<string>` | Поиск по номеру/названию |
| `periodMonth` | `Signal<string>` | Фильтр по месяцу (YYYY-MM) |
| `pageIndex` | `Signal<number>` | Пагинация (10 на страницу) |

## Особенности

- **Inline `<table>`** — НЕ pi-table, кастомная
- **Period filter** — `<input type="month">` для фильтрации по дате
- **Client-side pagination** — pageSize = 10
- **Status dots** — cool (final) / warm (draft)
- **"Открыть" action** — вызывает `openHtml()` (загружает HTML предпросмотр)
- **RxJS subscription** — manual subscribe с sort по createdAt desc

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase B) |

---

_Создано: 2026-07-19._
