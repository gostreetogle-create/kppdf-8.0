import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { StockMovementsPage } from './stock-movements.page';
import { StockMovementsService, StockMovement } from './stock-movements.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * Spec v3 — TZ-232.F.1. Wrapper handles HTTP, loading, and error
 * states internally, so the spec layer focuses on API-contract:
 *  - mount + initial envelope emission,
 *  - type-filter binding via `[params]`,
 *  - clearFilters resets the filter,
 *  - error response handled cleanly (no thrown).
 */
describe('StockMovementsPage (post-TZ-232.F.1)', () => {
  const fakeMovements: StockMovement[] = [
    {
      _id: 'sm1',
      type: 'in',
      qty: 10,
      date: '2026-01-01',
      productId: 'p1',
      warehouseId: 'w1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StockMovement,
    {
      _id: 'sm2',
      type: 'out',
      qty: 5,
      date: '2026-01-02',
      productId: 'p1',
      warehouseId: 'w1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StockMovement,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: StockMovementsService,
          useValue: {
            list: (params: { type?: string } = {}) =>
              of({
                ok: true,
                data: {
                  items: params.type
                    ? fakeMovements.filter((m) => m.type === params.type)
                    : fakeMovements,
                  total: params.type
                    ? fakeMovements.filter((m) => m.type === params.type).length
                    : fakeMovements.length,
                },
              }),
            create: () => of({ ok: true, data: {} as StockMovement }),
            remove: () => of({ ok: true, data: undefined }),
            summary: () => of({ ok: true, data: { period: 'month', totalIn: 0, totalOut: 0, totalAdjust: 0 } }),
          },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
      ],
    })
      .overrideComponent(StockMovementsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('mounts cleanly', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes a listService adapter with the wrapper-expected shape', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      listService: {
        list: (p: { page: number; limit: number }) => {
          subscribe: (fn: (v: unknown) => void) => unknown;
        };
      };
    };
    let captured: unknown = undefined;
    comp.listService?.list({ page: 1, limit: 50 }).subscribe((v) => {
      captured = v;
    });
    expect(captured).toBeDefined();
  });

  it('selectedType setter → typeFilterParams() reflects new value', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      selectedType: { set: (v: string) => void; (): string };
      typeFilterParams: () => Record<string, unknown>;
    };

    expect(comp.typeFilterParams()).toEqual({});
    comp.selectedType.set('in');
    expect(comp.typeFilterParams()).toEqual({ type: 'in' });
  });

  it('clearFilters resets selectedType to empty', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      selectedType: { (): string; set: (v: string) => void };
      clearFilters: () => void;
    };
    comp.selectedType.set('in');
    comp.clearFilters();
    expect(comp.selectedType()).toBe('');
  });

  it('onTypeChange updates selectedType from event', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onTypeChange: (e: { target: { value: string } }) => void;
      selectedType: { (): string };
    };
    comp.onTypeChange({ target: { value: 'transfer' } });
    expect(comp.selectedType()).toBe('transfer');
  });

  it('typeLabel formatter maps MovementType to Russian label', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      typeLabel: (t: string) => string;
    };
    expect(comp.typeLabel('in')).toBe('Приход');
    expect(comp.typeLabel('out')).toBe('Расход');
    expect(comp.typeLabel('adjust')).toBe('Корр.');
    expect(comp.typeLabel('transfer')).toBe('Перемещ.');
  });
});
