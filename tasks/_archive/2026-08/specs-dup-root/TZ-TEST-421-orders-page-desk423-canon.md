# TZ-TEST-421: orders.page.spec → канон DESK-423 (stale HUB-303/304)

РОЛЬ АГЕНТА: executor (freebuff / claude / gemini)  
LAYER: 2 (тесты)  
ЗАВИСИМОСТИ: TZ-DESK-423 DONE (`57b6a7fa`); спека `docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md`  
PAGES: /orders ; /desk  
PAGE_DOCS: orders.page.md ; manager-desk.page.md  
CONFLICT KEYS: `frontend/src/app/pages/orders/orders.page.spec.ts`

Проверено: shared tray `order-hub-tray` — секции Снабжение/Логистика свёрнуты по умолчанию (`supplyExpanded = signal(false)` и аналоги); пустые фразы «Нет задач снабжения» / «Нет броней» / «Отгрузка пока не ведётся» удалены каноном DESK-423. Product-код не трогать — только спеки.

## ИСХОДНОЕ СОСТОЯНИЕ

- Полный FE jest на HEAD: 1863/1868 — 5 FAIL в `orders.page.spec.ts` (HUB-303/304).
- На baseline до DESK-423 те же тесты PASS → stale assertions, не продуктовый баг.
- Focused гейты DESK-423 (order-hub-tray / manager-desk / order-form-panel) зелёные; `orders.page.spec.ts` не обновляли.

## ЧТО ДЕЛАТЬ

1. Прочитай канон Auto-open / пустые состояния в `docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md`.
2. В `orders.page.spec.ts` обнови 5 падающих HUB-303/304:
   - не ожидать авто-раскрытие supply/логистики без ошибки / ready|shipped;
   - убрать ассерты на удалённые фразы («Нет задач снабжения», «Нет броней», «Отгрузка пока не ведётся»);
   - оставить проверки lazy-load счётчиков, ссылок, изоляции ошибок — под текущий DOM/tray.
3. Прогони focused: `orders.page.spec.ts` + `order-hub-tray` (регрессия).
4. Не меняй product `.ts` / HTML / CSS.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/orders/orders.page.spec.ts`

## НЕ ИЗМЕНЯТЬ

- `order-hub-tray.component.*` (кроме чтения)
- `manager-desk.*`, backend, deploy, другие спеки без нужды

## КРИТЕРИИ ПРИЁМКИ

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0
- [ ] `cd frontend && pnpm test -- orders.page.spec.ts` — все PASS
- [ ] focused `order-hub-tray` — PASS (регрессия)
- [ ] Нет ассертов на фразы, запрещённые каноном DESK-423
- [ ] Archive `tasks/_archive/2026-08/TZ-TEST-421.done.md` + sha; убрать из `_active`

known_limitation: полный FE suite — в фазе «готовь деплой», не обязан здесь.
