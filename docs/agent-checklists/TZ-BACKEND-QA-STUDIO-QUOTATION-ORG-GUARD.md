# Checklist: TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD

**TZ:** `tasks/TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD.md`
**Status:** DONE

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T07:45:00Z
- branch: `main`
- baseline_sha: e8caa9e4
- workspace: D:\kppdf-8.0

## Steps

- [x] assertQuotationOrg helper
- [x] wire ensureLinkedQuotation + syncQuotationItems
- [x] unit tests mismatch/match/create
- [x] tsc + focused test PASS
- [x] Archive + commit

## Acceptance

- [x] mismatch org → NotFoundException
- [x] focused lifecycle spec PASS (7/7)
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- [x] target eslint на lifecycle file PASS (no unused organizationId)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (service-level org-scope guard; no UX/API surface change)
- [x] FIC §A–E: N/A для A/B/D/E — нет route/permission/MCP/desktop; §C backend module internal guard (HTTP ответы для mismatch те же NotFound, что и раньше при отсутствии ресурса)
- [x] page.md / PAGE-TZ-INDEX: N/A (поведение ошибок не менялось для штатных сценариев; document-studio.page.md не трогалась)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-quotation-lifecycle.service.ts` + spec)
- [x] Coupling map: N/A (общее поле/статус не тронуты)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Evidence

- `cd backend && pnpm exec jest studio-quotation-lifecycle.service.spec --runInBand` → PASS (7 tests, +5 new: linked-match, linked-mismatch NotFound, populated-org-doc match, sync mismatch before update, sync match).
- `cd backend && pnpm test` → **126 suites / 1157 tests PASS** (1152 + 5 new).
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS.
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-quotation-lifecycle.service.{ts,spec.ts}` → PASS (unused `organizationId` ESLint error resolved).

## Executor report

- Added private `assertQuotationOrg(quotation, organizationId)`: throws `NotFoundException('Quotation not found')` when `quotationOrgRefId(quotation.organizationId) !== organizationId`. Ref-id helper unwraps populated Organization docs (prod `QuotationService.findById` populates `organizationId`, so `String(doc)` would be `[object Object]` on the happy path — plain compare from the audit would false-positive).
- Wired into `ensureLinkedQuotation` (linked branch, right after `findById`) and `syncQuotationItems` (before `update`; also turns previously-unused `organizationId` param into an actual boundary).
- Not used in create path — org already lands in the create payload (happy path intact).
- `updateQuotationStatus` inherits both guards via `ensureLinkedQuotation` + `syncQuotationItems`.
- No change to `OrgScopeGuardInterceptor` / quotation schema / controller (still passes `user.organizationId!`, all HTTP callers org-scoped via `findById` first).
