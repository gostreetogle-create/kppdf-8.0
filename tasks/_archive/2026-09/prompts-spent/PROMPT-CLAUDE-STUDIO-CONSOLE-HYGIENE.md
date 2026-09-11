# PROMPT — Claude: studio console hygiene + no native confirm

Скопируй целиком. Лучше `D:\kppdf-8.0\.claude\run-continuous.cmd`.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
PO на /studio:
1) Lucide ERROR "check" icon not provided
2) модалка «Выберите шаблон» — голые × (pi-icon-button)
3) POST …/sync-quotation → 404 (orphan linkedQuotationId)
4) native window.confirm «Отправить документ в архив?» — стыдно; нужен AlertDialog как у удаления слоя
Шум НЕ чинить: /uploads/*.png 404, about:srcdoc sandbox.
Inventory: rg window.confirm frontend-nx → только studio-editor onFinalize.

[ЗАДАЧА]
Строго по очереди (один nx build — НЕ параллелить):

01) CLAIM tasks/TZ-NX-LUCIDE-ICONS-REGISTER.md
02) CLAIM tasks/TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS.md
03) CLAIM tasks/TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN.md
04) CLAIM tasks/TZ-NX-NO-NATIVE-CONFIRM.md
    onFinalize → AlertDialogComponent + onDialogCloseOnce (паттерн delete layer ~:2091)
    eslint no-alert error; rg window.(confirm|alert|prompt) frontend-nx → 0
    Gates → archive → commit → push → _NOW Claude IDLE → Executor report (auto) SHA 01–04.

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; A4 geometry; legacy frontend/**; «продолжать?»; чинить uploads файлами.

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 4 SHA + visual: picker × + архив = Pi dialog.
```
