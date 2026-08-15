# WAVE: Production Studio Chrome

**Статус:** DONE · estimate-only studio PASS 99/100  
**Аудит:** `docs/audits/2026-08-15-production-studio-plan-review.md`  
**SoT:** `docs/ux/production-gantt-studio-spec.md`  
**Master checklist:** `docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md`  
**Continuous prompt:** `tasks/_archive/2026-08/prompts-spent/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md`
**Цель:** `/production` plan-estimate studio **98–99/100** без смены доменной модели.

## Frozen intent

Центр = Гант. L/R icon-rails 48px. Flyout overlay, центр не сжимается.  
`PiGroupWorkspace` = только chrome раздела Цех. Shell studio — локальный.  
Заказы ≠ Фильтры (search в Заказах; reset в Фильтрах).

## Queue

| Phase | TZ | Points |
|-------|-----|-------:|
| A | `tasks/_archive/2026-08/specs-dup-root/TZ-PRODUCTION-STUDIO-A-spec.md` | 15 |
| B | `tasks/_archive/2026-08/specs-dup-root/TZ-PRODUCTION-STUDIO-B-shell.md` | 25 |
| C | `tasks/_archive/2026-08/specs-dup-root/TZ-PRODUCTION-STUDIO-C-visual.md` | 35 |
| D | `tasks/_archive/2026-08/specs-dup-root/TZ-PRODUCTION-STUDIO-D-closeout.md` | 24 |
| **Sum** | | **99** |

## Explicit out

Estimate math / facade API / backend / drag / check-in / ProductionSchedule /
ProductionOrder / shared StudioRail / TZ-309 writes / deploy.

## Gates

См. prompt + per-TZ. Geometry: `getBoundingClientRect` @1920 light/dark в D.

## Closeout table

| TZ | Result | Archive |
|----|--------|---------|
| A | DONE / docs-only | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md` |
| B | DONE / shell behavior 1:1 | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-B.done.md` |
| C | DONE / visual rails+flyouts | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-C.done.md` |
| D | DONE / geometry + estimate PASS | `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-D.done.md` |

Commit SHA: pending explicit commit authorization; deploy: not run.
