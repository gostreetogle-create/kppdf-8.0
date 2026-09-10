# Страница: Заказчики (CounterpartiesPage)

**Краткое описание:** Список заказчиков (контрагентов) внутри группы «Клиенты» с полным CRUD. Создание/редактирование — один FullEditor (kind C, 1120).

> Ниже описан **legacy** (`frontend/`) FullEditor. NX-версия (`frontend-nx`, TZ-NX-DEALS-D3) — тонкая, см. § «NX thin CRUD (D3)».

## Route

```
/counterparties — чип «Заказчики» в группе «Клиенты»
```

## NX thin CRUD (D3, `frontend-nx`)

Тонкий список + диалог create/edit (`counterparties-list.page.ts` + `counterparty-form-dialog.component.ts`) — **не** портирует legacy FullEditor kind C (секции Основные/Реквизиты/Банк/Подписант, справочник ролей). Поля формы: Название, ИНН, Телефон, Email. `roles` не выбирается в UI — всегда `['customer']` (create) или сохраняется как есть у существующей записи (edit), тот же дефолт, что у backend `quickCreateParty`.

- Список: Название (`shortName` приоритетнее `name`) · ИНН (+ «(временный)» при `innIsStub`) · Контакт (телефон/email) · действия.
- **NX UX sweep (2026-09-09, `TZ-NX-UX-13-counterparties-FIX`):** когда `shortName` задан и
  отличается от `name`, полное юридическое название теперь показывается подписью под коротким
  (`counterparty-full-name`) — раньше было нигде не видно. Приоритет `shortName` для основной
  строки не изменился. См. `docs/audits/2026-09-09-nx-ux-counterparties-audit.md`.
- **NX hub/table parity (2026-09-10, `TZ-NX-HUB-01`):** денсер ряды + колонка ▸/▾, клик по
  строке (или Enter/Space) — single-expand хаб `CounterpartyHubTrayComponent` (мирроит
  `OrderHubTrayComponent`): **Реквизиты** (из уже загруженной строки, без запроса) ·
  **Объекты** (`PiSitesService.list(id)`, до 5) · **Заказы** (`PiOrdersService.list({ counterpartyId })`,
  номер+статус+ссылка `/orders/:id`, чип «Все заказы» → `/orders`) · **КП**
  (`PiQuotationsService.list({ counterpartyId })`, чип «Все КП» → `/proposals`; нет `/proposals/:id`
  route, поэтому строки без ссылки) · **Договоры** (`PiContractsService.list({ counterpartyId })`,
  ссылка `/contracts/:id`, чип «Все договоры» → `/contracts`). Lazy load только при первом
  expand (row-expand-lazy, ≤5 HTTP на один expand). Действия строки — `app-pi-row-actions`
  (edit/delete icon-кнопки, ранее широкие «Изменить»/«Удалить»); `stopPropagation` не даёт
  клику по кнопке тоглить expand. См. `docs/audits/2026-09-10-nx-hub-table-parity-canon.md`.
- Create/Edit — один диалог `CounterpartyFormDialogComponent`; POST/PATCH через `PiCounterpartiesService` (новые методы `create`/`update`/`remove`, добавлены в D3 — раньше клиент был read-only list/getById).
- Delete — `AlertDialogComponent` confirm → `DELETE /counterparties/:id` (soft delete на сервере, как в legacy).
- Nav: пункт «Заказчики» в категории «Клиенты» (`nav-categories.ts`) уже существовал, но был скрыт фильтром «route не существует» — с этим TZ роут появился, пункт нав появляется автоматически (без правок nav-categories.ts).
- Не портировано (сознательно, per TZ «НЕ»): полный EAV-редактор, справочник ролей, банковские/подписант поля, `/desk`. Объекты (площадки) теперь видны **read-only** в hub-блоке (TZ-NX-HUB-01) — полный CRUD площадок всё ещё не здесь.

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
- **Почта** (TZ-MIG-304) — поле «Почта» в секции «Основные» рядом с телефоном; корпоративный
  адрес фирмы (`Counterparty.email`), отдельно от контактного лица (`Person.email`).
- `organizationId` **не** отправляется с клиента — тенант штампует сервер (TZ-PARTY-301).
- Пустые поля не отправляются (API с `forbidNonWhitelisted`), даты уходят ISO-строкой.
- При правке заказчика с временным ИНН в редакторе висит подсказка: впишите реальный — метка
  снимется (флаг чистит сервер).

## Особенности

- **Бейдж «временный»** — на колонке ИНН, если `innIsStub` (TZ-PARTY-301); в тулбаре счётчик
  «N с временным ИНН».
- **Row actions** — `<app-pi-row-actions>` напрямую в ряду (hand-rolled grid, не `pi-table`
  `[rowActions]` шаблон — список не мигрировал на `app-pi-table`, TZ-NX-HUB-01).
- **Удаление** — подтверждение через `AlertDialogComponent`; на сервере soft delete, заказы
  остаются.
- **Объекты (площадки)** — read-only список в hub-блоке (TZ-NX-HUB-01, до 5 строк); полный
  CRUD площадок всё ещё не на этой странице.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-NAV-301 | Первая (read-only) реализация списка |
| TZ-NAV-302 | Чипы группы «Клиенты» (Заказчики / Люди) |
| TZ-PARTY-301 | Tenant-scope, soft-delete, per-tenant ИНН, бейдж «временный» |
| TZ-PARTY-303 | FullEditor kind C + CRUD со страницы, роли из справочника |
| TZ-NX-HUB-01 | Hub expand (`CounterpartyHubTrayComponent`) + denser table + `app-pi-row-actions` icons |

---

_Создано: 2026-08-08 (TZ-PARTY-303)._
