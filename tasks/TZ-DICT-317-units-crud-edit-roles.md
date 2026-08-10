═══════════════════════════════════════════════════════════════
TZ-DICT-317: Units CRUD — edit + roles + dead pencil
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer (+ thin BE roles if needed)
ЗАВИСИМОСТИ: Нет (первый в WAVE-DICT-DEMO)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/dictionaries/measurements-group.page.ts; frontend/src/app/pages/dictionaries/measurements-group.page.spec.ts; frontend/src/app/shared/services/units.service.ts; backend/src/modules/unit/unit.controller.ts; docs/pages/measurements-group.page.md; docs/agent-checklists/TZ-DICT-317.md

PAGES: /dictionaries/measurements
PAGE_DOCS: measurements-group.page.md

Проверено: measurements-group.page.ts (inline add; editLabel «Не применимо», нет (edit)); unit.controller.ts POST/PATCH/DELETE @Roles('admin') only; UpdateUnitDto exists.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. PO на демо: «единицы не могу добавить / не могу редактировать».
2. Add UI есть (`onAdd` → POST /units), но мутации **только admin** → manager видит кнопку и ловит 403 без понятного RU-текста про права.
3. Pencil в `pi-row-actions` видим (default showEdit), `editLabel="Не применимо (системный справочник)"`, **нет** `(edit)` → клик ничего не делает.
4. Backend PATCH `/units/:key` уже умеет partial update label/symbol/category/isActive.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Права записи
  - Расширить POST/PATCH/DELETE `@Roles('admin', 'manager')` (как у других справочников оформления).
  - GET без изменений.

ШАГ 2: Редактирование
  - Убрать ложный editLabel; либо `[showEdit]="true"` + `(edit)="onEdit(u)"`, либо dialog.
  - Edit: dialog или inline — предпочтительно **маленький dialog** (label, symbol, category; key read-only). System units: edit label/symbol ok если BE позволяет; delete остаётся blocked.
  - После успешного PATCH — toast RU + reload list.

ШАГ 3: Add UX
  - При 403/ошибке — явный toast (`extractErrorMessage`).
  - Если форма invalid — markAllAsTouched (уже есть) + не молчать.
  - Не ломать Group Chip chrome.

ШАГ 4: Тесты + page doc
  - Spec: edit вызывает update; showEdit/handler.
  - `docs/pages/measurements-group.page.md` — CRUD: add/edit/toggle/delete.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS выше.

НЕ ИЗМЕНЯТЬ:
- Seed system units keys (шт, м, …) как идентификаторы
- DICT-319/320 kinds
- deploy.ps1; чужие dirty WIP

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Admin и manager могут создать единицу с страницы Измерения.
2. Pencil открывает edit; PATCH сохраняет label/symbol/category; таблица обновляется.
3. Нет кнопки «редактировать» с подписью «Не применимо» без действия.
4. System unit: delete disabled; edit полей — по правилам BE (не ломать isSystem delete guard).
5. Gates:
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - Jest на затронутый measurements/units spec если есть
6. Checklist + Executor report (auto); archive → `_archive/2026-08/TZ-DICT-317.done.md`

known_limitation: drag-reorder units out of scope; dense inline-add layout ok.

Финализация: GEMINI.md + checklist; commit/push после DONE.
