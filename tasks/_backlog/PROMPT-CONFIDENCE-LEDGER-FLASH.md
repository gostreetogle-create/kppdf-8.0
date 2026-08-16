# PROMPT — Confidence ledger queue (Flash DeepSeek)

> Лёгкая модель. Копируй блок ниже **целиком**.  
> Агент сам идёт LANE 01 → 12 без вопросов «продолжать?».

```text
Ты — Flash/DeepSeek executor на kppdf-8.0. Ты НЕ Pro и НЕ переписываешь полпроекта.
Твоя работа: ОЧЕРЕДЬ audit-lanes LEDGER-01 … LEDGER-12. После каждого lane — сразу следующий.

════════════════════════════════════════════════════════
0. СТАРТ (один раз)
════════════════════════════════════════════════════════
1) Workspace MUST D:\kppdf-8.0
   Get-Location + git rev-parse --show-toplevel → оба совпадают. Иначе STOP.
2) Прочитай:
   - docs/PO-CANON.md (коротко)
   - tasks/_backlog/WAVE-CONFIDENCE-LEDGER-FLASH.md (очередь)
   - docs/agent-checklists/_NOW.md + tasks/_active/* (не конфликтуй)
3) Создай папку docs/audits/confidence/ если нет.
4) CLAIM umbrella:
   - tasks/_active/TZ-OPS-CONFIDENCE-LEDGER-401.md
   - docs/agent-checklists/TZ-OPS-CONFIDENCE-LEDGER-401.md из _TEMPLATE.md
   Status CLAIMED. В checklist веди таблицу: Lane | Status | Score | File
5) Deploy/wipe ЗАПРЕЩЕНЫ. Чужой WIP (photos.service frame и т.п.) НЕ коммить.
6) Не спрашивай PO «продолжать?» между lanes. Стоп только: PO stop / bad workspace / deploy needed / весь 01–12 DONE.

════════════════════════════════════════════════════════
1. ФОРМАТ КАЖДОГО LANE (обязателен)
════════════════════════════════════════════════════════
Для текущего LANE:

A) В checklist поставь lane = IN WORK.
B) Прочитай ТОЛЬКО файлы из §3 для этого lane (не весь репо).
C) Запусти gates ТОЛЬКО если lane это требует (см. §3).
D) Запиши scorecard файл (путь в таблице волны):

```md
# LEDGER-XX — <title>
date: ISO
agent: <id>

## Score (0–100)
overall: NN
subscores:
  evidence_quality: NN
  sync_code_docs: NN
  risk_holes: NN

## What I opened (paths)
- path — 1 line what checked

## PASS evidence
- bullet

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-xx | P0/P1/P2 | … | … | fix-now / TZ / accept |

## TZ drafted (if any)
- tasks/_backlog/TZ-….md

## Confidence note for Cursor
1–3 sentences: what still unknown
```

E) Если finding чинится локально (<1 файл логики, очевидно, не schema) — МОЖНО починить + focused test + commit только своих keys.
   Если сомневаешься / >1 hot file / API / nav IA — пиши TZ по docs/TZ-AUTHORING.md в tasks/_backlog/ (тонкий), НЕ чини.
F) Lane Status=DONE в checklist. Сразу начинай следующий номер.

════════════════════════════════════════════════════════
2. ОЧЕРЕДЬ (делай по порядку, не прыгай)
════════════════════════════════════════════════════════

### LEDGER-01 — Docs hygiene
Читай: docs/pages/PAGE-TZ-INDEX.md ; 5 случайных docs/pages/*.page.md ;
docs/agent-checklists/_NOW.md ; tasks/_park/README.md (если есть) ; docs/DOCS-INTEGRITY.md
Проверь: битые ссылки на несуществующие TZ; ACTIVE пустой или честный; park не выдаёт за live.
Output: docs/audits/confidence/01-docs.md
Gates: нет (docs-only).

### LEDGER-02 — Coupling Order.status
Читай: docs/COUPLING-MAP.md §2 ; frontend/.../gantt-bar.model.ts ACTIVE_* ;
docs/pages/dashboard.page.md ; docs/pages/production-cockpit.page.md
Проверь: draft ≠ цех active; doc=code; shipped только POST ship (по докам).
Output: 02-coupling.md
Gates: нет обязательных (опц. jest gantt-bar.model).

### LEDGER-03 — Nav / RBAC sample
Читай: frontend/.../app-layout.component.ts NAV_CATEGORIES ;
frontend/.../app.routes.ts (sample 10 routes) ;
backend/.../permissions.constants.ts PAGE_KEYS (grep) ;
docs/FEATURE-INTEGRATION-CHECKLIST.md §A/B
Проверь: пункт nav имеет route; pageKey/capabilities не «дыры» на глаз (отметь UNKNOWN если не доказал seed).
Output: 03-nav-rbac.md

### LEDGER-04 — Catalog FE↔BE
Читай: materials.service + modules/products services (list/create) ;
backend modules materials/products/modules controllers DTO (create/update) ;
1 dialog create (product или material form) Save payload поля.
Проверь: _id vs id; обязательные article; RU errors если видно.
Output: 04-catalog-contract.md
Gates: опц. tsc frontend; focused materials|products dialog spec если есть.

### LEDGER-05 — Deals / orders write-path
Читай: docs/pages/dashboard.page.md Couplings ; docs/pages/orders.page.md ;
order ship/cancel mentions ; proposal create page.md кратко
Проверь: нет второго write-path «на глаз»; freeze documented.
Output: 05-deals-contract.md

### LEDGER-06 — Production
Читай: production-cockpit.page.md ; gantt-bar.model ACTIVE ; PRODUCTION-337 archive note
Проверь: active filter; known limits (?orderId draft) записаны.
Output: 06-production.md
Gates: jest gantt-bar.model|orders-rail (если быстро).

### LEDGER-07 — Warehouse SoT
Читай: docs/COUPLING-MAP.md строка StorageItem/stockQty ; storage-items.page.md ;
Material.stockQty usage grep в frontend (limit).
Проверь: SoT остатка = StorageItem; Material.stockQty не выдаёт за правду.
Output: 07-warehouse.md

### LEDGER-08 — Desktop / MCP
Читай: desktop/docs/MCP.md (если есть) ; tasks/_archive/.../TZD-48.done.md ;
tasks/_backlog/desktop/TZD-49*.md PARK status
Проверь: HITL; TZD-49 park; нет «автопубликации каталога» в доках.
Output: 08-desktop-mcp.md
Gates: опц. desktop tsc если быстро, иначе SKIP gates + честно.

### LEDGER-09 — Angular smart/dumb
Читай: docs/ANGULAR-GUIDE.md или DEVELOPMENT-PATTERNS (container vs presentational) ;
5 файлов: products.page.ts ; materials.page.ts ; pi-table.component.ts ;
pi-showcase-card.component.ts ; один dialog form
Проверь: page = orchestration/API; shared UI = inputs/outputs без HTTP (или finding).
Output: 09-angular-smart-dumb.md
НЕ рефакторь. Только findings + TZ если P0 architecture.

### LEDGER-10 — Auth / device
Читай: docs про device grant / AUTH (page или vision) ; grep sessionKind device (limit)
Проверь: passwordless device ≠ password session в доках; known park AUTH-307.
Output: 10-auth.md

### LEDGER-11 — Gates health
Выполни (и вставь хвост лога в scorecard):
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
```
Если photos.service WIP ломает FE tsc — зафиксируй BLOCKER peer WIP, не «чини фото-frame».
Output: 11-gates.md со scores (100 если оба PASS).

### LEDGER-12 — ROLLUP
Собери docs/audits/confidence/00-ROLLUP.md:
- таблица lane → score
- overall = min(lane scores) и median (оба числа)
- Top P0 list + пути TZ
- «Cursor confidence estimate» (твоя честная 0–100) + что осталось UNKNOWN
Checklist umbrella → READY FOR REVIEW.
Не archive без Cursor PASS.
STOP. Короткий отчёт PO: overall + путь ROLLUP + число P0.

════════════════════════════════════════════════════════
3. КАЧЕСТВО EVIDENCE
════════════════════════════════════════════════════════
- Каждый PASS = path + что увидел.
- «Кажется ок» без path = score ≤40 за evidence_quality.
- Не читай progress.md целиком. Не трогай OrchestratorKit чужие TZ.

Конец промпта.
```

## Для PO

1. Вставь промпт во Flash.  
2. Когда агент напишет LEDGER-12 DONE — кинь Cursor: «проверь docs/audits/confidence/00-ROLLUP.md».  
3. 98–99 ставит **Cursor после rollup + закрытия P0**, не Flash сам себе.
