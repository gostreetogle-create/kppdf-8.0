# TZ-NX-DOCSTUDIO-TABLE-LINE-QTY: количество в строках таблицы

**РОЛЬ АГЕНТА:** Executor (frontend-nx + BE resolver при необходимости) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE` DONE  
**LAYER:** 2–3 · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. Колонка qty редактируема в «Строки таблицы» (и/или inline policy по канону S45 — props, не A4 admin).
2. Catalog pick: default `1`, но значение **сохраняется** в data-set строки и переживает refresh, если оператор изменил.
3. Не требовать qty как поле Product в Mongo — это свойство **строки таблицы**.
4. WAVE row 03.

## НЕ

- Складские резервы / Order qty coupling

## AC

1. Добавил изделие → qty=1 видно; меняю на 3 → после save/reload 3.
2. Итог/цена*qty если уже считается — не ломать без нужды (если total есть — обновить согласованно или документировать).
3. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T20:20:00Z — see docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-LINE-QTY.md for SHA
