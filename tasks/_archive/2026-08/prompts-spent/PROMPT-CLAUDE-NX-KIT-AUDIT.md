# PROMPT — Claude Code: Nx UI Kit audit (2 фазы, без конфликта с F3)

Скопируй в **отдельную** сессию Claude Code (`agent_id: claude`).  
**Не открывай параллельно с Freebuff**, если F3 ещё в `tasks/_active/`.

---

## Фаза A — МОЖНО СЕЙЧАС (пока F3 идёт)

Конфликта с Freebuff **нет** — только библиотека, не `apps/kppdf-web`.

```text
CLAIM первым:
1) D:\kppdf-8.0 · main · continuous executor (НЕ .freebuff/worktrees)
2) tasks/_active/TZ-NX-KIT-AUDIT-1-lib.md (создай claim-файл по _TEMPLATE.md)
3) agent_id: claude-nx-kit-lib · claimed_at ISO

Задача ФАЗА A (libs only):
- Зона: frontend-nx/libs/ui/paper-and-ink/** ТОЛЬКО
- ЗАПРЕЩЕНО: frontend-nx/apps/**, libs/data-access/**, backend/**, legacy frontend/**

1. Прочитай tasks/_archive/2026-08/TZ-NX-KIT-AUDIT-table-display.done.md (pi-table :host fix уже DONE — не трогай без причины).

2. Прогони: cd frontend-nx && pnpm exec nx test paper-and-ink
   Почини падающие suites (card, badge, pi-toast, pi-table-tree, pi-alert-dialog, pi-showcase-card) — типично: signal/@if fixtures, не бизнес-логика.

3. Gates:
   pnpm exec nx run paper-and-ink:lint
   pnpm exec tsc -p libs/ui/paper-and-ink/tsconfig.lib.json --noEmit
   pnpm exec nx test paper-and-ink

4. Archive → tasks/_archive/2026-08/TZ-NX-KIT-AUDIT-1-lib.done.md
   Integrity: docs-only N/A; page.md N/A.

Если files в libs/data-access или apps/kppdf-web менялись за последние минуты другим агентом — STOP, не мержи.
```

---

## Фаза B — ТОЛЬКО ПОСЛЕ F3 (kit-страницы)

**Старт когда** `tasks/_active/TZ-NX-F3-data-access.md` исчез и есть `tasks/_archive/.../TZ-NX-F3-data-access.done.md`.

```text
CLAIM:
tasks/_active/TZ-NX-KIT-AUDIT-2-kit-demos.md
agent_id: claude-nx-kit-demos

Выполни tasks/TZ-NX-KIT-AUDIT-2-kit-demos.md целиком:
- /kit/forms: демо select-add-row, table-tree, expanded row / rowActions
- /kit/overview: честные статусы (canonical vs partial) — без вранья
- /kit/overlays: убрать «10 primitives» если часть toast-stub; подписать честно

Конфликт-ключи: apps/kppdf-web pages kit/forms/overlays + kit-layout
НЕ трогать: login, enroll, admin, app.config auth wiring (уже после F3)

Gates: nx build kppdf-web + lint --all
Smoke: :4201/kit/forms — table scroll внутри bordered box

Archive + checklist Executor report.
```

---

## Почему так

| Агент | Зона | Сейчас |
|-------|------|--------|
| **Freebuff F3** | auth + `apps/kppdf-web` routes/config/pages/login/admin | IN PROGRESS |
| **Claude фаза A** | `libs/ui/paper-and-ink` | параллельно OK |
| **Claude фаза B** | kit demo pages | ждёт конец F3 |

F3 и kit-демо **оба** трогают `apps/kppdf-web` → параллельно = merge-ад. Разделение по путям решает проблему.

---

PO: после F3 напиши в чат **«продолжай kit»** — запущу фазу B или проверю diff.
