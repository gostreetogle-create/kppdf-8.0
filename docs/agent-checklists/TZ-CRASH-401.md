# TZ-CRASH-401 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-CRASH-401.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T15:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Context

Part of the PO's "bring everything to deploy readiness" order — explicit ask: "никаких
случайных коллапсов не должно быть". Wrote a full-route crash-sweep (headless Chrome CDP,
admin login, hard-navigate every route in `app.routes.ts`, capture console errors/exceptions)
and ran it across all 50 real routes.

## Finding

`/dictionaries/form-profiles` threw on load: `The "check" icon has not been provided by any
available icon providers.` — caught by `GlobalErrorHandler`, surfaced to the real user as a
red error toast ("Произошла непредвиденная ошибка").

## Root cause

`shared/ui/checkbox/checkbox.component.ts`, `badge.component.ts`, `card.component.ts`,
`pi-showcase-card.component.ts` all use the Lucide **string-name** lookup form
(`<i-lucide name="check">` / `[name]="icon()"`), which requires the icon to be registered via
`LucideAngularModule.pick({...})` somewhere in the injector tree. **No such registration
existed anywhere in the app** — `getIcon()` always returned `null` for every string-name
lookup, so this form was broken unconditionally, everywhere it actually got rendered. The
in-repo comments claiming `<i-lucide>` "auto-registers project-wide once
`LucideAngularModule` is imported anywhere" were simply wrong (verified against the
`lucide-angular@0.460.0` source: `getIcon()`/`hasIcon()` only reads from the DI-injected
`LUCIDE_ICONS` token, which only `.pick()` populates).

It only surfaced on `/dictionaries/form-profiles` in the sweep because that's the one route
whose default (unclicked) render state happens to show a checked/indeterminate checkbox on
first paint — but the same crash would hit **any** route the moment a user actually checks an
`app-pi-checkbox`, or interacts with a badge/card that passes an `icon`/`arrow` prop matching
one of these names, on a cold page load (direct URL, bookmark, hard refresh) before any other
component had incidentally triggered the same broken lookup elsewhere in the SPA session.

## Fix

Added the missing global registration: `app.config.ts` now provides
`importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))` — the exact
three icon names actually referenced by string-lookup anywhere in the live app today (grepped
`icon="..."` / `<i-lucide name="...">` across `frontend/src/app`). Corrected the misleading
"auto-registers" comments in the four affected components to point at the real mechanism, so
a future new icon name added to `badge`'s `icon` input doesn't silently reintroduce this bug.

## Acceptance

- [x] Full-route crash sweep (50/50 real routes, admin session) — 0 console errors/exceptions
- [x] `/dictionaries/form-profiles` loads clean (was throwing before the fix)
- [x] No other route regressed

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm test -- checkbox badge card.component form-profiles app.config` → PASS (60/60)
- `pnpm exec eslint src/app/app.config.ts src/app/shared/ui/checkbox/checkbox.component.ts src/app/shared/ui/badge/badge.component.ts src/app/shared/ui/card/card.component.ts` → PASS (0 problems)
- Browser primary: `node scripts/full-route-crash-sweep.mjs` — before fix: 1/50 routes crashed;
  after fix: 0/50. Report: `reports/full-route-crash-sweep.json`.

## Executor report

- New reusable tool: `scripts/full-route-crash-sweep.mjs` — orchestrator-level (not tied to
  one TZ), hard-navigates every route in `app.routes.ts` as admin and flags console
  errors/exceptions or suspiciously empty pages. Kept in `scripts/` for reuse before future
  deploys.
- known_limitation: `card.component.spec.ts`'s "interactive renders arrow" test doesn't
  actually register `LucideAngularModule` in its TestBed, so `<i-lucide>` is an unknown
  element there (NG0304/NG0303 console noise, pre-existing, does not fail the assertion) —
  the spec's icon-render assertion is weaker than it looks. Not fixed here (out of scope for
  a runtime-crash fix); flagged as a candidate for the test-coverage pass.

## Closeout

- Status = DONE
- closed_at: 2026-08-22T15:20:00+03:00
