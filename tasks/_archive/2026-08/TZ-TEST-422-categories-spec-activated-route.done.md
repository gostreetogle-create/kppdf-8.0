---
ARCHIVE_MARKER
task_id: TZ-TEST-422
title: "categories.page.spec — mock ActivatedRoute"
outcome: DONE
closed_at: 2026-08-26T00:10:00+03:00
sha: 91e9e89c
conflict_keys:
  - frontend/src/app/pages/dictionaries/categories.page.spec.ts
---

## What changed
- `categories.page.spec.ts`: added `ActivatedRoute` provider mock in `beforeEach` —
  `snapshot.queryParamMap` and `queryParamMap` (observable) both via `convertToParamMap({})`
  (`type` filter reads as `null` → `'all'`), fixing `NG0201` on `createComponent`.
- `categories.page.ts` (product code) not touched.

## Gates
| Gate | Result |
|------|--------|
| jest (categories.page.spec) | PASS 5/5 |
| tsc -p tsconfig.app.json --noEmit | PASS |

## Note
- `tasks/_active/TZ-SUPPLY-443.md` removed from git in the same commit (stale active marker; archive for that TZ already existed at `tasks/_archive/2026-08/TZ-SUPPLY-443.done.md`).
