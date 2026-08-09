# Аудит: Create КП preview wave-2 (scroll / empty table / draftLines)

**Дата:** 2026-08-09  
**Route:** `/proposals/create`  
**После:** TZ-SALES-319/321 DONE (фон + layout OK; visual residual)  
**Вердикт:** 2 дефекта presentation + 1 **by-design gap** (не баг клика).

---

## 1. Симптомы PO → evidence → root cause

| # | Симптом | Evidence (file:line) | Root cause |
|---|---------|----------------------|------------|
| A | H/V scrollbar на листе после 321 | FE scale: `proposal-create-template-center.component.ts` 53–60, 120–129, 161–169 (iframe 794×1123 + `transform: scale`, sheet `overflow:hidden`). Studio outer: `proposal-create.page.ts` 187–204 (`overflow:hidden` на studio/body/center). **Внутри HTML:** `document-template.service.ts` 1064–1070 — `body { width:210mm; min-height:297mm; padding:20px; box-sizing:border-box }` + `.doc-content { min-height:297mm }` | Outer contain есть, но **scrollbars живут внутри iframe**: `doc-content` min-height 297mm не умещается в content-box body (297mm − 40px padding) → документ выше intrinsic frame → нативные scrollbars iframe. Горизонталь: тот же padding / table 100% / mm↔px. Scale capped `Math.min(..., 1)` не лечит внутренний overflow. |
| B | «Нет данных» plain text вместо бланка таблицы | `table-template.service.ts` 107–111: `sampleRows.length === 0` → `<p class="pi-empty-state">Нет данных</p>`. Create path: `document-template.service.ts` 592–605 `resolveTableBlock` → `preview(tableTemplateId)` only. Fallback: `renderHtml` case `table` 1133–1134 → `literalContent \|\| '<p>Нет данных</p>'`. Builder иначе: `block-renderer.component.ts` 214–244 — **есть** `<table><thead>` + tbody empty → одна ячейка «Нет данных» colspan | SoT Create = **build → preview()**. Empty = paragraph, не skeleton. Builder ближе к Excel, но тоже пугает текстом в ячейке. |
| C | Товары из рейла не на бланке | `proposal-create.page.ts` 304–327: `draftLines` in-memory; `build(tpl._id, org ? { organizationId } : {})` — **без** lines/productIds. Comment 304: «not painted on the sheet (319)». DTO: `build-document.dto.ts` 19–36 — только entity ids, **нет** draft rows. `resolveTableBlock` 604 — только `TableTemplateService.preview` (sampleRows) | **By design gap** после 319/321, не broken click. Live bind не реализован. |

---

## 2. Что НЕ сломано

- Shell 317 FROZEN (rails/overlay/A4 center) — не трогать.
- Фон + absolute layout после 321 — PO OK.
- `draftLines` пишутся в signal и уходят в inspector estimate — rail работает.

---

## 3. PRODUCT DECISIONS

| Вопрос | Варианты | Рекомендация | Почему |
|--------|----------|--------------|--------|
| Scroll после 321 | Только FE scale / только CSS build / оба | **Оба (323)** | Outer contain уже есть; scrollbar = iframe document от padding+min-height |
| Empty table | Оставить «Нет данных» / skeleton thead+empty row / скрыть блок | **Skeleton blank (324)** | Бланк КП ≠ scary empty; скрытие ломает layout листа |
| Builder empty cell text | Менять сейчас / later | **Later (known_limit 324)** | Create path = `preview()`; builder уже table |
| draftLines на листе сейчас? | Только rail + copy / live bind сразу / bind после Save | **Сначала 323+324; затем live bind 325** | Без column-contract bind = угадайка; rail-only без copy = обман ожиданий PO |
| Контракт колонок | По label / по key aliases / UI mapper | **key aliases в 325** | Предсказуемо, без нового UI; labels на RU плавают |
| Граница blank vs fill | Fill в Create / только после persist | **Live preview fill OK; persist/snapshot отдельно** | Не ломает 317; не путать с 322 |

## 3a. Независимые UX notes (зрелый рынок)

1. PandaDoc / HubSpot Quote / CPQ-студии: scale-to-fit **без** document scroll; empty tables = headers + blank rows; line items почти всегда live в таблице документа *или* явная зона «Items» до Generate — молчаливый rail без отражения на листе = антипаттерн.
2. Для цеха ~10 чел. **сейчас**: skeleton + fit дают доверие к бланку; bind (325) — следующий тонкий слой с контрактом, не монолит.
3. Presentation blank (структура шаблона) vs commercial data fill — разные TZ; FROZEN shell 317 не трогать.

---

## 4. Риски (PO мог недосказать)

1. Правка `preview()` empty затронет admin `/doc-constructor/tables` preview и builder placeholder — нужно skeleton везде, не «только Create».
2. Ужим scale без фикса body/`doc-content` → scrollbar останется **внутри** iframe.
3. Live bind без Save/`quotationId` = новый ephemeral payload в `build` (DTO + whitelist) — scope creep.
4. Путаница с snapshot/322: live preview ≠ сохранённый бланк.
5. Builder empty cell «Нет данных» vs Create `<p>` — PO сравнивает экраны; выровнять ожидание blank cells.

---

## 5. Successor map

| ID | Scope |
|----|--------|
| **TZ-SALES-323** | A4 fit: no sheet/iframe scrollbars (FE + build HTML overflow/padding) |
| **TZ-SALES-324** | Empty table = skeleton `<table>` thead + 1 empty row |
| **TZ-SALES-325** | Optional live `draftLines` → table rows (явный column contract); deps 323+324 |
| TZ-SALES-322 | PARK stale refresh / snapshot — out of this wave |
| TZ-SALES-320 | PARK print |

---

## 6. OUT OF SCOPE

Snapshot/lock 322 · print 320 · builder drag · deploy · auto-update КП on template save · embed BuilderCanvas.
