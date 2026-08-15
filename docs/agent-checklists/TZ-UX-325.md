# TZ-UX-325 checklist

> Status: **DONE**
> Spec: `tasks/TZ-UX-325-chrome-page-tools-migration-audit.md`
> Archive: `tasks/_archive/2026-08/TZ-UX-325.done.md`
> Lock: `.mimocode/locks/TZ-UX-325-chrome-page-tools-migration-audit.lock`
> Deploy: НЕ (docs-only)

## Claim slot

- agent_id: Buffy continuous executor (docs)
- claimed_at: 2026-08-15T14:52:00Z
- ready_at: 2026-08-15T14:52:00Z
- closed_at: 2026-08-15T14:58:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: n/a

## Acceptance

- [x] Audit `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md` with ≥5 route candidates + explicit НЕ
- [x] WAVE `tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md` with draft successor TZ ids
- [x] `page-chrome.md` links audit + rule for new dense UI
- [x] PAGE-TZ-INDEX updated
- [x] No frontend/backend product diff
- [x] git diff --check PASS

## Gates

| Gate | Result |
|------|--------|
| Product ts/html/css | NOT TOUCHED |
| git diff --check | PASS |
| Docs inventory | PASS (P0: products/modules/materials) |

## Executor report (auto)

- outcome: DONE
- quality_score: 97
- deploy: NOT EXECUTED
- known_limitation: migration FE is successor WAVE (326+); this TZ docs only
