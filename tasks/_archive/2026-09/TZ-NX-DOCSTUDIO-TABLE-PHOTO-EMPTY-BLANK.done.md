# TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK: пустая фото-ячейка без «Нет фото»

**РОЛЬ АГЕНТА:** Executor (FE canvas + BE render) — freebuff или claude  
**ЗАВИСИМОСТИ:** S48 / PHOTO-BROKEN (текст «Нет фото» был сознательным) — PO отменяет  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id` (+ PDF/preview parity)  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.ts` ;  
`backend/src/modules/studio-document/studio-data-resolver.spec.ts` ;  
`backend/src/modules/table-template/table-template.service.ts` ;  
`backend/src/modules/table-template/table-template.service.spec.ts` ;  
`backend/src/modules/document-template/document-template.assets.spec.ts` (если падает на «Нет фото») ;  
`docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Domain
PO: если фото нет / битое — **пустое место**, без надписи «Нет фото» и без мусора в ячейке.

### ЧТО ДЕЛАТЬ

1. FE canvas: убрать `<span class="table-preview__photo-empty">Нет фото</span>` — пустая ячейка / пустой photo slot; onerror img → clear src / hide img, без текста.
2. BE `renderPhotoCellHtml` / `table-template` HTML: вместо `<span class="pi-photo-empty">Нет фото</span>` → `''` (или `&nbsp;` только если без него ломается высота ряда — предпочесть пустую строку; высота от соседних ячеек/min-height колонки photo OK).
3. Specs: ожидания «Нет фото» → пусто / no such text in HTML.
4. page.md: одна строка канона.

### НЕ

- Ломать broken-img → не показывать broken-icon браузера (тихо пусто)
- Витрина каталога «Нет фото» на карточках (вне table cell) — не этот TZ, если отдельный copy
- WIDTH-BY-HEADER / TEXT-PROPS

### AC

1. Live table row without photo: photo cell visually blank; DOM/PDF HTML не содержит «Нет фото».
2. Row with valid photo: img as now.
3. Gates: focused FE+BE specs + `nx build kppdf-web`.

### Claim slot
```
agent_id: claude
claimed_at: 2026-09-14T08:15:11Z
branch: main
baseline_sha: e7c7298f
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 3, including live smoke — see checklist Gates section)
  - typecheck: PASS (nx build + backend tsc)
  - tests: PASS
  - lint: PASS (0 new errors/warnings, verified via git-stash -u A/B; backend lint 0 errors)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
