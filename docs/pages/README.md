# Документация страниц (Page Docs)

> **Назначение:** Каждый файл в этой директории описывает одну страницу frontend.
> При редактировании любой страницы — ЧИТАЙ соотвествующий `.page.md` файл ПЕРЕД внесением изменений.
> Это даёт полную картину: route, API, сервисы, signals, computed, cell templates, TZ-ссылки.
> Связь домен ↔ страницы: [`../DOMAIN-MAP.md`](../DOMAIN-MAP.md).  
> Смысл общего поля на нескольких экранах: [`../COUPLING-MAP.md`](../COUPLING-MAP.md).

## Индекс страниц

Полный список ниже. **Связь страница ↔ TZ (поиск по задачам):**
[`PAGE-TZ-INDEX.md`](PAGE-TZ-INDEX.md).

| # | Страница | Файл | Route | Описание |
|---|----------|------|-------|----------|
| 1 | **Login** | `login.page.md` | `/login` | Аутентификация |
| 2 | **Inventory Dashboard** | `inventory-dashboard.page.md` | `/inventory` | Складская панель |
| 3 | **Materials** | `materials.page.md` | `/materials` | Справочник материалов |
| 4 | **Products** | `products.page.md` | `/products` | Каталог продукции |
| 4a | **Product Detail** | `product-detail.page.md` | `/products/:id` | Карточка изделия (stub 319) |
| 4b | **Catalog Appearance** | `catalog-appearance.page.md` | `/catalog/appearance` | Палитра типов каталога (CATALOG-331) |
| 5 | **Orders** | `orders.page.md` | `/orders` | Заказы |
| 6 | **Contracts** | `contracts.page.md` | `/contracts` | Договоры |
| 7 | **Organizations** | `organizations.page.md` | `/organizations` | Организации |
| 8 | **Work Types** | `work-types.page.md` | `/work-types` | Виды работ |
| 8a | **People** | `people.page.md` | `/people` | Люди (Worker; UX-306) |
| 9 | **Modules** | `modules.page.md` | `/modules` | Модули продукции |
| 10 | **Module Detail** | `module-detail.page.md` | `/modules/:id` | Детали модуля |
| 11 | **Dictionaries** | `dictionaries.page.md` | `/dictionaries` | Hub справочников (до DICT-311) |
| 11a | **Measurements group** | `measurements-group.page.md` | `/dictionaries/measurements` | Group Chip Workspace пилот (DICT-308) |
| 11b | **Units** | `units.page.md` | `/dictionaries/units` | Единицы (legacy shell) |
| 12 | **Categories** | `categories.page.md` | `/categories` | Категории (tree) |
| 12a | **Doc-Template Categories** | `document-template-categories.page.md` | `/doc-template-categories` | Категории шаблонов (DOC-308) |
| 12b | **Text-Block Categories** | `text-block-categories.page.md` | `/dictionaries/text-block-categories` | Категории текстов (DOC-334) |
| 13 | **Storage Items** | `storage-items.page.md` | `/storage-items` | Предметы хранения |
| 14 | **Stock Movements** | `stock-movements.page.md` | `/stock-movements` | Движения остатков |
| 15 | **Documents** | `documents.page.md` | `/doc-constructor/documents` | Сформированные документы |
| 16 | **Texts** | `texts.page.md` | `/doc-constructor/texts` | Текстовые блоки |
| 17 | **Tables** | `tables.page.md` | `/doc-constructor/tables` | Шаблоны таблиц |
| 18 | **Templates** | `templates.page.md` | `/doc-constructor/templates` | Шаблоны документов |
| 19 | **Builder** | `builder.page.md` | `/doc-constructor/builder` | Редактор документа (3-pane) |
| 20 | **Builder Tool Pane** | `builder-tool-pane.page.md` | _дочерний BuilderPage_ | Левая панель: палитра блоков |
| 21 | **Builder Inspector** | `builder-inspector.page.md` | _дочерний BuilderPage_ | Правая панель: свойства блока |
| 22 | **Production Cockpit** | `production-cockpit.page.md` | `/production` | Гант план-оценка (PRODUCTION-303) |
| 23 | **Admin Users** | `admin-users.page.md` | `/admin/users` | Админ-реестр пользователей (RBAC) |
| 24 | **Admin Roles** | `admin-roles.page.md` | `/admin/roles` | Роли и права (RBAC) |
| 25 | **Material Detail** | `material-detail.page.md` | `/materials/:id` | Карточка материала (312) |
| 26 | **Counterparties** | `counterparties.page.md` | `/counterparties` | Заказчики (PARTY-301/303) |
| 27 | **Warehouses** | `warehouses.page.md` | `/warehouses` | Склады (WAREHOUSE-UX-301) |
| 28 | **Supply** | `supply.page.md` | `/supply` | Снабжение |
| 29 | **Design** | `design.page.md` | `/design` | Очередь доукомплектования (stub NAV-301) |
| 30 | **Shipping** | `shipping.page.md` | `/shipping` | Частичные отгрузки (stub NAV-301) |
| 31 | **Import Todos** | `import-todos.page.md` | `/import-todos` | Импорт: finish-list менеджера (TZD-29) |
| 32 | **Proposals** | `proposals.page.md` | `/proposals` | Коммерческие предложения (SALES-*) |
| 33 | **Proposal Create** | `proposals-create.page.md` | `/proposals/create` | Витрина КП (SALES-317…328) |
| 34 | **Color References** | `color-references.page.md` | `/dictionaries/color-references` | Палитра цветов (DICT-306) |
| 35 | **Form Profiles** | `form-profiles.page.md` | `/dictionaries/form-profiles` | Профили быстрых форм (DICT-315) |
| 36 | **Foundations (kit)** | `foundations.page.md` | — (kit; нет route в app.routes.ts) | Стильгайд/шрифты (design-spec; OPS-308) |

> 36/36 бизнес-routes документированы (DOMAIN-MAP §1.3 gaps = 0).
> Дополнительно в индексе: 2 дочерних компонента Builder (tool-pane / inspector) + kit `foundations` (стильгайд; route нет в app.routes.ts — OPS-308).
> Playground-страницы (`/kit/*`) сняты — UI showcase больше не в продукте.

## Правила

1. **Один файл = одна страница.** Название файла: `<имя>.page.md`
2. **Шаблон:** `docs/pages/_template.md` — копируй его для новой страницы
3. **При редактировании страницы:** сначала прочитай соотвествующий `.page.md`
4. **При добавлении новой страницы:** создай `.page.md` из шаблона (обязательно)
   и пройди [`FEATURE-INTEGRATION-CHECKLIST.md`](../FEATURE-INTEGRATION-CHECKLIST.md) §A.
5. **Обновляй:** при изменении API/route/диалогов — обнови `.md` файл
6. **Индекс:** этот файл — актуальный список всех страниц

---

_Создано: 2026-07-19. Актуально: 36/36 бизнес-routes (вкл. Production Cockpit, stubs design/shipping). Gap inventory = 0._
