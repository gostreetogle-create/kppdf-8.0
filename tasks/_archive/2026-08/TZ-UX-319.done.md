# TZ-UX-319 DONE — products expanded row ink frame

```
ARCHIVE_MARKER
task: TZ-UX-319
outcome: DONE
closed_at: 2026-08-15T06:47:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 55dac38afb9e533d1ad28793a1edbae3181482cc
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-UX-319.md)
  - frontend tsc: PASS
  - pi-table.component.spec: PASS (25)
  - products.page.spec: PASS (21)
  - Cursor verdict: PASS (browser /products expand → open+expanded-row + ink frame)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/shared/ui/pi-table.component.ts
    (pi-table-row--open + ink frame on open+expanded-row; sibling dim via :has)
  - frontend/src/app/shared/ui/pi-table.component.spec.ts
  - frontend/src/app/pages/products/products.page.spec.ts
  - docs/pages/products.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- `/products`: expanded product row + tray share one readable ink frame (~1.5px).
- Sibling data-rows dimmed (`opacity: 0.5`) while one row is open.
- Collapse / switch row moves the frame; no leftover double frames.
- `.pi-table-row--open` on expanded data row; `data-test="expanded-row"` kept.

## НЕ

- Deploy / wipe
- Expand API / `expandedId` / composition backend changes
- Wrapper-div frame (known_limitation: two `<tr>` borders)
