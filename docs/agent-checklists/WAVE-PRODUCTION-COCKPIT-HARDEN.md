# WAVE-PRODUCTION-COCKPIT-HARDEN — MASTER CHECKLIST

> **Resume SoT.** При любом старте/обрыве: читай этот файл первым.
> Отмечай `[x]` только после archive + gates. Обновляй live slot каждый шаг.

updated_at: 2026-08-15T23:55:00+03:00
agent: Buffy
score_now: 98
target_score: 98
blocked: none
last_phase: WAVE DONE
last_tz: TZ-PRODUCTION-328
last_action: page/spec SoT, audit scoreboard, index, archive/lock, and resume docs closed; estimate studio PASS
next_action: STOP — готово предложить деплой по явной команде PO; не деплоить

## Live resume

```
last_phase: WAVE DONE
last_tz: TZ-PRODUCTION-328
last_action: page/spec SoT, audit scoreboard, index, archive/lock, and resume docs closed; estimate studio PASS
blocked: none
score_now: 98
next_action: STOP — готово предложить деплой по явной команде PO; не деплоить
updated_at: 2026-08-15T23:55:00+03:00
agent: Buffy
```

## Phases

- [x] **0** Read audit + wave + this file; set live resume
- [x] **324** Zoom fit / Вместить сроки / Сегодня scroll — archive DONE
- [x] **325** Orders rail: no pips + заказчики filter — archive DONE
- [x] **326** Write-path sync (plannedDate roles/reload) — archive DONE
- [x] **327** Smart/dumb light refactor — archive DONE
- [x] **328** Page docs + SoT closeout — archive DONE
- [x] **WAVE DONE** score_now ≥ 98; _NOW: queue empty, propose deploy (do not deploy)

## Links

| Artifact | Path |
|----------|------|
| Audit | `docs/audits/2026-08-15-production-cockpit-harden-audit.md` |
| Wave | `tasks/_backlog/WAVE-PRODUCTION-COCKPIT-HARDEN.md` |
| Prompt | `tasks/_backlog/PROMPT-PRODUCTION-COCKPIT-HARDEN.md` |
| TZ 324 | `tasks/_archive/2026-08/TZ-PRODUCTION-324.done.md` |
| TZ 325 | `tasks/TZ-PRODUCTION-325-orders-rail-counterparties.md` |
| TZ 326 | `tasks/TZ-PRODUCTION-326-gantt-write-sync.md` |
| TZ 327 | `tasks/TZ-PRODUCTION-327-cockpit-smart-dumb.md` |
| TZ 328 | `tasks/TZ-PRODUCTION-328-cockpit-docs-closeout.md` |
| Canon | `docs/PO-CANON.md` |
| Page | `docs/pages/production-cockpit.page.md` |

## Hard bans

- Deploy / wipe unless PO explicit «деплой»
- Fact production / ProductionOrder / OrderTask
- New BE endpoints without STOP+PO (326 may only verify)
- Mid-queue «ок?» — запрещено
- Stage `data/paspots` / unrelated WIP

## Per-TZ checklists

- `docs/agent-checklists/TZ-PRODUCTION-324.md` … `328.md` (create stubs on claim if missing)
