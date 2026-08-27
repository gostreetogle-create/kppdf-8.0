# Freebuff — два промпта ПАРАЛЛЕЛЬНО

> Открой **два** чата Freebuff. В каждый — свой блок. Больше ничего не копируй.

---

## ПАРАЛЛЕЛЬНО · Freebuff 1 → TZ-UX-441

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/UX-FORM-CANON.md

ТОЛЬКО: tasks/TZ-UX-441-form-field-error-slot.md

CLAIM до кода: tasks/_active/TZ-UX-441.md + checklist _TEMPLATE.md
(agent_id, claimed_at ISO). Чужой key form-field → STOP.
Код → gates из TZ → archive → commit/push.
НЕ трогай dictionaries / UX-442. НЕ deploy.
```

---

## ПАРАЛЛЕЛЬНО · Freebuff 2 → TZ-UX-442

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md

ТОЛЬКО: tasks/TZ-UX-442-dict-slug-placeholders.md

CLAIM до кода: tasks/_active/TZ-UX-442.md + checklist _TEMPLATE.md
(agent_id, claimed_at ISO). Чужой key dictionaries → STOP.
Код → gates из TZ → archive → commit/push.
НЕ трогай form-field / UX-441. НЕ deploy.
```
