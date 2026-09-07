# Короткий handoff агенту

Task: <ID>
Role: <reviewer | bounded executor>
Goal: <один результат>
Repo/worktree: <path>
Branch: <branch>
Baseline: <exact SHA>
HEAD: <exact SHA>
Ownership: <кто какими файлами владеет>
Allowed paths: <точный список без glob>
Acceptance: <проверяемые критерии>
Checks: <точные команды>
Forbidden: production, remote, push, merge/rebase, destructive actions, parallel writes
Stop-condition: <условие немедленной остановки>
