# TZ-PRODUCTION-STUDIO-A — Production Studio Chrome contract

**ROLE:** docs / architect-executor (не FE feature)  
**LAYER:** 2 (docs)  
**STATUS:** DONE (archived 2026-08-15)  
**ARCHIVE:** `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-A.done.md`  
**DEPENDENCIES:** `docs/audits/2026-08-15-production-studio-plan-review.md`; `tasks/_backlog/WAVE-PRODUCTION-STUDIO-CHROME.md`  
**PAGES:** `/production`; `/work-types`  
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`; `docs/pages/work-types.page.md`

## One-liner исполнителю (исторический, Wave A)

`Прочитай GEMINI.md + tasks/TZ-PRODUCTION-STUDIO-A-spec.md + docs/audits/2026-08-15-production-studio-plan-review.md. Только docs: спека studio, page/readiness, park 308–310 markers. Product-код запрещён.`

## One-liner дальше (Wave B+, не часть A)

`Выполни tasks/_backlog/PROMPT-PRODUCTION-STUDIO-CONTINUOUS.md целиком. Resume по docs/agent-checklists/WAVE-PRODUCTION-STUDIO-CHROME.md. Цель 98–99. Deploy не трогать.`


## Scope

Только документация, TZ и checklist для Wave A. Не начинать Wave B и не менять product-код.

## Conflict keys

Только docs/tasks:

- `docs/ux/production-gantt-studio-spec.md`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/work-types.page.md`
- `docs/SECTION-READINESS.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `tasks/_park/TZ-PRODUCTION-308-cockpit-polish-nav.md`
- `tasks/_park/TZ-PRODUCTION-309-safe-estimate-order-days.md`
- `tasks/_park/TZ-PRODUCTION-310-gantt-a11y-visual.md`
- checklist + progress/closeout files

## Hard boundary

НЕ ИЗМЕНЯТЬ:

- весь `frontend/` и `backend/`;
- `ProductionCockpitPage`, facade/context/blocks;
- `gantt-bar.model`;
- `WorkType.days`, estimate math, API и data model;
- любые тесты product-кода.

## Frozen shell — вставить в SoT дословно

```text
PiGroupWorkspace (Цех: Гант | Виды работ)   ← только section chrome
└─ production-studio-body (local, overflow:hidden; relative)
   ├─ left icon-rail 48px: Заказы · Фильтры · Обновить
   ├─ center: Gantt only, flex:1, min-width:0
   └─ right icon-rail 48px: Карточка · Сегодня · Масштаб
      flyouts = absolute overlay; один за раз; центр не сжимается
```

## Deliverables

1. Создать `docs/ux/production-gantt-studio-spec.md` по структуре `docs/ux/kp-create-studio-spec.md`.
2. Синхронизировать page docs и readiness с фактом: **Wave A spec, текущий код пока docked**.
3. В `work-types.page.md` закрепить IA: **Цех**, не «Каталог».
4. В park 308–310 добавить `BLOCKED BY: WAVE-PRODUCTION-STUDIO-CHROME (после C/D visual PASS)` и `ABSORBED: не запускать поверх docked w-56 layout`; для 309 сохранить отдельную будущую волну write/order-level days.
5. Добавить STUDIO-A в `PAGE-TZ-INDEX.md`.

## Frozen filter grouping

- **Заказы:** список заказов, поиск по заказам, выбор заказа и `Все активные`/select-all.
- **Фильтры:** `active-only`, приоритет, даты и `Сброс фильтров`.

## SoT spec must contain

- `FROZEN`: shell, запреты, data invariants и отсутствие факта производства;
- словарь UI ↔ code: Заказы → orders flyout, Фильтры → context filters, Карточка → inspector, Масштаб → day/week/fit;
- Desktop `>=1280`: `48px | flex:1 | 48px`, absolute flyout, no center resize;
- mapping v1 старых toolbar controls → rail/flyout;
- a11y: Russian aria labels, `aria-expanded`, `aria-controls`, Escape, backdrop, focus return, keyboard activation;
- geometry gate: `getBoundingClientRect()` на 1920px light/dark;
- explicit out: 304–307, 309 writes, drag, shared StudioRail;
- success: PO visual 98–99 для estimate-only, production fact out.

## Acceptance

- SoT spec существует и содержит frozen shell, mapping, geometry gate и explicit out.
- Page docs и `SECTION-READINESS.md` честно говорят: spec готова, код ещё docked, READY не заявлен.
- 308–310 явно blocked/absorbed и не выглядят как задачи для немедленного запуска.
- `git diff` Wave A содержит только docs/tasks/checklist.
- После READY — STOP: не начинать B без отдельного PO PASS спецификации.

## Gates

- `git diff --check`
- проверка изменённых путей: нет `frontend/**/*.ts|html|css`, `backend/**`;
- сверка всех ссылок на новую spec и TZ;
- checklist заполнен фактическими изменениями.
