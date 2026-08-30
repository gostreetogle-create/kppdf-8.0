import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiCompositionService, PiUnitsService } from '@kppdf/data-access';
import { ProductPassportPreviewComponent } from './product-passport-preview.component';

describe('ProductPassportPreviewComponent (TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION)', () => {
  let fixture: ComponentFixture<ProductPassportPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPassportPreviewComponent],
      providers: [
        {
          provide: PiCompositionService,
          useValue: {
            getProductTree: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  _id: 'p1',
                  name: 'P',
                  kind: 'product',
                  quantity: 1,
                  children: [
                    {
                      _id: 'm1',
                      name: 'Модуль',
                      kind: 'module',
                      lineType: 'module',
                      quantity: 1,
                      children: [],
                    },
                  ],
                },
              }),
            ),
          },
        },
        {
          provide: PiUnitsService,
          useValue: {
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
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPassportPreviewComponent);
    fixture.componentRef.setInput('product', {
      _id: 'p1',
      name: 'Изделие',
      sku: 'SKU-1',
      kind: 'good',
      unit: 'pcs',
    });
    fixture.componentRef.setInput('productId', 'p1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders read-only preview without form controls', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="passport-preview-notice"]')).toBeTruthy();
    expect(el.querySelector('input')).toBeNull();
    expect(el.querySelector('textarea')).toBeNull();
    expect(el.querySelector('[data-test="passport-field-name"]')?.textContent).toContain('Изделие');
    expect(el.querySelector('[data-test="passport-composition-summary"]')).toBeTruthy();
  });

  it('shows snapshot-only marker on blocked fields', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const passportField = el.querySelector('[data-test="passport-field-passportNumber"]');
    expect(passportField?.textContent).toContain('Не указано');
    expect(passportField?.querySelector('[data-test="passport-snapshot-only"]')).toBeTruthy();
  });
});
