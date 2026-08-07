═══════════════════════════════════════════════════════════════
TZ-CATALOG-334: Composition nest — visual block cohesion
═══════════════════════════════════════════════════════════════

> READY · LAYER 3 · FE only · review before archive
>
> PO (2026-08-08): после 333 всё ещё «одна куча»; нужно яснее видеть
> пачки (модуль + дети) за счёт дизайна, техника дерева ок.
> Канон: `docs/audits/2026-08-08-composition-block-cohesion-visual.md`

STATUS: READY (выдавать по «делай TZ-CATALOG-334»)

РОЛЬ АГЕНТА: Frontend UI

ЗАВИСИМОСТИ: TZ-CATALOG-333 DONE

LAYER: 3

PAGES: `/products/:id` (Состав)
PAGE_DOCS: ui-composition-tree.md ; product-detail.page.md (одна фраза)

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts;
docs/pages/ui-composition-tree.md;
docs/agent-checklists/TZ-CATALOG-334.md;
progress.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Усилить визуал `.comp-tree__nest` по аудиту:
   - sibling gap между соседними nest / между sibling-узлами с nest
     (~`mb-3` / `space-y-3` на уровне списка детей родителя);
   - left rail 3px kind border;
   - чуть сильнее wash + padding;
   - children indent внутри nest (+8–12px).
2. Не менять expand/collapse логику, click canon, API.
3. Spec: nest по-прежнему только при expand; опц. assert классов gap/rail.
4. Docs: § в `ui-composition-tree.md` — «пачки / cohesion».

НЕ: Excel-колонки; RAL; BOM inspector rewrite; desktop; COST.

AC:
- [ ] 2 модуля в изделии → две визуально отдельные пачки с воздухом между ними
- [ ] Материалы модуля читаются «внутри» пачки модуля
- [ ] Light/dark ок; tsc + composition-tree specs PASS
- [ ] Cursor PASS → archive; stage только keys

known_limitation: вклад ₽ — COST-303.
