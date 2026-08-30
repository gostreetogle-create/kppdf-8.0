# TZ-NX-REGISTRY-CRUD-UNIFY: единый CRUD во всех реестрах + снос раздела «Конструктор»

РОЛЬ АГЕНТА: executor (Freebuff), код `frontend-nx` only
СТАТУС: **ACTIVE** — выдано PO 2026-08-30 после закрытия S0
ЗАВИСИМОСТИ: `TZ-NX-DOCSTUDIO-S0-FOUNDATION` — **закрыт** (`tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md`), реестры «Тексты» и «Виды таблиц» существуют и входят в эту волну

> **Долг, который эта волна обязана закрыть:** S0 архивирован **без живой проверки в браузере**
> (`Browser evidence: not captured` в его чеклисте). Значит два новых реестра ни разу не проверены руками:
> печатает ли rich-text и сохраняется ли содержимое, работает ли редактор колонок, не пусты ли селекты
> категории и источника данных. Шаг 4 этой TZ обходит все реестры — оба новых проверить **как непроверенные**,
> а не «наверное работает, гейты же зелёные».
LAYER: 2 (data-access) + 3 (registry page)
PAGES: /registries ; /registries/:registryKey
PAGE_DOCS: registries.page.md

CONFLICT KEYS:
`frontend-nx/apps/kppdf-web/src/app/pages/registries/**` ; `frontend-nx/apps/kppdf-web/src/app/pages/constructor/**` ; `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` ; `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ; `frontend-nx/libs/data-access/src/**` ; `docs/pages/registries.page.md`

**НЕ трогать:** `backend/**`, `frontend/**`, `docs/architecture/nx-doc-studio.md`, `docs/adr/**`.

---

## ЦЕЛЬ (словами PO)

PO открыл `/registries` и увидел, что реестры сделаны **не однотипно**. Требование: любая таблица, попавшая в реестр, ведёт себя одинаково — раскрытие строки, поиск, пагинация, и полный набор действий **редактировать / копировать / удалить**. Кнопок «Открыть в Конструкторе» быть не должно: раздел «Конструктор» удаляется целиком.

Принцип PO, который эта волна закрепляет: **всё, что лежит в реестре, должно быть редактируемым, добавляемым и удаляемым.** Если запись системная и править её нельзя — такая таблица в реестр не выносится вообще. Промежуточных состояний «смотреть можно, менять нельзя» в реестрах не остаётся.

## ИСХОДНОЕ СОСТОЯНИЕ (проверено)

### Backend уже поддерживает всё нужное — правится только фронт

| Сущность | Create | Update | Delete | Duplicate |
|---|---|---|---|---|
| Unit | `POST /units` | `PATCH /units/:key` | `DELETE /units/:key` (реальный hard-delete, `TZ-NX-REGISTRY-UNITS-DELETE-FIX`) | нет |
| Organization | `POST /organizations` | `PATCH /organizations/:id` | `DELETE /organizations/:id` | нет |
| SupplyRequest | `POST /supply-requests` | `PATCH /supply-requests/:id` | `DELETE /supply-requests/:id` (+ переходы `ordered`/`received`/`cancel`) | нет |
| ProductPassport | `POST /products/:productId/passport` | `PATCH /passports/:id` | `DELETE /passports/:id` | нет |
| Material | есть | есть | есть | `POST /materials/:id/duplicate` |
| Product | есть | есть | есть | `POST /products/:id/duplicate` |
| ProductModule | есть | есть | есть | нет |
| TextBlock / TableTemplate | есть | есть | есть | нет |

Пути: `unit.controller.ts:52-68`, `organization.controller.ts:78-107`, `supply-request.controller.ts:47-100`, `product-passport.controller.ts:26-59`.

### Что сейчас неоднотипно на фронте

По `docs/pages/registries.page.md` § Icon row actions и § Registries:

| Реестр | Сейчас | Дыра |
|---|---|---|
| `units` | copy-key, activate, deactivate; **нет edit, нет delete** | PO прямо жалуется: вместо переименования предлагают «копировать ключ». Backend `PATCH`/`DELETE` есть, FE-действий нет (`tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md`) |
| `organizations` | read-only, **нет ни одной кнопки** | нет create/edit/delete при полном CRUD в API |
| `supply-requests` | read-only | то же |
| `product-passports` | read-only | то же |
| `materials` / `details` | pencil, copy, archive, **layers → Конструктор** | лишняя кнопка конструктора; destructive назван «Архивировать» |
| `modules` | pencil, состав, archive; **нет copy**, нет поиска | нет копирования, фильтров нет вообще |
| `products` | pencil, copy, archive, состав, **layers → Конструктор** | лишняя кнопка конструктора |
| `departments` | демо-фикстура без backend | нарушает принцип PO: в реестре лежит то, что нельзя ни создать, ни сохранить |

Раздел «Конструктор»: роут `/constructor` + `/constructor/create/:kind` (`constructor.routes.ts`), страницы `pages/constructor/constructor.page.ts` и `constructor-create-placeholder.page.ts` (заглушка «Раздел готовится»), плюс row actions «Открыть в Конструкторе» в `materials.registry.ts` и `products.registry.ts`.

## ЧТО ДЕЛАТЬ

### Шаг 1 — единый контракт действий

1. Завести один разделяемый набор действий строки, чтобы порядок и иконки не расходились между реестрами: **Редактировать** (pencil) → **Копировать** (copy) → доменные действия (состав и подобные) → **Удалить** (danger, последняя). Реализовать как общий фабричный хелпер рядом с `registry-row-action-button`, а не копипастой в каждом определении.
2. Destructive-действие называется **«Удалить»** везде, где endpoint — `DELETE`. Слово «Архивировать» убрать: оператор не должен угадывать, что это одно и то же. Подтверждение до запроса — обязательно, как сейчас.
3. **Копировать** без duplicate-endpoint делать клиентски: открыть форму создания, предзаполненную значениями строки, с пометкой в названии («… — копия»). Не изобретать серверные роуты.

### Шаг 2 — довести каждый реестр до полного набора

Для каждого из реестров ниже: toolbar «Создать …», поиск, честная пагинация, раскрытие строки, полный набор действий из шага 1, форма создания и редактирования на существующих полях схемы.

1. `units` — добавить **Редактировать** (переименование, `PATCH /units/:key`) и **Удалить** (`DELETE /units/:key`). Действие «копировать ключ» убрать из набора действий строки: это не CRUD-операция; если ключ нужен для копирования, он остаётся видимым в колонке. Toggle активности сохранить как доменное действие.
2. `organizations` — форма создания и редактирования, удаление. Фильтр по типу и поиск уже есть.
3. `supply-requests` — форма создания и редактирования, удаление. Переходы статуса (`ordered` / `received` / `cancel`) — доменные действия строки, отдельно от CRUD.
4. `product-passports` — редактирование (`PATCH /passports/:id`) и удаление. Создание — только через `POST /products/:productId/passport`, то есть форма обязана требовать выбор изделия; если изделие уже имеет паспорт, показать это до отправки (`productId` unique).
5. `modules` — добавить **Копировать** (клиентски) и поиск (клиентский, API без query-параметров).
6. `materials` / `details` / `products` — убрать row action «Открыть в Конструкторе», переименовать «Архивировать» → «Удалить», остальное сохранить.
7. `text-blocks` / `table-templates` (из S0) — привести к тому же набору, добавить **Копировать**.
8. `departments` — убрать из production-каталога: это фикстура без backend, и по принципу PO ей нечего делать в реестре. Адаптер фикстуры оставить только если на нём держатся spec'и error/retry; в каталог не включать.

### Шаг 3 — снос «Конструктора»

1. Удалить роуты `/constructor` и `/constructor/create/:kind`, страницы `constructor.page.ts`, `constructor-create-placeholder.page.ts`, `constructor.types.ts` и их spec'и.
2. Убрать пункт из `nav-categories.ts` и из заголовочной навигации; проверить, что `collectPageRoutePaths` больше не отдаёт мёртвых ссылок.
3. Прогрепать `frontend-nx/**` на `constructor` и убрать все оставшиеся упоминания в коде и тестах.
4. `docs/pages/registries.page.md` и `docs/CAPABILITY-LEDGER.md`: зафиксировать снятую способность (раздел удалён, создание живёт в реестрах).

### Шаг 4 — сплошная проверка однотипности

Пройти **все** реестры и заполнить таблицу «реестр × проверка» в чеклисте: вход из меню · поиск · фильтры реально фильтруют · пагинация соответствует заявленному режиму · раскрытие строки · создать · редактировать · копировать · удалить с подтверждением · loading / error / empty · 0 ошибок в консоли и сети · ни одной мёртвой кнопки. Любая клетка «нет» — либо исправлена в этой волне, либо вынесена строкой в known_limitation с причиной.

## ИЗМЕНЯТЬ

`frontend-nx/apps/kppdf-web/src/app/pages/registries/**`, удаление `pages/constructor/**`, `app.routes.ts`, `constructor.routes.ts` (удалить), `layout/nav-categories.ts`, новые write-методы в `libs/data-access` для units/organizations/supply-requests/passports, `docs/pages/registries.page.md`, `docs/CAPABILITY-LEDGER.md`, свой чеклист.

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

1. `backend/**` — ни строки. Все нужные endpoint'ы уже есть; чего нет (duplicate) — решается клиентски.
2. `frontend/**` — legacy не трогаем.
3. Не изображать server-пагинацию и не придумывать query-параметры: где API отдаёт список целиком, фильтр и поиск — клиентские, и это честно написано в `registries.page.md`.
4. Не добавлять новые сущности, поля, права. Не заводить «системные» флаги, чтобы обойти правило PO: если запись нельзя править — таблицу не выносим в реестр.
5. Не трогать студию документов и её срезы (`docs/architecture/nx-doc-studio.md`).
6. `docs/pages/PAGE-TZ-INDEX.md` — только дописать строку в конец.

## КРИТЕРИИ ПРИЁМКИ

1. В каждом реестре production-каталога набор действий строки идёт в одном порядке с одинаковыми иконками и русскими подписями; destructive называется «Удалить» и требует подтверждения.
2. `units` переименовывается и удаляется из UI; «копировать ключ» больше не в наборе действий.
3. `organizations`, `supply-requests`, `product-passports` создаются, правятся и удаляются из UI.
4. Копирование работает во всех реестрах: либо duplicate-endpoint, либо предзаполненная форма создания.
5. Поиск есть в каждом реестре; заявленный режим пагинации совпадает с фактическим запросом.
6. Роутов и упоминаний `/constructor` в `frontend-nx/**` не осталось; мёртвых ссылок в навигации нет.
7. `departments` отсутствует в production-каталоге.
8. Таблица «реестр × 12 проверок» из шага 4 заполнена целиком; каждая клетка «нет» имеет строку в known_limitation.
9. Тесты: spec на общий фабричный набор действий, spec на каждый новый write-метод data-access, spec на отсутствие роута `/constructor`.
10. Integrity slot заполнен; `## Executor report (auto)` — 5 полей, полный 40-символьный SHA.

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser   # обход всех реестров, скриншоты в evidence
```

## known_limitation

- Duplicate-endpoint есть только у материалов и изделий; остальное копирование клиентское, поэтому идентичность копии ограничена полями формы.
- Паспорт создаётся только от изделия (`productId` unique) — «создать паспорт с нуля» в реестре невозможно и не должно предлагаться.
- Мягкое удаление (`deletedAt`) остаётся серверной деталью: UI говорит «Удалить», восстановление вне этой волны.

## Финализация

`tasks/_archive/YYYY-MM/TZ-NX-REGISTRY-CRUD-UNIFY.done.md` по `GEMINI.md` + `ARCHIVE_MARKER`, `progress.md`, своя секция в `_NOW.md`, строка в конец `docs/pages/PAGE-TZ-INDEX.md`, FIC по снятой способности «Конструктор».
