═══════════════════════════════════════════════════════════════
TZ-DESK-413: order-hub-tray — визуальная IA (cards, summary bar)
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /orders
PAGE_DOCS: manager-desk.page.md ; orders.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Tray body rewritten per visual spec: summary bar (status pill, desk client, disabled primary CTA right) + wide 2-col card grid (Состав left flex-1; right stack Исполнение / Снабжение+Производство / Логистика+Документы); narrow stacks to one column.
- Комбайн now horizontal lane chips inside card «Исполнение» (removed separate `order-group-combine` H2 section).
- Desk composition opens by default on first tray open (toggle still collapses).
- Hub `data-test="order-*"` selectors preserved 1:1 (HUB-302/303/304).
- Removed dead `(primaryCta)` binding + `onPrimaryCta` toast stub from manager-desk.page.ts (CTA now disabled in-tray).

verification:
  - acceptance criteria: PASS (layout per §3; no duplicate «Снабжение» eyebrow+link)
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (orders.page 17/17, manager-desk 7/7 — 24 total)
  - lint: PASS (eslint order-hub-tray/orders.page.spec/manager-desk 0 errors)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

note:
- orders.page.spec `мат` assertion now genuinely expands the collapsed module node; the previous
  pass was a false-positive substring of «печатные материалы» removed by the 413 header cleanup.

commit: pending
