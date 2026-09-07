# TZ-NX-SUPPLY-S6-CHROME — DONE

- **agent_id:** claude
- **implementation_sha:** pending (filled at closeout)
- **TZ:** tasks/_ready/nx-supply/TZ-NX-SUPPLY-S6-CHROME.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (7/7 — **WAVE DONE**)
- **Deps:** S3 journal (`a11234ee`)

## Что сделано

- **Filters:** `neededBy` date-range (from/to, client-side) added alongside the existing search/status/paid filters; a "Сбросить фильтры" link/button appears only while at least one filter is active.
- **Order chip/link:** the "Заказ" column renders a `routerLink` to `/orders/:id` when `orderId` matches a preloaded order (same pattern `/supply` already uses for `SupplyTask` rows); falls back to `orderLabel` free text, then a short id — unchanged from S3.
- **Empty states:** distinguished "no data at all" (create CTA) from "no matches for the active filters" (reset action) — both plain RU, no jargon.
- **Docs:** `docs/pages/supply.page.md` — new §Chrome section under the S3 journal, plus the final TZ reference row marking **WAVE-NX-SUPPLY-OPS DONE**.

## Gates (все зелёные)

```
frontend-nx nx test kppdf-web (full) → 97 suites / 638 passed / 7 skipped / 0 FAIL
frontend-nx nx lint kppdf-web (changed files) → 0 new issues
pnpm architecture:check → 1465 files, baseline 17, 2 resolved
frontend-nx nx build kppdf-web → SUCCESS (last gate)
```

## AC чек

1. Фильтры работают; order link ✔ (spec: date-range filter, reset-filters, order routerLink vs orderLabel fallback, distinct empty states)
2. nx build; archive ✔

## known_limitation

None new for this TZ.

## НЕ тронуто

Stock; Excel B; new entities.

---

## WAVE-NX-SUPPLY-OPS — итог (7/7)

| # | TZ | SHA |
|---|----|----|
| 1 | TZ-SUPPLY-BE-INVOICE-DELIVERY | `1c4c381a` |
| 2 | TZ-NX-WAREHOUSE-DEFAULT | `08149e8e` |
| 3 | TZ-NX-SUPPLY-S3-REQUEST-JOURNAL | `a11234ee` |
| 4 | TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK | `78ab5690` |
| 5 | TZ-NX-SUPPLY-S5-MATERIAL-UPSERT | `4e54034d` |
| 6 | TZ-DESKTOP-SUPPLY-EXCEL-A | `541ac855` |
| 7 | TZ-NX-SUPPLY-S6-CHROME | pending (this file) |

Google Sheets «Снабжение» replacement is now live in NX end-to-end: journal
(`/supply-requests`) → create/edit with invoice/paid/order/material fields →
material create/copy without a second catalog → receive-to-stock (single
`StockMovement` write-path) → Desktop Excel bulk import with name-based
matching. `SupplyTask` (`/supply`, order-based deficit) is untouched and
remains a separate entity per the audit's canon.
