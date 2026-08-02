═══════════════════════════════════════════════════════════════
TZ-DOC-308: Категории шаблонов — справочник и форма
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / UX Engineer / QA-валидатор

ЗАВИСИМОСТИ: TZ-DOC-307. Не начинать до фиксации backend category contract.

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;frontend/src/app/pages/doc-constructor/builder/builder.page.ts;frontend/src/app/shared/services/pi-document-templates.service.ts;frontend/src/app/shared/services/categories.service.ts;frontend/src/app/pages/dictionaries/categories.page.ts;frontend/src/app/pages/dictionaries/category-form-dialog.component.ts;frontend/src/app/app.routes.ts;frontend/src/app/layout/app-layout.component.ts;docs/pages/templates.page.md;docs/pages/categories.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `TemplateSetupDialogComponent` сейчас выбирает только page size и orientation; при создании шаблона category не запрашивается.

2. `TemplatesPage.createWithSettings()` создаёт шаблон после получения organization/docType. В payload нет `categoryId`. Duplicate сохраняет категорию только если backend сам её копирует, но UI не позволяет её изменить в setup dialog.

3. Существующий `/categories` — справочник material/product/general categories с обязательным `skuPrefix`; его нельзя подключить к форме шаблона до выполнения contract decision TZ-DOC-307.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: После TZ-DOC-307 подключить канонический category service. В форме создания/редактирования шаблона загружать только активные document-template categories с loading/error/empty состояниями.

ШАГ 2: Сделать категорию обязательной для создания: выбрать активную default-категорию автоматически, дать пользователю изменить выбор, не разрешать submit без валидного categoryId. Default должен приходить из API/contract, а не быть захардкоженным только в Angular.

ШАГ 3: Добавить управление категориями в наиболее подходящий существующий справочник `/categories` либо в отдельную секцию `/dictionaries`, сохранив существующие material/product категории. Пользователь с разрешением должен создавать, редактировать/переименовывать, активировать/деактивировать категории; копирование не добавлять.

ШАГ 4: Обновить template registry: колонка/бейдж категории, поиск по имени/slug, фильтр по категории, понятное empty state. Проверить create, edit и duplicate flow, включая обновление списка после изменения категории.

ШАГ 5: Добавить TestBed/component tests на default, required validation, loading/error/empty, category rename refresh, filter and duplicate payload; выполнить browser-check.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
- frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
- frontend/src/app/shared/services/pi-document-templates.service.ts;
- выбранные category service/UI files по TZ-DOC-307;
- frontend specs for template setup/templates/categories;
- docs/pages/templates.page.md, docs/pages/categories.page.md.

НЕ ИЗМЕНЯТЬ:
- backend schema/DTO/API до завершения TZ-DOC-307;
- material/product category behavior;
- builder canvas/block rendering;
- unrelated dictionaries;
- other active TZ files.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. При создании шаблона виден понятный select «Категория шаблона», он обязательный и имеет активное default-значение.
2. Пользователь может заменить default на другую активную категорию; POST содержит выбранный categoryId ровно один раз.
3. Неактивные категории не предлагаются; ошибка загрузки не приводит к silent submit.
4. Edit preselects текущую категорию; rename категории отображается после reload без изменения её ID.
5. Registry показывает категорию и позволяет фильтровать/искать шаблоны по ней.
6. Duplicate сохраняет исходную категорию и не создаёт новый category record.
7. Справочник позволяет создать и переименовать document category, но не ломает material/product category UI.
8. Keyboard navigation, labels, focus ring и 375px layout работают; browser console без новых ошибок.
9. Frontend tsc, development build и targeted Jest проходят.

РУЧНОЙ СЦЕНАРИЙ: открыть справочник → создать «Коммерческие предложения» → создать шаблон → убедиться в default → выбрать другую категорию → сохранить → отфильтровать registry → переименовать категорию → проверить обновление → продублировать шаблон.

ОГРАНИЧЕНИЯ: не делать категорию свободным текстом и не добавлять копирование категорий в рамках этой задачи.
