# TZ-PRODUCTS-302 — ProductFormDialog rework (content DSL + RAL dropdown)

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Layer 3 (frontend). Второй в цепочке Products (зависит от TZ-PRODUCTS-301 — PiColorReferencesService).

- `frontend/src/app/pages/products/product-form-dialog.component.ts` — полный rework:
  - `variant="content"` + `[maxWidth]="'1000px'"` (широкий content-DSL, sticky footer — PiDialog contract).
  - Секции: Основные данные (name/sku/kind/unit/status) → Категория (dropdown из `CategoriesService.list('product')` + подкатегория) → Цены (listPrice/isActive) → Габариты (L/W/H + dimUnit) → **Цвет (RAL)** → Вес → Описание/Заметки → Изображения (фото-upload TZ-MATERIALS-306).
  - RAL dropdown: HTTP-загрузка активных цветов через `PiColorReferencesService.list({ activeOnly: true })` (кэш TZ-DOC-309), поиск в dropdown по name/slug, «Не выбран» очищает `ralCode` → null, «нет нужного цвета» → ссылка на `/dictionaries/color-references` (admin/manager-only), legacy ralCode → disabled fallback.
- `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` (NEW, 20 tests).
- `frontend/src/app/shared/services/products.service.ts` + `shared/models/products.ts` — `Product.ralCode`/`categoryId` widened до `string | null` (явный null в PATCH очищает поле на сервере).
- `docs/pages/products.page.md` — секция про rework-диалог.

## Dependencies

- TZ-PRODUCTS-301 (PiColorReferencesService + справочник «Цвета») — ЗАВЕРШЕН, commit `610fd4b`.
- Референсы: TZ-MATERIALS-301 (content-dialog), TZ-MATERIALS-302 (unitFallback), TZ-MATERIALS-306 (фото upload + orphan cleanup), TZ-DOC-309 (cache), TZ-DOC-307/315 (sparse-unique).

## Conflict keys

- `frontend/src/app/pages/products/product-form-dialog.component.ts` (+ spec)
- `frontend/src/app/shared/services/products.service.ts` (интерфейс Product — widening null)
- `frontend/src/app/shared/models/products.ts` (зеркальный интерфейс, unused mirror)
- `docs/pages/products.page.md`

## Protected paths

- TZ-DOC-* (doc-constructor, template-block), TZ-MATERIALS-* (materials, material), TZ-MODULES-*, TZ-WORKERS/WORKTYPES, TZ-BACKEND-E2E-HARNESS, TZ-278, TZ-DOC-308 categories.page.ts (PRE-EXISTING BLOCKER), Z-backlog, desktop/, sanitize-html, TZ-DOC-321 (text-block seed — parallel agent).
- backend НЕ трогается в 302 (301 уже закоммичен).
- package.json / lock-файлы.

## Решения (зафиксированы)

1. **Значение RAL = `ColorReference.slug`** (стабильный ключ), НЕ hex и НЕ _id. Seed «Не выбран» = `ne_vybran`. Backend `Product.ralCode` остаётся строкой (`@Length(0,16)`).
2. **`selectedColor` — метод, НЕ computed()**: форма (classic reactive) — НЕ сигналы; computed() кешировал бы stale null после `selectColor()`. (Пойман тестом — fixed.)
3. **Явный null в PATCH**: `ralCode`/`categoryId` шлются ВСЕГДА (включая null), т.к. backend `update` = `Object.assign(doc, dto)` — `$set` применяет null и поле реально очищается. UI рекламирует «Не выбран» → сервер должен очистить.
4. **Удаление фото — отложенное (atomic)**: `removePhoto()` только убирает из `photos()` + копит `pendingPhotoDeletions`; реальный DELETE после успешного save (паттерн TZ-MATERIALS-306). На cancel — ничего не удаляется, кроме orphan-загрузок этой сессии (`cleanupOrphanUploads` в `ngOnDestroy`).
5. **Payload-регрессия**: legacy поля (name/kind/unit/status/isActive/sku/subcategory/listPrice/dimensions/weightKg/description/notes/photoIds) сохранены.

## Acceptance criteria (все выполнены)

1. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0. ✅
2. `cd frontend && pnpm exec jest product-form-dialog --no-coverage --runInBand` — 20/20 PASS. ✅
3. `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — 825/826 PASS; единственный fail = pre-existing `button.component.spec.ts` (baseline-проверен stash'ем в 301, файл не мой). ✅
4. `cd frontend && pnpm exec ng build --configuration=development` — exit 0 (categories.page.ts blocker отсутствует). ✅
5. `git diff --check` — clean. ✅
6. Code review (code-reviewer-deepseek-flash): P1 — clear-to-null ralCode/categoryId выпадал из PATCH (сервер хранил старое); исправлено явным null. P2 — удаление существующего фото не удаляло файл на сервере; исправлено отложенным delete (atomic). P3 — тест-пробелы; добавлены 4 теста (clear-null, upload→payload, orphan cleanup, deferred delete). ✅

## Тесты (20)

- Smoke (content-variant 1000px), загрузка активных цветов, загрузка категорий (type product).
- RAL: select пишет slug, «Не выбран» → null, search фильтрует, selectedColor резолвит, legacy fallback, empty dictionary admin-link, user-роль без link.
- create payload: legacy поля + ralCode + categoryId.
- edit: prefill + PATCH; **edit clear → явный null в payload**.
- Фото: upload → payload photoIds; orphan cleanup на cancel (remove вызван); **deferred delete существующего фото после успешного save**.
- Валидация (empty name), cancel без сохранения, inline API error, double-submit guard.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — live authenticated flow не запускался (dev-stack не поднимался); контракт доказан unit-тестами (TestBed + NO_ERRORS_SCHEMA template compile) + ng build.

## Known limitations

- TZ-DOC-308 categories.page.ts — пре-экзистинг blocker из основного worktree; в этом билде ng build прошёл (не fix-force).
- `frontend` полный jest: 1 pre-existing failure в `button.component.spec.ts` — НЕ регрессия (baseline проверен stash'ем в 301).
- Фото: удаление существующего фото с сервера происходит ПОСЛЕ успешного save (atomic) — при провале save фото остаётся orphan'ом на сервере (документированное поведение материалов-паттерна).
