# Backlog — plan vs fact WorkType days (parked)

**Status:** PARKED — needs fact-production / shop completion scenario  
**Source:** PO 2026-08-15 dictation (meta strip / estimate discussion)

## Idea

When a work type (or order) is marked done and **actual calendar days** differ from
estimate (`WorkType.days` / order override), show a **non-blocking** prompt on the
relevant card (product / module / work-type), not on Gantt meta:

- «Выполнено за N дн., в нормативе M — обновить норматив?» → Apply / Dismiss
- Survives reopen until resolved
- Never silent-write catalog from Gantt drag

## Why not now

- `/production` is **estimate studio**; fact completion / status→done write-path
  is still OUT of cockpit readiness.
- No stable «actual days» capture on Order/WorkType yet.

## When to reopen

After fact shop-floor or explicit «закрытие вида работ» scenario ships.
