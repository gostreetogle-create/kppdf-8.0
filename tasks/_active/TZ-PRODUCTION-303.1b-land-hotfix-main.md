═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303.1b: Land Gantt hotfix + merge deep-link to main
═══════════════════════════════════════════════════════════════

STATUS: IN WORK
CLAIMED_BY: agent-3e757640b7
CLAIMED_AT: 2026-08-07T18:30:02.952Z
WORKSPACE: D:\\kppdf-8.0
TEAM_ROOM_CLAIM: yes
BASE: 12672678fcd5866bd942902edae3b92cc40f7906

CONFLICT KEYS:
frontend/src/app/pages/production/**;
frontend/src/app/pages/orders/orders.page.ts;
frontend/src/app/pages/orders/orders.page.spec.ts;
docs/pages/production-cockpit.page.md;
docs/audits/2026-08-06-production-gantt-verdict-response.md;
docs/agent-checklists/TZ-PRODUCTION-303.1b-land-hotfix-main.md;
progress.md;
STATUS.md

SCOPE:
Land the already-dirty Gantt hotfix from canonical main, merge the pushed 303.1
orders ?q= deep-link, run production/orders gates, and push main. No deploy.

ACCEPTANCE:
- Deep-link and Gantt hotfix are both on main.
- Catalog polish from main is preserved; no products/** changes.
- Frontend tsc, targeted Jest, scoped ESLint without --fix, and diff check pass.
- Archive/checklist/progress/status are synchronized; deploy is not performed.

KNOWN LIMITS:
- Browser/PO smoke remains for the owner after land.
- No drag/resize/reschedule or 304–310 implementation.
