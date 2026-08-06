# AI Agent Guide — kppdf-8.0

> **Единый онбординг для ИИ-агентов.** Читай этот файл ПЕРВЫМ при входе в проект.
> Этот документ — твой компас: он говорит что делать, как делать, и что НЕ делать.

---

## 1. 🧭 Быстрый старт

### 1.0 Роли агентов

| Роль | Кто | Делает | Не делает |
|------|-----|--------|-----------|
| **Архитектор / TZ-author / future user (Mode A)** | Cursor | Оценка, планы, executable TZ, UX/business smell → TZ, review текстом; **commit+push своих docs/TZ по умолчанию** | Код продукта, длинные build/test, archive closeout как исполнитель |
| **Исполнитель** | Gemini / локальные агенты | Код по TZ, gates, checklist, archive | Выбор roadmap «улучшить всё» без PO |
| **Локальный draft (LIMITED_HELPER)** | LM Studio Qwen via `pnpm lmstudio` | Черновики мелкого кода / объяснения сниппетов | Security review, TZ, archive, deploy, Layer-3 alone |
| **Оркестрация** | OrchestratorKit | STATUS, `_active`/`_archive`, verify-status | Бизнес-логика ERP |

LM Studio: `docs/agents/LM-STUDIO-AGENT.md` · `node scripts/lmstudio-agent/run.mjs --check`

**Cursor как будущий пользователь ERP:** при чтении кода/потоков замечай неудобные шаги, дубли меню/полей/сущностей, нелогичные статусы и противоречия домена — оформляй в TZ, не молчи. Сверяй с планом PO в **`docs/PO-DIARY.md`**.

**Git:** Cursor коммитит и пушит только свои артефакты (rules, skills, `tasks` спеки, checklists). Чужой half-baked `*.ts` не трогать.

Контракты:

- Cursor: `.cursor/rules/cursor-architect.mdc`, `.cursor/rules/po-diary.mdc`, `.agents/skills/cursor-usage/SKILL.md`, `.agents/skills/tz-authoring/SKILL.md`, **`docs/TZ-AUTHORING.md`**, **`docs/PO-DIARY.md`**
- Исполнитель: корневой `GEMINI.md`, `.agents/skills/kppdf-project/SKILL.md`, при kit-flow — `OrchestratorKit/AGENTS.md`

Если ты Cursor и тебя просят имплементировать — отказ по Mode A + путь/черновик TZ для локального агента.

### 1.1 Кто ты (исполнитель)

Ты — ИИ-агент-**исполнитель**, который пишет и редактирует код для **kppdf-8.0**, ERP-системы для управления производством, складом, заказами и документами. Ты работаешь в `D:\kppdf-8.0` на ветке `main`. НИКОГДА не работай в `.freebuff/worktrees/*` — это песочницы Freebuff с устаревшим base (см. `docs/how-to-connect-ai.md`).

### 1.2 Порядок чтения при входе в проект

```
0. docs/how-to-connect-ai.md       ← ПЕРВЫМ: рабочая папка main, запрет .freebuff/worktrees, ритуал старта
1. docs/AI-AGENT-GUIDE.md          ← Ты здесь. Обязательные паттерны, запреты, ритуалы.
1a. docs/PO-DIARY.md               ← Кто PO, планка качества, как хочет работать (канон §1–§4)
1b. docs/TZ-AUTHORING.md           ← Если ПИШЕШЬ или правишь TZ (канон имён, unique, preflight)
1c. docs/AUDIT-METHODOLOGY.md      ← Если АУДИТИШЬ домен / миграцию / чужой diff (не реализация)
2. ARCHITECTURE.md                  ← Полная архитектура: схема, конвенции, зоны ответственности.
3. docs/DEVELOPMENT-PATTERNS.md     ← Конкретные код-паттерны: SilentResult, defineEntity, SubmitGuard.
4. STACK.md                         ← Технологический стек (актуален на 2026-07).
5. docs/paper-and-ink.md            ← Дизайн-система: OKLCH, hairline, focus-ring, WCAG.
6. docs/data-model.md               ← Модель данных (89 сущностей, 11 доменов).
7. docs/pages/README.md             ← Какие страницы есть, их статус.
8. docs/pages/<name>.page.md        ← Документация конкретной страницы (если работаешь с ней).
```

**PO Diary:** после сессии, где появилось новое понимание владельца (вкус, отказ, «как хочу»),
обнови `docs/PO-DIARY.md` §5 (+ канон при необходимости). Правило Cursor: `.cursor/rules/po-diary.mdc`.

**TZ authors (Cursor / любой ИИ):** перед созданием `tasks/TZ-*.md` — всегда
`docs/TZ-AUTHORING.md` + skill `.agents/skills/tz-authoring/SKILL.md`.

**Auditors:** перед крупным audit report — `docs/AUDIT-METHODOLOGY.md`.
Аудит ≠ реализация: evidence + child-TZ, product-код «заодно» запрещён.

### 1.3a Бронь задачи (CLAIM) — исполнителю

До **любой** правки product-кода:

1. Workspace = `D:\kppdf-8.0` (не `.freebuff/worktrees`).
2. TZ в `tasks/_active/<TASK-ID>.md`.
3. Checklist по `docs/agent-checklists/_TEMPLATE.md`:
   Status `CLAIMED / IN PROGRESS` + **Claim slot** (`agent_id`, `claimed_at` ISO, workspace).
4. Сверь `_active-map.md` и чужие `_active` conflict keys → конфликт = STOP.
5. Team Room `claim` — best-effort; **не** замена Claim slot в checklist.
6. READY FOR REVIEW → ждать Cursor/PO PASS → только потом archive/lock.

Подробности дыр (зачем так): `docs/audits/2026-08-04-agent-ops-claim-gaps.md`.

### 1.3 Где что лежит

| Путь | Что там |
|------|---------|
| `frontend/src/app/core/` | Auth, interceptors, silent-http, API tokens |
| `frontend/src/app/pages/` | Business pages (materials, orders, products, builder...) |
| `frontend/src/app/shared/` | UI-компоненты, DSL, утилиты |
| `frontend/src/app/shared/ui/` | Paper & Ink UI primitives (24+ компонентов) |
| `frontend/src/app/shared/dsl/` | DSL: defineEntity, entity-list, submit-guard |
| `frontend/src/app/shared/page/` | Page primitives (header, section, toolbar) |
| `backend/src/modules/` | 19+ feature modules (по доменам) |
| `backend/src/common/` | Guards, interceptors, decorators, seeds |
| `backend/src/database/` | Connection, plugins (softDelete, audit) |
| `docs/` | Вся документация |
| `docs/pages/` | Документация по каждой странице |
| `tasks/` | TZ-задачи (активные) |
| `tasks/_archive/` | Архив завершённых задач |
| `docs/DEVELOPMENT-PATTERNS.md` | Паттерны кода |
| `docs/FEATURE-INTEGRATION-CHECKLIST.md` | **MANDATORY** списки при новой странице/праве/модуле/MCP |
| `docs/agent-checklists/_TEMPLATE.md` | Шаблон checklist + Claim slot |
| `docs/agent-checklists/_active-map.md` | Кто сейчас CLAIMED / RESERVED |
| `docs/audits/2026-08-04-agent-ops-claim-gaps.md` | Аудит дыр claim/closeout |
| `OrchestratorKit/` | Система оркестрации задач (не трогать без TZ) |

---

## 2. 📐 Обязательные паттерны (НАРУШАТЬ НЕЛЬЗЯ)

### 2.0 Feature integration (списки проекта)

Перед DONE любой фичи со страницей, правом, модулем или MCP-tool —
пройти [`FEATURE-INTEGRATION-CHECKLIST.md`](./FEATURE-INTEGRATION-CHECKLIST.md).
Иначе nav / RBAC / диалог ролей / page docs разъедутся.

### 2.1 Standalone components

```typescript
@Component({
  standalone: true,                    // ОБЯЗАТЕЛЬНО
  changeDetection: ChangeDetectionStrategy.OnPush,  // ОБЯЗАТЕЛЬНО
  imports: [...],                       // явный imports (НЕ NgModule)
})
```

- **Запрещено:** `NgModule`, `*ngIf`, `*ngFor`, `*ngSwitch`
- **Требуется:** `@if` / `@for` / `@switch` (Angular 17+ control flow)

### 2.2 Signal-based inputs (НЕ @Input)

```typescript
// ✅ ПРАВИЛЬНО
readonly name = input<string>('default');
readonly required = input.required<string>();

// ❌ НЕПРАВИЛЬНО
@Input() name = 'default';
```

### 2.3 inject() (НЕ constructor injection)

```typescript
// ✅ ПРАВИЛЬНО
private readonly http = inject(HttpClient);
private readonly toast = inject(PiToastService);

// ❌ НЕПРАВИЛЬНО
constructor(private http: HttpClient) {}
```

### 2.4 SilentResult (НЕ subscribe({ next, error }))

```typescript
// ✅ ПРАВИЛЬНО
this.service.list().subscribe((res) => {
  if (res.ok) {
    this.data.set(res.data.items);
  } else {
    this.toast.error(extractErrorMessage(res.error));
  }
});

// ❌ НЕПРАВИЛЬНО
this.http.get('/api/materials').subscribe({
  next: data => ...,
  error: err => ...,  // ошибка попадёт в console.error
});

// ❌ НЕПРАВИЛЬНО
this.service.list().pipe(catchError(...))  // silent-* уже содержит catchError
```

### 2.5 httpResource для серверных данных

```typescript
// ✅ ПРАВИЛЬНО — сигнал-зависимый httpResource
private readonly listParams = computed(() => ({
  page: this.pageSig(),
  limit: PAGE_SIZE,
  search: this.search.debouncedSearch() || undefined,
}));

protected readonly listRes = httpResource<MyListResponse>(() => ({
  url: `${this.baseUrl}/my-entities`,
  params: this.listParams(),
}));

protected readonly data = computed(() => this.listRes.value()?.items ?? []);
protected readonly loading = computed(() => this.listRes.isLoading());
```

### 2.6 defineEntity для CRUD-сервисов

```typescript
// Определение (один раз):
export interface User { _id: string; name: string; email: string; }
export const Users = defineEntity<User>({ endpoint: 'users' });

// Использование (везде):
private readonly users = Users.inject();
this.users.list({ page: 1 }).subscribe((res) => { ... });
```

- **Когда подходит:** стандартный CRUD (list/findById/create/update/remove)
- **Когда НЕ подходит:** вложенные endpoints (`/products/:id/cost-calculations`), FormData upload, нестандартные ответы

### 2.7 SubmitGuard — защита от двойного сабмита

```typescript
// В форме:
private readonly guard = inject(SubmitGuard);

async onSubmit(): void {
  const result = await this.guard.guard({
    formKey: 'my-form',
    url: `${this.baseUrl}/entities`,
    method: 'POST',
    fetcher: () => this.service.create(payload),
  });
  if (result.ok) { ... }
}
```

SubmitGuard даёт 3 уровня защиты:
1. **Debounce 300ms** — клик не уходит на сервер раньше времени
2. **In-flight Map** — повторный submit возвращает `429 SilentResult` без HTTP-запроса
3. **Completed Cache** — успешный результат кешируется на 5 минут

### 2.8 IdempotencyInterceptor (глобальный)

Каждый POST/PATCH/DELETE автоматически получает заголовок `Idempotency-Key` (UUID). Зарегистрирован в `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([idempotencyInterceptor, authInterceptor]))
```

---

## 3. 🚫 Запрещённые паттерны

| Паттерн | Почему | Альтернатива |
|---------|--------|--------------|
| `@Input()` | Deprecated в Angular 20; нет сигнал-бinding | `input<T>()` / `input.required<T>()` |
| `constructor DI` | Нарушает tree-shaking | `inject()` |
| `*ngIf`, `*ngFor`, `*ngSwitch` | Structural directives deprecation path | `@if`, `@for`, `@switch` |
| `subscribe({ next, error })` | RxJS error → console.error | `silentGet/Post/Patch/Delete` + `res.ok` |
| `NgModules` | Standalone convention | `imports: []` в компоненте |
| `any` type | TypeScript strict mode | Явный тип или `unknown` |
| `box-shadow`, `drop-shadow` | Paper & Ink anti-bling | `hairline` borders |
| `#[hex]` colors | OKLCH design system | CSS custom properties (`--color-*`) |
| `bg-white`, `border-dashed` | Paper & Ink запрещает | `bg-paper`, `hairline` |
| `border-2`, `border-4` | Paper & Ink hairline-only | `hairline` (1px) |
| `OnInit`/`OnDestroy` | lifecycles с сигналами не нужны | `effect()` + `DestroyRef` |
| manual `Subscription` management | Утечки памяти | `httpResource` + `DestroyRef` |
| `@Component({ moduleId })` | Не нужно в standalone | — |
| `RouterModule.forRoot/forChild` | Standalone routes | `provideRouter(routes)` |
| Vector DB / semantic search | TZ-105.1 verdict — запрещено | MongoDB regex indexes |

---

## 4. 🌐 Paper & Ink Design System (кратко)

- **Палитра:** OKLCH (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent-*`, `--color-destructive`)
- **Borders:** `hairline` (1px, `--color-rule`)
- **Тени:** ❌ `box-shadow` / `drop-shadow` запрещены
- **Focus-ring:** единый класс `pi-focus-ring`
- **Типографика:** системный стек, `eyebrow` для подзаголовков
- **Иконки:** Lucide (через `lucide-angular`)
- **Тёмная тема:** через `oklch()` оверрайды на `[data-theme="dark"]`

Полная документация: `docs/paper-and-ink.md`

---

## 5. 📋 Чек-лист перед сабмитом любой задачи

```markdown
- [ ] `cd frontend && npx tsc --noEmit` — 0 ошибок
- [ ] `cd frontend && pnpm exec ng build --configuration=development` — 0 ошибок (template typecheck, tsc не ловит)
- [ ] `cd backend && npx tsc --noEmit` — 0 ошибок
- [ ] Новые компоненты: `standalone: true`, `OnPush`
- [ ] Inputs через `input<T>()` / `input.required<T>()`
- [ ] DI через `inject()` (не constructor)
- [ ] Control flow: `@if` / `@for` / `@switch`
- [ ] HTTP через `silentGet/Post/Patch/Delete` + `.subscribe((res) => { if(res.ok) ... })`
- [ ] Никаких `any`, `OnInit`/`OnDestroy`, `box-shadow`, `#[hex]`, `bg-white`
- [ ] Никаких Vector DB / semantic search (TZ-105.1)
- [ ] Селектор: `app-<name>-page`, класс: `<Name>Page`
- [ ] Документация страницы в `docs/pages/<name>.page.md`
```

---

## 6. 🧠 Полезные ссылки при работе

### Понимание кода

| Если нужно | Читать |
|------------|--------|
| Понять паттерн CRUD-страницы | `docs/DEVELOPMENT-PATTERNS.md` §3 |
| Создать новую страницу | `docs/add-new-page.md` + `docs/pages/_template.md` |
| Понять модель данных | `docs/data-model.md` |
| Разобраться в UI-компонентах | `ARCHITECTURE.md` § "Frontend UI Kit" |
| Понять диалоговую систему | `ARCHITECTURE.md` § "Toast", `docs/DEVELOPMENT-PATTERNS.md` §6 |
| Понять DSL defineEntity | `docs/DEVELOPMENT-PATTERNS.md` §11 |
| Понять защиту от двойного сабмита | `docs/DEVELOPMENT-PATTERNS.md` §12-13 |
| Понять PiEntityListComponent | `docs/DEVELOPMENT-PATTERNS.md` §14 |

### Запуск проекта

```bash
# Полный запуск (Mongo + backend + frontend + browser)
.\start.cmd

# Production-режим
node start.mjs --prod

# Проверка без запуска
node start.mjs --check
```

### Проверка

```bash
cd frontend && npx tsc --noEmit    # typecheck
cd frontend && npx jest --passWithNoTests  # unit tests
cd backend && npx tsc --noEmit     # backend typecheck
cd backend && npx jest --passWithNoTests   # backend test
```

---

## 7. ⚠️ Известные проблемы (на 2026-07-29)

| Проблема | Статус | Работа |
|----------|--------|--------|
| Frontend тест падает (`entity-service.spec.ts`) | Pre-existing | Не блокирует разработку |
| Backend тест падает (2 BOM migration spec) | Pre-existing | Не блокирует разработку |
| Login по email (не username) даёт 401 | By design | API ожидает `username`, не `email` |
| Backend стартует на рандомном порту | Изредка | Перезапустить `start.mjs` |
| NG8102 warnings (nullish coalescing) | Pre-existing | В production коде нет |

---

## 8. 📜 История решений (Architecture Decision Records)

| Решение | Дата | TZ | Суть |
|---------|------|----|------|
| Standalone-only + Signals + OnPush | 2026-07-05 | TZ-19 | Без NgModule, state через signals |
| Paper & Ink (OKLCH, hairline) | 2026-07-12 | TZ-104 | Дизайн-система на OKLCH, anti-bling |
| NO Vector DB / semantic search | 2026-07-12 | TZ-105.1 | MongoDB regex indexes достаточно |
| `silent-http` для всех HTTP | 2026-07-12 | TZ-105.3 | Observable никогда не ошибается |
| defineEntity DSL | 2026-07-29 | TZ-232.C | Фабрика CRUD-сервисов |
| SubmitGuard + IdempotencyInterceptor | 2026-07-29 | TZ-232.A | 3 уровня защиты от двойного сабмита |
| PiEntityListComponent | 2026-07-29 | TZ-232.C | Переиспользуемый список с пагинацией |

---

---

## 9. 🗣️ Правила общения с владельцем продукта (PO)

PO проекта — **непрограммист**. Он понимает систему, принимает решения, но не читает код. Общается простым языком. Твоя задача — переводить технику в человеческий язык и обратно.

### 9.1 Как объяснять что мы делаем

- ❌ **НЕ ГОВОРИ ТАК:** «Перемигрируем stock-movements.page.ts на PiEntityListComponent с extraParams и content projection slots»
- ✅ **ГОВОРИ ТАК:** «Упрощаем страницу движений на складе — теперь она работает через наш общий конструктор, как LEGO»

Переводи названия файлов в понятные слова:
- `storage-items.page.ts` → «страница складских остатков» или «что есть на складе»
- `stock-movements.page.ts` → «страница движений на складе» (что пришло / ушло)
- `materials.page.ts` → «страница материалов» (ДСП, фанера, и т.п.)
- `products.page.ts` → «страница готовых продуктов»
- `doc-constructor/builder/` → «Конструктор шаблонов» или «где собираем документы»
- `defineEntity` → «фабрика для создания сервисов»
- `SubmitGuard` → «защита от двойного клика»
- `DSL` → «наш общий конструктор для сборки страниц» или «LEGO-кирпичики»

### 9.2 Принципы объяснения

1. **Сначала ЗАЧЕМ, потом КАК** — «это упрощает страницу» → «раньше было 150 строк, теперь 60»
2. **Числа и факты** — «-60% кода», «стало в 2 раза проще», «теперь работает как единое целое»
3. **Аналогии из жизни** — LEGO, кирпичики, рамка для фото
4. **Варианты на выбор** — «что выберете: А, Б или В?»

### 9.3 Документация — ЗАЧЕМ она

PO сказал ясно: **документация существует только чтобы помогать ИИ-агенту, не для людей.** Люди смотрят сайт и спрашивают ИИ. Поэтому:

- Документация пишется **для эффективности агента**, а не для красоты или полноты
- Каждый .md файл имеет конкретную цель: «чтобы агент быстрее разобрался» или «чтобы агент не делал типичные ошибки»
- НЕ пиши документацию «для коллег» — PO это не нужно
- Если документация не помогает агенту — её можно удалить или сократить

### 9.4 Как спрашивать PO

Когда нужна развилка, спрашивай так:

```
Что делаем дальше? Варианты:

1. «Усовершенствовать Конструктор шаблонов» — самая жирная фича.
   Я уже сделал снимки/магниты, осталось довести до ума.

2. «Прибраться в проекте» — убрать мусор от старых задач.

3. «Добавить новую страницу» — например, раздел Договоры.

Что первым?
```

### 9.5 Что PO обычно хочет

1. **Начинать с самого важного**, а не с технически самого простого
2. **Доводить до законченного состояния** — «допилить», «сделать по-человечески»
3. **Подготовить почву, потом строить** — сначала прибраться, потом новая фича
4. **Не тратить время на лишнюю документацию** — только то, что реально помогает ИИ

### 9.6 Чего PO НЕ любит

1. Технические термины в обычном разговоре
2. Незаконченные функции с пометкой «TODO» — лучше не делать, чем делать наполовину
3. Открытые вопросы без вариантов («что вы хотите?» вместо «что выберете: А, Б или В?»)
4. Переключаться между задачами не доделав текущую

---

## 10. 🎯 Культура решений

Когда принимаешь решение, фиксируй коротко:

- **Что делаем** — простыми словами
- **Как делаем** — один абзац, без кода (но код-примеры в `DEVELOPMENT-PATTERNS.md`)
- **Что НЕ делаем** и почему
- **Когда останавливаемся** — критерий готовности

Решение должно быть понятно через 30 секунд чтения верхней части документа.

---

*Этот файл — живой документ. Обновляй его при изменении архитектурных решений и добавлении новых паттернов.*
