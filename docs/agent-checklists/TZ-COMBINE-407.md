# TZ-COMBINE-407 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/` (не создавался — resume-поток, claim в _NOW)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T17:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] Прочитал PO-CANON, GIT-POLICY, COUPLING-MAP §2/§2b, design-combine.page.md, WAVE-FREEBUFF-COMBINE-MODULES.md, TZ-COMBINE-407-module-dnd-ghost.md
- [x] Нет чужого CLAIM на `frontend/src/app/pages/dashboard/dashboard.page.ts`, `orders.service.ts` (DASHBOARD-401 трогает только `dashboard-stats.page.ts` + home widgets)
- [x] item-card/DnD логику не ломал — только расширил expand+module

## Acceptance

- [x] Expand изделия → модули (BOM top-level через ProductModulesService.list(productId))
- [x] DnD модуля по колонкам → PATCH `/orders/:id/lines/:lineId/modules/:moduleId/lane`
- [x] Ghost на родителе: серый «Модуль в: {колонка}» если модуль уехал вперёд от эффективной полосы линии
- [x] Материалы не карточки (только модули BOM top-level)
- [x] `lane=shipped` при DnD модуля → RU toast (клиентская защита; сервер уже 400 из 406)
- [x] Карточка линии следует эффективной полосе = min(moduleLanes) (rollup из 406)
- [x] FE tsc (app+spec) PASS + dashboard.page/orders.service jest PASS

## Integrity slot

- [x] Тип: module (FE Комбайн: expand + DnD + ghost)
- [x] page.md / PAGE-TZ-INDEX — N/A (не менял поведение канваса, только карточки)
- [x] COUPLING-MAP — не трогал (SoT по полосам уже в §2b из 406)
- [x] Чужой WIP не в коммите (DASHBOARD-401 dashboard-stats, production/**, photos/**, data/**)
- [x] Deploy/wipe/seed — запрещены, не выполнялись

## Gates (факт)

- `tsc -p tsconfig.app.json --noEmit` — PASS
- `tsc -p tsconfig.spec.json --noEmit` — PASS
- jest `dashboard.page | orders.service` — PASS (3 suites / 35 tests, +6 новых: effectiveLane min, card follows min, divergedModules, dropModule PATCH, lazy expand, patchModuleLane URL/body)

## Executor report

- `orders.service.ts`: `ModuleLane` + `Order.moduleLanes?` + `patchModuleLane(orderId, lineId, moduleId, lane)` (silent PATCH).
- `dashboard.page.ts`: `LANE_ORDER`/`LANE_TITLE`, `lineEffectiveLane` (min по moduleLanes, иначе boardLane), `moduleLaneOf`, `divergedModules` (ghost), `isExpanded/toggleExpand/moduleRows/moduleDrag`, `dropModule` (shipped → RU toast, иначе PATCH + replaceOrder). Карточки строятся через `lineEffectiveLane`, поэтому линия следует min.
- Материалы не рендерятся как карточки — только top-level модули BOM.

## Closeout

- [x] archive + lock + progress + `_NOW` обновлены
- [ ] Status = DONE (после Cursor PASS)
- closed_at: 2026-08-16T17:40:00+03:00
