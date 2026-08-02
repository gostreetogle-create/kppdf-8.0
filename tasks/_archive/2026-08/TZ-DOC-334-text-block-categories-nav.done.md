═══════════════════════════════════════════════════════════════
TZ-DOC-334: Wire text-block categories route + nav
═══════════════════════════════════════════════════════════════

> Domain preflight: UI wiring only. Entity = `TextBlockCategory`
> (`/api/text-block-categories`). Не путать с `Category` и
> `DocumentTemplateCategory` (DOC-308).
>
> Gap: DOC-316 archived «done», но AC про route+nav **не выполнены** —
> page/dialog/service есть, меню и router — нет. Operator dead-end:
> editor говорит «создайте в справочнике».

РОЛЬ АГЕНТА: Frontend Doc-Constructor (routing / nav)

ЗАВИСИМОСТИ: Нет (page уже в дереве). DOC-316 archive = исходник AC.

LAYER: 3

PAGES: /dictionaries/text-block-categories ; /doc-constructor/texts
PAGE_DOCS: texts.page.md (одна строка: ссылка на справочник)

CONFLICT KEYS:
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/pages/PAGE-TZ-INDEX.md;
docs/pages/texts.page.md;
docs/agent-checklists/TZ-DOC-334.md;
docs/audits/DOC-334-doc-constructor-ui-polish-audit.md

Проверено (Cursor 2026-08-02):
- `text-block-categories.page.ts` + form dialog + specs — существуют
- `app.routes.ts`: есть `doc-template-categories`, **нет** text-block-categories
- `app-layout.component.ts` NAV reference: «Категории шаблонов», **нет** «Категории текстов»
- Archive: `tasks/_archive/2026-08/TZ-DOC-316-….done.md` § route
  `/dictionaries/text-block-categories`

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Справочник UI готов, но unreachable без ручного URL.
2. Фильтр категорий в texts/builder работает только если категории
   уже есть в Mongo (seed) — создать новую через UI нельзя.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Route

В `app.routes.ts` рядом с `doc-template-categories` добавить:

```ts
{
  path: 'dictionaries/text-block-categories',
  loadComponent: () =>
    import('./pages/dictionaries/text-block-categories.page').then(
      (m) => m.TextBlockCategoriesPage,
    ),
  title: 'KPPDF — Категории текстов',
},
```

(Если parent layout уже имеет prefix — сверить соседние пути:
`doc-template-categories` сейчас **без** `dictionaries/` prefix.
**Канон из DOC-316:** `/dictionaries/text-block-categories`.
Если соседние reference routes без prefix — всё равно используй
`dictionaries/text-block-categories` как в AC DOC-316; не ломай
существующие URL других справочников.)

ШАГ 2: Nav

В `app-layout.component.ts` → `NAV_CATEGORIES` id `reference`,
после «Категории шаблонов»:

```ts
{ path: '/dictionaries/text-block-categories', label: 'Категории текстов' },
```

ШАГ 3: Docs + checklist

- Создать `docs/agent-checklists/TZ-DOC-334.md` **до** правок кода
- Строка в `PAGE-TZ-INDEX.md` (Reference + texts)
- В `texts.page.md` — одна ссылка: категории ведутся в справочнике

ШАГ 4: Verify

- Jest page specs уже есть — убедиться что route load не ломает tsc
- Ручной smoke: меню → страница → создать категорию → видна в
  dropdown редактора текстов

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/app.routes.ts
- frontend/src/app/layout/app-layout.component.ts
- docs/pages/PAGE-TZ-INDEX.md
- docs/pages/texts.page.md
- docs/agent-checklists/TZ-DOC-334.md (создать)

НЕ ИЗМЕНЯТЬ:
- text-block-categories.page.ts / form dialog (уже готовы)
- backend text-block-categories module
- builder / inspector
- чужие TZ

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `GET` маршрута `/dictionaries/text-block-categories` грузит
   `TextBlockCategoriesPage` (title в document ok).
2. В меню «Справочники» есть «Категории текстов»; клик открывает page.
3. CRUD на странице работает (create → list); system categories
   по-прежнему lock (существующее поведение page).
4. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- text-block-categories.page.spec
   ```
5. Checklist + Executor report (auto) перед archive.

known_limitation:
- Не рефакторить texts/tables shell (→ DOC-336)
- Не трогать inspector (→ DOC-332)

Промпт исполнителю:
«Прочитай `GEMINI.md`, `docs/AI-AGENT-GUIDE.md` и
`tasks/TZ-DOC-334-text-block-categories-nav.md`. Создай checklist
`docs/agent-checklists/TZ-DOC-334.md` до правок. Выполни TZ.»

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
commit: b975b10db9f4312eca97f16ba3c64d24c24396c4
notes: route+nav wired; page already existed (DOC-316 gap)
