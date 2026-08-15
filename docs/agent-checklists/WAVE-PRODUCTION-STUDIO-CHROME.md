# WAVE-PRODUCTION-STUDIO-CHROME — master checklist

> **Status:** DONE / estimate-only studio PASS 99/100  
> **SoT:** `docs/ux/production-gantt-studio-spec.md`  
> **Prompt:** `tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md`

**Score progress:** `99 / 100` · факт производства = 0 (намеренно).

| Фаза | Баллы | Статус | Archive |
|------|------:|--------|---------|
| A Spec | 15 | `[x]` DONE | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md` |
| B Shell | 25 | `[x]` DONE | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-B.done.md` |
| C Visual rails+flyout | 35 | `[x]` DONE | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-C.done.md` |
| D Consistency + geometry | 24 | `[x]` DONE | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-D.done.md` |
| **Итого** | **99** | **DONE** | estimate-only |

## Final resume slot

```text
last_phase:     DONE
last_tz:        TZ-PRODUCTION-STUDIO-D
last_action:    geometry/theme/focus smoke passed; archive and readiness closeout complete
blocked:        нет
score_now:      99
next_action:    STOP; no deploy; future fact-production work is separate
updated_at:     2026-08-15
agent:          Buffy / Freebuff continuation
```

## Evidence

- frontend TypeScript PASS;
- production Jest **23/23 PASS**;
- Angular build PASS; existing bundle/style budget warnings only;
- Prettier PASS;
- ESLint 0 errors; one existing `OnInit` architecture warning;
- `git diff --check` PASS;
- 1920×1080 light/dark geometry: 48 | 613 | 48; center width unchanged before/open/closed;
- flyout overlay, backdrop, Escape and focus return PASS;
- hard filter split PASS;
- responsive smoke no horizontal/vertical overflow;
- no backend, facade, estimate math, WorkType.days or data model changes;
- deploy not run.

## Hard limitations

Estimate-only studio is PASS. Factual production remains out: no drag/reschedule, check-in, assignment writes, `ProductionSchedule`, `ProductionOrder`, order-level days write or TZ-309 capability wave.

## Wave closeout

- [x] `_active` empty for STUDIO-A/B/C/D.
- [x] A/B/C/D archived.
- [x] Page docs and `SECTION-READINESS` updated.
- [x] Park 308–310 remain controlled; 309 remains separate future write-wave.
- [x] Deploy not run.
