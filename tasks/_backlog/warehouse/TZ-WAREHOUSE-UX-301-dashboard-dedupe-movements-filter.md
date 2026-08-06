═══════════════════════════════════════════════════════════════
TZ-WAREHOUSE-UX-301: Dashboard dedupe + movements warehouse filter + type help
═══════════════════════════════════════════════════════════════

> READY for executor. LAYER 3 · FE inventory only.
> Parallel-safe vs CATALOG-320/311, ADMIN-306, TZD-14 (different keys).
> Does NOT implement owner/ACL (vision WAREHOUSE-UI-302 / WAREHOUSE-ACL-*).

РОЛЬ АГЕНТА: Frontend UI Engineer (Angular 20)

ЗАВИСИМОСТИ: Warehouse pack B on main (остатки/движения/склады UI существуют).
LAYER: 3

PAGES: /inventory ; /storage-items ; /stock-movements ; /warehouses
PAGE_DOCS: inventory-dashboard.page.md ; storage-items.page.md ; stock-movements.page.md ; warehouses.page.md (create/update)

CONFLICT KEYS:
frontend/src/app/pages/inventory/inventory-dashboard.page.ts;
frontend/src/app/pages/inventory/stock-movements.page.ts;
frontend/src/app/pages/inventory/warehouse-group-chips.ts;
frontend/src/app/pages/inventory/warehouse-form-dialog.component.ts;
frontend/src/app/pages/inventory/warehouses.page.ts;
docs/pages/inventory-dashboard.page.md;
docs/pages/stock-movements.page.md;
docs/pages/warehouses.page.md;
docs/SECTION-READINESS.md;
docs/agent-checklists/TZ-WAREHOUSE-UX-301.md;
tasks/_active/TZ-WAREHOUSE-UX-301.md;
progress.md

Проверено (2026-08-06 PO walkthrough):
- Dashboard tools buttons duplicate TOC (Склады/Остатки/Движения).
- Остатки already filter by warehouseId (chips/select).
- Движения: BE `?warehouseId=` exists; FE list has NO warehouse filter (only type chips).
- Warehouse.type = fixed enum; unused in business logic; dialog default `production` vs BE default `main`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ / ОТВЕТЫ PO
═══════════════════════════════════════════════════════════════

1. Дашборд: убрать дубль кнопок в `tools` (оставить TOC + KPI-карточки).
2. Остатки: ок (все склады / фильтр) — не ломать.
3. Движения: приход/расход в диалоге уже выбирают склад; **списку** нужен фильтр склада как на Остатках.
4. Тип склада: не справочник для переименования. Это **фиксированная классификация** (как status), не Zone names.
   - Зачем: подпись в таблице / будущий workshop ACL; сегодня почти не влияет на движения.
   - В UI: короткая RU-подсказка под полем; default create = `main` (как BE).
   - Не делать editable dictionary of types в этом TZ.
5. Зоны / описание / адрес — оставить; description optional.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Dashboard  
Удалить три `<a routerLink>` кнопки в `tools` (`inventory-dashboard.page.ts`).  
Оставить счётчик «N складов · M позиций» + KPI cards.

ШАГ 2 — Movements warehouse filter  
Скопировать паттерн Остатков: chips ≤8 / select >8 из `warehouse-group-chips` / `buildWarehouseFilterChips`.  
Передавать `warehouseId` в list API вместе с `type`.  
Сохранить type chips. Page doc обновить.

ШАГ 3 — Warehouse form type UX  
- Default create: `main`.  
- Hint под select (1–2 предложения RU): когда main / production / transit / branch / other.  
- Не убирать поле (нужно для CRUD schema).  
- Table labels уже есть — проверить ясность.

ШАГ 4 — Docs  
SECTION-READINESS: W6 дополнить «+ фильтр склада»; note про type.  
Page docs. Feature checklist N/A (нет нового route).

ШАГ 5 — Gates  
FE tsc + focused jest inventory/stock-movements/warehouse если есть.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Owner/ответственный, ACL worker-scoped (отдельные vision TZ).
- Editable dictionary для WarehouseType.
- Менять SoT qty / Material.stockQty.
- Catalog / admin / desktop files.
- `git add .`

═══════════════════════════════════════════════════════════════
ACCEPTANCE
═══════════════════════════════════════════════════════════════

1. На `/inventory` нет кнопок-дублей TOC в tools.
2. На `/stock-movements` можно отфильтровать по складу (Все / конкретный); API получает warehouseId.
3. Create warehouse default type=main; под полем type есть понятная RU-подсказка.
4. Остатки filter не сломан.
5. FE tsc + focused tests PASS; scoped commit.

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="inventory|storage-items|stock-movement|warehouse"
```

ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
