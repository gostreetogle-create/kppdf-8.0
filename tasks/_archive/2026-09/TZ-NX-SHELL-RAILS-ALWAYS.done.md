# TZ-NX-SHELL-RAILS-ALWAYS: вернуть L/R панели; прятать только мёртвые кнопки

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (4/4)
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE 125 suites / 892 passed + 7 skipped, same totals as before — no regression)
  - lint: PASS (0 errors, 3 scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser evidence: PASS (/counterparties idle + /production with setTools)
  - checklist: `docs/agent-checklists/TZ-NX-SHELL-RAILS-ALWAYS.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-SUCCESSORS.md updated)

## Root cause / finding

`TZ-NX-SHELL-01-IDLE-RAILS` (2026-09-10) was asked to remove disabled "скоро"
demo placeholder icons from the L/R rails, but overreached: it made the
`<aside>`s conditional on `tools.length > 0` and moved history ←→ into the
header as a "single SoT" once rails could disappear entirely. PO screenshots
(Гант, Клиенты, 2026-09-13) showed the panels themselves gone — not the
intended fix.

## Fix

`app-shell.component.ts`: both rails now always render; `gridTemplateColumns`
simplified from a 4-branch `computed()` to a fixed 3-column constant;
history ←/→ moved from the header into the top of each rail (left/right
respectively), header's duplicate pair removed; a thin `.shell-rail-spacer`
separates history from live page-tools within each rail.
`shell-tool-rail.service.ts`: doc-comment only, no functional change.
`app-shell.component.spec.ts`: IDLE-RAILS-era tests rewritten for the
always-rails canon (26/26 passing). `docs/pages/page-chrome.md` §NX shell
rails table replaced + a short history note explaining the overreach and
correction.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts`
- `docs/pages/page-chrome.md`
- `docs/agent-checklists/TZ-NX-SHELL-RAILS-ALWAYS.md` + `evidence/TZ-NX-SHELL-RAILS-ALWAYS.txt` (new)
