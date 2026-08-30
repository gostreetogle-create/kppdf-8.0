# TZ-OPS-AGENT-ORCHESTRATION-AUDIT

## Status

PLANNED — documentation/audit only. Do not apply configuration changes until the audit is reviewed against the existing repository contract.

## Goal

Evaluate whether Cursor and Claude Code are being used effectively in kppdf-8.0, while preserving the existing claim/checklist/archive process and avoiding redundant agent configuration.

## Current evidence

- Repository contract: `CLAUDE.md`, `GEMINI.md`, `docs/how-to-connect-ai.md`.
- Existing skills and routing: `.agents/skills/kppdf-project/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`.
- Existing task/checklist workflow: `tasks/_active/`, `tasks/_archive/`, `docs/agent-checklists/`.
- Cursor official references consulted: Rules, Hooks, Cloud Agents, Subagents.
- Claude Code official references consulted: CLAUDE.md/memory, Hooks, Skills, Subagents, Worktree lifecycle.

## Recommendation

Do not install plugins or add broad automation yet. The project already has substantial local orchestration rules. First perform a gap audit and make only additive, low-risk improvements:

1. one concise shared agent workflow document;
2. optional Cursor repository rules only if current `.cursor/` configuration is absent and the rules do not duplicate `CLAUDE.md`/`GEMINI.md`;
3. optional Claude project-local settings/hooks only after checking existing settings and ensuring hooks are advisory/non-destructive;
4. keep product-code approval, claim protocol, conflict keys, gates and archive as the source of truth;
5. use isolated worktrees for parallel product tasks; never rely on prompts alone for isolation;
6. use a review agent after implementation, not a second concurrent writer on the same files.

## Proposed audit deliverables

- inventory of existing `.cursor/`, `.claude/`, `.agents/`, hooks and settings;
- overlap/conflict matrix against `CLAUDE.md` and `GEMINI.md`;
- recommended minimal changes with exact paths;
- explicit no-change decision where existing controls are sufficient;
- smoke test proving the agent workflow does not modify product code unexpectedly.

## Safety constraints

- Never install `mattpocock-skills`.
- Never run `/setup-matt-pocock-skills`.
- Do not add GitHub/Linear integrations without explicit PO approval.
- Do not create hooks that auto-commit, push, delete files, reset worktrees, or alter credentials.
- Do not add blocking hooks that prevent normal agent work until their behavior is tested.
- Do not change `frontend/**` or `backend/**` for this audit.
- Do not modify agent configuration in the same task as a product feature.

## Official references consulted

- Claude Code overview: `https://docs.anthropic.com/en/docs/claude-code/overview`
- Claude Code subagents: `https://docs.anthropic.com/en/docs/claude-code/sub-agents`
- Claude Code hooks: `https://docs.anthropic.com/en/docs/claude-code/hooks`
- Claude Code skills: `https://docs.anthropic.com/en/docs/claude-code/skills`
- Cursor rules: `https://cursor.com/docs/rules`
- Cursor hooks: `https://cursor.com/docs/hooks`
- Cursor cloud agents: `https://cursor.com/docs/cloud-agent`
- Cursor subagents: `https://cursor.com/docs/subagents`

## Decision

No configuration/code changes are authorized by this note. A dedicated analysis-only agent should produce the inventory and a minimal-change proposal before any setup is implemented.
