# Страница: Реестр шаблонов (TemplatesPage)

**Краткое описание:** **Единственный реестр CRUD для шаблонов документов.** Создание, дублирование, активация/деактивация, переход в конструктор. Builder — только editor (см. TZ-DOC-324 IA-refactor).

## Route

```
/doc-constructor/templates                          — «KPPDF — Реестр шаблонов» (single source of CRUD)
/doc-constructor/builder                           — редирект на /templates (TZ-DOC-324)
/doc-constructor/builder/:id                       — только редактор (CRUD = здесь)
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/document-templates?categoryId=` | Список шаблонов (фильтр по категории через `categoryId`) |
| POST | `/api/document-templates` | Создать шаблон |
| PATCH | `/api/document-templates/:id` | Обновить (isActive) |
| DELETE | `/api/document-templates/:id` | Удалить |
| POST | `/api/document-templates/:id/duplicate` | Дублировать |
| POST | `/api/document-templates/:id/set-default` | Сделать шаблоном по умолчанию |
| GET | `/api/organizations?limit=1` | Получить первую организацию (для создания) |
| GET | `/api/doc-types` | Список типов документов |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant }` |
| `TemplateSetupDialogComponent` | create / duplicate | `{ mode: 'create' \| 'duplicate' }` — create: `{ pageSize, orientation, categoryId }`; duplicate: `{ pageSize, orientation }` (category с source). Dialog canon: [`docs/DIALOG-COOKBOOK.md`](../DIALOG-COOKBOOK.md) |

## Services

| Сервис | Методы |
|--------|--------|
| `DocumentTemplatesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `duplicate(id)` |
| `DocumentTemplateCategoriesService` | `list({ activeOnly })`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<DocumentTemplate[]>` | Список (через RxJS subscribe) |
| `searchQuery` | `Signal<string>` | Поиск (мгновенный) |
| `pageIndex` | `Signal<number>` | Пагинация (0-indexed) |
| `creating` | `Signal<boolean>` | Флаг создания |
| `loading` | `Signal<boolean>` | Флаг загрузки |
| `categoryId` | `Signal<string \| null>` | Фильтр реестра по категории шаблона |

## Особенности

- **`app-pi-table`** — shared Flat kit with typed columns, status/default cell templates, row actions and client-side page navigation
- **Client-side pagination** — pageSize = 10
- **Create flow** — ensureOrg (INN `7707083893`) + docType → POST create (`pageSize` A3\|A4\|A5, **`isActive: true`**) → navigate to builder
- **Duplicate** — setup (без category) → POST /duplicate → PATCH pageSize/orientation → navigate to builder
- **isActive switch** — optimistic update + rollback on PATCH error
- **Default star** — ★ только смысл «по умолчанию»; ☆ set-default **только если isActive**; иначе toast / muted ☆
- **Doc type resolution** — `docTypeName()`: populated object or '—'
- **RxJS subscription** — manual subscribe (не httpResource)
- **Category column** — отображает имя категории (populated `categoryId`); «—» если нет
- **Category filter** — client-side по активным категориям из `DocumentTemplateCategoriesService` (список шаблонов уже загружен)
- **Setup dialog (create)** — только системные категории (`!organizationId`); default auto-select; пустой каталог → CTA в справочник; без `categoryId` submit заблокирован
- **Setup dialog (duplicate)** — поле category скрыто; категория остаётся у source (сервер); UI не врёт про смену category
- **pageSize canon** — A3 \| A4 \| A5 (DTO ↔ chips; Letter/Legal не в UI)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase D) |
| TZ-DOC-308 | Категория шаблона: колонка в реестре, фильтр по категории, выбор категории в setup-диалоге (default auto-select, required) |
| TZ-DOC-324 | **IA:** этот реестр стал единственным местом CRUD для шаблонов. Builder (бывший дубль-picker на /builder без :id) возвращает редирект на /templates. Тесты TZ-DOC-268/310/310B на create/duplicate перенесены в `templates.page.spec.ts`. |
| TZ-DOC-337 | pageSize A3\|A4\|A5 в Create DTO |
| TZ-DOC-338 | Create: system-only categories + empty CTA |
| TZ-DOC-339 | Duplicate honesty: без category в UI |
| TZ-DOC-340 / UX-DIALOG-301 | Mobile viewport clamp на PiDialog / form dialogs |
| TZ-PROC-301 | Deploy smoke checklist (create A4) |

---

_Создано: 2026-07-19._
