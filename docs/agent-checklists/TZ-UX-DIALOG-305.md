# TZ-UX-DIALOG-305 checklist

> Status: **READY** · Wave: CATALOG-UX-C #2 · depends COMPOSE-301  
> Source: `tasks/TZ-UX-DIALOG-305-catalog-kind-c-width-parity.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0 main

## Acceptance
- [ ] ModuleForm = kind C `min(1120px, calc(100vw - 2rem))`
- [ ] Composition picker same max width as material FullEditor
- [ ] Audit `2026-08-09-catalog-dialog-width-parity.md` + cookbook note
- [ ] Tiny inventory dialogs NOT widened

## Gates
- [ ] Frontend tsc
- [ ] `pnpm test -- module-form-dialog|product-composition-picker`

## Closeout
- [ ] Archive + commit/push; deploy NO
