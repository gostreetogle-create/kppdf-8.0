import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { OrderDetailPage } from './order-detail.page';
import { OrdersService, Order } from './orders.service';
import {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../core/api.tokens';

describe('OrderDetailPage (TZ-ORDERS-302)', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ id: 'ord-1' }));

  const order: Order = {
    _id: 'ord-1',
    number: 'З-100',
    status: 'confirmed',
    date: '2026-08-01',
    items: [
      {
        productId: 'prod-1',
        productName: 'Стеллаж А',
        quantity: 2,
        unit: 'шт',
        unitPrice: 9999,
        readyForWork: true,
      },
    ],
  };

  const productTree: CompositionTreeNode = {
    _id: 'prod-1',
    name: 'Стеллаж А (каталог)',
    kind: 'product',
    quantity: 1,
    children: [
      {
        _id: 'mod-1',
        name: 'Каркас',
        kind: 'module',
        quantity: 1,
        children: [
          {
            _id: 'mat-1',
            name: 'Труба 40×40',
            kind: 'material',
            quantity: 4,
            unit: 'м',
            children: [],
          },
        ],
      },
    ],
  };

  const findById = jest.fn();
  const getProductTree = jest.fn();
  const createStubProposal = jest.fn();
  const productsFindById = jest.fn();
  const modulesFindById = jest.fn();
  const materialsFindById = jest.fn();

  beforeEach(async () => {
    paramMap$.next(convertToParamMap({ id: 'ord-1' }));
    findById.mockReset();
    getProductTree.mockReset();
    createStubProposal.mockReset();
    productsFindById.mockReset();
    modulesFindById.mockReset();
    materialsFindById.mockReset();
    findById.mockReturnValue(of({ ok: true, data: order }));
    getProductTree.mockReturnValue(of({ ok: true, data: productTree }));
    productsFindById.mockReturnValue(of({ ok: true, data: { _id: 'prod-1', name: 'Стеллаж А' } }));
    modulesFindById.mockReturnValue(of({ ok: true, data: { _id: 'mod-1', name: 'Каркас' } }));
    materialsFindById.mockReturnValue(
      of({ ok: true, data: { _id: 'mat-1', name: 'Труба 40×40' } }),
    );
    createStubProposal.mockReturnValue(
      of({
        ok: true,
        data: {
          quotationId: 'qtn-1',
          created: true,
          quotation: { _id: 'qtn-1', number: 'QTN-0007', isStub: true },
        },
      }),
    );

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: OrdersService, useValue: { findById, createStubProposal } },
        { provide: ProductModulesService, useValue: { getProductTree, findById: modulesFindById } },
        { provide: ProductsService, useValue: { findById: productsFindById } },
        { provide: MaterialsService, useValue: { findById: materialsFindById } },
        { provide: PiDialogService, useValue: { open: jest.fn().mockReturnValue({}) } },
      ],
    })
      .overrideComponent(OrderDetailPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('keeps the shared FactStack adoption contract in the page source', () => {
    const source = require('fs').readFileSync('src/app/pages/orders/order-detail.page.ts', 'utf8');
    expect(source).toContain('PiFactCardComponent');
    expect(source).toContain('PiFactStackComponent');
    expect(source).toContain('order-detail-facts');
    expect(source).toContain('title="Заказ"');
    expect(source).not.toContain('Паспорт заказа');
    expect(source).toContain('o.number');
  });

  it('loads order chrome and live BOM roots without deal prices', async () => {
    const fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    expect(cmp['order']()?.number).toBe('З-100');
    expect(cmp['loadError']()).toBeNull();
    expect(cmp['lineMetaRows']()[0].ready).toBe(true);

    const roots = cmp['lineRoots']();
    expect(roots.length).toBe(1);
    expect(roots[0].name).toBe('Стеллаж А');
    expect(roots[0].quantity).toBe(2);
    expect(roots[0].children[0]?.name).toBe('Каркас');
    expect(roots[0].children[0]?.children[0]?.kind).toBe('material');

    const json = JSON.stringify(roots);
    expect(json).not.toContain('9999');
    expect(json).not.toContain('unitPrice');
  });

  it('shows honest empty when order has no lines', async () => {
    findById.mockReturnValue(of({ ok: true, data: { ...order, items: [] } }));
    const fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.componentInstance['hasLines']()).toBe(false);
    expect(fixture.componentInstance['lineRoots']().length).toBe(0);
  });

  describe('stub КП (TZ-ORDERS-306)', () => {
    async function render() {
      const fixture = TestBed.createComponent(OrderDetailPage);
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
      return fixture;
    }

    it('states plainly that a direct order has no КП and offers to create a draft', async () => {
      const fixture = await render();

      expect(fixture.componentInstance['proposalLine']()).toBe('Нет — прямой заказ');
      expect(
        fixture.nativeElement.querySelector('[data-test="order-create-stub-proposal"]'),
      ).toBeTruthy();
    });

    it('creates the stub and shows the КП number afterwards', async () => {
      const fixture = await render();
      fixture.componentInstance['createStubProposal']();
      fixture.detectChanges();

      expect(createStubProposal).toHaveBeenCalledWith('ord-1');
      expect(fixture.componentInstance['proposalId']()).toBe('qtn-1');
      expect(fixture.componentInstance['proposalLine']()).toContain('QTN-0007');
      expect(fixture.componentInstance['proposalLine']()).toContain('заглушка');
      expect(
        fixture.nativeElement.querySelector('[data-test="order-create-stub-proposal"]'),
      ).toBeNull();
    });

    it('offers no create action when the order already has a КП', async () => {
      findById.mockReturnValue(
        of({
          ok: true,
          data: { ...order, quotationId: { _id: 'qtn-9', number: 'QTN-0001' } },
        }),
      );
      const fixture = await render();

      expect(fixture.componentInstance['proposalLine']()).toBe('№QTN-0001');
      expect(
        fixture.nativeElement.querySelector('[data-test="order-create-stub-proposal"]'),
      ).toBeNull();
      expect(createStubProposal).not.toHaveBeenCalled();
    });
  });

  it('warns when catalog product is missing', async () => {
    getProductTree.mockReturnValue(of({ ok: false, error: { status: 404, message: 'gone' } }));
    const fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const roots = fixture.componentInstance['lineRoots']();
    expect(roots[0].name).toContain('не найдено в каталоге');
    expect(roots[0].children).toEqual([]);
  });

  describe('TZ-ORDERS-337 catalog edit', () => {
    async function renderLeafProduct() {
      getProductTree.mockReturnValue(
        of({
          ok: true,
          data: { ...productTree, children: [] as CompositionTreeNode[] },
        }),
      );
      const fixture = TestBed.createComponent(OrderDetailPage);
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
      return fixture;
    }

    it('opens product editor when a leaf product row is clicked', async () => {
      const fixture = await renderLeafProduct();
      const cmp = fixture.componentInstance as unknown as {
        onSelect: (ev: {
          node: CompositionTreeNode;
          parent: CompositionTreeNode | null;
          depth: number;
        }) => void;
      };
      const leaf = { ...productTree, children: [] as CompositionTreeNode[] };
      cmp.onSelect({ node: leaf, parent: null, depth: 0 });
      expect(productsFindById).toHaveBeenCalledWith('prod-1');
    });

    it('opens product editor from the pencil on a leaf product', async () => {
      const fixture = await renderLeafProduct();
      const cmp = fixture.componentInstance as unknown as {
        onEdit: (ev: {
          node: CompositionTreeNode;
          parent: CompositionTreeNode | null;
          depth: number;
        }) => void;
      };
      const leaf = { ...productTree, children: [] as CompositionTreeNode[] };
      cmp.onEdit({ node: leaf, parent: null, depth: 0 });
      expect(productsFindById).toHaveBeenCalledWith('prod-1');
    });

    it('pencil on a module loads the module from catalog', async () => {
      const fixture = TestBed.createComponent(OrderDetailPage);
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
      const cmp = fixture.componentInstance as unknown as {
        onEdit: (ev: {
          node: CompositionTreeNode;
          parent: CompositionTreeNode | null;
          depth: number;
        }) => void;
      };
      cmp.onEdit({
        node: productTree.children[0]!,
        parent: productTree,
        depth: 1,
      });
      expect(modulesFindById).toHaveBeenCalledWith('mod-1');
    });

    it('pencil on a material loads the material from catalog', async () => {
      const fixture = TestBed.createComponent(OrderDetailPage);
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
      const cmp = fixture.componentInstance as unknown as {
        onEdit: (ev: {
          node: CompositionTreeNode;
          parent: CompositionTreeNode | null;
          depth: number;
        }) => void;
      };
      cmp.onEdit({
        node: productTree.children[0]!.children[0]!,
        parent: productTree.children[0]!,
        depth: 2,
      });
      expect(materialsFindById).toHaveBeenCalledWith('mat-1');
    });
  });
});
