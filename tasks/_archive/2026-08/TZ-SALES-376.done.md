# TZ-SALES-376 DONE — geometry-aware KP page split from table frame

```
ARCHIVE_MARKER
task: TZ-SALES-376
outcome: DONE
closed_at: 2026-08-15T07:30:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 7a619e4c95ceebc64aef45a42e47208437a46516
closeout_sha: c761a004
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-376.md)
  - backend tsc: PASS
  - document-template Jest: PASS (67)
  - frontend tsc: PASS
  - proposal-create Jest: PASS (61)
  - Cursor verdict: PASS
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - backend/src/modules/document-template/document-template.service.ts
  - backend/src/modules/document-template/document-template.assets.spec.ts
  - backend/src/modules/table-template/table-template.service.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
  - docs/pages/proposals-create.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md
```

## Delivered

- `estimateAutoRowCapacity`: slotPx from table block `layout.height`; minus thead; rowPx from bodyFont/photo; clamp 1…200; fallback 20/25 without height.
- `splitPreviewLines`: capacity loop + `pageBreakBefore` hard cut.
- `resolveTableBlock`: last-page totals from full `allPreviewLinesForTotals`, not page slice.
- Build CSS: `.block--positioned.block--table { overflow: hidden }`.
- Create КП inspector: RU hint «0 — автоматически по рамке…» under rows inputs.
- Specs + docs + PAGE-TZ-INDEX note **376**.

## НЕ

- Deploy / wipe
- ContinuationMode / per-page templates (**TZ-SALES-377** park)
- AUTH-305, catalog, table editor chrome (374), products rail (375)

---

# TZ-SALES-376 — active marker (archived)

- task: TZ-SALES-376-kp-geometry-aware-page-split
- spec: `tasks/TZ-SALES-376-kp-geometry-aware-page-split.md`
- status: DONE
- claimed_by: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T07:26:00Z
- closed_at: 2026-08-15T07:30:00Z
- workspace: D:\kppdf-8.0
- conflict_keys: backend/src/modules/document-template/document-template.service.ts · document-template.assets.spec.ts · table-template.service.ts · proposal-create-inspector.component.ts · docs/pages/proposals-create.page.md · docs/pages/PAGE-TZ-INDEX.md · docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md
- vs AUTH-305: OK (no overlap)
- deploy: NO
- note: Geometry-aware splitPreviewLines; pageBreakBefore; clip; full totals; RU hint. Cursor PASS.

---

# TZ-SALES-376: Страницы КП по рамке таблицы (geometry-aware split)

РОЛЬ АГЕНТА: Full-stack (document build split + Create КП «Вид листа» copy)

ЗАВИСИМОСТИ: SALES-346 DONE (multipage pipeline); SALES-374/375 DONE; AUTH-305 keys OK

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts ; backend/src/modules/document-template/document-template.assets.spec.ts ; backend/src/modules/table-template/table-template.service.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md

Spec: `tasks/TZ-SALES-376-kp-geometry-aware-page-split.md`

## КРИТЕРИИ ПРИЁМКИ (met)

1. Create КП с `rowsFirstPage=0`, `rowsNextPage=0`, низкая рамка таблицы + много позиций → ≥2 страницы до визуального вылета.
2. Ручные rowsFirst/Next > 0 режут по числам.
3. `pageBreakBefore` создаёт новую build-страницу.
4. Итог на последней странице = полный КП.
5. Gates: BE tsc + document-template 67 + FE tsc + proposal-create 61 PASS.
6. Cursor PASS → archive/lock/closeout.

## known_limitation

- Auto capacity — оценка, не layout engine; экстремально высокие photo/large rows могут clip внутри страницы.
- Per-page templates / continuation background — **TZ-SALES-377** (PARK backlog), не этот TZ.
