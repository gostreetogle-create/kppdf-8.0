# Backlog: Гант / календарь цеха

**Статус:** 🔜 READY_WHEN_DEPS (не active). Спека детализирована в
`docs/compose/plans/2026-08-02-shop-customer-lifecycle.md` §2 S5 + TZ
PRODUCTION-302…307 в `tasks/_backlog/`.

**Un-park только после:** TZ-SALES-301, TZ-ORDERS-301, TZ-CORE-301 (snapshots),
TZ-PRODUCTION-301, People/WorkTypes связаны (WORKERS-302 / WORKTYPES-*).

Scope (когда PO снимет park / поднимет PRODUCTION-303+):
- Диаграмма по модулям заказа и видам работ (`WorkType.days` first)
- Раскидка на людей → календарь
- Stuck-alarm + daily check-in
- Auto-flow work-type chain

Не начинать как mono-GANT-файл — исполнять цепочку PRODUCTION-302→307.
