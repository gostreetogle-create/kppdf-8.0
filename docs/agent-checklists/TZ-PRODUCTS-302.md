# TZ-PRODUCTS-302 — Verification checklist

**Scope:** frontend only — product form dialog rework (content-variant 1000px,
eyebrow sections, categoryId select, RAL dropdown from ColorReference
dictionary, photo upload) + spec + docs.

**Status:** ✅ DONE (2026-08-02)

## Files changed

| File | Change |
|---|---|
| `frontend/src/app/pages/products/product-form-dialog.component.ts` | Rewritten: `variant="content"` + `maxWidth 1000px` (material DSL), sticky footer via PiDialog contract, sections: «Основные данные» / «Категория и цены» / «Габариты» / «Дополнительно» (weightKg + Цвет/RAL) / «Изображения» / «Описание и заметки» |
| `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` | NEW — 20 unit tests |
| `docs/pages/products.page.md` | NEW RAL/ColorReference section + service table + TZ reference row |

## Contract decisions (documented)

- RAL dropdown from `ColorReferencesService.list({ activeOnly: true })`; option
  value = color `slug`; payload keeps backend string `ralCode` (backend Product
  has NO `colorId` → SUCCESSOR for TZ-PRODUCTS-303; no backend changes made).
- Default selection: `SYSTEM_DEFAULT_COLOR_SLUG` = `ne-vybran` auto-selected
  after successful colors load when ralCode empty (categories default pattern).
- Submit without color → `ralCode` falls back to `SYSTEM_DEFAULT_COLOR_SLUG`.
- Legacy `ralCode` (e.g. «RAL 9003») absent from dictionary → disabled fallback
  option (`colorFallback`), value preserved on edit (unitFallback pattern).
- `ralCode` control has NO maxLength validator — value is now a server-controlled
  slug, not free text (P2 from review; >16-char slug → visible backend 400, not a
  silently disabled Save).
- Photo upload mirrors TZ-MATERIALS-306 (PhotosService, orphan cleanup in
  ngOnDestroy via `submitted` flag); Product has `photoIds` only (no mainPhotoId).
- Double-submit guard via `submitting`; dialog stays open on API error.

## Verification gates

| Gate | Result |
|---|---|
| `pnpm exec jest --no-coverage --runInBand src/app/pages/products/product-form-dialog.component.spec.ts` | **20/20 PASS** |
| `pnpm exec jest --no-coverage --runInBand src/app/shared/ui/dialog` | **45/45 PASS** |
| `pnpm exec tsc -p tsconfig.app.json --noEmit` (my scope) | clean (project-wide errors only in parallel-session files: `people.page.ts`, `people-form-dialog.component.ts`, missing `workers.service.ts` — TZ-WORKERS-302 territory) |
| `pnpm exec ng build --configuration=development` | FAILS only on parallel-session files (TZ-WORKERS-302: unterminated strings in people/*, missing workers.service; pre-existing uncommitted WIP, out of scope) |
| `git diff --check` (my staged files) | clean |
| `bash OrchestratorKit/verify-status.sh` | PASS |

## Browser scenario (manual)

1. Открыть «Продукция» → «Создать продукт».
2. Диалог — content 1000px, секции с eyebrow-заголовками, sticky footer.
3. «Цвет (RAL)» — dropdown из справочника, swatch-превью выбранного hex,
   по умолчанию «Не выбран» (`ne-vybran`).
4. Пустой справочник → подсказка + кнопка «Открыть справочник цветов»
   (`/color-references`).
5. Выбрать цвет → submit → payload `ralCode` = slug.
6. Без выбора → `ralCode` = `ne-vybran`. Ошибка API → диалог остаётся открытым.

**Browser status:** MANUAL_BROWSER_CHECK_REQUIRED (dev-stack not run).
