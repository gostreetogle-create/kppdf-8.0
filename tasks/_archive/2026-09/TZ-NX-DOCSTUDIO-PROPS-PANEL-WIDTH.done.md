# TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH: шире свойства таблицы (~×2.5)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md` ; `kp-workspace-geometry.md` (не ломать A4)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.css` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-shell.component.ts` (если class/host) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. Увеличить `--kp-panel-w` с `340px` до **~820px** (PO: ×2–2.5). Если глобальный widen ломает другие props (текст) — scoped: шире только когда selected block = table (class на shell/host).
2. Лист A4 **не** reflow при open/close (canon).
3. «Строки таблицы» — без горизонтального скролла на 5–6 видимых колонок при новой ширине (или приемлемый min).
4. WAVE row 01.

## НЕ

- Column unlock / photo / qty logic

## AC

1. Props flyout ≈ 800–850px при таблице (или global если scoped слишком дорого и text props ок).
2. A4 geometry не прыгает.
3. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T19:05:00Z — see docs/agent-checklists/TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH.md for SHA
