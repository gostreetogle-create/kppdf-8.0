# TZ-PRODUCTION-339: Gantt — крупные ▸/▾ + явные рамки групп заказов

STATUS: READY  
РОЛЬ АГЕНТА: local executor (GEMINI.md + kppdf-executor-loop)  
ЗАВИСИМОСТИ: none (можно параллельно с TZ-PRODUCTION-338 — разные conflict keys)  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts

Проверено: `gantt-bars.component.ts` chevron `text-[10px]` + `.gantt-expand-btn` без рамки; `.gantt-order-expanded` только слабый wash + `inset 3px` left — при 2–3 раскрытых заказах блоки сливаются (PO screenshot 2026-08-16); PO-CANON: плотная студия, клики однозначны.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Стрелки ▸/▾ в колонке expand: **10px**, `text-muted-foreground` — PO не видит открыто/закрыто.
2. Раскрытые заказы отличаются слабо (лёгкий фон + тонкий left accent). Между соседними раскрытыми группами **нет** жирной горизонтальной рамки / блока — визуально одна «куча».
3. Meta-active (`.gantt-order-active`) уже с inset 2px — сильнее tree-expanded; не ломать иерархию: meta ≥ group frame > child rows.

## ЧТО ДЕЛАТЬ

1. **Chevron крупнее и контрастнее (order + work expand):**
   - Размер глифа ≥ **14–16px** (не 10px); hit-area колонки ≥ **36px** (сейчас ~30px).
   - Цвет ближе к ink (не почти невидимый muted); `aria-expanded` уже есть — сохранить.
   - Открыто ▾ / закрыто ▸ по-прежнему; при желании лёгкий `font-weight` / opacity на expanded — без смены иконок на SVG, если моно-глиф читаем.
   - То же для child work-expand (деталь работы).

2. **Группа заказа как отдельный блок (когда tree expanded):**
   - Summary + все child-строки одного `orderId` (и order-meta strip, если видна) визуально в **одной рамке**:
     - outer: inset/box-shadow **≥2px** по периметру **блока**, или top+bottom **2px** границы на первой/последней строке группы + боковые;
     - между двумя соседними раскрытыми заказами — явный зазор **или** двойная граница (не тонкая hairline как сейчас).
   - Свёрнутый заказ: можно оставить спокойнее (одна строка), но chevron всё равно крупный.
   - Light **и** dark theme читаемы (токены paper/ink/rule).
   - Не трогать цвета полос работ (зелёный/фиолетовый) — только chrome строк/лейблов/timeline rows того же order.

3. **Реализация:** CSS-классы на label+timeline row (уже есть `gantt-order-expanded` / `data-expanded-order`). При необходимости класс на первой/последней строке группы (`gantt-order-group-start` / `-end`) из существующего tree walk — без смены estimate/PATCH логики.

4. **Тесты:** обновить/добавить в `gantt-bars.component.spec.ts`:
   - chevron span не `text-[10px]` (или assert class size);
   - при двух expanded orders — у строк есть group-frame markers / классы start-end;
   - expand/collapse и `orderLabelClick` / chevron separation (320) не сломаны.

5. Gates: FE tsc + focused jest `gantt-bars`. Deploy запрещён.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (template + styles + минимальная разметка классов)
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- опционально 1 абзац в `docs/pages/production-cockpit.page.md` про визуал групп

## НЕ ИЗМЕНЯТЬ

- Facade / hydrate / estimate math / PATCH / filters / cascade write-path
- Worker-view grouping logic (GANTT-401) — только не ухудшить читаемость, если те же стили касаются worker summary
- Backend, Desktop, deploy

## КРИТЕРИИ ПРИЁМКИ

1. На светлой теме стрелка ▸/▾ с первого взгляда читается открыто vs закрыто (размер ≥14px, контраст к фону).
2. При ≥2 одновременно раскрытых заказах группы **визуально отделены** жирной рамкой/границами блока (не сливаются в один список).
3. Dark theme: рамка и chevron читаемы.
4. Поведение expand/meta/cascade без регрессий (существующие spec PASS).
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS  
6. `cd frontend && pnpm test -- gantt-bars.component` (или эквивалент) PASS  
7. Archive + PAGE-TZ-INDEX; deploy нет.

known_limitation: perf hydrate = TZ-PRODUCTION-338 (отдельно); полная «карточка» с тенью как Material — не цель, достаточно цеховой плотной рамки.

## Промпт исполнителю

```text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-339-gantt-expand-group-frames.md.
PO: стрелки слишком мелкие; раскрытые заказы сливаются — нужны жирные рамки групп.
CLAIM → chevron ≥14–16px + hit ≥36px → group frame для expanded order (light/dark) → jest gantt-bars → archive.
Не трогать estimate/PATCH/facade. Deploy запрещён. Параллельно с 338 OK (разные keys).
```
