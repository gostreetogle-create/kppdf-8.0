# AI_CONTEXT.md

> Инструкция для ИИ-помощника (или разработчика), который начинает работу с кодовой базой **kppdf-8.0**.
> Прочитай целиком ПЕРЕД любым изменением кода. Это **обязательный** документ.

---

## 1. Что это за проект

**kppdf-8.0** — ERP-система для производства (конструкторская документация, модули продукции, складские остатки, контракты, заказы, закупки, отчёты). Дизайн-концепция — **Paper & Ink** (editorial Swiss-minimalism).

**Технологический стек:**

- **Frontend:** Angular 20.3 (standalone components, Signals, OnPush, `httpResource` для read-операций)
- **UI:** Angular Material 20 (Material Design 3) + собственные обёртки в `shared/ui/` (`<app-pi-table>`, `<app-pi-dialog>`, `<app-pi-form-field>`, `<app-pi-input>`, `<app-pi-button>`, `<app-pi-row-actions>`, и т.д.)
- **Styling:** Tailwind 4 + CSS custom properties (`--mat-sys-*`), глобальный density -3 (плотные таблицы ≈36 px), hand-rolled hairlines вместо border-radius
- **Backend:** NestJS 10 + Mongoose 8 + MongoDB Replica Set
- **Tests:** Jest + jest-preset-angular + @testing-library/angular

---

## 2. Главное правило

**Всегда следуй шаблонам и соглашениям из:**

1. **`frontend/TASK_TEMPLATE.md`** — как ставить задачу (разделы: Что делаем → Образцы → Требования → Что проверить).
2. **`frontend/PROJECT_CONVENTION.md`** — архитектурные правила (трёхуровневая модель, канонические паттерны, запреты, нейминг).

Прежде чем писать код:

1. Прочитай раздел в **`docs/DEVELOPMENT-PATTERNS.md`**, относящийся к задаче. Там — полные код-шаблоны для list-страницы (§3), form-диалога (§4), util-сервиса (§2), и т.д.
2. Посмотри **файлы-образцы** из задачи (обычно это существующая аналогичная страница).
3. Если задача про list-страницу → главный образец **`pages/materials/materials.page.ts`** (482 LOC, canonical).
4. Если задача про form-dialog → главный образец **`pages/materials/material-form-dialog.component.ts`** (669 LOC, canonical).
5. Если задача про сервис → образец **`shared/services/materials.service.ts`**.
6. Если задача про util → проверь, нет ли уже готового в **`shared/util/`** (`search.ts`, `sort.ts`, `lookup-table.ts`, `on-dialog-close-once.ts`, `format.ts`).

---

## 3. ❌ НЕЛЬЗЯ (жёсткие запреты)

### 3.1 Не переписывай работающее

- **НЕ менять стили глобально.** Никаких правок в `styles.css`, `theme.css`, `tailwind.config.ts`, Material theme tokens (`--mat-sys-*`) без явной команды в задаче.
- **НЕ переписывать работающие компоненты без явной команды.** Если компонент работает — не трогай его структуру. Допустимы только:
  - точечный bugfix по описанному сценарию;
  - добавление нового функционала (с сохранением существующего API);
  - удаление (если в задаче явно сказано «удалить/заменить»).
- **НЕ вводить абстракции "на вырост".** Если абстракция не используется минимум в 2 местах — она преждевременна и вредна. Лучше минимальный inline-код, чем «возможно пригодится».

### 3.2 Не использовать устаревшие подходы

Запрещено:

- `implements OnInit` в page-файлах (допускается только в примитивах `shared/ui/*.component.ts` для bootstrap templateRefs, см. PROJECT_CONVENTION.md §5.3).
- `BehaviorSubject` / `ReplaySubject` / ручные подписки для state — только Signals.
- `this.http.get/post/...` напрямую вне `shared/services/*.service.ts` — только через `silentGet/Post/Patch/Delete`.
- `.subscribe((res) => ...)` в page-компонентах — в будущем (TZ-232.A) будет `createMutation<T,P>()` обёртка; пока допустимо только в mutation-handler'ах page, но не в computed/effects.
- `: any` типизация — error после ужесточения ESLint.
- `*ngIf` / `*ngFor` / `*ngSwitch` — только `@if` / `@for` / `@switch` (современный control flow).
- `@Input()` / `@Output()` декораторы — только `input<T>()` / `output<T>()` signal API.
- NgModule — только standalone (`@angular-eslint/prefer-standalone: error`).
- Глобальные стили (`styles.css`, `theme.css`, дизайн-токены).
- Логические `if/else` на одну переменную без computed — используй `computed()`.

### 3.3 Не отступать от файловой структуры

- Новый код ТОЛЬКО в правильной папке: `pages/<name>/`, `shared/services/`, `shared/util/`, `shared/ui/`, `core/`.
- НЕ класть page-логику в `shared/` (это для примитивов).
- НЕ класть util в `pages/<name>/` (должен быть в `shared/util/`).

---

## 4. ✅ ОБЯЗАТЕЛЬНО (hard requirements)

Каждое изменение должно проходить:

- ✅ `pnpm typecheck` → exit 0 (нет TS-ошибок)
- ✅ `pnpm lint` → exit 0 (нет ESLint-нарушений, включая `prefer-standalone`, `no-explicit-any`)
- ✅ `pnpm format:check` → exit 0 (или сначала `pnpm format`, затем check)
- ✅ `pnpm test` → exit 0 — обязательно, если:
  - затронут существующий `.spec.ts` (изменения могут сломать тест);
  - создан новый `.spec.ts` (тест должен пройти);
  - изменён public API компонента/сервиса с существующим тестом.
- ✅ `pnpm build` → exit 0 (production-сборка успешна, нет budget violations)

Перед сдачей задачи агент ОБЯЗАН:

- Сверить свой код с чек-листом в `frontend/PROJECT_CONVENTION.md` (созданный в той же папке).
- Обновить per-page документацию в `docs/pages/<name>.page.md` (если создана/изменена страница). Шаблон: `docs/pages/_template.md`.
- Зарегистрировать route в `frontend/src/app/app.routes.ts` (для pages).

---

## 5. Как читать структуру проекта

```
frontend/src/app/
├── core/                      «инфраструктура» — HTTP, auth, tokens, error-types. Не трогать без причины.
│                              Примеры: silent-http.ts, auth.service.ts, api.tokens.ts.
├── layout/                    «рамка приложения» — app-shell, navigations, theme-toggle.
│                              Примеры: app-layout.component.ts, kit-layout.component.ts, theme-toggle.component.ts.
├── shared/page/               «блоки верхнего уровня» — page-header, toolbar, section.
│                              Примеры: pi-page-header.component.ts, pi-toolbar.component.ts.
├── shared/ui/                 «UI-примитивы». 60+ компонентов: table, dialog, form-field, button, badge, …
│                              Примеры: pi-table.component.ts, pi-dialog.component.ts, pi-form-field/.
├── shared/util/               «утилиты» — state-фабрики, форматы, helpers.
│                              Примеры: createSearchState, createSortState, createLookupTable, onDialogCloseOnce.
├── shared/services/           «API-слой для конкретных сущностей» — 5-методный CRUD через silent-http.
│                              Примеры: materials.service.ts, pi-counterparty.service.ts.
├── shared/code/               «playground primitives» — code-preview, theme-editor.
│                              (плейграунд: docs playground pages, не продакшен-код.)
└── pages/<domain>/            «фичи» — page + form-dialog + page-doc.
                               Примеры: pages/materials/, pages/products/, pages/contracts/.
```

---

## 6. Где искать ответ

| Вопрос | Где искать |
|---|---|
| Как писать list-страницу? | `docs/DEVELOPMENT-PATTERNS.md §3` + `pages/materials/materials.page.ts` |
| Как писать form-dialog? | `docs/DEVELOPMENT-PATTERNS.md §4` + `pages/materials/material-form-dialog.component.ts` |
| Как писать сервис? | `docs/DEVELOPMENT-PATTERNS.md §2` + `shared/services/materials.service.ts` |
| Какие util-примитивы есть? | `frontend/src/app/shared/util/` (8 файлов) + `docs/DEVELOPMENT-PATTERNS.md §5` |
| Какой HTTP-слой использовать? | `frontend/src/app/core/silent-http.ts` (только `silentGet/Post/Patch/Delete`) |
| Какой toast-сервис? | `frontend/src/app/shared/ui/toast/` → `inject(PiToastService)` |
| Какой dialog-сервис? | `frontend/src/app/shared/ui/dialog/pi-dialog.service.ts` → `PiDialogService` |
| Какой table-примитив? | `frontend/src/app/shared/ui/pi-table.component.ts` → `<app-pi-table>` |
| Нейминг (страницы, сервисы, классы)? | `frontend/PROJECT_CONVENTION.md §6` |
| Как поставить задачу? | `frontend/TASK_TEMPLATE.md` |
| Архитектурные запреты? | `frontend/PROJECT_CONVENTION.md §5` |
| Состояние проекта / слабые места? | `audit/inventory/001-frontend-inventory-2026-07-27.md` |
| Большие архитектурные планы? | `tasks/TZ-232.md` (Angular Assembly DSL), `tasks/TZ-176/177/178/179.md` |
| Процесс работы, фазы TZ? | `OrchestratorKit/AGENTS.md` |
| Состояние всех TZ? | `OrchestratorKit/STATUS.md` |

---

## 7. Стиль кода (быстрая шпаргалка)

- **Все компоненты:** `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`.
- **DI:** через `inject()` (не constructor injection).
- **Inputs/Outputs:** `input<T>()` / `output<T>()` (не `@Input()` / `@Output()`).
- **State:** `signal()` для primitive state, `computed()` для derived; никогда `BehaviorSubject`.
- **Control flow:** `@if` / `@for` / `@switch` (не `*ngIf`/`*ngFor`).
- **HttpClient:** НИКОГДА в page/component; только в `shared/services/*.service.ts` через `silentGet/Post/Patch/Delete`.
- **HTTP ошибки:** через `SilentResult<T>` (никогда через `.subscribe({ error: … })`).
- **Стили:** только Tailwind utility classes из дизайн-системы; никаких inline color literals (`bg-[#ff0]`, `bg-white`, `border-dashed`).
- **Селектор:** `app-<name>-page` (kebab-case), класс: `<Name>Page` (PascalCase).
- **Тексты UI:** русский язык, без английских копий.

---

## 8. Финал: перед написанием кода спроси себя

1. Есть ли уже готовая абстракция в `shared/` для этого?
2. Есть ли файл-образец, который я могу скопировать (не выдумывать)?
3. Это изменение нарушает запрет из PROJECT_CONVENTION.md §5?
4. После моего изменения — какие тесты могут сломаться?
5. Нужно ли обновить `docs/pages/<name>.page.md`?

Если на любой вопрос ответ «не знаю» — открой соответствующий раздел `docs/DEVELOPMENT-PATTERNS.md` или `frontend/PROJECT_CONVENTION.md`. Не выдумывай.
