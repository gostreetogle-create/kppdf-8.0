# TZ-DOC-308 — Verification Checklist

**Task:** Категории шаблонов документов — справочник + форма + выбор категории в
setup-диалоге + колонка/фильтр в реестре шаблонов (поверх backend контракта TZ-DOC-307).

**Closed:** 2026-08-02 · branch `main` · wake-up session re-verification on
`freebuff/wake-up-tz-doc-308-ling-*`
**Commit:** `73cc8a0` — `feat(doc-templates): complete categorized document template workflow`
**Archive:** `tasks/_archive/2026-08/TZ-DOC-308.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-308-template-category-ui.lock`

## Design decision (documented in git history)

TZ-DOC-308 был реализован как **отдельная страница** `DocumentTemplateCategoriesPage`
(route `/doc-template-categories`, пункт навигации «Категории шаблонов» в разделе
«Справочники»), а не как встроенная секция в `categories.page.ts` (material/product tree).

- `73cc8a0` — фича целиком (page + form dialog + service + setup dialog + templates registry + tests).
- `b1c3873` — починен дубликат `destroyRef` (TS2300) от параллельной незакоммиченной работы.
- `67d9e0b` — удалён мёртвый `docCatService` injection из `categories.page.ts`: у
  doc-template categories уже есть dedicated page; инъекция не использовалась.

Встроенная секция в `categories.page.ts` НЕ добавлялась намеренно (дубликат функциональности
и возврат удалённого dead code). Соответствующие тесты покрыты в
`document-template-categories.page.spec.ts` (11 кейсов: loading/error/empty/filled, search,
create/edit dialogs, delete confirm + reload, system-actions disabled, toggle active + rollback).

## Verification log (wake-up session 2026-08-02, tree @ adc72b9)

### Gate: frontend tsc — PASS (exit 0)
```bash
$ cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
(no diagnostics; exit 0)
```

### Gate: targeted jest — PASS (4 suites / 32 tests)
```bash
$ cd frontend && pnpm exec jest document-template-categories document-template-category-form-dialog categories.page --no-coverage
PASS src/app/shared/services/pi-document-template-categories.service.spec.ts
PASS src/app/pages/dictionaries/document-template-category-form-dialog.component.spec.ts
PASS src/app/pages/dictionaries/document-template-categories.page.spec.ts
PASS src/app/pages/dictionaries/categories.page.spec.ts
Test Suites: 4 passed, 4 total
Tests:       32 passed, 32 total
```

### Gate: ng build (development) — PASS (exit 0)
```bash
$ cd frontend && pnpm exec ng build --configuration=development
Application bundle generation complete.
```

### Gate: git diff --check — PASS
```bash
$ git diff --check
(no output)
```

### Original closeout evidence (archive `TZ-DOC-308.done.md`)
Frontend jest 56/56 targeted + 689/689 full; ng build PASS; backend 50/50 targeted +
315/315 full; code review PASS; git diff --check PASS. Browser: MANUAL_BROWSER_CHECK_REQUIRED
(dev-stack login 401 for all known credentials).

## Known limitations

- Edit-диалога шаблона в архитектуре нет (setup-диалог поддерживает create/duplicate);
  требование «edit preselects текущую категорию» покрыто create/duplicate + registry filter.
- Глубокие browser E2E-сценарии не выполнялись (доступ к dev-стеку/авторизации отсутствовал) —
  MANUAL_BROWSER_CHECK_REQUIRED.
- Параллельная сессия оставила незакоммиченные правки в чужом worktree (не мои, не смешивать).
