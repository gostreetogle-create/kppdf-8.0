import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { TemplatesPage } from './templates.page';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('TemplatesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };

  const fakeTemplates = [
    {
      _id: 'dt1',
      name: 'Договор поставки',
      tags: ['договор'],
      organizationId: 'org1',
      docTypeId: { _id: 'dt1', name: 'Договор' },
      isDefault: false,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      backgroundOpacity: 0.3,
      version: 1,
    },
    {
      _id: 'dt2',
      name: 'КП по умолчанию',
      tags: ['КП'],
      organizationId: 'org1',
      docTypeId: { _id: 'dt2', name: 'КП' },
      isDefault: true,
      isActive: true,
      pageSize: 'A4',
      backgroundImage: [],
      backgroundOpacity: 0.3,
      version: 1,
    },
  ];

  const listResult = { ok: true, data: { items: fakeTemplates } };

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnValue({
                subscribe: (observerOrCb: unknown) => {
                  if (typeof observerOrCb === 'function') observerOrCb(listResult);
                  else (observerOrCb as { next: (r: typeof listResult) => void }).next(listResult);
                },
              }),
            }),
            create: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean; data: { _id: string } }) => void) =>
                cb({ ok: true, data: { _id: 'dt3' } }),
            }),
            update: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean }) => void) => cb({ ok: true }),
            }),
            remove: jest.fn().mockReturnValue({
              subscribe: (cb: (r: { ok: boolean }) => void) => cb({ ok: true }),
            }),
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TemplatesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates successfully', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads templates on creation', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => { _id: string }[];
      loading: () => boolean;
    };

    expect(comp.items().length).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state initially', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      loading: () => boolean;
    };
    expect(comp.loading()).toBe(false);
  });

  it('filters templates by search query', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      filtered: () => { _id: string; name: string }[];
    };

    comp.searchQuery.set('Договор');
    fixture.detectChanges();

    const filtered = comp.filtered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Договор поставки');
  });

  it('returns all when search is cleared', async () => {
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      filtered: () => { _id: string }[];
    };

    comp.searchQuery.set('Договор');
    comp.searchQuery.set('');
    fixture.detectChanges();

    expect(comp.filtered().length).toBe(2);
  });
});
