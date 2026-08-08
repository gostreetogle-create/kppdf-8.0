# TZ-CATALOG-337 checklist

> Status: **READY** · depends: FACT-304 DONE  
> Source: `tasks/TZ-CATALOG-337-material-detail-a-plus.md`  
> Conflict keys: `material-detail.page.ts`, `material-detail.page.spec.ts`, page docs

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0 main

## Acceptance
- [ ] PiPageChrome crumbs `Каталог / Материалы / <имя>`
- [ ] A+ split: sticky left (hero + passport + Photo/Price accordion) + right where-used/stock
- [ ] No ProductBomPanel / composition-tree on material detail
- [ ] FactStack from FACT-304 kept (no dl regression)
- [ ] `docs/pages/material-detail.page.md` matches shipped A+
- [ ] PAGE-TZ-INDEX updated

## Gates
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] `cd frontend && pnpm test -- material-detail`

## Closeout
- [ ] Archive + lock + progress
- [ ] Commit and push main (own files only)
- [ ] Deploy: NO unless PO commands
