# TZ-NX-PO-SWEEP-05 checklist — studio table Photo.frame + insert controls

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ + audit прочитаны

### Preflight Check Output
- **Context read:** `studio-data-resolver.ts` (`renderPhotoCellHtml` hardcoded contain 72×48; `resolveCatalogPhotoUrls` selected только `storageUrl`; `fetchLiveRows`/`resolveDataSets` pipeline; `injectTableContent`), `photo.schema.ts` (`Photo.frame: {fit,posX,posY}` — уже точный shape для FE `PiPhotoFrame`), `pi-photo-frame-editor.component.ts` (`photoFrameStyle`/`normalizePhotoFrame` — готовый reuse), `studio-blocks-canvas.component.ts` (photo `<img>` hardcoded `object-fit:contain;max-height:28px`), `studio-editor.page.ts` (`applyLiveRowsFromDataSet` → `block.settings.liveRows`), `studio-multipage.utils.ts` (второй `renderStudioTableHtml` call site — PDF pagination)
- **Key Constraints:** не второй pan-редактор в таблице (só reuse РАМКА из карточки); cell остаётся string URL (TZ Pref) — frame идёт параллельным lookup, не меняет `liveRows` shape; canvas+PDF parity обязательна
- **Planned Deliverable:** BE `resolveCatalogPhotoUrls` также резолвит `frame`; `fetchLiveRows`/`resolveDataSets` возвращают `photoFrames` (keyed by URL) рядом с `rows`; `renderStudioTableHtml`/`renderPhotoCellHtml` применяют frame+block override вместо hardcoded contain; FE `applyLiveRowsFromDataSet` копирует `photoFrames` → `block.settings.livePhotoFrames`; canvas `photoCellStyle()` combines frame+block override через `[ngStyle]`; Свойства таблицы — секция «Фото в ячейке» (fit override + max height), persisted в `block.settings.tablePhotoDisplay`
- **Validation Path:** backend jest (`studio-data-resolver.spec.ts`, `studio-multipage.utils.spec.ts`) + FE specs (canvas, table-defaults, table-properties) + `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] Изделие с файлом на диске + photoIds → `<img>`, не «Нет фото» (не менял этот путь — уже работал; подтверждено существующими S48/TABLE-PHOTO-SMOKE тестами, всё ещё зелёные)
- [x] Изменение РАМКИ (fit/position) отражается в ячейке — canvas И PDF/preview path (общий `resolveDataSets` → `photoFrames`)
- [x] В Свойствах таблицы — контроль fit (+ max height); переживает save (через `tablePhotoDisplay` block.settings, тот же persistence путь, что transparent background)
- [x] Specs FE+BE green; `nx build kppdf-web` last

## Integrity slot

- [x] Тип изменения: page (studio) + backend module (studio-document, document-render)
- [x] FIC / page.md / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (внутренний рендер-контракт таблицы, не новый route/permission)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `backend: pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `backend: pnpm test` (full suite) → PASS 1315/1315 (133 suites)
- `frontend: nx test kppdf-web` (full suite) → PASS 825/832 (7 skipped), +2 новых (studio-table-defaults)
- `frontend: nx build kppdf-web` → PASS (новый non-blocking warning: initial bundle budget +3.11kB over 500kB — from `@kppdf/ui/photo` reuse in canvas; pre-existing NG8102/gantt-bars warnings unrelated)

## Executor report

- **BE `studio-data-resolver.ts`:** `resolveCatalogPhotoUrls` теперь `.select('storageUrl frame')` и возвращает `Map<id, {url, frame}>` (было `Map<id,string>`). `fetchLiveRows` возвращает `{rows, photoFrames?}` вместо голого `string[][]` (quotation/order branches — без photoFrames, вне scope TZ); catalog branch собирает `photoFrames: Record<url, PhotoFrame>`. `resolveDataSets` прокидывает `photoFrames` в resolved entry. `renderPhotoCellHtml`/`renderStudioTableHtml` получили `photoOptions?: {frames, fit, maxHeightPx}` — inline style теперь `object-fit`/`object-position` из frame (block `fit` override приоритетнее frame.fit; pan/posX/posY всегда из frame — панорама остаётся catalog-owned). `injectTableContent` читает `entry.photoFrames` + новый `tablePhotoDisplayFromBlock(block)` helper.
- **BE `studio-multipage.utils.ts`** (PDF пагинация — второй call site `renderStudioTableHtml`): тот же `photoOptions` проброшен через новый `readDataSetEntry` + локальный `tablePhotoDisplayFromBlock` — full canvas/PDF parity, не только single-page path.
- **FE `studio-editor.page.ts`:** `applyLiveRowsFromDataSet` копирует `dataSet.photoFrames` → `block.settings.livePhotoFrames` (rows и frames обновляются вместе, один источник).
- **FE `studio-blocks-canvas.component.ts`:** photo `<img>` — `[ngStyle]="photoCellStyle(block, cell)"`, reuse `photoFrameStyle`/`normalizePhotoFrame` из `@kppdf/ui/photo` (тот же helper, что карточка «РАМКА»). Убран hardcoded `.table-preview__photo { object-fit:contain; max-height:28px }` — теперь только layout CSS (`max-width:100%`), fit/position/height полностью из `photoCellStyle()`.
- **FE `studio-table-defaults.ts`:** новый `studioTablePhotoDisplay(block)` (+ `STUDIO_TABLE_PHOTO_MAX_HEIGHT_*` константы) — тот же паттерн, что `studioTableTransparentBackground`.
- **FE `studio-table-properties.component.ts`:** новая секция «Фото в ячейке» (гейт `hasPhotoColumn()`) — select «Вписывание» (Как в РАМКЕ / contain / cover) + number «Макс. высота, px» (16–96), persist через существующий `settingsChange.emit({tablePhotoDisplay:{...}})` → `patchTableSettingsForBlock` (тот же shallow-merge путь, что transparent-bg toggle). Hint RU: «Кадр и панорама — в карточке изделия (кнопка «Рамка»)».
- **Не строил** второй pan/crop редактор в таблице — только fit override + maxHeight, пан/крап остаются в карточке каталога (РАМКА), как решил PO.
- **Инцидент:** см. `WAVE-NX-PO-SWEEP-2026-09-12.md`/memory `pitfall-backtick-in-styles-template-literal` — не повторялся в этой стадии (проверил все новые CSS-комментарии на отсутствие backtick).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
