import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  PiCompositionService,
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
};

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
          {
            provide: PiDialogService,
            useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
          },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
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
          {
            provide: PiDialogService,
            useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
          },
          { provide: PiCompositionService, useValue: COMPOSITION_MOCK },
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
