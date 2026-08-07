═══════════════════════════════════════════════════════════════
TZ-CATALOG-333: Composition containment outlines (nested frames)
═══════════════════════════════════════════════════════════════

> DONE · LAYER 2–3 · archived `tasks/_archive/2026-08/TZ-CATALOG-333.done.md` · `f2aedfd`
>
> PO sketches 2026-08-08: рамки «что внутри чего»; колонки = смысл уровней;
> design = Cursor canon в `docs/audits/2026-08-08-composition-containment-outline.md`
> (не копировать цвета/штриховку эскиза).
>
> Проверено: `composition-tree.component.ts` (indent + kind wash 330);
> `product-bom-panel.component.ts`; `docs/pages/ui-composition-tree.md`.

STATUS: DONE — archive `tasks/_archive/2026-08/TZ-CATALOG-333.done.md` · `f2aedfd`
(исторически: после/параллельно 332 — conflict на composition-tree / BOM:
  если 332 IN WORK на lists only → 333 OK; если 332 трогает
  `catalog-kind-oklch` / tree — согласовать или DEFER 333 до archive 332)

РОЛЬ АГЕНТА: Frontend UI

ЗАВИСИМОСТИ:
- TZ-CATALOG-330 DONE (kind oklch)
- TZ-CATALOG-331 DONE (palette) желательно
- composition-tree click canon

LAYER: 3 (edit shared composition-tree)

PAGES: `/products/:id` (Состав)
PAGE_DOCS: ui-composition-tree.md ; product-detail.page.md

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.spec.ts;
docs/pages/ui-composition-tree.md;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-CATALOG-333.md;
progress.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Nest frame в `app-composition-tree`
- Когда узел expanded и есть children: обернуть список детей в контейнер
  `.comp-tree__nest` с:
  - hairline border
  - лёгкий background wash от `catalogKindOklch(parent.kind)`
  - padding/gap по аудиту §3.4
- Свёрнутый узел — nest не в DOM (или `hidden`), только строка.
- Рекурсия уже есть — вложенные nest = module-in-module.
- Сохранить AC клика всей строки / select-none / › декоративный.

ШАГ 2 — BOM panel
- Компактная легенда kind над деревом (точки + RU подписи).
- Не раздувать inspector; add-in-context оставить.

ШАГ 3 — Docs
- Обновить `ui-composition-tree.md`: § containment outlines + ссылка на аудит.
- `product-detail.page.md` — одна фраза про рамки принадлежности.

ШАГ 4 — Gates
- FE tsc; существующие/новые specs на expand→nest visible, collapse→gone.
- Light/dark: wash читаем (не «грязь»).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- BE composition / cost API (COST-302)
- 3-column Excel layout
- RAL, Gantt
- desktop/**, CATALOG-332 list pages (если не тот же agent)
- Новая сущность Part

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Раскрытый модуль с 2 материалами: оба визуально внутри одной рамки модуля.
2. Два модуля в изделии: две отдельные nest-рамки.
3. Module→module: рамка в рамке, expand/collapse работает.
4. Канон клика composition-tree не сломан.
5. Цвета = catalogKindOklch, не эскиз PO.
6. `pnpm exec tsc -p tsconfig.app.json --noEmit` + specs PASS.
7. Cursor PASS → archive; commit только keys.

known_limitation: вклад ₽ в строке — COST-303; корень без дубля имени — polish в том же TZ если дёшево.
