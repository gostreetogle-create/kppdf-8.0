# Capability ledger — что продукт умеет / чего нет

> **Зачем:** агенты не должны «догонять» фичи из воздуха и не должны возвращать то, что PO уже снял.  
> **Состояния** (ровно одно на строку): `included` · `available` · `absent` · `removed`.  
> **Обновлено:** 2026-08-11 (adopted from vibe template idea; adapted to kppdf).

Связанные SoT (не дублировать длинно):

| Тема | Документ |
|------|----------|
| Готовность разделов для боевых данных | [`SECTION-READINESS.md`](./SECTION-READINESS.md) |
| Новая страница / право / MCP | [`FEATURE-INTEGRATION-CHECKLIST.md`](./FEATURE-INTEGRATION-CHECKLIST.md) |
| Роли / поток цеха | [`product-vision-lite.md`](./product-vision-lite.md) |
| Режимы задачи агента | [`AGENT-TASK-MODES.md`](./AGENT-TASK-MODES.md) |

---

## 0. Правила

1. Нет строки = **`absent`**. Добавь строку, не угадывай.
2. **`removed`** = намеренно выпилено / запрещено. Код-остаток или упоминание в docs **не** право вернуть без явного PO.
3. **`available`** = код/экран есть, но контур ещё нельзя считать рабочим; в Note — чего не хватает.
4. **`included`** = ожидается, что работает в текущем контуре (см. также SECTION-READINESS).
5. Обновляй ledger **в том же TZ/PR**, где capability добавлен/снят (как FIC).
6. Ledger — про **продуктовые способности**, не про файлы в репо.

---

## 1. Ledger (канон)

| Capability | State | Note |
| --- | --- | --- |
| Auth (login / JWT access+refresh) | included | Session must survive F5; Basic Auth на edge — ops, не замена login. |
| Admin users / roles / permissions | included | Базовый CRUD; warehouse-scoped ACL — нет. |
| Catalog: materials list/detail/forms | included | UI RU; остаток SoT = склад, не `Material.stockQty`. |
| Catalog: products + composition (BOM) | available | FullEditor + дерево есть; cutover/polish и единый write-path — дожимать по SECTION-READINESS. |
| Catalog: modules | available | Карточки/состав частично; не плодить второй BOM UI. |
| Dictionaries (units, colors, categories, form profiles S/M/L) | included | Справочники READY*; form profiles — канон быстрого create. |
| Counterparties / clients | included | Канон имени: Counterparty ≠ Organization. |
| Warehouse: warehouses, stock, movements | included | READY TO USE*; ACL/автосписание — HARDENING / absent. |
| Warehouse: auto-issue on work complete | absent | После ручного приход/расход; не блокирует READY склада. |
| Deals / quotations (КП) studio | available | WAVE KP на main; shame-polish / smoke у PO; не начинать параллельный create-path. |
| Orders (shop floor order card) | available | Зависит от sales→shop canon; не дублировать дерево состава. |
| Documents: templates / builder / archive | available | Builder MVP; create-parity и превью — смотри DOC-* / SECTION-READINESS. |
| Documents: PDF print from quotation | available | Puppeteer/Chrome path; 503 fallback — ок; live smoke зависит от host. |
| People / workers | available | People page; связка склад/производство позже. |
| Work types (₽/час) under Цех | included | Меню: Виды работ под Цех, не Settings/Каталог. |
| Production cockpit / Gantt | available | Shell/MVP; не бухгалтерия и не fine ACL. |
| Desktop app + MCP pairing | available | Basic Auth + `X-Access-Token`; version gate — backlog. |
| Fine-grained warehouse ACL (worker = свой склад) | absent | Vision; не импровизировать. |
| Full accounting / CRM / tender mega | removed | Вне scope product-vision-lite; не возвращать без PO. |
| Microservices split / extra brokers | removed | Монолит Nest; новый брокер только после measured limit + строка в ledger. |
| Shared FE/BE Zod contracts package | absent | Идея из vibe; не начинать без отдельного TZ. |

---

## 2. Как агент обязан использовать

- Перед новой фичей: найди строку. `absent`/`removed` → **стоп** или спроси PO; не «заодно сделаю».
- При DONE фичи: обнови State/Note + при необходимости SECTION-READINESS.
- В отчёте: если трогал capability — одна строка «ledger: …».

---

## 3. История (коротко)

| Дата | Что |
|------|-----|
| 2026-08-11 | Первый ledger: adopt vibe capability idea; seed из SECTION-READINESS + vision. |
