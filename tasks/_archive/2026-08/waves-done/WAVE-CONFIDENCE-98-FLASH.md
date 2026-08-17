# WAVE — Confidence 98 (Flash-safe lanes)

> Цель для PO/Cursor: после **всех** lane-отчётов иметь evidence-based
> оценку готовности ~98–99 (не «ощущение»).  
> Исполнитель: **DeepSeek Flash / Freebuff light** — **один LANE за чат**.  
> Не отдавать этому Flash промпт `PROMPT-SITE-OPERATOR-WALK-DEEPC` (тот для Pro).

## Как получить 98–99

1. PO запускает **6 чатов** (или по одному, когда свободен Flash), каждый с `LANE=X`.
2. Каждый чат пишет scorecard + findings + тонкие TZ на P0/P1.
3. Cursor читает 6 scorecards → ставит **Composite** и говорит, чего не хватает до 98.
4. Пока Composite < 98 — только закрытие P0 из lane-отчётов (отдельные thin TZ / Pro).

Честный 98 **невозможен** из одного Flash-чата «проверь всё».

## Lanes

| LANE | Фокус | Output scorecard |
|------|--------|------------------|
| **A** | Docs ledger: PAGE-TZ-INDEX ↔ routes, COUPLING-MAP, SECTION-READINESS, FIC gaps | `docs/audits/confidence/lane-A-docs.md` |
| **B** | Catalog FE↔BE: materials/modules/products list+create+save contracts | `docs/audits/confidence/lane-B-catalog.md` |
| **C** | Сделки/КП: proposals create/save, snapshot vs catalog | `docs/audits/confidence/lane-C-deals.md` |
| **D** | Orders + production: status coupling, draft≠цех, ship write-path | `docs/audits/confidence/lane-D-orders-production.md` |
| **E** | Desktop + MCP: HITL write-path, no silent catalog publish | `docs/audits/confidence/lane-E-desktop-mcp.md` |
| **F** | Angular: container vs presentational на 8–12 файлах-образцах | `docs/audits/confidence/lane-F-angular.md` |

Composite (Cursor):  
`0.15A + 0.20B + 0.20C + 0.20D + 0.15E + 0.10F` → цель ≥ 98 после закрытия P0.

## Промпт

`tasks/_backlog/PROMPT-CONFIDENCE-98-FLASH.md` — первая строка обязана быть `LANE=A` … `LANE=F`.
