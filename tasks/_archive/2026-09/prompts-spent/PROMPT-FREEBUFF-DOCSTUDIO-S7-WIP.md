# PROMPT — Executor Doc Studio S7-WIP-CLOSEOUT

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT

1) GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
2) git status — WIP уже в studio/**; не откатывать, довести до green
3) CLAIM: tasks/TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT.md → tasks/_active/
4) Реализуй/проверь все пункты TZ (слои compositing, текст rich+library, таблица transparent, без геометрии)
5) Gates: tsc → nx test studio → nx build kppdf-web (last)
6) docs/pages/document-studio.page.md + QUEUE-LIVE + _NOW.md
7) Archive .done.md, очисти _active
8) Commit только если PO попросил; иначе evidence в .done.md

Не начинай S7-RAILS-DATA пока эта TZ не archived.
```
