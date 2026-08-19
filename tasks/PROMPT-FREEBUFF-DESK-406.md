# PROMPT — Freebuff: TZ-DESK-406 (chrome parity /desk)

Скопируй целиком в новый чат Freebuff.

---

CLAIM первым (до кода):

1. `Get-Location` + `git rev-parse HEAD` → repo `D:\kppdf-8.0`, свежий `main`
2. Скопируй `tasks/TZ-DESK-406.md` → `tasks/_active/TZ-DESK-406.md`
3. Checklist: `docs/agent-checklists/TZ-DESK-406.md` — Status CLAIMED
4. `_active-map` / чужие `_active` conflict keys → STOP если пересечение
5. Team Room claim best-effort

Затем: прочитай `GEMINI.md`, **`docs/pages/page-chrome.md`**, `tasks/TZ-DESK-406.md`,
эталон `frontend/src/app/pages/orders/orders.page.ts`, `docs/pages/manager-desk.page.md`.

**Задача:** PO не принял **визуал** 405 — две строки chrome, лишний «Рабочий стол», узкая колонка.
Функционал 405 (expand-row, tray, L/R flyout) **не ломать**.

**Must:**
- **Одна** chrome-строка через `app-pi-group-workspace` + `desk-workflow-chips.ts` (Стол…Отгрузка)
- Убрать `app-pi-page-chrome` и кастомный `.manager-desk__workflow`
- Без label «Рабочий стол»; при expand — номер заказа suffix **в той же** chip-строке
- Убрать двойной padding / max-width — ширина как `/orders` внутри `pi-page-frame`
- Убрать видимый H1 «Очередь заказов» (sr-only ok)
- Обновить spec + page doc

**Must NOT:** API, order form, tray logic rewrite, production-cockpit, deploy.

**Gates:**
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk.page
cd frontend && pnpm exec eslint src/app/pages/desk/manager-desk.page.ts src/app/pages/desk/desk-workflow-chips.ts
```

**PO smoke (опиши в отчёте):** сравни края контента `/desk` vs `/orders` на одном viewport.

Archive → `tasks/_archive/2026-08/TZ-DESK-406.done.md`, lock, push, executor report в checklist.

**PO ждёт:** после 406 — «раскладка v2 ok» → тогда 402.
