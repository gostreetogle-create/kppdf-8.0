import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { BuilderPage } from './builder.page';
import {
  TemplateSetupDialogComponent,
  type TemplateSetupResult,
} from './template-setup-dialog.component';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('BuilderPage', () => {
  const baseUrl = '/api';
  const fakeActivatedRoute = {
    paramMap: of({ get: () => null }),
    queryParamMap: of({ get: () => null }),
  };

  // Hoisted test doubles (TZ-DOC-268 regression tests need to assert calls).
  const navigate = jest.fn();
  const toastSuccess = jest.fn();
  const toastError = jest.fn();
  const dialogSpy = { open: jest.fn() };
  const templatesSvcCreate = jest
    .fn()
    .mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } as never }));

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: { navigate } },
        {
          provide: TemplateBlocksService,
          useValue: {
            listByTemplate: () => of({ ok: true, data: [] }),
            add: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            reorder: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: () => of({ ok: true, data: null }),
            create: templatesSvcCreate,
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            uploadBackground: () => of({ ok: true, data: { url: '', backgroundImage: [] } }),
            removeBackground: () => of({ ok: true, data: undefined }),
            setDefaultBackground: () => of({ ok: true, data: undefined }),
            setOrientation: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: PiDialogService, useValue: dialogSpy },
      ],
    })
      .overrideComponent(BuilderPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with null templateId (shows template picker)', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { templateId: () => string | null };
    expect(comp.templateId()).toBeNull();
  });

  it('starts with empty blocks', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { blocks: () => unknown[] };
    expect(comp.blocks().length).toBe(0);
  });

  it('starts with idle save status', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      saveStatus: () => 'idle' | 'saving' | 'saved' | 'error';
    };
    expect(comp.saveStatus()).toBe('idle');
  });

  it('selectedBlock is null when nothing selected', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      selectedBlock: () => { _id: string } | null;
    };
    expect(comp.selectedBlock()).toBeNull();
  });

  // ═══ TZ-DOC-268: template-creation dialog lifecycle regression tests ═══

  /** Build a fake DialogRef whose `closed` signal we control. */
  function fakeDialogRef<T>() {
    const closed = signal<T | undefined>(undefined);
    return { closed };
  }

  it('TZ-DOC-268: confirm closes the setup dialog and creates exactly one template', () => {
    const { closed } = fakeDialogRef<TemplateSetupResult>();
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onCreateTemplate: () => void;
      isCreating: () => boolean;
    };

    comp.onCreateTemplate();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      TemplateSetupDialogComponent,
      expect.objectContaining({ data: { mode: 'create' } }),
    );

    // Simulate the user clicking «Создать» in the dialog → close with result.
    // TestBed.flushEffects() dispatches the toObservable-backed
    // onDialogCloseOnce callback + the forkJoin HTTP calls synchronously
    // (established pattern — see materials.page.spec.ts / categories.page.spec.ts).
    // No whenStable(): all flows below are synchronous once the HTTP
    // responses are flushed via HttpTestingController.
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    TestBed.flushEffects();

    // The create flow fires GET /organizations?limit=1 + GET /doc-types,
    // then templatesSvc.create() once, then navigates to the new template.
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock
      .expectOne((req) => req.method === 'GET' && req.url.includes('/organizations'))
      .flush({ items: [{ _id: 'org-1' }] });
    httpMock
      .expectOne((req) => req.method === 'GET' && req.url.includes('/doc-types'))
      .flush([{ _id: 'dt-1' }]);

    expect(templatesSvcCreate).toHaveBeenCalledTimes(1);
    expect(templatesSvcCreate).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org-1', docTypeId: 'dt-1' }),
    );
    expect(navigate).toHaveBeenCalledWith(['/doc-constructor/builder', 'tpl-1']);
    expect(comp.isCreating()).toBe(false);
  });

  it('TZ-DOC-268: cancel (close without value) does NOT POST or navigate', () => {
    const { closed } = fakeDialogRef<TemplateSetupResult>();
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { onCreateTemplate: () => void };

    comp.onCreateTemplate();
    // Cancel / Escape / backdrop → close() with no value.
    closed.set(undefined);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(templatesSvcCreate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it('TZ-DOC-268: a second confirm emission cannot create a duplicate template', () => {
    const { closed } = fakeDialogRef<TemplateSetupResult>();
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { onCreateTemplate: () => void };

    comp.onCreateTemplate();
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    TestBed.flushEffects();

    const httpMock = TestBed.inject(HttpTestingController);
    httpMock
      .expectOne((req) => req.method === 'GET' && req.url.includes('/organizations'))
      .flush({ items: [{ _id: 'org-1' }] });
    httpMock
      .expectOne((req) => req.method === 'GET' && req.url.includes('/doc-types'))
      .flush([{ _id: 'dt-1' }]);
    expect(templatesSvcCreate).toHaveBeenCalledTimes(1);

    // A stale second emission (the dialog was already closed once) must not
    // re-fire the callback — onDialogCloseOnce uses filter+take(1).
    closed.set({ pageSize: 'A5', orientation: 'landscape' });
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(templatesSvcCreate).toHaveBeenCalledTimes(1);
  });

  it('TZ-DOC-268: API failure during create resets isCreating and shows an error', () => {
    const { closed } = fakeDialogRef<TemplateSetupResult>();
    dialogSpy.open.mockReturnValue({ closed, close: jest.fn() });

    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onCreateTemplate: () => void;
      isCreating: () => boolean;
    };

    comp.onCreateTemplate();
    closed.set({ pageSize: 'A4', orientation: 'portrait' });
    fixture.detectChanges();
    TestBed.flushEffects();

    const httpMock = TestBed.inject(HttpTestingController);
    httpMock
      .expectOne((req) => req.method === 'GET' && req.url.includes('/organizations'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    // forkJoin errors on the first failure and cancels the sibling request —
    // flushing a cancelled request throws, so assert the cancellation instead.
    const docTypesReq = httpMock.expectOne(
      (req) => req.method === 'GET' && req.url.includes('/doc-types'),
    );
    expect(docTypesReq.cancelled).toBe(true);

    expect(comp.isCreating()).toBe(false);
    expect(templatesSvcCreate).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });
});
