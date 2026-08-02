# Страница: Цвета (ColorReferencesPage)

**Краткое описание:** Справочник цветов (RAL) — CRUD-страница для словаря цветов, используемого в RAL-выпадающем списке товара (TZ-PRODUCTS-302).

## Route

```
/dictionaries/color-references — «KPPDF — Цвета»
```

Защита: `authGuard` + `adminOnlyRouteGuard` (admin/manager). Чтение через API доступно и `user`-ролям — RAL-dropdown в диалоге товара открыт каждому авторизованному пользователю (backend `@Roles('user','admin','manager')` на read).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/color-references` | Список (`activeOnly`, `search`) — org-scope + системные |
| GET | `/api/color-references/:id` | Один цвет |
| POST | `/api/color-references` | Создание (admin/manager) |
| PATCH | `/api/color-references/:id` | Обновление (admin/manager; 403 foreign-org, 409 system/дубликат slug) |
| DELETE | `/api/color-references/:id` | Мягкое удаление `deletedAt` (admin/manager; 409 system/default) |

Ответ GET: `ColorReference[]` (массив, не envelope — контракт TZ-DOC-307/315).

## Entity

| Поле | Тип | Назначение |
|------|-----|-----------|
| `name` | string | Название (RAL-код + имя, например «RAL 9003 — Сигнальный белый») |
| `slug` | string | Стабильный ключ (kebab, генерируется из name сервером при пустом) |
| `hex` | string? | Swatch `#RRGGBB` (400 на невалидный) |
| `description` | string? | Описание |
| `isActive` | boolean | Доступен ли в RAL-списке товара |
| `isSystem` | boolean | Seed-цвет («Не выбран») — только чтение |
| `isDefault` | boolean | Цвет по умолчанию для товаров без цвета |
| `deletedAt` | Date? | Soft-delete |
| `organizationId` | ObjectId? | undefined = системный (глобальный) |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ColorReferenceFormDialogComponent` | create / edit / copy | `null` / `ColorReference` / `{...c, _id: undefined}` |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `PiColorReferencesService` | `list({activeOnly, search})` (кэш активного каталога, TZ-DOC-309 паттерн), `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<ColorReference[]>` | Загруженный список |
| `loading` | `Signal<boolean>` | Загрузка |
| `error` | `Signal<string\|null>` | Ошибка загрузки |
| `searchQuery` | `Signal<string>` | Поиск по name/slug |
| `page` | `Signal<number>` | Клиентская пагинация (pageSize=100) |

## Computed

| Computed | Трансформация |
|----------|--------------|
| `visible` | filter (name/slug search) → sort (name, затем slug) → slice по странице |

## Column definitions

`name` (sticky, sortable, cellTemplate: badge «системный» + ★ default) → `slug` (sortable, mono) → `hex` (cellTemplate: swatch-кружок + hex) → `isActive` (cellTemplate: switch, disabled для system) + row actions.

## Row actions (Copy / Edit / Delete)

- **Copy** — открывает create-диалог с префиллом `{...c, _id: undefined}` и суффиксом «(копия)» в name (slug перегенерируется сервером — нет коллизии уникальности).
- **Edit** — не доступен для `isSystem` (409 на бэкенде, UI блокирует заранее).
- **Delete** — не доступен для `isSystem` и для `isDefault` (409); при 409 из бэкенда (используется по умолчанию) — toast-ошибка, строка остаётся.

## Особенности

- **Optimistic toggle**: переключатель isActive флипается локально сразу, при ошибке — rollback + toast.
- **Системный цвет «Не выбран»** (slug `ne_vybran`, hex `#9CA3AF`, isDefault) — seed в `backend/src/common/seed/color-references.seed.ts`, идемпотентный (TZ-DOC-307/315 паттерн; UTF-8 литералы, без CP1251-bug).
- **Soft-delete**: `remove()` ставит `deletedAt` (worker/counterparty паттерн), findAll/findById исключают удалённые.
- **Сервис-кэш**: `list({activeOnly:true})` кэшируется на время жизни приложения и инвалидируется на успешные мутации (TZ-DOC-309 contract).
- Unit test: `color-references.page.spec.ts` + `pi-color-references.service.spec.ts`.

---

_Создано: 2026-08-02 (TZ-PRODUCTS-301)._
