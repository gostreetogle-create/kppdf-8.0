# Checklist TZ-SALES-372 — Snapshot edit и решение каталога

## Status

BLOCKED BY: SALES-370, SALES-371, CATALOG-371

## Preflight

- [ ] Все dependencies DONE/pushed.
- [ ] Claim/Team Room/_active-map; proposal-create conflict keys free.
- [ ] Прочитан photo/edit/copy canon.

## Acceptance

- [ ] Name/description/SKU/unit явно редактируются как snapshot.
- [ ] Essential commercial columns pinned-visible.
- [ ] Inline/autosave не вызывает Product PATCH.
- [ ] pending/kp-only metadata переживает F5.
- [ ] Exit review показывает diff каждой изменённой строки.
- [ ] Только КП — safe default.
- [ ] Update Product отправляет только identity fields + expectedVersion.
- [ ] Conflict 409 ничего не перетирает.
- [ ] Create-copy rebinds edited row.
- [ ] Explicit row copy inserts new Product row below.
- [ ] Duplicate KP row честно оставляет тот же Product.
- [ ] Final/read-only rows immutable.

## Gates

- [ ] FE tsc + proposal-create focused Jest PASS.
- [ ] BE tsc + quotation focused Jest PASS.
- [ ] architecture:check + diff-check PASS.
- [ ] Light/dark/multi-row/F5 browser evidence.
- [ ] Cursor/PO visual PASS.

## Closeout

- [ ] Page docs/progress/architecture updated.
- [ ] Executor report auto added.
- [ ] Archive + lock + commit/push; no deploy.
