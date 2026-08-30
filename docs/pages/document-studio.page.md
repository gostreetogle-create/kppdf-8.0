# Типографика блоков (D1)

`TemplateBlock.style` — единый источник гарнитуры, размера, цвета, выравнивания и межстрочного интервала для шаблонов и studio-документов. При сохранении inline `font-family`, `font-size` и `color` удаляются; bold/italic/underline, ссылки, списки и токены `{{...}}` сохраняются.

Белый список шрифтов: **Times New Roman**, **Arial**, **Calibri**. Рендер подключает metric-compatible файлы Tinos, Liberation Sans и Carlito через `@font-face` из `backend/src/modules/template-block/assets/fonts`, поэтому headless Chromium использует те же гарнитуры, а не системную подстановку.

# Страница: Документ-студия (`DocumentStudio*`)

**Краткое описание:** универсальное рабочее место для **создания и правки экземпляров документов** (не только КП): editable A4-центр, chrome-rails, overlay-панели, слои, таблицы с данными ERP, multipage, save-as-template. **Одна страница редактора** — без navigate на texts/tables/builder.

> **SoT.** Статус: **Waves 0–19 DONE** (2026-08-29).  
> ADR: [`../architecture/document-studio.md`](../architecture/document-studio.md)  
> Программа: [`../../tasks/WAVE-DOC-STUDIO.md`](../../tasks/WAVE-DOC-STUDIO.md)

## NX Studio S2 shell

`/studio` показывает список документов через `PiStudioDocumentsService`, а `/studio/:id` — редактор с A4-листом в видимой рамке (border/shadow у `.kp-ws-sheet`, `sheetHost=false`). Лист **по центру stage** (книжная — центр; альбомная — центр по ширине, чуть выше по высоте), масштаб = max fit в viewport при сохранении ratio 210/297 или 297/210 (`container-type: size` + `min(cqw,cqh*ratio)`). Canvas заполняет лист белым; на stage **все видимые слои** текущей страницы (z-index снизу вверх); **активный слой** — единственный редактируемый (drag/resize/текст). Текстовые блоки — прозрачный фон. Глаз в панели слоёв персистит `isActive` через PATCH блока. Панель страниц — overlay 480px; стрелки prev/next ≥32×32px, метка «Стр. N / M». Ориентация меняется через PATCH документа и сохраняет A4 ratio для альбомного листа (~1.414). Клик по листу сворачивает панель, PDF/архив отключены до S8. Геометрия и открытая/свёрнутая панель не меняют rect листа; числовое evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S2-SHELL/_geometry.json`.

Панель **Свойства** — категории (Слой / Контент / Типографика / Геометрия / Действия), русские типы; fallback `propertiesBlock = selected ?? activeLayer`. Панель **Слои** — плитки без opacity на неактивных; кнопка «Свойства» на плитке.


## NX Studio S7-0 (WIP closeout, 2026-08-30)

- **Canvas compositing:** studioCanvasBlocks() — all visible layers on the current page (isActive !== false), sorted by z-index; only the **active** layer is interactively editable (drag/resize/table cells).
- **Layers rail:** eye toggles PATCH isActive; lock toggles PATCH locked; reorder via drag updates z-index.
- **Properties (right):** tabs by block type — **no geometry readout** in panel (position/size on canvas only). Text via pi-studio-text-properties (rich-text toolbar, block-level align left/center/right on canvas, library pick/save). Table via pi-studio-table-properties (	ableTransparentBackground default opaque; row colors + save template).
- **Canvas text render:** innerHTML with block-level 	extAlign, 
ontSizePt, color from TemplateBlock.style.
- **Shell:** overlay panel --kp-panel-w: 340px; A4 sheet centered on stage (see studio-workspace-shell.component.css).
- **data-test:** studio-text-properties, studio-table-transparent-bg, studio-align-center (and siblings).

## Routes

| Route | Роль |
|-------|------|
| `/doc-constructor/studio` | список: **+ Новый**, **Из шаблона**, **Дублировать** |
| `/doc-constructor/studio/:id` | редактор (single-page law) |

`pageKey`: `doc-studio`.

## Rails (actual)

| Rail | Содержимое |
|------|------------|
| L Элементы | + текст / таблица / фото |
| L Слои | z-order, lock, page filter, +/- страницы |
| L Шаблон | save-as-template (name + keep bindings + docTypeId) |
| L Данные | issuer org, counterparty, **КП/заказ** (live ERP) |

**NX `/studio` (2026-08):** L rail «Данные» wired (org read-only + context PATCH counterpartyId/quotationId/orderId). L rail «Шаблон»: save-as-template via `StudioSaveAsTemplateDialogComponent` (name + keep bindings); requires `docTypeId` on document. Table tier-L / text parity → S7-3+.
| R Свойства | layer title, text/table/image props, full-page image, delete (no geometry panel) |
| R Таблица (tier-L) | manual + ERP live rows → `putDataSet` |

Ribbon: **Редактор | Просмотр** · **PDF** · **В архив** · нумерация страниц.

## API

| Endpoint | Status |
|----------|--------|
| CRUD + blocks + data-sets + preview + pdf + finalize | yes |
| `POST …/from-template` | yes |
| `POST …/:id/duplicate` | yes |
| `POST …/:id/save-as-template` | yes (needs `docTypeId`) |
| **+ Новый → Пустой A4** → finalize | yes (sentinel template «Пустой A4», TZ-DOC-STUDIO-2004) |

## Known limitations

- No Ctrl+Z (ADR § Not in MVP).
- `template_blocks` cutover cleanup (studio-only parent write) — successor wave 20.

## Related

- [`document-studio-data-anchors.md`](../architecture/document-studio-data-anchors.md)
- [`kp-workspace-geometry.md`](./kp-workspace-geometry.md)
