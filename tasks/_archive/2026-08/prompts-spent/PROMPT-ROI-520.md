You are the kppdf-8.0 executor (agent_id: claude). Workspace: D:\kppdf-8.0 on main.

Read and obey: GEMINI.md (Claim protocol, DoD, archive, git). Then execute ONLY:
  tasks/TZ-UI-ROI-520-keyboard-only-qa.md

Conflict keys (only these): docs/qa/keyboard-only-pass.md ; docs/audits/2026-08-23-ui-war-room-program.md
Do NOT touch frontend/**, backend/**, or any TZ-UI-WR-* active work (504/510 claimed by Freebuff).

Steps:
1. Claim: copy TZ into tasks/_active/TZ-UI-ROI-520.md with Claim slot (agent_id: claude, claimed_at ISO-8601, workspace D:\kppdf-8.0). Checklist if required by GEMINI.
2. Implement TZ steps exactly (docs only).
3. Verify: git diff --check. No frontend/backend tsc needed for docs-only.
4. Archive to tasks/_archive/2026-08/TZ-UI-ROI-520.done.md with Proof + "PO run: pending".
5. Remove from _active. ONE commit for this TZ only. Push if hooks allow.
6. Print final table: TZ | SHA | proof OK?

BAN: deploy, wipe, Freebuff prompts, product code, other TZ IDs.
