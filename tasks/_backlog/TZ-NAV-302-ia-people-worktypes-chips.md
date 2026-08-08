═══════════════════════════════════════════════════════════════
TZ-NAV-302: IA — Люди→Клиенты, Виды работ→Цех, chips + заказ виден
═══════════════════════════════════════════════════════════════

STATUS: READY

РОЛЬ: Frontend (nav + page chrome)

ЗАВИСИМОСТИ: TZ-NAV-301 / UX-307 / UX-308 DONE

LAYER: 3

PAGES: /counterparties ; /people ; /production ; /work-types ; /proposals ; /orders
PAGE_DOCS: (update nav audit + page crumbs)

Проверено: app-layout NAV_CATEGORIES — work-types в catalog; people в production
  (поэтому /people подсвечивает «Цех»); clients только counterparties;
  orders.page уже имеет openCreate «+ Создать»; Group Chip эталон —
  dictionaries measurements-group + PiGroupWorkspace.

PARALLEL OK с волной FORM-302..305: НЕ трогать quick-create/**, form-section/**,
material-form-dialog, product-bom-panel, *form*dialog* (вкл. order-form-dialog).

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
frontend/src/app/pages/counterparties/counterparties.page.ts;
frontend/src/app/pages/people/people.page.ts;
frontend/src/app/pages/production/**;
frontend/src/app/pages/work-types/**;
frontend/src/app/pages/commercial/proposals/proposals.page.ts;
frontend/src/app/pages/orders/orders.page.ts;
frontend/src/app/pages/contracts/contracts.page.ts;
frontend/src/app/shared/page/**;
frontend/src/app/pages/**/ *-group-chips.ts;
docs/audits/2026-08-08-nav-ia-lifecycle-audit.md;
docs/PO-DIARY.md;
docs/agent-checklists/TZ-NAV-302.md;
docs/agent-checklists/_active-map.md;

НЕ ИЗМЕНЯТЬ:
- QuickCreate / FORM-302..305 файлы; order-form-dialog / proposal form internals
- BE routes/ACL pageKeys (можно оставить pageKey как есть)
- desktop/**; deploy; переделка UX создания КП

---

## 1. Перенос в верхнем меню (NAV_CATEGORIES)

| Страница | Было | Стало |
|----------|------|--------|
| `/work-types` Виды работ | catalog | **production (Цех)** |
| `/people` Люди | production | **clients (Клиенты)** |

Каталог оставить: Продукция / Модули / Материалы / Оформление (admin).  
Цех items: Гант (`/production`) + Виды работ (`/work-types`).  
Клиенты items: Заказчики (`/counterparties`) + Люди (`/people`).

entryPath:
- clients: `/counterparties` (как сейчас)
- production: `/production` (как сейчас)

activeAliases при необходимости (как UX-308), чтобы подсветка совпадала с URL.

Обновить jest nav-order / active tests.

## 2. Чипы / «хлебные» групповые ссылки сверху (reuse Group Workspace)

Эталон: `PiGroupWorkspace` / dictionary chips — **не** изобретать третий chrome.

**Клиенты** — chips на `/counterparties` и `/people`:
- Заказчики → `/counterparties`
- Люди → `/people`
pathLabel: «Клиенты»

**Цех** — chips на `/production` и `/work-types` (и других leaf Цеха если уже есть):
- Гант → `/production`
- Виды работ → `/work-types`
pathLabel: «Цех» или «Производство» (один RU; предпочтительно **Цех** как shortLabel меню)

**Сделки** — chips на `/proposals`, `/contracts`, `/orders`:
- КП → `/proposals`
- Договоры → `/contracts`
- Заказы → `/orders`
pathLabel: «Сделки»

Если страница уже на PiPageChrome — добавить toc/chips ряд совместимо с каноном PiPageChrome (Раздел / страница) **или** group-workspace как в справочниках; главное — единый паттерн внутри раздела, не смесь на соседних leaf.

## 3. Заказ: «быстрое создание» найти легко

Факт: на `/orders` уже есть кнопка create → `OrderFormDialog` (не QuickCreate-профиль).  
PO на КП не видит путь к заказу.

Сделать:
- Чипы Сделок (§2) — чтобы Заказы были в один клик из КП.
- На `/orders`: текст кнопки **«+ Создать заказ»** (не голое «+ Создать»).
- Empty state `/orders`: одна фраза куда нажать.
- НЕ строить новый QuickCreate Order в этом TZ; НЕ трогать форму КП.

## 4. Docs

- Строка в `docs/audits/2026-08-08-nav-ia-lifecycle-audit.md`
- PO-DIARY §2: Виды работ в **Цехе** (не Каталоге); Люди в **Клиентах**

## AC

- [ ] /people → жёлтый «Клиенты», не «Цех»
- [ ] /work-types → жёлтый «Цех»; пункта нет в Каталоге
- [ ] Чипы Клиенты / Цех / Сделки на leaf-страницах раздела
- [ ] С /proposals виден переход на Заказы; на /orders явный «Создать заказ»
- [ ] Не staged FORM-wave файлы; jest nav + tsc PASS; archive; commit+push

Verification:
```
cd frontend && pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts --no-cache
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
