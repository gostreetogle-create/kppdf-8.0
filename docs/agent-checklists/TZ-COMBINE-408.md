# TZ-COMBINE-408 checklist

> Status: **DONE** (archive TZ-COMBINE-408.done.md)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T17:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] Прочитал PO-CANON, GIT-POLICY, COUPLING-MAP §2/§2b, design-combine.page.md, WAVE-FREEBUFF-COMBINE-MODULES.md, TZ-COMBINE-408-shop-worktype-days-gate.md
- [x] 407 уже в `tasks/_archive/2026-08/TZ-COMBINE-407.done.md` (порядок волны соблюдён)
- [x] Нет чужого CLAIM на `backend/src/modules/order/**`

## Acceptance

- [x] Переход ЛИНИИ в `shop` → gate: изделие → модули → workType + days (override заказа или каталог `WorkType.days`)
- [x] Переход МОДУЛЯ в `shop` → gate по его workType + days
- [x] Иначе 400 RU (`В «Цех» можно отправить…`); FE уже показывает toast из тела ошибки (без правок FE)
- [x] Не-shop переходы gate не трогают
- [x] Auto-assign рабочих — НЕ (запрещено)
- [x] BE tsc PASS + order.service/controller jest PASS

## Integrity slot

- [x] Тип: module (backend order API, gate shop)
- [x] design-combine.page.md + COUPLING-MAP §2b обновлены (gate + RU-семантика)
- [x] Чужой WIP не в коммите (dashboard-stats, production/**, photos/**, data/**)
- [x] Deploy/wipe/seed — запрещены, не выполнялись

## Gates (факт)

- `npx tsc --noEmit` (backend) — PASS
- `npx jest src/modules/order --silent` — PASS (3 suites / 83 tests; +8 новых gate-кейсов)

## Executor report

- `order.service.ts`: инжект `Product`/`ProductModule`/`WorkType` моделей; `directModuleIds` (composition-first); `assertModulesShopReady` (modules→workTypes→дней: override `(orderItemIndex,moduleId,workTypeId)` days≥1 или каталог `WorkType.days`); `assertLineShopReady`; gate в `patchLineBoardLane` и `patchModuleLane` при `lane==='shop'`.
- `order.module.ts`: зарегистрированы 3 схемы каталога.
- `order.service.spec.ts`: +8 кейсов; существующие shop-тесты переведены на fixture `stubShopReady`.
- FE не менялся: оба drop-пути уже показывают `toast.error(extractErrorMessage(...))`.

## Closeout

- [x] archive + lock + progress + `_NOW` обновлены
- [ ] Status = DONE (после Cursor PASS)
- closed_at: 2026-08-16T17:50:00+03:00
