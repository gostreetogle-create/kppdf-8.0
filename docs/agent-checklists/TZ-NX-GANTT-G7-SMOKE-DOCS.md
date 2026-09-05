# TZ-NX-GANTT-G7-SMOKE-DOCS checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G7-SMOKE-DOCS.done.md`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05 (claimed at G6 closeout, executed 2026-09-05)
- workspace: D:\kppdf-8.0
- conflict keys: `docs/pages/production-cockpit.page.md`; `docs/pages/PAGE-TZ-INDEX.md`; `docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md`; `docs/audits/2026-09-05-gantt-nx-smoke.md`; `_NOW.md`; `QUEUE-LIVE.md` — чужой активности не наблюдалось (в индексе были staged-файлы Claude S-волны — не тронуты, не закоммичены).

## Что сделано

1. **Живой smoke `:4201/production` — выполнен полностью** (в прошлой попытке был gated: не было кредов; найдены `admin` + `fill-demo-button`, логин успешен):
   - меню «Производство» → `/production` — рендер OK;
   - раскрытие дерева 4 уровня (заказ → изделие → модуль → виды работ, последовательный каскад);
   - drag plannedDate +3д (З-2026-002): PATCH 200, scroll 0→0, диапазон не перескочил (G4 фикс живьём);
   - workers toggle туда-обратно, состояние дерева сохранено;
   - доп: Сегодня/Fit/Месяц/День, консоль чистая. Evidence: `docs/audits/2026-09-05-gantt-nx-smoke.md` (HEAD `26b87bc3`).
2. `production-cockpit.page.md` → NX SoT: статус `NX PORT DONE`, карта NX-файлов по G, route/DI, L1–L6 + NX-gaps в limitations.
3. PAGE-TZ-INDEX строка `/production` — NX PORT DONE + ссылки на audit/smoke.
4. `_NOW.md`, `QUEUE-LIVE.md` — волна закрыта.
5. WAVE closeout: все [x].

## Gates

- Jest `apps/kppdf-web`: 68/69 suites, 435 tests green (fail — pre-existing `registries.catalog.spec`, чужой `59bcf499`, вне волны).
- `nx build kppdf-web` на финальном HEAD — PASS (ре-прогон в G7, см. архив).

## Отклонения/замечания

- Роли в live — только admin (director/manager покрыты jest).
- Drag — синтетический pointer-events (та же семантика, что в jest write-path спеках).
