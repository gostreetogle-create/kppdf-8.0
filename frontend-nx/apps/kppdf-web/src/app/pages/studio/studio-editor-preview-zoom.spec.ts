import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
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
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-PO-SWEEP-06 — the preview iframe holds a fixed-size A4 document
 * (794×1123px at 96dpi, same numbers `syncSheetSize()` already uses for the
 * editor canvas at zoom '100'). Left at width/height:100%, the iframe's own
 * viewport would be whatever `.kp-ws-sheet` currently measures while its
 * *content* stays native-size — clipping instead of matching the editor's
 * zoomMode. `previewNativeSheetSize`/`previewZoomScale` compute the fixed
 * size + a `transform:scale` factor that mirrors `sheetSize()` instead.
 */
describe('StudioEditorPage — preview iframe zoom parity (TZ-NX-PO-SWEEP-06)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    sheetSize: { (): { width: number; height: number }; set(v: { width: number; height: number }): void };
    previewNativeSheetSize: () => { width: number; height: number };
    previewZoomScale: () => number;
  }

  const PORTRAIT_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Zoom doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: { update: jest.fn().mockReturnValue(of({ ok: true, data: PORTRAIT_DOC })) } },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  });

  let fixture: ComponentFixture<StudioEditorPage>;

  function createEditor(doc: StudioDocument = PORTRAIT_DOC): TestableEditor {
    fixture = TestBed.createComponent(StudioEditorPage);
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(doc);
    fixture.detectChanges();
    return component;
  }

  it('portrait native size is 794×1123px (210mm×297mm at 96dpi, same as syncSheetSize "100")', () => {
    const component = createEditor();
    expect(component.previewNativeSheetSize()).toEqual({ width: 794, height: 1123 });
  });

  it('landscape native size swaps to 1123×794px', () => {
    const component = createEditor({ ...PORTRAIT_DOC, orientation: 'landscape' });
    expect(component.previewNativeSheetSize()).toEqual({ width: 1123, height: 794 });
  });

  it('zoom "100" (sheetSize === native) scales to 1 — no shrink/stretch', () => {
    const component = createEditor();
    component.sheetSize.set({ width: 794, height: 1123 });
    expect(component.previewZoomScale()).toBe(1);
  });

  it('zoom "fit" scales the iframe down to match the measured sheet host box (same ratio the canvas already uses)', () => {
    const component = createEditor();
    component.sheetSize.set({ width: 397, height: 561 }); // fit-mode host rect, ~half size
    expect(component.previewZoomScale()).toBeCloseTo(0.5, 2);
  });
});
