# TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL: клик = выделить; правки строк только в Свойствах

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** WAVE-DOCSTUDIO-CHROME-IA C4 DONE; **S46 DONE** (liveRows после drag — иначе правки UX маскируют data-bug)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (только: select table → open properties; wire row events) ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts` ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/substitution-token.extension.ts` (если CSS токена) ;  
`docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** PO screenshot+dictation 2026-09-06; `studio-blocks-canvas` L132–197 `table-edit`; `openLayerProperties` L944; S44 archive; prior S45 draft
- **Key Constraints:** PO override жёсткий — **запрет** inline row-edit на холсте; S44 не откатывать; не параллелить с C3/C4
- **Planned Deliverable:** холст = print-like table + selection frame; row chrome в Свойствах; авто-открытие Свойств; gap после ERP-токена
- **Validation Path:** jest canvas/table-props/rich-text + nx build; visual AC

**Проверено:** при `tableRowSource === 'manual'` и select холст сейчас **заменяет** preview на `.table-edit` (Вкл / inputs / × / + Строка) — это ломает drag (pointer на inputs) и стыдно на демо. `onSelect` **не** открывает Свойства (в отличие от `openLayerProperties`).

---

## ИСХОДНОЕ (PO)

1. Один клик по таблице → «админ-грид» поверх листа (галочка, поля, крестик, + Строка) → мешает перемещению/масштабу.
2. Крестик/поля выглядят мёртвыми или бессмысленными на холсте.
3. Пустые data-таблицы = одни заголовки (связь с S46 hydrate).
4. Текст: `{{counterparty.name}}Новый текст` слитно.

## Целевой UX (канон, не опция)

| Жест | Поведение |
|------|-----------|
| 1 клик по таблице | Только **выделение** (selection-frame + resize). Preview остаётся document-like `<table>`. **Никакого** `.table-edit` на A4. |
| Тот же клик | Автоматически открыть правую панель **Свойства** (`openLayerProperties` / эквивалент), active rail «Свойства» с характерным active-состоянием (существующий `bg-ink` / active tool — не выдумывать жёлтый, если в shell уже есть active). |
| В Свойствах (блок таблицы) | Секция **«Строки»**: Вкл, ячейки, удалить, **+ Строка** (перенос UI с холста). Колонки/источник/шаблон — как сейчас. |
| Drag / resize | Работают с первого pointerdown на рамке/пустой области таблицы, без войны с input. |

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Убрать row-edit с холста
- Удалить ветку `@if (... manual) { .table-edit }` из canvas; **всегда** `table-preview` (+ selection-frame/resize при select).
- Пустой tbody: одна placeholder-строка **или** подпись «Нет строк — добавьте в Свойствах / Данные», не голый thead на пол-листа.
- Catalog/quotation/order: без изменений S44 (не пустой edit).

### ШАГ 2 — Строки в `studio-table-properties`
- Перенести логику add/remove/toggle/cell edit (emit вверх → `patchTableRows` / disabled indices как сейчас с canvas).
- Заголовок секции: «Строки таблицы» (RU). Показывать для `manual`; для live-source — read-only список или hint «строки из Данные/КП» (не дублировать write-path).

### ШАГ 3 — Select → Свойства
- Клик по таблице на холсте: `onSelect` + открыть properties panel (reuse `openLayerProperties`).
- Не открывать text contenteditable на table click.
- Active tool «Свойства» визуально активен (существующий паттерн shell).

### ШАГ 4 — ERP-токен spacing (из старого S45)
- Гарантированный зазор chip↔следующий текст (один механизм, без двойных пробелов).

### ШАГ 5 — Tests + page.md
- Spec: selected manual table → `studio-table-rows-editor` **отсутствует** на canvas; есть в properties.
- Spec: select table → properties section open.
- Spec: token + type → visible gap.
- page.md: холст print-like; правки строк только в Свойствах.

## НЕ ИЗМЕНЯТЬ
Backend preview pipeline; D55/D56 IA; C1–C4 chrome (уже DONE к моменту claim); warehouse; Gantt; полный redesign Data panel (бриф дизайнеру).

## КРИТЕРИИ ПРИЁМКИ

1. Один клик → таблица выделена, **без** Вкл/+Строка на листе; drag/resize с первого жеста.
2. Справа открыты Свойства этой таблицы; строки редактируются там; +Строка работает.
3. Пустая таблица понятна (не «обломок» из одних th).
4. Токен + текст не слипаются.
5. S44 регрессов нет.
6. Gates: focused tests + `nx build kppdf-web`.

CLAIM: `agent_id: freebuff` после archive C4.
