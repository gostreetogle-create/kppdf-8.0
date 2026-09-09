# NX UX smell audit — `/storage-items`

**TZ:** `TZ-NX-UX-09-storage-items-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 09
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed `/orders`, `/shipping`,
`/supply`, `/supply-requests`, `/warehouses` (same wave, same anti-patterns)
**Page source (conflict keys):** `storage-items.page.ts` (346 lines),
`storage-adjust-dialog.component.ts` (157), `storage-put-on-stock-dialog.component.ts` (245).
**Route:** `/storage-items`.

## Что это за страница

`StorageItemsPage` — "Остатки": balances table per warehouse (продукт/материал × склад ×
количество/резерв/минимум/зона), toolbar «Поставить на склад», row action «Корректировать», two
filters (склад select, «Мало остатков» checkbox) plus a read-only deep-link filter chip
(`?materialId=`) coming from other pages (e.g. a "show stock for this material" link). Both
dialogs (`StorageAdjustDialogComponent`, `StoragePutOnStockDialogComponent`) already use
`<app-pi-button>` and `.pi-outline-btn`-equivalent — converted in wave `08b`
(`docs/audits/2026-09-09-nx-ux-pi-button-sweep.md`), so this audit starts from a page that's
already ahead of pre-08b baseline on A1.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: часть данных нигде не видна** | **FAIL — P1** | `storage-items.page.ts:144-192` — no expand/click on rows. `StorageItem`'s catalog ref (`storage-item.types.ts:3-8`, `StorageCatalogRef`) carries `sku` and `unit` for both `material`/`product` — **neither ever renders anywhere on this page**, not in the row, not in either dialog. `quantity`/`reservedQty`/`minQuantity` are shown as bare numbers with no unit (`шт`? `кг`?) — genuinely ambiguous for a balances table. `isActive` (`storage-item.types.ts:23`) is also never surfaced (compare `/warehouses` which does show Активен/Неактивен, `warehouses.page.ts:80`) |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `:101-125` — loading text, `app-pi-status-banner` error+retry, honest empty («Нет остатков.») |
| A1 | Действия: `<a class="underline">` / мёртвый `pi-button-*` вместо `app-pi-button` | **OK** | Both toolbar («Поставить на склад», `:48-55`) and row action («Корректировать», `:182-189`) already use `<app-pi-button>` (fixed in `08b`); both dialog footers likewise |
| A2 | Destructive без confirm | **OK / N/A** | No delete action on this page. «Корректировать» can move quantity down but is an audited adjustment (requires a `reason`, `storage-adjust-dialog.component.ts:130-139`), not a destructive delete — no confirm dialog needed, consistent with wave precedent (adjust ≠ delete) |
| F1 | Фильтры: поле без `label` / голый native select | **OK** | Склад select has `<label class="sr-only" for="warehouse-filter">` (`:59-71`); «Мало остатков» checkbox has a real visible `<label>` (`:73-85`) |
| **F2** | **Фильтры: нет сброса чипа deep-link** | **FAIL — P1** | `:87-94` — the `materialId` query-param filter chip (`Материал: {{ materialName() }}`) renders as plain text with **no reset control at all**. Same class of bug already found+fixed on `/shipping` (`shipping-order-filter-chip` + «Сбросить», `shipping.page.ts:59-64`) and `/supply-requests` — here the user can't clear it without hand-editing the URL |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | Both selects (warehouse toolbar filter, material/warehouse in put-on-stock dialog) show `name`, never a raw ObjectId |
| L1 | Layout: контент липнет к рамке | **OK** | `px-panel-inset py-6`, `px-4 py-2/py-3`, `gap-3`/`gap-4` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Both dialogs render a single static error paragraph below the fields (`data-test="adjust-error"` / `"put-error"`), same non-jumping pattern used everywhere else this wave |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | All copy RU; every button wired; empty state is honest, no stub text |

## Что уже ок (не чинить)

- A1 already clean — this page benefited from the `08b` cross-cutting `app-pi-button` sweep before this audit even started.
- Loading/error/empty states are complete and match gold.
- Adjust dialog's audited-delta pattern (mandatory non-zero delta + mandatory reason + live preview + negative-total guard, `storage-adjust-dialog.component.ts:130-139`) is a solid, deliberate design — nothing to change.
- Put-on-stock dialog's "reuse selected-but-not-yet-in-list material" synthesis (`materialOptions` computed, `storage-put-on-stock-dialog.component.ts:160-174`) correctly keeps a deep-linked `materialId` selectable even before the materials list finishes loading — not a smell.
- Low-stock row highlight (`[class.text-destructive]="row.quantity <= row.minQuantity"`, `:167`) is a nice, cheap visual cue — kept as-is.

## Verdict

**PASS-FIX** — found 2×P1: **T1** (`material`/`product` `sku`+`unit` and `isActive` invisible
everywhere) and **F2** (material-filter deep-link chip has no reset). FIX TZ
(`TZ-NX-UX-09-storage-items-FIX`) — **claim**: add expand-in-row showing
Единица/Артикул/Статус read-only (same click/Enter/Space pattern as `/orders`/`/shipping`/
`/supply`/`/supply-requests`); add a «Сбросить» chip button next to the material filter label
(same pattern as `/shipping`'s `shipping-order-filter-clear`).

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Added `storageItemUnit`/`storageItemSku` helpers to
  `storage-item.types.ts` (same product-then-material fallback shape as the existing
  `storageItemName`/`storageItemWarehouseName`). Rows now expand-in-row on click/Enter/Space
  (`tabindex="0"`, `[attr.aria-expanded]`, same pattern as the 4 sibling pages this wave), showing
  Единица / Артикул / Статус (Активна/Неактивна) read-only. Row-actions cell gets
  `(click)="$event.stopPropagation()"` so «Корректировать» doesn't also toggle the row.
  `expandedId` resets on `load()`.
- **P1 (F2) — fixed.** Material filter now renders as a chip
  (`data-test="material-filter-chip"`) with a `.pi-outline-btn` «Сбросить»
  (`data-test="material-filter-clear"`) that clears the `materialId` query param via
  `Router.navigate([], { relativeTo: route, queryParams: { materialId: null }, queryParamsHandling: 'merge' })`
  — identical mechanism to `/shipping`'s `clearOrderFilter`. The existing `queryParamMap`
  subscription in the constructor picks up the cleared param and reloads automatically, no new
  wiring needed.
- **Specs added:** `storage-items.page.spec.ts` — expand shows unit/sku/status and collapses on
  second click; clicking «Корректировать» does not toggle expand; material filter chip renders
  with the reset button when `materialId` is present and clearing it navigates with
  `materialId: null`.
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (see checklist for
  exact counts).
- `docs/pages/storage-items.page.md` — NX UX note added (if section exists; else skipped, noted
  in Executor report).
