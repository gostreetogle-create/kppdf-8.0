ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
tz_id: TZ-DOC-316-text-block-category-reference-and-picker
commit: (см. closeout commit ниже — feat(text-block): categories reference and picker)
verification:
  - acceptance criteria: TZ-DOC-316 §Acceptance 1..16 — covered (см. ниже)
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0, no diagnostics)
  - frontend tsc (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend jest targeted: PASS (5 suites / 48 tests)
  - ng build --configuration=development: PASS (exit 0)
  - git diff --check: PASS (clean)
  - OrchestratorKit/verify-status.sh: PASS
  - docs/pages/texts.page.md + categories.page.md: UPDATED
  - STATUS.md: UPDATED (DONE row + reference to TZ-DOC-317 as next)
  - progress.md: UPDATED
browser: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable; unit/integration tests are canonical evidence)

═══════════════════════════════════════════════════════════════
TZ-DOC-316: TextBlockCategory — справочник и picker в редакторе текстов
═══════════════════════════════════════════════════════════════

Реализовано поверх контракта TZ-DOC-315 (backend, НЕ трогался):

1. Service `frontend/src/app/shared/services/pi-text-block-categories.service.ts`:
   - GET/POST/PATCH/DELETE `/text-block-categories` (list({ activeOnly?, search? }), findById, create, update, remove);
   - кэш активного каталога по TZ-DOC-309 паттерну: Map по ключам + in-flight share() + generation guard + ручная инвалидация после успешных мутаций;
   - НО БЕЗ `shareReplay` — TZ-DOC-309 выявил, что replay скрывает cross-tab changes; кэш отдаётся синхронно через `of(cached)` из Map;
   - ошибки: 409 dup-slug / in_use / system, 403 IDOR, 404 missing — surfaced через SilentResult.

2. Справочник `TextBlockCategoriesPage` (`/dictionaries/text-block-categories`, пункт «Категории текстов» в «Справочниках»):
   - CRUD: создание/редактирование (form-dialog), активация/деактивация (switch), удаление только неиспользуемых (409 → toast);
   - системные категории («Общее») заблокированы (switch/edit/delete disabled + tooltip);
   - loading / error (с «Повторить») / empty состояния; поиск по name+slug; сортировка sortOrder + name;
   - НЕ секция в categories.page.ts — dedicated page (deja vu TZ-DOC-308).

3. Form-dialog `TextBlockCategoryFormDialogComponent`:
   - variant="content" + maxWidth=1000px (sticky-footer PiDialog контракт TZ-DOC-308);
   - секции «Основное» (name, slug kebab-lowercase, description) + «Статус» (isActive switch, isDefault switch, sortOrder);
   - whitelist-пайлоад (лишние поля не отправляются — ValidationPipe 400 на чужие поля исключён конструктивно);
   - double-submit guard (submitting signal); ошибка API inline, диалог остаётся открытым.

4. Редактор блока `text-block-editor.component.ts`:
   - секция «Категория» первой в meta-блоке: select активных категорий из сервиса;
   - auto-select активной default-категории для нового блока (повторяет серверный resolveDefault);
   - редактирование: preselect существующего `categoryId`;
   - «Не выбрана» → null → `categoryId` НЕ отправляется (сервер сам подставит default, AC #10);
   - payload содержит `categoryId` ОДИН раз только при явном выборе;
   - эффект-инициализация по id блока (guard `initializedBlockId`) — исключает feedback-loop, когда effect читает selectedCategoryId.

5. Каталог текстов `texts.page.ts`:
   - колонка «Категория» после «Название» (бейдж имени через populated lookup, не raw id);
   - dropdown-фильтр «Категория» в шапке (активные категории; «Все» сбрасывает); комбинируется с поиском (AND);
   - `TextBlock.categoryId?: string` добавлен в интерфейс pi-text-blocks.service.ts (TZ-DOC-315 контракт).

6. Роутинг + навигация:
   - `app.routes.ts`: `/dictionaries/text-block-categories` → TextBlockCategoriesPage;
   - `app-layout.component.ts`: пункт «Категории текстов» в группе «Справочники» (после «Категории шаблонов»).

7. Тесты (48 в 5 suites):
   - pi-text-block-categories.service.spec.ts (14): cache hit/miss, in-flight share, activeOnly/search fresh, mutation invalidation, generation guard, failed-mutation keeps cache, 409/403/404 surfacing;
   - text-block-categories.page.spec.ts (13): loading/error/empty/filled, search (name+slug), sort, toggle active ± rollback, system-lock (toggle/edit), delete confirm + reload;
   - text-block-category-form-dialog.component.spec.ts (9): create/edit, slug optional/passthrough, validation (required/pattern), inline API error, double-submit, cancel;
   - text-block-editor.component.spec.ts (7, NEW — редактор ранее не имел spec): catalog render, auto-select default, preselect existing, change/clear select, payload categoryId once / omitted;
   - texts.page.spec.ts (5, NEW — страница ранее не имела spec): categories load, badge lookup, filter by categoryId, reset filter, search+filter compose.

KNOWN LIMITATIONS:
- Browser E2E (создание/переименование/удаление категории, 375px viewport): MANUAL_BROWSER_CHECK_REQUIRED — dev-stack авторизация недоступна; unit/typecheck — каноническое свидетельство.
- TZ-DOC-317 (builder dropdown «Категория» в picker'е текстов) — логический SUCCESSOR, НЕ запускался (явное «не параллельно с TZ-DOC-316» в спеке).
- TZ-DOC-318 (миграция legacy enum `category` → `categoryId`) — successor, вне scope; legacy enum остаётся в схеме (backward compat).
- Чужих ng build-блокеров не обнаружено — сборка зелёная.
- `backend/node_modules` отсутствовал в изолированном worktree → установлен `pnpm install --frozen-lockfile` (backend код не менялся).

jobs_tracking:
  - tasks/TZ-DOC-316-text-block-category-reference-and-picker.md (spec)
  - tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md (this file)
  - docs/agent-checklists/TZ-DOC-316.md (verification log)
  - .mimocode/locks/TZ-DOC-316-text-block-category-reference-and-picker.lock
  - STATUS.md (DONE row + reference)
  - progress.md (closed entry 2026-08-02)

related_archive:
  - tasks/_archive/2026-08/TZ-DOC-308.done.md (dedicated-page UI pattern)
  - tasks/_archive/2026-08/TZ-DOC-309.done.md (active-catalog cache pattern, no-shareReplay)
  - tasks/_archive/2026-08/TZ-DOC-315.done.md (backend contract — source of truth)

next_chain_step: TZ-DOC-317 (builder dropdown «Категория» в picker'е текстов, `categoryId` query param) — НЕ параллелить с TZ-DOC-316/318.
