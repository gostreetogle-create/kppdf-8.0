# Аудит: Create КП preview ≠ builder (после TZ-SALES-319)

**Дата:** 2026-08-09  
**Вердикт Cursor:** **FAIL visual** на 319 — wiring `build()` есть, fidelity нет.  
**Скрин PO:** Create КП (broken bg + scroll + текст сверху) vs Builder (фон Task Manager + 4 блока на местах).

---

## 1. Три дефекта (как видит менеджер)

| # | Симптом | Корень |
|---|---------|--------|
| A | Фон — broken image | `<img src="/uploads/...">` внутри `sandbox=""` srcdoc; builder рисует тот же URL через CSS `background-image` на **родительской** странице (proxy `/uploads` → :3000). В iframe путь/origin легко ломается. |
| B | Скроллы H+V | iframe 100% листа, внутри HTML `body` = **210mm×297mm** без `transform: scale` → документ больше sheet → scroll. TZ-319 AC «contain» не выполнен. |
| C | Тексты/таблицы «уехали вверх», нет позиций | **Баг бэка в `build`:** `{ ...mongooseDocument, content }` **теряет `layout`**. |

Доказательство (Node, Mongoose Document spread):

```
spread keys: ['$__', '_doc']
spread.layout → undefined
toObject().layout → { x, y, width, height, ... }  // ок
```

В коде:

```593:593:backend/src/modules/document-template/document-template.service.ts
      return { ...block, content: html } as TemplateBlockDocument;
```

То же в `resolveBlockContent` (literal / field / text-block / binding).  
`blockLayoutStyle(undefined)` → `''` → класс без `block--positioned` → flow сверху.

Таблица всегда проходит `resolveTableBlock` → **всегда** теряет layout → отсюда «Нет sample rows…» прилипло к верху.

---

## 2. Почему builder выглядит иначе

| | Builder canvas | `POST …/build` → Create КП |
|--|----------------|----------------------------|
| Фон | CSS `url(/uploads/…)` в page DOM | `<img class="doc-bg">` в srcdoc |
| Позиции | FE читает `block.layout` с API | После spread layout = undefined |
| Таблица empty | «Нет данных» (block-renderer) | `TableTemplate.preview` → «Нет sample rows для preview…» |
| Scale | canvas paper fit | нет |

SoT для печати/КП = **build HTML**, но build сейчас **не** parity с canvas из‑за spread.

---

## 3. Что НЕ делать

- Не archive 319 как DONE visual.
- Не тащить весь BuilderCanvas в Create КП (тяжёлый edit surface).
- Не путать с snapshot/lock NOTE (после persist).

---

## 4. Fix pack → TZ-SALES-321

1. **BE:** при клонировании блока в resolve* — `block.toObject()` (или явный pick полей вкл. `layout`/`settings`/`source`/`type`/`columns`/`title`/`height`). Unit/e2e: build HTML содержит `position:absolute` + `left:`/% для блока с layout.  
2. **FE:** scale contain — без scrollbars на sheet (measure 210mm page vs sheet box → `transform: scale`; origin top-center).  
3. **FE:** надёжный `/uploads` в iframe: либо `sandbox="allow-same-origin"` (без `allow-scripts`), либо rewrite `/uploads` → absolute API origin (`API_BASE` / same as proxy target) перед srcdoc.  
4. **Опционально UX:** empty table в preview для Create КП — RU «Нет данных» (не sampleRows-англсообщение) — можно thin в том же TZ или known_limit.  
5. Visual PASS: тот же шаблон «4 блока» с фоном — Create КП ≈ builder Preview (позиции + фон, без scroll).

CONFLICT: proposal-create* + `document-template.service.ts` (+ test). 319 marker: FAIL → закрыть вместе с 321 или оставить open до PASS пары.
