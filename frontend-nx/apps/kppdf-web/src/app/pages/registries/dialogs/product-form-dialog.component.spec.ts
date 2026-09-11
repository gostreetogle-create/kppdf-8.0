import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiCategoriesService,
  PiCompositionService,
  PiPhotosService,
  PiProductsService,
  PiUnitsService,
  type ProductDetail,
} from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF, PiDialogService } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { ProductFormDialogComponent } from './product-form-dialog.component';

const SAMPLE: ProductDetail = {
  _id: 'prod-1',
  name: 'Окно',
  sku: 'WIN-1',
  kind: 'good',
  unit: 'pcs',
  // TZ-NX-REG-CATEGORY-WIRE-PRODUCTS: категория теперь обязательна — без неё
  // onSubmit() в тестах ниже был бы блокирован формой.
  categoryId: 'cat-1',
};

/** TZ-NX-REG-CATEGORY-WIRE-PRODUCTS — every dialog instance now loads categories on init. */
const CATEGORIES_MOCK = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

const UNITS_MOCK = {
  list: jest.fn().mockReturnValue(
    of({
      ok: true,
      data: {
        items: [{ key: 'pcs', label: 'Штука', isActive: true, isSystem: true, sortOrder: 0 }],
        total: 1,
        page: 1,
        limit: 50,
      },
    }),
  ),
};

// jsdom lacks Element.scrollIntoView; composition focus uses it via queueMicrotask.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? jest.fn();

const PHOTOS_MOCK = {
  upload: jest.fn(),
  remove: jest.fn().mockReturnValue(of({ ok: true, data: null })),
  get: jest.fn(),
  updateFrame: jest.fn(),
};

const COMPOSITION_MOCK = {
  getProductTree: jest.fn().mockReturnValue(
    of({ ok: true, data: { _id: 'prod-1', name: 'Окно', kind: 'product', quantity: 1, children: [] } }),
  ),
  getProductComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
};

describe('ProductFormDialogComponent (Phase 2)', () => {
  describe('edit mode', () => {
    let fixture: ComponentFixture<ProductFormDialogComponent>;
    const close = jest.fn();

    beforeEach(async () => {
      close.mockReset();
      await TestBed.configureTestingModule({
        imports: [ProductFormDialogComponent],
        providers: [
          {
            provide: PI_DIALOG_DATA,
            useValue: { mode: 'edit', product: SAMPLE, focusComposition: true },
          },
          { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
          {
            provide: PiProductsService,
            useValue: {
              update: jest.fn().mockReturnValue(of({ ok: true, data: SAMPLE })),
              create: jest.fn(),
            },
          },
          { provide: PiUnitsService, useValue: UNITS_MOCK },
          { provide: PiPhotosService, useValue: PHOTOS_MOCK },
          {
            provide: PiDialogService,
            useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
          },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
          { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductFormDialogComponent);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('opens edit dialog with composition focus and no passport preview', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-test="product-form"]')).toBeTruthy();
      expect(el.querySelector('[data-test="product-composition-focus"]')).toBeTruthy();
      expect(el.querySelector('pi-product-passport-preview')).toBeNull();
      expect(el.querySelector('[data-test="passport-preview-notice"]')).toBeNull();
      expect(el.textContent).not.toContain('Паспорт изделия');
    });

    it('closes on cancel when pristine', () => {
      fixture.componentInstance['onCancel']();
      expect(close).toHaveBeenCalled();
    });
  });

  describe('create mode', () => {
    let fixture: ComponentFixture<ProductFormDialogComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ProductFormDialogComponent],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
          { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
          {
            provide: PiProductsService,
            useValue: {
              create: jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE, isComplex: false } })),
              update: jest.fn(),
            },
          },
          { provide: PiUnitsService, useValue: UNITS_MOCK },
          { provide: PiPhotosService, useValue: PHOTOS_MOCK },
          {
            provide: PiDialogService,
            useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
          },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
          { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductFormDialogComponent);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('shows composition and complex hints without passport preview', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-test="product-composition-create-hint"]')).toBeTruthy();
      expect(el.querySelector('[data-test="product-complex-hint"]')?.textContent).toContain('Комплекс');
      expect(el.querySelector('pi-product-passport-preview')).toBeNull();
    });
  });
});

describe('ProductFormDialogComponent — категория (TZ-NX-REG-CATEGORY-WIRE-PRODUCTS)', () => {
  let fixture: ComponentFixture<ProductFormDialogComponent>;
  const productCategories = [
    { _id: 'cat-1', name: 'Мебель', slug: 'furniture', type: 'product' as const, skuPrefix: 'FUR', sortOrder: 0, isActive: true },
    { _id: 'cat-2', name: 'Вывески', slug: 'signage', type: 'product' as const, skuPrefix: 'SGN', sortOrder: 0, isActive: true },
  ];

  async function setup(data: Record<string, unknown>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ProductFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } as DialogRef<unknown> },
        {
          provide: PiProductsService,
          useValue: {
            create: jest.fn().mockReturnValue(of({ ok: true, data: { ...SAMPLE, isComplex: false } })),
            update: jest.fn().mockReturnValue(of({ ok: true, data: SAMPLE })),
          },
        },
        { provide: PiUnitsService, useValue: UNITS_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        { provide: PiDialogService, useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) } },
        { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
        { provide: PiCategoriesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: productCategories })) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('offers the live type=product category list and blocks create until one is chosen', async () => {
    await setup({ mode: 'create' });

    const select = fixture.nativeElement.querySelector('[data-test="prod-category"]') as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent?.trim());
    expect(labels).toEqual(['— выберите —', 'Мебель', 'Вывески']);

    const service = TestBed.inject(PiProductsService);
    fixture.componentInstance['form'].patchValue({ sku: 'X-1', kind: 'good', unit: 'pcs' });
    await fixture.componentInstance['onSubmit']();
    expect(service.create).not.toHaveBeenCalled();

    fixture.componentInstance['form'].patchValue({ categoryId: 'cat-1' });
    await fixture.componentInstance['onSubmit']();
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat-1' }));
  });

  it('extracts the id from a populated categoryId ref when patching edit data (GET /products populates it)', async () => {
    await setup({ mode: 'edit', product: { ...SAMPLE, categoryId: { _id: 'cat-2', name: 'Вывески' } } });

    expect(fixture.componentInstance['form'].controls.categoryId.value).toBe('cat-2');
  });
});

describe('ProductFormDialogComponent фото (TZ-NX-PHOTO-P1)', () => {
  const EDIT_SAMPLE = { ...SAMPLE, photoIds: ['ph-1'], mainPhotoId: 'ph-1' } as ProductDetail;
  let fixture: ComponentFixture<ProductFormDialogComponent>;
  const close = jest.fn();
  const update = jest.fn();

  beforeEach(async () => {
    close.mockReset();
    PHOTOS_MOCK.upload
      .mockReset()
      .mockReturnValue(of({ ok: true, data: { _id: 'ph-2', storageUrl: '/uploads/ph-2.jpg' } }));
    PHOTOS_MOCK.remove.mockReset().mockReturnValue(of({ ok: true, data: null }));
    update.mockReset().mockReturnValue(of({ ok: true, data: EDIT_SAMPLE }));
    await TestBed.configureTestingModule({
      imports: [ProductFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'edit', product: EDIT_SAMPLE } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiProductsService, useValue: { update, create: jest.fn() } },
        { provide: PiUnitsService, useValue: UNITS_MOCK },
        { provide: PiPhotosService, useValue: PHOTOS_MOCK },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
        { provide: PiCategoriesService, useValue: CATEGORIES_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the photo section with dropzone and hydrates edit photos with main', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="product-photo-dropzone"]')).toBeTruthy();
    expect(el.querySelector('[data-test="photo-preview-0"]')).toBeTruthy();
    const mainBtn = el.querySelector(
      '[data-test="photo-preview-0"] [data-test="photo-main-toggle"]',
    ) as HTMLButtonElement;
    expect(mainBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('upload → save payload contains photoIds + mainPhotoId', async () => {
    const file = new File(['image'], 'new.jpg', { type: 'image/jpeg' });
    await fixture.componentInstance['onPhotosSelected']([file]);
    fixture.detectChanges();
    expect(PHOTOS_MOCK.upload).toHaveBeenCalledWith(file);

    await fixture.componentInstance['onSubmit']();
    await fixture.whenStable();
    const payload = update.mock.calls[0][1];
    expect(payload.photoIds).toEqual(['ph-1', 'ph-2']);
    expect(payload.mainPhotoId).toBe('ph-1');
  });

  it('remove main reassigns main to first remaining (null when empty)', async () => {
    await fixture.componentInstance['onPhotosSelected']([
      new File(['i'], 'b.jpg', { type: 'image/jpeg' }),
    ]);
    fixture.detectChanges();
    // now [ph-1, ph-2(upload)]; remove main ph-1 → ph-2 becomes main
    fixture.componentInstance['onPhotoRemove']('ph-1');
    expect(fixture.componentInstance['mainPhotoId']()).toBe('ph-2');

    fixture.componentInstance['onPhotoRemove']('ph-2');
    expect(fixture.componentInstance['mainPhotoId']()).toBeNull();
    expect(PHOTOS_MOCK.remove).toHaveBeenCalledWith('ph-1');
  });

  it('star toggle emits through local main signal', () => {
    fixture.componentInstance['onPhotoMainChanged'](null);
    expect(fixture.componentInstance['mainPhotoId']()).toBeNull();
    fixture.componentInstance['onPhotoMainChanged']('ph-1');
    expect(fixture.componentInstance['mainPhotoId']()).toBe('ph-1');
  });
});
