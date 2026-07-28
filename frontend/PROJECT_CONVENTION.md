# PROJECT_CONVENTION.md

> **Архитектурные правила kppdf-8.0.** Этот файл — **обязательный** для всех новых фич.
> Перед началом работы прочитай его целиком + соответствующий раздел `docs/DEVELOPMENT-PATTERNS.md`.

---

## 1. Трёхуровневая модель

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Уровень 1: Angular primitives (Core API 20 + Material MD3)                  │
│  ─────────────────────────────────────────────────────────                    │
│  • Standalone Components (нет NgModules)                                       │
│  • Signals API (input<T>(), output<T>(), signal(), computed(), effect())       │
│  • Современный control flow (@if, @for, @switch)                               │
│  • Angular Material MD3 (mat-table, mat-dialog, mat-form-field, …)             │
│  • httpResource (Angular 20, signal-based data loader)                         │
│  • Tailwind 4 utility classes + CSS custom properties                         │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ оборачивается в
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Уровень 2: Paper & Ink building blocks (frontend/src/app/shared/)           │
│  ─────────────────────────────────────────────────────────                    │
│  shared/ui/*           UI-примитивы (60+ компонентов):                        │
│                        <app-pi-table>, <app-pi-dialog>, <app-pi-form-field>,  │
│                        <app-pi-input>, <app-pi-button>, <app-pi-row-actions>,│
│                        <app-pi-empty-state>, <app-pi-toast>,                  │
│                        <app-pi-error-banner>, <app-pi-tooltip>, …             │
│                                                                               │
│  shared/page/*         page-level блоки:                                      │
│                        <app-pi-page-header>, <app-pi-toolbar>,                │
│                        <app-pi-section>, <app-pi-demo>                        │
│                                                                               │
│  shared/util/*         утилиты-фабрики:                                       │
│                        createSearchState(debounceMs?)                         │
│                        createClientSearchState(data, matcher)                 │
│                        createSortState<K>(initialKey, initialDir?)             │
│                        createLookupTable<T>(fetcher, keyFn?)                   │
│                        onDialogCloseOnce<T>(ref, injector, cb)                 │
│                        pluralize / formatPrice / formatDate                    │
│                        moveItemInArray                                        │
│                                                                               │
│  core/silent-http      единый HTTP-слой (silentGet/Post/Patch/Delete,         │
│                        SilentResult<T>, extractErrorMessage)                   │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ собирается в
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Уровень 3: Конкретные фичи (frontend/src/app/pages/<domain>/)               │
│  ─────────────────────────────────────────────────────────                    │
│  <domain>.page.ts                      ← standalone page-компонент            │
│  <domain>-form-dialog.component.ts    ← form-dialog для create/edit          │
│  <domain>-detail.page.ts              ← detail-страница (опционально)         │
│  (локальные sub-components)            ← специфичные для фичи блоки          │
│                                                                               │
│  + shared/services/<name>.service.ts  ← API-клиент для сущности               │
│  + docs/pages/<name>.page.md          ← per-page документация                 │
└──────────────────────────────────────────────────────────────────────────────┘

★ Уровень 4 (будущее): Assembly DSL (defineEntity<T,P>(), <pi-entity-list>, …)  │
│        — см. tasks/TZ-232.md (Angular Assembly DSL Master Plan).              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Текущее состояние:** Уровни 1 и 2 готовы. Уровень 3 собирается вручную с копипастом из `docs/DEVELOPMENT-PATTERNS.md`.

**Целевое состояние:** Уровень 3 будет собираться через Assembly DSL. До этого соблюдай правила ниже.

---

## 2. Канонический паттерн list-страницы

**Главный референс:** `pages/materials/materials.page.ts` (482 LOC, + spec-тест).

### 2.1 Структура файла (обязательная)

1. **Импорты** (только `inject()`, никакого constructor injection):
   ```ts
   import {
     ChangeDetectionStrategy, Component, DestroyRef, Injector,
     TemplateRef, ViewChild, computed, inject, signal,
   } from '@angular/core';
   import { HttpErrorResponse, httpResource } from '@angular/common/http';
   import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
   import { PiSectionComponent } from '../../shared/page/pi-section.component';
   import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
   import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
   import { ButtonComponent } from '../../shared/ui/button/button.component';
   import { ColumnDef, SortDirection, TableComponent } from '../../shared/ui/pi-table.component';
   import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
   import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
   import { PiToastService } from '../../shared/ui/toast';
   import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
   import { createSearchState } from '../../shared/util/search';
   import { createSortState } from '../../shared/util/sort';
   import { pluralize, formatDate, formatPrice } from '../../shared/util/format';
   import { extractErrorMessage } from '../../core/silent-http';
   import { API_BASE_URL } from '../../core/api.tokens';
   ```

2. **DI через `inject()` в полях класса:**
   ```ts
   private readonly service    = inject(MyService);
   private readonly dialog     = inject(PiDialogService);
   private readonly toast      = inject(PiToastService);
   private readonly injector   = inject(Injector);
   private readonly destroyRef = inject(DestroyRef);
   private readonly baseUrl    = inject(API_BASE_URL);
   ```

3. **Page-constants + state сигналы:**
   ```ts
   const PAGE_SIZE = 50;
   type SortKey = 'name' | 'code' | 'createdAt' | null;

   protected readonly pageSize = PAGE_SIZE;

   private readonly pageSig = signal<number>(1);
   protected readonly page  = this.pageSig.asReadonly();

   private readonly search    = createSearchState(300); // 300ms debounce
   protected readonly searchQuery = this.search.searchQuery;

   private readonly sortState = createSortState<Exclude<SortKey, null>>('name', 'asc');
   ```

4. **Data loading через `httpResource`:**
   ```ts
   private readonly listParams = computed(() => ({
     page: this.pageSig(),
     limit: PAGE_SIZE,
     ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
     ...(this.sortState.sortKey()    ? { sort: this.sortState.sortKey(), dir: this.sortState.sortDir() } : {}),
   }));

   protected readonly listRes = httpResource<MyEntityListResponse>(() => ({
     url: `${this.baseUrl}/my-entities`,
     params: this.listParams(),
   }));

   protected readonly data     = computed<MyEntity[]>(() => this.listRes.value()?.items ?? []);
   protected readonly total    = computed<number>(()      => this.listRes.value()?.total ?? 0);
   protected readonly loading  = computed<boolean>(()     => this.listRes.isLoading());
   protected readonly error    = computed<string | null>(() => {
     const e = this.listRes.error() as HttpErrorResponse | undefined;
     return e ? extractErrorMessage(e) : null;
   });
   protected readonly emptyMessage = computed(() =>
     this.search.searchQuery() ? 'Ничего не найдено.' : 'Нет записей.',
   );
   ```

5. **Column definitions (статические readonly):**
   ```ts
   protected readonly cols: ColumnDef<MyEntity>[] = [
     { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
     { key: 'code', label: 'Код', sortable: true },
     { key: 'isActive', label: 'Активна', cellClass: 'text-center' },
   ];
   ```

6. **Mutation handler (пока через `.subscribe`; с TZ-232.A — через `createMutation<T,P>`):**
   ```ts
   protected onDelete(row: MyEntity): void {
     const ref = this.dialog.open<boolean>(AlertDialogComponent, {
       data: {
         title: 'Удалить запись?',
         description: `Удалить «${row.name}»? Это действие нельзя отменить.`,
         confirmLabel: 'Удалить',
         variant: 'destructive',
       },
       width: 'sm',
       parentDestroyRef: this.destroyRef,
     });
     onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
       if (!confirmed) return;
       this.service.remove(row._id).subscribe((res) => {
         if (res.ok) {
           this.toast.success('Запись удалена');
           this.listRes.reload();
         } else {
           this.toast.error(extractErrorMessage(res.error));
         }
       });
     });
   }

   protected openCreate(): void {
     const ref = this.dialog.open(MyFormDialogComponent, {
       data: null, width: 'md', parentDestroyRef: this.destroyRef,
     });
     onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
   }

   protected openEdit(row: MyEntity): void {
     const ref = this.dialog.open(MyFormDialogComponent, {
       data: row, width: 'md', parentDestroyRef: this.destroyRef,
     });
     onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
   }
   ```

7. **Template (канонический скелет):**
   ```html
   <app-pi-page-header eyebrow="раздел · справочники" title="Мои сущности" description="..." />

   <app-pi-toolbar>
     <input
       type="search" [value]="search.searchQuery()" (input)="onSearchInput($event)"
       placeholder="Поиск…" aria-label="Поиск" class="pi-input w-64"
     />
     <app-pi-button variant="default" (click)="openCreate()">+ Создать</app-pi-button>
     <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
   </app-pi-toolbar>

   <app-pi-section title="Каталог" eyebrow="I">
     @if (error()) {
       <div role="alert" class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
         {{ error() }}
       </div>
     }
     <div class="overflow-x-auto hairline rounded-sm">
       <app-pi-table
         [data]="data()" [columns]="cols" [loading]="loading()"
         [total]="total()" [page]="page()" [pageSize]="pageSize"
         [emptyMessage]="emptyMessage()" [ariaLabel]="'Список сущностей'"
         [cellTemplates]="cellTemplates" [rowActions]="rowActionsTplBinding"
         [localSort]="false" [initialSortKey]="'name'" [initialSortDir]="'asc'"
         (pageChange)="onPageChange($event)" (sortChange)="onSortChange($event)"
       >
         <ng-template #rowActionsTpl let-row>
           <app-pi-row-actions
             [row]="row"
             [editLabel]="'Редактировать ' + row.name"
             [deleteLabel]="'Удалить ' + row.name"
             (edit)="openEdit($event)" (delete)="onDelete($event)"
           />
         </ng-template>
       </app-pi-table>
     </div>
   </app-pi-section>
   ```

---

## 3. Канонический паттерн form-диалога

**Главный референс:** `pages/materials/material-form-dialog.component.ts` (669 LOC).

### 3.1 Структура

1. **Импорты (включая `NonNullableFormBuilder`, `PI_DIALOG_DATA`, `PI_DIALOG_REF`):**
   ```ts
   import {
     ChangeDetectionStrategy, Component, inject, signal,
   } from '@angular/core';
   import {
     FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators,
   } from '@angular/forms';
   import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
   import { ButtonComponent } from '../../shared/ui/button/button.component';
   import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
   import { InputComponent } from '../../shared/ui/input/input.component';
   import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
   import { PiToastService } from '../../shared/ui/toast';
   import { extractErrorMessage } from '../../core/silent-http';
   import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
   ```

2. **Form construction (NonNullableFormBuilder):**
   ```ts
   protected readonly form = this.fb.group({
     name:  this.fb.control('', [Validators.required, Validators.maxLength(256)]),
     code:  this.fb.control('', [Validators.maxLength(64)]),
     notes: this.fb.control(''),
   });
   ```

3. **Submit signal + состояние:**
   ```ts
   protected readonly isEdit       = signal(this.data != null);
   protected readonly submitting   = signal(false);
   protected readonly errorMessage = signal<string | null>(null);
   ```

4. **Validation helpers:**
   ```ts
   protected hasError(name: keyof typeof this.form.controls): boolean {
     const c = this.form.controls[name];
     return c.invalid && (c.dirty || c.touched);
   }
   protected errorFor(name: keyof typeof this.form.controls): string {
     const c = this.form.controls[name];
     if (!c.invalid || (!c.dirty && !c.touched)) return '';
     if (c.errors?.['required'])       return 'Обязательное поле';
     if (c.errors?.['maxlength'])      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
     if (c.errors?.['min'])            return `Минимум ${c.errors['min'].min}`;
     return 'Некорректное значение';
   }
   ```

5. **Submit handler (с защитой от двойного клика):**
   ```ts
   protected onSubmit(): void {
     if (this.submitting()) return; // защита от двойного сабмита
     if (this.form.invalid) {
       this.form.markAllAsTouched();
       return;
     }
     const payload = this.form.getRawValue();
     this.submitting.set(true);
     this.errorMessage.set(null);

     const obs = this.data
       ? this.service.update(this.data._id, payload)
       : this.service.create(payload);

     obs.subscribe((res) => {
       if (res.ok) {
         this.toast.success(this.isEdit() ? 'Обновлено' : 'Создано');
         this.ref.close(res.data);
       } else {
         this.errorMessage.set(extractErrorMessage(res.error));
         this.submitting.set(false);
       }
     });
   }
   ```

6. **Template (канонический скелет):**
   ```html
   <app-pi-dialog [title]="isEdit() ? 'Редактировать' : 'Создать'" [width]="'md'">
     <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-form-field">
       <app-pi-form-field label="Название" htmlFor="my-entity-name" [required]="true" [error]="errorFor('name')">
         <app-pi-input id="my-entity-name" formControlName="name" placeholder="Название" [invalid]="hasError('name')" />
       </app-pi-form-field>
       <!-- ... другие поля -->
       @if (errorMessage()) {
         <p role="alert" class="text-xs text-destructive">{{ errorMessage() }}</p>
       }
     </form>
     <div footer class="flex gap-3">
       <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()">
         {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
       </app-pi-button>
       <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
     </div>
   </app-pi-dialog>
   ```

7. **Cancel:**
   ```ts
   protected onCancel(): void { this.ref.close(null); }
   ```

---

## 4. Канонический паттерн сервиса

**Главный референс:** `shared/services/materials.service.ts`.

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentGet, silentPost, silentPatch, silentDelete,
  type SilentResult,
} from '../../core/silent-http';

// 1. Интерфейс сущности
export interface MyEntity { _id: string; name: string; /* ... */ }

// 2. Ответ списка (серверная пагинация)
export interface MyEntityListResponse {
  items: MyEntity[];
  total: number;
  page: number;
  limit: number;
}

// 3. Параметры списка
export interface MyEntityListParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class MyEntitiesService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MyEntityListParams = {}): Observable<SilentResult<MyEntityListResponse>> {
    let httpParams = new HttpParams()
      .set('page',  String(params.page  ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<MyEntityListResponse>(this.http, `${this.baseUrl}/my-entities`, { params: httpParams });
  }

  findById(id: string): Observable<SilentResult<MyEntity>> {
    return silentGet<MyEntity>(this.http, `${this.baseUrl}/my-entities/${id}`);
  }

  create(payload: Partial<MyEntity>): Observable<SilentResult<MyEntity>> {
    return silentPost<MyEntity>(this.http, `${this.baseUrl}/my-entities`, payload);
  }

  update(id: string, payload: Partial<MyEntity>): Observable<SilentResult<MyEntity>> {
    return silentPatch<MyEntity>(this.http, `${this.baseUrl}/my-entities/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/my-entities/${id}`);
  }
}
```

**Запрещено:** писать `this.http.get(...)` напрямую — только через `silentGet/Post/Patch/Delete`.

---

## 5. ❌ ЗАПРЕТЫ (enforced + enforced soon)

| № | Запрет | Уровень ошибки | Где запрещён | Где разрешён (исключения) |
|---|---|---|---|---|
| 5.1 | `: any` типизация | ERROR (ужесточается) | везде | `*.spec.ts` (test-doubles), защитные defaults в util (типизированные `unknown`) |
| 5.2 | `.subscribe(` в `**/*.page.ts` | ERROR (вводится) | page-файлы | mutation handlers (до введения `createMutation<T,P>` в TZ-232.A) |
| 5.3 | `implements OnInit` | ERROR (вводится) | `pages/**/*.page.ts`, `**/*-form-dialog.component.ts` | `shared/ui/*.component.ts` (bootstrap templateRefs, например `pi-table.component.ts:249`) |
| 5.4 | Прямой `this.http.get/post/...` | ERROR (вводится) | везде, кроме `shared/services/*.service.ts` | только в сервисах |
| 5.5 | Constructor с параметрами + `constructor(private x: X) {}` | ERROR | везде | только если требует Angular DI для legacy @Directive |
| 5.6 | `@Input()` / `@Output()` декораторы | ERROR | везде | только если библиотечный API заставляет (нет) |
| 5.7 | `*ngIf` / `*ngFor` / `*ngSwitch` | ERROR | templates | только в 3rd-party компонентах, куда не дотянуться |
| 5.8 | `@NgModule` | ERROR (`prefer-standalone: error`) | везде | нет |
| 5.9 | `BehaviorSubject` / `ReplaySubject` / `Subject<>` для state | ERROR | pages, components | сервисы могут под капотом (RxJS Subjects) |
| 5.10 | Глобальные стили (`styles.css`, theme tokens) | Только по явной команде | — | — |
| 5.11 | Открытый `console.log` | WARN (allow `console.error`) | везде | — |
| 5.12 | Создание NgRx / альтернативного state-фреймворка | Категорически нет | — | — |
| 5.13 | Свой HTTP-обёртки в обход `silent-http` | ERROR | везде | — |
| 5.14 | Mutating signals вне компонента | ERROR | весь код | только через computed/effect внутри компонента |
| 5.15 | Использование `FormBuilder` (не NonNullable) | WARN, лучше `NonNullableFormBuilder` | form-dialogs | редко — для nullable форм |

**Разрешённые исключения (обязательно задокументировать в коде // TODO: ссылка на TZ):**

- `shared/ui/pi-table.component.ts` — `ngOnInit` разрешён (one-shot seed templateRefs, задокументирован в TZ-104.4.2).
- `core/auth.service.ts` — допустимы Observable mutations (login/logout/refresh), но в page не должно быть прямых `.subscribe` на auth-flow.
- `*.spec.ts` — любые техники (test-doubles, mocks, `subscribe` для assertions).

---

## 6. Правила именования

| Сущность | Паттерн | Пример |
|---|---|---|
| Page | `pages/<name>/<name>.page.ts` | `pages/materials/materials.page.ts` |
| Page doc | `docs/pages/<name>.page.md` | `docs/pages/materials.page.md` |
| Form-dialog | `pages/<name>/<name>-form-dialog.component.ts` | `pages/materials/material-form-dialog.component.ts` |
| Detail page | `pages/<name>/<name>-detail.page.ts` | `pages/products/product-detail.page.ts` |
| Service | `shared/services/<name>.service.ts` (или `shared/services/pi-<name>.service.ts` если специфично для Paper & Ink) | `shared/services/materials.service.ts` |
| Service spec | `shared/services/<name>.service.spec.ts` | `shared/services/materials.service.spec.ts` |
| Page-class | `<Name>Page` (PascalCase) | `MaterialsPage` |
| Form-dialog class | `<Name>FormDialogComponent` | `MaterialFormDialogComponent` |
| Component selector | `app-<name>-page` / `app-<name>-form-dialog` (kebab-case) | `app-materials-page`, `app-material-form-dialog` |
| Util (factory) | `shared/util/<feature>.ts` (camelCase) + `create<X>` exported | `shared/util/lookup-table.ts` → `createLookupTable<T>` |
| URL endpoint literal | `${this.baseUrl}/<entity>` или `${this.baseUrl}/<entity>/${id}` | `${this.baseUrl}/materials/${id}` |
| TS interface (entity) | `<Name>` (PascalCase, без префиксов `I`/`T`) | `Material`, `Order`, `Counterparty` |
| TS interface (DTO) | `<Name>Dto` или `<Name>ListResponse` | `CreateMaterialDto`, `MaterialsListResponse` |
| Signal field | `<context>Sig` или `protected readonly <context>` | `pageSig`, или просто `page = signal(1)` |

---

## 7. Лучшие примеры (use as template)

| Фича | Образец | Что оттуда брать |
|---|---|---|
| **Canonical list-page (server-paginated)** | `pages/materials/materials.page.ts` (482 LOC, +spec) | Полная структура: импорты, DI, httpResource, computed, cols, dialog open/close, ngOnInit bootstrap, page reload |
| **Canonical list-page (client-filtered)** | `pages/work-types/work-types.page.ts` | Client-side filter + sort + paginate через `createClientSearchState` и `createSortState` |
| **Canonical list-page (with lookup FK)** | `pages/products/products.page.ts` | httpResource + server-side sort + lookup для related entities |
| **Canonical form-dialog (with FormArray)** | `pages/materials/material-form-dialog.component.ts` (669 LOC) | NonNullable FormBuilder + FormArray для dimensions + photo + ошибки |
| **Canonical form-dialog (simple)** | `pages/organizations/organization-form-dialog.component.ts` | Простая форма, 5 полей, без FormArray |
| **Canonical form-dialog (with lookup picker)** | `pages/products/product-form-dialog.component.ts` (410 LOC) | photo-upload + lookup для subcategory/unit |
| **Canonical service** | `shared/services/materials.service.ts` | 5-методный CRUD через silentGet/Post/Patch/Delete |
| **Canonical util: state factory** | `shared/util/lookup-table.ts` (createLookupTable<T>) | Fetch → byId signal |
| **Canonical util: dialog close handler** | `shared/util/on-dialog-close-once.ts` | NG0203-safe close-only-on-truthy subscribe |
| **Canonical silent-http pattern** | `core/silent-http.ts` | SilentResult<T>, normalizeError, extractErrorMessage |
| **Canonical route** | `frontend/src/app/app.routes.ts` | `loadComponent` для lazy-load + `title` |

---

## 8. Процесс работы (DO / DON'T)

### DO
1. Прочитай `docs/DEVELOPMENT-PATTERNS.md` → найди ближайший по структуре образец.
2. Прочитай `audit/inventory/001-frontend-inventory-2026-07-27.md` → узнай об ограничениях проекта (текущее состояние).
3. Скопируй образец → переименуй класс/селектор/пути.
4. Прогони `pnpm typecheck` после каждого значимого изменения (не в конце).
5. Запусти `pnpm lint --fix` для авто-форматирования.
6. Создай/обнови `docs/pages/<name>.page.md` со всеми endpoints, dialogs, services, computed signals, TZ reference.
7. После завершения — запусти `pnpm build` для production-сборки.

### DON'T
1. ❌ Не меняй `shared/ui/pi-table.component.ts` без явной проблемы в GH-issue / TZ.
2. ❌ Не вводи `OnInit` для целей кроме template-bootstrap (`@ViewChild` templates).
3. ❌ Не добавляй новый пакет в `package.json` без согласования с PO.
4. ❌ Не обходи `silent-http` (никаких прямых `this.http.*`).
5. ❌ Не используй `.subscribe` напрямую в `page`-handlers, если задача не говорит обратное (после TZ-232.A — `createMutation<T,P>`).
6. ❌ Не «запатчивай» тесты, чтобы они прошли (если тест красный — чини логику, не тест).
7. ❌ Не оставляй `TODO`-комментарии без даты и TZ-ссылки.
8. ❌ Не делай оптимизации «на глаз» — используй `pnpm analyze` (source-map-explorer).

---

## 9. Где посмотреть полную архитектуру

- **`docs/DEVELOPMENT-PATTERNS.md`** — канонические паттерны с полным кодом (главный источник).
- **`audit/inventory/001-frontend-inventory-2026-07-27.md`** — текущее состояние + слабые места + рекомендации.
- **`tasks/TZ-232.md`** — Angular Assembly DSL Master Plan (будущее DSL уровня 4).
- **`STACK.md`** — top-level решения (Angular 20, MD3, density -3, our design system).
- **`frontend/AI_CONTEXT.md`** — инструкция для ИИ-помощника.
- **`frontend/TASK_TEMPLATE.md`** — шаблон постановки задач (постановка).
- **`OrchestratorKit/AGENTS.md`** — процесс работы (TZ lifecycle).
