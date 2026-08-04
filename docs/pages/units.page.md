# Страница: Единицы измерения (UnitsPage)

**Краткое описание:** Справочник единиц измерения на `/dictionaries/units`. D1–D2 chrome: PiDictionaryShell (компактный title + sticky tools). CRUD: inline-добавление, toggle active, удаление (isSystem защита).

## Route

```
/dictionaries/units — «KPPDF — Единицы измерения»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/units` | Список (page/limit) |
| POST | `/api/units` | Создать единицу |
| PATCH | `/api/units/:key` | Обновить (isActive toggle) |
| DELETE | `/api/units/:key` | Удалить (кроме isSystem) |

## Chrome

| Компонент | Назначение |
|-----------|-----------|
| `PiDictionaryShell` | title «Единицы измерения» + totalLabel + sticky tools |
| Search input | Поиск по названию или ключу (client-side filter) |
| Category filter | Фильтр по категории (client-side) |
| Inline add row | 4 поля + CTA в tools-баре |

## Dialogs

| Компонент | Режим |
|-----------|-------|
| `AlertDialogComponent` | confirm delete |

## Services

| Сервис | Методы |
|--------|--------|
| `UnitsService` | `list`, `create`, `update`, `remove` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `listRes` | `HttpResource` | GET /api/units |
| `searchQuery` | `Signal<string>` | Поиск |
| `categoryFilter` | `Signal<string>` | Фильтр категории |
| `filteredUnits` | `computed<Unit[]>` | Client-side filter + sort |
| `totalLabel` | `computed<string>` | «N записей» / «N из M записей» |

---

_Создано: 2026-08-04 (TZ-DICT-304)._
