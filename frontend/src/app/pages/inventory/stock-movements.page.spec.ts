import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StockMovementsPage } from './stock-movements.page';
import { API_BASE_URL } from '../../core/api.tokens';

describe('StockMovementsPage (Wave D — PiEntityListComponent)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const movementsUrl = `${baseUrl}/stock-movements`;

  function flushAll(data?: { items: unknown[]; total: number }): void {
    httpMock
      .expectOne((r) => r.url.startsWith(movementsUrl) && r.method === 'GET')
      .flush(data ?? { items: [], total: 0 });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    })
      .overrideComponent(StockMovementsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component and fires initial GET /api/stock-movements', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('selectedType starts empty (filter for all types)', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      selectedType: () => string;
    };
    expect(comp.selectedType()).toBe('');
  });

  it('onTypeChange sets the selected type signal', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      onTypeChange: (event: Event) => void;
      selectedType: () => string;
    };
    const fakeEvent = { target: { value: 'in' } } as unknown as Event;
    comp.onTypeChange(fakeEvent);
    expect(comp.selectedType()).toBe('in');
  });

  it('listParams returns empty when no type selected', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      listParams: () => Record<string, string>;
    };
    expect(comp.listParams()).toEqual({});
  });

  it('listParams returns type=... when type selected', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      selectedType: { set: (v: string) => void };
      listParams: () => Record<string, string>;
    };
    comp.selectedType.set('out');
    expect(comp.listParams()).toEqual({ type: 'out' });
  });

  it('renders pi-entity-list with select in template', () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();
    flushAll();
    const rootEl = fixture.nativeElement as HTMLElement;
    expect(rootEl.querySelector('app-pi-entity-list')).toBeTruthy();
    expect(rootEl.querySelector('app-pi-entity-list select')).toBeTruthy();
  });
});
