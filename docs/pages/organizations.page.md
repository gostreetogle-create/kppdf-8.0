# Страница: Организации (OrganizationsPage)

**Краткое описание:** Справочник организаций (юр. лица и ИП) с серверной пагинацией, поиском и клиентской сортировкой текущей страницы. Создание/редактирование — один FullEditor (kind C, 1120).

## Route

```
/organizations — «KPPDF — Организации»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/organizations` | Список (page/limit/search); tenant-scoped (TZ-PARTY-301) |
| GET | `/api/organizations/current` | «Наша фирма» для документов (TZ-PARTY-301) |
| POST | `/api/organizations` | Создание |
| PATCH | `/api/organizations/:id` | Обновление |
| DELETE | `/api/organizations/:id` | Soft delete (`deletedAt`) |

Ответ GET: `{ items: Organization[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrganizationFullEditorDialogComponent` | create / edit | `null` / `Organization` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrganizationsService` | `list(params)`, `findById(id)`, `findCurrent()`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `SearchState` | Debounced поиск (300ms) |
| `page` | `signal<number>` | Серверная пагинация (50) |
| `listRes` | `HttpResource<OrganizationsListResponse>` | GET /api/organizations |

## FullEditor (TZ-PARTY-302)

Один write-path: и «+ Создать», и «Редактировать» открывают
`OrganizationFullEditorDialogComponent`. Старый узкий диалог на 7 полей удалён —
реквизиты для документов (банк, ОГРН, подписант) были недоступны из UI.

- Оболочка: `variant="content"` + `maxWidth: min(1120px, calc(100vw - 2rem))` — канон
  material/product (kind C).
- Секции (`app-pi-form-section`): **Основные** (gold) · **Реквизиты** · **Банк** ·
  **Подписант** · **Паспорт ИП**.
- **Паспорт ИП** появляется только при `legalType = ip` (у ООО это шум), и паспортные
  поля не отправляются, если тип не ИП.
- Юридический тип — `app-pi-overflow-select` (канон каталожного dropdown), не native select.
- «Наша фирма» (`isOurCompany`) и «Активна» — `app-pi-switch`.
- API работает с `forbidNonWhitelisted`, поэтому пустые поля **не** отправляются, а не
  пишутся пустыми строками; даты уходят ISO-строкой.
- Файлы логотипа/печати — не здесь: типизированное хранилище = `TZ-ORG-ASSETS-301`.

## Особенности

- **Server-side pagination** — backend возвращает `{ items, total, page, limit }`
- **Client-side sort** — только текущая страница; в UI есть явная disclosure-строка
- **Row actions** — `<app-pi-row-actions>` через `[rowActions]` шаблон pi-table
- **Типы организаций** — badge-массив (`row.type`)
- **Бейдж «наша фирма»** — на колонке названия, если `isOurCompany` (TZ-PARTY-302)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-83 | Первая реализация |
| TZ-117 | httpResource миграция |
| TZ-104.3 | Миграция на `<app-pi-table>` |
| TZ-PARTY-301 | Tenant-scope, soft-delete, `isOurCompany`, `GET /current` |
| TZ-PARTY-302 | FullEditor kind C: все реквизиты, паспорт ИП, бейдж «наша фирма» |

---

_Создано: 2026-07-19. Обновлено: 2026-08-08 (TZ-PARTY-302)._
