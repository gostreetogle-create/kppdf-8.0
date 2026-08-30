# TZ-NX-CONSTRUCTOR-SHELL checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T21:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — no route/nav conflict with peer claims
- [x] Read composition architecture decision, shell canon, registries patterns
- [x] Claim + checklist created

## Acceptance

- [x] Route `/constructor` + placeholder `/constructor/create/:kind`
- [x] Header chip «Конструктор» (not in rails)
- [x] Compact workspace + four CTAs (material, part, module, product)
- [x] No «Комплекс» create kind; domain copy for part/complex
- [x] Paper & Ink components, a11y, data-test selectors
- [x] Tests: route, header chip, CTAs, placeholder, a11y smoke, registries/kit intact
- [x] `docs/pages/constructor.page.md` + PAGE-TZ-INDEX row

## Integrity slot

- [x] page.md created; FIC N/A (no backend/permissions)

## Gates

- [x] `pnpm exec nx build kppdf-web` — PASS
- [x] `pnpm exec nx test kppdf-web` — PASS
- [x] `pnpm exec nx run-many -t lint --all` — PASS (0 errors)
- [x] `pnpm run architecture:check:nx` — PASS
- [x] `pnpm run ui:tokens:nx` — PASS

## Executor report

- `ConstructorPage` — PiPageChrome, domain note (part/complex), 4 card CTAs → `/constructor/create/:kind`.
- `ConstructorCreatePlaceholderPage` — PiStatusBanner info + back link; unknown kind alert.
- `constructor.types.ts` — typed `ConstructorCreateKind`, no complex.
- Nav: `id: constructor` in header (`skipPageAcl`), `activeAliases` for create routes.
- 8 spec files touched/added; shell chip count 2→3; `/registries` and `/kit/*` unchanged.

**Outcome: PASS.**

## Closeout

- [x] archive `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL.done.md`
- [x] remove `tasks/_active/TZ-NX-CONSTRUCTOR-SHELL.md`
- Status = DONE
- closed_at: 2026-08-29T21:12:00+03:00
