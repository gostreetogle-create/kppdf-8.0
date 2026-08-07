═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303.1: Gantt hotfix closeout + orders ?q= deep-link — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-07
closed_by: Buffy / Freebuff executor (agent-d4d9f3dbfd)
base: 8d459e42b090d70b89ec73c95a2f4a1b3e6daa34
acceptance_status: PASS
verification:
  - existing Gantt hotfix history retained on main and scoped production specs PASS
  - OrdersPage applies ActivatedRoute queryParamMap `q` through the existing search state: PASS
  - removing `q` clears the filter: PASS
  - inspector link emits `/orders?q=<order number>`: template compiled in Angular build PASS
  - frontend tsc `tsconfig.app.json --noEmit`: PASS
  - targeted Jest: 4 suites / 20 tests PASS
  - scoped ESLint without `--fix`: PASS
  - git diff --check: PASS
  - Angular development build: PASS with pre-existing NG8113 in DocumentsPage
  - Team Room claim/heartbeat: PASS
  - deploy: NO
checklist: docs/agent-checklists/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md
source_was: tasks/_active/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md
lock: .mimocode/locks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.lock
implementation_commit: f731957
metadata: finalized in the follow-up documentation commit

## Summary

- `OrdersPage` now reads `q` from `ActivatedRoute.queryParamMap` and writes both the visible and debounced values in the existing `createSearchState` signals.
- Query-param removal resets the search to an unfiltered list.
- `OrderInspectorComponent` now exposes an accessible «Открыть заказ» link to `/orders?q=<number>` without changing the URL contract.
- Production Cockpit page documentation records the cross-route deep-link.
- Gantt implementation already landed in the four production commits after TZ-PRODUCTION-303; this closeout did not rewrite those files.

## Known limitations

- `docs/audits/2026-08-06-production-gantt-verdict-response.md`, referenced by the handoff, is absent on this branch and could not be used as a source document.
- The existing Angular development build still reports pre-existing `NG8113: ButtonComponent is not used within the template of DocumentsPage`.
- Scoped Prettier check reports formatting drift in the three existing large TS files; no mutating formatter was run.
- Browser/PO smoke for `/production` remains a post-push manual gate; no deploy was performed.
