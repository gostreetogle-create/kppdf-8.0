# PROMPT — Freebuff: TZ-TEST-421 (stale HUB-303/304)

Скопируй в Freebuff / executor:

```text
Workspace: D:\kppdf-8.0 · main · skill kppdf-executor-loop + GEMINI.md
TZ: tasks/TZ-TEST-421-orders-page-desk423-canon.md
CLAIM в tasks/_active/ + checklist до кода. agent_id=freebuff.

Сделай только ACCEPTANCE из TZ: обновить orders.page.spec.ts под канон DESK-423
(секции свёрнуты по умолчанию; без фраз «Нет задач снабжения» / «Нет броней» /
«Отгрузка пока не ведётся»). Product .ts/.html/.css НЕ трогать.

Gates из TZ → archive TZ-TEST-421.done.md + sha → commit/push → отчёт PO.
BAN: deploy.ps1, wipe, другие TZ, смешанный коммит с чужой задачей.
```
