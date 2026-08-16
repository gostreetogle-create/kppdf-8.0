# TZ-UX-332: Изделие — фото/сохранение «Product undefined» + русские ошибки API

> PO: в «Редактировать изделие» добавил фото → красная строка **`Product undefined not found`**;
> имя файла «Снимок экрана…» показано кракозябрами; английские ошибки неприемлемы для менеджера.
> Канон: `docs/PO-CANON.md` — UI на русском.

РОЛЬ АГЕНТА: Frontend (+ тонкий BE filter/photos)

ЗАВИСИМОСТИ: нет (можно параллельно TZD-48 desktop — **другие** conflict keys)

LAYER: 2–3

CONFLICT KEYS: `frontend/src/app/shared/services/dashboard-dialog.service.ts` ; `frontend/src/app/pages/products/product-form-dialog.component.ts` ; `frontend/src/app/core/silent-http.ts` ; `backend/src/common/filters/http-exception.filter.ts` ; `backend/src/modules/photos/image-upload.options.ts` ; `backend/src/modules/photos/photos.service.ts` ; (тесты рядом) `dashboard-dialog.service.spec.ts` ; `product-form-dialog.component.spec.ts` ; `http-exception.filter` / photos specs если есть

PAGES: `/products` ; dashboard (открытие изделия)  
PAGE_DOCS: `docs/pages/products.page.md` (если есть) ; иначе N/A + строка в `PAGE-TZ-INDEX`

CHECKLIST: `docs/agent-checklists/TZ-UX-332.md`  
REVIEW: required

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Изделие | **Product** (`_id`, не `id`) |
| Фото | модуль `photos` → `Photo`; связь `Product.photoIds[]` |

Проверено:

- `DashboardDialogService.openProductEdit` передаёт `data: { id: productId }` — **без `_id` и без загрузки карточки** (`dashboard-dialog.service.ts` ~29–36).
- `ProductFormDialogComponent`: `isEdit = data != null`, `editProductId = data?._id`, save → `service.update(this.data._id, …)` (`product-form-dialog.component.ts` ~575–576, ~894–895).
- Следствие: заголовок «Редактировать», hint состава «Сначала сохраните…», upload фото в `/photos` работает, **Save** бьёт `PATCH /api/products/undefined` → BE `Product undefined not found`.
- `extractErrorMessage` прокидывает сырое `error.message` с API (`silent-http.ts` ~68–78).
- BE `NotFoundException(\`Product ${id} not found\`)` повсеместно на EN (`product.service.ts` и паттерн в других модулях).
- Имя файла: `file.originalname` пишется в `originalFilename` без перекодировки (`photos.service.ts` ~69–70) — типичный latin1/UTF-8 mojibake у Multer.

Loose wording PO «Undefend» → **`undefined`** в URL/id.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Dashboard открывает edit с `{ id }` вместо полного Product / `_id`.
2. Диалог не валидирует наличие MongoId перед update.
3. Сообщения 404/`not found` с BE доходят до UI на английском.
4. Кириллические originalFilename ломаются при upload.

---

## ЧТО ДЕЛАТЬ

### 1. Исправить открытие с дашборда (корневой баг)

`openProductEdit(productId, …)`:

1. Загрузить изделие через `ProductsService.findById(productId)` (silent-http).
2. При ok — открыть диалог с `data: res.data` (полный Product с `_id`).
3. При ошибке — toast на русском (`extractErrorMessage` после шага 3, или явный «Изделие не найдено»).
4. Не открывать диалог с голым `{ id }`.

Аналогично проверить другие call-sites, которые передают partial product **без** `_id` (grep `ProductFormDialog` + `data:`). Rail уже передаёт `raw` с `_id` — не ломать. Если найдётся ещё один `{ id: … }` — тот же паттерн findById.

### 2. Защита в `ProductFormDialogComponent`

1. `isEdit` / режим редактирования = есть валидный `editProductId` (MongoId), не «data != null».
2. Перед `update`: если нет валидного id — **не** звать API; `errorMessage` = русское «Не удалось сохранить: изделие открыто без идентификатора. Закройте окно и откройте изделие снова.»
3. Опционально: принять legacy `data.id` как alias → нормализовать в `_id` **только** если всё равно грузите полную карточку; предпочтение — всегда полные данные с findById.
4. Тест: data `{ id: '…' }` без `_id` не должен слать update на undefined; data с `_id` — как сейчас.

### 3. Русские сообщения API → UI (прагматичный sweep)

**A. BE `HttpExceptionFilter`:** если `message` (string) матчит  
`/^([A-Za-z][A-Za-z0-9]*)\s+(.+)\s+not found$/i`  
→ заменить на русскую фразу по словарю сущности, например:

| Entity token | RU |
|--------------|-----|
| Product | Изделие не найдено |
| ProductModule / Module | Модуль не найден |
| Material | Материал не найден |
| Photo / ProductPhoto | Фото не найдено |
| Counterparty | Контрагент не найден |
| Order | Заказ не найден |
| … | разумный минимум по grep `not found` в `backend/src/modules` |

Если id = `undefined` / `null` / пусто → «Не указан идентификатор» (или «Изделие не найдено: не указан идентификатор»).

Не переписывать все сервисы построчно в этой TZ — filter закрывает user-facing path. Сервисы могут оставить EN в throw для логов; в response уходит RU.

**B. FE safety net в `extractErrorMessage`:** если после body всё ещё есть явный English `… not found` / `Http failure response…` — короткое RU fallback («Объект не найден» / «Ошибка запроса к серверу»). Не дублировать огромный словарь — filter = SoT.

Тесты filter: `Product undefined not found` → RU; `Product 64… not found` → «Изделие не найдено».

### 4. Кириллица в имени файла фото

В upload path (multer options и/или `photos.service` до записи `originalFilename`):

- Нормализовать `originalname`: если похоже на mojibake / всегда `Buffer.from(name, 'latin1').toString('utf8')` — выбрать безопасный канон, принятый в проекте/Node Multer (документировать в checklist одной строкой).
- UI dropzone показывает уже исправленное имя для **новых** загрузок.
- Не обязательно мигрировать старые битые имена в Mongo (known_limitation).

### 5. Gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="product-form-dialog|dashboard-dialog|silent-http" --coverage=false
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- --testPathPattern="http-exception.filter|photos" --coverage=false
```

(Если нет spec у filter — создать focused unit на humanize not-found.)

---

## ИЗМЕНЯТЬ

- CONFLICT KEYS + их specs  
- `docs/pages/PAGE-TZ-INDEX.md` строка  
- checklist `docs/agent-checklists/TZ-UX-332.md`

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

- Desktop / TZD-48  
- Массовый rewrite всех `NotFoundException` строк в каждом service (достаточно filter)  
- Deploy / wipe  
- Переименование Product → другой API  
- «Красивый» i18n-фреймворк / ngx-translate

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Dashboard → редактировать изделие → форма с данными и `_id`; состав-редактор доступен (не false «сначала сохраните» при реальном edit)
- [ ] Добавить фото → Сохранить → **нет** `Product undefined not found`; изделие обновляется с photoIds
- [ ] Любой оставшийся 404 `Product … not found` в UI на **русском**
- [ ] Новый upload с кириллическим именем файла не показывает mojibake в dropzone
- [ ] Тесты + gates PASS
- [ ] Commit только conflict keys (+ checklist/index); Executor report (auto); archive после Cursor PASS

---

## known_limitation

- Старые Photo.originalFilename с уже битой кодировкой в БД не чиним.
- Полный словарь всех EN сообщений BE вне `not found` / validation — successor при необходимости.
- Rail/KPI path уже с полным raw — не регрессировать.

---

## Финализация

`GEMINI.md` root cycle → `tasks/_archive/2026-08/TZ-UX-332.done.md` + lock. Deploy нет.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:16:00+03:00
closed_by: cursor-grok-4.6
TZ: TZ-UX-332
DEP: none

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app + backend tsconfig.build)
  - tests: PASS (FE 3 suites / 35; BE 5 suites / 14)
  - checklist: ADDED
  - progress.md: UPDATED
  - cursor verdict: PASS
  - commit: e45bfcccd049315561d15873f672569dde16783a
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Dashboard `openProductEdit` loads `ProductsService.findById` and opens `ProductFormDialog` with full `Product._id`. Bare `{ id }` is gone.
- Dialog edit mode = usable `_id`; `{ id }` without `_id` does not `PATCH /products/undefined`; RU «открыто без идентификатора».
- BE `HttpExceptionFilter`: `Product undefined not found` → «Изделие не найдено: не указан идентификатор»; `Product <id> not found` → «Изделие не найдено».
- FE `extractErrorMessage` RU fallback if English leaks.
- Photo `originalFilename`: latin1→utf8 only on mojibake; already-Cyrillic untouched.

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- `cd frontend && pnpm test -- --testPathPattern="product-form-dialog|dashboard-dialog|silent-http" --coverage=false`: PASS 35
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`: PASS
- `cd backend && pnpm exec jest --testPathPattern="http-exception.filter|photos" --coverage=false`: PASS 14
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/shared/services/dashboard-dialog.service.ts` (+ spec)
- `frontend/src/app/pages/products/product-form-dialog.component.ts` (+ spec)
- `frontend/src/app/core/silent-http.ts` (+ spec)
- `backend/src/common/filters/http-exception.filter.ts` (+ spec)
- `backend/src/modules/photos/image-upload.options.ts` (+ spec)
- `backend/src/modules/photos/photos.service.ts` (+ spec)
- `docs/pages/products.page.md`
- `docs/agent-checklists/TZ-UX-332.md`
- `tasks/TZ-UX-332-product-edit-undefined-ru-errors.md`

## Known limits

- Old Mongo `originalFilename` mojibake not migrated.
- Full EN BE dictionary outside `not found` — successor if needed.
- `dashboard.page.md` TZ-UX-332 note lives in working tree (file mixed with other TZ WIP; not in product commit).
