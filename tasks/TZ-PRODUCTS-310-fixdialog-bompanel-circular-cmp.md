═══════════════════════════════════════════════════════════════
TZ-PRODUCTS-310: Fix edit изделие — circular ɵcmp
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Architect / UI Engineer
ЗАВИСИМОСТИ: Нет — **P0 первый в волне** (ломает демо edit)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/products/product-bom-panel.component.ts; frontend/src/app/pages/products/product-form-dialog.component.ts; frontend/src/app/pages/products/product-bom-panel.component.spec.ts; frontend/src/app/pages/products/product-form-dialog.component.spec.ts; docs/agent-checklists/TZ-PRODUCTS-310.md

PAGES: /products ; /products/:id
PAGE_DOCS: products.page.md

Проверено (2026-08-10):
- `product-form-dialog.component.ts` imports `ProductBomPanelComponent` (PRODUCTS-309).
- `product-bom-panel.component.ts` imports `ProductFormDialogComponent` for `openEditSelected()` product branch.
- List «Создать» → QuickCreate (DICT-316); **edit** → `dialog.open(ProductFormDialogComponent)`.
- Runtime: `Cannot read properties of undefined (reading 'ɵcmp')` — classic circular ESM: one side of the cycle is `undefined` in `imports: [...]` / `dialog.open(...)`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO: в каталоге нельзя редактировать изделия; в колокольчике/консоли `ɵcmp`.

Create может «жить» (QuickCreate без BomPanel). Edit FullEditor тянет BomPanel → цикл → undefined component.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Разорвать цикл (выбрать ONE; предпочтение A)

**A (предпочтительно):** в `product-bom-panel` убрать static import FormDialog.
  - Для kind===`product`: `import('./product-form-dialog.component').then(m => this.dialog.open(m.ProductFormDialogComponent, …))`
  - Или thin helper `product-editor-opener.ts` без обратного импорта BomPanel.

**B:** BomPanel не открывает nested ProductFormDialog изнутри FullEditor product (только navigate to `/products/:id` + edit там) — хуже UX, только если A сложно.

Не оставлять static `import { ProductFormDialogComponent } from './product-form-dialog.component'` в bom-panel.

ШАГ 2: Проверить другие циклы
  - ModuleFormDialog ↔ BomPanel на module-detail — grep; починить тем же паттерном если есть.
  - MaterialFormDialog обычно ok (односторонний).

ШАГ 3: Регрессия
  - Edit с `/products` открывает FullEditor без ɵcmp.
  - Edit mode показывает `data-test="product-bom-panel"`.
  - Nested «Редактировать» выбранное изделие-в-составе тоже открывается (после dynamic import).
  - Jest: form-dialog + bom-panel suites green; при возможности тест/коммент что static cycle отсутствует.

ШАГ 4: Page doc one-liner + archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Composition write-path / picker qty (UX-DIALOG-306)
- Article required (CATALOG-338)
- deploy.ps1

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Browser: `/products` → ✎ / Редактировать → диалог «Редактировать изделие» открывается, **нет** ошибки `ɵcmp`.
2. В edit виден состав (BomPanel).
3. `madge`/`pnpm circular` (если есть скрипт) не показывает cycle form-dialog ↔ bom-panel; иначе grep: нет static взаимных import.
4. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm exec jest product-form-dialog.component.spec.ts product-bom-panel.component.spec.ts --runInBand`
5. Executor report (auto) + archive `tasks/_archive/2026-08/TZ-PRODUCTS-310.done.md` + commit/push.

known_limitation: deep nested edit-of-edit UX polish out of scope.
