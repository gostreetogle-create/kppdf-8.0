# TZ-NX-PO-SWEEP-02: studio table — клик = select/resize, свойства по dblclick / rail

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE `docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md` #02  
**LAYER:** 3 · **SIZE:** S–M  
**PAGES:** `/studio` editor  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (wire `tableEditRequest` / dblclick) ;  
связанные studio chrome/specs если подсветка rail properties

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `studio-blocks-canvas.component.ts` `selectBlock` (S45: table click → `tableEditRequest`); `studio-editor.page.ts` `tableEditRequest → openLayerProperties`; `PO-CANON.md` «Таблица на холсте: один клик = выделение + drag/resize»
- **Key Constraints:** канон PO > S45 auto-open props; правая панель перекрывает SE resize handle
- **Planned Deliverable:** single click select only; open props via dblclick + chrome/rail (как сейчас layers gear)
- **Validation Path:** specs canvas + editor; nx build last

**Проверено:** PO скрин — панель «СВОЙСТВА: ТАБЛИЦА» поверх правого нижнего угла таблицы. Предложение PO = канон.

---

## ИСХОДНОЕ СОСТОЯНИЕ

Клик по таблице сразу открывает правые Свойства (`tableEditRequest` → `openLayerProperties`) → панель перекрывает handle масштаба.

## РЕШЕНИЕ (зафиксировано PO)

| Жест | Поведение |
|------|-----------|
| 1 клик по таблице на A4 | Только select + drag/resize handles. **Не** открывать properties panel. |
| Двойной клик по таблице | Открыть Свойства (как text dblclick → properties). |
| Кнопка Свойства / layers «открыть свойства» в chrome-rail | Как сейчас — открывает панель. При select таблицы кнопка свойств визуально активна/подсвечена (жёлтый active), hint что можно открыть. |

Строки / «+ Строка» / структура колонок — **только** в Свойствах (канон без изменений).

## ЧТО ДЕЛАТЬ

1. `selectBlock`: для `table` — **убрать** `tableEditRequest.emit` на single click; оставить `selected.emit`.
2. Добавить dblclick на table block → emit `tableEditRequest` (или отдельный output; wire как text: editor `openLayerProperties`).
3. Подсветка chrome: при `selectedId` table и collapsed/не-properties — active state на кнопку Свойства (reuse existing rail active styles).
4. Specs: single click table → selected, **не** open properties; dblclick → open properties; resize handle доступен при selected + panel collapsed.
5. Обновить комментарий S45 в коде: auto-open на click отменён PO-CANON / PO-sweep-02.

## НЕ ИЗМЕНЯТЬ

A4 geometry law (`kp-workspace-geometry`); inline cell edit на холсте; `/production`; BE.

## КРИТЕРИИ ПРИЁМКИ

1. Клик таблица → select + SE handle доступен без открытой props-панели.  
2. Dblclick / rail Свойства → панель открывается.  
3. Specs + `nx build kppdf-web` green.
