═══════════════════════════════════════════════════════════════
TZ-UX-306: People/Workers — orphan UI vs route (стык с WORKERS-302)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend routing
ЗАВИСИМОСТИ: TZ-WORKERS-301 DONE; согласовать с tasks/TZ-WORKERS-302-*.md
  (не дублировать карточку — только route/nav/align path)
LAYER: 3
PAGES: /people OR /workers (канон выбрать)
PAGE_DOCS: workers.page.md или people (как решит 302)

CONFLICT KEYS:
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/pages/people/;
tasks/TZ-WORKERS-302-people-page-and-person-card.md;
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
