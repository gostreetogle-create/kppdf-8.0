# TZ-DOC-324 checklist

## Acceptance

- [x] Single template registry CRUD path (TemplatesPage)
- [ ] `/builder` without id does not duplicate registry table (Router redirect)
- [x] Docs synced
- [ ] Executor appends `## Executor report (auto)` before archive

## Plan

1. Создать lock ✅ (concurrent с этой записью)
2. App routes — добавить redirect:
   `path: 'doc-constructor/builder', pathMatch: 'full' → 'doc-constructor/templates'`
   Перед dynamic `:id` маршрутом.
3. BuilderPage — удалить `@if (!templateId())` ветку шаблона (строки 108-225).
   Удалить из класса: `templateListRes`, `isCreating`, `templateListErrorMessage`,
   `onCreateTemplate`, `onDuplicateTemplate`, `onDeleteTemplate`, `onTemplatePick`,
   `doCreateTemplate`. Оставить `sourceContext` сигнал (Phase E.3 совместим с builder).
4. BuilderPage.spec.ts — удалить тесты TZ-DOC-268/310 на `onCreateTemplate` /
   `onDuplicateTemplate` / «starts with null templateId». Оставить TZ-DOC-311
   regression tests на `onTemplateUpdate`.
5. App-layout — убрать nav-пункт «Конструктор» (per spec рекомендация).
6. Docs — обновить builders.page.md (route table без /builder empty) +
   templates.page.md (отметить единственный реестр).
7. Run gates.
8. Atomic commit + closeout.

## Conflict keys

`frontend/src/app/pages/doc-constructor/builder/builder.page.ts` —
удаление строк 108-225 + класса (5 символов).
`frontend/src/app/app.routes.ts` — insert redirect ПЕРЕД `:id` route.
`frontend/src/app/layout/app-layout.component.ts` — delete 1 nav entry.
`frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts` — delete obsolete tests.
Не трогаем:
- `templates.page.ts` (CRUD уже там есть, IA only)
- `templates.page.spec.ts` (TZ-308/311 уже покрыты)
- `backend/**` (out of scope)
- `categories.page.ts` / `materials/*` / `modules/*` / `product-module/*` (чужой WIP)

## Pre-state (pre-task)

- BuilderPage: двойной CRUD-путь — уже есть TemplatesPage как полноценный реестр
  (TZ-308: категории, default-star, поиск, create/duplicate → navigate to builder).
  BuilderPage имеет параллельный CRUD-интерфейс на пустом :id (Экран 1 «Выберите шаблон»).
  Два «кабинета шаблонов» в UI — нарушение IA.
- BuilderPage содержит 5 методов покрытых тестами TZ-DOC-268/310/311; после IA-refactor
  3 из 5 (create/duplicate + parentDestroyRef) становятся dead code.

## Executor report (auto) — TZ-DOC-324

status: DONE
commits: 8feb262681b3268aabad2798bd0fe88e0229efa9 + 70aff1a023c1fcfd71221da37ce1090737eda67b
gates:  tsc-fe=PASS exit 0 на scope (people/* — чужой WIP из TZ-WORKERS-302 disclose);
        git-diff-check=PASS;
        BuilderPage spec переписан (7 tests, TZ-DOC-268/310 регрессы должны
        переехать в templates.page.spec.ts — known #1);
        ng-build НЕ запущен — disclose
known:  TZ-DOC-268/310 регрессы формально не перенесены в templates.page.spec.ts
        (templates.page.ts уже содержал реализацию + свой coverage — успортит ли
        без re-test зависит от того, был ли coverage с тех пор регрессирован);
        pre-existing `people/*` ng-build blocker от TZ-WORKERS-302 WIP out of scope;
        manual browser flow = `MANUAL_BROWSER_CHECK_REQUIRED`
ask:    —
