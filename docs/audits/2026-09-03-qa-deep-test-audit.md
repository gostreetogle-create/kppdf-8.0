# Аудит: глубокое QA-тестирование kppdf-8.0 (сборка, тесты, бизнес-логика)

**Дата:** 2026-09-03
**Автор:** Claude Code (сессия QA/Architect review, `agent_id: claude`, без Claim — analysis-only, product-код не менялся)

> **Formalized TZ (Cursor, 2026-09-03):** wave [`WAVE-QA-GATES-2026-09.md`](../agent-checklists/WAVE-QA-GATES-2026-09.md) ·  
> Q1 `TZ-BACKEND-QA-OUTPUT-VAT-MOCK` · Q2 `TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD` ·  
> Q3 `TZ-FRONTEND-QA-APP-LAYOUT-FLAKY` · Q4a `TZ-BACKEND-QA-LINT-UNUSED-IMPORTS` ·  
> Q4b `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1` · prompts HOLD `PROMPT-FREEBUFF-QA-GATES-*.md`
**Объём:** запуск полного стека (Mongo + NestJS backend + Angular frontend), typecheck/test/lint gates backend и frontend, точечный разбор бизнес-логики модуля `studio-document` ↔ `quotation` (КП).
**Не входит в объём:** полный E2E-обход всех ~90 backend-модулей и ~50 frontend-страниц — при таком размере ERP это отдельная многочасовая волна (см. `tasks/PROMPT-FREEBUFF-*`), не одна QA-сессия. Ниже — то, что реально воспроизведено и проверено по коду.

---

## 0. Итог запуска (пункт 1 алгоритма)

| Проверка | Результат |
|---|---|
| `node start.mjs --check` | OK (Mongo уже поднят и healthy, порт 27017 занят внешним контейнером) |
| `node start.mjs --no-browser` | Backend поднялся на `:3000`, frontend — на `:4200` |
| `GET http://localhost:4200/` | 200 |
| `GET http://localhost:3000/api/health` | 200 |
| `cd backend && tsc --noEmit` | **PASS**, без ошибок |
| `cd frontend && tsc --noEmit` | **PASS**, без ошибок |
| `cd backend && pnpm test` | **FAIL** — 1 из 123 test suite, 6 тестов (см. ТЗ-1) |
| `cd frontend && pnpm test` | **FAIL** — 1 из 196 test suite, 1 тест (см. ТЗ-3) |
| `cd backend && pnpm lint` | **FAIL** — 45 errors, 200 warnings (см. ТЗ-4) |
| `cd frontend && pnpm lint` | **FAIL** — 200 errors, 17 warnings (см. ТЗ-4) |

Фатальных ошибок сборки нет (typecheck зелёный на обеих сторонах), поэтому первым пунктом алгоритма («ТЗ на устранение ошибок сборки») это не является — но **test/lint gates из `GEMINI.md` §«Проверки» сейчас красные на `main`**, что само по себе противоречит Definition of Done проекта. Это отдельно зафиксировано в ТЗ-4.

Стек оставлен запущенным (`backend` pid из lock, `frontend` :4200) для последующей ручной проверки; остановить — `pnpm stop:start`.

---

## ТЗ-1: Сломан тестовый дубль `dataResolver` в `StudioOutputService` — падает whole-suite gate

**Тип:** Баг тестов (регрессия, блокирует `pnpm test` на backend)

### 📍 Контекст и локализация
- `backend/src/modules/studio-document/studio-output.service.spec.ts` — дефолтный mock `dataResolver` (строки 58–72) и отдельный mock в тесте `finalize` (строки 176–185).
- Реальный `StudioOutputService.renderStudioDocument` (`backend/src/modules/studio-document/studio-output.service.ts:135`) вызывает `this.dataResolver.resolveOrganizationVatRate(...)` — метод существует в проде (`studio-data-resolver.ts:262`), но отсутствует в обоих тестовых дублях.
- Влияние на целостность: это не прод-баг (реальный `StudioDataResolverService` метод реализует), но это **красный gate на main** — по контракту `GEMINI.md` `pnpm test` обязателен для DONE; сейчас любой агент, запускающий backend-тесты, увидит FAIL и не поймёт сразу, что это не его код сломал.

### 👣 Шаги для воспроизведения
1. `cd backend && pnpm test`
2. Смотреть `Summary of all failing tests` → `studio-output.service.spec.ts`

### ❌ Фактический результат
```
TypeError: this.dataResolver.resolveOrganizationVatRate is not a function
```
6 тестов из `describe('StudioOutputService (Wave 9–10)')` падают: `preview` (×4), `finalize` (×2).

### ✅ Ожидаемый результат
`pnpm test` зелёный; тестовые дубли отражают текущий контракт `StudioDataResolverService`.

### 🛠 Предлагаемое решение
1. В дефолтном `dataResolver` (`studio-output.service.spec.ts:58-72`) добавить:
   ```ts
   resolveOrganizationVatRate: jest.fn().mockResolvedValue(20),
   ```
2. В отдельном `dataResolver` внутри теста `finalize bakes snapshot...` (строки 176–185) — то же самое.
3. Прогнать `pnpm test` — должен остаться зелёным (122→123 suites).

**Риски:** нулевые — правка только тестового дубля, прод-код не трогается. Стоит также проверить, нет ли других `.spec.ts` в `studio-document/*`, создающих собственный ad-hoc `dataResolver` mock тем же паттерном (по коду — только этот файл).

---

## ТЗ-2: `organizationId` принимается, но не используется в `StudioQuotationLifecycleService` — нет проверки принадлежности КП к организации

**Тип:** Ошибка бизнес-логики / пробел в целостности данных (не подтверждённая как активно эксплуатируемая, но нарушающая инвариант мультиорганизационной модели)

### 📍 Контекст и локализация
- `backend/src/modules/studio-document/studio-quotation-lifecycle.service.ts`:
  - `ensureLinkedQuotation(doc, organizationId)` (строки 30–60): если `doc.linkedQuotationId` уже установлен, метод делает `this.quotationService.findById(...)` и **никогда не сверяет** `quotation.organizationId` с переданным `organizationId`.
  - `syncQuotationItems(doc, organizationId)` (строки 62–89): параметр `organizationId` **не используется вообще** внутри тела метода (это же поймал ESLint: `'organizationId' is defined but never used` в `studio-quotation-lifecycle.service.ts:64:5`, см. вывод `pnpm lint` backend). Метод пишет в `quotationService.update(quotationId, {...})` без какой-либо org-проверки.
  - Само `QuotationService.findById` / `QuotationService.update` (`backend/src/modules/quotation/quotation.service.ts:139-155, 157+`) тоже не фильтруют по org — это чисто lookup по `_id`.
- Для сравнения: в проекте уже есть осознанный паттерн `OrgScopeGuardInterceptor` (`backend/src/common/interceptors/org-scope.interceptor.ts`) — но он работает **только на уровне HTTP-контроллера** (пост-фильтрация ответа) и **не защищает внутренние service-to-service вызовы**, к которым относится весь `StudioQuotationLifecycleService`.
- Сейчас `doc.linkedQuotationId` выставляется только изнутри `ensureLinkedQuotation` (строка 55) при создании новой КП с тем же `organizationId` — то есть в штатном потоке рассинхронизации org нет. Но:
  - Параметр `organizationId` во всех трёх методах (`ensureLinkedQuotation`, `syncQuotationItems`, `updateQuotationStatus`) явно задуман как граница проверки (сигнатура выглядит как «действуй в рамках этой организации»), а по факту это мёртвый параметр в двух из трёх мест — что расходится с намерением автора кода и является скрытой архитектурной дырой на будущее (миграции данных, ручные правки в Mongo, будущий рефакторинг, который откроет `linkedQuotationId` для PATCH).

### 👣 Шаги для воспроизведения (демонстрация пробела, не прод-эксплойт)
1. Взять studio-document с `linkedQuotationId`, указывающим на КП из **другой** организации (например, через прямую правку в Mongo или гипотетический будущий баг в `ensureLinkedQuotation`).
2. Вызвать `updateQuotationStatus(doc, 'sent', organizationId)` от имени пользователя из «своей» организации.
3. Метод молча обновит чужую КП — ни `ensureLinkedQuotation`, ни `syncQuotationItems` не бросят ошибку несоответствия организации.

### ❌ Фактический результат
`organizationId` — параметр без функции; нет ассерта «связанная КП принадлежит этой организации» нигде в lifecycle-сервисе.

### ✅ Ожидаемый результат
При расхождении `quotation.organizationId` и переданного `organizationId` — явный `ForbiddenException`/`NotFoundException` (как это уже принято в `OrgScopeGuardInterceptor` — «не палим существование чужого ресурса», значит здесь тоже уместнее `NotFoundException`).

### 🛠 Предлагаемое решение
1. В `ensureLinkedQuotation` после `this.quotationService.findById(...)` (строка 39) добавить проверку:
   ```ts
   if (String(quotation.organizationId) !== organizationId) {
     throw new NotFoundException('Quotation not found');
   }
   ```
2. В `syncQuotationItems` — либо переиспользовать ту же проверку через `ensureLinkedQuotation`, либо прогнать `findById` внутри и свериться с `organizationId` перед `update`.
3. Добавить unit-тест на кейс «doc.organizationId ≠ linked quotation.organizationId → бросает NotFoundException», используя `systematic-debugging`/`tdd` skill (red → green).
4. Убрать соответствующее ESLint-исключение — после фикса `'organizationId' is defined but never used` должно само исчезнуть.

**Риски:** низкие — добавление проверки может задеть сценарий, где org намеренно передаётся `null`/`undefined` (bootstrap/system-user, как в `OrgScopeGuardInterceptor`). Нужно явно решить: пропускать проверку для system-user (по аналогии с интерцептором) или требовать non-null `organizationId` во всех вызовах lifecycle-сервиса — сверить оба места вызова (`studio-output.service.ts` / контроллер) перед мержем.

---

## ТЗ-3: Порядко-зависимый (flaky) тест в `app-layout.component.spec.ts`

**Тип:** Баг тестов / нестабильность CI

### 📍 Контекст и локализация
- `frontend/src/app/layout/app-layout.component.spec.ts`.
- При полном прогоне (`pnpm test` по всему frontend) падает тест **`TZ-UX-317: ← disabled + aria-disabled when the store cannot go back`** (строка 131) с `back` вызванным несмотря на `disabled=true`.
- При изолированном прогоне только этого файла (`jest --testPathPattern=app-layout.component.spec`) тот тест **проходит**, но падает **другой**: **`TZ-UX-321-FIX: left rail owns back; right rail owns forward; no app-nav-gutter`** — при этом `expect(received).toContain('width: 64px')` получает на входе не строку стилей, а сериализованный исходник класса компонента (артефакт: `received` — не тот DOM/строковый объект, который ожидает assert).
- То, что **разные тесты одного файла ломаются в зависимости от порядка/окружения запуска**, — классический признак утечки состояния между `it()`: подозреваемые источники — общий `jest.fn()` (`back`/`forward`) без `mockClear()` в `beforeEach`, либо `PiChromeToolsService`/`AppHistoryStore` синглтон-состояние, не сбрасываемое между тестами (`setTools`/`clear` из TZ-UX-322 соседствует по файлу).

### 👣 Шаги для воспроизведения
1. `cd frontend && pnpm test` — фиксируется fail на `TZ-UX-317: ← disabled...`.
2. `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="app-layout.component.spec"` — тот тест зелёный, fail переезжает на `TZ-UX-321-FIX`.

### ❌ Фактический результат
Набор тестов файла нестабилен относительно порядка/контекста запуска — гарантии «зелёный `pnpm test` = рабочий чат back/forward и left/right rail» на самом деле нет.

### ✅ Ожидаемый результат
Все тесты файла детерминированно зелёные независимо от порядка запуска (whole-suite и isolated-file дают одинаковый результат).

### 🛠 Предлагаемое решение
1. Добавить/проверить `beforeEach`, что `back`/`forward` (`jest.fn()`, строка ~20) явно очищаются (`mockClear()`) и что `TestBed`/`fixture` пересоздаются на каждый `it` (не переиспользуется общий `fixture` между тестами без `detectChanges()`/`destroy()`).
2. Проверить `PiChromeToolsService` (или что стоит за `setTools`/`clear`, TZ-UX-322) на предмет синглтон-состояния, живущего дольше одного теста — если это Angular service без `providedIn: 'root'` override в TestBed, соседний `it` может видеть «протухшие» tools/rail-классы.
3. После фикса — прогнать оба варианта (whole-suite и `--testPathPattern`) несколько раз (`--runInBand` тоже) и убедиться в идентичном результате.

**Риски:** правка только тестовой инфраструктуры (моки/`beforeEach`), прод-код `app-layout.component.ts` трогать не должно понадобиться — но если утечка состояния происходит из-за реального синглтон-сервиса без метода сброса, может понадобиться добавить `reset()`-метод в сам сервис (тогда риск шире, нужно свериться с другими потребителями `PiChromeToolsService`).

---

## ТЗ-4: `pnpm lint` красный и на backend, и на frontend — DoD-gate из `GEMINI.md` сейчас не проходит

**Тип:** Оптимизация / процессный долг (нарушение собственного DoD проекта)

### 📍 Контекст и локализация
- `GEMINI.md` §«Проверки» требует `pnpm lint` зелёным в затронутой области для DONE. Прогон по всему репо (не «затронутая область», а baseline) показывает, что gate **уже красный без единой моей правки**:
  - **Backend:** 45 errors (в основном `@typescript-eslint/no-unused-vars` — забытые импорты DTO-декораторов: `IsNotEmpty`, `IsMongoId`, `IsBoolean`, `IsIn`, `Types`, `NotFoundException`, `BadRequestException` и т.д. в ~15 файлах) + 200 warnings (`no-explicit-any`).
  - **Frontend:** 200 errors от кастомного правила `kppdf-frontend-architecture/no-raw-ui-values` (raw hex-цвета и px-отступы в `component styles`, минуя OKLCH/token-канон Paper & Ink) + 17 warnings `no-implements-oninit-in-pages` (страницы всё ещё реализуют `OnInit`/`AfterViewInit` вместо `signals + effect()`).
  - Примеры файлов с `no-raw-ui-values`: `pages/doc-constructor/tables/table-template-dialog.component.ts:552`, `pages/doc-constructor/texts/{data-field-picker-dialog,text-block-editor}.component.ts`, `pages/production/blocks/gantt-bars.component.ts:851`, `shared/ui/card/pi-showcase-card.component.ts:178`, `shared/ui/pi-table-tree.component.ts:35`, `shared/ui/rich-text/pi-rich-text-editor.component.ts:166` — список неполный, полный вывод в логе прогона.

### 👣 Шаги для воспроизведения
```
cd backend && pnpm lint
cd frontend && pnpm lint
```

### ❌ Фактический результат
Оба lint-прогона завершаются `exit code 1`.

### ✅ Ожидаемый результат
`pnpm lint` зелёный (или явно задокументированный baseline/exclude, как это уже сделано для `architecture:check --write-baseline`, — сейчас для `no-raw-ui-values` такого механизма нет).

### 🛠 Предлагаемое решение
Не одна правка, а волна уборки — предлагаю разбить на 2 отдельных TZ по `tasks/PROMPT-FREEBUFF-*` (рутина, не Claude-токены):
1. **Backend unused-imports wave:** механическая чистка ~15 файлов (`pnpm exec eslint --fix` покроет часть автоматически, остальное — точечно). Низкий риск.
2. **Frontend `no-raw-ui-values` wave:** каждый hex/px заменить на существующий OKLCH-токен/spacing-утилиту из `frontend/src/styles.css` — это уже разметка канона, но нужно построчно сверять, какой токен ближе к текущему сырому значению (риск визуальной регрессии — обязательно смотреть DOM/скриншот до/после на затронутых страницах: doc-constructor tables/texts, production gantt, showcase card, rich-text editor).
3. Для `no-implements-oninit-in-pages` (17 файлов, warnings, не errors) — отдельная волна миграции на `effect()`, ниже приоритет.

**Риски:** frontend-волна (raw-ui-values) — самая рискованная, там не должно быть «слепой» замены токенов без визуальной проверки; backend-волна — низкий риск, чисто dead-code cleanup.

---

## Что не входило в объём этой сессии

- Полный прогон Playwright/UI-сценариев по всем ~50 страницам frontend — не запускался (нет готового сценария под рукой; `docs/pages/*.page.md` даёт per-page acceptance, но это отдельная волна).
- Ревью остальных ~88 backend-модулей на предмет аналогичных «мёртвых параметров»/org-scope пробелов, как в ТЗ-2 — стоило бы сделать грепом `eslint --rule 'no-unused-vars: error'` по всем сервисам с параметром `organizationId`, это отдельная, механическая, но полезная задача.
- `docker-compose.yml` изменён в рабочем дереве (`M docker-compose.yml` в `git status`, не мой diff) — не анализировался, так как это чужой незакоммиченный WIP (см. `docs/how-to-connect-ai.md` — не трогать чужие незакоммиченные правки).
