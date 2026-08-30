# TZ-KP-443: Ориентация КП = из шаблона; toggle убрать с превью

PAGES: `/proposals/create` ; `/proposals/workspace` ; `/doc-constructor/builder/:id`
PAGE_DOCS: kp-workspace.page.md ; kp-workspace-geometry.md ; builder.page.md ; proposals-create.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: Нет (disjoint с DOC-443)  
LAYER: 3

### Preflight Check Output
- **Context read:** `proposal-workspace.store.ts` (`orientation` default `'portrait'`); `proposal-workspace-draft.service.ts` `onTemplateChange` — не читает `tpl.orientation`; shell ribbon Lucide segment; `builder-inspector` chips Книжная/Альбомная; Claude MCP analysis 2026-08-25
- **Key Constraints:** PO — менять ориентацию только в шаблоне; КП зеркалит; geometry law #6 обновить
- **Planned Deliverable:** remove KP toggle; wire template.orientation; Lucide на builder chips; docs
- **Validation Path:** store/shell/draft/page specs; tsc

CONFLICT KEYS:
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-shell.component.ts`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-shell.component.html`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-shell.component.spec.ts`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.store.ts`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.store.spec.ts`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.ts`;
`frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-draft.service.ts`;
`frontend/src/app/pages/commercial/proposals/demo/proposal-workspace-demo.page.ts`;
`frontend/src/app/pages/commercial/proposals/demo/proposal-workspace-demo.page.html`;
`frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`;
`frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts`;
`docs/pages/kp-workspace-geometry.md`;
`docs/pages/kp-workspace.page.md`

## Domain preflight

- **Проверено:** PO — шаблон альбомный, превью КП книжное; segment на КП «смысла нет» — перенос визуала на шаблон.
- **Корень:** store orientation локальный, не связан с `DocumentTemplate.orientation`.
- **НЕ:** не менять A4 overlay geometry laws 1–5; не трогать PDF print pipeline кроме потребления orientation; не второй write-path ориентации в quotation.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — SoT ориентации = шаблон

При выборе/смене шаблона в draft (`onTemplateChange` / эквивалент):

- Читать `tpl.orientation` (`'portrait' | 'landscape'`, default portrait).
- Прокинуть в shell `[orientation]` (computed/read-only).
- Убрать возможность юзеру менять ориентацию на КП.

Реализация store (выбрать одну, зафиксировать в коде):

- **A (предпочтительно):** удалить `setOrientation` / `orientationChange`; `orientation` = computed from `draft.selectedTemplate()?.orientation ?? 'portrait'`.
- **B:** оставить signal, но писать **только** из template bind (не из UI).

### ШАГ 2 — Убрать segment с KP ribbon

`proposal-workspace-shell`: удалить markup Lucide portrait/landscape segment и `orientationChange` output (input `orientation` **оставить** — sheet class `kp-ws-shell--portrait|landscape` нужен).

Demo page: убрать `(orientationChange)` / local setOrientation UI.

### ШАГ 3 — Lucide на builder (куда «переносим коньки»)

В `builder-inspector` chips ориентации: добавить Lucide `RectangleVertical` / `RectangleHorizontal` (те же, что были на KP), сохранить aria-pressed / pi-focus-ring / emit `orientation` PATCH. Не emoji.

### ШАГ 4 — Docs

`kp-workspace-geometry.md` law #6 переписать:

> Lucide segmented orientation control живёт на **редакторе шаблона** (builder inspector). КП workspace **только отображает** `template.orientation` (read-only). Запрет emoji/текстовой кнопки ориентации на КП.

Обновить `kp-workspace.page.md` (store orientation = derived).

### ШАГ 5 — Тесты

- Shell: нет кнопок ориентации; class следует input.
- Store/draft: смена шаблона landscape → orientation landscape.
- Demo/page: нет setOrientation из UI.
- Inspector: icons present; emit orientation.

## КРИТЕРИИ ПРИЁМКИ

1. КП с landscape-шаблоном → лист альбомный без кликов на КП.
2. На КП ribbon нет portrait/landscape toggle.
3. В builder inspector — Lucide segment/chips для ориентации; PATCH сохраняет; после F5 KP отражает.
4. Geometry laws 1–5 не регрессируют (overlay panel).
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
6. Focused jest: shell + store + draft + inspector (+ demo если ломается).

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.
