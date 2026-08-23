═══════════════════════════════════════════════════════════════
TZ-SUPPLY-316: Материал — безкатегорийные + fallback «все»
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer
ЗАВИСИМОСТИ: Нет (hotfix поверх живого quick-order)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/supply/supply-quick-order.mock.ts; frontend/src/app/pages/supply/supply-quick-order.component.ts; frontend/src/app/pages/supply/supply-quick-order.component.spec.ts

Проверено: `materialsForCategory` в `supply-quick-order.mock.ts` (сейчас strict `m.categoryId === categoryId`); live `mapMaterial` / `MaterialsService.list`; PO: после выбора всех категорий список материалов пуст → в каталоге материалы без `categoryId`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Strict-фильтр после SUPPLY-311 спрятал все материалы без `categoryId`.
2. На live-данных почти все материалы без категории → picker пустой при любой категории.
3. PO: «поставь хотя бы показать все» — пустой список хуже, чем «одинаковые» безкатегорийные.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: `materialsForCategory` — правила видимости

```ts
export function materialsForCategory(
  materials: QuickOrderMaterial[],
  categoryId: string,
): QuickOrderMaterial[] {
  if (!categoryId) return [];
  const matched = materials.filter((m) => m.categoryId === categoryId);
  if (matched.length > 0) {
    // Категория «живая»: свои + безкатегорийные (чтобы старый каталог не пропал)
    const orphan = materials.filter((m) => !m.categoryId);
    return [...matched, ...orphan];
  }
  // Нет ни одного с этой категорией → показать безкатегорийные; если и их нет — все
  const orphan = materials.filter((m) => !m.categoryId);
  return orphan.length > 0 ? orphan : materials;
}
```

Не менять `suppliersForCategory` в этом TZ.

ШАГ 2: Placeholder материала (UX hint)

В `supply-quick-order.component.ts` для `app-pi-overflow-select` материала:
- если `materialOptions(...).length === 0` → placeholder «— нет материалов —»
- иначе если среди options есть материалы без categoryId **и** нет matched по текущей категории → placeholder «— все / без категории —» (коротко, без жаргона)
- иначе оставить «— выберите материал —»

Реализация hint: маленький helper `materialPickerPlaceholder(categoryId)` рядом с `materialOptions`, без лишнего UI-текста в форме.

ШАГ 3: Тесты

В `supply-quick-order.component.spec.ts`:
1. Заменить тест «never appear» на: orphan **появляется** при выборе `cat-metizy`.
2. Добавить: если в каталоге только materials с чужой категорией + orphan — при выборе пустой категории (matched=0) показываются orphan; если orphan нет и matched нет — показываются **все** (fallback).
3. Сохранить тест «osnastka filters out Подшипник 6205» (у mock-материалов есть categoryId → matched.length > 0 → чужая категория не показывается; orphan не в mock — OK).
4. Оставить тест API refresh по `categoryId` (не ломать).

ШАГ 4: Gates

```bash
cd frontend && pnpm test -- src/app/pages/supply/supply-quick-order.component.spec.ts
```

Archive + checklist Claim slot по `GEMINI.md` / `kppdf-executor-loop`.

═══════════════════════════════════════════════════════════════
НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Не бэкенд backfill categoryId (отдельная data-задача).
- Не менять layout/CSS Paper & Ink quick-order.
- Не трогать supplier filter.
- Не коммитить чужой WIP.

═══════════════════════════════════════════════════════════════
ACCEPTANCE
═══════════════════════════════════════════════════════════════

- [ ] При категории с matched-материалами: в списке matched + безкатегорийные; материалы **других** категорий — нет.
- [ ] При категории без matched: видны безкатегорийные; если их нет — видны все материалы (fallback).
- [ ] PO на live: после выбора «Металлы» (или любой категории) в «Материал» снова есть пункты, а не пусто.
- [ ] Spec зелёный.

═══════════════════════════════════════════════════════════════
known_limitation
═══════════════════════════════════════════════════════════════

Пока в БД у материалов пустой `categoryId`, список при разных категориях будет похож (orphan/fallback). Это ожидаемо до data-fix назначения категорий.
