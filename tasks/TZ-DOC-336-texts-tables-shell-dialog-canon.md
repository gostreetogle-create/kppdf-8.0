═══════════════════════════════════════════════════════════════
TZ-DOC-336: Texts/Tables — page shell + dialog FormField canon
═══════════════════════════════════════════════════════════════

> Domain preflight: UI-only. Entities: `TextBlock`, `TableTemplate`.
> Аудит: `docs/audits/DOC-334-doc-constructor-ui-polish-audit.md` §P1 #7–8, P2 #15–18.
>
> Цель: одна зона «Документы» выглядит как Templates/Materials —
> `PiPageHeader` + `PiToolbar` + `PiSection` + FormField/Input/Select/Switch
> в диалогах. Не менять API payloads.

РОЛЬ АГЕНТА: Frontend Doc-Constructor (page chrome / dialogs)

ЗАВИСИМОСТИ:
- Предпочтительно после DOC-335 (editId на tables уже есть).
- Не параллелить с DOC-335 на `tables.page.ts`.
- DOC-334 желателен до/параллельно (ссылка «категории» из texts).

LAYER: 3

PAGES: /doc-constructor/texts ; /doc-constructor/tables ;
  template setup dialog (create flow)
PAGE_DOCS: texts.page.md ; tables.page.md ; templates.page.md (ссылка)

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/texts/texts.page.ts;
frontend/src/app/pages/doc-constructor/texts/texts.page.spec.ts;
frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts;
frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.spec.ts;
frontend/src/app/pages/doc-constructor/texts/data-field-picker-dialog.component.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.ts;
frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts;
frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts;
frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts;
frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.spec.ts;
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
docs/pages/texts.page.md;
docs/pages/tables.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/agent-checklists/TZ-DOC-336.md

Эталон:
- `templates.page.ts` — page chrome
- `material-form-dialog.component.ts` — `app-pi-dialog` + `app-pi-form-field` +
  `app-pi-input` / select / `app-pi-switch`

Проверено:
- texts: custom `texts-shell-*`
- tables: `tables-head` / promo aside / hand-rolled copy icon
- table-template-dialog: native selects/checkboxes + `::ng-deep`
- template-setup-dialog: native select, chips без aria-pressed
- text-block-editor: full-page; native checkbox «Активен»; align ≡≡≡
- templates: `documentLabel="Дублировать"` вместо copy slot

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Три диалекта chrome в одной продуктовой зоне → оператор и агенты
копируют «локальный» стиль вместо Paper & Ink.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Texts page shell

Перевести `texts.page.ts` на `app-pi-page-header` / `app-pi-toolbar` /
`app-pi-section` / `app-pi-empty-state` / `app-pi-row-actions` по
образцу templates. Сохранить: search, category filter, create,
editId deep-link, list actions.

ШАГ 2: Tables page shell

То же для `tables.page.ts`. Убрать promo aside (или свернуть в
description header — без marketing block). Copy → `pi-row-actions`
`(copy)` / `copyLabel`. Сохранить editId из DOC-335.

ШАГ 3: Table dialog FormField canon

`table-template-dialog`: заменить native controls на
FormField + Input/Select + Switch где есть pi-примитивы.
Убрать/свести `::ng-deep` size hacks к dialog `size` input.
Не менять save payload shape.

ШАГ 4: Template setup dialog polish

`template-setup-dialog`: FormField/Select где возможно; orientation
chips → `aria-pressed` + `pi-focus-ring`. Не менять create API.

ШАГ 5: Text editor a11y/canon (scoped)

- «Активен» → `app-pi-switch`
- Align L/C/R → разные Lucide icons + `aria-label` (не три `≡`)
- Не переписывать весь редактор в dialog в этом TZ (known_limitation:
  full-page editor → optional successor)

ШАГ 6: Templates duplicate slot

`templates.page.ts`: `documentLabel="Дублировать"` → правильный
`(copy)` / `copyLabel` как materials (если PiRowActions поддерживает).

ШАГ 7: Docs + gates

Обновить texts.page.md / tables.page.md; PAGE-TZ-INDEX; checklist.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS.

НЕ ИЗМЕНЯТЬ:
- builder-inspector (DOC-332)
- builder-tool-pane / canvas (кроме если shared type — не трогать)
- backend schemas/DTOs
- data-field-picker: минимальный polish ok; не большой redesign

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Texts и Tables используют PiPageHeader + PiToolbar + PiSection
   (селекторы в DOM / шаблоне).
2. Tables без promo-блока под каталогом.
3. Table dialog: нет native bare checkbox для isActive (pi-switch);
   поля через form-field где применимо.
4. Setup dialog chips: `aria-pressed` + focus ring.
5. Text align: три визуально разных иконки.
6. Templates duplicate через copy API row-actions.
7. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="texts\\.page|text-block-editor|tables\\.page|table-template-dialog|template-setup-dialog|templates\\.page"
   ```
8. Browser smoke: create text, create table, create template via setup,
   open from builder editId (если 335 done).

known_limitation:
- Full migration text-block-editor → modal dialog — successor
- data-field-picker deep redesign — successor
- Auto-bootstrap org/docType на create template — UX smell P2,
  не в этом TZ без PO (не ломать create flow)

Промпт:
«Прочитай `GEMINI.md` и `tasks/TZ-DOC-336-texts-tables-shell-dialog-canon.md`.
Checklist до правок. Выполни после DOC-335 на tables.page.»
