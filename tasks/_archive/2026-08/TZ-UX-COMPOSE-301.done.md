# TZ-UX-COMPOSE-301 — DONE

**STATUS:** DONE · WAVE-CATALOG-UX-C #1 (P0 PO) · archived 2026-08-08
**SoT:** `D:\kppdf-8.0` на `main` (push из freebuff claim worktree)
**CHECKLIST:** `docs/agent-checklists/TZ-UX-COMPOSE-301.md` (DONE)

## Что сделано

1. **ModuleForm hint** (`module-form-dialog.component.ts`):
   секция «Состав» с `data-test="composition-hint"` — «Состав (модули и материалы)
   собирается на карточке модуля или в быстром создании (профиль L)».
   Второй write-path / ModuleMaterials **не** возвращён.

2. **Picker `restrictToModule`** (`product-composition-picker-dialog.component.ts`):
   - вкладки переставлены: **Материал | Модуль** (материал — первая по смыслу цеха);
   - `activeKind` default = `'material'` (вкладка «Модуль» остаётся);
   - добавлен hint `data-test="picker-inclusion-hint"` — «В состав модуля можно добавить модуль или материал».

3. **BomPanel root-add без тупика** (`product-bom-panel.component.ts`):
   когда у выбранного узла add-into недоступен (материал/лист), вместо скрытой
   «+ Из каталога» показывается **«+ В корень изделия/модуля»**
   (`bom-add-root-into` → `selectRootAndAdd()`), т.е. добавление в корень всегда достижимо.
   Правила product→product/module не менялись.

4. **Docs**: матрица включённости + root-add в `docs/pages/module-detail.page.md`
   и `docs/pages/product-detail.page.md`.

5. **Бонус-фикс (SELECT-301)**: `quick-create-dialog.component.spec.ts` override
   не включал `PiOverflowSelectComponent`, из-за чего полный сьют падал после
   SELECT-301 (54f933b4) — override дополнен; 3 места.

## Gates

```text
pnpm exec tsc -p tsconfig.app.json --noEmit        → PASS
pnpm test -- product-composition-picker|product-bom-panel|module-form-dialog → 20/20 PASS
pnpm test (полный)                                 → 129 suites / 1212 tests PASS
```

## Файлы

- `frontend/src/app/pages/modules/module-form-dialog.component.ts` (+ spec)
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.ts` (+ spec)
- `frontend/src/app/pages/products/product-bom-panel.component.ts` (+ spec)
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`
- `docs/pages/module-detail.page.md`, `docs/pages/product-detail.page.md`

Deploy: **NO**.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: Buffy / agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - focused tests: PASS (20/20 at closeout; 36/36 reverified after fast-forward)
  - lint: PASS
  - checklist: PRESENT and DONE
  - progress.md: UPDATED in commit 61975a99
  - status synchronization: PASS via wave checkpoint
  - forbidden scopes: FACT-304/materials, FORM-307, products.page, supply/**, desktop/** untouched
  - deploy: NOT RUN
