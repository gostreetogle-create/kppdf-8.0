═══════════════════════════════════════════════════════════════
TZ-DOC-324: IA — один реестр шаблонов, builder только редактор
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UX / Doc-Constructor IA
ЗАВИСИМОСТИ: нет (можно параллельно с DOC-325 по разным файлам осторожно;
  лучше после/до DOC-325 sequential — оба трогают builder.page.ts →
  выполнять **до** DOC-325 или в одном агенте по очереди).
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/doc-constructor/builder/builder.page.ts;
frontend/src/app/pages/doc-constructor/templates/templates.page.ts;
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/pages/builder.page.md;
docs/pages/templates.page.md;
docs/agent-checklists/TZ-DOC-324.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (аудит Cursor 2026-08-02)
═══════════════════════════════════════════════════════════════

В сайдбаре «Документы» сразу два входа в шаблоны:
- `/doc-constructor/builder` — «Конструктор» → пустой BuilderPage рисует
  **второй** список шаблонов + Создать / Открыть / Дублировать / Удалить
- `/doc-constructor/templates` — «Шаблоны» → полноценный реестр
  (категории, default-star, поиск, те же create/duplicate → navigate builder)

Оператор видит два «кабинета шаблонов». Профессиональный редактор
(Google Docs / Word Online / Canva): library отдельно, editor отдельно.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Канон IA (зафиксировано PO/архитектором):
  - Реестр CRUD = только `/doc-constructor/templates`
  - Редактор = только `/doc-constructor/builder/:id`
  - `/doc-constructor/builder` без id → **redirect** на `/doc-constructor/templates`
    (или минимальный empty «откройте шаблон в реестре» + одна ссылка;
     предпочтение: Router redirect, без дубль-таблицы).

ШАГ 2 — Удалить из BuilderPage ветку `@if (!templateId())` со списком,
  create/duplicate/delete. Create/duplicate остаются на TemplatesPage
  (уже есть TemplateSetupDialog).

ШАГ 3 — Nav labels (app-layout):
  - «Шаблоны» → реестр
  - «Конструктор» → либо убрать пункт, либо вести на `/templates` с query
    `?open=builder-hint`, либо оставить только deep-link когда есть :id
    (рекомендация: пункт «Конструктор» убрать из nav; вход в редактор —
    действие «Открыть» в реестре). Если убираете nav-пункт — обновить
    command-palette / любые hardcoded links.

ШАГ 4 — docs/pages/builder.page.md + templates.page.md синхронизировать.
ШАГ 5 — Checklist + ## Executor report (auto) перед archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- backend/**
- texts/tables/documents pages (кроме ссылок, если есть)
- BuilderToolPane wiring (это TZ-DOC-325)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В UI нет двух таблиц «список шаблонов» с CRUD.
2. `/doc-constructor/builder` без id не показывает дубль-реестр.
3. Create/duplicate/delete шаблона — только с `/templates` (или явно
   документированный один путь).
4. `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` exit 0
   (или ng build:dev если tsc blocked pre-existing — disclose).
5. Unit/smoke: builder empty-state specs обновлены под redirect.
6. Executor report (auto) в docs/agent-checklists/TZ-DOC-324.md.

═══════════════════════════════════════════════════════════════
ПРОМПТ ДЛЯ ЛОКАЛЬНОГО АГЕНТА
═══════════════════════════════════════════════════════════════

Прочитай docs/AI-AGENT-GUIDE.md, GEMINI.md и tasks/TZ-DOC-324-builder-templates-ia.md.
Выполни TZ-DOC-324. Перед архивом допиши ## Executor report (auto) в
docs/agent-checklists/TZ-DOC-324.md. Push не делать.
