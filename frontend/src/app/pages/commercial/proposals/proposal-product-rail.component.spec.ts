import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ProductsService, type Product } from '../../../shared/services/products.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { ProposalProductRailComponent } from './proposal-product-rail.component';

const product: Product = {
  _id: 'product-1',
  name: 'Стенд ресепшн',
  sku: 'ST-001',
  kind: 'good',
  unit: 'шт',
  listPrice: 12500,
  photoIds: [
    {
      _id: 'photo-1',
      storageUrl: '/uploads/stand-thumb.jpg',
      variant: 'thumb',
    },
  ],
};

describe('ProposalProductRailComponent (TZ-SALES-328)', () => {
  let fixture: ComponentFixture<ProposalProductRailComponent>;
  let listMock: jest.Mock;
  let openMock: jest.Mock;
  const added = jest.fn();

  beforeEach(async () => {
    listMock = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          items: [product],
          total: 13,
          page: 1,
          limit: 12,
        },
      }),
    );
    openMock = jest.fn(() => ({
      closed: signal<unknown | undefined>(undefined),
      close: jest.fn(),
    }));

    await TestBed.configureTestingModule({
      imports: [ProposalProductRailComponent],
      providers: [
        {
          provide: ProductsService,
          useValue: { list: listMock },
        },
        {
          provide: CategoriesService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: [
                  {
                    _id: 'category-1',
                    name: 'Мебель',
                    slug: 'mebel',
                    type: 'product',
                    skuPrefix: 'MB',
                    sortOrder: 1,
                    isActive: true,
                  },
                ],
              }),
          },
        },
        {
          provide: PiDialogService,
          useValue: { open: openMock },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalProductRailComponent);
    fixture.componentInstance.productAdd.subscribe(added);
    fixture.detectChanges();
  });

  afterEach(() => {
    added.mockReset();
  });

  it('renders md showcase cards with photo, add/edit actions, and pager', () => {
    expect(listMock).toHaveBeenCalledWith({ page: 1, limit: 12 });
    expect(fixture.nativeElement.querySelectorAll('[data-test="showcase-card"]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test="showcase-media"] img').src).toContain(
      '/uploads/stand-thumb.jpg',
    );
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-add-product-1"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-rail-edit-product-1"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-pager"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-category"]').value).toBe('');
  });

  it('emits a draft line without closing the rail when adding a product', () => {
    const addButton = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-add-product-1"] button',
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();
    expect(added).toHaveBeenCalledWith({
      productId: 'product-1',
      productName: 'Стенд ресепшн',
      productSku: 'ST-001',
      quantity: 1,
      unit: 'шт',
      unitPrice: 12500,
    });
    expect(fixture.nativeElement.querySelector('[data-test="kp-product-rail"]')).toBeTruthy();
  });

  it('passes category, search, and page state to the products API', fakeAsync(() => {
    const category = fixture.debugElement.query(By.css('[data-test="kp-rail-category"]'));
    const categoryEvent = new Event('change');
    Object.defineProperty(categoryEvent, 'target', { value: { value: 'category-1' } });
    category.triggerEventHandler('change', categoryEvent);
    expect(listMock).toHaveBeenLastCalledWith({ page: 1, limit: 12, categoryId: 'category-1' });

    const rail = fixture.componentInstance as ProposalProductRailComponent & {
      onQuery: (value: string) => void;
    };
    rail.onQuery('стенд');
    tick(250);
    expect(listMock).toHaveBeenLastCalledWith({
      page: 1,
      limit: 12,
      search: 'стенд',
      categoryId: 'category-1',
    });

    const next = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-pager"] button[aria-label="Следующая страница"]',
    ) as HTMLButtonElement;
    next.click();
    expect(listMock).toHaveBeenLastCalledWith({
      page: 2,
      limit: 12,
      search: 'стенд',
      categoryId: 'category-1',
    });
  }));

  it('opens the existing create and edit product dialogs', () => {
    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-create"] button',
      ) as HTMLButtonElement
    ).click();
    expect(openMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { entity: 'product', size: 'M' } }),
    );

    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-edit-product-1"] button',
      ) as HTMLButtonElement
    ).click();
    expect(openMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ data: product, width: 'lg' }),
    );
  });
});
