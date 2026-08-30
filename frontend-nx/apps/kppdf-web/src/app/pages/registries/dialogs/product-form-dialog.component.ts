import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiProductsService,
  PiUnitsService,
  type CreateProductPayload,
  type ProductDetail,
  type ProductKind,
  type ProductStatus,
  type Unit,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { extractErrorMessage } from '@kppdf/util-http';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';
import { scrollCompositionBlockIntoView } from '../../composition/composition-focus-scroll';
import { confirmDirtyClose } from '../../composition/dirty-dialog.guard';
import { ProductPassportPreviewComponent } from '../../passport/product-passport-preview.component';

export interface ProductFormDialogData {
  mode: 'create' | 'edit';
  product?: ProductDetail;
  focusComposition?: boolean;
}

const KIND_OPTIONS: { value: ProductKind; label: string }[] = [
  { value: 'good', label: 'Товар' },
  { value: 'service', label: 'Услуга' },
  { value: 'work', label: 'Работа' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'archived', label: 'Архив' },
];

@Component({
  selector: 'pi-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    CompositionPanelComponent,
    ProductPassportPreviewComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="content"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
      [showClose]="true"
      (userClose)="onCancel()"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="product-form">
        <app-pi-form-section title="Паспорт изделия" headingId="product-passport" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Название" htmlFor="prod-name" class="md:col-span-8">
              <app-pi-input id="prod-name" formControlName="name" />
            </app-pi-form-field>
            <app-pi-form-field label="Артикул" htmlFor="prod-sku" [required]="true" class="md:col-span-4">
              <app-pi-input id="prod-sku" formControlName="sku" />
            </app-pi-form-field>
            <app-pi-form-field label="Тип" htmlFor="prod-kind" [required]="true" class="md:col-span-3">
              <select id="prod-kind" formControlName="kind" class="pi-input w-full">
                @for (k of kindOptions; track k.value) {
                  <option [value]="k.value">{{ k.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Единица" htmlFor="prod-unit" [required]="true" class="md:col-span-3">
              <select id="prod-unit" formControlName="unit" class="pi-input w-full" data-test="product-unit">
                <option value="" disabled>— выберите —</option>
                @for (u of units(); track u.key) {
                  <option [value]="u.key">{{ u.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Статус" htmlFor="prod-status" class="md:col-span-3">
              <select id="prod-status" formControlName="status" class="pi-input w-full">
                @for (s of statusOptions; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Цена, ₽" htmlFor="prod-price" class="md:col-span-3">
              <app-pi-input id="prod-price" type="number" formControlName="listPrice" />
            </app-pi-form-field>
            <app-pi-form-field label="Категория (ID)" htmlFor="prod-category" class="md:col-span-6">
              <app-pi-input id="prod-category" formControlName="categoryId" />
            </app-pi-form-field>
            <app-pi-form-field label="Масса, кг" htmlFor="prod-weight" class="md:col-span-3">
              <app-pi-input id="prod-weight" type="number" formControlName="weightKg" />
            </app-pi-form-field>
          </div>
          <app-pi-form-field label="Описание" htmlFor="prod-description">
            <app-pi-textarea id="prod-description" formControlName="description" [rows]="2" />
          </app-pi-form-field>
          <app-pi-form-field label="Заметки" htmlFor="prod-notes">
            <app-pi-textarea id="prod-notes" formControlName="notes" [rows]="2" />
          </app-pi-form-field>
        </app-pi-form-section>

        @if (mode() === 'edit' && savedId(); as id) {
          @if (productEntity(); as product) {
            <pi-product-passport-preview [product]="product" [productId]="id" />
          }
        }

        @if (savedId(); as id) {
          <div
            #compositionBlock
            tabindex="-1"
            [attr.data-test]="focusComposition() ? 'product-composition-focus' : 'product-composition-block'"
          >
            <pi-composition-panel
              parentKind="product"
              [entityId]="id"
              [isComplex]="productEntity()?.isComplex === true"
            />
          </div>
        } @else {
          <p class="text-sm text-muted-foreground" data-test="product-composition-create-hint">
            Сохраните изделие, чтобы редактировать состав.
          </p>
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="product-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end sticky bottom-0 bg-paper">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="product-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="product-form-cancel">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProductFormDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('compositionBlock') private compositionBlock?: ElementRef<HTMLElement>;
  protected readonly kindOptions = KIND_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productsService = inject(PiProductsService);
  private readonly unitsService = inject(PiUnitsService);
  private readonly data = inject<ProductFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ProductDetail | null | undefined>>(PI_DIALOG_REF);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly savedId = signal<string | null>(null);
  protected readonly focusComposition = signal(!!this.data.focusComposition);
  protected readonly units = signal<Unit[]>([]);
  protected readonly mode = signal<'create' | 'edit'>(this.data.mode);
  protected readonly productEntity = signal<ProductDetail | undefined>(this.data.product);

  protected readonly dialogTitle = computed(() =>
    this.mode() === 'edit' ? 'Редактировать изделие' : 'Создать изделие',
  );

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.maxLength(256)]),
    sku: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    kind: this.fb.control<ProductKind>('good', Validators.required),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(16)]),
    status: this.fb.control<ProductStatus>('new'),
    listPrice: this.fb.control<number | null>(null),
    categoryId: this.fb.control(''),
    weightKg: this.fb.control<number | null>(null),
    description: this.fb.control(''),
    notes: this.fb.control(''),
  });

  ngOnInit(): void {
    void this.loadUnits();
    if (this.data.product) {
      this.savedId.set(this.data.product._id);
      this.patchProduct(this.data.product);
    }
  }

  ngAfterViewInit(): void {
    if (this.data.focusComposition) {
      scrollCompositionBlockIntoView(this.compositionBlock?.nativeElement);
    }
  }

  protected onCancel(): void {
    confirmDirtyClose(
      this.dialog,
      this.destroyRef,
      this.injector,
      () => this.form.dirty,
      () => this.ref.close(this.productEntity() ?? undefined),
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();
    this.submitting.set(true);
    this.errorMessage.set(null);
    const existing = this.productEntity();
    const res =
      this.mode() === 'edit' && existing
        ? await firstValueFrom(this.productsService.update(existing._id, payload))
        : await firstValueFrom(this.productsService.create(payload));
    this.submitting.set(false);
    if (!res.ok) {
      this.errorMessage.set(extractErrorMessage(res.error));
      return;
    }
    this.savedId.set(res.data._id);
    this.productEntity.set(res.data);
    this.mode.set('edit');
    this.form.markAsPristine();
    if (this.data.mode === 'edit') {
      this.ref.close(res.data);
    }
  }

  private async loadUnits(): Promise<void> {
    const res = await firstValueFrom(this.unitsService.list({ limit: 100, isActive: true }));
    if (res.ok) this.units.set(res.data.items.filter((u) => u.isActive));
  }

  private patchProduct(p: ProductDetail): void {
    this.form.patchValue({
      name: p.name ?? '',
      sku: p.sku ?? '',
      kind: p.kind,
      unit: p.unit,
      status: p.status ?? 'new',
      listPrice: p.listPrice ?? null,
      categoryId: typeof p.categoryId === 'string' ? p.categoryId : '',
      weightKg: p.weightKg ?? null,
      description: p.description ?? '',
      notes: p.notes ?? '',
    });
  }

  private buildPayload(): CreateProductPayload {
    const v = this.form.getRawValue();
    const payload: CreateProductPayload = {
      sku: v.sku.trim(),
      kind: v.kind,
      unit: v.unit,
    };
    if (v.name?.trim()) payload.name = v.name.trim();
    if (v.status) payload.status = v.status;
    if (v.listPrice != null) payload.listPrice = Number(v.listPrice);
    if (v.categoryId?.trim()) payload.categoryId = v.categoryId.trim();
    if (v.weightKg != null) payload.weightKg = Number(v.weightKg);
    if (v.description?.trim()) payload.description = v.description.trim();
    if (v.notes?.trim()) payload.notes = v.notes.trim();
    return payload;
  }
}
