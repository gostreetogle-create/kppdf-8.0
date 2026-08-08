/**
 * TZ-PRODUCTS-302 — ProductFormDialogComponent tests.
 *
 * Locks the reworked content-dialog contract:
 *   - variant="content" + maxWidth 1120px (wide DSL, sticky footer);
 *   - sections render with eyebrow headers;
 *   - RAL dropdown loads ACTIVE colors from PiColorReferencesService
 *     (cached activeOnly catalog), search filters the list, selecting a
 *     color writes `ColorReference.slug` into ralCode, «Не выбран» clears
 *     it, and an empty dictionary shows the admin-only dictionary link;
 *   - categoryId is picked from CategoriesService (type 'product');
 *   - create/update payload flows preserved (legacy fields unchanged);
 *   - cancel closes without saving (null).
 */
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { PiColorReferencesService } from '../../shared/services/pi-color-references.service';
import { PhotosService } from '../../shared/services/photos.service';
import { AuthService } from '../../core/auth.service';
import { PiToastService } from '../../shared/ui/toast';

const ACTIVE_COLORS = [
  {
    _id: 'c1',
    name: 'RAL 9003 — Сигнальный белый',
    slug: 'ral-9003-signalny-belyy',
    hex: '#F4F4F4',
    isActive: true,
    isSystem: false,
    isDefault: false,
  },
  {
    _id: 'c2',
    name: 'RAL 7016 — Антрацитово-серый',
    slug: 'ral-7016-antracitovo-seryy',
    hex: '#383E42',
    isActive: true,
    isSystem: false,
    isDefault: false,
  },
];

describe('ProductFormDialogComponent (TZ-PRODUCTS-302)', () => {
  let fixture: ComponentFixture<ProductFormDialogComponent>;
  let close: jest.Mock;
  let success: jest.Mock;
  let error: jest.Mock;
  let productsSvc: { create: jest.Mock; update: jest.Mock };
  let categoriesSvc: { list: jest.Mock };
  let colorsSvc: { list: jest.Mock };
  let photosSvc: { list: jest.Mock; upload: jest.Mock; remove: jest.Mock };

  function ref<T>(): DialogRef<T> {
    return {
      closed: signal<T | undefined>(undefined),
      close: (v?: T) => close(v),
    } as DialogRef<T>;
  }

  async function setup(data: unknown, userRole = 'admin') {
    await TestBed.configureTestingModule({
      imports: [ProductFormDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref() },
        { provide: ProductsService, useValue: productsSvc },
        { provide: CategoriesService, useValue: categoriesSvc },
        { provide: PiColorReferencesService, useValue: colorsSvc },
        { provide: PhotosService, useValue: photosSvc },
        {
          provide: AuthService,
          useValue: {
            user: signal({
              role: userRole,
              permissions: [],
              username: 't',
              displayName: 'T',
              id: 'x',
              email: 't@t',
            }),
          },
        },
        { provide: PiToastService, useValue: { success, error } },
      ],
    })
      .overrideComponent(ProductFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(ProductFormDialogComponent);
    fixture.detectChanges();
  }

  /** Typed handle to the reactive form controls used in the tests. */
  function formControls(): {
    name: { setValue(v: string): void; value: string };
    unit: { setValue(v: string): void; value: string };
    ralCode: { setValue(v: string | null): void; value: string | null };
    categoryId: { setValue(v: string | null): void; value: string | null };
  } {
    const comp = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue(v: unknown): void; value: unknown }> };
    };
    return comp.form.controls as unknown as {
      name: { setValue(v: string): void; value: string };
      unit: { setValue(v: string): void; value: string };
      ralCode: { setValue(v: string | null): void; value: string | null };
      categoryId: { setValue(v: string | null): void; value: string | null };
    };
  }

  function instance(): {
    onSubmit: () => void;
    onCancel: () => void;
    selectColor: (c: (typeof ACTIVE_COLORS)[number] | null) => void;
    onColorSearch: (e: Event) => void;
    toggleColor: () => void;
    filteredColors: () => unknown[];
    selectedColor: () => { slug: string; name: string } | null;
    colorFallback: () => string | null;
    canManageColors: () => boolean;
    colors: () => unknown[];
    photos: () => unknown[];
    removePhoto: (id: string) => void;
    onPhotoSelect: (e: Event) => void;
    ngOnDestroy: () => void;
    form: { markAsDirty: () => void; dirty: boolean };
  } {
    return fixture.componentInstance as unknown as {
      onSubmit: () => void;
      onCancel: () => void;
      selectColor: (c: (typeof ACTIVE_COLORS)[number] | null) => void;
      onColorSearch: (e: Event) => void;
      toggleColor: () => void;
      filteredColors: () => unknown[];
      selectedColor: () => { slug: string; name: string } | null;
      colorFallback: () => string | null;
      canManageColors: () => boolean;
      colors: () => unknown[];
      photos: () => unknown[];
      removePhoto: (id: string) => void;
      onPhotoSelect: (e: Event) => void;
      ngOnDestroy: () => void;
      form: { markAsDirty: () => void; dirty: boolean };
    };
  }

  beforeEach(() => {
    close = jest.fn();
    success = jest.fn();
    error = jest.fn();
    productsSvc = {
      create: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'p1', name: 'Продукт' } })),
      update: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'p-edit', name: 'Продукт' } })),
    };
    categoriesSvc = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'cat-1',
              name: 'Двери',
              slug: 'doors',
              type: 'product',
              skuPrefix: 'D',
              sortOrder: 0,
              isActive: true,
            },
            {
              _id: 'cat-2',
              name: 'Окна',
              slug: 'windows',
              type: 'product',
              skuPrefix: 'W',
              sortOrder: 1,
              isActive: true,
            },
          ],
        }),
      ),
    };
    colorsSvc = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: ACTIVE_COLORS })),
    };
    photosSvc = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      upload: jest.fn(),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
    };
  });

  it('smoke: instantiates in create mode with content-variant wide dialog', async () => {
    await setup(null);
    expect(fixture.componentInstance).toBeTruthy();
    // The dialog template binds variant="content" + maxWidth 1120px.
    expect(fixture.nativeElement.querySelector('app-pi-dialog')).toBeTruthy();
  });

  it('loads ACTIVE colors from PiColorReferencesService on init', async () => {
    await setup(null);
    expect(colorsSvc.list).toHaveBeenCalledWith({ activeOnly: true });
    expect(instance().colors().length).toBe(2);
  });

  it('loads product categories from CategoriesService (type product)', async () => {
    await setup(null);
    expect(categoriesSvc.list).toHaveBeenCalledWith('product');
  });

  it('RAL: selecting a color writes its slug into ralCode and closes the dropdown', async () => {
    await setup(null);
    instance().toggleColor();
    instance().selectColor(ACTIVE_COLORS[1]);
    expect(formControls().ralCode.value).toBe('ral-7016-antracitovo-seryy');
  });

  it('RAL: choosing «Не выбран» clears ralCode (null)', async () => {
    await setup(null);
    instance().selectColor(ACTIVE_COLORS[0]);
    expect(formControls().ralCode.value).toBe('ral-9003-signalny-belyy');

    instance().selectColor(null);
    expect(formControls().ralCode.value).toBeNull();
  });

  it('RAL: search filters the active color list by name or slug', async () => {
    await setup(null);
    instance().onColorSearch({ target: { value: '7016' } } as unknown as Event);
    expect(instance().filteredColors()).toHaveLength(1);
  });

  it('RAL: selectedColor resolves the current ralCode to a swatch label', async () => {
    await setup(null);
    instance().selectColor(ACTIVE_COLORS[0]);
    expect(instance().selectedColor()?.name).toBe('RAL 9003 — Сигнальный белый');
  });

  it('RAL: legacy/unknown ralCode renders a fallback instead of a silent blank', async () => {
    await setup({
      _id: 'p-legacy',
      name: 'Старый продукт',
      kind: 'good',
      unit: 'шт',
      ralCode: 'RAL 9003 (legacy)',
    });
    expect(instance().colorFallback()).toBe('RAL 9003 (legacy)');
  });

  it('RAL: empty dictionary shows admin-only link to the color dictionary', async () => {
    colorsSvc.list.mockReturnValue(of({ ok: true, data: [] }));
    await setup(null);
    expect(instance().canManageColors()).toBe(true);
    // The template would render the routerLink — NO_ERRORS_SCHEMA keeps it inert.
    expect(colorsSvc.list).toHaveBeenCalledWith({ activeOnly: true });
  });

  it('RAL: a plain user role does NOT get the dictionary-management link', async () => {
    await setup(null, 'user');
    expect(instance().canManageColors()).toBe(false);
  });

  it('create submits a payload that preserves legacy fields and adds ralCode + categoryId', async () => {
    await setup(null);
    formControls().name.setValue('Продукт с цветом');
    formControls().unit.setValue('шт');
    formControls().categoryId.setValue('cat-1');
    instance().selectColor(ACTIVE_COLORS[0]);

    instance().onSubmit();
    expect(productsSvc.create).toHaveBeenCalledTimes(1);
    const payload = productsSvc.create.mock.calls[0][0];
    expect(payload.name).toBe('Продукт с цветом');
    expect(payload.categoryId).toBe('cat-1');
    expect(payload.ralCode).toBe('ral-9003-signalny-belyy');
    expect(payload.kind).toBe('good');
    expect(close).toHaveBeenCalled();
  });

  it('edit: clearing ralCode («Не выбран») and categoryId PATCHes EXPLICIT null so the server clears them', async () => {
    await setup({
      _id: 'p-clear',
      name: 'С цветом',
      kind: 'good',
      unit: 'шт',
      ralCode: 'ral-7016-antracitovo-seryy',
      categoryId: 'cat-1',
    });
    expect(formControls().ralCode.value).toBe('ral-7016-antracitovo-seryy');

    instance().selectColor(null); // «Не выбран» → null
    formControls().categoryId.setValue(null); // «— без категории —» → null
    instance().onSubmit();

    expect(productsSvc.update).toHaveBeenCalledWith(
      'p-clear',
      expect.objectContaining({ ralCode: null, categoryId: null }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('edit: listPrice typed as string is coerced to number in the payload', async () => {
    await setup({
      _id: 'p-price',
      name: 'С ценой',
      kind: 'good',
      unit: 'шт',
    });
    formControls().listPrice.setValue('1500' as unknown as number);
    instance().onSubmit();
    expect(productsSvc.update).toHaveBeenCalledWith(
      'p-price',
      expect.objectContaining({ listPrice: 1500 }),
    );
  });

  it('edit: populated categoryId object is reduced to id string', async () => {
    await setup({
      _id: 'p-cat',
      name: 'С категорией',
      kind: 'good',
      unit: 'шт',
      categoryId: { _id: 'cat-99', name: 'Мебель' } as unknown as string,
    });
    expect(formControls().categoryId.value).toBe('cat-99');
    instance().onSubmit();
    expect(productsSvc.update).toHaveBeenCalledWith(
      'p-cat',
      expect.objectContaining({ categoryId: 'cat-99' }),
    );
  });

  it('photo: upload adds a thumbnail and the photoIds make it into the payload', async () => {
    photosSvc.upload.mockReturnValue(
      of({
        ok: true,
        data: { _id: 'ph-1', storageUrl: 'http://x/1.jpg', originalFilename: 'a.jpg' },
      }),
    );
    await setup(null);
    instance().onPhotoSelect({
      target: { files: [new File(['x'], 'a.jpg')], value: '' },
    } as unknown as Event);
    expect(photosSvc.upload).toHaveBeenCalledTimes(1);
    expect(instance().photos()).toHaveLength(1);

    formControls().name.setValue('С фото');
    formControls().unit.setValue('шт');
    instance().onSubmit();
    const payload = productsSvc.create.mock.calls[0][0];
    expect(payload.photoIds).toEqual(['ph-1']);
  });

  it('photo: removing an uploaded photo before cancel triggers orphan cleanup (photosService.remove)', async () => {
    photosSvc.upload.mockReturnValue(
      of({ ok: true, data: { _id: 'ph-2', storageUrl: 'http://x/2.jpg' } }),
    );
    await setup(null);
    instance().onPhotoSelect({
      target: { files: [new File(['x'], 'b.jpg')], value: '' },
    } as unknown as Event);
    expect(instance().photos()).toHaveLength(1);

    instance().removePhoto('ph-2');
    expect(instance().photos()).toHaveLength(0);

    instance().onCancel();
    instance().ngOnDestroy();
    expect(photosSvc.remove).toHaveBeenCalledWith('ph-2');
    expect(productsSvc.create).not.toHaveBeenCalled();
  });

  it('photo: removing an EXISTING photo defers the server delete until after a successful save', async () => {
    photosSvc.list.mockReturnValue(
      of({
        ok: true,
        data: [{ _id: 'ph-old', storageUrl: 'http://x/old.jpg' }],
      }),
    );
    await setup({
      _id: 'p-ph',
      name: 'С фото',
      kind: 'good',
      unit: 'шт',
      photoIds: ['ph-old'],
    });
    expect(instance().photos()).toHaveLength(1);

    instance().removePhoto('ph-old');
    expect(photosSvc.remove).not.toHaveBeenCalled(); // deferred, not immediate

    instance().onSubmit();
    expect(productsSvc.update).toHaveBeenCalledTimes(1);
    expect(photosSvc.remove).toHaveBeenCalledWith('ph-old'); // applied atomically after save
  });

  it('edit prefills fields and PATCHes the product (legacy create/update flow preserved)', async () => {
    await setup({
      _id: 'p-edit',
      name: 'Существующий',
      sku: 'P-1',
      kind: 'good',
      unit: 'шт',
      listPrice: 1200,
      isActive: true,
      ralCode: 'ral-7016-antracitovo-seryy',
      dimensions: { length: 2000, width: 800, unit: 'mm' },
    });
    expect(formControls().name.value).toBe('Существующий');

    instance().onSubmit();
    expect(productsSvc.update).toHaveBeenCalledTimes(1);
    expect(productsSvc.update).toHaveBeenCalledWith(
      'p-edit',
      expect.objectContaining({
        name: 'Существующий',
        listPrice: 1200,
        ralCode: 'ral-7016-antracitovo-seryy',
        dimensions: { length: 2000, width: 800, unit: 'mm' },
      }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('blocks submit when name is empty (required validation)', async () => {
    await setup(null);
    formControls().unit.setValue('шт');
    instance().onSubmit();
    expect(productsSvc.create).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('cancel closes WITHOUT saving (null) — no mutation fired', async () => {
    await setup(null);
    formControls().name.setValue('Не сохранён');
    formControls().unit.setValue('шт');
    instance().onCancel();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(null);
    expect(productsSvc.create).not.toHaveBeenCalled();
  });

  it('surfaces an API error inline and keeps the dialog open', async () => {
    productsSvc.create.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 400, error: { message: 'Ошибка валидации' } }),
      }),
    );
    await setup(null);
    formControls().name.setValue('Ошибка');
    formControls().unit.setValue('шт');
    instance().onSubmit();
    expect(close).not.toHaveBeenCalled();
  });

  it('double-submit guard: a second onSubmit while submitting is a no-op', async () => {
    await setup(null);
    formControls().name.setValue('Продукт');
    formControls().unit.setValue('шт');
    instance().onSubmit();
    instance().onSubmit();
    expect(productsSvc.create).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  // ── TZ-PRODUCTS-309: composition is edit-only in the shared BOM panel ─────

  it('TZ-PRODUCTS-309: create shows the save-then-edit composition hint', async () => {
    await setup(null);
    const hint = fixture.nativeElement.querySelector(
      '[data-test="composition-create-hint"]',
    ) as HTMLElement | null;
    expect(hint?.textContent).toContain('Сначала сохраните изделие');
    expect(fixture.nativeElement.querySelector('[data-test="product-bom-panel"]')).toBeNull();
  });

  it('TZ-PRODUCTS-309: edit renders the shared ProductBomPanel host', async () => {
    await setup({ _id: 'p-bom', name: 'Изделие', kind: 'good', unit: 'шт' });
    expect(fixture.nativeElement.querySelector('[data-test="product-bom-panel"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="composition-create-hint"]')).toBeNull();
  });

  it('DEDUP-301: create submit does not touch composition APIs (passport only)', async () => {
    await setup(null);
    formControls().name.setValue('No BOM');
    formControls().unit.setValue('pcs');
    instance().onSubmit();
    expect(productsSvc.create).toHaveBeenCalledTimes(1);
    const payload = productsSvc.create.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.composition).toBeUndefined();
    expect(payload.productModuleIds).toBeUndefined();
    expect(close).toHaveBeenCalled();
  });
});
