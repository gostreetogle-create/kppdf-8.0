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
| PUT | `/api/organizations/:id/assets/:role` | Загрузить логотип/печать/подпись (multipart `file`, TZ-ORG-ASSETS-301) |
| DELETE | `/api/organizations/:id/assets/:role` | Снять файл со слота (TZ-ORG-ASSETS-301) |

Ответ GET: `{ items: Organization[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrganizationFullEditorDialogComponent` | create / edit | `null` / `Organization` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrganizationsService` | `list(params)`, `findById(id)`, `findCurrent()`, `create(payload)`, `update(id, payload)`, `remove(id)`, `putAsset(id, role, file)`, `removeAsset(id, role)` |

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
- Юридический адрес (`legalAddress`) — в «Реквизитах»; печатается в шапке документов
  (TZ-ORG-ASSETS-301).
- Файлы логотипа/печати/подписи — секция «Файлы для документов» (TZ-ORG-ASSETS-301).

## Файлы для документов (TZ-ORG-ASSETS-301)

Три типизированных слота — `logo` · `seal` · `signature`. Слот один на роль:
повторная загрузка **заменяет** файл, прежняя картинка удаляется, истории версий нет.

- Слоты видны только в режиме редактирования: файл привязывается к уже
  существующей организации, поэтому при создании выводится подсказка.
- Загрузка/снятие пишутся **сразу** (multipart PUT / DELETE), а не по «Сохранить» —
  файл нельзя положить в JSON-payload. Поэтому «Отмена» после работы с файлами всё
  равно возвращает обновлённую организацию, иначе список показал бы старое.
- **Печать меняет только admin.** Менеджер видит слот и превью, но вместо кнопок —
  строка «Печать меняет только администратор»; backend отдаёт 403 независимо от UI.
- Загрузка идёт через общий image-pipeline (`imageUploadMulterOptions`): те же 10 МБ и
  тот же список mime, что у `POST /photos/upload`, плюс запись `Photo` для уборки файла.

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
| TZ-ORG-ASSETS-301 | Слоты logo/seal/signature (admin-only печать), `legalAddress` |

---

_Создано: 2026-07-19. Обновлено: 2026-08-08 (TZ-ORG-ASSETS-301)._
