# TZ-NX-PO-SWEEP-03: studio — закрытие Свойств по клику снаружи (не только лист A4)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE #02 (желательно вместе/сразу после; те же studio files)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio` editor  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.ts` (+ html если нужно) ;  
specs `studio-workspace-chrome.spec.ts` / editor outside-click spec

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `onSheetClick()` — collapse+deselect только с листа; PO: клик в пустоту приложения (вне A4) панель не закрывает
- **Key Constraints:** не закрывать при клике в Свойства / в выделенный блок на холсте / в chrome-rail кнопки секций (toggle уже есть)
- **Planned Deliverable:** outside-click dismiss для open properties (и аналогично open flyout panel)
- **Validation Path:** unit/spec + nx build

**Проверено:** `onSheetClick` → `panelCollapsed.set(true)` + `selectedId.set(null)` только с `sheetClick` листа.

---

## РЕШЕНИЕ (PO)

Закрывать панель Свойств (collapse), если клик **не** внутри:
1. правой панели свойств / открытого flyout body;
2. выделенного блока на A4 (таблица/текст с которым работают);
3. кнопок правого chrome-rail, которые управляют панелью (чтобы не двойной toggle).

Клик в «пустом» chrome, крошках (если не navigate), фоне вокруг листа, левом пустом пространстве приложения — **закрывает** свойства.  
Поведение как у `onSheetClick`: `panelCollapsed=true`, сброс `selectedId` (единый dismiss).

## ЧТО ДЕЛАТЬ

1. Document/host `pointerdown` или `click` capture, когда `!panelCollapsed()` и `activeSection==='properties'` (или любая открытая правая секция — prefer: любая `!panelCollapsed()`, чтобы layers/data тоже dismiss снаружи — **минимум properties**; если дешево — все flyout sections).
2. Ignore targets внутри `[data-test=…]` / классов панели, rail, selected block.
3. Не ломать: dblclick open props (#02); dirty confirms; dialogs поверх студии.
4. Spec: open properties → click outside host → collapsed; click inside panel → stays open; click selected table → stays (selection kept, panel can stay closed after #02 single-click).

## НЕ ИЗМЕНЯТЬ

A4 geometry; BE; product dialogs.

## КРИТЕРИИ ПРИЁМКИ

1. Свойства открыты → клик в пустоту UI вне панели и вне выбранного блока → панель закрыта.  
2. Клик внутри Свойств / по выбранной таблице → не закрывает из-за outside-handler.  
3. Клик по пустому A4 по-прежнему работает (можно оставить `onSheetClick` или свести к одному dismiss).  
4. Specs + build green.
