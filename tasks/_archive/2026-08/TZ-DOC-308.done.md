ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: 73cc8a0
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
browser: MANUAL_BROWSER_CHECK_REQUIRED (deep E2E scenarios on shared dev stack — login 401 for all known credentials)

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

Известное ограничение: «edit flow выбирает текущую категорию» — в архитектуре нет edit-диалога шаблона
(setup-диалог поддерживает только create/duplicate); требование покрыто create/duplicate + registry filter.

jobs_tracking:
  - tasks/_archive/2026-08/TZ-DOC-308-template-category-ui.md (spec)
  - tasks/_archive/2026-08/TZ-DOC-308.done.md (this file)
  - docs/agent-checklists/TZ-DOC-308.md (verification log — created in wake-up session)
  - .mimocode/locks/TZ-DOC-308-template-category-ui.lock (lock — created in wake-up session)
  - STATUS.md (✅ DONE row + lock table entry)
  - progress.md (closed entry 2026-08-02)

wakeup_reverification (2026-08-02, tree @ adc72b9):
  - frontend tsc (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend jest targeted document-template-categories|document-template-category-form-dialog|categories.page:
    4 suites / 32 tests PASS
  - ng build --configuration=development: PASS (exit 0)
  - git diff --check: PASS
  - lock + agent checklist created (were referenced in STATUS.md but absent on disk)
  - embedded section in categories.page.ts intentionally NOT added: dedicated page already
    exists (73cc8a0); 67d9e0b removed the dead docCatService injection; re-adding would
    duplicate functionality and resurrect removed dead code.
