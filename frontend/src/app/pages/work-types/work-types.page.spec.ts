import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { WorkTypesPage } from './work-types.page';
import { WorkTypesService, WorkType } from '../../shared/services/pi-work-types.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('WorkTypesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/work-types`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };

  const fakeWorkTypes: WorkType[] = [
    { _id: 'wt1', name: 'Раскрой на ЧПУ', hourlyRate: 2000, unit: 'час' } as WorkType,
    { _id: 'wt2', name: 'Кромкование', hourlyRate: 500, unit: 'м.п.' } as WorkType,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: WorkTypesService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(WorkTypesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/work-types on creation', async () => {
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();

    const req = httpMock.expectOne(matchListGet);
    req.flush(fakeWorkTypes);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => WorkType[];
      total: () => number;
      loading: () => boolean;
      error: () => string | null;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
    expect(comp.error()).toBeNull();
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('shows empty state when no work types', async () => {
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => WorkType[];
      total: () => number;
    };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});
