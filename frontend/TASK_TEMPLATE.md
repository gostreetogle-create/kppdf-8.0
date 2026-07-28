# TASK_TEMPLATE.md

> **Шаблон постановки задач для kppdf-8.0.**
> Каждая задача, которую ставит PO или разработчик, оформляется в этом формате.
> Файл задачи создаётся в `tasks/TZ-NNN.md`, где NN — номер, согласованный с `OrchestratorKit/STATUS.md`.
> Перед началом работы над любой задачей — прочитай `frontend/PROJECT_CONVENTION.md` и соответствующий раздел `docs/DEVELOPMENT-PATTERNS.md`.

---

## Структура шаблона

```markdown
## Что делаем
[Краткое описание задачи — что должно появиться в результате. 1-3 предложения.]

## Образцы для подражания
[Файлы-образцы, которые нужно использовать как референс. Список конкретных путей с пояснением, что оттуда брать.]

## Требования
### Архитектурные
[Чем руководствоваться — какие паттерны применить, какие запреты не нарушить. Ссылка на PROJECT_CONVENTION.md.]
### Стилистические
[Какие дизайн-правила: <app-pi-page-header> с eyebrow/title/description, density -3, hairline borders, etc.]
### Производительность / качество
[Если есть специфические требования — конкретно. Иначе пусто.]

## Что проверить перед сдачей
[Чек-лист: typecheck, lint, test, build, ручная проверка, документация.]
```

Опциональные секции (если применимо):
```markdown
## Артефакты задачи (что создаётся / изменяется)
## Не делать (явные запреты для этой конкретной задачи)
## Связанные TZ / контекст
```

---

## Заполненный пример

> Задача **TZ-NNN «Counterparties list page»** — список сущности «Контрагенты» с фильтром, пагинацией, диалогами создания/редактирования/удаления.

### Что делаем

Создаём новую страницу `/counterparties` со списком контрагентов с серверной пагинацией, поиском по ИНН/названию, диалогами создания/редактирования и удаления с подтверждением. Подключаем к существующему `PiCounterpartyService` (если сервиса нет — добавляем тем же 5-методным CRUD-паттерном). Используем существующие примитивы: `<app-pi-table>`, `<app-pi-dialog>`, `<app-pi-form-field>`, `createSearchState`, `silent-http`.

### Образцы для подражания

**Главный образец list-page (структура целиком):**

- `pages/materials/materials.page.ts` (482 LOC, + spec-тест `materials.page.spec.ts`).
  Оттуда брать: импорты, DI через `inject()`, `httpResource` для read, computed для `data/loading/error/total/emptyMessage`, `cols: ColumnDef[]`, `openCreate/openEdit/onDelete` через `PiDialogService` + `onDialogCloseOnce`, `@ViewChild` для cell-templates + ngOnInit bootstrap.

**Service-образец:**

- `shared/services/materials.service.ts` — 5-методный CRUD с `silentGet/Post/Patch/Delete`. Если `shared/services/pi-counterparty.service.ts` уже существует — прочитать, адаптировать интерфейс; если нет — создать копированием с заменой entity name и payloads.

**Form-dialog-образец:**

- `pages/materials/material-form-dialog.component.ts` (669 LOC).
  Оттуда брать: `NonNullableFormBuilder`, `form.group()`, `signal()` для `submitting/errorMessage/isEdit`, методы `hasError(name)`/`errorFor(name)`, `onSubmit()` через `service.create/update` с `this.form.getRawValue()`, защита от двойного submit (`if (this.submitting()) return`).

**Дополнительные образцы (для отдельных паттернов):**

- `pages/organizations/organizations.page.ts` — простой list-page без FormArray.
- `pages/contracts/contracts.page.ts` — list-page с lookup (когда есть FK).
- `pages/products/product-form-dialog.component.ts` — form-dialog с photo-upload + lookup.
- `shared/util/lookup-table.ts` — для FK-select в форме (organizationId, ownerId).
- `shared/util/on-dialog-close-once.ts` — для callback после закрытия диалога.

**Документация-образец:**

- `docs/pages/_template.md` — шаблон per-page doc.
- `docs/pages/materials.page.md` — пример заполненной per-page doc.

### Требования

#### Архитектурные

Строго соблюдать `frontend/PROJECT_CONVENTION.md`:

- **Standalone component**, `ChangeDetectionStrategy.OnPush`. Класс `CounterpartiesPage`, селектор `app-counterparties-page`.
- **DI через `inject()`** (никаких constructor params). Минимум: `PiCounterpartyService`, `PiDialogService`, `PiToastService`, `DestroyRef`, `Injector`, `API_BASE_URL`.
- **Read data — через `httpResource<Counterparty[]>( () => ({ url: ${baseUrl}/counterparties, params: listParams() }))`.** Никаких `Subject`/`BehaviorSubject`.
- **Mutations — через `service.create()/update()/remove()`** + обработка `SilentResult<T>`. После успеха → `toast.success(...)` + `listRes.reload()`. После ошибки → `toast.error(extractErrorMessage(res.error))`.
- **Dialogs — только через `PiDialogService.open(CounterpartyFormDialogComponent, { data, width, parentDestroyRef })`** + `onDialogCloseOnce(ref, injector, () => listRes.reload())`.
- **Search — `createSearchState(300)`** с debounce 300ms; передавать `search.debouncedSearch()` в `listParams`.
- **Sort — `createSortState<SortKey>('name', 'asc')`** для типизированного sort со стрелками ↑↓↕.
- **Route:** `frontend/src/app/app.routes.ts` → добавить `{ path: 'counterparties', loadComponent: () => import('./pages/counterparties/counterparties.page').then(m => m.CounterpartiesPage), title: 'Контрагенты' }` в нужную группу роутов.
- **Per-page doc:** создать `docs/pages/counterparties.page.md` по шаблону `docs/pages/_template.md`.
- **Запрещено:** `: any`, `.subscribe(` в page (кроме mutation handlers), `implements OnInit` в page, прямой `HttpClient` вне `shared/services/`.

#### Стилистические

- Использовать `<app-pi-page-header eyebrow="раздел · справочники" title="Контрагенты" description="Справочник контрагентов: юридические лица, ИП, физические лица — партнёры и покупатели." />`.
- `<app-pi-section title="Каталог" eyebrow="I">` для обёртки таблицы.
- Empty-state — через `[emptyMessage]="emptyMessage()"` prop `<app-pi-table>`.
- Error-state — через `@if (error()) { … }` блок с `role="alert"` + `text-destructive`.
- Никаких прямых цветов (`bg-white`, `bg-[#hex]`) — только `hairline`, `text-destructive`, `text-muted-foreground`, `bg-card`, дизайн-токены из Tailwind preset.
- Кнопки: `<app-pi-button variant="default">` для primary, `variant="ghost"` для secondary.
- Колонки с числами → `align: 'right'`, `cellClass: 'font-mono text-xs'`.

#### Производительность / качество

- ISO-даты форматировать через `formatDate()` из `shared/util/format.ts`. Деньги (если есть) через `formatPrice()`.
- Russian plural: `pluralize(n, ['контрагент', 'контрагента', 'контрагентов'])`.
- Lookup для `organizationId` / `legalFormId` через `createLookupTable()`.
- Если есть FK с большим списком — вынести в `createLookupTable` отдельный сервис, не загружать каждый раз заново.

### Что проверить перед сдачей

**Автоматические проверки (все должны быть exit 0):**

- [ ] `pnpm typecheck` — 0 ошибок TS
- [ ] `pnpm lint` — 0 нарушений ESLint (включая `prefer-standalone`, `no-explicit-any`)
- [ ] `pnpm format:check` — 0 (или сначала `pnpm format`, затем check)
- [ ] `pnpm test -- --testPathPattern=counterparties` — 0 (если есть/добавлен spec, иначе skipped)
- [ ] `pnpm build` — 0 (нет budget violations, dev/prod сборка успешна)

**Ручная проверка в браузере (dev mode `pnpm start`):**

- [ ] Страница открывается по URL `/counterparties`
- [ ] Список загружается; если backend down — показывается error через `<app-pi-error-banner>` или `[errorMessage]` в таблице
- [ ] Поиск работает с debounce (300ms): ввести «ИНН» → через 300ms запрос уходит → результат фильтруется
- [ ] Создание через диалог → форма валидируется → после успеха новая запись появляется в списке + toast.success
- [ ] Редактирование → форма предзаполнена данными записи → после save обновляется в таблице
- [ ] Удаление → AlertDialog подтверждение → после «Удалить» — toast.success + запись исчезает
- [ ] Сортировка кликом по заголовку колонки (↑↓↕) — стрелки меняются, порядок меняется
- [ ] Пагинация (prev/next page) работает

**Документация и интеграция:**

- [ ] `docs/pages/counterparties.page.md` создан/обновлён, содержит: route, endpoints, dialogs, services, computed signals, TZ reference.
- [ ] `frontend/src/app/app.routes.ts` — путь `counterparties` зарегистрирован в правильной группе роутов.
- [ ] Если есть sidebar/navigation — пункт «Контрагенты» добавлен в нужную секцию.
- [ ] Нет изменений в `shared/ui/pi-table.component.ts` (если только не было bug — задокументировать отдельно).

### Не делать

- ❌ Не менять `shared/ui/pi-table.component.ts` (если только не нашёл в нём bug — указать в задаче).
- ❌ Не добавлять новые пакеты в `package.json` без согласования с PO.
- ❌ Не использовать `: any` или `.subscribe()` ВНЕ сервисов.
- ❌ Не делать свой HTTP-слой — только через `silentGet/Post/Patch/Delete`.
- ❌ Не упрощать форму до минимума (если в образце используются 5 полей — не делать 2).

### Артефакты задачи (что создаётся)

1. `frontend/src/app/pages/counterparties/counterparties.page.ts` — новый компонент.
2. `frontend/src/app/pages/counterparties/counterparty-form-dialog.component.ts` — новый form-dialog.
3. `frontend/src/app/shared/services/pi-counterparty.service.ts` — если ещё нет; иначе проверить и дополнить.
4. `frontend/src/app/shared/services/pi-counterparty.service.spec.ts` — если сервис новый (хотя бы 1 happy-path test).
5. `frontend/src/app/pages/counterparties/counterparties.page.spec.ts` — опционально (e2e-style: mount + httpResource seed + assert data() возвращает items).
6. `frontend/src/app/app.routes.ts` — изменение (добавить route).
7. `docs/pages/counterparties.page.md` — новый per-page doc.

### Связанные TZ / контекст

- См. `audit/inventory/001-frontend-inventory-2026-07-27.md` §10.5 — рекомендация про `<app-pi-table [cellTemplates]="autoCollect">` (если делаем в этой задаче — убираем `ngOnInit` boilerplate из page).
- В будущем: TZ-232.A «createMutation factory» устранит `.subscribe()` из page полностью.
- Согласовано с PO в дизассembly Ach DSL сессии (см. `tasks/TZ-232.md`).
