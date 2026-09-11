# Страница: Категории текстовых блоков

**Краткое описание:** плоский справочник категорий текстовых блоков (CRUD через
`/text-block-categories`). Питает select категории в редакторе блока и фильтр
реестра на `/doc-constructor/texts`. Отличается и от дерева `/categories`, и от
`DocumentTemplateCategory` (TZ-DOC-308).

## SoT (2026-09-11, `TZ-NX-REG-TEXT-BLOCK-CATEGORIES`) — `/registries/text-block-categories`

Аудит `docs/audits/2026-09-11-reference-nav-vs-registries.md`: отдельная top-nav
вкладка «Справочники» существовала **только** ради этого одного живого экрана
(остальные пункты — мёртвые stubs, скрыты `filterNavCategories`); «Тексты» уже
жили в `/registries`. Категории текстов перенесены туда же (группа
«Документы», рядом с «Тексты») — плоский `defineRegistry`, не отдельная
master-detail страница.

- Registry: `text-block-categories.registry.ts` + `text-block-categories-http-data-source.ts`
  (`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/`). Колонка «Путь»
  несёт «Root › Sub» (или просто имя корня для root-строки) вместо двухуровневой
  master-detail разметки старой страницы; сортировка по этой строке естественно
  группирует каждый корень над его же подкатегориями.
- Actions (`doc-studio-registry-actions.ts`): toolbar «Создать категорию» → root;
  row «Создать подкатегорию» (accent Plus, `id: 'create-sub'`) — только на
  root-строках (`isDisabled` на подкатегории); edit — тот же
  `TextBlockCategoryFormDialogComponent`; delete задизейблен для системной
  категории («Общее») вместо того, чтобы прятать кнопку — то же поведение, что
  было на старой странице, другой механизм показа.
- Старый URL `/dictionaries/text-block-categories` — `redirectTo` на новый путь
  (`app.routes.ts`), бывший компонент `TextBlockCategoriesPage` удалён.
- `RegistryCrudActionOptions` (`registry-crud-actions.ts`) получил опциональные
  `isDeleteDisabled`/`deleteDisabledReason` — раньше только `domainActions` умели
  disable-with-reason (см. `units.registry.ts`), у самого «delete» такого хука
  не было.

Разделы ниже (Route/Dialogs/Services/State/Особенности) описывают
**удалённую** master-detail страницу — оставлены как UX-референс миграции, не
SoT.

## Route (устарело — удалено, redirect на `/registries/text-block-categories`)

```
/dictionaries/text-block-categories — «KPPDF — Категории текстов»
```

Группа: TOC «Справочники» → группа `documents-ref` → чип `text-blocks`
(`DICTIONARY_TOC_CHIPS` + `DOCUMENTS_REF_CHIPS`). Соседний чип → категории шаблонов.

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| — | — | (none — всё через сигналы; search — только input) |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/text-block-categories?activeOnly&search&parentId&rootsOnly` | Список; `rootsOnly=true` — только корневые, `parentId=<rootId>` — только подкатегории этого корня |
| GET | `/text-block-categories/:id` | Одна категория |
| POST | `/text-block-categories` | Создание (`parentId?` — делает подкатегорией) |
| PATCH | `/text-block-categories/:id` | Редактирование / `isActive` / `parentId` |
| DELETE | `/text-block-categories/:id` | Удаление (в использовании ИЛИ есть подкатегории → 409) |

Контракт ошибок (BE TZ-DOC-315): 409 — дубль slug / системная / в использовании /
есть подкатегории; 403 — IDOR (чужая org); 404 — нет id / нет родителя; 400 —
невалидный slug / неактивная / глубина>1 (`parentId` подкатегории) / `isDefault`
на подкатегории.

**Дерево (TZ-NX-TEXT-CAT-PARENT, 2026-09-11):** `parentId?` — undefined/null = корневая
категория; заполнено = подкатегория. Глубина ограничена **одним уровнем**: родитель
подкатегории обязан сам быть корневой (его `parentId` — null), иначе 400. `isDefault`
поддерживается только на корневых категориях. `TextBlock.categoryId` теперь обязан
указывать на **лист** (подкатегорию) — `assertAssignable` отклоняет корневые id
400-й; при создании TextBlock без `categoryId` — 400 «Укажите подкатегорию» (больше
не молчаливый fallback на «Общее»). Существующие TextBlock, у которых `categoryId`
всё ещё указывает на корень — читаются как есть (без миграции); следующее
редактирование обязано перенести их на лист.

## NX (2026-09-11, `TZ-NX-TEXT-CAT-NX-CRUD`) — superseded, see «SoT» above

**Historical.** This section described the original bespoke master-detail
`TextBlockCategoriesPage` — replaced same-day by the `/registries` flat
registry (`TZ-NX-REG-TEXT-BLOCK-CATEGORIES`, see «SoT» above). The component
file is deleted; kept below only as migration context for the dialog/service
pieces that carried over unchanged.

Fixes the dead nav link (`nav-categories.ts` already pointed here; no NX route
existed until this TZ). **Not** a `defineRegistry`/`/registries/*` page — a
bespoke master-detail component, `TextBlockCategoriesPage`
(`frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-categories.page.ts`):

- Roots list on top (`app-pi-page-chrome` + a hairline row list, not `app-pi-table`
  — the roots/subcategories master-detail shape doesn't fit a flat registry
  table). Click a root row to select it.
- Subcategories of the **selected** root below. «Создать подкатегорию» only
  ever renders when a root is selected, and never on a subcategory row itself
  — depth > 1 is structurally impossible from this UI, not just BE-guarded
  (`TZ-NX-TEXT-CAT-PARENT` `assertValidParent` is the server-side backstop).
- Create/edit dialog: `TextBlockCategoryFormDialogComponent` (same file
  folder) — name/description/isActive, plus `isDefault` **only** when
  creating/editing a root (mirrors BE `assertDefaultNotOnSubcategory`).
  `parentId` is fixed by which "+" button opened the dialog — this form does
  not offer re-parenting an existing category.
- Delete: `AlertDialogComponent`, destructive confirm; BE 409 messages
  (system / in-use / has-subcategories) surface via `extractErrorMessage`.
- Service: `PiTextBlockCategoriesService` (`frontend-nx/libs/data-access`)
  gained `create()`/`update()`/`remove()` and `list({ rootsOnly, parentId,
  activeOnly, search })` (was list-only before this TZ).

The sections below (Dialogs/Services/State/Computed/TZ reference/Особенности)
describe the **legacy** (`frontend/`) implementation — kept as UX reference,
not SoT once NX is the target.

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `TextBlockCategoryFormDialogComponent` | create / edit | `null` / `TextBlockCategory` (width md) |
| `AlertDialogComponent` | confirm delete | `{ title, message, confirmLabel, variant: destructive }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TextBlockCategoriesService` | `list({activeOnly, search})`, `findById()`, `create()`, `update()`, `remove()` |

Кэш: только `activeOnly`-каталог (для пикеров) кэшируется; словарные/search —
свежие. In-flight dedup через `share()` (не shareReplay), кэш — Map с generation.

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `items` | `Signal<TextBlockCategory[]>` | Полный список с сервера |
| `loading` | `Signal<boolean>` | Загрузка |
| `error` | `Signal<string\|null>` | extractErrorMessage |
| `searchQuery` | `Signal<string>` | Поиск по name **или** slug |
| `visible` | `Computed<...>` | sortOrder → name (ru), фильтр |

## Computed / templates

| Computed | Назначение |
|----------|-----------|
| `visible` | Сортировка `sortOrder` + `localeCompare(ru)`, фильтр name/slug |
| `totalLabel` | «N из M категорий» (родительный падеж, pluralGenitive) |

Колонки pi-table: `name` (бейджи «системная» / «по умолчанию»), `slug` (mono),
`description`, `isActive` (switch, disabled у системных). Empty/loading/error —
через `PiEmptyStateComponent`.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-DOC-316 | Первая реализация справочника (page + service) |
| TZ-DOC-315 | Backend-контракт `/text-block-categories` |
| TZ-DOC-334 | Route + nav (page из DOC-316) |
| TZ-DICT-307 / DICT-310 | Group Chip Workspace (documents-ref, чип «Категории текстов») |
| TZ-UX-304 | pi-table column definitions |

## Особенности

- Системные категории («Общее»): `isSystem` — показаны, но **не** edit/delete
  (UI disable + backend 409).
- Удаление категории, используемой блоками → 409 (подсказка в deleteTitle).
- Клиентская сортировка/поиск; пагинации нет (список маленький).
- Кэш активного каталога инвалидируется только успешными мутациями.

---

_Создано: 2026-08-09. Последнее обновление: 2026-08-09._
