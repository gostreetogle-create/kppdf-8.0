# TZ-ORG-ASSETS-301 checklist

> Status: **DONE** (2026-08-08) · Wave: PARTY-DOCS #5 · Depends: PARTY-302 DONE
> Source: `tasks/_archive/2026-08/TZ-ORG-ASSETS-301.done.md`

## Claim slot
- agent_id: cursor-executor (this chat)
- claimed_at: 2026-08-08
- workspace: D:\kppdf-8.0

## Acceptance
- [x] Roles logo|seal|signature на photos upload (общий `imageUploadMulterOptions`)
- [x] One active per role; replace (старое Photo удаляется)
- [x] Seal replace — admin only (403 иначе; DELETE тоже)
- [x] legalAddress на Org + FullEditor
- [x] FE три слота preview/replace

## Gates
- [x] BE authz + upload tests: `organization.spec.ts` (19), `organization-assets.e2e-spec.ts` (6)
- [x] BE `tsc --noEmit` clean; FE `npm run typecheck` + `npm run build` clean
- [x] FE tests `src/app/pages/organizations` (20)
- [x] `git diff --check`

## Closeout
- [x] Archive + lock + progress
- [x] Commit/push; deploy NO

## Known drift (чужие зоны, не правил)
- `text-block-category.service.spec.ts` → `resolveDefault falls back to system «Общее»` падал
  до этой TZ (зона TZ-DOC-315).
- `catalog-314.archive.spec.ts` не компилировался после TZ-COST-302 (6-й аргумент
  `ProductModuleService`) — поправлен как 2 строки мока, иначе весь `tsc` был красный.
