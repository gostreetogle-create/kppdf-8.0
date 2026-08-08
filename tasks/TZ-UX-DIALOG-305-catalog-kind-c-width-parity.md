═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-305: Catalog kind-C dialog width parity
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-CATALOG-UX-C #2
DEPENDS ON: TZ-UX-COMPOSE-301 DONE (module-form keys пересекаются — строго после)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-UX-DIALOG-305.md
PAGES: catalog FullEditors + composition picker
PAGE_DOCS: ui-dialog-canon.md ; DIALOG-COOKBOOK.md

РОЛЬ АГЕНТА: Frontend Layout Engineer

CONFLICT KEYS:
frontend/src/app/pages/modules/module-form-dialog.component.ts;
frontend/src/app/pages/modules/module-form-dialog.component.spec.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.ts;
frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts;
docs/DIALOG-COOKBOOK.md;
docs/pages/ui-dialog-canon.md;
docs/agent-checklists/TZ-UX-DIALOG-305.md;
docs/audits/2026-08-09-catalog-dialog-width-parity.md;

Проверено: docs/DIALOG-COOKBOOK.md kind C = content + min(1120px, 100vw-2rem);
  material-form + product-form уже kind C; module-form = form width lg (~640);
  composition picker = form xl (~920).

---

## ИСХОДНОЕ

PO: большие диалоги каталога должны совпадать с эталоном (материал/изделие = 1120).
Module FullEditor и пикер состава уже «большие» по смыслу, но ужеже эталона.

## ЧТО ДЕЛАТЬ

ШАГ 1: ModuleForm → kind C

1. `variant="content"` + `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"` как material/product.
2. Sticky footer / body scroll — не сломать.
3. Opener на modules list/detail не должен перебивать ширину меньшим `width`.

ШАГ 2: Composition picker → та же ширина эталона

1. Большой пикер «Добавить в состав» → `maxWidth: min(1120px, calc(100vw - 2rem))`
   (content или form+maxWidth — как удобнее shell, визуально = kind C).
2. Overflow-select / add-and-continue без регресса.

ШАГ 3: Audit note + cookbook

1. Короткий audit `docs/audits/2026-08-09-catalog-dialog-width-parity.md`:
   таблица product / module / material FullEditor + composition picker = 1120.
2. Cookbook: явно «catalog FullEditor **и** composition picker = kind C width».

## НЕ ИЗМЕНЯТЬ

- Kind A/B inventory tiny dialogs (560/640) — не раздувать
- table-template kind D 1400
- FORM-307 contracts/orgs/work-types (peer keys)
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. ModuleForm и composition picker visually/CSS max-width = эталон material (1120 clamp).
2. Product + material FullEditor без регресса.
3. Audit + cookbook обновлены.
4. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- module-form-dialog|product-composition-picker
   ```
5. Archive + commit/push; deploy NO.
