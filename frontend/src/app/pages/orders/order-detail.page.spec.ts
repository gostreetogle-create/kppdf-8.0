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

  beforeEach(async () => {
    paramMap$.next(convertToParamMap({ id: 'ord-1' }));
    findById.mockReset();
    getProductTree.mockReset();
    findById.mockReturnValue(of({ ok: true, data: order }));
    getProductTree.mockReturnValue(of({ ok: true, data: productTree }));

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: OrdersService, useValue: { findById } },
        { provide: ProductModulesService, useValue: { getProductTree } },
      ],
    })
      .overrideComponent(OrderDetailPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('loads order chrome and live BOM roots without deal prices', async () => {
    const fixture = TestBed.createComponent(OrderDetailPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    expect(cmp['order']()?.number).toBe('З-100');
    expect(cmp['loadError']()).toBeNull();

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
});
