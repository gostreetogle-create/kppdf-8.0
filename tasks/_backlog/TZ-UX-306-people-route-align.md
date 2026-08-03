═══════════════════════════════════════════════════════════════
TZ-UX-306: People/Workers — orphan UI vs route (стык с WORKERS-302)
═══════════════════════════════════════════════════════════════

> **PARKED for Stabilization Wave (2026-08-03).**  
> Execute only after DOC-337…340 + UX-DIALOG-301 (or explicit PO).  
> Canon: [`docs/STABILIZATION-WAVE-2026-08.md`](../../docs/STABILIZATION-WAVE-2026-08.md)  
> Dialog API: [`docs/DIALOG-COOKBOOK.md`](../../docs/DIALOG-COOKBOOK.md) — no invent PiDialog.

РОЛЬ АГЕНТА: Frontend routing
ЗАВИСИМОСТИ: TZ-WORKERS-301 DONE; Stabilization Wave vertical DONE preferred
LAYER: 3
PAGES: /people
PAGE_DOCS: docs/pages/people.page.md

CONFLICT KEYS:
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/pages/people/;
docs/agent-checklists/TZ-UX-306.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

На диске `pages/people/people.page.ts` (+ form dialog), но **нет** route
и **нет** nav. TZ-WORKERS-302 планирует `pages/workers/*` NEW — риск двух
параллельных реализаций. Half-baked people/ уже ломал ng build в сессиях.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Канон пути: **либо** довести people/ (route `/people` + nav
  «Люди»), **либо** удалить people/ и реализовать только workers/ по 302.
  Зафиксировано предпочтение: **один** путь `/people`, label «Люди»;
  если 302 ещё не стартовал — переименовать conflict keys 302 → people/*
  в том же PR или отдельным amend note в 302.
ШАГ 2 — Зарегистрировать route + nav (Производство / рядом с work-types).
ШАГ 3 — Не изобретать вторую карточку: UI = scope WORKERS-302;
  этот TZ = unblock discoverability + убрать orphan.
ШАГ 4 — Executor report; обновить PAGE-TZ-INDEX.

AC: страница открывается из меню; нет двух папок people+workers без route;
  build не ссылается на broken orphan.
ПРОМПТ: GEMINI.md + tasks/TZ-UX-306-people-route-align.md + прочитай
TZ-WORKERS-302 (не дублировать form). Checklist TZ-UX-306. Push нет.
