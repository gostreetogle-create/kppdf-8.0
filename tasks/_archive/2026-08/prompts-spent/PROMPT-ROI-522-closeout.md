Continue TZ-UI-ROI-522 closeout ONLY. Workspace D:\kppdf-8.0.

Gates already PASS (orchestrator ran):
- git diff --check on touched paths: exit 0
- frontend tsc -p tsconfig.app.json --noEmit: exit 0
- eslint src/app/pages/kit/**/*.ts: exit 0

Do NOT re-run long tests. Do NOT ask for approval.

Finish:
1. If tasks/PROMPT-FREEBUFF-UI-WR-A.md missing (moved to prompts-spent): add the same one-liner «Перед UI: прочитай docs/ui-rules.md» to tasks/_archive/2026-08/prompts-spent/PROMPT-FREEBUFF-UI-WR-A.md OR recreate a stub pointer in tasks/PROMPT-FREEBUFF-UI-WR-A.md that only points to war-room + ui-rules. Prefer one-liner in spent file + note in done.md.
2. Ensure B/C prompts have the line (already likely).
3. Archive: tasks/_archive/2026-08/TZ-UI-ROI-522.done.md with Proof of adoption + gate evidence. Remove tasks/_active/TZ-UI-ROI-522.md and checklist if any.
4. ONE commit: docs/ui-rules.md + AI-AGENT-GUIDE + kit-overview + WR prompts + archive. Message: docs(ui): ROI-522 ui-rules.md kit snapshot for agents
5. Push if hooks allow.
6. Print TZ | SHA | proof OK?

BAN: other TZ, deploy, frontend outside kit pages.
