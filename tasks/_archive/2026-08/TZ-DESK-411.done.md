═══════════════════════════════════════════════════════════════
TZ-DESK-411: стол — capabilities + CTA why-disabled
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Workflow strip: page-ACL hiding is owned by `pi-group-workspace` (`filterByPageAcl` on `user.pages`); desk passes `dataTestPrefix="desk-workflow"` so each visible chip renders `data-test="desk-workflow-<id>"` (hidden ≠ disabled grey).
- Rail tools ACL: `syncChromeTools` gates supply (`supply` page), gantt (`production`), combine (`orders`) via `canOpenPage` — no click into /forbidden.
- Disabled desk primary CTA explains why in RU (`primaryCtaDisabledReason`): terminal status, missing siteId, or action-not-wired; rendered as title + one-line hint under the CTA.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (manager-desk 13/13, group-workspace 8/8, orders 17/17 — 37 desk/orders scope)
  - lint: PASS (eslint changed files, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

commit: pending
