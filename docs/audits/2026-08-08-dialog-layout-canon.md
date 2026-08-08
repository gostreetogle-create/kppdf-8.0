# Аудит / канон диалогов (Paper & Ink)

**Дата:** 2026-08-08  
**Триггер PO:** QuickCreate S/M/L узкий → L уходит в высоту; зоопарк разных окон.  
**База:** `docs/DIALOG-COOKBOOK.md` + `PiDialogComponent` width tiers.

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
| **B quick** | form | S→**md**, M→**lg**, L→**xl** (+ 2-col body M/L) | QuickCreate S/M/L |
| **C editor** | content | maxWidth min(1120px, …) | Full product/module/material/role |
| **D wide** | content | min(1400px, …) только table-template и явные исключения | Редко |

Новых ad-hoc `width: 360px` / самодельный Overlay — **запрет** (cookbook).

---

## 3. QuickCreate (P0 fix)

Факт: `SIZE_TO_WIDTH = S:sm M:md L:lg` + opener `width:'md'`.  
Стало:

- S → md (~480–560)  
- M → lg (~640–720) + grid 2 col если полей ≥4  
- L → xl (~800) или `maxWidth: min(920px, 100vw-2rem)` + grid 2 col  
- body: `max-h-[min(70vh,…)] overflow-auto`; footer sticky  
- Визуально: не узкий небоскрёб

---

## 4. Successor

**TZ-UX-DIALOG-302** — cookbook + QuickCreate layout + короткий audit grep outliers.  
Полный рефак всех form-dialog под C — волнами, не одним коммитом (known_limitation).
