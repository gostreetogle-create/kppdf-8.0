# Документация проекта kppdf-8.0

> **Навигация по директории `docs/`.** Содержит все не-TZ документы проекта.
> Для задач (TZ) см. `tasks/`.

## Структура

```
docs/
├── README.md                      ← этот файл (индекс docs/)
├── add-new-page.md                ← инструкция: как создать новую страницу
├── architecture-audit-2026-07.md  ← полный аудит архитектуры (2026-07-05)
├── data-model.md                  ← модель данных: 89 сущностей, 11 доменов
├── data-model-audit.md            ← аудит data model + предложения по консолидации
├── design-spec.md                 ← [NEW] design spec (бренд, цвета, типографика, компоненты)
├── DEVELOPMENT-PATTERNS.md        ← паттерны кодирования (SilentResult, CRUD, формы, API)
├── ORCHESTRATION_CHECKLIST.md     ← чек-лист для OrchestratorKit
├── paper-and-ink.md               ← дизайн-система Paper & Ink (OKLCH, токены, WCAG)
├── pi-table-migration-recipe.md   ← рецепт миграции на pi-table
├── pages/                         ← [TZ-141] документация всех 19 бизнес-страниц
│   ├── README.md                  ← индекс страниц (+ статус)
│   ├── _template.md               ← шаблон для новой страницы
│   ├── products.page.md           ← Продукция
│   ├── materials.page.md          ← Материалы
│   ├── contracts.page.md          ← Договоры
│   ├── orders.page.md             ← Заказы
│   ├── organizations.page.md      ← Организации
│   ├── work-types.page.md         ← Виды работ
│   ├── modules.page.md            ← Модули продукции
│   ├── module-detail.page.md      ← Детали модуля
│   ├── dictionaries.page.md       ← Справочники
│   ├── categories.page.md         ← Категории (tree)
│   ├── storage-items.page.md      ← Предметы хранения
│   ├── stock-movements.page.md    ← Движения остатков
│   ├── inventory-dashboard.page.md ← Складская панель
│   ├── login.page.md              ← Аутентификация
│   ├── texts.page.md              ← Текстовые блоки
│   ├── tables.page.md             ← Шаблоны таблиц
│   ├── templates.page.md          ← Шаблоны документов
│   ├── documents.page.md          ← Сформированные документы
│   └── builder.page.md            ← Редактор документа
├── reference/                     ← [NEW] референсы: HTML-прототипы, скриншоты, примеры
│   ├── design-prototype.html      ← HTML-прототип UI редактора текстовых блоков
│   ├── design-screen.png          ← Скриншот дизайн-макета
│   ├── example-document.pdf       ← Пример сгенерированного документа
│   ├── lumina-table-template-dialog.html ← [pre-TZ] референс табличного диалога
│   └── stitch_kppdf_paper_ink_system.zip ← оригинальный архив дизайн-системы
└── compose/                       ← композ-планы (TZ-104 batch)
    └── plans/
        └── 2026-07-12-angular-refactoring-tasks-1-4.md
```

## Категории

| Категория | Файлы | Назначение |
|-----------|-------|-----------|
| **Архитектура** | `architecture-audit-2026-07.md` | Полный срез архитектуры |
| **Модель данных** | `data-model.md`, `data-model-audit.md` | Entity-relationship model |
| **Разработка** | `DEVELOPMENT-PATTERNS.md`, `add-new-page.md` | Как писать код |
| **Дизайн** | `paper-and-ink.md`, `design-spec.md` | Design rationale + Design spec (2 файла, дополняют друг друга) |
| **Страницы** | `pages/` (19 .page.md) | [TZ-141] Описание каждой бизнес-страницы |
| **Миграции** | `pi-table-migration-recipe.md` | Рецепт pi-table |
| **Референсы** | `reference/` (5 файлов) | HTML-прототипы, скриншоты, примеры документов |
| **Compose** | `compose/plans/` | Планы композ-задач

## Рекомендуемый порядок чтения для нового разработчика

1. `ARCHITECTURE.md` (корень проекта) — общая архитектура
2. `docs/DEVELOPMENT-PATTERNS.md` — как писать код
3. `docs/data-model.md` — модель данных
4. `docs/design-spec.md` — design spec (бренд, цвета, компоненты)
5. `docs/paper-and-ink.md` — техническое rationale (токены, WCAG)
6. `docs/pages/README.md` — какие страницы есть
7. Нужная `docs/pages/<name>.page.md` — конкретная страница

## Связанные

- `tasks/` — TZ-задачи (активные и архив)
- `OrchestratorKit/` — система оркестрации задач
- `ARCHITECTURE.md` — архитектура проекта
- `STATUS.md` — статус всех задач
