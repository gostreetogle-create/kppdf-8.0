═══════════════════════════════════════════════════════════════
TZ-DESK-404: На Ганте / В комбайне + возврат на стол
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /production ; /design/combine
PAGE_DOCS: manager-desk.page.md ; production-cockpit.page.md ; design-combine.page.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: TZ-DESK-405 DONE. Предпочтительно после 402 (живой orderId).
407 (embed Gantt на /desk) — preferred; 404 = fallback deep-link + «На стол».
Не параллельно с 405 (keys layout/desk).

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/production/production-cockpit.page.ts; frontend/src/app/pages/dashboard/dashboard.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts

Проверено: HUB-303 `/production?orderId=` уже выбирает заказ в кокпите.
Комбайн: фильтр по заказу есть в UI (`design-combine.page.md`). Стол 401 держит
кнопки disabled. Спек: уход только явными студиями + назад.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — стол
- Снять `disabled` с «На Ганте» / «В комбайне» при выбранном заказе.
- Гант: `routerLink` `/production?orderId=<id>&from=desk`.
- Комбайн: `/design/combine?orderId=<id>&from=desk` (если фильтр уже читает
  `orderId` — использовать его; иначе минимально прокинуть query в существующий filter).

ШАГ 2 — возврат
- На `/production` при `from=desk`: видимая кнопка RU **«На стол»**
  (`data-test="desk-return"`) → `/desk?orderId=<id>`. Не ломать обычный кокпит.
- На Комбайне — то же, если дешево (иначе known_limitation: назад браузера;
  честно в checklist). Не тащить Гант iframe/canvas на `/desk`.

ШАГ 3 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
```
Плюс существующий focused spec production **только если** трогали кокпит.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Логика полос Ганта, boardLane, POST ship (кроме ссылки)
- Встроить мини-Гант / второй Комбайн на стол
- deploy

КРИТЕРИИ ПРИЁМКИ
- С выбранным заказом кнопки ведут в существующие студии с id.
- С Ганта (`from=desk`) есть «На стол» обратно с тем же orderId.
- tsc + spec PASS. Archive + push.

known_limitation: peek-оверлей Ганта нет (осознанно).
