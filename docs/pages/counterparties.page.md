# Страница: Заказчики (CounterpartiesPage)

**Краткое описание:** Список заказчиков (контрагентов) внутри группы «Клиенты» с полным CRUD. Создание/редактирование — один FullEditor (kind C, 1120).

## Route

```
/counterparties — чип «Заказчики» в группе «Клиенты»
```

## Query params

Нет — всё через сигналы (страница грузит первые 200 записей).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/counterparties` | Список (page/limit/search/role); tenant-scoped, без soft-deleted (TZ-PARTY-301) |
| GET | `/api/counterparty-roles` | Справочник ролей для редактора (TZ-PARTY-303) |
| POST | `/api/counterparties` | Создание; `organizationId` штампует сервер |
| PATCH | `/api/counterparties/:id` | Обновление; правка ИНН снимает `innIsStub` |
| DELETE | `/api/counterparties/:id` | Soft delete (`deletedAt`) |

Ответ GET: `{ items: Counterparty[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `CounterpartyFullEditorDialogComponent` | create / edit | `null` / `Counterparty` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `CounterpartyService` | `list(params)`, `findById(id)`, `listRoles()`, `create(payload)`, `quickCreateParty(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `rows` | `signal<Counterparty[]>` | Текущая выборка (limit 200) |
| `total` | `signal<number>` | Всего заказчиков |
| `stubCount` | `computed<number>` | Сколько записей с временным ИНН |
| `error` | `signal<string \| null>` | Ошибка загрузки списка |

## FullEditor (TZ-PARTY-303)

До этого TZ страница была read-only: заказчик, созданный быстрым созданием (имя + телефон +
адрес, ИНН-заглушка), нельзя было довести до состояния «годен для документа» — реальный ИНН,
КПП/ОГРН, банк и подписант не имели UI.

- Оболочка: `variant="content"` + `maxWidth: min(1120px, calc(100vw - 2rem))` — канон kind C,
  та же, что у организации.
- Секции (`app-pi-form-section`): **Основные** (gold) · **Реквизиты** · **Банк** · **Подписант**.
- **Роли** обязательны (`roles` требует create DTO); список ролей читается из
  `/counterparty-roles`, чтобы добавленная админом роль была выбираема. Если запрос упал —
  fallback на посеянный набор (`customer`, `supplier`, `contractor`, `manufacturer`), чтобы
  менеджер всё равно мог сохранить.
- `organizationId` **не** отправляется с клиента — тенант штампует сервер (TZ-PARTY-301).
- Пустые поля не отправляются (API с `forbidNonWhitelisted`), даты уходят ISO-строкой.
- При правке заказчика с временным ИНН в редакторе висит подсказка: впишите реальный — метка
  снимется (флаг чистит сервер).

## Особенности

- **Бейдж «временный»** — на колонке ИНН, если `innIsStub` (TZ-PARTY-301); в тулбаре счётчик
  «N с временным ИНН».
- **Row actions** — `<app-pi-row-actions>` через `[rowActions]` шаблон pi-table.
- **Удаление** — подтверждение через `AlertDialogComponent`; на сервере soft delete, заказы
  остаются.
- **Объекты (площадки)** — не здесь: карточка заказчика, волна ORDERS-303.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-NAV-301 | Первая (read-only) реализация списка |
| TZ-NAV-302 | Чипы группы «Клиенты» (Заказчики / Люди) |
| TZ-PARTY-301 | Tenant-scope, soft-delete, per-tenant ИНН, бейдж «временный» |
| TZ-PARTY-303 | FullEditor kind C + CRUD со страницы, роли из справочника |

---

_Создано: 2026-08-08 (TZ-PARTY-303)._
