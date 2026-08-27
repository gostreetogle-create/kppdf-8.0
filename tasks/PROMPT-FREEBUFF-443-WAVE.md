# PROMPT — Freebuff ×2 · волна 443 (PO smoke fixes)

> Два агента **параллельно**. Разные conflict keys.  
> После обеих DONE → Cursor «что дальше» (DOC-443 + KP-443).

---

## Freebuff 1 — inset рамки

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md + docs/paper-and-ink.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-443.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-UX-443-content-inset-from-frame.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe.
```

---

## Freebuff 2 — зелёный «+» снабжение

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SUPPLY-443.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-SUPPLY-443-org-add-btn-canon.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe.
```

---

## После волны 1 (Cursor выдаст или PO вставит)

Следующая параллель: `TZ-DOC-443` + `TZ-KP-443`  
(файлы уже в `tasks/`; DOC зависит от живого `.pi-select-add-btn` из SUPPLY-443).
