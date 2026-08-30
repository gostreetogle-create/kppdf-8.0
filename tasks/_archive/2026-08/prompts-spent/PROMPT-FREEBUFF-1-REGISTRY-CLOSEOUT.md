# PROMPT — Freebuff #1 · REGISTRY-CRUD-UNIFY CLOSEOUT (срочно, build red)

## LOADER (вставить в чат Freebuff #1)

```text
Executor kppdf-8.0 · D:\kppdf-8.0 · main · Freebuff #1

1) git fetch origin ; git merge origin/main
2) Прочитай и выполни по порядку:
   - GEMINI.md
   - .agents/skills/kppdf-executor-loop/SKILL.md
   - docs/TZ-NX-BUILD-INTEGRITY.md
   - tasks/TZ-NX-REGISTRY-CRUD-UNIFY.md          ← спека
   - tasks/PROMPT-FREEBUFF-1-REGISTRY-CLOSEOUT.md ← полный чеклист (§ ниже)
   - docs/agent-checklists/TZ-NX-REGISTRY-CRUD-UNIFY.md ← claim/gates
3) Claim уже есть → продолжай. Удали мусор tasks/_active/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md
4) До archive: nx build kppdf-web green (последний gate). Не трогать pages/studio/**
5) Работай до archive + push. Не останавливайся mid-wave.
```

---

**Старт: немедленно.** Один агент на `kppdf-web` до archive.  
Полная инструкция — блок ниже.

```text
Ты — executor kppdf-8.0 (Freebuff #1). Репо: D:\kppdf-8.0, ветка main.
Волна: TZ-NX-REGISTRY-CRUD-UNIFY — ДОЗАКРЫТИЕ. Предыдущий агент оставил BLOCKED:
build падает, archive нет, matrix 0/120.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + docs/TZ-NX-BUILD-INTEGRITY.md (обязательно)
        + docs/PO-CANON.md
Спека: tasks/TZ-NX-REGISTRY-CRUD-UNIFY.md
Промпт-оригинал: tasks/PROMPT-FREEBUFF-REGISTRY-CRUD-UNIFY.md
UI: docs/ui-rules.md + docs/DIALOG-COOKBOOK.md + docs/UX-FORM-CANON.md
Платформа: docs/pages/registries.page.md

═══════════════════════════════════════════════════════════════
CLAIM (если claim уже есть — обнови Gates, не пересоздавай с нуля)
═══════════════════════════════════════════════════════════════
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main
3) tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md + checklist
   docs/agent-checklists/TZ-NX-REGISTRY-CRUD-UNIFY.md
4) УДАЛИ или переименуй ошибочный blocker-файл
   tasks/_active/TZ-NX-DOCSTUDIO-S3-TEXT-BLOCKS.md (это не claim S3, мусор)
5) Проверь: нет второго active на kppdf-web кроме REGISTRY

═══════════════════════════════════════════════════════════════
ИЗВЕСТНОЕ НА ДИСКЕ (WIP, не в git)
═══════════════════════════════════════════════════════════════
+ registry-crud-actions.ts, registry-simple-crud.ts, units-dialog-host.ts
+ simple-registry-form-dialog.component.ts
+ organizations/supply/passports registries частично wired
+ constructor/** удалён
+ departments убран из catalog
+ evidence/matrix.json status BLOCKED 0/120
+ data-access write methods для org/supply/passport/units

═══════════════════════════════════════════════════════════════
БЛОКЕРЫ — ЧИНИТЬ В ЭТОЙ ВОЛНЕ (порядок)
═══════════════════════════════════════════════════════════════

A) BUILD (без green build — STOP на всё остальное)
   1. simple-registry-form-dialog.component.ts: TS2322
      `field.type` → PiInputType (cast/map, не raw string)
   2. table-template-form-dialog.component.ts — если TS2339 FormGroup.controls
   3. registries-catalog-test-mocks.ts + @jest/globals:
      либо exclude в apps/kppdf-web/tsconfig.app.json (как в archived
      TZ-NX-REGISTRIES-CATALOG-MOCKS-BUILD-FIX), либо убрать jest import
      из prod graph — файл импортируется только из *.spec.ts
   4. Прогон до: cd frontend-nx && pnpm exec nx build kppdf-web → exit 0

B) SPECS
   Починить stale expectations: departments, copy-key, open-constructor,
   /constructor nav specs — под новую реальность (constructor снесён).
   Цель: cd frontend-nx && pnpm test — зелёный для registries/** +
   layout specs; foreign composition/** failures → known_limitation с путём.

C) ФУНКЦИОНАЛ (дожать по TZ шаги 2–3)
   - organizations, supply-requests, product-passports: полный CRUD + диалоги
   - modules: Копировать + клиентский поиск
   - text-blocks, table-templates: createRegistryCrudActions + Копировать
   - materials/products/modules: единый порядок действий через factory где возможно

D) BROWSER (шаг 4 — не пропускать)
   node start.mjs --nx --no-browser
   admin/admin123, viewport 1200×800
   Матрица «реестр × 12» в чеклисте + matrix.json обновить (не 0/120)
   Скриншоты: docs/agent-checklists/evidence/TZ-NX-REGISTRY-CRUD-UNIFY/
   ОСОБО: text-blocks и table-templates — rich-text, колонки, селекты

E) DOCS + ARCHIVE
   - docs/pages/registries.page.md, docs/CAPABILITY-LEDGER.md (снять Конструктор)
   - Integrity slot, Executor report (full 40-char SHA)
   - tasks/_archive/2026-08/TZ-NX-REGISTRY-CRUD-UNIFY.done.md + ARCHIVE_MARKER
   - _NOW.md, PAGE-TZ-INDEX (одна строка)
   - commit/push ТОЛЬКО своих путей (git add поимённо)

═══════════════════════════════════════════════════════════════
ЧУЖОЙ WIP — НЕ ТРОГАТЬ, НЕ КОММИТИТЬ
═══════════════════════════════════════════════════════════════
backend/src/common/**, backend/src/modules/auth/**, backend/src/modules/unit/**
docker-compose.yml, docs/pages/login.page.md
frontend/src/app/pages/doc-constructor/studio/**
pages/studio/** (S2 закрыт, не трогать)
docs/TZ-NX-BUILD-INTEGRITY.md, PO-CANON, cursor docs — только если TZ требует

═══════════════════════════════════════════════════════════════
GATES (nx build — ПОСЛЕДНИМ, exit 0 обязателен)
═══════════════════════════════════════════════════════════════
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm test
cd frontend-nx && pnpm lint
pnpm architecture:check
cd frontend-nx && pnpm exec nx build kppdf-web
node start.mjs --nx --no-browser + browser matrix

Не писать DONE / не archive пока nx build не green.
Не останавливаться mid-wave. Отчёт PO: archive path, matrix X/120, head SHA,
known_limitation.
```
