# TZ-NX-DOCSTUDIO-S2-SHELL: страница студии — список + оболочка редактора (без блоков)

РОЛЬ АГЕНТА: executor (Freebuff), код `frontend-nx` only
ЗАВИСИМОСТИ: `TZ-NX-REGISTRY-CRUD-UNIFY` (снос `/constructor`, чистая навигация) — **обязательно закрыт**
LAYER: 2 (data-access) + 3 (apps/studio)
PAGES: /studio ; /studio/:id
PAGE_DOCS: document-studio.page.md (новая секция NX)

CONFLICT KEYS:
`frontend-nx/apps/kppdf-web/src/app/pages/studio/**` ; `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` ;
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ; `frontend-nx/libs/data-access/src/**` ;
`frontend-nx/libs/ui/paper-and-ink/src/lib/canvas/**` ; `docs/pages/document-studio.page.md` ;
`docs/pages/kp-workspace-geometry.md` (уточнение п.6 ориентации на странице студии)

**НЕ трогать:** `frontend/**`, `backend/**`, `docs/architecture/nx-doc-studio.md`, `docs/adr/**`.

---

## ЦЕЛЬ

Первый **видимый** срез студии документов в NX. Оператор открывает `/studio`, видит список документов,
создаёт пустой документ, попадает на `/studio/:id` с листом A4, рельсами, overlay-панелями и ribbon —
**без редактирования блоков** (блоки = S3).

Главное отличие от legacy: геометрия по закону `kp-workspace-geometry.md` + исправление альбомного
искажения (DOCPLAT-01: legacy landscape 1260×730 = 1.726, не A4 1.414).

## ИСХОДНОЕ СОСТОЯНИЕ

- Backend `studio-documents`: `GET/POST/PATCH/DELETE`, `POST from-template` — `studio-document.controller.ts:53-136`.
- NX: сервисов studio-documents **нет**; `pi-canvas-page` центрирует лист (`mx-auto my-4`) — не подходит
  (`pi-canvas-page.component.ts:15-16`). Рельсы shell — заглушки (`tool-rail-definitions.ts`).
- План § 6 S2: оболочка без блоков. D1-схема уже в backend (закрыта).

## ЧТО ДЕЛАТЬ

### Шаг 1 — data-access

`PiStudioDocumentsService`: `list()`, `getById(id)`, `create(dto)`, `remove(id)`.
Типы из `studio-document.schema.ts` (status, orientation, pageSize, revision — только то, что нужно списку и shell).
Экспорт через public API `libs/data-access`.

### Шаг 2 — список `/studio`

Страница: toolbar «Создать документ», таблица/карточки (название, статус, обновлён), row actions:
Открыть, Удалить (confirm). Пустое состояние. Loading/error/empty по конвенции реестров.
Создание → `POST /studio-documents` → navigate `/studio/:id`.

### Шаг 3 — оболочка `/studio/:id`

1. **Плоскость + лист:** отдельный компонент workspace (не наследовать `mx-auto my-4` canvas as-is).
   - Книжный: height-first ~95%, `flex-end`, `padding-right: 8px` на stage.
   - Альбомный: **сохранять A4 ratio** (≈1.414), fit по той стороне, которая упирается первой — НЕ legacy 1.726.
   - Панель open/close **не меняет** rect листа (Δ ≤ 0.5px) — доказать числами в evidence.
2. **Панели overlay:** ширина 480px, контент `max-width: 272px`, `position: absolute`, z-index поверх stage.
   Левый рельс: иконки разделов (Элементы, Слои, Страницы, Данные) — **заглушки** «в срезе S3».
   Правый: Свойства, Таблица, Текст — заглушки. Клик по листу сворачивает панель (закон п.7; в legacy сломано — D7).
3. **Ribbon:** Редактор | Просмотр (переключатель без логики блоков), места под PDF/архив — disabled с tooltip «S8».
4. **Ориентация** на странице (уточнение закона для студии): segmented control Книжная/Альбомная в панели «Страницы»,
   пишет `studio_documents.orientation` через `PATCH` (не template). Read-only badge если документ из шаблона — ок.
5. Блоков на листе **нет** — пустой лист с фоном по умолчанию.

### Шаг 4 — навигация

Пункт меню «Студия документов» → `/studio` в `nav-categories.ts`. Роуты в `app.routes.ts` (static children для
`collectPageRoutePaths`). Capability: использовать существующий doc-constructor capability или `document:read` —
проверить в `registry.controller`/RBAC и не придумывать новое право.

### Шаг 5 — документация, тесты, evidence

1. `docs/pages/document-studio.page.md` — секция NX shell; `kp-workspace-geometry.md` — одна строка про ориентацию на странице студии.
2. Spec: сервис data-access; spec: геометрия листа (unit: вычисление размеров A4 portrait/landscape).
3. Браузер: скриншоты portrait + landscape, open vs collapsed panel, `_geometry.json` с **stage rect** (не null).
4. `docs/pages/PAGE-TZ-INDEX.md` — строка в конец.

## НЕ ДЕЛАТЬ

- Не рисовать/редактировать блоки, autosave, типографику — S3/S4.
- Не открывать публичный `@kppdf/ui/canvas` без исправления геометрии внутри shell.
- Не трогать реестры (кроме чтения навигационных паттернов).

## КРИТЕРИИ ПРИЁМКИ

1. `/studio` и `/studio/:id` работают end-to-end с реальным API.
2. Альбомный лист сохраняет A4 ratio (w/h ≈ 1.414 ±0.01).
3. Панель 480px, лист не двигается при open/close (числа в evidence).
4. Клик по листу сворачивает панель.
5. Integrity + archive + gates зелёные (nx tsc/test/lint; architecture known_limitation если 3 старых).

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser
```

## Финализация

`tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S2-SHELL.done.md` + ARCHIVE_MARKER, progress, _NOW, FIC.
