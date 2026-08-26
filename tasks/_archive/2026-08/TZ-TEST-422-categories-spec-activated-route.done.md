---
ARCHIVE_MARKER
task_id: TZ-TEST-422
title: "categories.page.spec — mock ActivatedRoute"
outcome: DONE
closed_at: 2026-08-26T03:20:58Z
sha: a01730fb
conflict_keys:
  - frontend/src/app/pages/dictionaries/categories.page.spec.ts
---

## What changed
- `categories.page.spec.ts`: `ActivatedRoute` provider mock in `beforeEach` —
  `snapshot.queryParamMap` and `queryParamMap` (observable) via `convertToParamMap({})`
  (`type` → null → `'all'`), fixing NG0201 on `createComponent`.
- Product code not touched.
- `tasks/_active/TZ-SUPPLY-443.md`: not present / already removed from git.

## Gates
| Gate | Result |
|------|--------|
| jest (categories.page.spec) | PASS 5/5 |
| tsc -p tsconfig.app.json --noEmit | PASS |
