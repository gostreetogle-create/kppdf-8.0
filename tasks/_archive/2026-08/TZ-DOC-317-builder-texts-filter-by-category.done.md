ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
tz_id: TZ-DOC-317-builder-texts-filter-by-category
commit: 64999af830572acbf352c19a7dc6c5befbb1d38f — feat(builder): filter text-blocks by category in picker (TZ-DOC-317)
closeout_commit: eefb7b6cf0031f32b43c205a693bec9115fc0647 — docs(closeout): TZ-DOC-317 archive + verification log + status sync
verification:
  - acceptance criteria: TZ-DOC-317 §Критерии приёмки 1..16 — covered (см. ниже)
  - backend tsc (tsc -p tsconfig.build.json --noEmit): PASS (exit 0, sanity, backend NOT touched)
  - frontend tsc (tsconfig.app.json --noEmit): PASS (exit 0)
  - frontend jest targeted (builder-tool-pane, builder.page, pi-text-block-categories, pi-text-blocks): PASS (4 suites / 44 tests)
  - frontend jest full: 886 PASS / 2 FAIL — both PRE-EXISTING, out-of-scope:
      * button.component.spec.ts — double-emit click flake (explicitly disclosed in TZ spec as допустим)
      * pi-showcase-card.component.spec.ts — TZ-PRODUCTS-305 (on main) lucide `arrow-up-right` icon provider issue
  - ng build --configuration=development: PASS (exit 0)
  - git diff --check: PASS (clean)
  - OrchestratorKit/verify-status.sh: PASS (0 warnings)
  - docs/pages/builder.page.md: UPDATED («Тексты: фильтр по категории (TZ-DOC-317)»)
  - STATUS.md: UPDATED (DONE row + section)
  - progress.md: UPDATED
browser: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack credentials unavailable; unit/integration tests are canonical evidence)

═══════════════════════════════════════════════════════════════
TZ-DOC-317: Builder — фильтр текстов по категории в picker-панели
═══════════════════════════════════════════════════════════════

Реализовано поверх TZ-DOC-315 (backend `?categoryId=<id>` в `/api/text-blocks`, НЕ трогался)
и TZ-DOC-316 (`PiTextBlockCategoriesService` с кэшем активного каталога, dedicated page).

1. Shared state — `frontend/src/app/pages/doc-constructor/builder/builder-text-filter.service.ts` (NEW):
   - root-provided `BuilderTextFilterService` с одним сигналом `categoryId: Signal<string | null>`
     (`null` = «Все») + `reset()`; единый источник правды для tool-pane и inline dropdown
     (TZ-DOC-317 §ШАГ 4 — «выбрать простой путь», без event-plumbing).

2. Tool pane — `builder-tool-pane.component.ts`:
   - dropdown «Категория» НАД списком «Тексты» (внутри секции, не в общем toolbar);
   - опции — активные категории из `TextBlockCategoriesService.list({ activeOnly: true })`
     (TZ-DOC-309 кэш, повторных GET при переоткрытии builder нет);
   - `textsRes` httpResource URL пересобирается по сигналу:
     `'/api/text-blocks?isActive=true'` → `'/api/text-blocks?isActive=true&categoryId=<id>'`;
   - empty state при фильтре: «Нет блоков в этой категории»; при «Все»: «Нет сохранённых текстов»;
   - категория: dropdown disabled пока каталог грузится; ошибка каталога → «Все», picker не падает.

3. Builder page — `builder.page.ts`:
   - inline «Тексты» dropdown в тулбаре получил тот же фильтр (id `bd-text-category-filter`);
   - `textsRes` пересобирается через общий `BuilderTextFilterService.categoryId`;
   - шаг e: two-way URL binding `?category=<id>` ↔ сигнал (read в queryParamMap subscribe,
     write в `effect()` с `replaceUrl: true`); loop guard через `route.snapshot.queryParamMap`
     — скипает избыточный `navigate()` при первом прогоне эффекта (фикс regression TZ-DOC-268
     cancel-теста: navigate не вызывается без реального изменения);
   - шаг f: смена templateId → `textFilter.reset()` (фильтр не «переезжает» на другой шаблон).

4. Service — `pi-text-blocks.service.ts`:
   - `TextBlockListParams.categoryId?: string` + HttpParams.set('categoryId', …) в `list()`.

5. Тесты (4 suites / 44 PASS):
   - `builder-text-filter.service.spec.ts` (NEW, 3): null-старт, set, reset;
   - `builder-tool-pane.component.spec.ts` (NEW, 5): опции dropdown, URL rebuild с categoryId,
     сброс на «Все», empty state, disabled-во-время-загрузки (httpResource + flushEffects паттерн
     из materials.page.spec);
   - `builder.page.spec.ts` (+6): inline фильтр рендерится, categoryId в URL, reset → без categoryId,
     step e URL roundtrip (merge+replaceUrl), step f reset при смене шаблона;
   - `pi-text-blocks.service.spec.ts` (+2): categoryId HttpParams set/omitted.

6. Docs — `docs/pages/builder.page.md`: секция «Тексты: фильтр по категории (TZ-DOC-317)».

Известные ограничения:
- Browser E2E (ручной сценарий 375px, console) — MANUAL_BROWSER_CHECK_REQUIRED.
- Legacy enum `category` в UI picker не пробрасывается — компетенция TZ-DOC-318 (successor).
- Pre-existing jest flakes НЕ из этой работы: button.component.spec (double-emit click) и
  pi-showcase-card.component.spec (TZ-PRODUCTS-305 icon provider) — disclosed, не fix-forced.
- TZ-DOC-310..314 (builder canvas/inspector) не затрагивались.

related_archive:
  - tasks/_archive/2026-08/TZ-DOC-308.done.md (filter-секция паттерн для registry)
  - tasks/_archive/2026-08/TZ-DOC-315.done.md (backend contract `?categoryId`)
  - tasks/_archive/2026-08/TZ-DOC-316-text-block-category-reference-and-picker.done.md (PiTextBlockCategoriesService + UI)
  - tasks/_archive/2026-08/TZ-DOC-309.done.md (active-cache pattern)
