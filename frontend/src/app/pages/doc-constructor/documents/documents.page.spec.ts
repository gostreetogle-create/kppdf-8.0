import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DocumentsPage } from './documents.page';
import { GeneratedDocumentsService, GeneratedDocument } from '../../../shared/services/pi-generated-documents.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('DocumentsPage (post-TZ-232.F.3 v3)', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({ closed: of(undefined) }) };
  const routerSpy = { navigate: jest.fn().mockResolvedValue(true) };
  const openHtmlSpy = jest.fn().mockReturnValue(of(undefined));

  // NOTE: pre-migration AND post-migration both sort by createdAt desc,
  // so fakeDocuments[1] (2026-02-01) comes BEFORE fakeDocuments[0]
  // (2026-01-15) in `viewRows()`.
  const fakeDocuments: GeneratedDocument[] = [
    {
      _id: 'd1',
      number: 'DOC-001',
      name: 'КП для ООО Ромашка',
      templateId: 't1',
      templateName: 'КП по умолчанию',
      sourceType: 'order',
      sourceId: 'o1',
      html: '',
      status: 'final',
      isActive: true,
      createdAt: '2026-01-15T10:30:00Z',
    } as GeneratedDocument,
    {
      _id: 'd2',
      number: 'DOC-002',
      name: 'Договор поставки',
      templateId: 't2',
      templateName: 'Договор поставки',
      sourceType: 'manual',
      html: '',
      status: 'draft',
      isActive: true,
      createdAt: '2026-02-01T08:00:00Z',
    } as GeneratedDocument,
  ];

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    openHtmlSpy.mockClear();
    routerSpy.navigate.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: GeneratedDocumentsService,
          useValue: {
            list: () => of({ ok: true, data: fakeDocuments }),
            findById: (id: string) =>
              of({
                ok: true,
                data:
                  fakeDocuments.find((d) => d._id === id) ?? ({} as GeneratedDocument),
              }),
            generate: () => of({ ok: true, data: {} as GeneratedDocument }),
            remove: () => of({ ok: true, data: undefined }),
            openHtml: openHtmlSpy,
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(DocumentsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('mounts cleanly', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads documents via service.list() into items signal', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      items: () => { _id: string }[];
      viewRows: () => unknown[];
    };
    expect(comp.items().length).toBe(2);
    expect(comp.viewRows().length).toBe(2);
  });

  it('exposes a listService adapter that emits the wrapper-expected envelope', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      listService: {
        list: (p: { page: number; limit: number }) => {
          subscribe: (fn: (v: unknown) => void) => unknown;
        };
      };
    };
    let captured: unknown = undefined;
    comp.listService?.list({ page: 1, limit: 10 }).subscribe((v) => {
      captured = v;
    });
    expect(captured).toBeDefined();
  });

  it('viewRows produces displayName from templateName with name fallback', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      viewRows: () => { displayName: string; statusLabel: string; statusDotClass: string; _id: string }[];
    };
    const rows = comp.viewRows();
    expect(rows.length).toBe(2);
    // After sort-by-createdAt-desc, rows[0] = fakeDocuments[1] (Feb 1, draft)
    expect(rows[0]._id).toBe('d2');
    expect(rows[0].displayName).toBe('Договор поставки');
    expect(rows[1]._id).toBe('d1');
    expect(rows[1].displayName).toBe('КП по умолчанию');
  });

  it('viewRows maps status final → dot accent-cool + label Отправлено (rows[1] = Jan 15, final)', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      viewRows: () => { statusLabel: string; statusDotClass: string }[];
    };
    const rows = comp.viewRows();
    expect(rows[1].statusDotClass).toBe('bg-accent-cool');
    expect(rows[1].statusLabel).toBe('Отправлено');
  });

  it('viewRows maps status draft → dot sunrise-warm + label Обработка (rows[0] = Feb 1, draft)', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      viewRows: () => { statusLabel: string; statusDotClass: string }[];
    };
    const rows = comp.viewRows();
    expect(rows[0].statusDotClass).toBe('bg-sunrise-warm');
    expect(rows[0].statusLabel).toBe('Обработка');
  });

  it('period filter narrows rows by createdAt month', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      periodMonth: { (): string; set: (v: string) => void };
      viewRows: () => { _id: string }[];
    };
    comp.periodMonth.set('2026-01');
    const rows = comp.viewRows();
    expect(rows.length).toBe(1);
    expect(rows[0]._id).toBe('d1');
  });

  it('search filter narrows rows by number/name/templateName', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      searchQuery: { (): string; set: (v: string) => void };
      viewRows: () => { _id: string }[];
    };
    comp.searchQuery.set('Договор');
    const r1 = comp.viewRows();
    expect(r1.length).toBe(1);
    expect(r1[0]._id).toBe('d2');
    comp.searchQuery.set('нет такого');
    expect(comp.viewRows().length).toBe(0);
  });

  it('onView triggers service.openHtml', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onView: (doc: GeneratedDocument) => void;
    };
    comp.onView(fakeDocuments[0]);
    expect(openHtmlSpy).toHaveBeenCalledWith('d1');
  });

  it('onDelete opens destructive AlertDialogComponent', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onDelete: (doc: GeneratedDocument) => void;
    };
    comp.onDelete(fakeDocuments[0]);
    const lastCall = dialogSpy.open.mock.calls[dialogSpy.open.mock.calls.length - 1];
    const opts = lastCall?.[1] as { data?: { variant?: string } } | undefined;
    expect(opts?.data?.variant).toBe('destructive');
  });
});
