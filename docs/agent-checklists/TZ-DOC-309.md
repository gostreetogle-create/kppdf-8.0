# TZ-DOC-309 — Диалог создания шаблона: мгновенное открытие (кэш категорий)

> Checklist до первой production-правки (конвенция GEMINI.md / AI-AGENT-GUIDE).

## Scope

Только мгновенное открытие `TemplateSetupDialogComponent`:

- `frontend/src/app/shared/services/pi-document-template-categories.service.ts` — кэш активных категорий + инвалидация.
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts` — использовать кэш, не блокировать открытие.
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts` — regression-тесты.
- `frontend/src/app/shared/services/pi-document-template-categories.service.spec.ts` — НОВЫЙ spec кэша (по конвенции `pi-document-templates.service.spec.ts`).

## Dependencies

- TZ-DOC-308 (client категорий) — завершён.
- TZ-DOC-311 (pageNumbering, убраны toc/header/footer из UI) — завершён, не регрессировать.
- TZ-DOC-268 (submit-guard диалога) — завершён, не трогать механику `submitted`.

## Conflict keys

- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts`
- `frontend/src/app/shared/services/pi-document-template-categories.service.ts`
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts`

Проверено перед стартом: active TZ-278 / TZ-MATERIALS-307..309 не затрагивают эти файлы (см. `tasks/README.md`, Team Room inbox — старые smoke).

## Protected paths

- НЕ менять backend/API контракты (GET/POST/PATCH/DELETE `/document-template-categories`).
- НЕ менять механику закрытия/валидации диалога (TZ-DOC-310 scope).
- НЕ менять канвас, рендерер, инспектор блоков (TZ-DOC-311/312/313 scope).
- НЕ менять чужие незакоммиченные правки: Materials/ProductModule, TZ-278, `desktop/src-tauri/Cargo.lock`, Z-backlog, `docs/README.md`, низ `progress.md`/`STATUS.md`.

## Cache / invalidation design

**Решение: Вариант A из ТЗ — модульный кэш на уровне сервиса.**

- В `DocumentTemplateCategoriesService` добавляется поле-кэш активных категорий
  (`private activeCache: DocumentTemplateCategory[] | null = null`).
- `list({ activeOnly: true })` (без `search`) при наличии кэша возвращает
  `of({ ok: true, data: cache })` **синхронно** — второй и последующие запросы не идут в сеть.
- Кэш заполняется ТОЛЬКО при успешном `res.ok` ответе.
- Инвалидация: `create/update/remove` сервиса сбрасывают кэш (после успешного ответа —
  через `tap`), чтобы справочник категорий и CRUD-страница подхватывали свежие данные.
- Политика: кэш живёт до первой мутации категорий (create/update/remove) — без глобального
  бесконечного кэша, без TTL (категорий мало, меняются редко, инвалидация по мутациям достаточна).
- Другие потребители: `templates.page.ts` (фильтр категорий, `list({activeOnly:true})`) —
  также выигрывает от кэша, без изменений его кода. Справочник категорий
  (`document-template-categories.page.ts`) вызывает `list()` (все категории) — не кэшируется,
  всегда свежий.

**Диалог:** в конструкторе сначала проверяется кэш. Если кэш есть — select и default-категория
рендерятся сразу (без loading). Если нет — обычный `loadCategories()` с loading/error/empty
состояниями для холодного первого открытия.

## Acceptance criteria

1. Повторное открытие диалога (builder + templates) не показывает «Загрузка категорий…»
   и не делает повторный GET категорий.
2. Select категории виден сразу; активная default-категория автовыбирается синхронно из кэша.
3. Холодное первое открытие (пустой кэш) корректно показывает loading/error/empty.
4. Создание/изменение/удаление категории инвалидирует кэш — следующие открытия свежие.
5. `pageNumbering` (TZ-DOC-311) продолжает передаваться без регрессии.
6. Frontend typecheck, targeted Jest, `git diff --check` проходят.

## Tests

1. Service spec (НОВЫЙ): первый `list({activeOnly:true})` → 1 GET; второй → 0 GET (кэш);
   успешный ответ заполняет кэш; `create/update/remove` инвалидируют; `list()` без
   `activeOnly` не кэшируется.
2. Dialog spec: при кэше select рендерится сразу, loading не показывается, default выбран;
   при пустом кэше ровно один GET; существующие тесты (TZ-DOC-268/308) зелёные.
3. Targeted Jest: template-setup-dialog + service spec + builder.page.spec (регрессия).

## Commands

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --no-coverage --silent --testPathPattern "template-setup-dialog|pi-document-template-categories|builder.page"
cd frontend && pnpm exec ng build --configuration=development
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit   # не трогаем backend, но sanity
git diff --check
bash OrchestratorKit/verify-status.sh
```

## Browser scenario

1. Открыть `/doc-constructor/builder` → «Создать шаблон» → диалог открывается сразу,
   категория выбрана.
2. Закрыть → снова «Создать шаблон» → мгновенно, без loading, без повторного GET
   (Network tab: 1 запрос категорий за сессию).
3. Повторить на `/doc-constructor/templates`.
4. Viewport 375px — форма не ломается.

## Known limitations

- E2E/browser-проверка зависит от доступности dev-stack/авторизации — если нет,
  фиксируется `MANUAL_BROWSER_CHECK_REQUIRED`.
- Кэш сессионный (in-memory): перезагрузка страницы очищает его — это ожидаемо.
