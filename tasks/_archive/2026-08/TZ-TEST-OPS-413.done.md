# TZ-TEST-OPS-413: docs link smoke COMBINE/GANTT — DONE

> Source: `tasks/_backlog/TZ-TEST-OPS-413-docs-link-smoke.md`

## OUTCOME

DONE 2026-08-16. Docs smoke PASS: 0 broken `.page.md` ссылок в PAGE-TZ-INDEX
(41 refs), 0 broken относительных `.md` ссылок в COUPLING-MAP. design-combine
boardLane ↔ COUPLING §2b согласованы; production-cockpit «По рабочим» ↔ GANTT-401
согласован. `_NOW` отражает GANTT-401 DONE + COMBINE 401–405 DONE. Deploy НЕ.

## Gates

- docs-link smoke: PASS (0 broken)

## Files

- (только верификация; новые checklist/archive/_NOW/progress)

## known_limitation

- n/a

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:29:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-OPS-413
layer: 1
conflict_keys: docs/pages/PAGE-TZ-INDEX.md; docs/COUPLING-MAP.md; docs/pages/design-combine.page.md; docs/pages/production-cockpit.page.md; docs/agent-checklists/_NOW.md
protects: docs link smoke (read-only)
next: TZ-TEST-REGRESS-414 (jest pack)
