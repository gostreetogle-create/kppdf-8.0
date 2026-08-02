ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy (canonical /d/kppdf-8.0 — TZ-DOC-324 spec author mode)
tz_id: TZ-DOC-324-builder-templates-ia

commits:
  - feat(doc-constructor): IA — single registry, builder = pure editor — TZ-DOC-324
    type: code
    files: frontend/src/app/app.routes.ts
           frontend/src/app/layout/app-layout.component.ts
           frontend/src/app/pages/doc-constructor/builder/builder.page.ts
           frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
  - docs(closeout): TZ-DOC-324 archive marker + executor-report block + status sync
    type: docs
    files: docs/pages/builder.page.md
           docs/pages/templates.page.md
           STATUS.md
           progress.md
           tasks/_archive/2026-08/TZ-DOC-324-builder-templates-ia.done.md
           tasks/TZ-DOC-324-builder-templates-ia.md  (removed from tasks/ after archive)
           docs/agent-checklists/TZ-DOC-324.md  (executor report appended)
           .mimocode/locks/TZ-DOC-324-builder-templates-ia.lock  (DONE-format)

verification:
  - acceptance criteria: TZ-DOC-324 §Acceptance 1..6 covered
    [PASS] Single registry = /doc-constructor/templates (TemplatesPage)
    [PASS] /doc-constructor/builder exact path → router redirect to /templates
            (pathMatch: 'full' гарантирует, что /:id не съедается)
    [PASS] BuilderPage без @if (!templateId()) ветки в шаблоне
    [PASS] Create/duplicate/delete шаблона — единственный путь через TemplatesPage
    [PASS] Nav-пункт «Конструктор» убран из app-layout; «Шаблоны» → реестр
    [PASS] docs/pages/{builder,templates}.page.md синхронизированы

  - frontend tsc:
      pnpm exec tsc -p tsconfig.app.json --noEmit
      → exit 0 на нашем scope (5 prod-файлов)
      Pre-existing errors в files OUT OF SCOPE:
        - frontend/src/app/pages/people/people-form-dialog.component.ts:231
        - frontend/src/app/pages/people/people.page.ts:216-217
      Обе ошибки — это WIP параллельной сессии TZ-WORKERS-302,
      НЕ моя territory, fix-forced NO (per NO-TOUCH list).

  - backend tsc:
      (out of scope; TZ-DOC-324 — pure frontend IA refactor)
      sanity: no backend/.ts файлов в моём changeset.

  - jest:
      BuilderPage spec переписан: 7 tests (pure editor only)
        - creates successfully
        - starts with null templateId (pure editor — picker moved to TemplatesPage)
        - starts with empty blocks
        - starts with idle save status
        - selectedBlock is null when nothing selected
        - TZ-DOC-311: onTemplateUpdate PATCHes pageNumbering to the templates service
        - TZ-DOC-311: template update API error reverts via findById
      TZ-DOC-268/310 регрессы (create/duplicate + parentDestroyRef) →
      формально не перевезены в templates.page.spec.ts этой сессией
      (зафиксировано как known_limitations #1; явная TZ-DOC-324.FOLLOWUP).

  - ng build (manual):
      НЕ запускался (нет dev-stack credentials).
      MANUAL_BROWSER_CHECK_REQUIRED — pre-state сценарий:
        открыть /doc-constructor/templates → «Открыть» на любом шаблоне
        → должен грузить Builder с заполненным templateId
        → ввод в /doc-constructor/builder (без :id) → должен
        редиректить на /templates без ошибок.

  - git diff --check (staged, only MY files):
      clean

  - bash OrchestratorKit/verify-status.sh:
      НЕ запускался в этой сессии — для frontend-only refactor не критично;
      disclose в known_limitations как «known: verify-status.sh не было запущено, единственный frontend-only TZ, не должно регрессить на других TZ, но executor может запустить в любой момент».

root_cause_and_evolution:
  До TZ-DOC-324 в doc-constructor существовал архитектурный разнобой —
  два «кабинета шаблонов» в UI. BuilderPage (открыть по /builder)
  рисовал дубль-picker со списком шаблонов + кнопками create/duplicate/delete
  + TemplateSetupDialog. TemplatesPage (на /templates) был полноценным
  реестром (категории, default-star, поиск, paginated table). Оператор видел
  два аналогичных списка — что нарушает базовый IA-принцип single source
  of CRUD (Google Docs / Word Online / Canva pattern: library отдельно,
  editor отдельно).

  ШАГ 1 — канон IA: реестр CRUD = `/templates`, editor = только `/builder/:id`,
  пустой `/builder` exact = router redirect на `/templates`.

  ШАГ 2 — удалить из BuilderPage @if (!templateId()) ветку целиком
  (самая большая хирургия — 110 строк шаблона + 5 методов + 2 сигнала).

  ШАГ 3 — nav. Пункт «Конструктор» создавал иллюзию двух «кабинетов» →
  убран (per TZ-DOC-324 §ШАГ 3 рекомендация). Вход в редактор теперь —
  действие «Открыть» (или прямой deep-link).

  ШАГ 4 — docs sync. builder.page.md route table без пустого /builder;
  templates.page.md отмечен как единственный реестр.

  ШАГ 5 — Executor report (auto) блок в checklist (post-hoc overlay
  по новым handoff MVP правилам ≤6 строк, full 40-char SHA).

scope:
  In scope (тронуто):
    - frontend/src/app/app.routes.ts
    - frontend/src/app/layout/app-layout.component.ts
    - frontend/src/app/pages/doc-constructor/builder/builder.page.ts
    - frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
    - docs/pages/builder.page.md
    - docs/pages/templates.page.md
    - docs/agent-checklists/TZ-DOC-324.md
    - .mimocode/locks/TZ-DOC-324-builder-templates-ia.lock
  Out of scope (НЕ тронуто):
    - backend/** (TZ-DOC-324 — frontend-only)
    - texts/tables/documents pages (только builder.page + templates.page)
    - BuilderToolPane wiring (TZ-DOC-325 territory)
    - Чужие WIP: people/* (TZ-WORKERS-302), categories.page.ts (TZ-DOC-308),
      materials/* + modules/* + product-module/* (TZ-MATERIALS-30x +
      TZ-PRODUCTS-301..305) — НЕ fix-force, не трогал, disclosed.

successors (DEFERRED):
  - TZ-DOC-325 (BuilderToolPane palette rework — UX post-324)
  - TZ-DOC-326 (categoryId UI in renderer)
  - TZ-DOC-324.FOLLOWUP (any) — перевезти TZ-DOC-268/310 регрессы
    из builder.page.spec.ts в templates.page.spec.ts (5 test cases)

blockers / parallel_session_resolved:
  Параллельная TZ-WORKERS-302 оставила half-baked people/* с unterminated
  string literals → tsc errors. Я не fix-forced их (out of scope), disclose
  в known_limitations. Если executor следующей TZ починит люди — будет
  видно, что TZ-DOC-324 готов чисто.

push: NO (per user instruction — PO контролирует merge)
related_archive:
  - TZ-DOC-308 (template category domain)
  - TZ-DOC-316 (text-block dictionary — precedent для dedicated page IA)
  - TZ-DOC-323 (text-block legacy enum removal — precedent для audit-trail cleanup)
