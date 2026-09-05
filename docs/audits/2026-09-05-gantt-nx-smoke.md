# Audit — NX Gantt: живой smoke + приёмка волны (TZ-NX-GANTT-G7-SMOKE-DOCS)

**Дата:** 2026-09-05
**Волна:** `PROMPT-FREEBUFF-NX-GANTT-*` (G0–G7) · WAVE: `docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md`
**HEAD на момент smoke:** `26b87bc3` (полный: `26b87bc31d1257cc8947629a9b55d53b4874a7ff`) — G0–G6 закоммичены и запушены до прогона.
**Стенд:** NX dev server `http://localhost:4201` (Vite, `pnpm exec nx serve`), backend + Mongo локальные, сид: `admin` / demo (`fill-demo-button`), заказы `DEMO-LOCAL` (boot-seed `LocalDemoSeed`).

---

## 1. Результат: PASS

Все 4 AC живого smoke из TZ выполнены в браузере (управление через preview-инструменты: клики по реальному DOM + синтетический pointer-drag):

| # | AC | Результат | Evidence |
|---|----|-----------|----------|
| 1 | Меню Гант → страница | **PASS** | Логин → шапка → клик «Производство» → `/production` отрисовался; чип секции активен; 8 активных заказов в rail, сводная строка «Заказ», легенда видов работ (Резка металла / Сварка / Покраска / Гибочные работы), шкала День с тиками `DD.MM`+ПН…ВС, красный today-маркер, легенда внизу |
| 2 | Раскрытие дерева | **PASS** | Заказ З-2026-009 ▸ изделие «Калитка «Классик» ×4» ▸ модули «Рама калитки» + «Заполнение калитки» ▸ виды работ. Каскад последователен: Рама 17.07–22.07 → Заполнение 23.07–15.08. Полосы WT с цветом, `×4`, исполнителями по ФИО («исполн.: Иванов Сергей Петрович, …»), днями |
| 3 | Сдвиг plannedDate без залипания scroll (G4) | **PASS** | Pointer-drag тела сводной З-2026-002 на +3 дня: aria-label `2026-07-28→2026-08-14` → `2026-07-31→2026-08-17` (оптимистично + round-trip `PATCH /api/orders/… → 200`); `scrollLeft` 0→0; начало диапазона не изменилось (16.07) — вьюпорт не «прилип» |
| 4 | Workers toggle | **PASS** | «По рабочим» → 4 группы worker-summary («Рабочий: Иванов Сергей Петрович · … · сводно 50д» и др., tinted dominant WT); обратный «По заказам» — состояние дерева сохранилось (11 expand-кнопок, раскрытый заказ остался раскрыт) |

Дополнительно проверено: «Прокрутить к сегодня» (`scrollLeft` → 1722, центр на today), «Вместить сроки» + «Месяц» (fit-width, 3 месячных тика июл/авг/сен над полным диапазоном полос), возврат «День» (58 дневных тиков 16.07–11.09). Консоль браузера: **0 ошибок**. Сеть: hydrate как задумано — `/api/orders`, `/api/workers?limit=100&isActive=true`, `/api/work-types`, `products/bulk` (9 id), `modules/bulk` (19 id), затем точечный `PATCH` заказа.

Скриншот раскрытого дерева приложен в транскрипте волны; DOM-пруфы — data-test (`gantt-row-product:*`, `gantt-row-module:*`, WT-бары с aria-label, `gantt-tick-YYYY-MM-DD`, `gantt-today-marker`).

## 2. Jest evidence (HEAD `26b87bc3`)

`pnpm exec jest apps/kppdf-web` (NX workspace):

- **69 suites: 68 passed, 1 failed; 444 tests: 435 passed, 2 failed, 7 skipped.**
- Единственный failed-сьют — `registries.catalog.spec.ts` (2 теста): **pre-existing**, сломан чужой волной в коммите `59bcf499` (registries vat-rate/formulas без обновления спеки), вне conflict keys волны; уже помечен в архиве G3. Продакшн-код Ганта не затрагивает.
- Спеки волны: production page / bars / rail / workers-view / write-path / model / facade / data-access — все зелёные (в т.ч. 62 production-теста G3, write-path G5, workers G6).

## 3. Gates финального HEAD

- `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (прогон G6; изменений кода после него нет).
- `nx build kppdf-web` — PASS (прогон G6; бюджет `anyComponentStyle` выровнен с legacy 8/16kB в G3).
- Финальный ре-прогон `nx build` на closeout-коммите выполнен в G7 (AC3) — см. архив `TZ-NX-GANTT-G7-SMOKE-DOCS.done.md`.

## 4. Честные ограничения smoke

- Роли проверены только на admin; director/manager-ветки `canEditOrder` покрыты jest-спеками, не живым кликом.
- Drag выполнен синтетическим pointer-events (реальная мышь недоступна из окружения); семантика pointerdown/move/up та же, что в jest-спеках write-path.
- Смоук не покрывает: фильтры rail (Заказчик/приоритет/даты), order-meta strip, resize правого края (estimate-days), «Изменить в справочнике», toasts ошибок — всё это покрыто jest-спеками соответствующих TZ и доступно PO живьём.

## 5. Docs-обновления G7

- `docs/pages/production-cockpit.page.md` → NX SoT: статус `NX PORT DONE`, карта NX-файлов по G, route/DI-примечания, known limitations дополнены L1–L6 и NX-gaps (photo-URL не портирован; pre-existing registries-фак).
- `docs/pages/PAGE-TZ-INDEX.md` — строка `/production` NX-порта.
- WAVE-чеклист закрыт (все [x]), `tasks/_active/` пуст.
