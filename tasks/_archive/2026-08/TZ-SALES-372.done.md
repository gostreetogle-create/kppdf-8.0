# TZ-SALES-372 DONE — snapshot edit и решение каталога

```
ARCHIVE_MARKER
task: TZ-SALES-372
outcome: DONE
closed_at: 2026-08-14
closed_by: Buffy (predeploy executor)
workspace: D:\\kppdf-8.0
implementation_sha: cbf2e2fe14dc674e688623b332299e85a1c66146
closeout_sha: 728ebf2c
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-372.md)
  - frontend tsc: PASS
  - proposal-create Jest: 45/45 PASS
  - backend tsc: PASS
  - quotation.service Jest: 36/36 PASS
  - Product expectedVersion/duplicate contract: PASS via landed CATALOG-371 focused suite
  - changed-file ESLint: PASS
  - architecture:check: PASS
  - git diff --check: PASS
  - local dev shell smoke: HTTP 200 on /proposals/create?new=1 (port 4200)
  - snapshot/review/copy controlled fixture evidence: PASS
  - checklist: DONE
  - progress.md: closeout update required
  - active marker: removed after archive
  - deploy: NOT EXECUTED
```

## Delivered

- Catalog-linked `Наименование`, `Описание`, `Артикул` and `Ед.` edits remain in the current quotation snapshot; autosave and inline events do not PATCH Product.
- `catalogDirtyFields`, `catalogDecision` and `catalogSourceVersion` survive quotation save, hydrate and F5. Existing historical items without metadata remain non-pending.
- Leaving the table opens one multi-row review with per-row `Только в КП`, `Обновить изделие` and `Создать копию` decisions. Cancel leaves the pending snapshot in the table; × safely chooses КП-only; Escape never mutates Product.
- Product update sends only dirty identity fields plus `expectedVersion`; a 409 leaves the source and snapshot unresolved. Product copy uses the duplicate API and rebinds the edited row; explicit row action copy inserts a new row below; KP row duplication keeps the same Product.
- Essential commercial columns remain visible and commercial quantity/price/discount/optional/row-presentation fields never enter Product synchronization.

## Evidence and known limits

The focused Angular harness covers snapshot editing, no Product call on inline change, safe review resolution, copy/rebind and row duplication. The existing CATALOG-371 suite covers organization isolation, duplicate API and optimistic 409. Module/material source sync and inline media upload remain outside v1. Production, deploy, SSH, nginx, migration and wipe were not executed.
