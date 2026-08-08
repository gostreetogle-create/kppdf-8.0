═══════════════════════════════════════════════════════════════
TZ-NAV-301: Меню L→R по потоку + stub-страницы дыр
═══════════════════════════════════════════════════════════════

> READY · канон: `docs/audits/2026-08-08-nav-ia-lifecycle-audit.md`  
> Можно ∥ ORDERS-302 (не трогать `orders/**`, composition-tree)

STATUS: READY (RESERVED until claim)

РОЛЬ АГЕНТА: Frontend (layout + thin stub pages + routes)

ЗАВИСИМОСТИ: нет блокирующих; DICT-315 form-profiles пункт — показать в меню только если route уже есть, иначе TODO-comment в NAV

LAYER: 3 (app-layout + routes — один агент)

PAGES: top nav; `/counterparties`; `/design`; `/supply`; `/shipping`
PAGE_DOCS: audit nav-ia; обновить PAGE-TZ-INDEX одной строкой

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/app.routes.ts;
frontend/src/app/pages/counterparties/**;
frontend/src/app/pages/design/**;
frontend/src/app/pages/supply/**;
frontend/src/app/pages/shipping/**;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-NAV-301.md;
docs/agent-checklists/_active-map.md;
docs/audits/2026-08-08-nav-ia-lifecycle-audit.md;

---

## Domain preflight

| UI | Код |
|----|-----|
| Заказчик | Counterparty — страница список (API уже есть) |
| Наша фирма | Organization — пункт в Админ |
| Объект | Site — later ORDERS-303; на stub Клиенты достаточно списка заказчиков + empty «объекты — в 303» |
| Снабжение / Отгрузка / Проектирование | stub UI, без полного BE |

---

## ЧТО ДЕЛАТЬ

### 1. Переставить `NAV_CATEGORIES` L→R
Порядок топа:
`Справочники → Каталог → Клиенты → Сделки → Проектирование → Снабжение → Производство → Склад → Документы → Админ`

### 2. Переносы пунктов
- Убрать **Люди** из Каталога → в **Производство**
- Убрать **Организации** из Сделок → в **Админ** (label «Наши организации»)
- Сделки остаётся: КП → Договоры → Заказы (entryPath = `/proposals`)
- Справочники: убрать дублирующие leaf из топа (`/categories`, лишний «Оформление» если совпадает ярлыком с каталогом) — оставить classification, measurements, colors, documents-ref, text-block cats; не ломать deep-link routes
- Каталог: Продукция, Модули, Материалы, Виды работ, Оформление (admin)

### 3. Stub-страницы (PiPageChrome + RU empty + «скоро»)
Минимум списка/карточки без тяжёлой логики:

| Route | pageKey | Заголовок |
|-------|---------|-----------|
| `/counterparties` | `counterparties` | Заказчики — список через существующий API если есть FE service; иначе empty + «API готов, UI в волне» но **постараться** thin list |
| `/design` | `design` | Проектирование — empty «очередь доукомплектования» |
| `/supply` | `supply` | Снабжение — empty «задачи закупки» |
| `/shipping` | `shipping` | Отгрузка — empty «частичные отгрузки» |

Подключить routes + pageKey в data (для ACL later — пока как остальные operational).

### 4. Склад
Добавить пункт **Отгрузка** → `/shipping` в категорию Склад (или отдельная категория уже есть — пункт в Склад ок).

### 5. Docs
- Строка в PAGE-TZ-INDEX  
- Не раздувать ARCHITECTURE  
- Checklist + archive  

## НЕ

- Полный SUPPLY/SHIPPING/READY backend  
- Site CRUD (ORDERS-303)  
- Правки `orders/**`, composition-tree, form-profiles BE  
- Deploy; desktop  
- Перенос Виды работ в Справочники  

## AC

- [ ] Топ-меню L→R как §1 ЧТО ДЕЛАТЬ  
- [ ] Люди не в Каталоге; Организации не в Сделках  
- [ ] Клиенты / Проектирование / Снабжение / Отгрузка открываются, chrome RU, не 404  
- [ ] Сделки: КП→Договоры→Заказы; entry на КП  
- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` в frontend  
- [ ] Jest на layout nav order (хотя бы unit: порядок id категорий) если уже есть spec — иначе минимальный spec  
- [ ] Archive + lock; map NEXT  

known_limitation: stub без данных — норма; counterparties list best-effort к API.

---

## Промпт

```text
CLAIM TZ-NAV-301 → audit nav-ia + этот TZ → меню L→R + stubs → gates → archive.
Не трогать orders/** и composition-tree.
```
