# TZ-CATALOG-320 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-CATALOG-320.done.md`
> Lock: `.mimocode/locks/TZ-CATALOG-320-composition-gap.lock`
> Feat on main: `07ced5f`

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy
- claimed_at: `2026-08-06T16:10:00Z`
- closed_at: `2026-08-06` (Cursor review + closeout)

## Acceptance

- [x] Composition types/DTOs: product lines + product-only non-negative price override
- [x] Module composition: child module + material, self-exclude, kind labels
- [x] Product composition: module + non-raw material + product, self-exclude, «Комплекс»
- [x] Module dimensions: `formGroupName="dimensions"`
- [x] Focused Jest 5/53 PASS
- [x] Four page docs + successor 311

## Gates (fact)

- [x] Focused Jest — PASS
- [x] Scoped ESLint / Prettier — PASS
- [~] Full-app tsc — **WAIVED** (Cursor): pre-existing chips WIP only; no 320 files in errors
- [ ] Browser smoke — skipped (no stack)

## Soft note (not AC fail)

- `/modules/:id` table still filters `lineType=material` only; child modules editable in dialog → 311.

## Closeout

- [x] Archive + ARCHIVE_MARKER
- [x] Lock
- [x] Progress + active map
- [x] Remove `_active` marker
- [x] Status = DONE
- [x] Next for agent #1: **TZ-CATALOG-311**
