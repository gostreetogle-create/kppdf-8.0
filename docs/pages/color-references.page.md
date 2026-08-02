# Документация страницы: Справочник «Цвета» (`ColorReferencesPage`)

**Краткое описание:** Справочник RAL/HEX-цветов для товаров и модулей.
Создание, редактирование, активация/деактивация и мягкое удаление цветов.
Системный цвет «Не выбран» (seed) отображается, но заблокирован для
изменений и удаления. Цвет — справочник общего назначения: формы товара
(TZ-PRODUCTS-302) будут использовать его как dropdown + swatch.

TZ: **TZ-PRODUCTS-301** (backend-контракт + UI справочника).

---

## Страница: Цвета (`ColorReferencesPage`)

### Route

```
/color-references — «KPPDF — Цвета»
```

(дочерний route внутри `AppLayout`; гейт — `authGuard` родителя, как у
остальных справочников; мутации защищены на backend `@Roles('admin','manager')`)

### Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| — | — | (none — всё через сигналы; список грузится в конструкторе) |

### API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/color-references` | Список (org-scope: свои + системные; `activeOnly`, `search`) |
| GET | `/api/color-references/:id` | Один цвет |
| POST | `/api/color-references` | Создать (admin/manager) |
| PATCH | `/api/color-references/:id` | Обновить / переименовать (admin/manager) |
| DELETE | `/api/color-references/:id` | Мягкое удаление (admin/manager; 409 для системного) |

### Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ColorReferenceFormDialogComponent` | create / edit | `null` / `ColorReference` |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant }` |

### Services

| Сервис | Методы |
|--------|--------|
| `ColorReferencesService` | `list()`, `findById()`, `create()`, `update()`, `remove()` |

### State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<ColorReference[]>` | Загруженные цвета |
| `loading` | `Signal<boolean>` | Идёт первичная загрузка |
| `error` | `Signal<string\|null>` | Ошибка загрузки |
| `searchQuery` | `Signal<string>` | Поиск по name/slug |

### Computed

| Computed | Назначение |
|----------|-----------|
| `visible` | Отсортированные (sortOrder → name) и отфильтрованные по поиску цвета |

### Контракт backend (TZ-PRODUCTS-301)

- `slug` — стабильный ключ (kebab-lowercase), уникальность скоупирована
  областью (compound unique `{ organizationId, slug }` sparse).
- `organizationId` — **никогда не отправляется с фронтенда**: сервер берёт
  его из `req.user` (IDOR guard). undefined = system-область.
- `hex` — `#RRGGBB`, валидируется `@Matches(/^#[0-9a-fA-F]{6}$/)` (400).
- `deletedAt` — soft delete; удалённые исключены из list/findById.
- `isDefault` — серверный default для форм товара (`resolveDefault` /
  `assertDefaultId`, паттерн TZ-DOC-307/315).
- Системный цвет «Не выбран» (`isSystem: true`, seed-managed, глобальный,
  `isDefault: true`, hex `#9CA3AF`): мутации → 409, UI блокирует действия.
