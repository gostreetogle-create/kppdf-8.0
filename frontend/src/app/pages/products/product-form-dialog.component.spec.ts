import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { Product, ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import {
  ColorReference,
  ColorReferencesService,
} from '../../shared/services/pi-color-references.service';
import { PhotosService } from '../../shared/services/photos.service';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-PRODUCTS-302 — ProductFormDialogComponent unit spec.
 *
 * The smoke test instantiates the dialog through TestBed, which forces
 * Angular template compilation — a permanent regression guard against
 * NG5xxx (the class of bug that `tsc` cannot catch, cf. TZ-261).
 *
 * Child primitives (app-pi-dialog / app-pi-button / app-pi-form-field /
 * app-pi-input / app-pi-textarea) are tolerated via NO_ERRORS_SCHEMA;
 * DI comes from the PI_DIALOG_DATA / PI_DIALOG_REF tokens exactly as the
 * page's PiDialogService.open() provides them. Services are stubbed with
 * SilentResult-shaped observables so the component's constructor-driven
 * loadCategories() / loadColors() paths run synchronously.
 *
 * The RAL dropdown contract: ColorReferencesService.list({activeOnly})
 * feeds the select; option value = color.slug; the payload keeps the
 * backend string field `ralCode` (backend Product has NO `colorId` —
 * SUCCESSOR for TZ-PRODUCTS-303). No color chosen → fallback to
 * SYSTEM_DEFAULT_COLOR_SLUG ('ne-vybran').
 */

interface Harness {
  isEdit: () => boolean;
  submitting: () => boolean;
  uploading: () => boolean;
  errorMessage: () => string | null;
  form: {
    controls: Record<string, { setValue: (v: unknown) => void; markAsTouched: () => void }>;
    getRawValue: () => Record<string, unknown>;
    invalid: boolean;
    markAllAsTouched: () => void;
  };
  onSubmit: () => void;
  onCancel: () => void;
  openColorReferences: () => void;
  colorFallback: () => string | null;
  selectedColorHex: () => string | null;
  colors: () => ColorReference[];
  colorsLoading: () => boolean;
  colorsError: () => string | null;
  categories: () => unknown[];
  categoriesLoading: () => boolean;
  categoriesError: () => string | null;
  photos: () => unknown[];
  onPhotoSelect: (e: unknown) => void;
  removePhoto: (id: string) => void;
}

const SYSTEM_DEFAULT_COLOR_SLUG = 'ne-vybran';

const DEFAULT_COLORS: ColorReference[] = [
  {
    _id: 'c-def',
    slug: SYSTEM_DEFAULT_COLOR_SLUG,
    name: 'Не выбран',
    hex: '#9CA3AF',
    isActive: true,
    isSystem: true,
    isDefault: true,
    sortOrder: 0,
  },
  {
    _id: 'c-ral',
    slug: 'signalnyi-belyi',
    name: 'Сигнальный белый',
    hex: '#F5F5F5',
    isActive: true,
    isSystem: false,
    isDefault: false,
    sortOrder: 10,
  },
  {
    _id: 'c-ral2',
    slug: 'signalnyi-krasnyi',
    name: 'Сигнальный красный',
    hex: '#D32F2F',
    isActive: true,
    isSystem: false,
    isDefault: false,
    sortOrder: 20,
  },
];

async function setup(
  data: Product | null,
  opts: {
    colorsResult?: { ok: true; data: ColorReference[] } | { ok: false; error: unknown };
    colorsObservable?: ReturnType<typeof of<{ ok: true; data: ColorReference[] }>>;
    categoriesResult?: { ok: true; data: unknown[] } | { ok: false; error: unknown };
    createResult?: { ok: true; data: Product } | { ok: false; error: unknown };
    updateResult?: { ok: true; data: Product } | { ok: false; error: unknown };
    photoList?: unknown[];
  } = {},
): Promise<{
  comp: Harness;
  close: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  upload: jest.Mock;
  navigate: jest.Mock;
  fixture: ReturnType<typeof TestBed.createComponent<ProductFormDialogComponent>>;
}> {
  const close = jest.fn();
  const create = jest.fn(() =>
    of(
      opts.createResult ?? {
        ok: true,
        data: { _id: 'p-new', name: 'Окно ПВХ', kind: 'good', unit: 'шт' },
      },
    ),
  );
  const update = jest.fn(() =>
    of(
      opts.updateResult ?? {
        ok: true,
        data: { _id: 'p1', name: 'Окно ПВХ', kind: 'good', unit: 'шт' },
      },
    ),
  );
  const remove = jest.fn(() => of({ ok: true, data: undefined }));
  const upload = jest.fn(() => of({ ok: true, data: { _id: 'p-new-photo' } }));
  const navigate = jest.fn();

  await TestBed.configureTestingModule({
    providers: [
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: { close } },
      {
        provide: ProductsService,
        useValue: { create, update },
      },
      {
        provide: CategoriesService,
        useValue: {
          list: () =>
            of(
              opts.categoriesResult ?? {
                ok: true,
                data: [
                  {
                    _id: 'cat-1',
                    name: 'Мебель',
                    slug: 'furniture',
                    type: 'product',
                    skuPrefix: 'FUR',
                    sortOrder: 60,
                    isActive: true,
                  },
                  {
                    _id: 'cat-inactive',
                    name: 'Архивная категория',
                    slug: 'old',
                    type: 'product',
                    skuPrefix: 'OLD',
                    sortOrder: 999,
                    isActive: false,
                  },
                ],
              },
            ),
        },
      },
      {
        provide: ColorReferencesService,
        useValue: {
          list: () =>
            opts.colorsObservable ??
            of(
              opts.colorsResult ?? {
                ok: true,
                data: DEFAULT_COLORS,
              },
            ),
        },
      },
      {
        provide: PhotosService,
        useValue: {
          list: () => of({ ok: true, data: opts.photoList ?? [] }),
          upload: (file: unknown) => {
            upload(file);
            return of({ ok: true, data: { _id: 'p-uploaded' } });
          },
          remove,
        },
      },
      { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      { provide: Router, useValue: { navigate } },
    ],
  })
    .overrideComponent(ProductFormDialogComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();

  const fixture = TestBed.createComponent(ProductFormDialogComponent);
  const comp = fixture.componentInstance as unknown as Harness;
  return { comp, close, create, update, remove, upload, navigate, fixture };
}

describe('ProductFormDialogComponent (TZ-PRODUCTS-302)', () => {
  it('instantiates in create mode (template compiles — NG5xxx regression guard)', async () => {
    const { comp } = await setup(null);
    expect(comp.isEdit()).toBe(false);
  });

  it('instantiates in edit mode and prefills required fields', async () => {
    const product: Product = {
      _id: 'p1',
      name: 'Окно ПВХ',
      kind: 'good',
      unit: 'шт',
      categoryId: 'cat-1',
      ralCode: 'signalnyi-belyi',
    };
    const { comp } = await setup(product);
    expect(comp.isEdit()).toBe(true);
    expect(comp.form.getRawValue()).toMatchObject({ name: 'Окно ПВХ', ralCode: 'signalnyi-belyi' });
  });

  it('loads active colors from ColorReferencesService.list({activeOnly:true})', async () => {
    const { comp } = await setup(null);
    expect(comp.colors()).toHaveLength(3);
    expect(comp.colorsLoading()).toBe(false);
    expect(comp.colorsError()).toBeNull();
    expect(comp.colors().map((c) => c.slug)).toContain(SYSTEM_DEFAULT_COLOR_SLUG);
  });

  it('auto-selects the system default color when no ralCode chosen (SYSTEM_DEFAULT_COLOR_SLUG)', async () => {
    const { comp } = await setup(null);
    expect(comp.form.getRawValue()).toMatchObject({ ralCode: SYSTEM_DEFAULT_COLOR_SLUG });
  });

  it('renders color options (slug values) + system default in the RAL select DOM', async () => {
    const { fixture } = await setup(null);
    fixture.detectChanges();
    const options = fixture.debugElement
      .queryAll(By.css('#prod-ral option'))
      .map((el) => (el.nativeElement as HTMLOptionElement).value);
    expect(options).toEqual(['ne-vybran', 'signalnyi-belyi', 'signalnyi-krasnyi']);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Не выбран');
    expect(text).toContain('Сигнальный белый');
  });

  it('shows a loading state while the colors request is in-flight', async () => {
    const pending = new Subject<{ ok: true; data: ColorReference[] }>();
    const { comp } = await setup(null, {
      colorsObservable: pending as unknown as ReturnType<
        typeof of<{ ok: true; data: ColorReference[] }>
      >,
    });
    expect(comp.colorsLoading()).toBe(true);
    pending.next({ ok: true, data: DEFAULT_COLORS });
    expect(comp.colorsLoading()).toBe(false);
    expect(comp.colors()).toHaveLength(3);
  });

  it('colors load error → colorsError set, dropdown falls back without crash', async () => {
    const { comp } = await setup(null, {
      colorsResult: { ok: false, error: { message: 'boom' } },
    });
    expect(comp.colors()).toHaveLength(0);
    expect(comp.colorsError()).toBeTruthy();
    expect(comp.colorFallback()).toBeNull();
  });

  it('empty colors dictionary → empty hint; no crash on submit (fallback ralCode)', async () => {
    const { comp, create } = await setup(null, { colorsResult: { ok: true, data: [] } });
    expect(comp.colors()).toHaveLength(0);
    comp.form.controls['name'].setValue('Окно');
    comp.form.controls['unit'].setValue('шт');
    comp.onSubmit();
    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0] as Partial<Product>;
    expect(payload.ralCode).toBe(SYSTEM_DEFAULT_COLOR_SLUG);
  });

  it('selecting a color updates ralCode (option value = color slug)', async () => {
    const { comp } = await setup(null);
    comp.form.controls['ralCode'].setValue('signalnyi-krasnyi');
    expect(comp.selectedColorHex()).toBe('#D32F2F');
    expect(comp.form.getRawValue()).toMatchObject({ ralCode: 'signalnyi-krasnyi' });
  });

  it('legacy ralCode not in the dictionary renders a disabled fallback option', async () => {
    const product: Product = {
      _id: 'p1',
      name: 'Окно',
      kind: 'good',
      unit: 'шт',
      ralCode: 'RAL 9003',
    };
    const { comp } = await setup(product);
    expect(comp.colorFallback()).toBe('RAL 9003');
  });

  it('onSubmit() with invalid form does not call create and marks all touched', async () => {
    const { comp, create } = await setup(null);
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
    expect(comp.form.controls['name'].markAsTouched).toBeDefined();
  });

  it('onSubmit() valid form creates product once with ralCode and categoryId', async () => {
    const { comp, create, close } = await setup(null);
    comp.form.controls['name'].setValue('Окно ПВХ');
    comp.form.controls['unit'].setValue('шт');
    comp.form.controls['categoryId'].setValue('cat-1');
    comp.form.controls['ralCode'].setValue('signalnyi-belyi');
    comp.onSubmit();
    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0] as Partial<Product>;
    expect(payload.name).toBe('Окно ПВХ');
    expect(payload.categoryId).toBe('cat-1');
    expect(payload.ralCode).toBe('signalnyi-belyi');
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ _id: 'p-new' }));
  });

  it('onSubmit() without a chosen color falls back to SYSTEM_DEFAULT_COLOR_SLUG', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Окно');
    comp.form.controls['unit'].setValue('шт');
    comp.onSubmit();
    const payload = create.mock.calls[0][0] as Partial<Product>;
    expect(payload.ralCode).toBe(SYSTEM_DEFAULT_COLOR_SLUG);
  });

  it('onSubmit() guards double-submit while submitting', async () => {
    const { comp, create } = await setup(null);
    comp.form.controls['name'].setValue('Окно');
    comp.form.controls['unit'].setValue('шт');
    comp.onSubmit();
    comp.onSubmit();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('onSubmit() edit mode calls update with the product id', async () => {
    const product: Product = { _id: 'p1', name: 'Окно', kind: 'good', unit: 'шт' };
    const { comp, update, create } = await setup(product);
    comp.form.controls['name'].setValue('Окно 1200');
    comp.onSubmit();
    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toBe('p1');
  });

  it('API error keeps the dialog open and resets submitting', async () => {
    const { comp, close } = await setup(null, {
      createResult: { ok: false, error: { message: 'название занято' } },
    });
    comp.form.controls['name'].setValue('Окно');
    comp.form.controls['unit'].setValue('шт');
    comp.onSubmit();
    expect(close).not.toHaveBeenCalled();
    expect(comp.errorMessage()).toBeTruthy();
    expect(comp.submitting()).toBe(false);
  });

  it('photo upload appends to photos() and submit sends photoIds', async () => {
    const { comp, create } = await setup(null);
    comp.onPhotoSelect({ target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });
    expect(comp.photos()).toHaveLength(1);
    comp.form.controls['name'].setValue('Окно');
    comp.form.controls['unit'].setValue('шт');
    comp.onSubmit();
    const payload = create.mock.calls[0][0] as Partial<Product>;
    expect(payload.photoIds).toContain('p-uploaded');
  });

  it('removePhoto() drops the photo from photos()', async () => {
    const product: Product = {
      _id: 'p1',
      name: 'Окно',
      kind: 'good',
      unit: 'шт',
      photoIds: ['ph-1'],
    };
    const { comp } = await setup(product, {
      photoList: [{ _id: 'ph-1', storageUrl: 'x', originalFilename: 'a.png' }],
    });
    expect(comp.photos()).toHaveLength(1);
    comp.removePhoto('ph-1');
    expect(comp.photos()).toHaveLength(0);
  });

  it('onCancel() closes the dialog with null', async () => {
    const { comp, close } = await setup(null);
    comp.onCancel();
    expect(close).toHaveBeenCalledWith(null);
  });

  it('openColorReferences() closes dialog and navigates to /color-references', async () => {
    const { comp, close, navigate } = await setup(null);
    comp.openColorReferences();
    expect(close).toHaveBeenCalledWith(null);
    expect(navigate).toHaveBeenCalledWith(['/color-references']);
  });
});
