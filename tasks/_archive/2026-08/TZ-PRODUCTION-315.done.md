# TZ-PRODUCTION-315.done — Карточка bottom sheet

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: gemini-executor-gantt-tree
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (production-cockpit 7)
  - checklist: ADDED
  - progress.md: UPDATED
TZ: TZ-PRODUCTION-315
TITLE: Карточка заказа — bottom sheet под Гантом
LOCK: .mimocode/locks/TZ-PRODUCTION-315-card-bottom-sheet.lock
WAVE: WAVE-PRODUCTION-GANTT-TREE
DEP: TZ-PRODUCTION-314 @ e5089da631e01ee78569252c7f7a11b4b0a6264e
```

## What changed

- Card flyout moved from right to bottom sheet (`production-studio-sheet-card`, height min(42vh,22rem), max-width ~960px centered)
- Right card flyout classes removed; chrome tool «Карточка» still toggles
- Left Заказы/Фильтры + right Масштаб unchanged
- Inspector: no border-l; horizontal meta|composition grid on md+

## Gates

- FE tsc PASS
- FE jest production-cockpit **7 PASS**
