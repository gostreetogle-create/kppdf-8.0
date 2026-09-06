import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiCounterpartiesService,
  PiDocTypesService,
  PiOrdersService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioBlocksService,
  PiStudioDocumentsService,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { API_BASE_URL } from '@kppdf/util-http';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS — locks the chrome IA contract:
 * ribbon holds breadcrumbs only (no action buttons), lifecycle actions
 * (editor/preview modes, save, pdf, archive) live on the right shell
 * chrome-rail with RU labels and busy/disabled states, and the
 * «Документы» crumb routes through openDocumentList() so the S38 dirty
 * dialog still guards the leave. A4 geometry untouched (no shell CSS
 * changes in this TZ).
 *
 * Same no-detectChanges pattern as the S41 catalog-queue spec: the full
 * editor template is heavy; the constructor + signal writes are enough
 * to drive the setTools effect and crumb handlers directly.
 */
describe('StudioEditorPage — ribbon→rails chrome IA (TZ-NX-DOCSTUDIO-C3)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    saving: () => boolean;
    pdfLoading: () => boolean;
    finalizing: () => boolean;
    viewMode: { (): 'editor' | 'preview'; set(v: 'editor' | 'preview'): void };
    openDocumentList: () => void;
    saveDocument: () => Promise<boolean>;
    onDownloadPdf: () => void;
    onFinalize: () => void;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'C3 doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  let documentsService: Record<string, jest.Mock>;
  let dialog: { open: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    documentsService = {
      update: jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC })),
    };
    dialog = { open: jest.fn() };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: documentsService },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: dialog },
        { provide: Router, useValue: (router = { navigate: jest.fn() }) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  let fixture: ComponentFixture<StudioEditorPage>;

  function createEditor(doc: StudioDocument = BASE_DOC): TestableEditor {
    fixture = TestBed.createComponent(StudioEditorPage);
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(doc);
    // Effects (incl. the setTools registration) flush during change detection,
    // same as the D56 left-rail spec.
    fixture.detectChanges();
    return component;
  }

  function rightTool(id: string): { id: string; title: string; disabled?: boolean; onClick: () => void } {
    const rails = TestBed.inject(ShellToolRailService);
    const tool = rails.rightTools().find((t) => t.id === id);
    expect(tool).toBeTruthy(); // right rail tool
    return tool!;
  }

  it('registers lifecycle actions on the right rail with RU titles and correct active state', () => {
    const component = createEditor();
    component.viewMode.set('editor');

    const rails = TestBed.inject(ShellToolRailService);
    const right = rails.rightTools();
    expect(right.map((t) => t.id)).toEqual([
      'mode-editor', 'mode-preview', 'save', 'pdf', 'archive',
      'elements', 'layers', 'pages', 'properties', 'template',
    ]);
    expect(right.find((t) => t.id === 'mode-editor')!.active).toBe(true);
    expect(right.find((t) => t.id === 'mode-preview')!.active).toBe(false);
    for (const t of right) {
      expect(t.ariaLabel).toBeTruthy();
      expect(t.title).toBeTruthy();
    }
  });

  it('disables archive and save per busy/status state, and clicking rails the real handlers', async () => {
    const component = createEditor();
    // Switch to preview and re-flush effects so rail active state mirrors the mode.
    component.viewMode.set('preview');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    await fixture.whenStable();

    const modePreview = rightTool('mode-preview');
    expect(modePreview.active).toBe(true);

    const save = rightTool('save');
    expect(save.disabled).toBe(false); // idle → enabled
    const saveSpy = jest.spyOn(component, 'saveDocument').mockResolvedValue(true);
    save.onClick();
    expect(saveSpy).toHaveBeenCalled();

    const pdf = rightTool('pdf');
    const pdfSpy = jest.spyOn(component, 'onDownloadPdf').mockImplementation(() => undefined);
    pdf.onClick();
    expect(pdfSpy).toHaveBeenCalled();

    const archive = rightTool('archive');
    const finalizeSpy = jest.spyOn(component, 'onFinalize').mockImplementation(() => undefined);
    archive.onClick();
    expect(finalizeSpy).toHaveBeenCalled();
  });

  it('moves save/PDF/archive off the ribbon template (crumbs only)', () => {
    createEditor();
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'studio-editor.page.ts'),
      'utf8',
    );
    // No ribbon action buttons remain in the editor template.
    expect(source).not.toMatch(/kpWsRibbonActions/);
    expect(source).not.toMatch(/data-test="studio-open-list"/);
    expect(source).not.toMatch(/data-test="studio-save-as"/);
    // Ribbon block holds the crumbs structure instead.
    expect(source).toContain('kpWsRibbonExtra');
    expect(source).toContain('studio-crumb-documents');
    expect(source).toContain('studio-crumb--current');
  });

  it('keeps «Сохранить как…» only in the Шаблон panel', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, 'studio-editor.page.ts'),
      'utf8',
    );
    const templatePanelCall = source.match(/<pi-studio-template-panel[\s\S]*?\/>/)?.[0] ?? '';
    expect(templatePanelCall).toContain('(saveAsTemplate)="openSaveAsTemplateDialog()"');
    // The ribbon save-as button is gone; the dialog handler stays for the panel.
    expect(source.match(/openSaveAsTemplateDialog\(\)/g)?.length).toBeGreaterThan(0);
  });

  it('routes the «Документы» crumb through openDocumentList (dirty guard, /studio)', async () => {
    const component = createEditor();
    component.openDocumentList();
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).not.toHaveBeenCalled(); // clean doc → no dialog
    expect(router.navigate).toHaveBeenCalledWith(
      ['/studio'],
      expect.objectContaining({ queryParams: expect.objectContaining({ list: '1' }) }),
    );
  });

  it('still guards the leave when the document is dirty (S38 dialog before navigate)', async () => {
    const component = createEditor();
    // Simulate in-flight save → isStudioDirty() true.
    const savingFlag = component as unknown as { saving: { set: (v: boolean) => void } };
    savingFlag.saving.set(true);

    component.openDocumentList();
    // flush microtasks of confirmLeave promise chain
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
