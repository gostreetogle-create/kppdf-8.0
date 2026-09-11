# Аудит: библиотека текстов (категория → подкатегория → название)

**Дата:** 2026-09-11  
**Триггер:** PO — тексты «просто вставляются»; нужно структурное хранение: категория / подкатегория / название → тело; при вставке — фильтр и список по названиям.  
**Режим:** Cursor Mode A (только факты + gap; без product code).

### Preflight Check Output
- **Context read:** `backend/src/modules/text-block/text-block.schema.ts`; `backend/src/modules/text-block-category/text-block-category.schema.ts`; `frontend-nx/.../studio-text-properties.component.ts`; `frontend-nx/.../text-block-form-dialog.component.ts`; `frontend-nx/.../studio-editor.page.ts` (`applyLibraryText` / `openSaveTextBlockDialog`); `docs/pages/texts.page.md`; `docs/pages/text-block-categories.page.md`; `docs/PO-CANON.md`
- **Key Constraints:** Mode A; reuse `TextBlock` + `TextBlockCategory` (не второй write-path); NX = SoT
- **Planned Deliverable:** этот аудит → после ответа PO на 1 бизнес-вопрос → WAVE/TZ
- **Validation Path:** FIC A/C при появлении subcategory; gates в TZ

---

## 1. Что уже есть (факты)

### Модель

| Сущность | Коллекция | Ключевые поля | Уровень |
|----------|-----------|---------------|---------|
| **TextBlock** | `text_blocks` | `name`, `slug`, `content` (HTML), `categoryId?`, tags, columns | **название + тело** |
| **TextBlockCategory** | `text_block_categories` | `name`, `slug`, org/system, isDefault | **одна** плоская категория |

- Подкатегории / `parentId` / дерево — **нет**.
- Legacy enum `legal|intro|…` снят (TZ-DOC-323); только FK `categoryId`.

### API

- `GET/POST/PATCH/DELETE /api/text-blocks` (+ фильтр `categoryId`)
- `GET/POST/PATCH/DELETE /api/text-block-categories`
- Seed: системная «Общее» (`obshchee`)

### NX UI сегодня

1. **Студия → Свойства текста** (`studio-text-properties.component.ts`):
   - select **Категория** (фильтр);
   - select **Из библиотеки** = список **названий** `TextBlock.name`;
   - выбор → `applyLibraryText` подставляет `content` на лист + toast (**snapshot**, не live `refId`);
   - кнопка сохранить в библиотеку → `TextBlockFormDialog` (имя, slug, теги, **одна** категория, rich-text).
2. **Реестр** `/registries/text-blocks` — CRUD библиотеки; колонка категории сейчас может показывать сырой `categoryId` (smell).
3. **Nav** «Категории текстов» → `/dictionaries/text-block-categories` — в NX **нет route** (мертвая ссылка); `PiTextBlockCategoriesService` на NX = **list-only** (CRUD категорий только legacy).

### Legacy (эталон UX, не SoT)

- `/doc-constructor/texts` + Builder palette: фильтр категории → клик/drag → **новый** блок с optional live `source: { kind: 'text-block', refId }` (`docs/pages/texts.page.md`, builder). Уровень всё равно один (без subcat).
- Org: категории org/system; сами **TextBlock без `organizationId`** (глобальный `slug`) — учесть в WAVE, если нужен org-scope блоков.

---

## 2. Gap vs желание PO

| PO хочет | Сейчас |
|----------|--------|
| Категория → **подкатегория** → **название** | Категория → название (1 уровень) |
| Создание: выбрать cat/subcat, задать имя, сохранить тело | Форма: имя + 1 категория (+ slug/tags/порядок) |
| Вставка: фильтр cat/subcat → выпадающий список **по названиям** → тело внутри | Фильтр cat → список имён → тело ✓ (без subcat) |
| Структурная библиотека | Есть, но **плоско** |

Ощущение «просто текст вставляется» = на листе редактируется rich-text **блока документа**; библиотека есть, но **слабый UX иерархии** и нет 2-го уровня.

---

## 3. Рекомендация (reuse-first)

**Не** новая сущность «SnippetLibrary».

**Да:** дерево на `TextBlockCategory`:

- `parentId?: ObjectId` (null = корневая категория; non-null = подкатегория).
- `TextBlock.categoryId` указывает на **лист** (подкатегорию) или, если PO разрешит, на корень — зафиксировать в TZ: **только leaf** vs допускается корень.
- Пикер студии: Категория → Подкатегория → Название.
- Форма create/save: те же три поля + тело; slug авто из имени (скрыть от оператора, если мешает).

Альтернатива tags-as-subcategory — отвергнуть: ломает справочник и фильтр.

---

## 4. WAVE (черновик, не выдавать Claude, пока PO не ответит)

| # | SIZE | Суть |
|---|------|------|
| A | L | BE: `parentId` + validation (depth≤1) + list API children/filter + migration seed |
| B | L | NX: справочник категорий = дерево; форма TextBlock = cat+subcat+name+body; slug auto |
| C | S | Студия properties: фильтр cat→subcat→picker names; save dialog parity |
| D | S | Docs/page.md + FIC; NX route+CRUD категорий (заменить dead nav); имя категории в registries |
| E | park | live `BlockSource` в NX (как Builder) — только если PO явно скажет «правки библиотеки обновляют лист» |

Conflict keys (ожидаемо): `text-block-category.schema/service/controller`; `text-block.*`; `text-block-form-dialog`; `studio-text-properties`; `app.routes` / dictionaries categories NX page; `pi-text-block-categories.service`; `text-blocks.registry`; page.md.

Источник доп. фактов: explore [Audit studio text library](380b2169-583d-46f2-9181-464f9deccfca).

---

## 5. Решение PO

**Подкатегория обязательна** (2026-09-11, по dictation «категория и подкатегория»).  
`TextBlock.categoryId` = leaf only. Depth ≤ 1.

WAVE: `docs/agent-checklists/WAVE-NX-TEXT-LIBRARY-HIERARCHY.md` · PROMPT: `tasks/PROMPT-CLAUDE-TEXT-LIBRARY-HIERARCHY.md`.

---

## 6. Closeout (2026-09-11) — WAVE COMPLETE

Все три TZ волны выполнены (`agent_id: claude`):

- **01** `TZ-NX-TEXT-CAT-PARENT` — BE: `TextBlockCategory.parentId` (depth≤1); `TextBlockService.create()` требует явный лист `categoryId` (без него — 400 «Укажите подкатегорию», больше не тихий fallback на «Общее»); `assertAssignable` отклоняет корневые id; `remove()` блокирует удаление корня с подкатегориями.
- **02** `TZ-NX-TEXT-CAT-NX-CRUD` — NX `/dictionaries/text-block-categories` (было мёртвой ссылкой в nav) — master-detail CRUD (корни → подкатегории выбранного корня); «Создать подкатегорию» доступна только под выбранным корнем — глубина>1 структурно невозможна из UI.
- **03** `TZ-NX-TEXT-PICKER-FORM` — форма создания/редактирования TextBlock и студийный пикер «Из библиотеки» — оба теперь cat→subcat cascade; `categoryId` обязателен (`Validators.required`); `slug` больше не поле формы (сервер генерирует); реестр `/registries/text-blocks` показывает резолвленное имя «Корень › Подкатегория», не raw ObjectId.

Итог: PO-модель «категория → подкатегория → название → тело», подкатегория обязательна, депth≤1 — реализована end-to-end (BE + NX CRUD + NX picker/form + registry display).

**Park (не в этой волне, сознательно):** live `BlockSource` в NX (Builder-style refId subscription) — только если PO явно попросит «правки библиотеки обновляют лист»; org-scope на TextBlock.
