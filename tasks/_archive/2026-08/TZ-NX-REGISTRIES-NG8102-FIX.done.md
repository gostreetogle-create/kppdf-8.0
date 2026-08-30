# TZ-NX-REGISTRIES-NG8102-FIX — fix NG8102 on registry filter bindings

## Problem

Angular NG8102 on `[value]="queryState().filters[filter.key] ?? ''"` in
`registry-detail-panel.component.ts`: `RegistryQueryState.filters` is typed as
`Readonly<Record<string, string>>`, so the template compiler treats index access
as always `string` while runtime missing keys are `undefined`.

## Fix

Added `filterInputValue(key: string): string` helper with explicit
`string | undefined` intermediate; template binds via method instead of inline `??`.
Regression test verifies text and select filters render `''` when keys absent.

## Changed files

```
modified:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.spec.ts

new:
  docs/agent-checklists/TZ-NX-REGISTRIES-NG8102-FIX.md
  tasks/_archive/2026-08/TZ-NX-REGISTRIES-NG8102-FIX.done.md
```

## Gates

- `pnpm exec nx build kppdf-web`: **PASS** (no NG8102)
- `pnpm exec nx test kppdf-web`: **PASS** — 121/121
- `pnpm exec nx run-many -t lint --all`: **PASS**
- `pnpm run architecture:check:nx`: **PASS**
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
