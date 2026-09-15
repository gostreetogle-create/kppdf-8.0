# WAVE — Block 1: Production (Gantt+Cockpit) + Order Hub

> Pack: `tasks/_ready/2026-09-14-decomp-b1-production-orderhub/`  
> Scan: `docs/audits/2026-09-14-global-architecture-scan.md` § High  
> Эталон: DocStudio Editor Decomp

## Goal

1. Разгрузить `gantt-bars.component.ts` (~2.5k) и `production-cockpit.page.ts` (~910) по паттерну Facade + dumb UI → `@kppdf/features/production`.
2. Затем то же для `order-hub-tray.component.ts` (~599) → `@kppdf/features/order-hub`.

**Сохранить:** `ProductionReadFacade` (read model) — не сливать write/UI interaction в него; расширять отдельным write/UI facade.

## Chain (sequential)

### Stream A — Production

| # | SIZE | TZ id | Depends |
|---|------|-------|---------|
| A1 | L | `TZ-NX-GANTT-BARS-FACADE` | — |
| A2 | S | `TZ-NX-GANTT-BARS-UTIL-UI` | A1 |
| A3 | L | `TZ-NX-PRODUCTION-COCKPIT-FACADE` | A2 |
| A4 | S | `TZ-NX-PRODUCTION-TO-FEATURES` | A3 |

### Stream B — Order hub (after Stream A DONE)

| # | SIZE | TZ id | Depends |
|---|------|-------|---------|
| B1 | L | `TZ-NX-ORDER-HUB-FACADE` | A4 archived |
| B2 | S | `TZ-NX-ORDER-HUB-UI-FEATURES` | B1 |

## Target layout (after A4 + B2)

```
apps/.../pages/production/
  production-cockpit.page.ts     # thin + ShellToolRail
  production-read.facade.ts      # KEEP (or re-export from features after A4)
  *.spec.ts

apps/.../pages/orders/
  order-hub-tray.component.ts    # thin host (or re-export wrapper)
  order-detail.page.ts           # imports thin tray
  *.spec.ts

libs/features/src/lib/production/
  index.ts
  gantt-bars.facade.ts
  production-cockpit.facade.ts   # write/selection/shell domain (not read)
  production-read.facade.ts      # moved from app OR re-export
  util/gantt-bar.model.ts
  ui/gantt-bars.component.ts
  ui/orders-rail.component.ts
  ui/...

libs/features/src/lib/order-hub/
  index.ts
  order-hub.facade.ts
  ui/order-hub-tray.component.ts
  ui/*-confirm-dialog (kit/ship) if tray-local
```

Paths: `@kppdf/features/production`, `@kppdf/features/order-hub`

## Hard rules

- No Gantt geometry/behavior change; no order ship/reserve rule change.
- Page/tray host stays in app for chrome (`ShellToolRailService` on cockpit).
- Specs: `gantt-bars`, `production-cockpit*`, `gantt-bar.model`, `order-hub-tray`, kit/ship dialog specs.
- `nx build kppdf-web` last each TZ.

## Prompts

- Full B1 continuous: [PROMPT-CLAUDE-B1-CONTINUOUS.md](./PROMPT-CLAUDE-B1-CONTINUOUS.md)
- Tracker: `docs/agent-checklists/WAVE-DECOMP-B1-PRODUCTION-ORDERHUB.md`

## Status

| TZ | Status |
|----|--------|
| A1–A4, B1–B2 | **DONE** — see `docs/agent-checklists/WAVE-DECOMP-B1-PRODUCTION-ORDERHUB.md` for commits |
