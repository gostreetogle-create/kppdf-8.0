# TZ-TEST-421: FE full suite красный после волн SUPPLY-318…431 — вернуть зелёный

> Источник фактов: сессия деплоя 2026–08–25 (Claude terminal). Прод задеплоен
> по команде PO с этим долгом — см. `docs/agent-checklists/PRE-DEPLOY-2026-08-24-wave.md`
> («FE full jest 56 fail / 1980 pass (baseline debt)»).
>
> ВАЖНО: это НЕ старый базлайн. На `167865c9` (вечер 2026–08–23) полный FE suite
> был **2015/2015 PASS** (`PRE-DEPLOY-2026-08-23-evening.md`). Красный прилетел
> волнами SUPPLY-318…320 и PO-smoke wave `565c630d` за 2 дня. Штамп подготовки
> назвал это «baseline» некорректно — не игнорировать как долг.

РОЛЬ АГЕНТА: Frontend Test Engineer
ЗАВИСИМОСТИ: нет
LAYER: 3 (specs; product-правки только если триаж покажет реальный баг)
PAGES: /materials ; /supply ; /desk
PAGE_DOCS: materials.page.md ; supply.page.md

CONFLICT KEYS: frontend/src/app/pages/materials/material-form-dialog.component.spec.ts; frontend/src/app/pages/materials/material-form-dialog.component.ts

## Диагностированное (готовое)

### ✅ Шаг 1 ВЫПОЛНЕН 2026–08–25 (claude): material-form-dialog — 50/50 зелёных
Коммит: `test(materials): CategoriesService mock in form-dialog spec (TZ-TEST-421 p1)`.
Фикс: в `setup()` providers добавлен мок `{ provide: CategoriesService, useValue: { list: () => of({ ok: true, data: [] }) } }`.
После него полный FE suite: **6 failed / 2030 passed** (было 56).

### Остаток: 6 падений в 4 suite'ах (триаж по сигнатурам, снят 2026–08–25)

| Suite | Сигнатура | Гипотеза | Риск |
|---|---|---|---|
| `commercial/proposals/proposal-create-terms.component.spec.ts` | ожидал текст «Тексты условий — в это КП», получил «Строки ниже попадают в PDF. Поля бланка…» | stale assert после KP-волны `565c630d` (переписали блок условий) | низкий |
| `orders/orders.page.spec.ts` | `toHaveBeenCalledWith("prod-1")` промах + `NG04002: Cannot match any routes 'modules/m1'` | компонент теперь навигирует на модуль — либо спеке нужен роут, либо **реальная регрессия роутинга** | **СРЕДНИЙ — проверить на проде /modules** |
| `orders/order-detail.page.spec.ts` | `NG0953: Unexpected emit for destroyed OutputRef` ×2 + `TypeError: … of undefined/null (reading 'click')` | emit после destroy в новом коде волны — возможно **реальный продуктовый баг** жизненного цикла | **СРЕДНИЙ** |
| `commercial/proposals/workspace/proposal-workspace.page.spec.ts` | `TypeError: Cannot read properties of null (reading 'click')`, `expect(…).not.toBeNull()` → null | селектор умер после редизайна workspace — stale spec ИЛИ пропала кнопка | средний |

## ЧТО ДЕЛАТЬ

1. ~~Мок CategoriesService~~ — СДЕЛАНО (см. выше).
2. Триаж 4 suite'ов сверху вниз: начать с orders/order-detail (риск прод-бага);
   для каждого — либо обновить спеку под канон волны, либо отдельный фикс-коммит
   продуктового бага внутри этой же TZ (P0/P1 пометить).
3. Ручная проверка на проде: открыть существующее КП → блок условий;
   модульную навигацию (`modules/<id>`); кнопки в workspace proposals.
4. Гейты: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0;
   полный `pnpm test` → **0 fail** (или задокументированный остаток с именами);
   `pnpm lint` без новых ошибок.
5. Archive `tasks/_archive/<месяц>/TZ-TEST-421.done.md` + строка в `_NOW.md`.
6. Обновить «§Базлайн известных падений» в `tasks/PROMPT-DEPLOY-READY.md`:
   после этой TZ FE-базлайн пуст; BE остаются 2 записи.

## Acceptance

- [ ] `frontend && pnpm test` → 0 failed (или явный остаток ≤2 с именами и причиной)
- [ ] Ни одного «молчаливого» skip/delete теста без причины в чек-листе
- [ ] PROMPT-DEPLOY-READY §Базлайн актуализирован
