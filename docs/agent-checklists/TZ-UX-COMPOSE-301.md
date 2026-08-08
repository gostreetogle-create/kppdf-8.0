# TZ-UX-COMPOSE-301 checklist

> Status: **READY** · Wave: CATALOG-UX-C #1  
> Source: `tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0 main

## Acceptance
- [ ] ModuleForm `composition-hint` (модули + материалы → карточка / QC L)
- [ ] Picker `restrictToModule` defaults to **material** tab; module tab remains
- [ ] Root-add reachable when a material line is selected
- [ ] Inclusion matrix documented on module-detail + product-detail page docs
- [ ] No ModuleMaterials resurrection

## Gates
- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend)
- [ ] `pnpm test -- product-composition-picker|product-bom-panel|module-form-dialog`

## Closeout
- [ ] Archive + lock + progress
- [ ] Commit/push own files; deploy NO
