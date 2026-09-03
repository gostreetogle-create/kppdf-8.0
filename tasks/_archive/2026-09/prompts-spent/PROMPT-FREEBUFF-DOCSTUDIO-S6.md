# PROMPT — Executor Doc Studio S6

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S6-PO-POLISH

1) Прочитай GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
2) git status / branch — не трогать чужой WIP вне studio/**
3) CLAIM: скопируй tasks/TZ-NX-DOCSTUDIO-S6-PO-POLISH.md → tasks/_active/, заполни Claim slot
4) Реализуй все 7 шагов TZ. PO feedback: ghost layers, A4 frame, big page arrows, properties categories
5) Gates: tsc → nx test studio → nx build kppdf-web (last, exit 0)
6) Обнови docs/pages/document-studio.page.md (кратко)
7) Archive в tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S6-PO-POLISH.done.md, очисти _active
8) Commit только если PO попросил в чате; иначе оставь uncommitted с evidence в .done.md

Канон геометрии: docs/pages/kp-workspace-geometry.md — не reflow A4, 480px overlay.
Не спрашивай PO «продолжать» — доведи до green build.
```
