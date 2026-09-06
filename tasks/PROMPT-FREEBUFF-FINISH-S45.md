# PROMPT — Freebuff: FINISH S45 only (no pause)

S46 уже на origin. Не переспрашивать курс.

```
Ты Freebuff executor kppdf-8.0. GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?» / «right track?» — PO подтвердил. UNATTENDED до archive S45.

═══ ФАКТ ═══
S46 DONE+pushed: bf90a214 (+ docs 3ace84e1). Не трогать.
S45 CLAIMED. Код + specs уже правятся; focused tests 32 PASS по твоему отчёту.
Gates/checklist ещё не закрыты; commit/push S45 нет.
Claude TZD-77 DONE — desktop/** не трогай.

═══ ДОЖАТЬ S45 (один проход) ═══
TZ: tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL.md
Checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL.md
Аудит: docs/audits/2026-09-06-docstudio-table-select-vs-properties-audit.md

1) Допиши AC если осталось (canvas без .table-edit; Свойства; token gap; page.md).
2) Gates: tsc → focused jest → eslint changed → nx build kppdf-web LAST.
3) Checklist все [x]; archive + lock; очисти _active S45.
4) Focused commit + push. SHA в archive.
5) _NOW Freebuff IDLE. Executor report (auto): S46 SHA + S45 SHA. СТОП.

НЕ: новый рефактор; Chrome C*; desktop; warehouse; чужой WIP; паузы mid-gates.
```
