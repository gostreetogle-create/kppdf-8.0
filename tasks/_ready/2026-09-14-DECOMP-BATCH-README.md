# DECOMP BATCH 2026-09-14 — PO-approved modules

> Эталон: [`2026-09-14-docstudio-editor-decomp/`](./2026-09-14-docstudio-editor-decomp/)  
> Audit: [`docs/audits/2026-09-14-global-architecture-scan.md`](../../docs/audits/2026-09-14-global-architecture-scan.md)

## Три блока (порядок исполнения для агентов)

| Block | Pack | Модули | Статус |
|-------|------|--------|--------|
| **B1** | [`2026-09-14-decomp-b1-production-orderhub/`](./2026-09-14-decomp-b1-production-orderhub/) | Gantt bars + Cockpit → Order hub tray | READY |
| **B2** | [`2026-09-14-decomp-b2-supply-warehouse/`](./2026-09-14-decomp-b2-supply-warehouse/) | Supply + SupplyRequests → Warehouse pages | READY |
| **B3** | [`2026-09-14-decomp-b3-proposals/`](./2026-09-14-decomp-b3-proposals/) | Proposals list | READY |

## Глобальные правила (все pack’и)

1. Signals + instance-scoped Facade (`providers` на page/host, **не** `providedIn: 'root'`).
2. Smart page/host остаётся в `apps/kppdf-web/.../pages/`.
3. Dumb UI → `libs/features/src/lib/<area>/ui/` + path `@kppdf/features/<area>`.
4. **No behavior change** — перенос as-is; API контракты не ломать.
5. Specs из TZ — зелёные; `nx build kppdf-web` baseline + last.
6. Один TZ на `kppdf-web/src/**` одновременно (блоки **последовательно**: B1 → B2 → B3, внутри pack — по WAVE-MAP).
7. Studio WAVE и эта волна не параллелить на одном app.

## Старт кодинга

1. Дождаться / не пересекаться с `docstudio-editor-decomp` если ещё active.
2. Claude: continuous prompt из **B1** pack.
3. После B1 DONE → B2 → B3.
