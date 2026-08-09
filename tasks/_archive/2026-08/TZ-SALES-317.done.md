# TZ-SALES-317 — DONE (Create КП focus shell)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T09:52:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS (focus shell / overlay rails)
  - Cursor Verdict: PASS (visual shell) — orchestrator 2026-08-09
  - frontend typecheck: PASS
  - tests: PASS — proposal-create focused
  - checklist: UPDATED + Executor report (auto)
  - progress.md: UPDATED
  - status synchronization: N/A (root tasks/_active, not OrchestratorKit STATUS)

## Delivered

- `/proposals/create` focus shell: no H1 / zone titles; yellow chip active.
- Fixed grid: left icon-rail | A4 center | right icon-rail; center never resizes.
- Left: Шаблон + Товары; Right: Параметры — flyouts absolute over center (Escape / click-outside).
- Empty center CTA «Добавить шаблон»; products flyout stays open for add-and-continue.
- `flushBody` + empty `group-tools` strip suppressed; studio height fits viewport.
- Spec LOCK: `docs/ux/kp-create-studio-spec.md` §0 FROZEN.

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern=proposal-create` → PASS

## Out of scope (kept for successors)

- TZ-SALES-319: center = `build()` HTML (not stub)
- TZ-SALES-318 cascade; TZ-SALES-320 print; Quotation persist

Lock: `.mimocode/locks/TZ-SALES-317-create-kp-focus-shell.lock`
