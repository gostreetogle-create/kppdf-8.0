# 00-ROLLUP — Confidence ledger (LEDGER-01…12)

date: 2026-08-16T18:10:00+03:00
agent: Buffy (freebuff)
wave: tasks/_backlog/WAVE-CONFIDENCE-LEDGER-FLASH.md
umbrella: TZ-OPS-CONFIDENCE-LEDGER-401 (DONE — tasks/_archive/2026-08/TZ-OPS-CONFIDENCE-LEDGER-401.done.md)

## Lane → score

| Lane | Score | File |
|------|-------|------|
| LEDGER-01 Docs hygiene | 89 | `docs/audits/confidence/01-docs.md` |
| LEDGER-02 Coupling Order.status | 91 | `docs/audits/confidence/02-coupling.md` |
| LEDGER-03 Nav / RBAC | 91 | `docs/audits/confidence/03-nav-rbac.md` |
| LEDGER-04 Catalog FE↔BE | 89 | `docs/audits/confidence/04-catalog-contract.md` |
| LEDGER-05 Deals write-path | 88 | `docs/audits/confidence/05-deals-contract.md` |
| LEDGER-06 Production | 92 | `docs/audits/confidence/06-production.md` |
| LEDGER-07 Warehouse SoT | 86 | `docs/audits/confidence/07-warehouse.md` |
| LEDGER-08 Desktop / MCP | 90 | `docs/audits/confidence/08-desktop-mcp.md` |
| LEDGER-09 Angular smart/dumb | 93 | `docs/audits/confidence/09-angular-smart-dumb.md` |
| LEDGER-10 Auth / device | 92 | `docs/audits/confidence/10-auth.md` |
| LEDGER-11 Gates health | 100 | `docs/audits/confidence/11-gates.md` |

## Overall

- **min(lane scores) = 86** (LEDGER-07 — Warehouse SoT: stale `Material.stockQty` в витрине материалов)
- **median = 91**

## Top P0

**P0: нет.** Волна не нашла ни одного P0 (security/corruption/deploy-blocker).

### P2 backlog — CLOSED 2026-08-16

| # | Was | Outcome | Code / archive |
|---|-----|---------|----------------|
| 1 | director GET 403 на каталоге | DONE | `9ddadae2` · `TZ-OPS-314.done.md` |
| 2 | CreateOrderDto status bypass | DONE (+ UpdateOrderDto OmitType fix) | `aba3842b` · `TZ-OPS-315.done.md` |
| 3 | materials stale stockQty | DONE | `a1ad0e35` · `TZ-OPS-316.done.md` |
| 4–5 | PAGE-TZ-INDEX links + COUPLING Комбайн | DONE | `18d9b915` · `TZ-OPS-313.done.md` |
| — | docs closeout | DONE | `b9bd2031` |

P3 (accept/косметика, не блокер): login.page.md device/break-glass (LEDGER-10 F-01); modules list envelope drift (LEDGER-04 F-02); MCP.md toolCount (LEDGER-08 F-02).

### Fixed locally в волне (docs-only, не чужой WIP)

- LEDGER-06: known_limitation «draft `?orderId=` selected bypass» добавлена в production-cockpit.page.md
- LEDGER-08: устаревшая строка «TZD-18/19 PARK» удалена из desktop/docs/MCP.md

## Cursor confidence estimate

**100 / 100** post warm deploy 0081e0bf (2026-08-16T13:57:34+03:00); smoke LAN+public /api/health/ready HTTP 200.

### Что осталось UNKNOWN

- Post-deploy health: **DONE** warm deploy 0081e0bf — LAN+public ready 200 (2026-08-16T13:57:34+03:00).
- Seed/права в **живой БД**: director GET закрыт кодом; runtime на реальном director-аккаунте не прогонялся.
- Живой MCP host: фактический toolCount, pairing + desktop-флоу (нужен запущенный десктоп).
- Полный jest matrix / Gantt deep BOM known_limitation / page.md drift за sample.

## Проверка волны

- scorecards 01–11 + этот rollup на месте
- gates: FE tsc PASS · BE tsc PASS · NAV/PHOTO landed
- Deploy: **DONE** warm `0081e0bf` (WAVE-DEPLOY-98; wipe нет); LAN+public ready 200
- P2 remediation **DONE**; SITE-SMOKE **DONE**; NAV-303 **DONE**; PHOTO-304 **DONE**

## Отчёт PO

- overall = **86** (min) / median **91**; P0 = **0**; **P2 closed**; Cursor confidence **100/100** post warm deploy
- ROLLUP: `docs/audits/confidence/00-ROLLUP.md`
- Archive: LEDGER-401 + OPS-313…316 + SITE-SMOKE-401 + NAV-303 + PHOTO-304 · prod SHA `0081e0bf`
