# TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS: текстовые блоки на листе студии

РОЛЬ АГЕНТА: executor (Freebuff #1), код `frontend-nx` only  
СТАТУС: **READY** — выдавать **только после** archive `TZ-NX-REGISTRY-CRUD-UNIFY` и green `nx build kppdf-web` на `main`  
ЗАВИСИМОСТИ: `TZ-NX-DOCSTUDIO-S2-SHELL` (DONE), `TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE` (D1, DONE)

LAYER: 2 (`libs/data-access`) + 3 (`apps/kppdf-web/.../studio/**`)  
PAGES: `/studio/:id`  
PAGE_DOCS: _(studio page doc when exists; строка в PAGE-TZ-INDEX после closeout)_

CONFLICT KEYS:  
`frontend-nx/libs/data-access/src/lib/doc-studio/**` ; `frontend-nx/apps/kppdf-web/src/app/pages/studio/**`

IMPLICIT CONFLICT: `frontend-nx/apps/kppdf-web` — **nx build kppdf-web** (всё приложение)

**НЕ трогать:** `backend/**`, `frontend/**`, `apps/kppdf-web/src/app/pages/registries/**`, `docs/architecture/**`, `docs/adr/**`

Проверено: `backend/src/modules/studio-document/studio-document.controller.ts` (`GET/POST/PATCH/DELETE :id/blocks`, `PATCH :id/blocks/layouts`); `studio-shell.page.ts` (S2 оболочка, лист без блоков); `docs/architecture/nx-doc-studio.md` §6 S3; legacy reference `frontend/src/app/pages/doc-constructor/studio/studio-panel-layers.component.ts`.

---

## BUILD INTEGRITY (обязательно)

Baseline (до CLAIM): `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0  
STOP если `tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md` существует.

Gates (закрытие; **nx build последним**):
```bash
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
cd frontend-nx && pnpm exec nx build kppdf-web
node start.mjs --nx --no-browser  # browser evidence S3
```

Канон: `docs/TZ-NX-BUILD-INTEGRITY.md`

---

## ЦЕЛЬ

Оператор открывает `/studio/:id` и может **добавить текстовый блок на лист**, переместить, изменить размер, управлять слоями (z, lock, видимость), править содержимое и свойства; изменения **сохраняются** через API с `expectedRevision`; при 409 — понятный toast, без тихой перезаписи.

Вне scope S3: типографический тулбар (S4), таблицы (S6), PDF (S8), rich-text колонки TipTap — только **plain text** или минимальный HTML из API как есть.

## ИСХОДНОЕ СОСТОЯНИЕ

- S2: лист A4, рельсы, панель страниц, PATCH ориентации с revision gate — DONE.  
- Backend: блоки студии через `studio-documents/:id/blocks`; D1 `BlockStyle` на схеме — DONE.  
- NX data-access: `PiStudioDocumentsService` есть; **сервиса блоков студии нет**.  
- На листе блоков нет; кнопки рельсов — заглушки «В срезе S3».

## ЧТО ДЕЛАТЬ

### Шаг 1 — data-access

1. `pi-studio-blocks.service.ts` + types + spec: `list(documentId)`, `create(documentId, { expectedRevision, ... })`, `update(blockId, ...)`, `remove(blockId, ...)`, `updateLayouts(documentId, { expectedRevision, layouts })`.  
2. Пути API: `GET/POST /studio-documents/:id/blocks`, `PATCH/DELETE /template-blocks/:id`, `PATCH /studio-documents/:id/blocks/layouts` — сверить с контроллерами, не выдумывать.  
3. Экспорт из `libs/data-access/src/lib/doc-studio/index.ts`.

### Шаг 2 — состояние и autosave

1. В shell (или выделенном `studio-blocks.state.ts`): загрузка блоков при открытии документа; локальный draft layout/content.  
2. Debounced save layout batch + revision bump; при 409 — toast «Документ изменён в другом месте» + reload document/blocks (без overwrite).  
3. После успешного save — обновить `revision` в локальном `StudioDocument`.

### Шаг 3 — canvas на листе

1. Рендер text-блоков внутри `.studio-sheet` (absolute positioning по `layout.x/y/w/h`, page=1).  
2. Добавление: кнопка «Текст» на левом рельсе → `POST` block type `text` с дефолтным layout в центре листа.  
3. Drag + resize handles (минимум угловой resize); locked блоки не двигаются.  
4. Клик по блоку — select; клик по листу вне блока — deselect (не ломать S2 collapse панели: `stopPropagation` на блоке).

### Шаг 4 — панели слоёв и свойств

1. «Слои» (левый рельс): список блоков, reorder → `updateLayouts`; toggle lock / visible.  
2. «Свойства» (правый рельс): имя/label блока, координаты read-only или editable numbers — по минимуму.  
3. Выбранный блок подсвечен на листе и в списке слоёв.

### Шаг 5 — evidence

1. Playwright или существующий smoke: открыть документ, добавить текст, перетащить, сохранить, F5 — блок на месте.  
2. Скриншоты + `_geometry.json` если меняется layout листа (лист **не должен** reflow — Δ=0 как S2).  
3. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS/`

## КРИТЕРИИ ПРИЁМКИ

1. `/studio/:id`: ≥1 text block create/list/update/delete через реальный API.  
2. Drag/resize меняет layout; после reload позиция сохранена.  
3. Layers: reorder, lock, hide работают.  
4. Revision conflict: симулировать stale revision → toast, без silent save.  
5. `nx build kppdf-web` exit 0; 0 console errors на smoke path.  
6. Не сломан S2: ориентация, panel 480px, sheet ratios (portrait ~0.707, landscape ~1.414).

## known_limitation

- TipTap / multi-column text — S4+.  
- Multi-page — S5.  
- `architecture:check` legacy `frontend/**` violations — вне scope если pre-existing.  
- Repo-wide `pnpm test` красные вне `studio/**` + `doc-studio/**` — documented, не блокер если nx build green.

## ФИНАЛИЗАЦИЯ

Archive `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.done.md` + ARCHIVE_MARKER; `_NOW.md`, PAGE-TZ-INDEX; commit/push только своих путей.
