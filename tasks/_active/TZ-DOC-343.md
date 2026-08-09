═══════════════════════════════════════════════════════════════
TZ-DOC-343: Builder — свойства шаблона (create-parity)
═══════════════════════════════════════════════════════════════

> Domain: DocumentTemplate; категория = DocumentTemplateCategory (не TextBlock).
> Проверено:
> - Create UX (`template-setup-dialog`): categoryId + pageSize A3|A4|A5 + orientation
> - Create API (`templates.page`): + auto `name`, org, docType
> - Mode B inspector (`builder-inspector` L136–229): name = read-only hint;
>   pageSize/orientation handlers есть в .ts, **в шаблоне не подключены**;
>   category UI отсутствует
> - `DocumentTemplateService.update()` пишет name/pageSize/categoryId/… но
>   **не** `orientation` (отдельный `PATCH :id/orientation` / `setOrientation`)
> - `onTemplateUpdate` → `templatesSvc.update` — для orientation сейчас silent no-op на BE

РОЛЬ АГЕНТА: Frontend UI Engineer (+ минимальный BE fix orientation в update)

ЗАВИСИМОСТИ: Нет

LAYER: 3

PAGES: /doc-constructor/builder/:id
PAGE_DOCS: builder.page.md

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts; frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts; frontend/src/app/pages/doc-constructor/builder/builder.page.ts; backend/src/modules/document-template/document-template.service.ts; docs/pages/builder.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. PO: после «Редактировать» нельзя сменить название/категорию и прочие
   данные, заданные при создании — «других мест не нашёл».

2. Факт: Mode B показывает в основном фон/нумерацию/opacity. Поля create-диалога
   в свойствах шаблона **не собраны**.

3. Цель: один понятный блок свойств справа (секции), всё сохраняется через
   существующий PATCH / setOrientation.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: BE — orientation в update() (1 строка логики)

  В `DocumentTemplateService.update`:
  `if (dto.orientation !== undefined) doc.orientation = dto.orientation;`
  (DTO уже PartialType с `@IsIn(['portrait','landscape'])`).
  Отдельный `PATCH :id/orientation` оставить (не ломать).

ШАГ 2: MODE B — СЕКЦИИ СВОЙСТВ (инспектор)

  Пересобрать Mode B в явные секции (RU, `data-test` на секции):

  **A. Основные** (`insp-section-basics`)
  - Название — input, commit blur/Enter → `templateUpdate.emit({ name })`;
    пустое trim → reject + toast «Название обязательно», вернуть старое.
    `data-test="insp-template-name"`.
  - Категория шаблона — select активных системных категорий
    (`DocumentTemplateCategoriesService`, тот же источник что setup-dialog).
    Change → `templateUpdate.emit({ categoryId })`.
    `data-test="insp-template-category"`.
    Loading / empty / error — короткие RU-состояния; ссылка в справочник
    категорий — опционально как в setup-dialog.

  **B. Страница** (`insp-section-page`)
  - Формат — chips A3|A4|A5 (как setup-dialog) → `onPageSizeChange` /
    `templateUpdate.emit({ pageSize })`.
  - Ориентация — chips Книжная|Альбомная → `templateUpdate.emit({ orientation })`
    (после ШАГ 1 сохранится).
  - Нумерация страниц — существующий switch (перенести сюда из «Стиль»).

  **C. Фон** (`insp-section-background`) — без регресса:
  opacity + upload/grid/default/remove как сейчас.

  Не тащить в эту TZ смену organizationId / docTypeId (create подставляет
  дефолты; отдельный successor если PO попросит).

ШАГ 3: PARENT

  `onTemplateUpdate` оставить; после PATCH ok можно не reload.
  Убедиться: canvas `orientation` / pageSize computed обновляются из
  `template()` signal (optimistic patch уже есть).

ШАГ 4: TESTS + DOCS

  - Jest inspector: emit name / categoryId / pageSize / orientation.
  - `docs/pages/builder.page.md`: Mode B = свойства create-parity (секции A–C).
  - Gates ниже.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- template-setup-dialog create flow (кроме copy-paste стиля chips — ок)
- Text-block category filter (другая сущность)
- Upload-background / DOC-342
- SALES-317 / proposal-create
- Список templates.page rename-inline (out of scope; builder = SoT edit)

known_limitation:
- description / tags / notes — не в create-диалоге; не обязательны здесь
- Смена org/docType — later
- Inline rename в списке шаблонов — later

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Mode B: видны редактируемые Название, Категория, Формат, Ориентация (+ фон/нумерация).
2. Смена каждого поля → сохранение (F5 — значения на месте).
3. Пустое название не сохраняется.
4. Orientation через PATCH update реально пишется в Mongo (не только optimistic UI).
5. Gates:
   ```
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=builder-inspector
   ```
6. Checklist + Executor report (auto); archive после Cursor/PO visual PASS.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md → `tasks/_archive/2026-08/TZ-DOC-343.done.md`
