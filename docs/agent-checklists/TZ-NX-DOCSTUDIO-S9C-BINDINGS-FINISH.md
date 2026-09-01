# TZ-NX-DOCSTUDIO-S9C-BINDINGS-FINISH checklist

Status: READY FOR REVIEW
agent_id: claude
claimed_at: 2026-09-01T22:04:00+03:00
workspace: D:\kppdf-8.0
team_room_claim: unavailable

## Acceptance
- [x] Dblclick on unlocked text opens Properties and schedules focus to contenteditable rich-text
- [x] Locked and preview blocks do not enter edit mode
- [x] Single-click canvas behavior unchanged
- [x] Token picker exposes client plus payer/supplier anchor groups and emits anchor token syntax
- [x] Studio tests: PASS (54 suites, 294 passed, 7 skipped)
- [x] Final `nx build kppdf-web`: PASS

## Integrity slot
- [x] Type: page behavior
- [x] FIC A/C/D: N/A beyond existing route; no new module/permission
- [x] Existing document-studio page doc remains current
- [x] SECTION-READINESS N/A
- [x] No unrelated WIP staged
- [x] Coupling map N/A
- [x] DOCS-INTEGRITY followed

## Gates
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio`: PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS exit 0, last

## Executor report
Bindings UX now completes the interaction from double-click to rich editor focus and provides anchor-role token groups while preserving single-click selection.
