# Аудит: Create КП preview wave-2 (scroll / empty table / draftLines)

**Дата:** 2026-08-09  
**Route:** `/proposals/create`  
**После:** TZ-SALES-319/321 DONE (фон + layout OK; visual residual)  
**Вердикт:** 2 дефекта presentation + 1 **by-design gap** (не баг клика).  
**Канон:** сверка двух research-вердиктов + file:line в коде (2026-08-09).

---

## 1. VERDICT (коротко)

| # | Симптом | Статус | Что делать |
|---|---------|--------|------------|
| A | H/V scrollbar на листе | Presentation bug | **TZ-SALES-323** — FE scale + build CSS page box |
| B | Empty table = «Нет данных» | By-design bad UX | **TZ-SALES-324** — skeleton `<table>` |
| C | Товары из рейла не на бланке | By-design gap | **TZ-SALES-325** — live bind с column-contract |
| — | Фон/layout после 321 | **OK** | Не reopen 321 |
| — | Shell 317 rails/overlay | **OK / FROZEN** | Не трогать |
| — | Клик «добавить изделие» | **OK** | Пишет `draftLines`; лист не wired |

**Не мешать в эту волну:** 322 snapshot/stale · 320 print · Builder drag · DOC-344 · deploy.

---

## 2. Симптомы → evidence → root cause

### A — H/V scrollbar

**Evidence:**

- `proposal-create-template-center.component.ts` 53–60 — iframe 794×1123, `transform: scale`, sandbox.
- Там же ~82–102 / 161–169 — stage/sheet `overflow:hidden`, scale = `min(sheetW/794, sheetH/1123)`.
- `proposal-create.page.ts` 187–204 — studio/body/center `overflow:hidden`.
- `document-template.service.ts` 1064–1070 — `body { width:…mm; min-height:…mm; padding:20px; box-sizing:border-box }` + `.doc-content { min-height:297mm }`.

**Root cause:**

Outer contain-scale и `overflow:hidden` на sheet **уже есть**, но scrollbar живёт **внутри iframe document**.  
`body` с padding + child `.doc-content` с отдельным `min-height:297mm` → фактическая высота > одного A4 page box → нативный scroll iframe.  
Родительский `overflow:hidden` только clips внешний sheet, не чинит inner document.

**H-scroll:** нельзя объявлять доказанным только по CSS. Измерить  
`iframe.contentDocument.documentElement/body.scrollWidth|scrollHeight` vs `clientWidth|clientHeight`.  
Вероятные причины: padding, table `width:100%`, mm↔px rounding — не только shell.

### B — empty table

**Evidence:**

- `table-template.service.ts` 107–111 — `sampleRows=[]` → `<p class="pi-empty-state">Нет данных</p>`.
- `document-template.service.ts` 592–605 — `resolveTableBlock` → только `TableTemplateService.preview()`.
- Там же 1133–1134 — fallback тоже `<p>Нет данных</p>`.
- `block-renderer.component.ts` 214–244 — Builder уже рисует `<table><thead>` + empty row, но одна colspan-ячейка «Нет данных» (лучше paragraph, не идеальный blank).

**Root cause:**

Create SoT = `build → preview()`. Empty заменяет **всю** таблицу paragraph’ом → теряется геометрия бланка.  
Это плохой UX by design, не «случайно сломалось».

### C — товары не на бланке

**Evidence:**

- `proposal-create.page.ts` 304–305 — `draftLines` in-memory; comment: «not painted on the sheet (319)».
- Там же 327 — `build(id, { organizationId? } | {})` — **без** lines/productIds.
- Там же ~441 — add изделия только дописывает signal (+ estimate в inspector).
- `build-document.dto.ts` 19–37 — только entity ids, массива lines нет.
- `resolveTableBlock` 604 — `preview(sampleRows)` без commercial rows.

**Root cause:**

Live `draftLines → table rows` **не реализован**. Gap между rail UX и fill бланка, не поломка клика.

---

## 3. Что НЕ сломано

- Shell SALES-317 FROZEN (`kp-create-studio-spec.md` §0): A4 center, rails, overlay.
- Фон + absolute layout после 321 — PO подтвердил OK.
- `draftLines` пишутся и уходят в inspector estimate — rail работает.

---

## 4. PRODUCT DECISIONS (канон)

| Вопрос | Варианты | Рекомендация | Почему |
|--------|----------|--------------|--------|
| Где чинить scroll? | Только FE / только CSS / оба | **Оба → 323** | Outer contain есть; scrollbar = iframe document |
| Empty table | Paragraph / skeleton / скрыть блок | **Skeleton → 324** | Бланк ≠ scary empty; скрытие ломает лист |
| Builder «Нет данных» в td | Сейчас / later | **Later (known_limit)** | Create SoT = `preview()`; Builder вне волны |
| draftLines на листе | Только rail / bind сразу / после Save | **323+324, затем 325** | Без key-contract = угадайка |
| Какую table биндить? | Все live / labels / явная роль | **Явная роль + fallback 1 live** | Не заливать условия/расчёты; `BlockSource` = только kind/refId/mode |
| Колонки | label / key aliases / UI mapper | **key aliases в 325** | Без нового UI; labels на RU плавают |
| Blank vs fill | Только persist / live preview | **Live preview OK; snapshot отдельно** | Не ломать 317; не путать с 322 |
| Organization vs клиент | — | **Organization = бланк/issuer; Counterparty = клиент** | Spec; не подставлять клиента автоматически |

### UX market notes (для цеха ~10)

В зрелых quote-студиях (PandaDoc pricing table, Salesforce CPQ line items, HubSpot quote modules): scale-to-fit без document-scroll; empty = headers + blank row; line items live **или** явная «корзина до Save».  
Молчаливый rail без отражения на листе — антипаттерн.  
Для kppdf сейчас: сначала бланк+fit, bind — отдельным контрактом, не монолит.

### Риски

1. `preview()` empty затронет admin `/doc-constructor/tables` — skeleton везде, не «только Create».
2. Ужим scale без фикса body/`doc-content` → scrollbar останется внутри iframe.
3. Bind без DTO / whitelist = scope creep; `draftLines.unitPrice` ≠ authoritative server price.
4. Путаница с 322 snapshot: live preview ≠ сохранённый бланк.
5. Builder vs Create empty UX разойдутся, пока Builder known_limit.
6. `TableTemplate.dataSource` = registry source — **не** молча = line-items role.
7. Ownership: `document-template.service.ts` в CONFLICT 323/324/325 — не затирать чужой WIP; DOC-344 = builder FE (keys другие), но `_active` DOC-344 проверить перед claim.

---

## 5. Successor map

| ID | Scope | Deps |
|----|--------|------|
| **TZ-SALES-323** | A4 fit: no sheet/iframe scrollbars (FE + build HTML) | после 321 |
| **TZ-SALES-324** | Empty table = skeleton thead + 1 empty row | после/∥ 323 (keys: table-template hot) |
| **TZ-SALES-325** | `previewLines` → назначенная line-items table | после 323+324 |
| TZ-SALES-322 | PARK stale refresh / snapshot | out of wave |
| TZ-SALES-320 | PARK print | out of wave |

**Пути TZ:**

- `tasks/_backlog/kp-vitrine/TZ-SALES-323-create-kp-a4-fit-no-scroll.md`
- `tasks/_backlog/kp-vitrine/TZ-SALES-324-empty-table-skeleton-blank.md`
- `tasks/_backlog/kp-vitrine/TZ-SALES-325-draftlines-table-bind.md`

**Промпты:** `PROMPT-SALES-323.md` · `PROMPT-SALES-324.md` · `PROMPT-SALES-325.md` · continuous: `PROMPT-WAVE2-CONTINUOUS.md`

---

## 6. OUT OF SCOPE

Snapshot/lock 322 · print 320 · Persist Quotation / templateSnapshot · auto-update КП on template save · Builder drag/resize / BuilderCanvas · DOC-344 builder keys · DOC-TABLES-305 · auto Counterparty · fuzzy mapping по RU labels · deploy · любое изменение FROZEN 317 shell.
