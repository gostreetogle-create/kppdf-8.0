# Короткий handoff агенту (kppdf)

Task: <TZ-ID>
Role: <reviewer | bounded executor>
Agent slot: <cursor | claude | freebuff/buffy | gemini>
Goal: <один результат>
Repo/worktree: D:\kppdf-8.0 | .worktrees/<TASK-ID>
Branch: main | <task-branch>
Baseline: <exact SHA>
HEAD: <exact SHA>
Ownership: <кто какими путями владеет>
Conflict keys / allowed paths: <точный список без glob>
Acceptance: <проверяемые критерии>
Checks: tsc / focused tests / lint / architecture:check (по зоне)
Forbidden: production, wipe, push без GIT-POLICY, merge/rebase чужого, destructive, parallel writes на тех же keys
Stop-condition: <когда немедленно остановиться>
Claim: tasks/_active/<TZ>.md + checklist Claim slot до первой правки

Finding (если Role=reviewer) — один блок на проблему:
path:line — факт+доказательство — риск — min-fix / как должно быть
Не принимать: «тут плохо» без пути и фикса.

Канон: `docs/agents/MULTI-AGENT-WORKFLOW.md`.
