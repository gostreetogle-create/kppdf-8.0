# TZ-QA-445B — DONE

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-1
> TZ: `tasks/TZ-QA-445B-warehouse-receipt-inline-material.md`
> PAGES: `/stock-movements` (модалка «Приход на склад» / «Расход со склада»)

## Что сделано

1. **Инлайн «+» материал** в `StockMovementFormDialogComponent`:
   - `app-pi-select-add-row` рядом с select «Материал» (`data-test="mv-material-add"`);
   - открывает существующий `MaterialFormDialogComponent` (общий write-path каталога, не новая quick-форма).

2. **Автоподстановка после создания / выбора** (канон PO «autofill из карточки»):
   - после save инлайн-диалога — `materialId` ставится на новый материал;
   - лейбл количества → `Количество (<unit>)` из карточки материала.

3. **Docs:** `docs/pages/stock-movements.page.md` — note + TZ row.

4. **Tests:** 3 focused Jest cases (row+, open MaterialFormDialog, qty unit label).

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `pnpm exec jest --testPathPattern=pages/inventory/stock-movement-form-dialog --no-coverage` → **3/3 PASS**
- `pnpm exec jest --testPathPattern=pages/inventory/ --no-coverage` → **6 suites / 28 tests PASS**

## Conflict disclosure

- Keys: `pages/inventory/*` only (+ open shared MaterialFormDialog).
- Not touched: doc-constructor, proposal-workspace, product-detail, gantt, work-types.
- Parallel CLAIM: QA-445C (freebuff-2) — not touched.

## Known limits

- Полная MaterialFormDialog (не минимальный name+unit stub) — reuse SoT каталога, как в supply/KP.
- Autofill = materialId + unit in qty label (единственные применимые поля формы прихода; цена/склад из карточки в форме не представлены).

## Files

- `frontend/src/app/pages/inventory/stock-movement-form-dialog.component.ts`
- `frontend/src/app/pages/inventory/stock-movement-form-dialog.component.spec.ts`
- `docs/pages/stock-movements.page.md`
- `docs/agent-checklists/TZ-QA-445B.md`
- `.mimocode/locks/TZ-QA-445B-warehouse-receipt-inline-material.lock`

## Deploy

NO
