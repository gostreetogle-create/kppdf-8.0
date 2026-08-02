═══════════════════════════════════════════════════════════════
TZ-DOC-335: Builder UX — empty states, CTAs, table deeplink
═══════════════════════════════════════════════════════════════

> Domain preflight: UI-only. Сущности не меняются.
> Аудит: `docs/audits/DOC-334-doc-constructor-ui-polish-audit.md` §P1 #3–7,10.
>
> После top-palette: empty-copy всё ещё про «выпадающие списки»;
> пустая палитра — тупик; Edit table не передаёт editId; нет
> явного «назад к шаблонам»; мёртвые httpResource на BuilderPage.

РОЛЬ АГЕНТА: Frontend Doc-Constructor (builder UX polish)

ЗАВИСИМОСТИ:
- Top palette уже в дереве (не блокируется).
- Не требует DOC-332 / DOC-334 / DOC-336.
- Если DOC-332 в `_active` и трогает `builder.page.ts` — DEFER 335
  или дождаться; **этот TZ** правит page/canvas/tool-pane.

LAYER: 3

PAGES: /doc-constructor/builder/:id ; /doc-constructor/tables
PAGE_DOCS: builder.page.md ; builder-tool-pane.page.md ; tables.page.md

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts;
frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts;
docs/pages/builder.page.md;
docs/pages/builder-tool-pane.page.md;
docs/pages/tables.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-DOC-335.md

Проверено (Cursor 2026-08-02):
- `builder-canvas.component.ts` ~L82: «выпадающих списков выше»
- `builder-tool-pane`: empty «Нет сохранённых текстов/таблиц» без ссылок
- `builder.page.ts` `onEditSelected` table → navigate `/tables` без query
- texts уже: `queryParams: { editId }` + texts.page auto-open
- `textsRes` / `tablesRes` на BuilderPage ~L457–478 не используются UI
  (палитра сама фетчит)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Оператор на пустом альбомном холсте читает устаревшую подсказку.
2. Пустая палитра не ведёт к созданию текста/таблицы.
3. «Редактировать» на table-блоке открывает каталог, не нужный шаблон.
4. Лишние GET text-blocks + table-templates при каждом открытии builder.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Canvas empty copy

Заменить hint на что-то в духе:
«Добавьте блоки из палитры выше (Тексты / Таблицы / Фото). Клик по
холсту — свойства шаблона.»

ШАГ 2: Palette empty CTAs

В секциях Тексты / Таблицы при empty:
- короткий текст + outline `app-pi-button` или `<a routerLink=…>`
  → `/doc-constructor/texts` и `/doc-constructor/tables`
- Сохранить drag UX для непустого списка.

ШАГ 3: Table editId deeplink

- `builder.page.ts` `onEditSelected` case `table`: как у text —
  извлечь `source.refId` / binding id →
  `navigate(['/doc-constructor/tables'], { queryParams: { editId } })`
- `tables.page.ts`: зеркало texts — на `editId` открыть
  `TableTemplateFormDialog` (или существующий edit flow) и сбросить
  query после open.
- Specs на оба конца.

ШАГ 4: Back to templates

В builder toolbar (рядом с subtitle / category chip):
ghost/outline `app-pi-button` или breadcrumb «← Шаблоны» →
`/doc-constructor/templates`. Не убирать save-status chip.

ШАГ 5: Remove dead httpResources

Удалить неиспользуемые `textsRes` / `tablesRes` и связанные
комменты/imports на BuilderPage. Обновить specs если мокали эти URL.

ШАГ 6: Docs

Обновить `builder.page.md` / `builder-tool-pane.page.md`:
top exclusive tabs (не accordion / не left 280px); empty CTA;
table editId. Строка в PAGE-TZ-INDEX.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS выше.

НЕ ИЗМЕНЯТЬ:
- builder-inspector.component.ts (DOC-332)
- backend
- template-setup-dialog (DOC-336 может трогать позже)
- texts.page shell (только tables.page для editId)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Empty canvas текст **не** содержит «выпадающих списков».
2. Пустая палитра Тексты/Таблицы имеет рабочую ссылку/кнопку на каталог.
3. Edit table-блока с refId открывает диалог/редактирование **этого**
   шаблона (как texts+editId).
4. Видна навигация назад к `/doc-constructor/templates`.
5. Network: при открытии builder **нет** лишних GET от удалённых
   textsRes/tablesRes на page (tool-pane свои GET — ок).
6. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="builder\\.(page|canvas)|builder-tool-pane|tables\\.page"
   ```
7. Checklist + Executor report перед archive.

known_limitation:
- Inspector IA → DOC-332
- Texts/Tables full shell unify → DOC-336
- `app-pi-tabs` a11y upgrade tool-pane → optional P2 successor

Промпт:
«Прочитай `GEMINI.md` и `tasks/TZ-DOC-335-builder-ux-empty-states-deeplink.md`.
Checklist `docs/agent-checklists/TZ-DOC-335.md` до правок. Выполни.»
