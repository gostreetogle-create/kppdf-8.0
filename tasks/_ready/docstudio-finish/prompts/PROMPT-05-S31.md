# Freebuff — один TZ: S31 SERVER-PREVIEW

Скопировано Cursor для continuous executor. **Один** TZ. Не спрашивай PO mid-task.

## Старт

1. Прочитай `GEMINI.md` + skill `.agents/skills/kppdf-executor-loop/SKILL.md`.
2. `git status` / branch / `tasks/_active/` пуст.
3. Claim: скопируй TZ в `tasks/_active/`, заполн Claim slot (agent_id, claimed_at ISO).
4. TZ SoT: `tasks/_ready/TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md`
5. Checklist волны: `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`
6. Audit: `docs/audits/2026-09-03-docstudio-honesty-audit.md`

## Правила

- Только пути из CONFLICT KEYS TZ (+ необходимые specs).
- Не legacy `frontend/**`. Не deploy. Не чужой WIP.
- До archive: gates из TZ. Для FE: `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 **последним**.
- Archive `.done.md` + commit/push по GIT-POLICY проекта.
- STOP если conflict keys пересекаются с чужим active.

## После DONE

Коротко в чат: SHA + archive path. Жди следующий PROMPT от PO/Cursor — **не** бери S-next сам, если PO ведёт по одному промпту.
