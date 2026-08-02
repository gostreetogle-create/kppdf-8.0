═══════════════════════════════════════════════════════════════
TZ-DOC-325: Builder insert UX — одна палитра, без дубль-меню
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Doc-Constructor (builder chrome)
ЗАВИСИМОСТИ: желательно после TZ-DOC-324 (оба трогают builder.page.ts —
  sequential). Согласовать с открытыми TZ-DOC-317/318: после этого TZ
  topbar-dropdown «Тексты» исчезает → **supersede/закрыть DOC-318**
  (topbar category filter) как неактуальный; category filter — на left palette
  (DOC-317 или этот TZ, см. ШАГ 4).
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts;
frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts;
docs/pages/builder.page.md;
docs/pages/builder-tool-pane.page.md;
docs/agent-checklists/TZ-DOC-325.md;
tasks/TZ-DOC-318-builder-texts-topbar-category-filter.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (аудит Cursor 2026-08-02)
═══════════════════════════════════════════════════════════════

1. `BuilderToolPaneComponent` существует (drag palette texts/tables), но
   **не подключён** в `builder.page.ts` (нет import / нет в template).
2. Вставка блоков сейчас — **горизонтальный toolbar** с dropdown
   «Тексты» / «Таблицы» / «Фото» + toggle Редактор/Превью.
3. Docs (`builder.page.md`, `builder-tool-pane.page.md`) всё ещё описывают
   3-pane + spacer/decorations в tool-pane — **ложная документация**.
4. Профессиональный шаблонный редактор: слева Insert/Assets, центр canvas,
   справа Properties. Top bar — document chrome (save, view), не каталог
   библиотеки блоков.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (решение зафиксировано)
═══════════════════════════════════════════════════════════════

ШАГ 1 — Вернуть left `app-builder-tool-pane` в shell:
  layout: tool-pane (≈280) | canvas (1fr) | inspector (≈320).
  Прокинуть addBlock / уже существующие outputs на BuilderPage handlers.

ШАГ 2 — Убрать из builder-toolbar дублирующие dropdown «Тексты» и «Таблицы»
  (и связанный textsRes/tablesRes UI в page, если только для dropdown).
  Оставить в toolbar: title/subtitle, Редактор|Превью, Фото (upload),
  save-status / reload если есть.

ШАГ 3 — Tool-pane cleanup:
  - Убедиться spacer секции нет (DOC-319).
  - Убрать мёртвые hints `t.category` enum (после DOC-323) — показывать
    имя через categoryId / без hint до DOC-326.
  - Docs tool-pane: вычистить spacer/decorations/data если их нет в UI
    (decorations уже в inspector — не возвращать в palette).

ШАГ 4 — Category filter для текстов:
  - Если TZ-DOC-317 ещё active — реализовать фильтр **в tool-pane**, не в topbar.
  - TZ-DOC-318: пометить SUPERSEDED в archive/README (topbar texts dropdown gone)
    или выполнить no-op closeout с pointer на 325/317.

ШАГ 5 — Checklist + Executor report (auto).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Registry IA (DOC-324) кроме неизбежных merge в builder.page.ts
- backend text-block schema
- tables/texts catalog pages (кроме deep-links)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В editor-режиме видны 3 панели; tool-pane смонтирован.
2. Нет второго каталога текстов/таблиц в top dropdown.
3. Drag-from-palette + «+» добавляют блок (регресс существующих handlers).
4. docs/pages/builder*.md соответствуют UI.
5. frontend typecheck/build gate + targeted builder specs.
6. Executor report (auto) в docs/agent-checklists/TZ-DOC-325.md.
7. DOC-318 явно SUPERSEDED или closed с причиной.

═══════════════════════════════════════════════════════════════
ПРОМПТ ДЛЯ ЛОКАЛЬНОГО АГЕНТА
═══════════════════════════════════════════════════════════════

Прочитай docs/AI-AGENT-GUIDE.md, GEMINI.md и tasks/TZ-DOC-325-builder-insert-palette.md.
Выполни TZ-DOC-325 (после DOC-324 если оба в очереди). Перед архивом —
## Executor report (auto) в docs/agent-checklists/TZ-DOC-325.md. Push не делать.
