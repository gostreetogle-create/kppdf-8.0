import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BuilderPage } from './builder.page';
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

  // TZ-DOC-324 (IA): builder.page is now pure editor for /:id. CRUD для
  // шаблонов (create/duplicate/delete) перенесён в TemplatesPage, поэтому
  // related TZ-DOC-268/310 regression tests теперь живут там.
  // Эти тесты остаются — они о pure editor-функциональности.

  const navigate = jest.fn();
  const toastSuccess = jest.fn();
  const toastError = jest.fn();
  const templatesSvcUpdate = jest
    .fn()
    .mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } as never }));
  const templatesSvcFindById = jest.fn().mockReturnValue(of({ ok: true, data: null }));

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
            findById: templatesSvcFindById,
            create: jest.fn().mockReturnValue(of({ ok: true, data: { _id: 'tpl-1' } })),
            update: templatesSvcUpdate,
            remove: () => of({ ok: true, data: undefined }),
            uploadBackground: () => of({ ok: true, data: { url: '', backgroundImage: [] } }),
            removeBackground: () => of({ ok: true, data: undefined }),
            setDefaultBackground: () => of({ ok: true, data: undefined }),
            setOrientation: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
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

  it('starts with null templateId (pure editor — picker moved to TemplatesPage)', () => {
    // TZ-DOC-324: /builder без :id → редирект на /templates, поэтому
    // BuilderPage больше не показывает picker-ветку в template. Однако
    // signal templateId всё равно null на пустом init — это нормально,
    // важно что в template больше нет if(!templateId()) блока (verified
    // by code-reviewer + tsc build).
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

  // ═══ TZ-DOC-311: template property persistence regression tests ═══

  it('TZ-DOC-311: onTemplateUpdate PATCHes pageNumbering to the templates service', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      onTemplateUpdate: (patch: Record<string, unknown>) => void;
    };
    comp.templateId.set('tpl-1');
    comp.onTemplateUpdate({ pageNumbering: true });
    expect(templatesSvcUpdate).toHaveBeenCalledWith('tpl-1', { pageNumbering: true });
  });

  it('TZ-DOC-311: template update API error reverts via findById (no false optimistic state)', () => {
    templatesSvcUpdate.mockReturnValueOnce(of({ ok: false, error: { status: 400 } as never }));
    const fixture = TestBed.createComponent(BuilderPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      templateId: { set: (v: string | null) => void };
      template: { set: (t: unknown) => void };
      onTemplateUpdate: (patch: Record<string, unknown>) => void;
    };
    comp.templateId.set('tpl-1');
    comp.template.set({ _id: 'tpl-1', pageNumbering: true } as never);
    comp.onTemplateUpdate({ pageNumbering: true });
    expect(templatesSvcUpdate).toHaveBeenCalled();
    expect(templatesSvcFindById).toHaveBeenCalledWith('tpl-1');
  });
});
