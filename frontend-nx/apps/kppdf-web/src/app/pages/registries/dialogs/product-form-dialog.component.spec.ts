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

describe('ProductFormDialogComponent (Phase 2)', () => {
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
        {
          provide: PiUnitsService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: { items: [{ key: 'pcs', label: 'Штука', isActive: true, isSystem: true, sortOrder: 0 }], total: 1, page: 1, limit: 50 },
              }),
            ),
          },
        },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiCompositionService,
          useValue: {
            getProductTree: jest.fn().mockReturnValue(
              of({ ok: true, data: { _id: 'prod-1', name: 'Окно', kind: 'product', quantity: 1, children: [] } }),
            ),
            getProductComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('opens edit dialog with passport and composition focus attr', () => {
    expect(fixture.nativeElement.querySelector('[data-test="product-form"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="product-composition-focus"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="passport-preview-notice"]')).toBeTruthy();
  });

  it('closes on cancel when pristine', () => {
    fixture.componentInstance['onCancel']();
    expect(close).toHaveBeenCalled();
  });
});
