═══════════════════════════════════════════════════════════════
TZ-SUPPLY-302: Auto SupplyTasks from order/module BOM
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #1
DEPENDS ON: TZ-SUPPLY-301 DONE
LAYER: 2
CHECKLIST: docs/agent-checklists/TZ-SUPPLY-302.md
PAGES: /supply · PAGE_DOCS: docs/pages/supply.page.md

РОЛЬ: Backend supply (+ тонкий FE кнопка на /supply или order-detail)

CONFLICT KEYS:
backend/src/modules/supply/**;
frontend/src/app/pages/supply/**;
docs/pages/supply.page.md;
docs/agent-checklists/TZ-SUPPLY-302.md;

Проверено: SUPPLY-301 SupplyTask draft|confirmed|…; known_limitation BOM explode;
order composition live (ORDERS-302); не трогать mutation-journal / desktop.

---

## ИСХОДНОЕ

Задачи снабжения только вручную. Нужен explode материалов из BOM заказа/модуля.

## ЧТО ДЕЛАТЬ

1. `POST /api/supply-tasks/explode` body `{ orderId, moduleId? }`  
   - читает composition (product/module lines → materials)  
   - создаёт SupplyTask draft на каждый material (dedupe по materialId+orderId)  
   - idempotent: повторный explode не дублирует open tasks  
2. FE: кнопка «Создать из заказа» (диалог выбора orderId) на `/supply`  
   или тонкая кнопка на order-detail — **не** app.routes новых путей.  
3. Tests BE explode; tsc BE+FE zone.

## НЕ

MRP/tender; Gantt block; silent stock deduct; desktop; import-task.

## AC

1. explode на заказ с ≥2 materials → ≥2 draft tasks.  
2. повторный explode → 0 новых дублей.  
3. /supply показывает новые строки.  
4. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + supply tests; FE tsc если FE.

known_limitation: нет auto-confirm; нет закупа PO.
