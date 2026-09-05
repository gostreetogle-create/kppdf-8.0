# WAVE-NX-MODULE-WT-DAYS

updated_at: 2026-09-05T18:10:00+03:00

## Goal

Календарные дни планирования — на связке **модуль ↔ вид работ** (+ override заказа на Ганте). Не на карточке человека и не как единственная правда каталога WorkType.

## Chain

| SIZE | ID | Path | Notes |
|------|-----|------|-------|
| S | TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS | `tasks/_ready/TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS.md` | Убрать `Nд` у навыков |
| L | TZ-NX-MODULE-WT-DAYS-SOT | `tasks/_ready/TZ-NX-MODULE-WT-DAYS-SOT.md` | Binding days + Gantt read + labels |

## Executor

Claude continuous: `tasks/PROMPT-CLAUDE-MODULE-WT-DAYS.md`  
Не параллелить с другим `kppdf-web` TZ (Orders hub tray inset — NEXT после этой волны).

## SoT ladder

1. `Order.estimateDayOverrides` (конкретный заказ)  
2. `ProductModule.workTypes[].days` (модуль)  
3. `WorkType.days` (seed / fallback)
