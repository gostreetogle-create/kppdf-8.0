import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { OrganizationsPage } from './organizations.page';
import { OrganizationsService, Organization } from '../../shared/services/organizations.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('OrganizationsPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/organizations`;

  const fakeOrgs: Organization[] = [
    { _id: 'org1', name: 'Acme Corp', inn: '1234567890' } as Organization,
    { _id: 'org2', name: 'Beta LLC', inn: '0987654321' } as Organization,
  ];

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
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiDialogService, useValue: { open: () => ({} as never) } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(OrganizationsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/organizations on creation', async () => {
    const fixture = TestBed.createComponent(OrganizationsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: fakeOrgs, total: 2 });
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Organization[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(OrganizationsPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no organizations', async () => {
    const fixture = TestBed.createComponent(OrganizationsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { data: () => Organization[]; total: () => number };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });
});
