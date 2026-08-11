# TZ-OPS-311.done — architecture-check: shared→pages BOM убран

ARCHIVE_MARKER: DONE
outcome: DONE
closed_at: 2026-08-11T16:37:13Z
closed_by: Buffy (freebuff executor)
workspace: D:\kppdf-8.0 (freebuff worktree ddc5da34, base synced to origin/main ca035847)

## Summary
Убрано нарушение `fe-shared-must-not-import-pages`: BOM panel больше не живёт в `pages/products`, а импортирован из `shared/ui/composition` — quick-create-dialog (shared) больше не импортирует `pages/*`.

Сделано (Preference A, thin shared extract):
- `pages/products/product-bom-panel.component.{ts,spec.ts}` → `shared/ui/composition/` (git mv).
- `pages/products/product-composition-picker-dialog.component.{ts,spec.ts}` → `shared/ui/composition/` (единственный потребитель — BOM panel; импорты только shared/core).
- В панели статические импорты `pages/modules/module-form-dialog` и `pages/materials/material-form-dialog` переведены в динамические (`import('../../../pages/…')`) — тот же lazy-паттерн, что уже был у product-form-dialog (без ESM-цикла; один write-path состава сохранён).
- Обновлены импортёры: quick-create (+spec), product-form-dialog, product-detail.page, module-detail.page (+spec) — теперь берут панель из shared.
- `scripts/architecture-check.baseline.json`: 7 → 3 keys (ушли quick-create:52, module-detail:33, bom-panel:41, bom-panel:42; новых нет).

## Acceptance
1. `quick-create-dialog.component.ts` не импортирует из `pages/` — PASS.
2. Состав/BOM в quick-create работает (один write-path) — PASS (jest: quick-create L-create показывает панель; bom-panel spec 10/10… факт: suites PASS).
3. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0).
4. `pnpm architecture:check` PASS; baseline 7 → 3 (не вырос); ключ fe-shared-must-not-import-pages для quick-create удалён — PASS.
5. Executor report ≤15 lines — ниже; archive создан — PASS.

## Gates
- `pnpm architecture:check --write-baseline` → Wrote baseline (3 keys); `pnpm architecture:check` → PASS (914 files, baseline 3, resolved 0).
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0.
- Jest focused: quick-create-dialog, product-bom-panel, product-composition-picker, product-form-dialog → 4/4 suites PASS (63 tests).
- Prettier --check on 10 touched files → PASS (после --write; до правок все были clean).
- ESLint на изменённых файлах → PASS (0 errors).
- Pre-existing (не регрессия, подтверждено на чистом HEAD stash-тестом): `module-detail.page.spec` 3 fail, `products.page.spec` 21 fail — известная нестабильность dictionary-labels/httpResource flush; список известных проблем в AI-AGENT-GUIDE §7.

## Primary / Secondary signal
- Primary: quick-create L-create продолжает рендерить BOM панель (jest `qc-composition-section` + `product-bom-panel` PASS); панель работает из shared во всех 4 callers — met.
- Secondary: tsc PASS; architecture:check PASS; prettier/eslint PASS — PASS.

## Executor report (auto)
- Что: panel + picker moved pages/products → shared/ui/composition; shared больше не импортирует pages; module/material edit-диалоги в панели стали lazy dynamic imports (паттерн product-form).
- Conflict keys: только OPS-311 (quick-create/**, bom-panel*, shared/ui при extract, baseline, checklist). Чужого WIP не тронуто.
- Известные пределы: динамические импорты открывают диалоги на микротаск позже; поведение не меняется. Другие page↔page imports в baseline (proposal-product-rail:22-24) — successor TZ, не трогались.
- Deploy: НЕ. Commit/push: НЕ (ожидает PO).

## Lock
`.mimocode/locks/TZ-OPS-311-shared-bom-extract.lock`
