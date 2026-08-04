# TZ-CATALOG-316 checklist

> Status: **DONE** · archived 2026-08-04  
> Executor: Gemini (interrupted mid-gates) → Cursor closeout  
> TZ archive: `tasks/_archive/2026-08/TZ-CATALOG-316.done.md`  
> Audit: `docs/audits/2026-08-04-catalog-readiness-fe-be.md` §P1 Material

## Preflight

- [x] Read GEMINI / AI-AGENT-GUIDE / DIALOG-COOKBOOK / UX-FORM-CANON / PO-DIARY §1–§4 / readiness audit §P1
- [x] Read BE Material contract (301 fields + `?materialKind=`)
- [x] Conflict keys materials FE only — **not** product/module/composition (302)

## Acceptance

- [x] Create/edit payload round-trips 301 fields (form specs)
- [x] Kinds raw/part/fastener/purchased/other + legacy empty sentinel
- [x] Jest: material-form-dialog + materials.service + materials.page + materials.page-316 — **52/52 PASS**
- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS**
- [x] Archive + lock + progress + review inbox

## Gates (fact)

```
cd frontend && pnpm exec jest --no-coverage material-form-dialog materials.service materials.page.spec materials.page-316 --runInBand
→ Test Suites: 4 passed · Tests: 52 passed

cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

git diff --check (conflict keys) → PASS (CRLF warnings only)
```

## Executor log

1. Gemini: service + form + page column/filter + form specs; stuck on NG0101 when kindFilter + search re-fire shared one suite.
2. Cursor closeout: `onKindFilterChange` skips redundant `pageSig.set(1)`; kindFilter test moved to `materials.page-316.spec.ts`; 302 untouched.

## Architect verdict

- Status: **PASS** (FE-only; Cursor closeout + self-review).
- Note: do not start 317 until 302 Cursor PASS.
