# Development Patterns — kppdf-8.0

> **Единый справочник паттернов реализации.** Этот документ содержит конкретные код-паттерны, утилиты и конвенции, которые используются при написании нового кода. Читать ПЕРЕД началом работы над любой задачей.

---

## 1. SilentResult — обработка HTTP-ошибок

**Файл:** `frontend/src/app/core/silent-http.ts`

Все HTTP-запросы **обёрнуты** в `silentGet/Post/Patch/Delete`. Observable **никогда не ошибается** — вместо этого возвращает `SilentResult<T>`:

```ts
type SilentResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: HttpErrorResponse };
```

### Паттерн использования

```ts
// ❌ НЕПРАВИЛЬНО — ошибки уходят в console
this.http.get('/api/materials').subscribe({ next: data => ..., error: err => ... });

// ✅ ПРАВИЛЬНО — ошибки обрабатываются через res.ok
this.materialsService.list().subscribe((res) => {
  if (res.ok) {
    this.data.set(res.data.items);
  } else {
    this.toast.error(extractErrorMessage(res.error));
  }
});
```

### Доступные хелперы

| Функция | Назначение |
|---------|-----------|
| `silentGet<T>(http, url, options?)` | GET-запрос |
| `silentPost<T>(http, url, body, options?)` | POST-запрос |
| `silentPatch<T>(http, url, body, options?)` | PATCH-запрос |
| `silentDelete<T>(http, url, options?)` | DELETE-запрос |
| `extractErrorMessage(err)` | Извлечь читаемое сообщение из `HttpErrorResponse` |
| `normalizeError(err)` | Обернуть не-HTTP ошибку в `HttpErrorResponse` |

---

## 2. Фронтенд-сервис (API-слой)

**Конвенция:** один сервис на сущность, в `frontend/src/app/shared/services/`.

### Структура сервиса

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPost, silentPatch, silentDelete, SilentResult } from '../../core/silent-http';

// 1. Интерфейс сущности
export interface MyEntity {
  _id: string;
  name: string;
  // ... остальные поля из data-model.md
}

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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MyEntityListParams = {}): Observable<SilentResult<MyEntityListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
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

---

## 3. CRUD-страница (список)

**Конвенция:** standalone + OnPush + signal-based. Файл: `frontend/src/app/pages/<name>/<name>.page.ts`.

### Полный паттерн списка

```ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize, formatPrice } from '../../shared/util/format';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';
import { MyEntity, MyEntitiesService, type MyEntityListResponse } from '../../shared/services/my-entities.service';
import { MyEntityFormDialogComponent } from './my-entity-form-dialog.component';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-my-entities-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочник"
      title="Мои сущности"
      description="Описание раздела."
    />

    <app-pi-toolbar>
      <input
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск…"
        aria-label="Поиск"
        class="pi-input w-64"
      />
      <app-pi-button variant="default" (click)="openCreate()">+ Создать</app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Список" eyebrow="I">
      @if (error()) {
        <div role="alert" class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
          {{ error() }}
        </div>
      }
      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="data()"
          [columns]="cols"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          [emptyMessage]="emptyMessage()"
          [ariaLabel]="'Список сущностей'"
          (pageChange)="onPageChange($event)"
        >
          <ng-template #rowActionsTpl let-row>
            <app-pi-row-actions
              [row]="row"
              [editLabel]="'Редактировать ' + row.name"
              [deleteLabel]="'Удалить ' + row.name"
              (edit)="openEdit($event)"
              (delete)="onDelete($event)"
            />
          </ng-template>
        </app-pi-table>
      </div>
    </app-pi-section>
  `,
})
export class MyEntitiesPage {
  private readonly service = inject(MyEntitiesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageSize = PAGE_SIZE;

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  private readonly pageSig = signal<number>(1);
  protected readonly page = this.pageSig.asReadonly();

  // ─── Серверная пагинация через httpResource ───
  private readonly listParams = computed(() => ({
    page: this.pageSig(),
    limit: PAGE_SIZE,
    ...(this.search.debouncedSearch() ? { search: this.search.debouncedSearch() } : {}),
  }));

  protected readonly listRes = httpResource<MyEntityListResponse>(() => ({
    url: `${this.baseUrl}/my-entities`,
    params: this.listParams(),
  }));

  protected readonly data = computed<MyEntity[]>(() => this.listRes.value()?.items ?? []);
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? 0);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly emptyMessage = computed(() =>
    this.searchQuery() ? 'Ничего не найдено.' : 'Нет записей.',
  );

  // ─── Column definitions ───
  protected readonly cols: ColumnDef<MyEntity>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'code', label: 'Код', sortable: true },
    // ... другие колонки
  ];

  // ─── Event handlers ───
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
    this.pageSig.set(1); // сброс на страницу 1 при поиске
  }

  protected onPageChange(p: number): void {
    this.pageSig.set(p);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(MyEntityFormDialogComponent, { data: null, width: 'md' });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(entity: MyEntity): void {
    const ref = this.dialog.open(MyEntityFormDialogComponent, { data: entity, width: 'md' });
    this.refreshOnDialogClose(ref);
  }

  protected onDelete(row: MyEntity): void {
    const ref = this.dialog.open(AlertDialogComponent, {
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

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.listRes.reload();
    });
  }
}
```

---

## 4. Форма-диалог (create/edit)

**Файл:** `frontend/src/app/pages/<name>/<name>-form-dialog.component.ts`

### Структура формы

```ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { MyEntity, MyEntitiesService } from '../../shared/services/my-entities.service';

type Result = MyEntity | null | undefined;

@Component({
  selector: 'app-my-entity-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать' : 'Создать'"
      [width]="'md'"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-form-field">
        <app-pi-form-field label="Название" htmlFor="name" [required]="true" [error]="errorFor('name')">
          <app-pi-input id="name" formControlName="name" placeholder="Название" [invalid]="hasError('name')" />
        </app-pi-form-field>
        <!-- ... другие поля ... -->

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
  `,
})
export class MyEntityFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(MyEntitiesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<MyEntity | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal(this.data != null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(256)]),
    // ... другие поля
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
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

  protected onCancel(): void {
    this.ref.close(null);
  }
}
```

### Ключевые моменты

- **`PI_DIALOG_DATA`** — данные, переданные в `dialog.open(Component, { data: ... })`. Тип: `MyEntity | null` (null = create, объект = edit).
- **`PI_DIALOG_REF`** — `DialogRef<Result>`. Вызывайте `ref.close(result)` для передачи результата.
- **`ref.close(null)`** — отмена (Cancel / ESC / backdrop). `onDialogCloseOnce` не сработает.
- **`ref.close(res.data)`** — успешное сохранение. `onDialogCloseOnce` сработает и вызовет reload.

---

## 5. Утилиты shared/util

### 5.1 `createSearchState(debounceMs?)` — серверный поиск

**Файл:** `shared/util/search.ts`

```ts
const search = createSearchState(300); // 300ms debounce

// В шаблоне:
// <input [value]="search.searchQuery()" (input)="search.onSearchInput($event)" />

// В computed для httpResource:
private readonly listParams = computed(() => ({
  page: this.pageSig(),
  limit: PAGE_SIZE,
  ...(search.debouncedSearch() ? { search: search.debouncedSearch() } : {}),
}));

// cleanup в DestroyRef:
this.destroyRef.onDestroy(() => search.destroy());
```

- `searchQuery` — raw значение input (без debounce).
- `debouncedSearch` — debounced значение (используется в httpResource).

### 5.2 `createClientSearchState(data, matcher)` — клиентский поиск

```ts
const search = createClientSearchState(
  () => this.allData(),
  (row, q) => row.name.toLowerCase().includes(q),
);
// search.filtered() — автоматически отфильтрованный список
```

### 5.3 `createLookupTable(fetcher, keyFn?)` — FK-резолв

**Файл:** `shared/util/lookup-table.ts`

```ts
private readonly suppliersLookup = createLookupTable<Organization>(
  this.orgs.list({ limit: 200 }),
);

// В ngOnInit:
this.suppliersLookup.load();

// В шаблоне:
// {{ suppliersLookup.byId()[row.supplierId]?.name }}
```

- `byId()` — `signal<Record<string, T>>` для O(1) поиска по ID.
- `load()` — загружает данные. Вызывать в `ngOnInit` и после изменений.

### 5.4 `onDialogCloseOnce(ref, injector, callback)` — подписка на закрытие

**Файл:** `shared/util/on-dialog-close-once.ts`

```ts
const ref = this.dialog.open(SomeComponent, { data: null });
onDialogCloseOnce(ref, this.injector, (saved: SomeType) => {
  // Вызовется ТОЛЬКО если dialog закрылся с truthy значением
  // (т.е. при успешном сохранении, НЕ при Cancel/ESC/backdrop)
  this.listRes.reload();
});
```

**Важно:** всегда передавайте `this.injector` (полученный через `inject(Injector)`).

### 5.5 `pluralize(n, [форма1, форма2, форма3])` — русское склонение

**Файл:** `shared/util/format.ts`

```ts
pluralize(1,  ['материал', 'материала', 'материалов']) // → 'материал'
pluralize(5,  ['материал', 'материала', 'материалов']) // → 'материалов'
pluralize(21, ['материал', 'материала', 'материалов']) // → 'материал'
```

### 5.6 `formatPrice(value)` — форматирование цены

```ts
formatPrice(1234.5)  // → '1234.50 ₽'
formatPrice(null)    // → ''
```

---

## 6. Диалоги — полный паттерн

### PiDialogService.open()

```ts
// Create:
const ref = this.dialog.open(MyFormDialogComponent, {
  data: null,          // null = create mode
  width: 'md',         // 'sm' | 'md' | 'lg' | string
  parentDestroyRef: this.destroyRef,  // опционально: авто-закрытие при destroy
});

// Edit:
const ref = this.dialog.open(MyFormDialogComponent, {
  data: existingEntity, // объект = edit mode
  width: 'lg',
});
```

### AlertDialogComponent

```ts
const ref = this.dialog.open(AlertDialogComponent, {
  data: {
    title: 'Удалить запись?',
    description: 'Это действие нельзя отменить.',
    confirmLabel: 'Удалить',
    variant: 'destructive',  // 'default' | 'destructive'
  },
  width: 'sm',
  parentDestroyRef: this.destroyRef,
});

onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
  if (!confirmed) return;
  // удаление...
});
```

---

## 7. Backend — паттерн модуля

### Структура модуля

```
backend/src/modules/<name>/
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
├── <name>.schema.ts
├── <name>.service.ts
├── <name>.controller.ts
└── <name>.module.ts
```

### Schema

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MyEntityDocument = HydratedDocument<MyEntity>;

@Schema({ timestamps: true })
export class MyEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ index: true })
  code?: string;

  // ... FK:
  @Prop({ type: 'ObjectId', ref: 'Organization' })
  supplierId?: string;
}

export const MyEntitySchema = SchemaFactory.createForClass(MyEntity);
```

### DTO

```ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMyEntityDto {
  @IsString()
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;
}

// UpdateMyEntityDto — все поля @IsOptional
```

### Controller

```ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { AuditAction } from '../../common/interceptors/audit.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { MyEntityService } from './my-entity.service';
import { CreateMyEntityDto } from './dto/create-my-entity.dto';
import { UpdateMyEntityDto } from './dto/update-my-entity.dto';

@Controller('my-entities')
export class MyEntityController {
  constructor(private readonly service: MyEntityService) {}

  @Get()
  @Roles('admin', 'manager')
  list(@Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search?: string) {
    return this.service.findAll({ page: parseInt(page, 10), limit: parseInt(limit, 10), search });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @AuditAction({ action: 'create', entityType: 'MyEntity' })
  create(@Body() dto: CreateMyEntityDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'update', entityType: 'MyEntity', idParam: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateMyEntityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @AuditAction({ action: 'delete', entityType: 'MyEntity', idParam: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### Service

```ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MyEntity, MyEntityDocument } from './my-entity.schema';
import { CreateMyEntityDto } from './dto/create-my-entity.dto';
import { UpdateMyEntityDto } from './dto/update-my-entity.dto';

@Injectable()
export class MyEntityService {
  private readonly logger = new Logger(MyEntityService.name);

  constructor(@InjectModel(MyEntity.name) private readonly model: Model<MyEntityDocument>) {}

  async create(dto: CreateMyEntityDto): Promise<MyEntityDocument> {
    return this.model.create(dto);
  }

  async findAll(q: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.search) {
      filter.$or = [{ name: new RegExp(q.search, 'i') }];
    }
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<MyEntityDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException(`MyEntity ${id} not found`);
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`MyEntity ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateMyEntityDto): Promise<MyEntityDocument> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`MyEntity ${id} not found`);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`MyEntity ${id} not found`);
    await this.model.updateOne({ _id: doc._id }, { $set: { deletedAt: new Date() } }).exec();
  }
}
```

---

## 8. Регистрация маршрута

**Файл:** `frontend/src/app/app.routes.ts`

```ts
{
  path: 'my-entities',
  loadComponent: () =>
    import('./pages/my-entities/my-entities.page').then((m) => m.MyEntitiesPage),
  title: 'Мои сущности',
},
```

---

## 9. Page documentation convention

Каждая страница frontend должна иметь документацию в `docs/pages/<name>.page.md`.

**Формат:** копировать шаблон `docs/pages/_template.md` и заполнить:
- Route / title
- API endpoints (метод + URL + назначение)
- Dialogs (компонент + режим + данные)
- Services
- State signals + computed
- TZ reference
- Особенности

**Зачем:**
- Разработчики не перечитывают весь код для понимания контракта
- AI-агенты (MCP) автоматически индексируют `.md` файлы
- Единый источник правды по каждой странице

**В коде:** добавьте в JSDoc заголовка компонента ссылку:
```ts
/**
 * Полная документация страницы: docs/pages/products.page.md
 */
```

**Индекс:** `docs/pages/README.md` — список всех страниц со статусом.

---

## 10. Чек-лист перед коммитом

- [ ] `cd frontend && pnpm exec tsc --noEmit` — exit 0
- [ ] `cd backend && pnpm exec tsc --noEmit` — exit 0
- [ ] Все компоненты: `standalone: true`, `ChangeDetectionStrategy.OnPush`
- [ ] Inputs через `input<T>()` / `input.required<T>()` (НЕ `@Input()`)
- [ ] DI через `inject()` (НЕ constructor injection)
- [ ] Control flow: `@if` / `@for` / `@switch` (НЕ `*ngIf` / `*ngFor`)
- [ ] State: `signal()` / `computed()` / `effect()` (НЕ manual subscriptions)
- [ ] HTTP-запросы через `silentGet/Post/Patch/Delete` (НЕ `this.http.*` напрямую)
- [ ] Обработка ответов через `res.ok` / `res.error` (НЕ `subscribe({ next, error })`)
- [ ] Никаких `any`, `OnInit`/`OnDestroy` (кроме `ngOnInit` для init-логики)
- [ ] Никаких `box-shadow`, `drop-shadow`, `#[hex]`, `bg-white`, `border-dashed`
- [ ] Границы: `hairline` / `hairline-b/r/l/t` (1px, цвет через оверрайды)
- [ ] Focus-ring: `pi-focus-ring` (НЕ `focus-visible:ring-2 ring-ink...`)
- [ ] Никаких `border-2`, `border-4`
- [ ] Селектор: `app-<name>-page` (kebab), класс: `<Name>Page` (PascalCase)
