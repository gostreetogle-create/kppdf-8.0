# TZ-DESK-440: tray CTA — только живые действия

PAGES: `/desk` ; `/orders`
PAGE_DOCS: manager-desk.page.md
РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: `frontend/src/app/shared/orders/order-hub-tray.component.ts`; `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`

## Domain preflight

- **Проверено:** `docs/COUPLING-MAP.md` §2 — desk primary CTA tray: только PATCH `draft→confirmed`; отгрузка = отдельная кнопка «Отгружено» → POST `/orders/:id/ship` (DESK-430).
- **Проверено:** `order-hub-tray.component.ts` — `PRIMARY_CTA_LABELS` для confirmed/in_production/ready рисует кнопки, а `onPrimaryCtaClick` / `primaryCtaDisabledReason` отдают «подключится позже».
- **Проверено:** на `ready` рядом живёт `desk-ship-button` «Отгружено» и мёртвый gold «Отгрузить».
- **Не менять:** семантику `canMarkShipped()` / DESK-430 (ранний ship) — без отдельного PO Да/Нет.
- Counterparty ≠ Organization. Unique на номер заказа — N/A.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Summary bar `data-test="desk-primary-cta"`: лейблы «Подтвердить» | «В производство» | «К отгрузке» | «Отгрузить»…
2. `canConfirm()` = true только для `draft` + siteId + items.
3. Клики на остальных статусах → hint «действие подключится позже» / «В производство подключится позже».
4. User-facing copy содержит `siteId` (строки ~829, ~833).
5. Primary / ship / cancel buttons часто без `pi-focus-ring` (соседи в tray уже с ring).

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Матрица primary CTA

- `draft` + canConfirm → gold «Подтвердить» (как сейчас), emit `primaryCta`.
- `draft` без canConfirm → кнопка disabled / muted + RU reason **без** слова `siteId` («площадка» / «изделия»).
- `confirmed` | `in_production` | `ready` | `shipped` | `delivered` | `cancelled` → **скрыть** `desk-primary-cta` целиком (badge статуса `order-summary-status` уже есть). Без read-only «фейк-кнопки».
- Удалить ветки copy «подключится позже» из `primaryCtaDisabledReason` (мертвый код после скрытия).

### ШАГ 2 — Готов к отгрузке

- На `ready`: единственный ship control = существующий `desk-ship-button` «Отгружено». Не дублировать смыслом «Отгрузить» в primary.
- Не менять `canMarkShipped` / confirm dialog / POST ship path.

### ШАГ 3 — Copy + a11y

- Заменить `siteId` в пользовательских строках на «площадка» / «объект».
- Добавить `pi-focus-ring` на primary CTA (если видна), `desk-ship-button`, `desk-cancel-shipment-button`.

### ШАГ 4 — Тесты

- Обновить/добавить spec: для `confirmed` / `in_production` / `ready` — `desk-primary-cta` **отсутствует** (или не кликабельна и без «позже»).
- `draft` eligible → CTA есть и emit.
- Сохранить DESK-430 / SHIP-433 specs на «Отгружено» / cancel.

## ИЗМЕНЯТЬ

- `frontend/src/app/shared/orders/order-hub-tray.component.ts`
- `frontend/src/app/shared/orders/order-hub-tray.component.spec.ts`

## НЕ ИЗМЕНЯТЬ

- `manager-desk.page.ts` handlers `onMarkShipped` / confirm (кроме если сломался template binding — не трогать)
- Combine / boardLane / order.service status rollup
- `/shipping` page
- Backend ship endpoints

## КРИТЕРИИ ПРИЁМКИ

1. Нет UI-строки «подключится позже» в tray ни на одном статусе.
2. На `ready` нет второй кнопки «Отгрузить» рядом с «Отгружено».
3. `draft`→«Подтвердить» работает как раньше (emit + gold).
4. Нет `siteId` в видимом тексте tray.
5. Focus ring на ship/cancel/primary (когда есть).
6. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- order-hub-tray.component.spec
cd frontend && pnpm lint
pnpm architecture:check
```

## known_limitation

- Wire реальных переходов confirmed→in_production / in_production→ready — **отдельный** TZ (процессы цеха), не эта задача.
- Сужение `canMarkShipped` до `ready` — backlog, ждёт PO.

## Proof of adoption

- Consumer: `/desk` tray (уже routed).
- Spec матрица статусов → primary CTA visibility.
- page.md: одна строка в `manager-desk.page.md` — primary CTA только confirm.

## Archive

`tasks/_archive/2026-08/` + checklist `docs/agent-checklists/TZ-DESK-440.md` по `_TEMPLATE.md`.
Cursor/PO PASS по живому `/desk` перед «задача закрыта».
