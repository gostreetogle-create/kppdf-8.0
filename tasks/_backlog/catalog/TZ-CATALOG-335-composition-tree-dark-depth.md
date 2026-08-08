═══════════════════════════════════════════════════════════════
TZ-CATALOG-335: Composition tree — depth в тёмной теме (не монохром)
═══════════════════════════════════════════════════════════════

> READY · LAYER 3 (shared `composition-tree`) · завтра после/рядом с COST-304
>
> Триггер PO (2026-08-08 ночь): на тёмной теме каскад состава «слишком
> монохромный» — уровни читаются слабо (скрин
> `docs/pages/assets/composition-tree-cascade-dark-2026-08-08.png`).
> Светлая тема после 333/334 ок; dark — дожать.
>
> Проверено:
> - `nestSurface(depth)` = ink→paper color-mix 4/8/13/18% — в dark ink светлый,
>   paper тёмный → слабый серый каскад, мало chroma
> - Kind только на бейдже + rail (канон) — не заливать nest kind-wash
> - Канон: `docs/pages/ui-composition-tree.md`

STATUS: READY

РОЛЬ АГЕНТА: Frontend (shared composition-tree + при необходимости dark tokens)

ЗАВИСИМОСТИ: TZ-CATALOG-333/334 DONE; образец поведения не ломать

LAYER: 3

PAGES: `/products/:id` BOM; любой consumer `app-composition-tree`
PAGE_DOCS: `docs/pages/ui-composition-tree.md`

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts;
frontend/src/styles.css (только если нужны paper-N / nest tokens для dark);
docs/pages/ui-composition-tree.md;
docs/agent-checklists/TZ-CATALOG-335.md;

---

## ЧТО ДЕЛАТЬ

1. В **`.dark`**: усилить различимость nest depth (варианты — выбрать один,
   задокументировать в page doc):
   - (A) больше шаг L в `nestSurface` / отдельные dark inkPct;
   - (B) лёгкая chroma к paper-N (не kind-wash);
   - (C) чуть сильнее border/shadow между уровнями + rail contrast.
2. Не возвращать kind-tint flood на nest (PO: «всё розовое» уже отвергли).
3. Сверить light: регрессии нет (screenshot/manual).
4. Jest: data-nest-depth / expand behaviour без ломки.

AC:
- [ ] На dark ≥3 уровней nest глазом отличимы без прищура
- [ ] Kind только бейдж+rail; строки не «серая каша»
- [ ] Light не хуже 334
- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit`; composition-tree Jest PASS

НЕ: переписывать click canon; Orders UI (→ ORDERS-302); COST-304 scope; deploy

Промпт:
```text
GEMINI.md + tasks/_backlog/catalog/TZ-CATALOG-335-composition-tree-dark-depth.md
Checklist docs/agent-checklists/TZ-CATALOG-335.md. Выполни. Не деплой.
```
