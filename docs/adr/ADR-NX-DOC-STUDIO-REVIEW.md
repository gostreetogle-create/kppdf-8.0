# ADR-NX-DOC-STUDIO-REVIEW — независимое ревью `nx-doc-studio.md`

> **Дата:** 2026-08-30 · **Режим:** analysis-only (код не менялся).  
> **Предмет:** `docs/architecture/nx-doc-studio.md` PLAN v1.  
> MCP `claude_code`: агенты недоступны — развилки закрыты прямой сверкой с кодом.

## ПОДТВЕРЖДАЮ

**§3 «берём как есть» (ядро backend)** — схемы и роуты существуют:
`document-template.schema.ts:42-82`, `template-block.schema.ts:132-183,164-183`,
`studio-document.schema.ts:19-64`, `table-template.schema.ts:69-147`,
`text-block.schema.ts:39-90`, `generated-document.schema.ts:23-45`,
`studio-document.controller.ts:83-120,231-259`, `registry.service.ts:153-277`,
`quotation-output.service.ts:57-87`. Контроллеры: `document-templates`,
`studio-documents`, `text-blocks`, `table-templates`, `doc-types`, `registry`,
`generated-documents` — все зарегистрированы.

**§3 частично готово, не «для любого типа документа»:**
- `quotation-items` / `order-items` live — `studio-data-resolver.ts:272-299`.
- `catalog-products` — **только в docs** (`document-studio-data-anchors.md:48`), в резолвере нет.
- `defaultSheetLayout` — на `document_templates` (`document-template.schema.ts:72-82`), **не** на `studio_documents`; `createFromTemplate` не копирует (`studio-document.service.ts:379-399`). Multipage studio — хардкод `DEFAULT_ROWS_FIRST/NEXT` (`studio-multipage.utils.ts:11-12`), не шаблон.
- Типографика/PDF: рендер `Times New Roman` (`document-render.service.ts:82`), padding 20px (`:231`) — план верно называет дыру, но **не** «поля страницы в Builder».

**§3 legacy FE-утверждения:** textarea в Studio — `studio-panel-properties.component.ts:29-37`; геометрия read-only — `:92-119`; Builder reuse canvas — `document-studio-editor.page.html:154`; KP shell/геометрия — `proposal-workspace.page.ts:192`, `proposal-workspace.store.ts:33`.

**§4 D4:** потребителей `DocumentTableType` вне модуля нет (grep TS: только `app.module.ts:250`, `document-table-type/**`, комментарий `table-template.schema.ts:12-15`). `documentTableTypeId` в продуктовом коде не найден.

**§5 overlay 480px / рельсы:** legacy Studio уже на `proposal-workspace-shell` (`document-studio-editor.page.html:16-28`); NX рельсы-заглушки — `tool-rail-definitions.ts:15-55`.

**§6 базовая цепочка:** S0→S2 shell, S6→S7 data, S4 требует D1, S8 reuse `studio-output.service.ts` — логично.

**§8:** puppeteer single-path, god-object, dual-read — подтверждено (`quotation-output.service.ts:39`, `template-block.service.ts:67-111`).

## ВОЗРАЖАЮ

| Пункт | Замена | Обоснование |
|-------|--------|-------------|
| **§4 D2** «поля в Builder UI» | D2 = **новые** `pageMargins` + синхронизация `.doc-content` padding в `document-render.service.ts:231`; Builder 207-229 = формат/ориентация, не поля | `builder-inspector.component.ts:207-229` — size/orientation; page margin controls отсутствуют |
| **§4 D1** гибрид `block.style` + inline HTML | **HTML-only** (TipTap → sanitize → PDF) **или** block.style = default run, inline только bold/italic/link без font-size/font-family | Два источника: `template-block.schema.ts` (нет `style`) vs `TemplateBlockColumn.fontSize` (`:111-112`); CSS: inline побеждает — PDF/экран разъедутся |
| **§4 D3** «только резолвер» | D3 + **маппинг Product→LineItem**, org-scope, **server-side sum/VAT** или явный `totals` dataSet; currency format в render | `studio-data-resolver.ts:10-13,63-84` — нет catalog; `renderStudioTableHtml` без `ColumnType`/`Intl` (`:104-135`); KP totals client-only (`proposal-workspace-draft.service.ts:1661-1672`) |
| **§5** «поля страницы» из Builder | Панель «Страницы» = **новый** UX; не reuse Builder margin-controls (это margin **блока**, `builder-inspector.component.ts:670-705`) | Именование вводит исполнителя в ошибку |
| **§6 S3→S4** textarea затем типографика | S3 = layout shell + **plain/rich-text stub**; **D1 schema до первого persist текста**; или S3 без content-edit | Иначе миграция content при S4 |
| **§6 S5** только D2 | S5 backend: D2 **+** `defaultSheetLayout` на `studio_documents` + copy from template | Иначе перенос строк ≠ KP/шаблон (`studio-multipage.utils.ts:65-74` vs `document-template.service.ts:814`) |

## РИСКИ (не в §8)

1. **KP Workspace ≠ StudioDocument** — КП пишет `Quotation` (`proposal-workspace-draft.service.ts`), не `studio_documents`; «позиции с пересчётом» из S7 не наследует KP-логику без явного моста.
2. **NX canvas vs закон геометрии** — `pi-canvas-page.component.ts:15-16` (`mx-auto my-4`), не flex-end 8px; S2 рискует FAIL чек-листа `kp-workspace-geometry.md:18-26`.
3. **Параллель legacy/NX** — один `studio-documents` API, 409 только при `expectedRevision`; второй клиент без revision → LWW на блоках (`studio-blocks-state.service.ts:601-616`).
4. **Orientation drift** — `studio_document.orientation` редактируем (`studio-document.schema.ts:25-26`), `sourceTemplateId` статичен; save-as-template пишет orientation обратно (`studio-document.service.ts:481`), исходный template не обновляется.
5. **Floating toolbar vs п.7 закона** — клик по тулбару может bubble на `sheetClick` → ложное сворачивание панели (проверить stopPropagation в S4).
6. **Dual-read cutover** — studio blocks всё ещё пишут `templateId` (`template-block.service.ts:205-207`); NX must use `createForStudioDocument`, не `document-templates/:id/blocks`.

## ПОРЯДОК (правки S0–S8)

1. **S0:** зафиксировать public `@kppdf/ui/canvas` contract под kp-ws geometry (не legacy `pi-canvas-page` margins).
2. **До S3:** backend-TZ **D1 schema** (поля без UI) — иначе переделка content.
3. **S2:** read-only load doc + revision display; опционально `schemaVersion: 2` / `editorSurface: 'nx'` (см. вопрос PO).
4. **S3+S4:** объединить content-model или S3 без textarea persist.
5. **S5:** D2 + `defaultSheetLayout` на studio doc (не только margins).
6. **S7:** D3 + totals/formatting backend-TZ **до** UI «пересчёт итогов».
7. **S8:** golden HTML tests typography+margins **до** PO demo PDF.

## ВОПРОСЫ PO

**A) Ownership ориентации на studio-странице**  
- **A:** `studio_documents.orientation` — единственный SoT экземпляра; template — только seed.  
- **B:** orientation read-only из `sourceTemplateId`, toggle только в Builder.  
- **Рекомендация:** A (соответствует §5 плана). **Цена B:** оператор не переключит альбом на живом КП без ухода в Builder.

**B) D4 — снос `document_table_types`**  
- **A:** удалить модуль + коллекцию (потребителей нет).  
- **B:** оставить как dead API до отдельной уборки.  
- **Рекомендация:** A в отдельной ops-TZ после S1 (реестр `table-templates` live). **Цена поспешного A:** сломанные внешние интеграции, если кто-то дергал CRUD вручную.

**C) Параллель legacy Studio + NX `/studio/:id`**  
- **A:** `editorSurface: 'nx'|'legacy'` на doc + redirect legacy→NX для новых.  
- **B:** общий API, без флага; kill-plan закрывает legacy одним днём.  
- **Рекомендация:** A с S2. **Цена B:** тихая порча блоков двумя редакторами до kill-plan.
