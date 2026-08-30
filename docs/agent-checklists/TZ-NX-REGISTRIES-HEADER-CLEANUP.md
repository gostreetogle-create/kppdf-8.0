# TZ-NX-REGISTRIES-HEADER-CLEANUP checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-HEADER-CLEANUP.done.md`

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T20:45:00+03:00

## Acceptance

- [x] No duplicate «Реестры» H1 + crumb
- [x] No platform description in page chrome
- [x] Master table directly under compact header
- [x] Regression test + gates PASS

## Gates

- [x] build, test (102/102), lint, architecture:check:nx, ui:tokens:nx — PASS

## Executor report

Removed `title` and `description` from `app-pi-page-chrome` on `RegistriesPage`; crumbs-only header per PiPageChrome list-page canon. Added regression test asserting no `page-chrome-title`, no platform blurb, single crumb, table follows header.

**Outcome: PASS.**

## Closeout

- [x] archive done
- [x] active claim deleted
- closed_at: 2026-08-29T20:50:00+03:00
