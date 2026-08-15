# Angular 20 guide — kppdf frontend

> Source of truth для `frontend/src/**`. Версия проекта: Angular 20.3,
> TypeScript 5.9, RxJS 7.8, Jest. Официальная основа:
> https://angular.dev/style-guide и https://angular.dev/guide/signals.
>
> Более новая рекомендация Angular применяется только после проверки версии.
> В частности, default OnPush и stable Signal Forms относятся не к Angular 20.

## 1. Главный принцип

Компонент отвечает за одну понятную часть пользовательского сценария. Рефакторинг
должен уменьшать связанность и риск, а не просто увеличивать число файлов.

Приоритет:

1. корректное поведение и сохранность данных;
2. ясные ownership/state boundaries;
3. тестируемость;
4. единый Angular-стиль;
5. косметическая модернизация API — только когда затронут код.

## 2. Container и presentational

«Умный/глупый» — разговорные термины. В проекте используем:

### Page/container

- владеет route params, permissions, API orchestration и page-level state;
- вызывает typed services, но не raw `HttpClient`;
- переводит DTO в view model;
- решает loading/error/empty/saving состояния;
- передаёт дочерним компонентам данные и callbacks/events.

### Presentational component

- получает данные через `input()` / `input.required()`;
- сообщает намерение через `output()`; `model()` — только честное two-way value;
- не инжектит domain API service, Router или глобальный product state;
- не мутирует input object/array;
- может иметь локальное UI-state: open/selected/draft/focus.

### Когда extract оправдан

- блок имеет отдельную ответственность и имя;
- у него независимое состояние или interaction;
- его можно тестировать через публичные inputs/outputs;
- он повторяется либо меняется независимо от страницы;
- page одновременно содержит route/API orchestration и большой UI workflow.

Не extract:

- wrapper без поведения/семантики;
- компонент ради сокращения строк;
- цепочку, которая только пересылает 10+ inputs/outputs;
- tightly coupled fragment, который нельзя понять вне parent.

Размер — trigger для review, не автоматический fail. При TS >300 строк, template
>250 строк, 3+ domain services или 2+ независимых workflows агент обязан оценить
split и записать решение.

## 3. Angular component contract

- Только standalone architecture; `NgModule` не создавать.
- В Angular 20 standalone — default: не добавлять `standalone: true`.
- Явно использовать `changeDetection: ChangeDetectionStrategy.OnPush`.
- DI через `inject()`, не constructor injection в новом/затронутом коде.
- Angular API-поля располагать сверху: injects → inputs/models/outputs → queries →
  state/computed → methods.
- Template-only members делать `protected`, если это не ломает тест/public contract.
- Selector: kebab-case; page class `<Name>Page`, component `<Name>Component`.
- Не добавлять `any`, non-null assertion или cast для сокрытия плохого контракта.

## 4. Signals и RxJS

Signals:

- `signal()` — локальное синхронное UI-state;
- `computed()` — derived state; не дублировать его writable signal;
- `set()` / `update()` — immutable updates;
- `effect()` — только реальный side effect, не вычисление состояния.

RxJS:

- HTTP и асинхронная композиция остаются Observable в service layer;
- template consumption — `async` pipe либо осознанный `toSignal()`;
- imperative subscription допустима на boundary (save/navigation/upload), но с
  `takeUntilDestroyed()`/bounded completion и явной обработкой результата;
- nested `subscribe`, ручной Subject без ownership и подписка без teardown запрещены.

Не конвертировать Signals↔RxJS без причины. Один участок state имеет одного owner.

## 5. Inputs, outputs и мутация

- Новый/затронутый API: `input()`, `input.required()`, `output()`, `model()`.
- `model()` только когда child действительно изменяет value; иначе input + event.
- Input object/array считать readonly; изменение — новый reference.
- Output описывает событие пользователя (`saved`, `rowSelected`), не команду parent
  (`callSaveServiceNow`).
- Не делать массовую замену стабильных `@Input/@Output` отдельным PR без пользы и
  characterization tests.

## 6. Templates

- Native control flow: `@if`, `@for`, `@switch`.
- В `@for` всегда стабильный `track` (`item._id`, key), не index для reorderable list.
- Простая логика в template; сложное условие → `computed()`/view model.
- `[class.foo]`, `[class]`, `[style.x]`; новые `ngClass/ngStyle` не добавлять.
- Интерактив — native `button/input/a` или существующий shared primitive.
- `button` всегда имеет `type`; icon-only action — accessible name/title.
- Не вызывать API, mutation или тяжёлую функцию из template.
- Сохранять Paper & Ink: tokens, hairline, `pi-focus-ring`, light/dark.

## 7. Forms

- Канон текущей версии — typed Reactive Forms.
- Signal Forms не подключать: они не являются стабильным каноном Angular 20.
- Form model отделён от server DTO; mapping выполняется явно.
- Один submit-path с pending guard; double-submit запрещён.
- Validation messages доступны пользователю и screen reader.
- Patch/hydrate не должен случайно помечать форму dirty или запускать autosave.

## 8. Services, routing и lazy loading

- Raw `HttpClient` только в typed service layer (`shared/services`/feature service).
- Использовать `SilentResult<T>` и project error helpers из
  `docs/DEVELOPMENT-PATTERNS.md`.
- Feature routes lazy через `loadComponent`.
- Shared UI/page/dsl не импортирует `pages/**`.
- Один domain не импортирует internals другого page-domain; общий contract
  выносится в shared/domain-neutral место.
- Новая библиотека/provider — только отдельное архитектурное обоснование.

## 9. Lifecycle и cleanup

- Не запрещать lifecycle механически: использовать, когда Angular integration этого
  требует, но не переносить туда всю бизнес-логику.
- Для page initialization предпочитать route/input signals, `computed`, controlled
  load method и `afterNextRender` для DOM-only работы.
- Cleanup через `DestroyRef` / `takeUntilDestroyed`; ручной destroy Subject не
  добавлять в новом коде.
- Direct DOM только для измерения/focus/integration через Angular-safe hooks.

## 10. Testing contract

Перед refactor:

- зафиксировать baseline focused tests;
- на неочевидное legacy-поведение добавить characterization test.

После каждого малого пакета:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --runInBand
cd frontend && pnpm exec eslint src/app/pages/commercial/proposals/proposal-create.page.ts
pnpm architecture:check
git diff --check
```

Пути/pattern в примере заменить exact files/spec текущего child batch.

Для UI дополнительно:

- loading/error/empty/success;
- read-only/permissions;
- keyboard/focus;
- light/dark;
- F5/hydrate/autosave, если участвуют;
- один browser smoke по изменённому пользовательскому пути.

## 11. Audit severity

- **P0 correctness:** потеря данных, duplicate writes, broken auth/permissions.
- **P1 architecture:** raw HTTP in component, leaking subscription, shared→page
  import, mixed Product/KP ownership.
- **P2 maintainability:** oversized mixed-responsibility container, duplicated state,
  effect вместо computed, untyped form.
- **P3 modernization:** decorators/legacy syntax, которые работают и не создают риск.

Исправлять P0/P1 сначала. P3 не оправдывает массовый churn.

## 12. Definition of done

- Поведение до/после доказано тестами.
- Компонент имеет ясного state owner.
- Container/presentational boundary объяснима одной фразой.
- Нет новой зависимости и скрытой product-фичи.
- Focused gates + architecture-check + browser smoke PASS.
- Page docs/checklist обновлены; чужой WIP не попал в commit.
