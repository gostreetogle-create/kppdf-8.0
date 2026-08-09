# TZ-SALES-311 DONE — Create КП design-spec (3 columns)

**Date:** 2026-08-09  
**Wave:** WAVE-KP-VITRINE #2  
**Status:** DONE

```
ARCHIVE_MARKER
task: TZ-SALES-311
status: DONE
closed_at: 2026-08-09T02:08:00Z
agent: agent-3e757640b7
workspace: D:\kppdf-8.0
lock: .mimocode/locks/TZ-SALES-311-create-kp-design-spec.lock
scope: docs/ux kp-create-studio-spec + proposals-create.page.md
gates: docs-only Markdown review; git diff --check PASS; product tsc/tests N/A
ban: Angular product logic; print; deploy; 314/315/316 fill
```

## Product result

Affirmable layout SoT for `/proposals/create`:

- Desktop ≥1280: Left **280–320px** (Product rail) · Center **flex / min 480 / A4 ~794** · Right **300–340px** (Inspector).
- Tablet/mobile: center + single side panel / bottom sheets; Escape closes.
- Empty RU one-liners per zone; sticky Deals chrome must not be covered.
- Zone→wave map: skeleton **312**, fill **314/315/316**; print stays **320 PARKED**.
- Page doc points at the spec; entities Organization / Counterparty / Quotation locked in UI glossary.

## Scope boundaries

Docs-only. No Angular studio shell (312), no rail/inspector/template logic, no quotation write, no family schema rewrite, no ModuleMaterials, no deploy.

## Gates

- Docs Markdown/diff review: PASS (AC readable ≤5 min, widths explicit).
- `git diff --check`: PASS.
- Product tsc/tests: N/A (LAYER 4 docs).

## Files

- `docs/ux/kp-create-studio-spec.md`
- `docs/pages/proposals-create.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-SALES-311.md`
- `tasks/_backlog/kp-vitrine/WAVE-KP-VITRINE.md`
- `ARCHITECTURE.md` (KP create studio zone)
