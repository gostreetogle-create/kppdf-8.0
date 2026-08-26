# TZ-UX-444B — DONE

> Статус: DONE · Закрыт: 2026-08-26 · agent: buffy (Freebuff executor)
> TZ: `tasks/TZ-UX-444B-where-used-product-module.md`
> PAGES: `/products/:id` ; `/modules/:id`

## Что сделано

Where-used UI (reuse API, паттерн material-detail) добавлен на product-detail и module-detail:

1. **Product detail** (`frontend/src/app/pages/products/product-detail.page.ts`):
   - Секция `data-test="product-where-used"` в main column **над** BOM (`space-y-4`, «связи → состав»).
   - `httpResource` → `${API}/products/:id/where-used?page=1&limit=50` (limit 50 как у material).
   - Таблица Тип | Название (routerLink) | Кол-во | Ед.; loading/error/empty RU copy;
     счётчик total + «Показано X из Y».
   - Ссылки: dotted underline как у material (`text-primary underline decoration-dotted`),
     не gold hover (444C выровняет по канону).

2. **Module detail** (`frontend/src/app/pages/modules/module-detail.page.ts`):
   - То же самое, `data-test="module-where-used"`, `GET /modules/:id/where-used`,
     main column обёрнута в `space-y-4`, секция **над** BOM (оператор видит «куда входит» до состава).

3. **Specs**:
   - Создан `product-detail.page.spec.ts` (layout + rows + links + empty state + back).
   - `module-detail.page.spec.ts`: +where-used rows/links + empty state (reload-flush).
   - **13/13 PASS**.

4. **Docs**: `docs/pages/product-detail.page.md` + `docs/pages/module-detail.page.md`
   (layout «связи → состав», API-таблица, убрано «Where-used — не в UI»).

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `pnpm exec jest src/app/pages/products/product-detail.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts --no-coverage --runInBand` → **13/13 PASS**
- `pnpm exec eslint` (4 файла) → **PASS**
- `prettier --write` → unchanged · `git diff --check` → clean (только pre-existing trailing whitespace в _NOW.md)

## Conflict disclosure

- `tasks/_active/` содержал только чужой `TZ-DOC-443.md` (builder-inspector) — disjoint,
  мои conflict keys не пересекались. Чужой WIP не трогал.
- PAGE-TZ-INDEX: planned-строки `TZ-UX-444B` уже были добавлены при планировании волны —
  не менял (не мой diff).

## Known limits

- Where-used показывает только прямых родителей из API (без «опосредованной связи» вендора).
- Лимит 50 строк, без пагинации в UI (как у material).

## Files

- `frontend/src/app/pages/products/product-detail.page.ts` (+.spec.ts — новый)
- `frontend/src/app/pages/modules/module-detail.page.ts` (+.spec.ts)
- `docs/pages/product-detail.page.md` · `docs/pages/module-detail.page.md`
