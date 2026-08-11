═══════════════════════════════════════════════════════════════
TZ-OPS-312: catalog page specs — dictionary-labels HTTP flush
═══════════════════════════════════════════════════════════════

> Domain preflight: это **test harness**, не домен продаж. Counterparty/Organization
> не затрагиваются. Цель — зелёные Jest для каталожных page-specs после DICT-320.

РОЛЬ АГЕНТА: Frontend QA / test harness (specs only; product UI не «улучшать»)

ЗАВИСИМОСТИ: TZ-DICT-320 DONE; TZ-OPS-311 DONE (BOM panel path =
  `shared/ui/composition/…` — импорты в module-detail.spec уже на shared)

LAYER: 3 (правка существующих `*.page.spec.ts`)

CONFLICT KEYS: frontend/src/app/pages/products/products.page.spec.ts; frontend/src/app/pages/modules/module-detail.page.spec.ts

PAGES: /products ; /modules/:id
PAGE_DOCS: products.page.md ; module-detail.page.md (docs touch только если
  меняете поведение страницы — **не требуется** при fix-only specs)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено (HEAD `88556846` / origin/main, 2026-08-11):

1. `cd frontend && pnpm exec jest pages/modules/module-detail.page.spec.ts pages/products/products.page.spec.ts --no-coverage`
   → **2 suites fail, 24 fail / 1 pass**.

2. **products.page.spec.ts**:
   - Страница после DICT-320 вызывает `PiDictionaryLabelsService.active('productKind')`
     → `GET /api/dictionary-labels?scope=productKind`.
   - Harness flush'ит только `GET /api/products`; dictionary-labels остаётся open.

3. **module-detail.page.spec.ts**:
   - Flush module + cost-preview + optional `catalog-appearance`.
   - `afterEach` делает `httpMock.match(() => true)` и `req.flush({})` на любой leftover.
   - `PiDictionaryLabelsService.active` при `result.ok` делает `result.data.filter(...)`;
     `{}` приводит к TypeError.

4. Эталон правильного flush labels: `pi-dictionary-labels.service.spec.ts`
   (`flush([ { _id, scope, key, label, sortOrder, isActive, isSystem }, ... ])`).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Preference A — **только specs**.

1. **products.page.spec.ts**
   - В `renderPage` явно закрыть `GET …/dictionary-labels?scope=productKind`
     (и любой другой scope, если появится в match) массивом labels.
   - Допустим маленький local helper `flushDictionaryLabels(httpMock)`.

2. **module-detail.page.spec.ts**
   - В `beforeEach` после module/cost (и appearance) flush dictionary-labels
     scopes, которые реально уходят — обычно `productKind` и/или `materialKind`.
   - Исправить `afterEach`: leftover `dictionary-labels` → `flush([])` или валидный массив;
     settings → `{}` ок.
   - Все 4 теста describe зелёные подряд.

3. **Gates** — команды в AC. Deploy НЕ. Commit/push на origin/main — да
   (Freebuff worktree OK только если SHA оказывается на `origin/main`).

═══════════════════════════════════════════════════════════════
РЕЗУЛЬТАТ
═══════════════════════════════════════════════════════════════

- Products harness flushes all pending GET `/api/dictionary-labels` requests with `[]`.
- Module-detail harness flushes dictionary-label requests with `[]` before generic settings cleanup;
  generic leftover cleanup no longer sends `{}` to dictionary-labels.
- Production page, service, BOM, backend, and deploy files were not changed.

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11
closed_by: Buffy / buffy-ops-312
protected_files:
  - frontend/src/app/pages/products/products.page.spec.ts
  - frontend/src/app/pages/modules/module-detail.page.spec.ts
affected_areas:
  - frontend page-spec HTTP test harnesses
verification:
  - acceptance criteria: PASS (products 21/21; module-detail 4/4; combined 25/25)
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (focused Jest suites)
  - lint: PASS (ESLint; Prettier code style PASS with checkout CRLF override)
  - checklist: ADDED and completed
  - progress.md: UPDATED
  - status synchronization: FAIL only on 72 pre-existing historical FWD mismatches; OPS-312 marker/board/archive state is synchronized
  - deploy: NOT RUN
notes: Other page-specs with leftover flush({}) remain out of scope; authenticated browser smoke is not applicable to this specs-only fix.
