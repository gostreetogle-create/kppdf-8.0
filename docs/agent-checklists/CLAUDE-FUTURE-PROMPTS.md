# CLAUDE FUTURE PROMPTS — копипаст по порядку

> Для PO: после отчёта Claude — следующий блок из списка.  
> Сейчас в работе: **#1 Shipping**. Остальное — запас.

updated_at: 2026-09-08T06:20:00+03:00

| # | Когда | Файл | Статус |
|---|--------|------|--------|
| 1 | сейчас | `tasks/PROMPT-CLAUDE-NX-SHIPPING.md` | **NEXT / IN FLIGHT** |
| 2 | после #1 DONE | `tasks/PROMPT-CLAUDE-NX-SHIP-S4-CANCEL.md` | READY |
| 3 | после #1 (или #2); когда нужен прод | `tasks/PROMPT-CLAUDE-DEPLOY-GO.md` | READY (PO-GATE deploy) |
| 4 | после shipping archived | `tasks/PROMPT-CLAUDE-SUPPLY-EXCEL-B.md` | READY |
| 5 | только если PO сказал «G12» | `tasks/PROMPT-CLAUDE-GANTT-G12.md` | PARK |

## Не готовим без слова PO
- `/desk` / комбайн — новый модульный контур (`PO-CANON` п.7)
- TZD-76 GGUF/NSIS — нет живой TZ (NSIS runner уже TZD-56+)
- wipe / LM Studio BYOK
- partial legacy UI delete

## Порядок рекомендации
Shipping → S4 cancel → (Excel B ∥ или после) → Deploy когда скажешь «деплой».

---

## #1 — уже выдан
`tasks/PROMPT-CLAUDE-NX-SHIPPING.md`

## #2 — S4 hub cancel

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-SHIPPING.md (добавь/закрой S4)
TZ: tasks/_ready/nx-shipping/TZ-NX-SHIP-S4-HUB-CANCEL.md
Канон: PO Undo + TZ-SHIP-433 — отмена только до dispatch.

Claim → baseline nx build → code → gates (nx build last) → archive → commit → push.
_NOW Claude IDLE; Executor report SHA.

НЕ: /desk; BE rewrite; stock OUT вне cancel API; Excel; deploy.
Не спрашивай «продолжать?».
```

## #3 — Deploy

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ ДЕПЛОЙ ═══
Читай ПЕРВЫМ: deploy/synology/README.md — блок «Если PO сказал сделать деплой по документации».
Штамп: docs/agent-checklists/DEPLOY-READY.md — status MUST be READY + frontend_target: nx.
Канон: docs/ops/DEPLOY-NX-PROD.md.

Действия:
1) git fetch && checkout main && pull --ff-only
2) Если штамп не READY → STOP, скажи PO «нужна подготовка»
3) Warm deploy по README (Mongo KEEP, wipe_default false) — без jest/tsc matrix, без правок кода
4) Smoke §4 DEPLOY-NX-PROD (health, login, NX shell)
5) Штамп → INVALID + why_invalid: deployed <sha> <date> + commit docs only
6) Executor report: URL/smoke/SHA

НЕ: dropDatabase; wipe без явного PO; правки frontend-nx/backend mid-deploy; force-push.
```

## #4 — Excel B

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE note: docs/agent-checklists/WAVE-NX-SUPPLY-OPS.md (Excel B row)
Аудит: docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md §8 path B
TZ: tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-B.md

Claim → code Desktop multi-sheet template + import HITL → gates desktop → archive → commit → push.
WAVE Excel B → DONE; _NOW Claude IDLE; Executor report SHA.

НЕ: chat write DB; wipe; NX shipping rework; Purchase*; deploy без PO.
Не спрашивай «продолжать?».
```

## #5 — G12 (PARK)

Открыть `tasks/PROMPT-CLAUDE-GANTT-G12.md` только после явного «делай G12».
