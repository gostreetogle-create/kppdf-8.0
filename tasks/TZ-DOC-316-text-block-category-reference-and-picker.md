═══════════════════════════════════════════════════════════════
TZ-DOC-316: TextBlockCategory — справочник и picker в редакторе текстов
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer / UX Engineer

ЗАВИСИМОСТИ:
- TZ-DOC-315 должен быть DONE (backend ready).
- Не выполнять параллельно с TZ-DOC-317 и любыми TaskBuilder-правками
  (общие файлы builder-tool-pane / texts.page).

LAYER: 3 (frontend; ничего на backend не правим).

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/text-block-categories.page.ts (NEW);
frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts (NEW);
frontend/src/app/pages/dictionaries/index.routes.ts (или app.routes.ts);
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/shared/services/pi-text-block-categories.service.ts (NEW);
frontend/src/app/shared/services/pi-text-block-categories.service.spec.ts (NEW);
frontend/src/app/pages/doc-constructor/texts/texts.page.ts;
frontend/src/app/pages/doc-constructor/texts/texts.page.spec.ts;
frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts;
frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.spec.ts;
frontend/src/app/app.routes.ts;
docs/pages/texts.page.md;
docs/pages/categories.page.md.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. После TZ-DOC-315 backend отдаёт `GET /api/text-block-categories` и
   принимает `categoryId` в create/update TextBlock. UI пока НЕ
   использует эти endpoints.

2. Страница `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
   — каталог блоков с поиском, сортировкой и переключением активности.
   Колонки: «Название / Конфигурация / Статус / Действия».

3. Редактор `text-block-editor.component.ts` (стр. ~1-160) имеет
   meta-блок с name, columns count и «Активен», но БЕЗ выбора
   категории.

4. Архитектурный референс TZ-DOC-308:
   - страница `frontend/src/app/pages/dictionaries/document-template-categories.page.ts`
     со списком + switch + form-dialog;
   - service `frontend/src/app/shared/services/pi-document-template-categories.service.ts`
     с кэшем активных категорий и инвалидацией (TZ-DOC-309);
   - колонка категории + фильтр в `templates.page.ts`.

5. Пользователь сказал: «все сейчас проанализируй, прочитать все
   грамотно, выставить тех задания…», «сами категории можно создать в
   справочнике, как обычно мы делаем».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1. Создать service
        `frontend/src/app/shared/services/pi-text-block-categories.service.ts`.

   Паттерн зеркалит TZ-DOC-308 / TZ-DOC-309:
   - `list({ activeOnly?: boolean })` → `SilentResult<{ items, total }>`;
     кэш активных на сессию, generation-guard, mutation-инвалидация
     по результатам create/update/remove.
   - `findById(id)` → `SilentResult<TextBlockCategory>`.
   - `create(payload)` / `update(id, payload)` /
     `remove(id)` / `setActive(id, isActive)`.
   - Префикс URL: `/text-block-categories` (project `API_BASE_URL`).

   SPEC: `pi-text-block-categories.service.spec.ts` покрывает:
   cache hit/miss, activeOnly filter, concurrent in-flight requests,
   mutation invalidation, 4xx/5xx surfacing.

ШАГ 2. Создать страницу справочника
        `frontend/src/app/pages/dictionaries/text-block-categories.page.ts`.

   Шаблон — TZ-DOC-308 референс. Что обязательно:
   - Заголовок «Категории текстовых блоков».
   - Кнопка `+ Категория` → открывает form-dialog.
   - Список строк: Название · Slug · isDefault · isSystem ·
     Активность (switch) · Действия (edit / delete).
   - Поведение:
     - isSystem=true → действия edit (кроме toggle active) и delete
       DISABLED; tooltip «Системная категория, только seed».
     - Delete → `confirm` диалог; после confirm запрос DELETE; при
       409 `in_use` → toast «Используется в N блок(ах)».
     - Switch активности вызывает `PATCH /:id/activate`.
   - Состояния: loading skeleton / error с «Повторить» /
     empty «Категорий пока нет» / search по name+slug.

ШАГ 3. Создать form-dialog
        `frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts`.

   Поля:
   - Название (required, 1..128).
   - Slug (optional, hint «оставьте пустым — сервер сгенерирует»).
   - Описание (optional textarea).
   - Активна (switch).
   - По умолчанию для новых блоков (switch; require server-side
     «switch off other default», см. TZ-DOC-315 contract — UI снимает
     локально, сервер подтверждает; при 409 показывает toast и
     откатывает switch).
   - sortOrder (number input ≥ 0).

   Валидация:
   - Whitelist-стиль PiDialog (sticky-footer, max-height: 90vh,
     body scroll).
   - canSubmit: name non-empty И slug либо пустой, либо
     `[a-z0-9-]+` И catalog loading не идёт И форма не submitting.

ШАГ 4. Регистрация маршрута и навигации:

   - `app.routes.ts` (или `index.routes.ts` если dictionaries —
     отдельный lazy bundle): путь `/dictionaries/text-block-categories`
     с `loadComponent: () => import('./text-block-categories.page')`;
     guard: `authGuard` + capability `text-block-category:read`
     (если есть capability-mapper — соединить, иначе RBAC role-check).
   - `app-layout.component.ts`: пункт навигации в секции
     «Справочники» — «Категории текстов» (icon: Tag).
   - `categories.page.md` дополнить ссылкой на новый справочник.

ШАГ 5. Интеграция в каталог текстов
        `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`.

   - Колонка «Категория» → бейдж с `name` категории (если есть
     categoryId) или прочерк.
   - Сверху каталога: filter dropdown «Категория» с активными
     категориями (из `PiTextBlockCategoriesService.list({ activeOnly:
     true })`); пустое значение «Все».
   - При выборе фильтра → локальный фильтр по `categoryId === id`.
     Если фильтр сброшен — все блоки.
   - Сохранять существующие search/sortDir/activeOnly flow без
     регрессии.

ШАГ 6. Интеграция в редактор блока
        `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts`.

   В meta-панели (там же, где name и Активен) добавить:
   - бейдж текущей категории (если есть);
   - select «Категория» с активными категориями;
     onChange эмитит `categoryChange`, который родитель
     прокидывает в `save` payload (`categoryId`).

   Subtle: для new-block без выбора UI показывает «Будет назначена
   автоматически (default)» — это серверное поведение TZ-DOC-315,
   пользователь должен это понимать.

ШАГ 7. Texts page spec / editor spec:

   Расширить `texts.page.spec.ts` и `text-block-editor.component.spec.ts`:
   - texts.page filter dropdown: выбор категории фильтрует rows;
     отображение бейджа категории; loading/error/empty для нового
     фильтра.
   - editor select: изменение эмитит categoryChange; save payload
     содержит правильный categoryId; undefined → не отправляется;
     серверный default применяется на бэкенде.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

СОЗДАТЬ:
- frontend/src/app/shared/services/pi-text-block-categories.service.ts
- frontend/src/app/shared/services/pi-text-block-categories.service.spec.ts
- frontend/src/app/pages/dictionaries/text-block-categories.page.ts
- frontend/src/app/pages/dictionaries/text-block-categories.page.spec.ts
- frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts
- frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.spec.ts

ИЗМЕНИТЬ:
- frontend/src/app/app.routes.ts (или dictionaries/index.routes.ts) —
  lazy route.
- frontend/src/app/layout/app-layout.component.ts — пункт навигации.
- frontend/src/app/pages/doc-constructor/texts/texts.page.ts —
  колонка + filter.
- frontend/src/app/pages/doc-constructor/texts/texts.page.spec.ts —
  новые тесты.
- frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts —
  select категории в meta-блоке.
- frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.spec.ts —
  unit-тесты.
- docs/pages/texts.page.md — таблица категорий и фильтра.
- docs/pages/categories.page.md — ссылка на новый словарь.

НЕ ИЗМЕНЯТЬ:
- backend/* (TZ-DOC-315 уже всё сделал).
- `frontend/src/app/pages/doc-constructor/builder/*` (TZ-DOC-317 там
  рулит picker).
- Materials, Admin/RBAC, TZ-278, Z-backlog, sanitize-html, TZ-MATERIALS-*,
  TZ-BACKEND-E2E-HARNESS.
- package.json / lockfiles.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `/dictionaries/text-block-categories` рендерится, список грузится,
   search/sort работают; loading/error/empty отображаются.
2. Создание категории «Описания» → 201 → строка появляется в списке
   без manual reload (auto-invalidate из service).
3. Переименование категории → новое имя в списке; slug остаётся
   прежним; ссылки в блоках не ломаются.
4. Switch activation деактивирует категорию → в filter dropdown
   она исчезает.
5. Delete на неиспользуемой категории → строка уходит.
6. Delete на используемой категории (хотя бы один блок с этим
   `categoryId`) → 409 → toast «Используется в N блок(ах)», строка
   остаётся.
7. Delete на `isSystem=true` → кнопка DISABLED + tooltip.
8. В каталоге `/doc-constructor/texts` появилась колонка «Категория»
   с бейджем имени категории или прочерком.
9. Filter dropdown «Категория» в каталоге: выбор фильтрует
   строки по `categoryId`; сброс показывает все.
10. В редакторе блока виден select «Категория»: сохранение с
    выбранной категорией → payload содержит `categoryId` ОДИН раз;
    без выбора → payload НЕ содержит `categoryId` (сервер сам
    подставит default).
11. Категории-системы отображаются, но disable для редактирования/
    удаления в НЕ-admin ролях (если applicable).
12. Keyboard navigation, labels, focus ring и 375px layout работают;
    browser console без новых ошибок.
13. Frontend tsc (`pnpm exec tsc -p tsconfig.app.json --noEmit`) — exit 0.
14. Frontend Jest (targeted: новые + расширенные specs) PASS; полный
    прогон без регрессии (689+ тестов).
15. ng build `--configuration=development` PASS.
16. ESLint targeted — 0 errors.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ
═══════════════════════════════════════════════════════════════

1. Открыть `/dictionaries/text-block-categories` → пустое состояние
   или только «Общее».
2. Создать «Реквизиты» → строка появляется.
3. Создать «Описания» → строка появляется.
4. Переименовать «Реквизиты» в «Реквизиты контрагента» → slug
   остался прежним.
5. Сделать «Реквизиты» default (switch.isDefault = true) → в
   редакторе блока при создании нового блока бейдж «По умолчанию».
6. Открыть `/doc-constructor/texts`:
   - Все блоки видны; колонка «Категория» заполнена.
   - Filter «Реквизиты» → только блоки этой категории.
7. Создать новый блок, выбрать «Описания», сохранить.
8. Попробовать удалить «Реквизиты»:
   - если есть блок → 409 toast;
   - если удалили все блоки этой категории → успешно.
9. Reload страницы словаря — состояние сохранилось.
10. 375px viewport — без горизонтального overflow; dropdown
    нормально открывается.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Conventional commit: `feat(text-block): categories reference and picker`.
- Checklist `docs/agent-checklists/TZ-DOC-316.md` создан ДО коммита.
- `docs/pages/texts.page.md` и `docs/pages/categories.page.md`
  обновлены.
- `STATUS.md` обновлён: READY → DONE у этой задачи в archive marker.
- `progress.md` — запись.
- Archive marker
  `tasks/_archive/2026-08/TZ-DOC-316.done.md` создан.
- Lock `.mimocode/locks/TZ-DOC-316-text-block-categories-ui.lock`.
- Push только с явного разрешения владельца.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Если TZ-DOC-315 ещё не закрыт — этот TZ не запускать.
- Авторизованный browser-прогон целиком может попасть в
  `MANUAL_BROWSER_CHECK_REQUIRED` (зависит от dev-stack credentials;
  unit/integration тесты покрывают core behaviour).
- Категории таблиц (`document-table-type`) НЕ затрагиваются —
  пользователь явно сказал «таблицы пока не трогаем».
- Старая enum-категория (`legal/intro/outro/custom`) остаётся в
  схеме и не отображается в UI — backward compatibility на backend.
- Default-switch ровно ОДНО активное значение per scope —
  сервер подтверждает; UI не отправляет лишних запросов.
- TZ-DOC-318 (миграция legacy enum) — преемник, не часть этой задачи.
