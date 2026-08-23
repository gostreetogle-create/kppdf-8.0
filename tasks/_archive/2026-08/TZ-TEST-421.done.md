# TZ-TEST-421: orders.page.spec → канон DESK-423 (stale HUB-303/304)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit)
  - tests: PASS (orders.page.spec 17/17, order-hub-tray 7/7)
  - lint: PASS (0 errors, 18 pre-existing warnings)
  - checklist: ADDED (docs/agent-checklists/TZ-TEST-421.md)
  - progress.md: UPDATED
  - status synchronization: PASS

## Что сделано

Обновлены 5 падающих тестов в `orders.page.spec.ts` под канон DESK-423:

1. **HUB-303 lazy-loads supply counters** — supply section collapsed by default; добавлен клик по toggle `[aria-controls="order-supply-content"]` перед ассертами. Старый ассерт "Черновик 1" заменён на "Заказано 1" (текущий шаблон счётчиков).

2. **HUB-303 empty supply state** — supply раскрывается вручную, ассерт на "Нет задач снабжения" убран (фраза удалена каноном). Error-isolation: после повторного expand и error-flush, supply раскрывается вручную (ошибка приходит асинхронно после ngOnInit).

3. **HUB-304 lazy-loads reservations** — logistics section collapsed by default; добавлен клик по toggle `[aria-controls="order-logistics-content"]`.

4. **HUB-304 empty warehouse state** — logistics раскрывается вручную, ассерт на "Нет броней" убран. Error-isolation: logistics раскрывается вручную после асинхронного error-flush.

5. **HUB-304 shipping stub** — logistics раскрывается вручную; ассерты на `[data-test="order-shipping-stub"]` и "Отгрузка пока не ведётся" убраны (элемент и фраза удалены каноном). Тест переименован в "renders shipping section".

Product `.ts`/HTML/CSS не тронуты.

## Изменённые файлы

- `frontend/src/app/pages/orders/orders.page.spec.ts`

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  # exit 0
cd frontend && pnpm test -- orders.page.spec.ts              # 17/17 PASS
cd frontend && pnpm test -- order-hub-tray                    # 7/7 PASS
cd frontend && pnpm lint                                      # 0 errors
```