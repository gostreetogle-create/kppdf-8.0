# Page Docs Drift Audit — routes ↔ page.md (TZ-OPS-308)

**Дата:** 2026-08-09 · **Исполнитель:** buffy-ops-308 · **Метод:** ручной аудит
(read-only) `frontend/src/app/app.routes.ts` ↔ `docs/pages/*.page.md` ↔
README / PAGE-TZ-INDEX / DOMAIN-MAP §1.3. Авто-скрипт drift gate — successor P2.

## Метод

- Инвентарь: 47 path-записей в routes.ts (включая 6 redirect-only + `**` wildcard).
- Бизнес-routes: 36 (без auth `/login`+`/forbidden` отдельно, без redirect-only,
  без `**`). Сверены с README индексом (36 строк) и page.md Route-блоками.
- Каждый `*.page.md` проверен: существует ли его route в routes.ts (или он явно
  child / retired / stub).

## Таблица: OK / MISMATCH / ORPHAN

| Route (routes.ts) | page.md | Вердикт |
|-------------------|---------|---------|
| `/login` | login | OK |
| `/materials`, `/materials/:id` | materials, material-detail | OK |
| `/organizations` | organizations | OK |
| `/counterparties` | counterparties | OK |
| `/design` | design | OK (stub) |
| `/supply` | supply | OK |
| `/shipping` | shipping | OK (stub) |
| `/dictionaries` → measurements | dictionaries | OK (hub retired, redirect отмечен) |
| `/dictionaries/measurements` | measurements-group | OK |
| `/dictionaries/units` → measurements | units | OK (legacy, redirect отмечен) |
| `/categories` | categories | OK |
| `/doc-template-categories` | document-template-categories | OK |
| `/dictionaries/text-block-categories` | text-block-categories | OK |
| `/dictionaries/color-references` | color-references | OK |
| `/dictionaries/form-profiles` | form-profiles | OK |
| `/catalog/appearance` | catalog-appearance | OK |
| `/products`, `/products/:id` | products, product-detail | OK |
| `/modules`, `/modules/:id` | modules, module-detail | OK |
| `/work-types` | work-types | OK |
| `/import-todos` | import-todos | OK |
| `/people` | people | OK |
| `/orders`, `/orders/:id` | orders (деталь внутри) | OK |
| `/production` | production-cockpit | OK |
| `/proposals`, `/proposals/create` | proposals, proposals-create | OK |
| `/contracts` | contracts | OK |
| `/doc-constructor/templates` | templates | OK |
| `/doc-constructor/documents` | documents | OK |
| `/doc-constructor/texts` | texts | OK |
| `/doc-constructor/tables` | tables | OK |
| `/doc-constructor/builder` → templates | builder | OK (redirect отмечен) |
| `/doc-constructor/builder/:id` | builder (+tool-pane, +inspector) | OK (children документированы) |
| `/inventory` | inventory-dashboard | OK |
| `/storage-items` | storage-items | OK |
| `/stock-movements` | stock-movements | OK |
| `/warehouses` | warehouses | OK |
| `/admin/users`, `/admin/roles` | admin-users, admin-roles | OK |
| `/admin` → `/admin/users` | — | REDIRECT (отмечен) |
| `/forbidden` | — | ORPHAN route (auth, не бизнес; вне скоупа page.md) |
| `**` → `''` | — | wildcard, вне скоупа |
| **нет route** | **foundations** | **ORPHAN page (P0: README row 36 = ложный `/foundations`)** |

## Severity

- **P0 — ложный route в индексе:** README row 36 `Foundations (kit)` показывает
  `/foundations`, но в `app.routes.ts` такого path нет (kit-страница снята вместе
  с playground; FE-компонента тоже нет). → **FIXED тонко:** ячейка Route в README
  исправлена на «— (kit, нет route в app.routes.ts)»; строка оставлена, т.к.
  файл документирует стильгайд.
- **P1 — отмечено, не чинить пачкой:** title-строки в шапках page.md отличаются
  от routes.ts (косметика, не ложный route): templates («Реестр шаблонов» vs
  «Шаблоны документов»), product-detail («Изделие» vs «Товар»), documents
  («Сформированные» vs «Сохранённые»), storage-items/stock-movements (полные
  названия vs короткие), production-cockpit. Route-пути при этом корректны.
- **P2 note:** авто-drift gate routes↔page.md — successor script (не эта волна).

## Итог

- 36/36 бизнес-routes документированы (OK); 0 MISMATCH по путям.
- 1 ORPHAN page (foundations) — P0 ложный route в README, исправлен.
- 1 ORPHAN route `/forbidden` — auth, вне скоупа бизнес-page.md.
- P1: 5 косметических title-расхождений — отмечены, фикс отдельным TZ при
  необходимости.

---

_Создано: 2026-08-09. Следующий аудит: при массовых изменениях routes.ts._
