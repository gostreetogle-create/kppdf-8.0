═══════════════════════════════════════════════════════════════
TZ-DOC-326: Builder/texts — убрать legacy category, показать categoryId
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Doc-Constructor (types + hints)
ЗАВИСИМОСТИ: TZ-DOC-323 DONE (backend enum removed). Желательно после
  TZ-DOC-316 (categories service/page) и вместе/после DOC-325 (palette hints).
LAYER: 3

CONFLICT KEYS:
frontend/src/app/shared/services/pi-text-blocks.service.ts;
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts;
frontend/src/app/pages/doc-constructor/texts/texts.page.ts;
frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts;
docs/agent-checklists/TZ-DOC-326.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (аудит Cursor 2026-08-02)
═══════════════════════════════════════════════════════════════

1. Backend DOC-323 убрал `category` enum с TextBlock.
2. Frontend `pi-text-blocks.service.ts` всё ещё типизирует
   `category: TextBlockCategory` / optional category на create — **drift**.
3. Builder toolbar (и tool-pane template) рендерят `@if (t.category)` hint —
   мёртвое/ложное поле после 323; пользователь не видит реальную категорию
   (`categoryId`).
4. Открытые DOC-316/317 как раз про category reference — этот TZ стыкует
   отображение в builder insert list с каноном categoryId.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Выровнять `TextBlock` / create/update DTO types на frontend:
  `categoryId` (+ populated name если API отдаёт), удалить legacy `category`
  из типов и любых form fields, которые ещё шлют enum.

ШАГ 2 — В insert UI (tool-pane после 325; toolbar если ещё жив) hint =
  имя категории (из populate / map id→name через PiTextBlockCategoriesService),
  не `t.category`.

ШАГ 3 — Texts catalog/editor: колонка/фильтр только categoryId (если ещё
  не закрыто DOC-316 — не дублировать работу: skip уже сделанное, добить gaps).

ШАГ 4 — Grep `category:` / `TextBlockCategory` / `'legal'|'intro'` в
  frontend doc-constructor + shared services → 0 legacy writes.
ШАГ 5 — Checklist + Executor report (auto).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- backend text-block (уже 323)
- DOC-324 nav IA
- Склад/материалы

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `rg "t\\.category|category\\?: TextBlockCategory|TextBlockCategory" frontend/src`
   по doc-constructor + pi-text-blocks → 0 релевантных hits (кроме archive comments).
2. Insert list показывает понятное имя категории или «—», не legacy enum.
3. Create/update text-block с фронта не шлёт `category` enum (network/DTO).
4. frontend tsc/jest targeted PASS; Executor report (auto) в checklist.

═══════════════════════════════════════════════════════════════
ПРОМПТ ДЛЯ ЛОКАЛЬНОГО АГЕНТА
═══════════════════════════════════════════════════════════════

Прочитай docs/AI-AGENT-GUIDE.md, GEMINI.md и tasks/TZ-DOC-326-textblock-categoryid-ui.md.
Выполни TZ-DOC-326. Перед архивом — ## Executor report (auto) в
docs/agent-checklists/TZ-DOC-326.md. Push не делать.
