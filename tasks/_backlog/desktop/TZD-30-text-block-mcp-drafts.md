═══════════════════════════════════════════════════════════════
TZD-30: MCP text-block drafts (+ category create)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-DESKTOP-DOC-TEXTS #1
DEPENDS ON: TZD-28 DONE; TZD-29 DONE
LAYER: 3
CHECKLIST: docs/agent-checklists/TZD-30.md
PAGES: /doc-constructor/texts
PAGE_DOCS: texts.page.md ; ui-page-chrome.md

РОЛЬ АГЕНТА: Desktop MCP + Backend (только если нужен тонкий API) Engineer

CONFLICT KEYS:
desktop/mcp/src/doc-tools.ts;
desktop/mcp/src/text-block-tools.ts;
desktop/mcp/src/tools.ts;
desktop/mcp/src/text-block-tools.test.ts;
desktop/mcp/src/doc-tools.test.ts;
docs/agent-checklists/TZD-30.md;
docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md;
tasks/_backlog/desktop/WAVE-DESKTOP-DOC-TEXTS.md;
docs/pages/texts.page.md;

Проверено: desktop/mcp/src/doc-tools.ts (TZD-28 draft template);
  backend/.../text-block.schema.ts (tags, isActive, slug unique; НЕТ notes/organizationId);
  texts.page.ts (?editId=, «Архив» для inactive); resolveDefault в text-block.service;
  builder берёт activeOnly=true.

Loose wording: «папка текстов» → TextBlockCategory в БД.

---

## ИСХОДНОЕ

1. MCP умеет пустой draft шаблона (TZD-28) + todo (TZD-29), **не** умеет text-blocks.
2. Библиотека `/doc-constructor/texts` + CRUD API живы.
3. PO: ИИ готовит тексты по полочкам (категориям); менеджер раскладывает на холсте.
4. Org vault / фото / авто-КП — **не** этот TZ.

## ЧТО ДЕЛАТЬ

ШАГ 1: Tools (канон `desktop/mcp/`, паттерн doc-tools)

1. `kppdf_text_block_categories_list` — GET categories (activeOnly).
2. `kppdf_text_blocks_list` — GET blocks, filter `categoryId` (+ optional isActive).
3. `kppdf_text_block_category_create` — создать полочку, если агент не нашёл нужную
   (name + slug; org-scoped как API). Не invent коммерческих названий без запроса.
4. `kppdf_text_block_create_draft`:
   - required: `name`, `categoryId`, `content` (или columns);
   - force `isActive: false`;
   - `tags` включает `ai-draft`;
   - name префикс: `Черновик ИИ — …` (если ещё нет);
   - **запрет** поля `notes` (его нет → 400);
   - перед create: list в категории, сверка имени; при slug 409 — понятная ошибка, без overwrite;
   - после create: `kppdf_import_todo_create` с
     `href: /doc-constructor/texts?editId=<id>` и текстом «проверить и включить Активен»;
   - ответ: `{ textBlockId, todoId | todoError }` — не silent fail todo.

ШАГ 2: Tool descriptions

- Явно: tool **сохраняет** готовый текст из источника агента; не выдумывает юр/цены/гарантию.
- Не называть автосборкой КП.

ШАГ 3: Tests + docs

1. Unit tests как doc-tools (happy path, inactive, 409, missing categoryId → error).
2. Audit note `docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md`.
3. texts.page.md — строка про AI-draft / inactive / todo.
4. `desktop/mcp-runtime` — **не** править как peer; в known_limitation: sync staging = packaging gate.

## НЕ ИЗМЕНЯТЬ

- FE redesign texts/builder (навигация chips уже отдельно)
- Organization photoIds / vault
- Template canvas layout AI
- Silent category fallback в «Общее» из MCP (categoryId обязателен; нет → create category или error)
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. MCP list categories/blocks + create_draft + optional category_create работают.
2. Черновик в вебе: имя с «Черновик ИИ», tag ai-draft, статус Архив (`isActive=false`); нет в builder active picker.
3. Todo с `?editId=` создаётся или tool явно сообщает todoError.
4. Повтор с тем же именем в категории не молча дублирует (409 / pre-check).
5. Gates:
   ```text
   cd desktop/mcp && pnpm test
   cd desktop/mcp && pnpm exec tsc --noEmit
   ```
   (+ BE tests только если трогали backend).
6. Archive `tasks/_archive/2026-08/TZD-30.done.md`; checklist DONE; commit+push; deploy NO.

## known_limitation

- TextBlock без organizationId — multi-org security отдельным TZ.
- Idempotency-key API — follow-up; пока list+409.
- Packaging sync `mcp` → `mcp-runtime` перед MSI — не AC этого TZ.
- Org vault / MCP photo — park `TZ-ORG-DOC-ASSETS-301`.
