# TZ-BACKEND-CATALOG-PART-BOM-IN-TREE — DONE

ARCHIVE_MARKER

**agent_id:** `buffy-gpt-5.6-luna`
**closed_at:** `2026-08-31T21:43:00+03:00`
**layer:** backend catalog graph read path
**outcome:** DONE
**commit:** pending catalog closeout commit

## Outcome

Product/Module tree display now expands a material with composition by exactly
one level: a part material shows its raw-material BOM children, while those
raw materials remain leaves. The display path is isolated from the
cycle-sensitive composition write traversal.

`getChildren()` and `maxDescendantDepth()` were not changed. Existing cycle,
maximum-depth, legacy-link, and standalone material-tree behavior remain
covered by the catalog graph test suite.

## Changes

- `backend/src/modules/catalog-graph/catalog-graph.service.ts`
  - loads part material composition for tree display;
  - adds one-level raw-material leaf nodes under material children;
  - leaves write-path cycle/depth traversal untouched.
- `backend/src/modules/catalog-graph/catalog-graph.service.spec.ts`
  - adds Product → part → raw tree coverage;
  - verifies standalone `getTree('material', partId)` remains intact.

## Gates

- typecheck: PASS, exit 0
- focused Jest: PASS, exit 0 — 14 tests
- full Jest: PASS, exit 0 — 119 suites / 1115 tests
- target eslint: PASS, exit 0 — 0 errors
- full backend eslint: FAIL, exit 1 — 45 baseline errors and 200 warnings
  outside this TZ; no unrelated cleanup was included.

## Scope

`frontend-nx/**`, `frontend/**`, `docker-compose.yml`, RBAC, composition
write-paths, schemas, `getChildren`, and `maxDescendantDepth` were not changed.
