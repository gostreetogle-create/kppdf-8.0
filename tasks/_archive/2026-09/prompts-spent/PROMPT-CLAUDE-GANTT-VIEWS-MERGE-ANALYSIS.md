# Claude — analysis only: merge Gantt «По заказам» + «По рабочим»?

Скопируй блок ниже в **Claude Code** (peer / discussion). Код не писать. Ответ потом вставь Cursor.

```
═══ ANALYSIS ONLY ═══

Repo: D:\kppdf-8.0 · NX Gantt /production
DO NOT edit files. DO NOT implement. Discussion + recommendation only.

PO question (RU):
We have two TOC modes: «По заказам» and «По рабочим».
Would it be correct / usable to MERGE them into one view where the manager
sees orders AND which workers they are attached to, and can edit / move
work between workers in one place?

Cursor already drafted options (read, then agree/disagree with evidence):
  docs/audits/2026-09-05-gantt-orders-workers-merge-audit.md

Also read (facts, not essays):
  docs/pages/production-cockpit.page.md — sections on groupByWorkers / TZ-GANTT-401 / 344 / 351
  docs/PO-CANON.md — Gantt bullets (manager-only; «По рабочим»=модуль; assignment cues)
  frontend-nx/.../production/blocks/gantt-bars.component.ts — canMoveBar/canResizeBar when groupByWorkers
  frontend-nx/.../production/gantt-bar.model.ts — buildWorkerTreeBars (shape of worker tree)

Return in Russian, structured:

1. Goal restatement (1–2 sentences, manager language)
2. What the two modes answer today (different questions?)
3. Critique of Cursor options A/B/C/D — keep / change / kill each
4. Your preferred option + why (necessity for ~10-user shop)
5. If merge: exact interaction model (what is dragged? order vs work-type bar? write API?)
6. Risks / false metaphors («переместить заказ» vs reassign WT)
7. Thin vertical slice if we ever build something (1–3 TZ titles max) OR «do nothing / only polish labels»
8. One Yes/No question for PO ONLY if truly blocking; else decide a default

No code. No TZ files. Stop after the structured answer.

═══ END ═══
```
