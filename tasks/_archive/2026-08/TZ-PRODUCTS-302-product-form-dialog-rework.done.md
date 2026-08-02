# TZ-PRODUCTS-302 — DONE (реворк диалога товара + RAL dropdown)

**Date:** 2026-08-02
**Outcome:** DONE — `ProductFormDialogComponent` переписан на большой
content-диалог (1000px, sticky footer), поля сгруппированы в eyebrow-секции,
добавлены categoryId-select (CategoriesService, тип 'product') и RAL dropdown
из справочника цветов (ColorReferencesService, TZ-PRODUCTS-301),
фото-загрузка по паттерну TZ-MATERIALS-306.
**Layer:** 3 (frontend; backend НЕ изменялся).

## Что сделано

- `variant="content"` + `[maxWidth]="'1000px'"` (DSL-зеркало material-form-dialog),
  sticky footer через PiDialog contract.
- Секции: «Основные данные» (name/sku/kind/unit/subcategory/status),
  «Категория и цены» (categoryId select + listPrice + isActive), «Габариты»
  (L/W/H+unit), «Дополнительно» (weightKg + Цвет/RAL), «Изображения»
  (photoIds, upload/remove + orphan-cleanup), «Описание и заметки».
- RAL dropdown: активные цвета из `/api/color-references`; option value = slug;
  swatch-превью выбранного hex; loading/error/empty состояния; пустой
  справочник → hint + кнопка «Открыть справочник цветов» (`/color-references`);
  дефолт `SYSTEM_DEFAULT_COLOR_SLUG` ('ne-vybran') авто-выбирается после
  успешной загрузки; legacy ralCode вне справочника → disabled fallback-опция.
- Submit: double-submit guard (`submitting`), диалог остаётся открытым при
  ошибке API, toast + close(result) при успехе; `payload.ralCode` падает на
  SYSTEM_DEFAULT_COLOR_SLUG при пустом выборе.
- Спека: NEW, 20 unit-тестов (рендер опций в DOM, loading через Subject,
  error, empty, дефолт, выбор цвета, legacy fallback, payload, double-submit,
  error-stays-open, фото, cancel, navigate).

## Контракт (зафиксировано)

- `colorId` в backend Product НЕТ — payload сохраняет строковый `ralCode`;
  цветовой FK-контракт — **SUCCESSOR для TZ-PRODUCTS-303**.
- Значение опции = `slug` цвета (не `_id`); рендерится name + hex.
- Категории: `CategoriesService.list('product')`, пусто = «Без категории».

## Изменённые файлы (3)

| Файл | Δ |
|---|---|
| `frontend/src/app/pages/products/product-form-dialog.component.ts` | rewritten (content 1000px, секции, categoryId select, RAL dropdown, фото) |
| `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` | NEW (20 unit) |
| `docs/pages/products.page.md` | +RAL/ColorReference секция, сервисы, TZ-строка |

## Тесты и проверки

- jest product-form-dialog: **20/20 PASS** (1 suite).
- jest dialog suite: **45/45 PASS**.
- tsc `-p tsconfig.app.json --noEmit` (мой scope): чисто.
- ng build: падает ТОЛЬКО на параллельно-сессионных файлах
  (TZ-WORKERS-302: `people.page.ts`/`people-form-dialog.component.ts`
  unterminated strings, `index.ts` экспортирует отсутствующий
  `workers.service`; все — untracked/WIP, не в HEAD, вне моего scope).
- `git diff --check`: чисто. `verify-status.sh`: PASS.

## Code review

P0/P1 — нет. P2 исправлены:
1. `maxLength(16)` на ralCode убран — значение теперь server-controlled slug
   справочника, а не свободный текст (длинный slug даёт видимый 400, а не
   молча disabled Save).
2. Добавлены DOM-тест рендера опций (#prod-ral option) и тест loading-состояния
   через Subject (colorsLoading in-flight).
Дополнительно зафиксировано: каждый save теперь шлёт `ralCode` (fallback
'ne-vybran') — это требование ТЗ («submit без цвета допустим, fallback на
SYSTEM_DEFAULT_COLOR_SLUG»), отражено в спеке и docs.

## Browser / E2E

Полный browser-флоу не выполнялся (dev-stack не запущен) →
**MANUAL_BROWSER_CHECK_REQUIRED** (сценарий в checklist).

## Что намеренно НЕ изменялось

- backend (любой модуль, включая color-reference — COMMITTED TZ-PRODUCTS-301);
- TZ-PRODUCTS-305 showcase-cards; shared/ui/card/*;
- `frontend/src/app/shared/services/index.ts` (грязный от параллельной
  сессии TZ-WORKERS-302 — не трогал);
- people/*, workers.service (TZ-WORKERS-302 territory);
- categories.page.ts (TZ-DOC-308 territory);
- package.json / lock-файлы.

## Successors

- **TZ-PRODUCTS-303** — `colorId` FK на ColorReference (backend + frontend).
- **TZ-PRODUCTS-304** — каталог продуктов с раскрытием модулей.


## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
implementation_commit: e1f9916
verification:
  jest_product_form_dialog: 20/20 PASS
  jest_dialog_suite: 45/45 PASS
  tsc_my_scope: clean
  ng_build: BLOCKED by parallel-session files (TZ-WORKERS-302, out-of-scope)
  git_diff_check: clean
  verify_status: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED
known_limitations:
  - ng build fails only on parallel-session files (people.page.ts / people-form-dialog / missing workers.service) — TZ-WORKERS-302 territory, not touched
  - every product save now sends ralCode (fallback ne-vybran) per TZ requirement
lock_file: .mimocode/locks/TZ-PRODUCTS-302-product-form-dialog-rework.lock
successors: [TZ-PRODUCTS-303 (colorId FK), TZ-PRODUCTS-304 (expandable catalog)]
```
