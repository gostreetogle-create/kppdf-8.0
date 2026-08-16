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

### P2 backlog (fix-now кандидаты) + пути TZ

| # | P2 | Где | TZ |
|---|----|-----|----|
| 1 | Директор видит страницы каталога (materials/organizations/counterparties/import-todos/categories/doc-template-categories/text-block-categories), но GET-списки `@Roles('admin','manager')` → 403; соседние products/modules/work-types включают director | LEDGER-04 F-01 | `tasks/_backlog/TZ-OPS-314-director-catalog-403.md` |
| 2 | `CreateOrderDto.status` enum позволяет shipped/delivered/cancelled при create (bypass transition graph; FE шлёт draft — бага нет, дыра контракта) | LEDGER-05 F-01 | `tasks/_backlog/TZ-OPS-315-order-create-status.md` |
| 3 | materials.page.ts рендерит legacy `Material.stockQty` как «Склад»/«Остаток» — поле не поддерживается движениями (SoT = StorageItem, FIC §D) | LEDGER-07 F-01 | `tasks/_backlog/TZ-OPS-316-materials-stock-display.md` |
| 4 | PAGE-TZ-INDEX.md — ~15 битых относительных ссылок (префикс `../tasks/` вместо `../../tasks/`); «377» назван PARK хотя в backlog | LEDGER-01 F-01/F-03 | `tasks/_backlog/TZ-OPS-313-fix-page-tz-index-links.md` (DEFER пока NAV-303 WIP на файле) |
| 5 | COUPLING-MAP §2/§4 «Комбайн `/dashboard`» устарел (канбан → `/design/combine`, NAV-303) | LEDGER-02 F-01 | после land NAV-303 (1 строка) |

P3 (accept/косметика): _NOW.md ACTIVE не упоминает NAV-303/SITE-SMOKE-401 (LEDGER-01 F-02); login.page.md без device/break-glass секции (LEDGER-10 F-01); контракт списков modules = plain array vs envelope (LEDGER-04 F-02); MCP.md toolCount числа (LEDGER-08 F-02).

### Fixed locally в волне (docs-only, не чужой WIP)

- LEDGER-06: known_limitation «draft `?orderId=` selected bypass» добавлена в production-cockpit.page.md
- LEDGER-08: устаревшая строка «TZD-18/19 PARK» удалена из desktop/docs/MCP.md

## Cursor confidence estimate

**90 / 100** (моя честная оценка до закрытия P2-бэкалога и seed-доказательств; 98–99 — за Cursor после rollup + закрытия P0/P2 по правилу волны).

### Что осталось UNKNOWN

- Seed/права в **живой БД**: «director 403» доказан статикой (RolesGuard + seed), runtime на реальном аккаунте не прогонялся; кастомные роли/grants вне проверки.
- Живой MCP host: фактический toolCount, pairing + desktop-флоу (нужен запущенный десктоп).
- Полный прогон всех тестов репозитория — только sample (170 тестов, все зелёные; FE tsc / BE tsc / desktop tsc PASS).
- Browser smoke / E2E (живой UI + Mongo) не запускался; SITE-OPERATOR-WALK (DeepC) — отдельный поток.
- Gantt deep BOM «изделие→изделие» — known_limitation (TZ-PRODUCTION-336).
- Drift page.md ↔ код за пределами выборочных 5 страниц (LEDGER-01) не опровергнут.

## Проверка волны

- scorecards 01–11 + этот rollup на месте
- gates: FE tsc PASS · BE tsc PASS · desktop tsc PASS · jest sample 6/6 зелёный
- чужой WIP не тронут/не закоммичен; коммит только своих keys (audit docs + umbrella) — по GIT-POLICY
- Deploy: НЕТ (запрещён волной)
- Checklist umbrella: **DONE** (Cursor Verdict PASS; archive + lock; remediation 313…316 не стартованы)

## Отчёт PO

- overall = **86** (min) / median **91**; P0 = **0**; P2 = 5 (4 с тонкими TZ в `tasks/_backlog/`, 1 после NAV-303)
- ROLLUP: `docs/audits/confidence/00-ROLLUP.md`
- Archive: `tasks/_archive/2026-08/TZ-OPS-CONFIDENCE-LEDGER-401.done.md` · WAVE DONE · deploy нет
