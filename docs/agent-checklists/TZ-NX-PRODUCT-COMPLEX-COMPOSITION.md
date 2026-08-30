# TZ-NX-PRODUCT-COMPLEX-COMPOSITION checklist

> Status: **DONE**
> Wave: A5 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`
> Marker: none (single-session claim+close)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- Implementation: `agent_id: gemini` (per `tasks/_archive/2026-08/TZ-NX-PRODUCT-COMPLEX-COMPOSITION.done.md`, same day, uncommitted)
- Independent live verification + closeout: `agent_id: claude`, `claimed_at: 2026-08-30T15:55:00Z`, `workspace: D:\kppdf-8.0`, `team_room_claim: unavailable`

## Preflight

- [x] `_NOW.md` + `tasks/_active/` re-checked after A4 — still empty
- [x] All 7 changed files' diffs read in full before verifying
- [x] Confirmed `formatComplexBadge`/the «Комплекс» table column already existed
      (from an earlier committed wave) — A5's job was making the list
      endpoint actually populate `isComplex` (previously detail-only) plus
      adding the filter, not building the badge from scratch

## Small fix made during verification

`products-http-data-source.ts` defined a `parseIsComplexFilter()` helper
but `query()` never called it — inlined the same ternary logic a second
time instead. Not a correctness bug (both branches did the same thing),
but real dead code. Replaced the inline duplicate with a call to the
helper.

## Acceptance (wave doc §A5, verified)

- [x] Комплекс: UI «включает несколько изделий» — `isComplex` is derived
      server-side from `composition.some(line => line.lineType === 'product')`,
      exactly matching `docs/architecture/MASTER-CORE.md`'s domain rule
- [x] Badge в таблице — confirmed live: filtering to `isComplex=true`
      shows the «Комплекс» badge correctly on real rows (screenshot)
- [x] Фильтр — «Все / Комплекс / Обычное» select added to the Изделия
      registry; live-tested via direct API (`isComplex=true` → 5 results,
      `isComplex=false` → 63, total 68) and through the real browser UI
      (Playwright: selected the filter, table showed exactly 5 rows, «1-5
      из 5», matching the API total)

## Integrity slot

- [x] Тип изменения: **page** (registries filter/column data, no new route)
- [x] FIC §A/§B/§E — N/A. §C — existing `GET /products` endpoint gains one
      optional query param, no new endpoint/module
- [x] page.md — N/A, `registries.page.md`'s Изделия row already documented
      the derived-Комплекс model from A1's closeout; no further update needed
- [x] Чужой WIP не в коммите — staged only the 7 files this TZ's own
      archive lists + the dead-code fix + checklist/archive/`_NOW.md`
- [x] Coupling map — N/A

## Gates (factual)

```
Backend:
  pnpm exec tsc -p tsconfig.build.json --noEmit → 0 errors
  pnpm exec jest --silent src/modules/product → 4 suites, 34/34 tests

Frontend:
  pnpm exec nx build kppdf-web → exit 0
  pnpm exec nx test kppdf-web → 45/46 suites (the 1 failure is the same
    pre-existing, unrelated app-shell.component.spec.ts regression already
    documented in _NOW.md PARK during A4 — not this TZ's scope, confirmed
    unchanged)
  eslint on all 5 touched frontend files → 0 problems

Live: GET /products sample rows carry real isComplex; ?isComplex=true → 5,
?isComplex=false → 63 (68 total, consistent). Browser: selected the
Комплекс filter on /registries/products, table showed 1-5 из 5 with the
badge rendering on real rows (screenshot).
```

## Executor report

- What was verified: the pre-existing «Комплекс» badge column had nothing
  to show because the list endpoint never sent `isComplex` (detail-only).
  This TZ's actual contribution was closing that gap end-to-end (backend
  derive + filter, frontend param plumbing) — confirmed live, not just by
  reading the diff.
- Known limits: did not verify the composition picker's "Изделие" tab
  end-to-end for BUILDING a complex (adding a product-in-product line) —
  that mechanism was already covered by A3's live nested-add verification
  using a module-in-module line; the product-in-product case uses the
  identical code path (`composition-tree.contract.ts`'s `allowedLineTypes`
  already includes `'product'` for a product parent), not re-tested
  separately.
- Conflict disclosure: touched only the 7 files this TZ's own archive
  claims, all already isolated to the products list/filter/badge slice.

## Review handoff

- No wave inbox configured; evidence above is the review artifact.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-PRODUCT-COMPLEX-COMPOSITION.done.md`
- [x] `_NOW.md` synced
- Status = DONE
- closed_at: 2026-08-30T15:57:14Z
