# WAVE — Project confidence ledger (Flash DeepSeek)

> **STATUS: DONE** — 2026-08-16 · umbrella `TZ-OPS-CONFIDENCE-LEDGER-401` archived  
> Rollup: `docs/audits/confidence/00-ROLLUP.md` · scores min**86** / median**91** · P0=**0**  
> Cursor Verdict PASS (audit wave). Remediation 313…316 — отдельно по PO. Deploy нет.

> Цель: по шкале Cursor/PO довести **уверенность 98–99** через серию
> узких audit-lanes. Исполнитель = **лёгкая модель (Flash)**.  
> Не путать с DeepC Pro site-walk (`PROMPT-SITE-OPERATOR-WALK-DEEPC.md`).

**Правило Flash:** один LANE = один чат-цикл; после DONE lane сразу CLAIM следующий
из очереди ниже — **не спрашивать PO «продолжать?»**. Стоп только: PO сказал стоп /
неверный workspace / нужен wipe|deploy / чужой _active на тех же keys.

**Что делает Flash:** читать → evidence → scorecard 0–100 → P0/P1 findings →
тонкий TZ в `_backlog` если чинить нельзя за <~30 мин / >1 hot file.  
**Что не делает Flash в этой волне:** большой rewrite, deploy, «почини весь Angular».

**Что делает Cursor после пачки lanes:** читает scorecards, сводит confidence,
PASS/FAIL TZ, запускает remediation отдельными TZ.

---

## Очередь (строго по порядку)

| # | LANE id | Тема | Output scorecard |
|---|---------|------|------------------|
| 1 | `LEDGER-01` | Docs hygiene: PAGE-TZ-INDEX ↔ page.md ↔ _NOW ↔ park | `docs/audits/confidence/01-docs.md` |
| 2 | `LEDGER-02` | COUPLING-MAP vs код (Order.status + 2–3 поля) | `docs/audits/confidence/02-coupling.md` |
| 3 | `LEDGER-03` | Routes/nav ↔ PAGE_KEYS ↔ seed (FIC §A/B sample) | `docs/audits/confidence/03-nav-rbac.md` |
| 4 | `LEDGER-04` | FE↔BE catalog: products/modules/materials list+create DTO | `docs/audits/confidence/04-catalog-contract.md` |
| 5 | `LEDGER-05` | FE↔BE deals: proposals/orders write-path + freeze | `docs/audits/confidence/05-deals-contract.md` |
| 6 | `LEDGER-06` | Production cockpit: ACTIVE filter + Gantt read vs PATCH | `docs/audits/confidence/06-production.md` |
| 7 | `LEDGER-07` | Warehouse/supply read SoT (StorageItem vs Material.stockQty) | `docs/audits/confidence/07-warehouse.md` |
| 8 | `LEDGER-08` | Desktop + MCP: HITL write, no silent catalog publish | `docs/audits/confidence/08-desktop-mcp.md` |
| 9 | `LEDGER-09` | Angular: 5 page containers + shared presentational sample | `docs/audits/confidence/09-angular-smart-dumb.md` |
| 10 | `LEDGER-10` | Auth/device session invariants (docs+code spot) | `docs/audits/confidence/10-auth.md` |
| 11 | `LEDGER-11` | Test/gates health: tsc FE/BE + sample jest green? | `docs/audits/confidence/11-gates.md` |
| 12 | `LEDGER-12` | Rollup: overall confidence + P0 backlog index | `docs/audits/confidence/00-ROLLUP.md` |

После **LEDGER-12** — STOP и отчёт PO: «очередь confidence DONE, жду Cursor».

Промпт агенту: `tasks/_backlog/PROMPT-CONFIDENCE-LEDGER-FLASH.md`
