# WAVE — NX Order Workspace `/orders/:id`

> Pack: `tasks/_ready/2026-09-15-order-workspace/`  
> Audit: [`docs/audits/2026-09-15-order-workspace-mockup-audit.md`](../../../docs/audits/2026-09-15-order-workspace-mockup-audit.md)  
> Макет (reference, не порт): `data/_tmp-maket-order-id/`  
> Эталон модульности: Studio/B1–B10 facades → `@kppdf/features/*`

## Goal

Заменить thin `order-detail.page` на **модульный editable workspace** одного заказа: все связи видны блоками; правки — через живые API; стиль = золотая середина макет IA + Paper & Ink (без перегруза и без demo-chrome).

## Chain → STOP (sequential, one `kppdf-web`)

| # | SIZE | TZ | Depends |
|---|------|-----|---------|
| 1 | L | `TZ-NX-ORDER-WS-FACADE-SHELL` | — |
| 2 | S | `TZ-NX-ORDER-WS-HEADER` | 1 |
| 3 | L | `TZ-NX-ORDER-WS-COMPOSITION` | 2 |
| 4 | S | `TZ-NX-ORDER-WS-EXECUTION` | 3 |
| 5 | S | `TZ-NX-ORDER-WS-LOGISTICS` | 4 |
| 6 | S | `TZ-NX-ORDER-WS-DOCS-CHIPS` | 5 → **WAVE STOP** |

**PARK:** audit log · print-pack PDF · mini boardLane bars · warehouse cells · commerce totals — см. `PARK.md`.

## Target layout

```
apps/kppdf-web/.../orders/order-detail.page.ts     # thin glue + providers
libs/features/src/lib/order-workspace/
  order-workspace.facade.ts
  ui/order-ws-{header,composition,execution,logistics,documents,workflow-chips}.ts
```

`@kppdf/features/order-workspace` secondary path. providers **page-scoped**, not root. Reuse order-hub dialogs.

## Hard rules

- No React/Vite port. No second shell rails.
- No fake audit / fake deficit / toast-only Save.
- No unitPrice columns unless PO later says commerce back.
- Lifecycle: PATCH только разрешённые; ship/cancel — POST.
- `nx build kppdf-web` baseline + LAST each TZ.
- Hub tray на list/home не ломать.

## Prompt

`PROMPT-CLAUDE-ORDER-WORKSPACE.md` (continuous 1→6 → STOP).
