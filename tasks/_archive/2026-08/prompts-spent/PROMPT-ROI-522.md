You are the kppdf-8.0 executor (agent_id: claude). Workspace must be D:\kppdf-8.0 on main.

Read GEMINI.md (Claim, DoD, archive, git). Execute ONLY:
  tasks/TZ-UI-ROI-522-ui-rules-kit-snapshot.md

Conflict keys ONLY:
  docs/ui-rules.md
  tasks/PROMPT-FREEBUFF-UI-WR-A.md
  tasks/PROMPT-FREEBUFF-UI-WR-B.md
  tasks/PROMPT-FREEBUFF-UI-WR-C.md
  docs/AI-AGENT-GUIDE.md
  frontend/src/app/pages/kit/**

Do NOT touch: pi-dialog/drawer/sheet services, manager-desk, proposal-create, WR-507/510 files if claimed by others.

Steps:
1. Claim tasks/_active/TZ-UI-ROI-522.md (agent_id: claude, claimed_at ISO-8601).
2. Create docs/ui-rules.md ≤120 lines per TZ (primitives table + ЗАПРЕЩЕНО + stop rule).
3. Sync with live /kit/* passports; one commit if kit comments need fix.
4. One-line pointer in Freebuff WR prompts A/B/C + AI-AGENT-GUIDE.md.
5. Kit overview mention for agents.
6. Verify: git diff --check; if any kit/*.ts changed: cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm exec eslint on touched kit files (NOT backend lint --fix).
7. Archive tasks/_archive/2026-08/TZ-UI-ROI-522.done.md with Proof of adoption. Clear _active.
8. ONE git commit for this TZ. Push if possible.
9. Print: TZ | SHA | proof OK?

BAN: deploy, wipe, other TZ, Storybook, product logic outside kit docs.
