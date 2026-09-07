# TZ-SUPPLY-BE-INVOICE-DELIVERY — DONE

- **agent_id:** claude
- **implementation_sha:** 1c4c381a
- **TZ:** tasks/_ready/nx-supply/TZ-SUPPLY-BE-INVOICE-DELIVERY.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (1/7)

## Что сделано

- **Schema:** `SupplyRequest` — `orderLabel?` (free-text заказчик/участок), `invoiceNo?`, `deliveryNote?`, `paid: boolean` (default false), `paidAt?`, `createdBy?` (ref `User`).
- **DTO:** `CreateSupplyRequestDto`/`UpdateSupplyRequestDto` — `orderLabel`, `invoiceNo`, `deliveryNote`, `paid` (validated); no `createdBy` field (server-only).
- **Service:** `create()` gained a trailing `createdByUserId?` param wired from the controller's `@CurrentUser()`; `orderId` XOR `orderLabel` enforced on both create and update (order match always wins, stale label cleared); `paid` toggle independent of `status`, auto-stamps/clears `paidAt`.
- **Controller:** `create()` passes `user.id` as `createdByUserId`; no new routes.
- **Tests:** 8 new cases in `supply-request.service.spec.ts` (createdBy set/unset, orderLabel XOR on create+update, invoice/delivery/paid on create, paid toggle stamps/clears paidAt).
- **Docs:** `docs/pages/supply.page.md` — one-line TZ reference row.

## Gates (все зелёные)

```
backend tsc -p tsconfig.build.json --noEmit → 0
backend pnpm test -- supply-request → 17/17 (8 new)
backend pnpm test -- kit-reserve → 10/10 (unaffected caller)
backend pnpm exec eslint (changed files) → 0 issues
backend pnpm test (full) → 129 suites / 1246 tests PASS
```

## AC чек

1. Поля в schema+DTO; create пишет createdBy ✔ (spec)
2. paid независим от status ✔ (spec: toggle без изменения status)
3. gates backend green; archive ✔

## known_limitation

FE journal (S3) will need to surface these fields (invoice/delivery/paid/orderLabel) in the UI — not in this TZ's scope.

## НЕ тронуто

FE journal; stock IN; Material upsert; warehouse default; чужие модули.
