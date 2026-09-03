# PROMPT — Executor Doc Studio S8-RIBBON-NORMALIZE

```text
Executor kppdf-8.0 · TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE

1) GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
2) Baseline: cd frontend-nx && pnpm exec nx build kppdf-web — PASS или STOP
3) CLAIM: tasks/TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE.md → tasks/_active/
4) Нормализуй ribbon /studio/:id — все контролы 26px (см. TZ):
   - + Страница → kp-ws-ribbon-btn (убрать app-pi-button)
   - page-nav стрелки 26×26, icon 14px
   - kp-ws-ribbon-btn--active в shell CSS
5) Gates: nx test kppdf-web --testPathPattern=studio → nx build kppdf-web (last)
6) docs/pages/document-studio.page.md — одна строка про unified ribbon
7) Archive .done.md, очисти _active

Commit только если PO попросил.
```
