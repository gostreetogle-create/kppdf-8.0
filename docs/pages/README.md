# Документация страниц (Page Docs)

> **Назначение:** Каждый файл в этой директории описывает одну страницу frontend:
> route, API endpoints, dialogs, services, state (signals), TZ-ссылки.
>
> MCP-сервер (`vendor/codebase-memory-mcp/`) автоматически индексирует эти файлы
> при старте — AI-агенты получают точную семантику каждой страницы.

## Индекс страниц

| # | Страница | Файл | Route | Описание |
|---|----------|------|-------|----------|
| 1 | **Login** | `login.page.md` ✅ | `/login` | Аутентификация |
| 2 | **Inventory Dashboard** | `inventory-dashboard.page.md` ✅ | `/dashboard` | Складская панель |
| 3 | **Materials** | `materials.page.md` ✅ | `/materials` | Справочник материалов |
| 4 | **Products** | `products.page.md` ✅ | `/products` | Каталог продукции |
| 5 | **Orders** | `orders.page.md` ✅ | `/orders` | Заказы |
| 6 | **Contracts** | `contracts.page.md` ✅ | `/contracts` | Договоры |
| 7 | **Organizations** | `organizations.page.md` ✅ | `/organizations` | Организации |
| 8 | **Work Types** | `work-types.page.md` ✅ | `/work-types` | Виды работ |
| 9 | **Modules** | `modules.page.md` ✅ | `/modules` | Модули продукции |
| 10 | **Module Detail** | `module-detail.page.md` ✅ | `/modules/:id` | Детали модуля |
| 11 | **Dictionaries** | `dictionaries.page.md` ✅ | `/dictionaries` | Справочники (units) |
| 12 | **Categories** | `categories.page.md` ✅ | `/categories` | Категории (tree) |
| 13 | **Storage Items** | `storage-items.page.md` ✅ | `/storage-items` | Предметы хранения |
| 14 | **Stock Movements** | `stock-movements.page.md` ✅ | `/stock-movements` | Движения остатков |
| 15 | **Documents** | `documents.page.md` ✅ | `/doc-constructor/documents` | Сформированные документы |
| 16 | **Texts** | `texts.page.md` ✅ | `/doc-constructor/texts` | Текстовые блоки |
| 17 | **Tables** | `tables.page.md` ✅ | `/doc-constructor/tables` | Шаблоны таблиц |
| 18 | **Templates** | `templates.page.md` ✅ | `/doc-constructor/templates` | Шаблоны документов |
| 19 | **Builder** | `builder.page.md` ✅ | `/doc-constructor/builder` | Редактор документа |

> Полный список страниц: 19 документированы. Playground-страницы (`/kit/*`) не документированы.

## Статус документации

| Статус | Значение |
|--------|----------|
| ✅ **DONE** | Документация написана |
| ⬜ **TODO** | Документация не написана |

> **Текущий прогресс:** ✅ 19/19 бизнес-страниц документированы (TZ-141).
> Не документированы: playground-страницы (kit/*) — 9 шт. (overview, theme-editor, code-preview, basics, forms, foundations, navigation, overlays).
> **Скрипт проверки:** `npx tsx scripts/check-page-docs.ts` — exit 0 если всё покрыто.

## Правила

1. **Один файл = одна страница.** Название файла: `<имя>.page.md`
2. **Шаблон:** `docs/pages/_template.md` — копируй его для новой страницы
3. **Контракт:** описывай ТОЛЬКО внешний контракт страницы (route, API, inputs, outputs)
4. **Не дублируй:** детали реализации (как работает httpResource) — в DEVELOPMENT-PATTERNS.md
5. **JSDoc в коде:** добавь строку `Полная документация страницы: docs/pages/<имя>.page.md` в начало JSDoc блока компонента
6. **Обновляй:** при изменении API/route/диалогов — обнови .md файл

---

_Создано: 2026-07-19. Статус: ✅ 19/19 страниц документированы (TZ-141)._
