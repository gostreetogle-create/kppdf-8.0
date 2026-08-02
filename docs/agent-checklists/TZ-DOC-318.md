# TZ-DOC-318 — Builder topbar category-filter polish — Verification Log

**Status:** DONE — 2026-08-02
**Commit (feat):** `<feat-sha>`
**Commit (closeout):** `<closeout-sha>`
**Archive:** `tasks/_archive/2026-08/TZ-DOC-318-builder-texts-topbar-category-filter.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-318-builder-texts-topbar-category-filter.lock`

## Verification evidence (≤30 lines)

- ✅ frontend tsc `tsconfig.app.json --noEmit` → exit 0 (no diagnostics).
- ✅ backend tsc `tsconfig.build.json --noEmit` → exit 0 (sanity; backend NOT touched).
- ✅ jest targeted (builder-text-filter, builder-tool-pane, builder.page, pi-text-block-categories, pi-text-blocks) → **5 suites / 45 tests PASS**.
- ✅ ng build `--configuration=development` → exit 0.
- ✅ git diff --check → clean (staged, only TZ-DOC-318 files).
- ✅ OrchestratorKit/verify-status.sh → PASS, 0 warnings.
- ✅ docs/pages/builder.page.md — «Filter URL-sync + breadcrumb badge (TZ-DOC-318)» added.
- ✅ STATUS.md — DONE row + section; progress.md — entry.
- ✅ Rebase-merge на новый main (TZ-DOC-324 pure-editor) — конфликты builder.page.ts/­spec разрешены, tsc+jest+ng-build зелёные.
- ⏳ Browser E2E — MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable).

## AC coverage

1. Dropdown «Категория» в обеих «Тексты»-поверхностях (tool-pane + inline тулбар) — ✅ (317 base)
2. Default «Все»; опции из `PiTextBlockCategoriesService.list({ activeOnly })` — ✅
3. Выбор → URL `?categoryId=<id>` + filter signal + список фильтруется + badge в шапке — ✅
4. Возврат на «Все» → URL без `categoryId` → badge «Все» → все блоки видны — ✅
5. Клик по badge → сброс фильтра + navigate без query-param — ✅
6. F5-refresh сохраняет фильтр через URL — ✅
7. Shareable link `?categoryId=<id>` открывается с активным фильтром — ✅
8. Two-picker sync через `BuilderTextFilterService` (единый источник правды) — ✅
9. Keyboard/focus — нативный select + focus-ring button — ✅ (browser-подтверждение ручное)
10. 375px viewport — MANUAL_BROWSER_CHECK_REQUIRED
11. tsc / jest / ng-build — ✅ зелёные

## Executor report (auto) — TZ-DOC-318

status: DONE
commits: <feat-sha> (feat: text-category topbar polish — sync + URL persist + breadcrumb) + <closeout-sha> (docs: closeout archive + executor-report + status sync)
gates: tsc-be=PASS; tsc-fe=PASS; jest=5 suites/45 tests PASS; ng-build=exit 0; git-diff-check=clean; verify-status=PASS
known: rebase-merge на main с TZ-DOC-324 (pure-editor rewrite) — конфликты разрешены, импорт-блок восстановлен (324 оставил broken marker), BuilderToolPaneComponent добавлен в imports; browser E2E=MANUAL_REQUIRED; legacy enum → TZ-DOC-326 successor; pre-existing flakes button.component/pi-showcase-card вне scope
ask: —
