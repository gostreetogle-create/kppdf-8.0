# TZ-NX-REGISTRIES-HEADER-CLEANUP — compact /registries page header

## Problem

`/registries` showed duplicate chrome above the master table:
- breadcrumb last crumb «Реестры» **and** separate H1 «Реестры»
- platform blurb «Платформа реестров: …» duplicating per-row descriptions in the master table

## Fix

Per `PiPageChromeComponent` list-page canon (crumbs only, no H1): removed
`title` and `description` inputs from `RegistriesPage` page chrome. Page name
appears once via the current crumb; master table follows immediately.

## Changed files

```
modified:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts

new:
  docs/agent-checklists/TZ-NX-REGISTRIES-HEADER-CLEANUP.md
  tasks/_archive/2026-08/TZ-NX-REGISTRIES-HEADER-CLEANUP.done.md
```

## Gates

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 102/102
- `pnpm exec nx run-many -t lint --all`: **PASS**
- `pnpm run architecture:check:nx`: **PASS**
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
