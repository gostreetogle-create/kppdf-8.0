# TZ-NX-REGISTRIES-FULL-CLOSEOUT — PARTIAL

ARCHIVE_MARKER
outcome: PARTIAL
closed_at: 2026-08-29
closed_by: cursor

## Closed

| Gap | Status |
|-----|--------|
| G1 icon-only Lucide row actions + create | **DONE** |
| G2 click-effect tests (not DOM-only) | **DONE** |
| G3 browser smoke + screenshots | **BLOCKED** — `:4201` unreachable (connection refused); MCP browser `chrome-error` |
| G4 Units delete FE | **DEFERRED** — backend fix not verified; remediation `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md` |

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/registries/
  model/registry.types.ts (+ icon/tone/ariaLabel on RegistryRowAction)
  registry-action-icons.ts (+ spec)
  registry-row-action-button.component.ts (+ spec)
  registry-create-button.component.ts
  registry-detail-panel.component.ts (icon buttons)
  data/units.registry.ts
  data/material-registry-actions.ts
  data/module-registry-actions.ts
  data/product-registry-actions.ts
  data/registry-constructor-action.ts
  data/departments.registry.ts
  data/registry-action-matrix.spec.ts (NEW)
  registries-a11y.spec.ts
  registry-detail-panel.component.spec.ts

docs/pages/registries.page.md
docs/pages/PAGE-TZ-INDEX.md
docs/agent-checklists/TZ-NX-REGISTRIES-FULL-CLOSEOUT.md
tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` source, shell/rails, data-access API.

## Gates

| Gate | Result |
|------|--------|
| `nx build kppdf-web --skip-nx-cache` | PASS |
| `nx test kppdf-web --skip-nx-cache` | PASS (253 tests) |
| `nx test data-access --skip-nx-cache` | PASS (30 tests) |
| `nx run-many -t lint --all --skip-nx-cache` | PASS (0 errors) |
| `architecture:check:nx` | PASS (252 files) |
| `ui:tokens:nx` | PASS |

Backend gates omitted (no backend changes per TZ).

## Known limits (honest)

1. Browser smoke not executed — dev-server on `:4201` not accepting connections during closeout session.
2. Units delete action intentionally absent until backend hard-delete confirmed + separate FE TZ.
3. Full PASS requires G3 smoke evidence in `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-FULL-CLOSEOUT/`.

## Executor report

- G1: Lucide icon-only row/create buttons with semantic Paper&Ink token classes; all 6 registries mapped.
- G2: `registry-action-matrix.spec.ts` proves activate PATCH, copy duplicate API, dialog open, confirm dialog, create toolbar effects.
- G3: attempted `node start.mjs --nx --no-browser` + MCP browser — frontend unreachable → PARTIAL not PASS.
- Remediation: `TZ-NX-REGISTRY-UNITS-DELETE-FE` for delete; re-run browser smoke when `:4201` healthy for full PASS archive.
