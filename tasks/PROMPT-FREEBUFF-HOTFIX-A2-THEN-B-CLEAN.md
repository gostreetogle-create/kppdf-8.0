# PROMPT — Freebuff: finish hotfix A push + demo orphan clean B

Скопируй целиком. Сессия Freebuff зависла mid-push — не переоткрывать код hotfix.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?».

═══ ФАКТ ═══
Hotfix A DONE локально: commit c413bef7
  fix(nx): remove shell bleed and resolve archived warehouse refs
Archive/checklist/lock уже есть; _active hotfix очищен.
Код A НЕ переписывать. Чужой WIP не трогать.

═══ ЭТАП A2 — дожать git ═══
1) git status / git log -5. Убедись c413bef7 в истории.
2) Если c413bef7 ещё не на origin/main — git push (только после зелёного pre-push; не force).
3) Если локально висят незакоммиченные правки ТОЛЬКО checklist/archive hotfix с SHA evidence — один узкий docs commit + push. Иначе оставь.
4) _NOW: Freebuff A DONE; дальше B.

═══ ЭТАП B — TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN ═══
TZ: tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md
Checklist: docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md
Аудит: docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md

1) Claim B. Mongo URI только localhost/docker — иначе STOP.
2) scripts/clean-local-demo-orphans.mjs: dry-run default; --apply
   - SupplyRequest/SupplyTask с orderId без Order
   - StockMovement с hard-missing product/material
   - Doc Studio: снять битые image refs (файл отсутствует)
3) dry-run → counts в checklist → --apply
4) При дырявых экранах: node scripts/seed-local-demo.mjs
5) Commit script+docs; push; archive B; lock; _NOW Freebuff IDLE
6) Executor report (auto) с counts + SHA

ЗАПРЕЩЕНО: dropDatabase; prod; правки app-shell/warehouse code; DocStudio layout; Chrome C1–C4 в этой сессии (следующий промпт после B).
```
