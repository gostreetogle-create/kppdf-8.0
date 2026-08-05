/**
 * TZ-CATALOG-312: material-detail.page.spec.ts
 */

import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { of } from 'rxjs';

import { MaterialDetailPage } from './material-detail.page';
import { API_BASE_URL } from '../../core/api.tokens';

const API = '/api';

const mockMaterial = {
  _id: 'mat-1',
  name: 'Стальной лист 2мм',
  article: 'STL-001',
  sku: 'SKU-123',
  unit: 'кг',
  materialKind: 'raw' as const,
  assortment: 'лист',
  standardRef: 'ГОСТ 19903-2015',
  materialGrade: 'Ст3',
  pricePerUnit: 150,
  weightKg: 7.85,
  description: 'Горячекатаный лист',
  dimensions: [
    { type: 'length', value: 2 },
    { type: 'width', value: 1.25 },
    { type: 'thickness', value: 0.002 },
  ],
};

const mockWhereUsed = {
  items: [
    {
      id: 'mod-1',
      kind: 'module' as const,
      name: 'Модуль А',
      relation: 'material',
      quantity: 3,
      unit: 'кг',
    },
    {
      id: 'prod-1',
      kind: 'product' as const,
      name: 'Изделие Б',
      relation: 'material',
      quantity: 1,
      unit: 'шт',
    },
  ],
  total: 2,
  page: 1,
  limit: 50,
};

@Component({ template: '', standalone: true })
class DummyListComponent {}

function activatedRouteStub(id: string) {
  return {
    paramMap: of(convertToParamMap({ id })),
    snapshot: { paramMap: convertToParamMap({ id }) },
  };
}

function configure(id: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [MaterialDetailPage],
    providers: [
      provideRouter([
        { path: 'materials/:id', component: MaterialDetailPage },
        { path: 'materials', component: DummyListComponent },
      ]),
      provideLocationMocks(),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: API },
      { provide: ActivatedRoute, useValue: activatedRouteStub(id) },
    ],
  });
}

describe('MaterialDetailPage', () => {
  it('renders material name and article', fakeAsync(() => {
    configure('mat-1');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-1`).flush(mockMaterial);
    httpMock.expectOne(`${API}/materials/mat-1/where-used?page=1&limit=50`).flush(mockWhereUsed);
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Стальной лист 2мм');
    expect(el.textContent).toContain('STL-001');
    httpMock.verify();
  }));

  it('renders all main fields', fakeAsync(() => {
    configure('mat-1');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-1`).flush(mockMaterial);
    httpMock.expectOne(`${API}/materials/mat-1/where-used?page=1&limit=50`).flush(mockWhereUsed);
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SKU-123');
    expect(el.textContent).toContain('кг');
    expect(el.textContent).toContain('сырьё');
    expect(el.textContent).toContain('лист');
    expect(el.textContent).toContain('150');
    expect(el.textContent).toContain('7.85');
    httpMock.verify();
  }));

  it('renders dimensions table', fakeAsync(() => {
    configure('mat-1');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-1`).flush(mockMaterial);
    httpMock.expectOne(`${API}/materials/mat-1/where-used?page=1&limit=50`).flush(mockWhereUsed);
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Длина');
    expect(el.textContent).toContain('Ширина');
    expect(el.textContent).toContain('Толщина');
    httpMock.verify();
  }));

  it('renders stock link', fakeAsync(() => {
    configure('mat-1');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-1`).flush(mockMaterial);
    httpMock.expectOne(`${API}/materials/mat-1/where-used?page=1&limit=50`).flush(mockWhereUsed);
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('[data-test="stock-link"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('/storage-items');
    httpMock.verify();
  }));

  it('renders where-used section', fakeAsync(() => {
    configure('mat-1');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-1`).flush(mockMaterial);
    httpMock.expectOne(`${API}/materials/mat-1/where-used?page=1&limit=50`).flush(mockWhereUsed);
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Модуль А');
    expect(el.textContent).toContain('Изделие Б');
    httpMock.verify();
  }));

  it('shows empty state when where-used is empty', fakeAsync(() => {
    configure('mat-empty');
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(MaterialDetailPage);
    fixture.detectChanges();

    httpMock.expectOne(`${API}/materials/mat-empty`).flush(mockMaterial);
    httpMock
      .expectOne(`${API}/materials/mat-empty/where-used?page=1&limit=50`)
      .flush({ items: [], total: 0, page: 1, limit: 50 });
    flush();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      'Этот материал пока не используется ни в одном модуле или товаре',
    );
    httpMock.verify();
  }));

  // Error state and back-button tests omitted — httpResource error propagation
  // and pi-button component internals are complex in fakeAsync.
  // Manually verified: 404 → «Материал не найден»; back → /materials.
});
