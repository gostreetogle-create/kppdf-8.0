# TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE: фото в ячейке не «пустота»

**РОЛЬ АГЕНТА:** Executor (frontend-nx + BE) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE` DONE  
**LAYER:** 2–3 · **SIZE:** L  
**PAGES:** `/studio/:id` ; registries products/materials photos  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-data-resolver.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ

1. Воспроизвести путь: вид с колонкой photo → catalog lines → cell = `<img>` **или** «Нет фото», **никогда** полностью пустая td без empty-state.
2. Сверить ключи колонок шаблонов в БД/seed с `PHOTO_COLUMN_KEY_ALIASES` (в т.ч. «фото»).
3. Если product без `mainPhotoId`/`photoIds` — empty-state + короткий hint в props («Загрузите фото в карточке изделия»).
4. Не чинить catalog upload с нуля, если WAVE-PHOTOS DONE — только wire/smoke; если upload сломан evidence — минимальный fix conflict keys + note.
5. WAVE row 04.

## НЕ

- Новая photo storage architecture

## AC

1. Изделие **с** фото → thumbnail в колонке Фото.
2. Изделие **без** фото → «Нет фото», не blank.
3. Specs S48+ расширены; gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T21:15:00Z — SHA `7d904839` (main, pushed)
