import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ProductsService, type Product } from '../../../shared/services/products.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { ProductModulesService } from '../../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../../shared/services/materials.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { ProposalProductRailComponent } from './proposal-product-rail.component';

const product: Product = {
  _id: 'product-1',
  name: 'Стенд ресепшн',
  description: 'Реальное описание изделия',
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

describe('ProposalProductRailComponent (TZ-SALES-328/348)', () => {
  let fixture: ComponentFixture<ProposalProductRailComponent>;
  let listMock: jest.Mock;
  let modulesListMock: jest.Mock;
  let materialsListMock: jest.Mock;
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
          limit: 10,
        },
      }),
    );
    modulesListMock = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 'module-1',
            name: 'Каркас',
            article: 'MD-01',
            workTypes: [],
            materials: [],
          },
        ],
      }),
    );
    materialsListMock = jest.fn().mockReturnValue(
      of({
        ok: true,
        data: {
          items: [
            {
              _id: 'material-1',
              name: 'Труба 40×40',
              article: 'MT-01',
              unit: 'м',
              pricePerUnit: 450,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
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
          provide: ProductModulesService,
          useValue: { list: modulesListMock },
        },
        {
          provide: MaterialsService,
          useValue: { list: materialsListMock },
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

  it('TZ-KP-MECH-502: shows catalog IA hint in the heading', () => {
    const hint = fixture.nativeElement.querySelector('[data-test="kp-hint-catalog"]');
    expect(hint?.textContent).toContain('Добавление в состав — только это КП');
  });

  it('renders md showcase cards with photo, add/edit actions, and pager', () => {
    expect(listMock).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(fixture.nativeElement.querySelector('[data-size="md"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-size="md"] .sc-media--md img').src).toContain(
      '/uploads/stand-thumb.jpg',
    );
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-add-product-1"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-rail-edit-product-1"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-pager"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-category"]').value).toBe('');
  });

  it('emits a draft line with quantity from the card field and keeps the rail open', () => {
    const qtyInput = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-add-qty-product-1"]',
    ) as HTMLInputElement;
    qtyInput.value = '3';
    qtyInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-add-product-1"] button',
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();
    expect(added).toHaveBeenCalledWith({
      lineKind: 'catalog',
      productId: 'product-1',
      productName: 'Стенд ресепшн',
      description: 'Реальное описание изделия',
      productSku: 'ST-001',
      quantity: 3,
      unit: 'шт',
      unitPrice: 12500,
      photoUrl: expect.stringContaining('/uploads/stand-thumb.jpg'),
    });
    expect(fixture.nativeElement.querySelector('[data-test="kp-product-rail"]')).toBeTruthy();
  });

  it('clamps card add quantity below one and preserves valid fractional quantity', () => {
    const qtyInput = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-add-qty-product-1"]',
    ) as HTMLInputElement;
    qtyInput.value = '0';
    qtyInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-add-product-1"] button',
      ) as HTMLButtonElement
    ).click();
    expect(added).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1 }));

    added.mockClear();
    qtyInput.value = '1.5';
    qtyInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-add-product-1"] button',
      ) as HTMLButtonElement
    ).click();
    expect(added).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1.5 }));
  });

  it('keeps the search query when switching catalog kind', fakeAsync(() => {
    const rail = fixture.componentInstance as ProposalProductRailComponent & {
      onQuery: (value: string) => void;
    };
    rail.onQuery('каркас');
    tick(250);
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[data-test="kp-rail-kind-module"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('[data-test="kp-rail-search"]') as HTMLInputElement)
        .value,
    ).toBe('каркас');
  }));

  it('shows an actionable Russian empty hint for an empty module view', () => {
    modulesListMock.mockReturnValueOnce(of({ ok: true, data: [] }));
    (
      fixture.nativeElement.querySelector('[data-test="kp-rail-kind-module"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('[data-test="kp-rail-empty"]');
    expect(empty?.textContent).toContain('Выберите «Изделия» или «Материалы»');
    expect(empty?.textContent).not.toContain('No data');
  });

  it('explains how to recover from a search with no results', fakeAsync(() => {
    const rail = fixture.componentInstance as ProposalProductRailComponent & {
      onQuery: (value: string) => void;
    };
    listMock.mockReturnValueOnce(
      of({ ok: true, data: { items: [], total: 0, page: 1, limit: 10 } }),
    );
    rail.onQuery('несуществующее');
    tick(250);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('[data-test="kp-rail-empty"]');
    expect(empty?.textContent).toContain('Измените поиск или выберите другой вид каталога');
  }));

  it('shows В КП badge from draftLines without draft-lines list (TZ-SALES-375)', () => {
    fixture.componentRef.setInput('draftLines', [
      {
        lineKind: 'catalog',
        productId: 'product-1',
        productName: 'Стенд ресепшн',
        quantity: 2,
        unitPrice: 12500,
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-draft-lines"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-rail-in-kp-product-1"]').textContent,
    ).toContain('В КП: 2');
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-rail-add-product-1"]').textContent,
    ).toContain('Ещё +1');

    fixture.componentRef.setInput('draftLines', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-in-kp-product-1"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-rail-add-product-1"]').textContent,
    ).toContain('Добавить');
  });

  it('switches chips to modules and emits module lineKind/refId', () => {
    (
      fixture.nativeElement.querySelector('[data-test="kp-rail-kind-module"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(modulesListMock).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="kp-rail-category"]')).toBeNull();

    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-add-module-1"] button',
      ) as HTMLButtonElement
    ).click();
    expect(added).toHaveBeenCalledWith(
      expect.objectContaining({
        lineKind: 'module',
        productId: 'module-1',
        refId: 'module-1',
        productName: 'Каркас',
        productSku: 'MD-01',
        quantity: 1,
        unitPrice: 0,
      }),
    );
  });

  it('switches chips to materials and loads materials API', () => {
    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-kind-material"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(materialsListMock).toHaveBeenCalledWith({ page: 1, limit: 10 });
    (
      fixture.nativeElement.querySelector(
        '[data-test="kp-rail-add-material-1"] button',
      ) as HTMLButtonElement
    ).click();
    expect(added).toHaveBeenCalledWith(
      expect.objectContaining({
        lineKind: 'material',
        refId: 'material-1',
        productName: 'Труба 40×40',
        unitPrice: 450,
      }),
    );
  });

  it('passes category, search, and page state to the products API', fakeAsync(() => {
    const category = fixture.debugElement.query(By.css('[data-test="kp-rail-category"]'));
    const categoryEvent = new Event('change');
    Object.defineProperty(categoryEvent, 'target', { value: { value: 'category-1' } });
    category.triggerEventHandler('change', categoryEvent);
    expect(listMock).toHaveBeenLastCalledWith({ page: 1, limit: 10, categoryId: 'category-1' });

    const rail = fixture.componentInstance as ProposalProductRailComponent & {
      onQuery: (value: string) => void;
    };
    rail.onQuery('стенд');
    tick(250);
    expect(listMock).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      search: 'стенд',
      categoryId: 'category-1',
    });

    const next = fixture.nativeElement.querySelector(
      '[data-test="kp-rail-pager"] button[aria-label="Следующая страница"]',
    ) as HTMLButtonElement;
    next.click();
    expect(listMock).toHaveBeenLastCalledWith({
      page: 2,
      limit: 10,
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
