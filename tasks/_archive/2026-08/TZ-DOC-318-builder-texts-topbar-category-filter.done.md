ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
tz_id: TZ-DOC-318-builder-texts-topbar-category-filter
commit: <feat-sha> — feat(builder): text-category topbar polish — sync + URL persist + breadcrumb (TZ-DOC-318)
closeout_commit: <closeout-sha> — docs(closeout): TZ-DOC-318 archive + executor-report + status sync
verification:
  - acceptance criteria: TZ-DOC-318 §Критерии приёмки 1..14 — covered (см. ниже)
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0, sanity, backend NOT touched)
  - frontend tsc (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend jest targeted (builder-text-filter, builder-tool-pane, builder.page, pi-text-block-categories, pi-text-blocks): PASS (5 suites / 45 tests)
  - ng build --configuration=development: PASS (exit 0)
  - git diff --check: PASS (clean)
  - OrchestratorKit/verify-status.sh: PASS (0 warnings)
  - docs/pages/builder.page.md: UPDATED («Filter URL-sync + breadcrumb badge (TZ-DOC-318)»)
  - STATUS.md: UPDATED (DONE row + section)
  - progress.md: UPDATED
browser: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable; unit/integration tests are canonical evidence)

REBASE NOTE (worktree context): TZ-DOC-316/317 chain был rebase'нут на новый main
(включая TZ-DOC-324 pure-editor rewrite builder.page.ts). Новые SHA цепочки:
0f30417 (316 feat) → 2676e25 (316 overlay) → 5d42dee (316 closeout) → db54813 (317 feat)
→ e50f2c6 (317 closeout) → 29d2a4c (317 archive marker). Старые SHA из их архивов
(b6ff21e/64999af) ссылаются на pre-rebase историю — фактический контент идентичен.
318 работал поверх rebase-нутых 316/317.

═══════════════════════════════════════════════════════════════
TZ-DOC-318: Builder — topbar UX polish поверх TZ-DOC-317
═══════════════════════════════════════════════════════════════

Реализовано поверх TZ-DOC-317 (filter в picker-tool-pane + BuilderTextFilterService)
и TZ-DOC-315 (backend `?categoryId=<id>`, НЕ трогался). TZ-DOC-318 закрывает три
UX-зазора: URL-синхронизация, breadcrumb badge, two-picker consistency.

a. **Sync (two-picker consistency)** — подтверждено, что `BuilderToolPaneComponent`
   уже читает `selectedCategoryId = computed(() => this.textFilter.categoryId())`
   из `BuilderTextFilterService` (root-provided, НЕ локальный signal) — единый
   источник правды, tool-pane и inline dropdown не расходятся. Минимальный scope
   TZ-DOC-318 по пункту (a) — уже удовлетворён TZ-DOC-317; код не менялся.

b. **URL persistence** — `builder.page.ts`:
   - параметр переименован `?category=` → `?categoryId=` (shareable link + F5);
   - read-side: `route.queryParamMap` subscribe → `textFilter.categoryId.set(...)`;
   - write-side: `effect()` → `router.navigate([], { queryParams: { categoryId },
     queryParamsHandling: 'merge', replaceUrl: true })`;
   - loop-guard через `route.snapshot.queryParamMap` (skip избыточного navigate
     при первом прогоне эффекта; фикс regression TZ-DOC-268 cancel-теста);
   - refresh (F5) и shareable `/doc-constructor/builder?categoryId=<id>` открывают
     builder с уже активным фильтром; `categoryId: null` убирает параметр.

c. **Breadcrumb badge** — в верхней панели builder (рядом с `headerSubtitle`, ТОЛЬКО
   когда `templateId()` есть) чип `builder-category-chip`:
   - лейбл `currentCategoryLabel()` = lookup по `categories()` по `selectedCategoryId()`
     (или «Все», если фильтр не задан);
   - клик → `onCategoryChipReset()` → `categoryId = null` → URL без параметра;
   - стили: hairline + sunrise-tint (Paper & Ink, focus-ring на кликабельном button).

Доп. merge-фиксы (унаследованы от rebase на TZ-DOC-324):
   - восстановлен import-блок builder.page.ts (324 на main заменил его маркером
     `/* _TZ_DOC_324_APPLIED_ */` — broken state; конфликт-резолюция вернула
     полный pruned import set);
   - добавлен `BuilderToolPaneComponent` в imports (ng build TS2345: `$event: Event` —
     компонент рендерился в template без импорта);
   - убран orphaned `}` в конце template (остался от удалённой 324 `@if (!templateId())`
     ветки) и stale `(categoryChanged)` binding (317 использует shared service,
     не output).

Тесты (5 suites / 45 PASS):
   - builder.page.spec.ts: step-e URL roundtrip переписан на `categoryId` param;
     4 новых TZ-DOC-318 кейса: F5-read `?categoryId=`, shareable-link pre-select +
     badge label lookup, chip «Все» без фильтра, chip-click reset. Test isolation:
     describe-scoped BehaviorSubjects + catSvcList mock сбрасываются в beforeEach.

Известные ограничения:
- Browser E2E (375px, keyboard, console) — MANUAL_BROWSER_CHECK_REQUIRED.
- Legacy enum `category` в UI picker не пробрасывается — successor TZ-DOC-326
  (textblock categoryId UI), не scope 318.
- Rebase обновил SHA цепочки 316/317 (см. REBASE NOTE); их архивы ссылаются на
  pre-rebase SHA — disclosed, контент идентичен.
- Pre-existing jest flakes вне scope: button.component.spec (double-emit click),
  pi-showcase-card.component.spec (TZ-PRODUCTS-305 icon provider).
- TZ-DOC-310..314/319/320/322/323/324/325/326, TZ-PRODUCTS-*/TZ-MATERIALS-*/
  TZ-WORKERS-* не затрагивались.

related_archive:
  - tasks/_archive/2026-08/TZ-DOC-308.done.md (template registry filter pattern)
  - tasks/_archive/2026-08/TZ-DOC-315.done.md (backend contract `?categoryId`)
  - tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md
  - tasks/_archive/2026-08/TZ-DOC-317-builder-texts-filter-by-category.done.md
  - tasks/_archive/2026-08/TZ-DOC-324-builder-templates-ia.done.md (pure-editor rewrite, rebase base)
