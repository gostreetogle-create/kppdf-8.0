# TZ-OPS-305: page.md — категории шаблонов + категории текстов

PAGES: /doc-template-categories ; /dictionaries/text-block-categories  
PAGE_DOCS: document-template-categories.page.md ; text-block-categories.page.md  
Источник gaps: `docs/DOMAIN-MAP.md` §1.3  
WAVE: `tasks/_backlog/ops/WAVE-PAGE-DOCS-GAPS.md`

РОЛЬ АГЕНТА: docs-only  
ЗАВИСИМОСТИ: TZ-OPS-304 DONE (gap list)  
LAYER: 4  
CONFLICT KEYS: docs/pages/document-template-categories.page.md; docs/pages/text-block-categories.page.md; docs/pages/README.md; docs/pages/PAGE-TZ-INDEX.md; docs/DOMAIN-MAP.md; docs/agent-checklists/TZ-OPS-305.md; progress.md; docs/agent-checklists/_active-map.md

Проверено: `app.routes.ts` paths `doc-template-categories` → `document-template-categories.page.ts` (TZ-DOC-308); `dictionaries/text-block-categories` → `text-block-categories.page.ts` (TZ-DOC-334); `docs/pages/_template.md`; эталон `form-profiles.page.md`; DOMAIN-MAP gap rows NO.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Живые экраны справочников уже в продукте; `page.md` отсутствуют → агенты путают с `/categories` (материалы/изделия) и с TableTemplate.
2. `DocumentTemplateCategory` ≠ `Category` ≠ `TextBlockCategory`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Создать `docs/pages/document-template-categories.page.md` по `_template.md` (≤120 строк): route, chrome/chips, API `/document-template-categories`, dialogs, services, signals, system-categories не edit/delete, TZ-DOC-308. READ page `.ts` + service.
2. Создать `docs/pages/text-block-categories.page.md` аналогично (API `/text-block-categories`, TZ-DOC-334/316).
3. Строки в `docs/pages/README.md` индекс + `PAGE-TZ-INDEX.md`.
4. В `DOMAIN-MAP.md` gap-таблице: оба route → yes + имена файлов (не раздувать DOMAIN-MAP).
5. Checklist Integrity slot: docs-only / FIC N/A (мета-docs; page.md = цель TZ).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Любой `frontend/**` / `backend/**` / `desktop/**`
- `/categories` page.md, tables, texts product code
- SALES-*, DOC-TABLES-305, DOC-343 WIP
- deploy

known_limitation: не рефакторить UI; только зафиксировать факт.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Оба `.page.md` существуют; в каждом: Route, API, Dialogs, Services, «Не путать» с Category/TableTemplate.
2. README + PAGE-TZ-INDEX обновлены; DOMAIN-MAP gaps для этих 2 routes = yes.
3. `git diff --name-only` без `frontend/` `backend/` `desktop/`.
4. ## Executor report (auto) ≤15 строк → archive → commit+push.

Verification:
```
Test-Path docs/pages/document-template-categories.page.md
Test-Path docs/pages/text-block-categories.page.md
git diff --name-only --cached
```
