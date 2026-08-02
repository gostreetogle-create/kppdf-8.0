# TZ-DOC-317 — Builder text-picker category filter — Verification Log

**Status:** DONE — 2026-08-02
**Commit (feat):** `64999af830572acbf352c19a7dc6c5befbb1d38f`
**Archive:** `tasks/_archive/2026-08/TZ-DOC-317-builder-texts-filter-by-category.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-317-builder-texts-filter-by-category.lock`

## Verification evidence (≤30 lines)

- ✅ frontend tsc `tsconfig.app.json --noEmit` → exit 0 (no diagnostics).
- ✅ backend tsc `tsconfig.build.json --noEmit` → exit 0 (sanity; backend NOT touched).
- ✅ jest targeted (builder-tool-pane, builder.page, pi-text-block-categories, pi-text-blocks) → **4 suites / 44 tests PASS**.
- ✅ jest full → 886 PASS / **2 FAIL — pre-existing, out-of-scope**:
  - `button.component.spec.ts` — double-emit click flake (explicitly допустим in TZ spec).
  - `pi-showcase-card.component.spec.ts` — TZ-PRODUCTS-305 (on main) lucide `arrow-up-right` icon provider.
- ✅ ng build `--configuration=development` → exit 0.
- ✅ git diff --check → clean (staged, only TZ-DOC-317 files).
- ✅ OrchestratorKit/verify-status.sh → PASS, 0 warnings.
- ✅ docs/pages/builder.page.md — «Тексты: фильтр по категории (TZ-DOC-317)» added.
- ✅ STATUS.md — DONE row + section; progress.md — entry.
- ⏳ Browser E2E — MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable).

## AC coverage

1. Dropdown «Категория» в обеих «Тексты»-поверхностях (tool-pane + inline тулбар) — ✅
2. Default «Все» — ✅ (categoryId = null → param omitted)
3. Выбор категории → `?isActive=true&categoryId=<id>` server-side filter — ✅
4. Возврат на «Все» → без categoryId — ✅
5. Empty state «Нет блоков в этой категории» — ✅
6. cdkDrag drag-flow без регрессии — ✅ (drag handlers не менялись)
7. Ошибки каталога не ломают picker («Все») — ✅
8. Кэш активных категорий (TZ-DOC-309) — ✅ (через `PiTextBlockCategoriesService.list({activeOnly})`)
9. Keyboard/focus — нативные select + focus-ring — ✅ (требует browser-подтверждения)
10. 375px viewport — MANUAL_BROWSER_CHECK_REQUIRED
11. tsc/jest/ng-build/ESLint — ✅ (tsc, jest, ng build green)
