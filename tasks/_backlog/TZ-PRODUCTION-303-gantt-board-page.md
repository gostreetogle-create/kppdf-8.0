═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303: Cockpit shell + orders rail + Gantt bars (Lego #1)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — un-park только по PO «стартуем Гант».
CANON: `tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md`
DESIGN: `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`
SOURCE: shop-customer-lifecycle §2 S5; PO Lego 2026-08-06

РОЛЬ АГЕНТА: Frontend (Angular 20) — shell + 2 blocks; thin read API only if missing.

ЗАВИСИМОСТИ:
- TZ-PRODUCTION-302 DONE (`WorkType.days`)
- People / WorkTypes UI exist
- Prefer TZ-CATALOG-320 on origin (composition richer for bars)
- DEFER if `_active` holds ADMIN-306 / other claim on `app.routes.ts` / `app-layout`

LAYER: 3

PAGES: /production
PAGE_DOCS: production-cockpit.page.md (создать)

CONFLICT KEYS:
frontend/src/app/pages/production/** (NEW);
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
backend/src/common/seed/permissions.constants.ts (PAGE_KEYS);
backend/src/common/seed/admin.seed.ts (pages defaults);
docs/pages/production-cockpit.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md (§A);
docs/SECTION-READINESS.md (строка Производство);
docs/agent-checklists/TZ-PRODUCTION-303.md;
tasks/_active/TZ-PRODUCTION-303.md;
progress.md

Проверено: WorkType.days round-trip; Orders list API; no /production route yet.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Нет страницы производства. Нужен **не** толстый Гант-монолит, а:

1. `ProductionCockpitPage` shell со слотами LEFT + MAIN.
2. Block `orders-rail` — список заказов + поиск; выбор заказа в context.
3. Block `gantt-bars` — timeline-оценка по модулям/workTypes/`days`.
4. Shared `ProductionCockpitContext` (signals).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Shell + route + nav + PAGE_KEYS + seed pages + Feature Checklist §A  
  RU: «Производство». Empty state: «Выберите заказ или покажите все».

ШАГ 2 — `orders-rail`  
  Read existing orders API; клик задаёт `selectedOrderId`; фильтр «все активные».

ШАГ 3 — `gantt-bars`  
  Для выбранного заказа (или multi если просто): полоски module × workType.  
  Длина ≈ `WorkType.days` (календарные); если days null — bar «без срока» (hook для 304).  
  Лейбл UI: «План-оценка» (не факт).  
  Worker column: имена из People **если** связь уже есть; иначе «—» / stub (не блочить).

ШАГ 4 — Context wiring + Paper & Ink; 375px usable; focus rings.  
ШАГ 5 — Page doc + SECTION-READINESS: Производство = SHELL / MVP BUILD.  
ШАГ 6 — FE tsc + focused jest (shell context + rail select filters bars).

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Full `ProductionSchedule` schema / auto-assign engine (306+).
- Stuck dialog (304), check-in (305), shipping (307).
- God-component: вся логика в одном 2kLOC file — блоки отдельные.
- Catalog 320/311 files; desktop; admin role dialog.
- `git add .` чужого dirty.

═══════════════════════════════════════════════════════════════
ACCEPTANCE
═══════════════════════════════════════════════════════════════

1. `/production` открывается; nav виден Director/Manager.
2. Слева заказы; клик фильтрует/фокусирует Гант справа.
3. Хотя бы один happy-path заказ с модулями/workTypes рисует bars по `days`.
4. Явная подпись что это оценка, не факт цеха.
5. Feature Integration Checklist §A отмечен в checklist.
6. FE tsc + focused tests PASS; scoped commit only.

known_limitation: Auto-layout / assign writes / stuck / check-in = 304+.  
Successor: TZ-PRODUCTION-304 plugs into same gantt bars.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="production|gantt|cockpit"
```

ПРОМПТ: GEMINI.md + этот файл + TZ-PRODUCTION-300 + design spec. Push: по PO.
