# Checklist TZ-CATALOG-371 — Безопасная копия изделия

## Status

READY · independent backend capability

## Preflight

- [ ] Claim/Team Room/_active-map; Product conflict keys free.
- [ ] Organization scope, SKU unique и EAV/photo/composition contracts проверены.

## Acceptance

- [ ] Duplicate endpoint создаёт новый scoped Product.
- [ ] Name/SKU suffix collision-safe.
- [ ] copiedFromProductId заполнен.
- [ ] Composition/EAV/photo refs независимы по контракту.
- [ ] stockQty/system/audit fields не копируются.
- [ ] Source не мутируется.
- [ ] expectedVersion update даёт 409 при stale source.
- [ ] Typed FE duplicate client готов.

## Gates

- [ ] BE tsc + ProductService focused Jest PASS.
- [ ] FE tsc + ProductsService focused Jest PASS.
- [ ] architecture:check + diff-check PASS.
- [ ] Security/diff review PASS.

## Closeout

- [ ] Docs/progress/architecture updated.
- [ ] Executor report auto added.
- [ ] Archive + lock + commit/push; no deploy.
