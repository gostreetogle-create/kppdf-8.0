# TZ-PRODUCTION-348.done — Gantt toolbar + header + label expand + stronger nest

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T22:02:53+03:00
closed_by: composer-executor-348 (kppdf-executor-loop)
TZ: TZ-PRODUCTION-348
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE (chrome polish after 346/347)
DEP: TZ-PRODUCTION-342…347 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bars.component|production-scale-controls|production-cockpit.page" --no-coverage` — 76/76)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Blurb texts removed; dense Gantt toolbar: left «По заказам|По рабочим», right «День|Месяц|Вместить сроки».
- Chrome «Масштаб» tool + scale flyout removed; scale controls live in Gantt header.
- Label header always «Заказ» / «Рабочий»; no border-l box; `items-center`.
- Worker/product/module label click emits `toggleExpand` (same as ▸); order label still opens meta.
- Nest indent `GANTT_NEST_INDENT_PX=15`; stronger paper level washes (product/module/work).
- Legend, warnings, estimate math, 347 filter untouched.

## Critical files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-348-gantt-toolbar-header-expand.lock`

---

# Original TZ

# TZ-PRODUCTION-348: Gantt chrome — тулбар группировка/масштаб + заголовок + expand по клику + сильнее nest

STATUS: READY  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: 342–347 DONE  
LAYER: 3  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ; frontend/src/app/pages/production/blocks/production-scale-controls.component.ts ; frontend/src/app/pages/production/production-cockpit.page.ts ; frontend/src/app/pages/production/production-cockpit.page.spec.ts ; docs/pages/production-cockpit.page.md

Проверено: PO скрины 2026-08-16 — «План-оценка…» / подсказки бессмысленны; группировка и масштаб спрятаны в flyout «Масштаб»; рамка у `gantt-label-header` (`border-l` + box); «Рабочий · модуль» масло-масляное; клик по имени рабочего **не** раскрывает (`onLabelClick` early-return для worker/product/module); nest 346 слишком слабый (Каркас/Решётка/сварка сливаются).

## ЧТО ДЕЛАТЬ

### A — Тулбар вместо простыни текста
1. Убрать строки: «План-оценка по дням…», «календарные дни…», «масштаб: день…», «Разверните заказ…» (оставить только реальные alerts: today-fallback, readOnly, warnings).
2. Вместо них одна плотная полоса ~высоты breadcrumb:
   - **Слева:** сегмент «По заказам | По рабочим» (`data-test` gantt-group-orders/workers сохранить).
   - **Справа (ml-auto / justify-between):** «День | Месяц | Вместить сроки».
3. Убрать кнопку **Масштаб** из app-chrome-rail (syncChromeTools); flyout scale больше не нужен. `ProductionScaleControlsComponent` можно упростить/инлайнить в шапку gantt или переиспользовать как horizontal toolbar.
4. Легенда видов работ — оставить под тулбаром (компактно).

### B — Заголовок колонки
1. Текст всегда одно слово: **«Заказ»** или **«Рабочий»** (не «Рабочий · модуль» / «Заказ · изделие»).
2. Убрать визуальную «рамочку»: нет отдельного boxed cell — убрать `border-l hairline` у текста хедера; выровнять по центру вертикали ячейки (`items-center`, не `items-end` + pb-1), чистая линия `border-b` ряда как у дат.

### C — Раскрытие рабочих (и удобство cascade)
1. Клик по **лейблу** worker / product / module summary → тот же expand, что ▸ (`toggleExpand` с `expandKey`). Не только chevron.
2. Проверить ключ `worker:${label}` ↔ `expandedWorkerIds` (label = `orderNumber` на worker-summary). Spec: клик label раскрывает модули.
3. Chevron остаётся.

### D — Сильнее визуальный каскад (дожим 346)
1. Indent: **14–16px** на уровень (было 10) — product/module/work явно лесенкой.
2. Washes: заметнее разница product vs module vs work (всё ещё светлые paper-тона, не кислотные). Frames 339–343 не ломать.

### E — Gates
FE tsc + jest gantt-bars + cockpit (group tests move from flyout to toolbar). Deploy нет. page.md обновить chrome.

## НЕ ИЗМЕНЯТЬ

- Estimate math, 347 noise filter, BE, Desktop, hydrate

## КРИТЕРИИ

1. Нет простыни «План-оценка…» / zoom-hint / expand-hint в шапке.
2. Группировка слева, масштаб справа наверху; chrome «Масштаб» исчез.
3. Header «Заказ»/«Рабочий» без боковой рамки-коробки.
4. Клик по имени рабочего раскрывает модули.
5. Раскрытый заказ: изделие/модуль/WT визуально лесенка + разный wash.
6. Gates PASS; archive; push.
