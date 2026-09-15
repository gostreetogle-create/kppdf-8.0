# TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (registries + studio data-panel/vitrina specs green; nx build last 0)
  - typecheck: PASS (features lib + kppdf-web app, both clean on first run)
  - tests: PASS (features 44/44 suites 384/384; kppdf-web registries pattern 31/31 suites 185/192, 7 skipped; studio pattern 24/24 suites 152/152; full suite 87/87 suites 608/615, 7 skipped, 0 failed)
  - architecture check: PASS (1546 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES.md
  - commit: 5bbd000c
  - status synchronization: PASS (tracker updated)

## Root cause

B6 identified `createCatalogRegistryDialogHost`/
`createMaterialRegistryDialogHost` as the blocker for
`studio-data-panel`/`studio-data-vitrina` — real registries
infrastructure shared by ~15 files. This TZ moved the two factories
themselves.

## Fix

Both factory files turned out nearly self-contained: they already
imported `Material/Module/ProductFormDialogComponent` from
`@kppdf/features/registry-forms` (C2). Only two tiny pure interfaces
(`RegistryActionContext`, `MaterialRegistryDialogConfig`) needed
duplicating — same low-drift-risk class as `on-dialog-close-once.ts`.
Moved both factories (+ the one dedicated spec) into
`libs/features/src/lib/registry-forms/`. Updated ~17 consumers: 3 with
real value imports (own spec, `registries.catalog.ts`'s actual
instantiation, and `studio-data-vitrina.component.ts`'s import — ahead
of that file's own move in TZ 4, required to keep this TZ's AC green)
and 14 `import type`-only path fixes with zero logic change.

## Files changed

- `catalog-registry-dialog-host.ts` (+spec), `material-registry-dialog-host.ts` → `libs/features/src/lib/registry-forms/`
- New: `registry-action-context.ts`; `MaterialRegistryDialogConfig` inlined in `material-registry-dialog-host.ts`
- `registry-forms/index.ts` (+3 exports)
- ~17 app-level consumer files (import paths only)
- `docs/agent-checklists/TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES.md` (new)

## Successor

`TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES` — move `studio-data-panel` +
`studio-data-vitrina` themselves now that their blocker is gone. Last TZ
in the B7 chain — STOP after.
