# Claude Code CLI — оркестрация 2026-09-03 (вставь в новый чат)

```
Executor · D:\kppdf-8.0 · main · agent_id: claude
Skills: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
git pull. Baseline was 2cdf013e (+ S48 docs possibly ahead).

Freebuff idle. НЕ kppdf-web. НЕ deploy.

Порядок:
1) Claim + TZ tasks/TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS.md
   Checklist: docs/agent-checklists/TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS.md
   architecture:check → снять 3 legacy cross-page imports. Не править baseline.json.
   tsc + focused tests → archive → commit `claude: …` → push

2) Сразу Claim + TZ tasks/TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2.md
   ≤15 файлов, не Q4b batch. Токены Paper & Ink. OnInit не трогать.
   archive → commit → push

Чужой WIP не стейджить. Если loop — STOP.
```
