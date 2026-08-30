# TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT — закрыть PO-WIP студии (слои, текст, таблица)

**РОЛЬ АГЕНТА:** executor (Freebuff / Claude CLI)  
**СТАТУС:** READY  
**ЗАВИСИМОСТИ:** S6 DONE; uncommitted WIP в `studio/**` (см. git status)  
**LAYER:** 3 — `frontend-nx/apps/kppdf-web/src/app/pages/studio/**`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-blocks-canvas.component.ts`; `studio-properties-panel.component.ts`; `studio-layers-panel.component.ts`; `studio-workspace-shell.component.*`; `studio-block-helpers.ts`; `studio-table-*`; `studio-text-*`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**Проверено:** git status 2026-08-30 — 12 modified + 8 new files в `studio/`; `tasks/_active/` пуст; PO 2026-08-30: все слои видны, глаз работает, текст/таблица прозрачность, rich-text свойства, без геометрии.

## ИСХОДНОЕ СОСТОЯНИЕ

1. WIP не в archive, gates не зафиксированы в `.done.md`.
2. `studioCanvasBlocks` — все видимые слои страницы (не S6 isolation).
3. `toggleVisible` / `toggleLock` — PATCH `isActive` / `locked` сразу.
4. Текст: `studio-text-properties.component.ts` (rich-text, библиотека, выравнивание блока).
5. Таблица: `tableTransparentBackground`, `studio-table-properties.component.ts`.
6. Canvas: `innerHTML` + block-level `text-align` / `fontSizePt` / `color`.
7. Панель: без секции «Геометрия»; shell ~340px, centered A4.

## ЧТО ДЕЛАТЬ

### 1. Claim + сверка WIP

- CLAIM → `tasks/_active/TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT.md`
- Пройти все изменённые файлы; убрать мёртвый код (старый textarea, `editingId`, дубли).

### 2. Поведение слоёв (регрессия)

- На листе **все** `isActive !== false` слои текущей страницы, z-index снизу вверх.
- Активный слой — единственный editable (drag/resize).
- Глаз/замок персистятся через API.

### 3. Текст

- Rich-text в свойствах; выравнивание **блока** на листе работает (center/right).
- «Из библиотеки» + «Сохранить в библиотеку» (реестр text-blocks).
- Тесты: `studio-block-helpers.spec.ts`, при необходимости smoke на `studio-text-properties`.

### 4. Таблица

- Прозрачный фон — опция `tableTransparentBackground` (default opaque).
- Виды таблиц: picker + save (уже в WIP).

### 5. Документация

- Обновить `docs/pages/document-studio.page.md` (слои, текст, таблица, без геометрии в свойствах).
- Переместить `TZ-NX-DOCSTUDIO-S6-PO-POLISH.md` → archive если ещё в корне `tasks/`.

### 6. Gates + archive

```bash
cd frontend-nx
pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
pnpm exec nx test kppdf-web --testPathPattern=studio
pnpm exec nx build kppdf-web
```

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT.done.md`  
Обновить `tasks/QUEUE-LIVE.md`, `docs/agent-checklists/_NOW.md`.

## НЕ ИЗМЕНЯТЬ

- `backend/**` (кроме если build падает — STOP)
- Rails «Данные» / «Шаблон» (successor S7-1/S7-2)
- Мультиколоночный текст legacy (successor S7-3)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Gates выше — exit 0
- [ ] 3+ текстовых слоя на одной странице видны одновременно
- [ ] Глаз скрывает слой после F5
- [ ] Выравнивание текста на листе: left/center/right визуально различимы
- [ ] Таблица: opaque по умолчанию, transparent по чекбоксу
- [ ] `data-test`: `studio-text-properties`, `studio-table-transparent-bg`, `studio-align-center`

## Integrity

- Claim: `agent_id: freebuff|claude`, `claimed_at` ISO-8601
- Commit только по явной команде PO в чате; иначе uncommitted + evidence в `.done.md`


---

## Closeout evidence (2026-08-30)

**agent_id:** freebuff-s7-wip  
**workspace:** D:/kppdf-8.0  
**git:** uncommitted WIP retained (no commit per PO policy)

### Gates (exit codes)

| Gate | Command | Exit |
|------|---------|------|
| tsc | pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit | 0 |
| test | pnpm exec nx test kppdf-web --testPathPattern=studio | 0 |
| build | pnpm exec nx build kppdf-web | 0 |

Studio specs: studio-block-helpers, studio-elements-panel, studio-geometry, studio-layout, studio-session, studio-table-defaults.

### Acceptance

- [x] studioCanvasBlocks all visible page layers
- [x] toggleVisible / toggleLock PATCH
- [x] Text rich + align; table transparent default opaque
- [x] No geometry in properties panel
- [x] data-test hooks

### S7-1 notes

No blockers. Next: L rail Data per TZ-NX-DOCSTUDIO-S7-RAILS-DATA.md.
