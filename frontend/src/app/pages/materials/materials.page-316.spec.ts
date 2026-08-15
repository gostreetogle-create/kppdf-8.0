import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { MaterialsPage } from './materials.page';
import { OrganizationsService } from '../../shared/services/organizations.service';
import { PhotosService } from '../../shared/services/photos.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * Own suite for TZ-CATALOG-316 kindFilter → ?materialKind=.
 *
 * Must not share a describe with materials.page.spec.ts's
 * debouncedSearch re-fire: two settled→signal→flushEffects cycles in
 * one TestBed ApplicationRef trip NG0101 and fail the second it().
 */
describe('MaterialsPage kindFilter (TZ-CATALOG-316)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/materials`;

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: OrganizationsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 200 } }),
          },
        },
        {
          provide: PhotosService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            upload: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 10 } }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            duplicate: () => of({ ok: true, data: { _id: 'c', name: 'x', unit: 'm2' } }),
          },
        },
        { provide: PiDialogService, useValue: { open: () => ({}) as never } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        {
          provide: PiDictionaryLabelsService,
          useValue: { active: () => of(dictionaryLabelOptions('materialKind')) },
        },
      ],
    })
      .overrideComponent(MaterialsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('re-fires GET with materialKind=fastener when kindFilter flips', async () => {
    const fixture = TestBed.createComponent(MaterialsPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0, page: 1, limit: 10 });
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onKindFilterChange(event: Event): void;
    };
    comp.onKindFilterChange({ target: { value: 'fastener' } } as unknown as Event);
    TestBed.flushEffects();

    const req = httpMock.expectOne(
      (r) =>
        r.url === listUrl &&
        r.method === 'GET' &&
        r.params.get('materialKind') === 'fastener' &&
        r.params.get('page') === '1',
    );
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 10 });
    await tickMicrotask();
  });
});
