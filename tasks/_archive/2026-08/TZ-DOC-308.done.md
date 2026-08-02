ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - frontend typecheck: PASS
  - frontend jest: PASS (56/56 targeted, 689/689 full)
  - ng build (development): PASS
  - backend regression: PASS (50/50 targeted, 315/315 full)
  - git diff --check: PASS
  - code review: PASS
  - progress.md: UPDATED
  - STATUS.md: UPDATED

TZ-DOC-308: Категории шаблонов — справочник и UI выбора категории

Реализовано поверх контракта TZ-DOC-307:

1. Справочник «Категории шаблонов» (DocumentTemplateCategoriesPage, /doc-template-categories,
   пункт «Категории шаблонов» в разделе «Справочники» навигации):
   - CRUD: создание/переименование (form-dialog), активация/деактивация (switch),
     удаление только неиспользуемых (409 от бэкенда → toast), системные категории заблокированы;
   - loading / error (с «Повторить») / empty состояния; поиск; сортировка по sortOrder + name;
   - material/product categories не затронуты (отдельная сущность и страница).

2. Setup-диалог шаблона (TemplateSetupDialogComponent):
   - обязательное поле «Категория шаблона»; загрузка только активных категорий;
   - auto-select активной default-категории; возможность выбрать другую;
   - loading блокирует submit; ошибка загрузки и пустой список блокируют submit (no silent submit);
   - результат confirm: { pageSize, orientation, categoryId }.

3. Реестр шаблонов (TemplatesPage):
   - колонка «Категория» (populated имя);
   - фильтр по категории (categoryId → API);
   - duplicate сохраняет исходную categoryId (сервер валидирует, fallback на default);
   - после rename категории новый name виден после reload.

4. Frontend service: pi-document-template-categories.service.ts — фактический API
   /document-template-categories (list/findById/create/update/remove), slug опционален (сервер генерирует).

5. Тесты: page spec (11), form-dialog spec, setup-dialog spec (TZ-DOC-268 + TZ-DOC-308 матрица),
   templates.page spec (категория-фильтр/колонка/duplicate).
