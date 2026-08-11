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

2. **products.page.spec.ts** (`renderPage` ~171–183, `afterEach` `httpMock.verify()` ~191–193):
   - Страница после DICT-320 вызывает `PiDictionaryLabelsService.active('productKind')`
     → `GET /api/dictionary-labels?scope=productKind` (`products.page.ts` ~1095).
   - Harness flush'ит только `GET /api/products`; dictionary-labels остаётся open →
     `Expected no open requests, found 1: GET /api/dictionary-labels?scope=productKind`
     на почти всех кейсах (~21 fail).

3. **module-detail.page.spec.ts** (`beforeEach` ~105–113, `afterEach` ~116–119):
   - Flush module + cost-preview + optional `catalog-appearance`.
   - `afterEach` делает `httpMock.match(() => true)` и **`req.flush({})`** на любой leftover.
   - `PiDictionaryLabelsService.active` (`pi-dictionary-labels.service.ts` ~135–137):
     при `result.ok` делает `result.data.filter(...)`. Flush `{}` → `data` не массив →
     `TypeError: result.data.filter is not a function` (BOM panel / labels inject).
   - Полный suite: 3 fail / 1 pass; одиночный `-t "passes rootKind"` может PASS
     (порядок/leftover) — чинить **весь** describe, не один кейс.

4. Эталон правильного flush labels: `pi-dictionary-labels.service.spec.ts` ~35–50
   (`flush([ { _id, scope, key, label, sortOrder, isActive, isSystem }, ... ])`).

5. Известно с OPS-311 closeout: не регрессия extract BOM; pre-existing harness drift.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Preference A — **только specs** (не трогать production `.ts` страниц/сервиса,
пока без этого нельзя закрыть AC; если понадобится defensive `Array.isArray` в
`active()` — спросить PO/Cursor, не делать молча).

1. **products.page.spec.ts**
   - В `renderPage` (после flush list / `tickMicrotask`) явно закрыть
     `GET …/dictionary-labels?scope=productKind` (и любой другой scope, если
     появится в match) массивом labels (можно минимальный active good/service/work
     или `[]` — но форма = **массив**, не `{}`).
   - Допустимо: маленький local helper `flushDictionaryLabels(httpMock)` в этом файле.
   - `httpMock.verify()` в afterEach должен проходить без open requests.

2. **module-detail.page.spec.ts**
   - В `beforeEach` после module/cost (и appearance) flush dictionary-labels
     (scopes, которые реально уходят — обычно `productKind` и/или `materialKind`
     из BOM panel) **массивом**.
   - Исправить `afterEach`: не flush'ить leftover словарных URL через `{}`.
     Варианты (выбрать один, тонкий):
     a) leftover `dictionary-labels` → `flush([])` или валидный массив;
     b) leftover settings → `{}` ок;
     c) либо `expect`+flush известных URL в beforeEach так, что leftover пуст.
   - Все 4 теста describe зелёные **подряд** (не только `-t` один).

3. **Gates** — команды в AC. Deploy НЕ. Commit/push на origin/main — да
   (Freebuff worktree OK только если SHA оказывается на `origin/main`).

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- frontend/src/app/pages/products/products.page.spec.ts
- frontend/src/app/pages/modules/module-detail.page.spec.ts
- progress.md / STATUS.md / docs/agent-checklists/_active-map.md / checklist / archive
  (closeout по GEMINI.md)

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Production pages/components/services (products.page.ts, module-detail.page.ts,
  pi-dictionary-labels.service.ts, BOM panel) — без явного блока от Cursor/PO
- Чужие specs, baseline architecture:check, backend, deploy scripts
- Новые фичи каталога / UI copy

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `cd frontend && pnpm exec jest pages/products/products.page.spec.ts --no-coverage`
   → suite PASS (все тесты файла).
2. `cd frontend && pnpm exec jest pages/modules/module-detail.page.spec.ts --no-coverage`
   → suite PASS (все 4 теста подряд).
3. `cd frontend && pnpm exec jest pages/modules/module-detail.page.spec.ts pages/products/products.page.spec.ts --no-coverage`
   → оба suite PASS.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
   (если трогали только specs — всё равно прогнать).
5. Prettier/ESLint на изменённых `*.spec.ts` → PASS.
6. Diff только CONFLICT KEYS (+ board/checklist/archive). Нет product UI refactor.

known_limitation:
- Другие page-specs с тем же leftover-`flush({})` антипаттерном не в scope
  (successor, если всплывут).
- Authenticated browser smoke — НЕ.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

GEMINI.md continuous: claim → code → gates → archive
`tasks/_archive/2026-08/TZ-OPS-312.done.md` + lock
`.mimocode/locks/TZ-OPS-312-catalog-specs-dict-flush.lock`
Checklist DONE; `_active/` clear; commit+push → origin/main.
Deploy НЕ.
