# TZ-NX-DEALS-D5-INSET-AUDIT checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DEALS-D5-INSET-AUDIT.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T02:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на deals-ключи
- [x] TZ / канон прочитаны: `tasks/_ready/nx-deals/TZ-NX-DEALS-D5-INSET-AUDIT.md`, `docs/paper-and-ink.md` § Panel & expand inset
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DEALS-D5-INSET-AUDIT.md` на месте

## Audit evidence (`docs/paper-and-ink.md` § Panel & expand inset)

Проверены все панели/списки D1–D4 (`grep hairline` по каждому touched-файлу):

| Файл | Панель | Inset |
|------|--------|-------|
| `order-hub-tray.component.ts` | 4 группы (`order-group-order/execution/logistics/documents`) | `p-4` (16px) на каждой section |
| `order-hub-tray.component.ts` | под-блоки внутри «Исполнение»/«Логистика» (Снабжение/Производство/Готовность/Склад/Отгрузка) | `border-t hairline pt-3 mt-3` (12px = `--space-3`, divider-паттерн — не «текст к рамке», наследует горизонтальный inset родительской section `p-4`) |
| `order-hub-tray.component.ts` | «Состав заказа» disclosure panel | `border-t hairline pt-3 mt-3` (12px) |
| `orders-list.page.ts` / `contracts-list.page.ts` / `counterparties-list.page.ts` | `pi-table-surface` строки | `px-4 py-3` (16px/12px) — тот же паттерн, что был в списке заказов до D1/D2, не менялся |
| `proposals-list.page.ts` | `proposal-family-list` (pre-existing, не мой код) | **без** `hairline` вообще — условие TZ п.3 («если получит hairline») не сработало, чинить нечего |
| `counterparty-form-dialog.component.ts` | диалог create/edit | `variant="content"` → `PiDialogComponent.bodyClass` даёт `px-6 py-6` (24px) — из shared-компонента, не кастомный inset |
| `deals-group-chips.ts` disabled chip | TOC pill | `px-2 py-0.5` — тот же паттерн, что у всех остальных TOC/section chips в приложении (это pill-атом, не «панель» из таблицы канона) |

**Вывод:** нарушений «текст вплотную к hairline» не найдено — все панели D1–D4 уже строились с `p-4`/`px-4 py-3`/`pt-3` inset по канону в момент их создания (не постфактум-фикс). D5 подтверждает, фиксов не потребовалось.

## Acceptance

- [x] Нет текста вплотную к hairline на затронутых панелях (аудит выше)
- [x] Build PASS

## Integrity slot

- [x] Тип изменения: docs-only аудит (без изменений кода)
- [x] FIC N/A — нет нового page/permission/module
- [x] page.md: без изменений (аудит не нашёл расхождений, требующих правки orders.page.md/proposals.page.md/contracts.page.md/counterparties.page.md сверх того, что уже задокументировано в D1–D4)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Baseline PASS (D1–D4 чистые)
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test kppdf-web → PASS (79 suites, 494 passed, 7 skipped, 0 failed — полный прогон)
pnpm exec nx test data-access → PASS (88/88 — полный прогон)
pnpm exec nx test features → PASS (12/12 — полный прогон)
pnpm exec nx build kppdf-web → PASS, exit 0 (только 2 pre-existing warning вне зоны Deals: studio-blocks-canvas nullish-coalescing, gantt-bars CSS budget)
```

## Executor report

- Docs-only TZ — аудит существующих D1–D4 панелей против `docs/paper-and-ink.md` § Panel & expand inset. Не найдено ни одного нарушения (весь код уже писался с оглядкой на канон в момент создания в D1–D4), поэтому продуктовых правок нет — только эта evidence-таблица в checklist/archive, как и просил AC п.5 («Spec или screenshot note в done.md»).
- Единственная явно прописанная в TZ проверка с условием («proposal-family-list» — «если получит hairline») не сработала: у блока нет `hairline` класса вовсе (pre-existing из более ранней волны, не в зоне D1–D4) — зафиксировано как N/A, а не проигнорировано.
- Полный прогон тестов (`nx test` без `--testPathPattern`) для `kppdf-web`/`data-access`/`features` — зелёный, финальная проверка перед закрытием всей волны WAVE-NX-DEALS.

## Review handoff

- [x] READY FOR REVIEW — WAVE-NX-DEALS (последний TZ волны)
- Archive без отдельного Cursor Verdict (Executor-only wave)

## Closeout

- archive сразу вслед за отчётом — WAVE-NX-DEALS полностью DONE (D1–D5).
