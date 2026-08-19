═══════════════════════════════════════════════════════════════
TZ-DESK-414: hotfix desk — RouterLink + stale notes + chip activeId
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-19
closed_by: composer-executor-desk-414

result:
- FE `manager-desk.page.ts`:
  - `@Component.imports` includes `RouterLink` (`desk-view-open-studio` `[routerLink]`/`[queryParams]` compiles).
  - `loadNotes(orderId)`: `notes.set([])` before GET; drop response if `orderId !== expandedOrder()?._id`.
  - `[activeId]="view()"` so gantt/combine chips highlight on stub views.
- Spec: 20/20 including 414 gantt href `/production`+`from=desk` and stale-notes race.

known_limitation:
  - order-hub-tray `from=desk` is TZ-DESK-416 (not this TZ)
  - deploy/wipe not run

verification:
  - acceptance criteria: PASS
  - frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - frontend tests: PASS (manager-desk 20/20)
  - lint: PASS (eslint manager-desk.page.ts + spec, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run

commit: pending
