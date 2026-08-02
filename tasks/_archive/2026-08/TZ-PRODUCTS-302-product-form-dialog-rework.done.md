# TZ-PRODUCTS-302 — DONE (ProductFormDialog rework: content DSL + RAL dropdown)

**Date:** 2026-08-02
**Outcome:** DONE — product-form-dialog полностью переработан: широкий content-диалог (1000px, sticky footer), секционная форма, searchable RAL dropdown из справочника цветов (TZ-PRODUCTS-301).
**Layer:** 3 (frontend).

## Что сделано

**`frontend/src/app/pages/products/product-form-dialog.component.ts` — полный rework:**
- `variant="content"` + `[maxWidth]="'1000px'"` — широкий content-DSL со sticky footer (PiDialog contract: panel `flex flex-col max-h-[90vh] min-h-0`, body `flex-1 min-h-0 overflow-y-auto`, footer `shrink-0 sticky bottom-0 bg-paper`). «Сохранить» никогда не уходит за экран.
- Секции (eyebrow-заголовки): Основные данные (name/sku/kind/unit/status) → Категория (dropdown из `CategoriesService.list('product')` + подкатегория) → Цены (listPrice/isActive) → Габариты (L/W/H + dimUnit) → **Цвет (RAL)** → Вес → Описание/Заметки → Изображения (фото-upload).
- **RAL dropdown**: загрузка активных цветов через `PiColorReferencesService.list({ activeOnly: true })` (кэш TZ-DOC-309); поиск в dropdown по name/slug; «Не выбран» → `ralCode = null`; пустой справочник → hint + ссылка `/dictionaries/color-references` (admin/manager-only, зеркало guard); legacy ralCode (нет в активном списке) → disabled-fallback (unitFallback паттерн TZ-MATERIALS-302).
- **Значение = `ColorReference.slug`** (стабильный ключ), НЕ hex/_id. Seed «Не выбран» = `ne_vybran`.

**Исправления по code review (P1/P2):**
- **P1: clear-to-null выпадал из PATCH.** `payload.ralCode`/`payload.categoryId` теперь шлются ВСЕГДА (включая явный `null`); backend `update` = `Object.assign(doc, dto)` → `$set` применяет null и поле реально очищается. UI рекламирует «Не выбран» → сервер обязан очистить. Интерфейсы `Product.ralCode`/`categoryId` widened до `string | null` (products.service.ts + зеркало models/products.ts).
- **P2: удаление существующего фото не удаляло файл.** `removePhoto()` копит `pendingPhotoDeletions`; реальный `photosService.remove` — ПОСЛЕ успешного save (atomic, TZ-MATERIALS-306 паттерн). На cancel — только orphan-загрузки этой сессии (`cleanupOrphanUploads` в `ngOnDestroy`).
- **P3: тест-пробелы закрыты** — +4 теста (clear-null payload, upload→photoIds, orphan cleanup, deferred delete).
- **`selectedColor` — метод, НЕ computed()**: classic reactive-form значения не сигналы → computed кешировал бы stale null после `selectColor()`. Пойман тестом `RAL: selectedColor resolves…` и исправлен.

**Регрессия:** legacy create/update payload (name/kind/unit/status/isActive/sku/subcategory/listPrice/dimensions/weightKg/description/notes/photoIds) и data-test атрибуты сохранены; добавлены `categoryId` + `photoIds`.

**Spec (NEW):** `product-form-dialog.component.spec.ts` — 20 тестов (smoke content-variant, загрузка цветов/категорий, RAL select/search/clear/fallback/empty/admin-link, create payload, edit prefill+PATCH, edit clear→null, photo upload/orphan/deferred-delete, validation, cancel, API error, double-submit).

**Docs:** `docs/pages/products.page.md` — секция ProductFormDialog (TZ-PRODUCTS-302).

## Гейты (все зелёные)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **exit 0**
- `cd frontend && pnpm exec jest product-form-dialog --no-coverage --runInBand` — **20/20 PASS**
- `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — **825/826 PASS**; единственный fail = pre-existing `button.component.spec.ts` (baseline проверен stash'ем в 301, файл не мой, интерфейс-widening не регрессия)
- `cd frontend && pnpm exec ng build --configuration=development` — **exit 0**
- `git diff --check` — clean

## Что НЕ изменялось намеренно

- Backend — НЕ трогался в 302 (301 уже закоммичен `610fd4b`).
- TZ-DOC-*, TZ-MATERIALS-*, TZ-MODULES-*, TZ-WORKERS/WORKTYPES, TZ-BACKEND-E2E-HARNESS, TZ-278, TZ-DOC-308 categories.page.ts (pre-existing), Z-backlog, desktop/, sanitize-html, TZ-DOC-321 (text-block seed — parallel agent).
- package.json / lock-файлы.

## Lock

`.mimocode/locks/TZ-PRODUCTS-302-product-form-dialog-rework.lock` — создан до старта, финализирован (gitignored).

## Conventional commit (push НЕ выполнялся — ждёт владельца)

`feat(products): rework product form dialog with RAL dropdown (TZ-PRODUCTS-302)`

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
closed_by: autonomous-frontend-agent (Buffy)
source_task: tasks/TZ-PRODUCTS-302-product-form-dialog-rework.md
implementation_commit: <filled-on-commit>
prerequisite: TZ-PRODUCTS-301 (610fd4b) — PiColorReferencesService + справочник «Цвета»
verification:
  - frontend_tsc: PASS
  - jest_product_form_dialog: 20/20 PASS
  - jest_frontend_full: 825/826 PASS (1 pre-existing button.component.spec.ts failure — baseline, не регрессия)
  - ng_build_dev: PASS (exit 0)
  - git_diff_check: clean
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack не поднимался; контракт доказан unit-тестами + ng build)
known_limitations:
  - TZ-DOC-308 categories.page.ts — pre-existing blocker из основного worktree (в этом билде ng build прошёл; не fix-force)
  - frontend полный jest: 1 pre-existing failure в button.component.spec.ts — baseline-проверен stash'ем в 301, НЕ регрессия
  - фото: удаление существующего фото с сервера — ПОСЛЕ успешного save (atomic); при провале save фото остаётся orphan'ом (документированное поведение материалов-паттерна)
protected_files:
  - frontend/src/app/pages/products/product-form-dialog.component.ts (+ spec)
  - frontend/src/app/shared/services/products.service.ts (Product.ralCode/categoryId widening)
  - frontend/src/app/shared/models/products.ts (зеркало, unused)
  - docs/pages/products.page.md
not_changed:
  - backend (301 territory, закоммичен 610fd4b)
  - TZ-DOC-321 text-block seed (parallel agent)
  - TZ-MATERIALS-*, TZ-MODULES-*, TZ-DOC-*, TZ-WORKERS/WORKTYPES, Admin/RBAC, Z-backlog
  - package.json / lock-файлы
lock_file: .mimocode/locks/TZ-PRODUCTS-302-product-form-dialog-rework.lock
```
