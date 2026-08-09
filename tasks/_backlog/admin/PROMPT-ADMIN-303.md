# Промпт — TZ-ADMIN-303 (параллельно WAVE-KP-USABLE)

**По-человечески:** второй агент добивает незакоммиченный WIP: админ сайта может
редактировать права системных ролей, удалять их нельзя. Не лезет в Создать КП.

Скопируй блок ниже **целиком**. Workspace = канон `D:\kppdf-8.0` (не freebuff).

```text
Ты — исполнитель kppdf-8.0 · workspace ТОЛЬКО D:\kppdf-8.0 · ветка main.
Skills: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md
TZ: tasks/_backlog/admin/TZ-ADMIN-303-system-roles-admin-edit.md
PO: docs/PO-DIARY.md §1–§4 (запись «Админ правит системные роли»)
Deploy НЕ запускать.

ПАРАЛЛЕЛЬ: другой агент закрывает WAVE-KP-USABLE (339→334→335→336) в freebuff worktree.
ЗАПРЕЩЕНО трогать: proposals/*, quotation/*, document-template/*, table-template/*,
tasks/_active/TZ-SALES-*, docs/agent-checklists/TZ-SALES-*.
Не коммить чужие dirty файлы вне CONFLICT KEYS этой TZ.

СТАРТ:
1) cd D:\kppdf-8.0 && git status -sb
2) Убедись что dirty уже есть на:
   system-role.guard.ts(+spec), roles-admin.controller.ts, roles-admin.page.ts(+spec)
3) CLAIM до правок: tasks/_active/TZ-ADMIN-303.md + docs/agent-checklists/TZ-ADMIN-303.md
   (Status CLAIMED, agent_id, claimed_at ISO, workspace D:\kppdf-8.0)
4) Если в _active чужой CLAIM на те же admin keys — STOP + доклад.

СДЕЛАЙ:
- Добей WIP по TZ: admin PATCH системных ролей; DELETE системных запрещён; FE «Редактировать» при role:write; RU toast.
- Не переписывай с нуля — доведи AC и тесты.
- Gates: backend tsc + system-role + admin Jest зоны; frontend tsc + roles-admin.spec; Prettier/ESLint/diff-check по зоне.
- Self-verify: admin → Роли → Редактировать системную → сохранить; удаление недоступно/403.
- Executor report (auto) → archive tasks/_archive/2026-08/TZ-ADMIN-303.done.md + lock
  → remove _active → commit+push ТОЛЬКО своих файлов → checkpoint в _active-map
  (не затирай свежие SALES checkpoints; допиши сверху свой).
- NEXT: idle. Deploy NO.

Финал PO: SHA + «админ правит системные роли / delete запрещён».
```
