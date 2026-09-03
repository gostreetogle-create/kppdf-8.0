# Freebuff — один TZ: S40 FLEX-DATA-BINDINGS

Скопировано Cursor для continuous executor. **Один** TZ. Не спрашивай PO mid-task.

## Старт

1. Прочитай `GEMINI.md` + skill `.agents/skills/kppdf-executor-loop/SKILL.md`.
2. `git status` / branch / `tasks/_active/` пуст.
3. Claim: скопируй TZ в `tasks/_active/`, заполн Claim slot.
4. TZ SoT: `tasks/_ready/TZ-NX-DOCSTUDIO-S40-FLEX-DATA-BINDINGS.md`
5. Operator bar: `docs/architecture/nx-doc-studio-operator-bar.md` (раздел Flexible binding)
6. Checklist: `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`

## Правила

- CONFLICT KEYS TZ only. Не legacy `frontend/**`. Не deploy.
- Gates TZ + `nx build kppdf-web` last для FE.
- Archive `.done.md` + commit/push по GIT-POLICY.

## После DONE

SHA + archive path. Жди следующий PROMPT.
