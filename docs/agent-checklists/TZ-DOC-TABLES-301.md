# TZ-DOC-TABLES-301 checklist

> Status: **DONE** · Wave: DOC-TABLES #1
> Source: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-301-documents-toc-tables-subchips.md`

## Claim slot
- agent_id: `buffy-doc-tables-301`
- claimed_at: `2026-08-09T03:00:36Z`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable (unknown task; task registry sync unavailable)

## Conflict keys
- `frontend/src/app/pages/doc-constructor/documents/documents-group-chips.ts`
- `frontend/src/app/pages/doc-constructor/tables/tables.page.ts`
- `frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts`
- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts`
- `frontend/src/app/pages/doc-constructor/documents/documents.page.ts`
- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
- `docs/pages/tables.page.md`
- this checklist

## Acceptance
- [x] Tables page has dark Documents TOC with Tables active.
- [x] Tables page has yellow `Все таблицы` and `Из данных` chips.
- [x] Sibling templates/documents/texts have dark TOC and no false tables yellow chips.
- [x] FE typecheck passes.
- [x] Focused Jest and page documentation checks pass.
- [x] Archive, lock, status/checkpoint, commit and push complete (`be0ed105`, pushed).

## Gates (fact)
- Baseline focused Jest: PASS — 4 suites / 28 tests.
- Final focused Jest: PASS — 4 suites / 29 tests.
- Frontend tsc: PASS.
- Changed-file ESLint: PASS.
- Prettier and diff-check: PASS.
- Browser/PO visual review: unavailable.
