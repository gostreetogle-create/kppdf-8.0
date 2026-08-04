# Документация страниц (Page Docs)

> **Назначение:** Каждый файл в этой директории описывает одну страницу frontend.
> При редактировании любой страницы — ЧИТАЙ соотвествующий `.page.md` файл ПЕРЕД внесением изменений.
> Это даёт полную картину: route, API, сервисы, signals, computed, cell templates, TZ-ссылки.

## Индекс страниц

Полный список ниже. **Связь страница ↔ TZ (поиск по задачам):**
[`PAGE-TZ-INDEX.md`](PAGE-TZ-INDEX.md).

| # | Страница | Файл | Route | Описание |
|---|----------|------|-------|----------|
| 1 | **Login** | `login.page.md` | `/login` | Аутентификация |
| 2 | **Inventory Dashboard** | `inventory-dashboard.page.md` | `/dashboard` | Складская панель |
| 3 | **Materials** | `materials.page.md` | `/materials` | Справочник материалов |
| 4 | **Products** | `products.page.md` | `/products` | Каталог продукции |
| 4a | **Product Detail** | `product-detail.page.md` | `/products/:id` | Карточка изделия (stub 319) |
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
| 13 | **Storage Items** | `storage-items.page.md` | `/storage-items` | Предметы хранения |
| 14 | **Stock Movements** | `stock-movements.page.md` | `/stock-movements` | Движения остатков |
| 15 | **Documents** | `documents.page.md` | `/doc-constructor/documents` | Сформированные документы |
| 16 | **Texts** | `texts.page.md` | `/doc-constructor/texts` | Текстовые блоки |
| 17 | **Tables** | `tables.page.md` | `/doc-constructor/tables` | Шаблоны таблиц |
| 18 | **Templates** | `templates.page.md` | `/doc-constructor/templates` | Шаблоны документов |
| 19 | **Builder** | `builder.page.md` | `/doc-constructor/builder` | Редактор документа (3-pane) |
| 20 | **Builder Tool Pane** | `builder-tool-pane.page.md` | _дочерний BuilderPage_ | Левая панель: палитра блоков |
| 21 | **Builder Inspector** | `builder-inspector.page.md` | _дочерний BuilderPage_ | Правая панель: свойства блока |

> 19 бизнес-страниц + 2 дочерних компонента = 21 документированы.
> Playground-страницы (`/kit/*`) не документированы (UI showcase, не бизнес-логика).

## Правила

1. **Один файл = одна страница.** Название файла: `<имя>.page.md`
2. **Шаблон:** `docs/pages/_template.md` — копируй его для новой страницы
3. **При редактировании страницы:** сначала прочитай соотвествующий `.page.md`
4. **При добавлении новой страницы:** создай `.page.md` из шаблона (обязательно)
5. **Обновляй:** при изменении API/route/диалогов — обнови `.md` файл
6. **Индекс:** этот файл — актуальный список всех страниц

---

_Создано: 2026-07-19. Актуально: 21/21 бизнес-страниц документированы._
