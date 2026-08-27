# PROMPT — Freebuff ×2 · DOC-443 + KP-443

> Два агента **параллельно**. Conflict keys не пересекаются.  
> После обеих DONE → Cursor: archive check + «что дальше» (DESK-441 park / deploy).

---

## Freebuff 1 — «+» категории шаблона

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md + docs/paper-and-ink.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DOC-443.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-DOC-443-template-setup-category-plus.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe.
```

---

## Freebuff 2 — ориентация КП из шаблона

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md
Геометрия КП (закон): docs/pages/kp-workspace-geometry.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-KP-443.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-KP-443-orientation-from-template.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe.
```
