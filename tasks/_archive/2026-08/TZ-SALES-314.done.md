# TZ-SALES-314 DONE — Create KP left product rail

**Date:** 2026-08-09  
**Wave:** WAVE-KP-VITRINE #5  
**Status:** DONE

```
ARCHIVE_MARKER
task: TZ-SALES-314
status: DONE
closed_at: 2026-08-09T03:25:00Z
agent: agent-3e757640b7
workspace: D:\kppdf-8.0
lock: .mimocode/locks/TZ-SALES-314-create-kp-product-rail.lock
scope: left product rail + in-memory draft lines on /proposals/create
gates: FE tsc PASS; proposal-create Jest 3/3 PASS
ban: ModuleMaterials; print; inspector 315; deploy
```

## Product result

Left zone of Create KP is a thin catalog rail (search + Add) over existing Products API. Added lines land in page-local `draftLines` (in-memory; no quotation PATCH). Center lists draft rows.

## Files

- `proposal-product-rail.component.ts`
- `proposal-create.page.ts` (+spec)
- `docs/pages/proposals-create.page.md`
