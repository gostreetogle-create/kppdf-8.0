# MASTER — QA Gates Fix (HOLD until Freebuff slots free)

> **HOLD:** не стартовать, пока живы Freebuff #1 KP Family и #2 Contract File.  
> Wave: `docs/agent-checklists/WAVE-QA-GATES-2026-09.md`  
> Audit: `docs/audits/2026-09-03-qa-deep-test-audit.md`

## Order

| # | TZ | Parallel notes |
|---|-----|----------------|
| Q1 | `TZ-BACKEND-QA-OUTPUT-VAT-MOCK` | first; unblocks BE test suite |
| Q2 | `TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD` | after Q1 (same studio-document area) |
| Q3 | `TZ-FRONTEND-QA-APP-LAYOUT-FLAKY` | ∥ Q1/Q4a OK (legacy `frontend/`, not nx) |
| Q4a | `TZ-BACKEND-QA-LINT-UNUSED-IMPORTS` | ∥ Q3; sequential vs Q2 if same agent |
| Q4b | `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1` | last FE; ≤15 files; not full 200 |

## ═══ START ═══ (paste into Freebuff when slots free)

```
Continuous executor · D:\kppdf-8.0 · main · agent_id: freebuff

Skills: .agents/skills/kppdf-executor-loop/SKILL.md + GEMINI.md
Wave: docs/agent-checklists/WAVE-QA-GATES-2026-09.md

Order: Q1 → Q2 → Q3 → Q4a → Q4b (или Q3∥Q1 если два слота: #1 BE Q1→Q2→Q4a, #2 FE Q3→Q4b)
Claim slot ДО кода. Archive + commit/push каждую TZ.
НЕ трогать frontend-nx/apps/kppdf-web пока не пуст KP Family.
НЕ deploy. Product fixes только по TZ paths.
Все [ ] до конца волны · не останавливаться mid-queue.
```

## RESUME

Открыть WAVE таблицу → первая строка без [x] → checklist Claim → код → gates → archive → next.
