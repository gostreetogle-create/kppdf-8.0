# TZ-CATALOG-336 — Module detail = product detail A+ layout

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (self — continuous executor AC+gates)

## Delivered

- `/modules/:id` A+ split: left sticky passport (фото cover, артикул, Ш×В×Г, вес, cost-preview) + accordion Фото/Себестоимость/Виды работ; right BOM full height.
- `ProductBomPanel` generalized: `rootKind: 'product' | 'module'`; module root → `getModuleTree` + module composition; legend без «Изделие»; picker `restrictToModule`.
- Legacy showcase I–V / CompositionEditor убраны с главного UX; «Быстрое редактирование» secondary.
- Docs: `module-detail.page.md` A+; `product-detail.page.md` module parity line.
- Specs: module-detail + product-bom-panel module root.

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- Jest `module-detail|product-bom-panel` — 8/8 PASS
- Team Room claim: unavailable (Unknown task)

## Closeout

- Archive + lock + progress + active-map + checklist DONE
- `_active/TZ-CATALOG-336.md` removed

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: continuous-executor-composer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
cursor_verdict: PASS
agent_id: continuous-executor-composer
