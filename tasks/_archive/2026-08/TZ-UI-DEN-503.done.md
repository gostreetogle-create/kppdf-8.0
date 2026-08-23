ARCHIVE_MARKER
task_id: TZ-UI-DEN-503
outcome: DONE
closed_at: 2026-08-23T15:25:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-503-shared-ui-shadow-radius.md

verification:
  - typecheck: PASS
  - test: PASS (card, pi-showcase-card, pi-dialog, composition-tree, pi-overflow-select, forbidden — 8 suites)
  - lint: PASS
  - ac_guard_rounded: PASS (`rg 'rounded-(md|lg|xl|2xl)' shared/ui -g '*.ts'` → 0)
  - ac_guard_shadow: PASS (no shadow-sm/md/lg on table/sheet/card/pagination/filter/notification/overflow primitives)

## Что сделано

### Primitives fixed
- `card.component.ts` — `rounded-sm`, removed `executive-shadow`
- `pi-showcase-card.component.ts` — CSS: `border-radius: var(--radius-sm)`, removed all box-shadow (base + hover)
- `pi-filter-panel.component.ts` — removed `shadow-lg`
- `pi-notification-bell.component.ts` — removed `shadow-md`
- `pi-overflow-select.component.ts` — removed `shadow-lg`
- `composition-tree.component.ts` — `rounded-md` → `rounded-sm`
- `forbidden.page.ts` — `rounded-md` → `rounded-sm`
- `pi-dialog.component.ts` — panel + close button `rounded-lg` → `rounded-sm` (backdrop `--dialog-shadow` untouched)

### kit/overview
- Migration note «anti-patterns fixed in DEN-503»

## Documented exceptions

- `button.component.ts` — `executive-shadow` on gold CTA variant (canon: allowed on canonical buttons only)
- `pi-dialog` backdrop — `--dialog-shadow` token preserved per TZ step 3

## Out of scope (honored)

- `frontend/src/app/pages/**` (except kit/overview migration note)
- Gantt / production custom visuals
