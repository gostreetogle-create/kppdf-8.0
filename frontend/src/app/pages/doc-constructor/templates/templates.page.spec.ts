import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TemplatesPage } from './templates.page';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { DocTypesService } from '../../../shared/services/doc-types.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';

/**
 * TZ-232.F spec — TemplatesPage migrated off raw `HttpClient`.
 *
 * v3 changes vs v2 (post TZ-232.F):
 *  - Removed `provideHttpClient` / `provideHttpClientTesting` (page no longer
 *    uses HttpClient directly — OrganizationsService / DocTypesService /
 *    DocumentTemplatesService handle all backend calls and are mocked here).
 *  - Added synthesized empty-data mocks for `OrganizationsService.list` and
 *    `DocTypesService.list` so the page instantiates without DI errors.
 *  - Added `setDefault` and `duplicate` to the DocumentTemplatesService mock
 *    so the new methods in the service can be invoked if the page exercises
 *    those code paths in future tests.
 */
describe('TemplatesPage', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const toastSpy = { success: jest.fn(), error: jest.fn() };

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
      version: 2,
    },
  ];

  const listResult = { ok: true, data: { items: fakeTemplates } };
  const orgsListResult = {
    ok: true,
    data: {
      items: [{ _id: 'org1', name: 'Основная организация' }],
      total: 1,
      page: 1,
      limit: 1,
    },
  };
  const docTypesListResult = {
    ok: true,
    data: {
      items: [{ _id: 'dt-default', name: 'КП', slug: 'kp', isActive: true }],
      total: 1,
      page: 1,
      limit: 1,
    },
  };

  async function mountPage(): Promise<void> {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: jest.fn().mockReturnValue(of(listResult)),
            findById: jest.fn().mockReturnValue(of({ ok: true, data: {} as never })),
            create: jest
              .fn()
              .mockReturnValue(of({ ok: true, data: { _id: 'dt3', isActive: false } })),
            update: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            setDefault: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
            duplicate: jest
              .fn()
              .mockReturnValue(of({ ok: true, data: { _id: 'dt-copy', isActive: false } })),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            list: jest.fn().mockReturnValue(of(orgsListResult)),
            create: jest
              .fn()
              .mockReturnValue(of({ ok: true, data: { _id: 'org-new' } })),
          },
        },
        {
          provide: DocTypesService,
          useValue: {
            list: jest.fn().mockReturnValue(of(docTypesListResult)),
            create: jest
              .fn()
              .mockReturnValue(of({ ok: true, data: { _id: 'dt-new' } })),
          },
        },
        { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
        { provide: PiToastService, useValue: toastSpy },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(TemplatesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  }

  beforeEach(() => {
    dialogSpy.open.mockClear();
    toastSpy.success.mockClear();
    toastSpy.error.mockClear();
  });

  it('creates successfully', async () => {
    await mountPage();
    const fixture = TestBed.createComponent(TemplatesPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads templates on creation', async () => {
    await mountPage();
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => { _id: string }[];
      loading: () => boolean;
    };

    expect(comp.items().length).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state initially (false after sync list mock)', async () => {
    await mountPage();
    const fixture = TestBed.createComponent(TemplatesPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      loading: () => boolean;
    };
    expect(comp.loading()).toBe(false);
  });

  it('filters templates by search query', async () => {
    await mountPage();
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
    await mountPage();
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
