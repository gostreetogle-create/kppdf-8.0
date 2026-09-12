# TZ-NX-PO-SWEEP-05: studio table — Photo.frame + контроль вставки фото в ячейке

**РОЛЬ АГЕНТА:** Executor (frontend-nx + тонкий BE render) — claude  
**ЗАВИСИМОСТИ:** WAVE #01 (PO re-check после save); audit `docs/audits/2026-09-12-studio-table-photo-frame.md`  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio` table on A4 + Свойства таблицы  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` (+ specs) ;  
`backend/src/modules/studio-document/studio-data-resolver.ts` (+ specs) — `renderPhotoCellHtml` / resolve URL+frame ;  
block settings schema для table photo display (если новое поле на block.settings) ;  
reuse `photoFrameStyle` / `PiPhotoFrame` из `@kppdf/ui` photo kit

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit 2026-09-12; S48 photo cells; P3 frame editor; `renderPhotoCellHtml` hardcoded contain 72×48; canvas `.table-preview__photo { object-fit: contain }`
- **Key Constraints:** A4 geometry; не дублировать полный frame-editor в таблице; orphan → «Нет фото» оставить
- **Planned Deliverable:** frame → cell style; props UI fit/size; canvas+PDF parity
- **Validation Path:** resolver + canvas + table-props specs; nx build; backend jest studio-data-resolver

**Проверено:** Photo.frame в каталоге есть; DocStudio table thumbs его не читают.

---

## РЕШЕНИЕ (PO + канон)

1. **Источник кадра** = `Photo.frame` из главного фото позиции каталога (редактор «РАМКА» в карточке). Студия **применяет** fit/position при рендере ячейки.  
2. В **Свойствах таблицы** — секция «Фото в ячейке»:
   - режим: `contain` | `cover` (default contain; может override frame.fit если задан block setting — зафиксируй в коде один приоритет: block display mode > frame.fit > contain);
   - max высота/ширина thumb в ячейке (разумные presets или number, без ломки layout);
   - короткий hint RU: «Кадр и панорама — в карточке изделия (кнопка Рамка)».
3. Не строить второй pan-редактор внутри таблицы.

## ЧТО ДЕЛАТЬ

### ШАГ 0 — Sanity (docs closeout)
Кратко в audit: подтвердить, что при живом `storageUrl` на диске ячейка даёт `<img>`, не «Нет фото». Если list/live не отдаёт URL при существующих файлах — починить resolve (в scope).

### ШАГ 1 — Resolve frame
`resolveCatalogPhotoUrls` (или соседний map): вместе с URL отдавать frame (или обогащать liveRows / отдельный side-channel). Canvas сейчас получает только URL string в cell — выбрать минимальный путь:
- **Pref:** cell остаётся URL; frame lookup по URL/photoId на canvas **или**
- live row photo cell = URL + data attributes / parallel `livePhotoFrames[row]` на block после fetch.

Минимальный рабочий вариант с AC — на твоё инженерное решение; PDF/preview BE обязан видеть frame тоже.

### ШАГ 2 — Render
- Canvas `.table-preview__photo`: `object-fit` / `object-position` из frame (+ block override).  
- BE `renderPhotoCellHtml`: те же стили (не только hardcoded contain).

### ШАГ 3 — UI Свойства
Секция + persistence в `block.settings` (например `tablePhotoDisplay: { fit, maxW, maxH }`). Specs на patch.

### ШАГ 4 — НЕ
Orphan wipe; product form (#01); vitrina (#04) кроме если shared helper frame style.

## КРИТЕРИИ ПРИЁМКИ

1. Изделие с файлом на диске + photoIds → в таблице `<img>`, не «Нет фото».  
2. Изменение РАМКИ в карточке (fit/position) отражается в ячейке таблицы (canvas и preview/PDF path).  
3. В Свойствах таблицы есть контроль fit (и размер); значения переживают save документа.  
4. Specs FE+BE green; `nx build kppdf-web` last.
