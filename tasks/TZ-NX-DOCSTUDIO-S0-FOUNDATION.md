# TZ-NX-DOCSTUDIO-S0: фундамент студии — реестры «Тексты» и «Виды таблиц» + rich-text публично

РОЛЬ АГЕНТА: executor (Freebuff), код `frontend-nx` only
ЗАВИСИМОСТИ: нет. План модуля: `docs/architecture/nx-doc-studio.md` § 3, § 6 (S0+S1)
LAYER: 2 (data-access lib) + 3 (registry page)
PAGES: /registries/text-blocks ; /registries/table-templates
PAGE_DOCS: registries.page.md

CONFLICT KEYS:
`frontend-nx/libs/data-access/src/**` ; `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/**` ; `frontend-nx/tsconfig.base.json` ; `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` ; `docs/pages/registries.page.md` ; `docs/agent-checklists/TZ-NX-DOCSTUDIO-S0.md`

**НЕ трогать:** `frontend/**`, `backend/**`, `tasks/**` кроме своего claim/archive, `docs/architecture/nx-doc-studio.md`, `docs/adr/**`, `frontend-nx/libs/ui/paper-and-ink/src/lib/canvas/**`.

---

> **Попытка №2.** Первый исполнитель (`freebuff-docstudio-s0`) остановился после preflight: чеклист
> `docs/agent-checklists/TZ-NX-DOCSTUDIO-S0.md` остался в статусе IN PROGRESS с гейтами «pending», claim в
> `tasks/_active/` не создан, файлов не появилось, коммита и архива нет. Вероятная причина: на тот момент **весь
> `frontend-nx/` был untracked** (никогда не коммитился), и запрет «не коммитить чужой WIP» мог быть прочитан как
> «эта зона чужая». Теперь workspace в git — коммит `406a7952` — и это **твоя рабочая зона**.

## ПРОТОКОЛ ПРОГРЕССА (обязателен)

Тихо остановиться нельзя. После **каждого** из шагов 1–5 дописать строку в `## Gates` своего чеклиста: номер шага,
что сделано, какие файлы созданы. Если шаг невозможно выполнить — записать в чеклист `BLOCKED: <причина + путь>`,
обновить Status на `BLOCKED` и остановиться **с явным сообщением**, а не оставлять «pending».

## ЦЕЛЬ

Первый срез модуля №1 (студия документов). Даёт две вещи, которые нужны PO раньше самого редактора:

1. **Списки сохранённого.** PO будет на ходу настраивать таблицы и создавать тексты, и они должны сохраняться в базе с именем, чтобы потом выбирать из списка. Обе коллекции в backend уже есть (`text_blocks`, `table_templates`) и не имеют ни одного экрана в NX. По правилу PO новая таблица входит в продукт **через реестр** — значит сначала реестры, потом подключение к студии.
2. **Публичный rich-text.** В NX уже лежит редактор на TipTap с расширениями шрифта, цвета и выравнивания, но у него нет публичного import-пути, поэтому им никто не может пользоваться. Этот срез открывает путь и **сразу применяет** его в форме текста (иначе «готово в shared, 0 потребителей» = провал по `docs/TZ-AUTHORING.md` §3.9).

Холст (`canvas/**`) в этом срезе **не открывать** — его первый потребитель появляется в S2.

## ИСХОДНОЕ СОСТОЯНИЕ (проверено)

- `GET/POST /text-blocks`, `GET/PATCH/DELETE /text-blocks/:id` — `backend/src/modules/text-block/text-block.controller.ts:31-78`. Query у list: `isActive`, `categoryId`, `activeOnly` (`:35-49`). Сортировки/пагинации в API **нет**.
- Поля `text_blocks`: `name` (≤200), `slug` (unique, ≤100), `tags[]`, `content` (≤50000), `columns[] {id, content, width, fontSize}`, `isActive`, `categoryId`, `sortOrder` — `text-block.schema.ts:39-90`. Enum `category` удалён (`:18-25`), присылать его = 400.
- `GET /text-block-categories` — `text-block-category.controller.ts:39`.
- `GET/POST /table-templates`, `GET/PATCH/DELETE /table-templates/:id`, `GET /table-templates/:id/preview` — `table-template.controller.ts:16-64`.
- Поля `table_templates`: `name`, `description`, `category?`, `sortOrder`, `columns[]`, `sampleRows?`, `isActive`, `dataSource?` — `table-template.schema.ts:99-148`.
  - `ColumnType` = `text | number | date | currency | bool` (`:23-31`).
  - `TableTemplateCategory` = `product-spec | cost-calc | order-summary | price-list | custom | kp` (`:34-49`).
  - `TableColumn` = `{ key*, label*, type='text', width=100, align='left'|'center'|'right', format? }` (`:69-93`).
- `GET /registry/data-sources` — список привязываемых источников/полей (`registry.controller.ts:16`, `registry.service.ts:153-277`). `TableTemplate.dataSource` — свободная метка, которую этот список и наполняет (`table-template.schema.ts:141-147`).
- NX rich-text: `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/pi-rich-text-editor.component.ts` + `substitution-token.extension.ts`. **Нет** `index.ts`, **нет** alias в `frontend-nx/tsconfig.base.json`. Пример готового секондари-входа: `"@kppdf/ui/dialog": ["libs/ui/paper-and-ink/src/lib/dialog/index.ts"]` (`tsconfig.base.json:111-112`).
- Реестры NX: платформа и конвенции — `docs/pages/registries.page.md`; каталог `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts:79-89` (9 определений). Эталон API-реестра со своими диалогами — `materials.registry.ts` + `MaterialFormDialogComponent`.
- Data-access: `frontend-nx/libs/data-access/src/**`, конвенция `Pi*Service` на `silentGet/Post/Patch/Delete` → `SilentResult<T>`; сервисов документов/текстов/таблиц **нет ни одного**.

## ЧТО ДЕЛАТЬ

### Шаг 1 — публичный вход rich-text

1. Создать `libs/ui/paper-and-ink/src/lib/rich-text/index.ts`, экспортирующий компонент редактора и его публичные типы. `substitution-token.extension.ts` экспортировать **только** если редактор без него не собирается; иначе оставить внутренним до среза, где нужны токены.
2. Добавить alias `"@kppdf/ui/rich-text"` в `frontend-nx/tsconfig.base.json` рядом с существующими `@kppdf/ui/*`, тем же стилем.
3. Никаких новых зависимостей: TipTap уже в `frontend-nx/package.json`.

### Шаг 2 — сервисы доступа к данным

Добавить в `libs/data-access` по конвенции `Pi*Service` **только методы, у которых в этом срезе есть потребитель**:

- `PiTextBlocksService`: `list({ categoryId?, isActive? })`, `getById`, `create`, `update`, `remove`.
- `PiTextBlockCategoriesService`: `list()` — для select категории в форме.
- `PiTableTemplatesService`: `list()`, `getById`, `create`, `update`, `remove`.
- `PiRegistryDataSourcesService`: `list()` — для select «Источник данных» в форме вида таблицы.

Типы полей — ровно из схем выше, без `any`, без придуманных полей. Экспорт через существующий public API `libs/data-access`.

### Шаг 3 — реестр «Тексты» (`text-blocks`)

1. `text-blocks.registry.ts` по образцу `materials.registry.ts`: `source: 'api'`, `paginationMode: 'client'` (API отдаёт список целиком — **фальшивую server-пагинацию не изображать**).
2. Колонки: Название, Категория, Теги, Активен, Обновлён. Фильтры: поиск (клиент, по названию и тегам), Категория (`categoryId` — реальный query), Статус (`isActive` — реальный query). Придуманных query-параметров не добавлять.
3. Toolbar «Создать текст». Row actions icon-only по конвенции `registry-row-action-button`: Редактировать (pencil), Архивировать (danger, confirm до запроса).
4. `TextBlockFormDialogComponent` — `PiDialogComponent variant="content"`: `name`, `slug`, `tags`, `categoryId`, `sortOrder`, `content` через **`@kppdf/ui/rich-text`**. Поле `category` не отправлять ни при каких условиях. `columns[]` в этом срезе не редактируем — если у записи они есть, показать как read-only сводку и сохранить без изменений.
5. Перед открытием формы редактирования — `getById` (строка списка может быть неполной), при ошибке toast и диалог не открывать.

### Шаг 4 — реестр «Виды таблиц» (`table-templates`)

1. `table-templates.registry.ts`: `source: 'api'`, `paginationMode: 'client'`.
2. Колонки: Название, Категория (RU-метки), Колонок (число), Источник данных, Активен. Фильтры: поиск и Категория — на клиенте, если у API нет соответствующих query-параметров (проверить контроллер, не угадывать).
3. Toolbar «Создать вид таблицы». Row actions: Редактировать, Архивировать (confirm).
4. `TableTemplateFormDialogComponent` — `PiDialogComponent variant="content"`: `name`, `description`, `category` (select с RU-метками шести значений), `sortOrder`, `dataSource` (select из `GET /registry/data-sources` + возможность оставить пустым), и **редактор колонок**: список строк `key`, `label`, `type` (5 значений), `width`, `align` (3 значения), `format?`; добавить/удалить/переупорядочить строку. `key` и `label` обязательны — пустые не отправлять.
5. `sampleRows` в этом срезе не редактируем и не затираем: отправлять только те поля, которые форма реально меняет.
6. RU-метки категорий и типов колонок — в одном месте файла определения реестра, не разбросанные строки.

### Шаг 5 — каталог, документация, тесты

1. Зарегистрировать оба определения в `registries.catalog.ts` рядом с существующими; `DestroyRef` диалогов — page-scoped, как у остальных.
2. `docs/pages/registries.page.md`: две строки в таблицу реестров, строки в таблицу filters/pagination, короткая секция про новые диалоги, обновить «Обновлено».
3. Тесты (jest, co-located): по одному spec на каждый новый сервис data-access (маппинг запроса/ответа) и по одному на каждое определение реестра (колонки, фильтры, режим пагинации, набор row actions). Плюс spec на форму вида таблицы: добавление/удаление колонки и что `category` не уходит в payload текстового блока.

## ИЗМЕНЯТЬ

`frontend-nx/libs/data-access/src/**` (новые сервисы + public API), `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/index.ts` (новый), `frontend-nx/tsconfig.base.json` (один alias), `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` (два определения, два диалога, каталог), `docs/pages/registries.page.md`, свой чеклист, одна строка в конец `docs/pages/PAGE-TZ-INDEX.md`.

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

1. `backend/**` — ни строки. Если для реестра не хватает query-параметра — фильтровать на клиенте и записать в known_limitation, а не менять API.
2. `frontend/**` — legacy Studio/Builder/КП живут до отдельного kill-plan PO.
3. Не открывать публичный путь для `canvas/**` — его потребитель появится в S2.
4. Не начинать саму страницу студии, не создавать роут `/studio`, не трогать оболочку, рельсы и меню.
5. Не добавлять `any`, raw `HttpClient` в компоненты, новые npm-зависимости, новые UI-примитивы в `libs/ui` кроме `rich-text/index.ts`.
6. Не изображать server-пагинацию и не придумывать query-параметры.
7. Не трогать `docs/architecture/nx-doc-studio.md` и `docs/adr/**`.
8. Не коммитить чужой WIP: в `backend/src/modules/unit/**`, `backend/src/modules/auth/**`, `backend/src/common/**` есть незакоммиченные чужие правки. `git add` только свои файлы поимённо.
9. `docs/pages/PAGE-TZ-INDEX.md` — только дописать строку в конец, ничего не переупорядочивать (файл может править параллельная волна).

## КРИТЕРИИ ПРИЁМКИ

1. `/registries` показывает 11 реестров; строки «Тексты» и «Виды таблиц» с бейджем «API».
2. `/registries/text-blocks`: список грузится, фильтр по категории и статусу реально меняет запрос, поиск фильтрует, создание текста через rich-text сохраняется и появляется в списке, редактирование меняет запись, архивирование спрашивает подтверждение и убирает из списка. Ни одной мёртвой кнопки.
3. `/registries/table-templates`: создание вида таблицы с ≥3 колонками разных типов сохраняется; повторное открытие показывает те же колонки в том же порядке; `sampleRows` существующей записи после правки не потеряны.
4. `@kppdf/ui/rich-text` импортируется из формы текста; вне `libs/ui` компонент напрямую по внутреннему пути не импортируется.
5. Consumer proof: оба реестра доступны из живого роута, не только в тестах.
6. 0 ошибок в консоли и сети при обходе обоих реестров.
7. `docs/pages/registries.page.md` описывает оба реестра фактически (реальные query-параметры и режим пагинации), known limitations честные.
8. Integrity slot заполнен (`docs/DOCS-INTEGRITY.md`); `## Executor report (auto)` — 5 полей, полный 40-символьный SHA.

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser   # живой обход обоих реестров, скриншоты в evidence
```

## known_limitation

- Пагинация обоих реестров клиентская: `GET /text-blocks` и `GET /table-templates` отдают список целиком.
- `columns[]` текстового блока и `sampleRows` вида таблицы не редактируются в этом срезе.
- Подключение сохранённых текстов и видов таблиц к документу появится в S6/S8 по `docs/architecture/nx-doc-studio.md` § 6.
- Публичный путь холста и сама страница студии — S2.

## Финализация

`tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md` по `GEMINI.md` + `ARCHIVE_MARKER`, строка в `progress.md`, своя секция в `docs/agent-checklists/_NOW.md`, строка в конец `docs/pages/PAGE-TZ-INDEX.md`, FIC §A по новой странице/реестрам.
