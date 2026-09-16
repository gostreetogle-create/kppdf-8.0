# PROMPT — Freebuff: Home крошки + CTA «Редактировать заказ»

Ты executor kppdf-8.0 (`agent_id: freebuff`). Workspace: `D:\kppdf-8.0` на main (continuous).

### Preflight
1. `docs/how-to-connect-ai.md` → `GEMINI.md` → `docs/PO-CANON.md`
2. `git status` / branch / `tasks/_active/` — **если `_active` не пуст (Claude Order Workspace и т.п.) — WAIT**, не параллель на `kppdf-web`. Старт после WAVE-NX-ORDER-WORKSPACE STOP.
3. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → 0
4. Читай и claim **один** TZ: `tasks/_ready/TZ-NX-HOME-BREADCRUMB-EDIT-CTA.md`
5. Checklist Claim slot до первой правки кода

### Сделать
- eyebrow `/home`: «Рабочий день» → «Главная»
- в `OrderHubTray` primary «Редактировать заказ» → `/orders/:id` **всегда виден** при expand
- унифицировать подписи состава/готовности/aria row-link
- docs `home.page.md` + specs
- **Не** раздувать `order-detail.page` · не B10 · не deploy

### После
gates из TZ → archive → commit (только свои файлы) → STOP.

Чужой dirty/WIP не трогать и не коммитить.
