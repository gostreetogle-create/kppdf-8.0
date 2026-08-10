# TZ-SALES-348 DONE

```
ARCHIVE_MARKER
task: TZ-SALES-348
outcome: DONE
date: 2026-08-11
agent: cursor-composer-sales348
workspace: D:\kppdf-8.0
```

- Scope: Create КП vitrine — «В КП: N», add qty, chips Изделия/Модули/Материалы, `lineKind` module|material + `refId`, legacy catalog safe.
- Gates: BE tsc; quotation 40/40; FE tsc; proposal-create/product-rail 41/41; Angular development build; Prettier/ESLint/diff-check PASS.
- Self-verify: component/DOM suite PASS (chips, qty emit, badge, module/material merge+remove); authenticated browser/data smoke unavailable without backend data stack.
- Constraints: PiShowcaseCard contract unchanged; shell 317 untouched; no deploy/ZIP/wipe; foreign WIP excluded.
- NEXT: WAVE-KP-COMPLETE idle → VPN OFF → OPS-310 → warm deploy (PO command only).
