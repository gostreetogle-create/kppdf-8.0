# NX HUB expand-card audit — «просто тексты» → категорийные карточки

> TZ-NX-HUB-06-EXPAND-CARDS (WAVE-NX-SHELL-HUB-POLISH #02). PO скрин: `/supply`
> expand читался как «простыня» голых label/value, в отличие от gold
> `/counterparties` (карточки с заголовками категорий).

updated_at: 2026-09-10
method: code diff + focused Jest/DOM assertions (structural checks: `section.hairline.rounded-sm.bg-paper` + `h3` per card) — build-time verification, no live-browser pass this stage (TZ-05's CDP screenshots already confirmed `/orders` and `/counterparties` visually match the gold rhythm; this stage only changes `/supply` and `/warehouses` markup along the same established class contract, so the same visual outcome is expected — not re-screenshotted).

## Gold reference

`counterparty-hub-tray.component.ts` (TZ-NX-HUB-01): wrapper
`bg-paper-2 border-t hairline` → `div.grid.grid-cols-1.md:grid-cols-2.xl:grid-cols-3.gap-4.p-4` →
N × `section.min-w-0.hairline.rounded-sm.bg-paper.p-4` each with
`h3.text-sm.font-medium.text-ink.m-0.mb-3` category title.

## Matrix

| Route | Before | After | Card sections | Verdict |
|-------|--------|-------|----------------|---------|
| `/supply` | Flat `grid grid-cols-1 sm:grid-cols-2 gap-3` of bare `pi-label`/value pairs — no card boundaries, no category headings (the PO's FAIL screenshot) | Rewritten to gold wrapper (`bg-paper-2 border-t hairline` → `grid md:grid-cols-2 gap-4 p-4` → 4 `section.hairline.rounded-sm.bg-paper.p-4` cards) | **Позиция** (название/кол-во/статус) · **Связь с заказом** (линия заказа + order chip) · **Состав** (материал/модуль, honest placeholders) · **Сроки и заметки** (создано/подтверждено/обновлено + примечание) | **FIXED → PASS** |
| `/warehouses` | Flat breadcrumb text + bare item list, no card boundary around either the meta or the balances | Rewritten to the same wrapper pattern, 2 cards | **О складе** (название/описание/статус) · **Остатки** (preview ≤8 + honest empty/error + chip «Все остатки склада») | **FIXED → PASS** |
| `/orders` (`OrderHubTrayComponent`) | Already 4 `section.min-w-0.hairline.rounded-sm.bg-paper.p-4` + `h3` groups (Заказ / Исполнение / Логистика / Документы) — confirmed byte-identical class string to the gold card, and visually confirmed matching in TZ-05's screenshot review | No change | Заказ (Состав заказа) · Исполнение (Снабжение/Производство/Готовность) · Логистика (Склад/Отгрузка) · Документы | **VERIFIED, no align needed — PASS** |
| `/counterparties` (`CounterpartyHubTrayComponent`) | Gold reference itself | Not touched (per TZ «НЕ ИЗМЕНЯТЬ») | Реквизиты / Объекты / Заказы / КП / Договоры | **PASS (reference)** |

## What changed, concretely

- `supply.page.ts`: the expand `@if` block's inner markup replaced; row-level compact status CTA (`.pi-outline-btn` per status) and `data-test` for the line label / order link preserved verbatim so existing behavior-level specs kept passing unmodified. New spec asserts the 4 `data-test` section hooks + `SECTION` tag + the 3 gold utility classes + an `<h3>` per card.
- `warehouses.page.ts`: same treatment for the 2-card expand; `storageItemName()` honest-name resolution, the ≤8-row cap, loading/error/empty states, and the `/storage-items?warehouseId=` chip are all unchanged, just re-homed into cards. New spec asserts the 2 sections the same way.
- `order-hub-tray.component.ts`: **not touched** — already the gold pattern.
- `counterparty-hub-tray.component.ts`: **not touched** — the reference itself.

## No FAIL left open

Both routes flagged by the PO screenshot are fixed. No BE change, no new write-path, no fake copy/edit action added, no ObjectId newly exposed (both pages already had H5-safe honest-placeholder logic from the prior wave; unchanged here).

## Gates

- `nx test kppdf-web --testPathPattern=supply.page|warehouses.page|order-hub` → PASS (see Executor report for counts)
- `nx build kppdf-web` → PASS, exit 0 (last command)
