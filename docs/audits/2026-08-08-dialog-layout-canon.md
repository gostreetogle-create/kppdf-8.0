# Аудит / канон диалогов (Paper & Ink)

**Дата:** 2026-08-08  
**Триггер PO:** QuickCreate S/M/L узкий → L уходит в высоту; зоопарк разных окон.  
**База:** `docs/DIALOG-COOKBOOK.md` + `PiDialogComponent` width tiers.  
**Шпаргалка:** `docs/pages/ui-dialog-canon.md` · **TZ:** TZ-UX-DIALOG-302.

---

## 1. Вердикт

| Проблема | Канон |
|----------|--------|
| Много «своих» ширин/футеров | Только `PiDialogService` + `<app-pi-dialog>` |
| QuickCreate L = `form`/`lg` (~640px) → длинный столбец | **Шире + 2 колонки полей** при M/L; высота с body scroll, не «на весь экран» без нужды |
| Цель формы | Панель **ближе к квадрату** по контенту: лучше добавить ширину, чем бесконечную высоту |
| Эталон FullEditor | `variant="content"` + `maxWidth: min(1120px, 100vw-2rem)` (product/material) |
| Эталон confirm | `alert` / `destructive` + `sm`/`md` |

---

## 2. Разрешённые виды (мало)

| Kind | variant | width / maxWidth | Когда |
|------|---------|------------------|--------|
| **A confirm** | alert / destructive | sm–md | Удалить? Да/нет |
| **B quick** | form | S→**md**, M→**lg**, L→**xl** (~920) (+ 2-col body M/L) | QuickCreate S/M/L |
| **C editor** | content | maxWidth min(1120px, …) | Full product/module/material/role |
| **D wide** | content | min(1400px, …) только table-template и явные исключения | Редко |

Новых ad-hoc `width: 360px` / самодельный Overlay — **запрет** (cookbook).

---

## 3. QuickCreate (P0 — TZ-UX-DIALOG-302)

Было: `SIZE_TO_WIDTH = S:sm M:md L:lg` + opener `width:'md'`.  
Стало:

- S → md (~480) · 1 col (если keys &lt; 4)
- M → lg (~640) + grid 2 col
- L → xl (~920 form bump) + grid 2 col
- body: `max-h-[min(70vh,…)] overflow-auto`; footer sticky (shell)
- openers products/modules: **без** фиксированного `width:'md'` — решает компонент

---

## 4. Outliers vs A–D (grep 2026-08-08)

Не рефакторить в этом TZ. Successors по строкам.

| Opener / shell | width / maxWidth | Kind сейчас | vs A–D | Successor? |
|----------------|------------------|-------------|--------|------------|
| QuickCreate (product/module) | S/M/L → md/lg/xl | **B** | OK после 302 | — |
| ProductFormDialog | content + min(1120px) | **C** | OK | — |
| MaterialFormDialog | content + min(1120px) | **C** | OK | — |
| ColorReferenceFormDialog | content + min(1120px) | **C** | OK | — |
| RoleFormDialog | form + maxWidth 1120 | **C**-ish | variant form vs content | soft: content |
| TableTemplateDialog | form + min(1400px) | **D** | OK (исключение) | — |
| products/modules FullEditor open | opener `width:'lg'` | shell C внутри | opener width ignored when maxWidth | optional cleanup |
| Order / Proposal / Contract / People / Org forms | opener `lg` | form mid | часто ближе к **C** | wave: content+1120 |
| WorkType / Category / Warehouse / StockMovement | opener `md` | simple form | OK-ish / B-lite | low |
| TextBlockCategoryForm | content-ish maxWidth 1120 | **C** | OK | — |
| StoragePutOnStock / Adjust / Pick | maxWidth 520–560 | mid form | OK for pickers | — |
| AlertDialog deletes | sm + destructive | **A** | OK | — |
| data-field-picker | content maxWidth 896 | mid-C | OK / clamp | — |
| product-bom picker / cost detail | content / xl | mid-C | OK | — |

**known_limitation:** полное выравнивание legacy form-dialogs (orders/proposals/contracts/people/org → kind C) — отдельными TZ, не 302.

---

## 5. Status

**TZ-UX-DIALOG-302** — cookbook + QuickCreate layout + outliers table (этот файл).
