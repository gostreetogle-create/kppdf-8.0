# TZ-NX-HOME-BREADCRUMB-EDIT-CTA: крошки Главной + явный «Редактировать заказ»

> Перед заполнением: `docs/TZ-AUTHORING.md`.  
> **SIZE:** S · **PAGES:** home, orders · **PAGE_DOCS:** `docs/pages/home.page.md`, `docs/pages/orders.page.md`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff / Claude  
**ЗАВИСИМОСТИ:** Нет (WAVE-NX-HOME DONE; карточку `/orders/:id` не раздувать — полный workspace = отдельный макет)  
**LAYER:** 3  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.spec.ts`; `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.ts`; `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.spec.ts`; `docs/pages/home.page.md`

---

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`; `docs/pages/home.page.md`; `docs/pages/orders.page.md`; `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-detail.page.ts`; `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.ts`; `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts`; `docs/TZ-NX-BUILD-INTEGRITY.md`
- **Key Constraints:** Mode A Cursor уже выдал TZ; Claim + conflict; eyebrow = label nav-категории (эталон «Сделки» на `/orders`); hub write состава не изобретать
- **Planned Deliverable:** eyebrow Главной + primary CTA «Редактировать заказ» в tray + docs/tests
- **Validation Path:** FIC N/A (route не новый) · focused specs · `nx build kppdf-web` LAST

**Проверено:** `HOME_NAV_CATEGORY.label = «Главная»`; эталон eyebrow на list: `orders-list` → «Сделки»; home сейчас `eyebrow` = «Рабочий день»; в tray CTA «Открыть карточку заказа» спрятан внутри accordion «Состав»; row-link на home есть, но aria «Открыть карточку».

**Domain:** Counterparty/Order без смены схемы. Unique N/A.  
**Сбои оператора:** (1) не видит куда править состав → думает UI read-only; (2) путает «Рабочий день» с разделом меню; (3) клик ▸ без явной кнопки редактирования.  
**Necessity:** операторский факт на живом `/home` — да.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `home.page.ts` ~L34: `<div class="eyebrow">Рабочий день</div>` + `h1` «Главная» — не как `/orders` (`eyebrow` = категория nav).
2. Expand hub (`OrderHubTrayComponent`): состав только смотреть; ссылка «Открыть карточку заказа» внутри `@if (compositionExpanded())` — без раскрытия состава кнопки нет.
3. Карандаш/↗ в строке home → `/orders/:id` уже есть (`data-test="home-row-link"`).
4. `/orders/:id` пока тонкая карточка — **не** цель этого TZ доделывать до полного workspace (макет отдельно). CTA ведёт туда, честный label «Редактировать заказ».

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Крошки Главной
- Заменить eyebrow `Рабочий день` → `Главная` (строго `HOME_NAV_CATEGORY.label`).
- Оставить `h1` «Главная».
- Подзаголовок очереди можно оставить (не крошка).
- Spec: assert eyebrow text «Главная», не «Рабочий день».

### ШАГ 2 — Primary CTA в hub tray (всегда виден при expand)
В шапке tray (до сетки групп или первой строкой над группами), **всегда** при открытом expand:

- Кнопка/ссылка `class="pi-outline-btn"` (или primary outline по паттерну tray): текст **«Редактировать заказ»**
- `routerLink` → `['/orders', order()._id]`
- `data-test="order-hub-edit-cta"`
- `stopPropagation` на click
- Не disabled stub.

### ШАГ 3 — Состав: не прятать путь к правке
- В блоке состава: переименовать «Открыть карточку заказа» → **«Редактировать заказ»** (тот же `/orders/:id`), `data-test` сохранить или добавить alias `order-composition-edit-link`.
- В блоке готовности: «Открыть заказ» → **«Редактировать заказ»** (единый язык).
- Не добавлять inline add-line / PATCH состава в tray (out of scope).

### ШАГ 4 — Строка очереди на `/home`
- `aria-label` у `home-row-link`: **«Редактировать заказ»** (вместо «Открыть карточку заказа»).
- Визуал иконки не ломать.

### ШАГ 5 — Docs + tests
- `docs/pages/home.page.md`: eyebrow «Главная»; явный CTA редактирования из hub.
- Specs home + order-hub-tray: CTA виден **без** раскрытия состава; label/eyebrow.

---

## ИЗМЕНЯТЬ

- `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.spec.ts`
- `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.ts`
- `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.spec.ts`
- `docs/pages/home.page.md`

## НЕ ИЗМЕНЯТЬ

- `order-detail.page.ts` (полный workspace — после макета)
- backend, shipping/supply write paths
- B10 residual thin (studio/supply/cockpit)
- Deploy / Wipe

---

## КРИТЕРИИ ПРИЁМКИ

1. На `/home` eyebrow = «Главная», не «Рабочий день».
2. Expand любой строки → сразу видна кнопка «Редактировать заказ» (`order-hub-edit-cta`) **без** открытия «Состав заказа».
3. Кнопка ведёт на `/orders/:id` текущего заказа.
4. В составе и готовности тот же текст «Редактировать заказ».
5. `home-row-link` aria = «Редактировать заказ».
6. Focused tests PASS; **последним** `cd frontend-nx && pnpm exec nx build kppdf-web` PASS.
7. Archive + checklist Claim; чужой WIP не в коммите.

### Gates (скопировать в checklist)

```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=home.page.spec --skip-nx-cache
cd frontend-nx && pnpm exec nx test features --testPathPattern=order-hub-tray --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

(lint: baseline fail ок, не раздувать; 0 new errors в своих файлах.)

---

## Финализация

Claim → code → gates → `tasks/_archive/2026-09/TZ-NX-HOME-BREADCRUMB-EDIT-CTA.done.md` → commit → stop (1 TZ).

known_limitation: полная правка состава/статуса на карточке — successor после макета `docs/peer/PROMPT-MOCKUP-ORDER-WORKSPACE-2026-09-15.md`.
