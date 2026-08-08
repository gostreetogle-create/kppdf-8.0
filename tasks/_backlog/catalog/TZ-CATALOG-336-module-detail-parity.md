═══════════════════════════════════════════════════════════════
TZ-CATALOG-336: Карточка модуля = layout карточки изделия (BOM cascade)
═══════════════════════════════════════════════════════════════

> READY · **P0 завтра** (PO: «в первую очередь») · LAYER 3  
>
> Триггер: сегодня довели `/products/:id` (паспорт слева + Фото/Себест. +
> полный BOM с `app-composition-tree`). `/modules/:id` всё ещё «простыня»
> секций I–IV + `CompositionEditor` / таблицы — не тот UX.
> Из списка модулей → detail должен быть **тот же паттерн**, что у изделия.
>
> Эталон: `docs/pages/product-detail.page.md` (variant A+, 2026-08-08)  
> Скрин-канон каскада: `docs/pages/assets/composition-tree-cascade-dark-2026-08-08.png`  
> Pattern lock: `docs/audits/2026-08-08-composition-cascade-pattern-lock.md`

STATUS: READY

РОЛЬ АГЕНТА: Frontend (module detail + shared BOM panel reuse)

ЗАВИСИМОСТИ:
- Product detail layout DONE (composition-tree 330–334; cost-preview 302/303)
- Module composition API + tree уже есть (`/modules/:id/composition`, `/tree`)
- GET `/modules/:id/cost-preview` DONE
- **Не ждать** DICT-313 / COST-304 (параллельны docs)

LAYER: 3 (shared composition / bom panel)

PAGES: `/modules/:id`
PAGE_DOCS: `docs/pages/module-detail.page.md` (переписать под A+);  
  зеркало фраз в `product-detail.page.md` (одна строка «module parity»)

CONFLICT KEYS:
frontend/src/app/pages/modules/module-detail.page.ts;
frontend/src/app/pages/modules/module-detail.page.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.spec.ts;
frontend/src/app/shared/ui/composition/**;
docs/pages/module-detail.page.md;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-CATALOG-336.md;
progress.md;

---

## Domain preflight

| Тема | Канон |
|------|--------|
| Корень дерева | `ProductModule` — lineType module \| material (в т.ч. raw); **не** product |
| Add picker | `restrictToModule: true` (как уже в ProductBomPanel при add-in-module) |
| Себест. | read-only `cost-preview` (material/labor/total), не журнал CostCalculation изделия |
| Прайс | у модуля **нет** listPrice — не выдумывать; показать Себест. preview |
| Виды работ | остаются в паспорте/аккордеоне слева (модуль-специфика); не Excel под деревом |
| Фото | существующий ProductModulePhotos API / URL add — в левой колонке |

Проверено:
- `module-detail.page.ts` — PiShowcaseCard + секции I–IV + CompositionEditor
- `product-detail.page.ts` — split xl: left sticky passport+accordion; right ProductBomPanel full height
- `product-bom-panel` — `productId` required → **обобщить** до root `parentId`+`parentKind`  
  **или** тонкий `ModuleBomPanel` = wrapper с теми же tree/inspector; **запрещён** третий визуальный язык

---

## ЧТО ДЕЛАТЬ

1. **Layout parity** на `module-detail.page.ts`:
   - `PiPageChrome` crumbs `Каталог / Модули / <имя>` (как у изделия).
   - Split xl: **слева** sticky — паспорт (имя, артикул, габариты, вес) + аккордеон
     **Фото** / **Себестоимость** (cost-preview) [/ опц. Виды работ].
   - **Справа** — только BOM на всю высоту (без max-h скролла дерева), канон
     composition-tree (клик строкой, nest, rail, legend).
2. **BOM panel:**
   - Предпочтительно обобщить `ProductBomPanel` → root product|module
     (имя файла можно оставить или rename `catalog-bom-panel` — один PR, без
     большого рефактора consumers).
   - Inspector: qty, вклад себест. (mat price×qty / nested module preview×qty),
     «+ Из каталога» в выбранный узел, убрать, ссылка на карточку.
   - Picker: только module + material (raw ok); без вкладки изделия.
3. Убрать/спрятать legacy: огромные inline tables материалов как главный UX;
   `ModuleMaterialsFormDialog` — опц. «Быстрое редактирование» secondary, не центр.
4. Docs: переписать `module-detail.page.md` под A+; checklist + archive.
5. Gates:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern='module-detail|product-bom-panel|composition-tree'
```

## НЕ

- Менять BE composition rules / cost formula (COST-304/305)
- Product-линии в модуле
- Dark 335 обязательно в том же PR (можно ∥; не блокер 336)
- DICT quick-create; Orders-302; deploy без PO
- Ручная «цена модуля» на карточке

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `/modules/:id` визуально/структурно = product detail A+ (left/right)
- [ ] Каскад состава = `app-composition-tree` канон; add/remove/qty работают
- [ ] Нельзя добавить изделие в модуль (picker/API)
- [ ] Фото слева; себест. = cost-preview слева под фото
- [ ] Нет «простыни» showcase-секций как главного BOM UX
- [ ] Docs + Jest/tsc PASS; archive + lock

known_limitation: upload фото Phase E; where-used; batch list cost — как у изделия.

---

## Промпт исполнителю (P0 завтра)

```text
Прочитай GEMINI.md, docs/pages/product-detail.page.md и
tasks/_backlog/catalog/TZ-CATALOG-336-module-detail-parity.md.
Checklist docs/agent-checklists/TZ-CATALOG-336.md до правок.
Сделай карточку модуля как изделие (BOM cascade). Не деплой без PO.
```
