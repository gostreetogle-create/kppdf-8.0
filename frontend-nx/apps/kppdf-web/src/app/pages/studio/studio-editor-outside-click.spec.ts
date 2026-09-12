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
 * TZ-NX-PO-SWEEP-03 — the tools panel (Свойства/Слои/…) used to close only on
 * `onSheetClick` (clicking the A4 sheet itself). A click anywhere else in the
 * chrome (ribbon, viewport padding around the sheet, footer) left it open
 * forever. `onDocumentClickOutside` extends the same dismiss to any outside
 * click, while explicitly ignoring the panel body, the chrome rail (it
 * already toggles the panel itself) and CDK overlay dialogs.
 */
describe('StudioEditorPage — outside-click dismiss (TZ-NX-PO-SWEEP-03)', () => {
  interface TestableEditor {
    document: { set: (doc: StudioDocument) => void };
    panelCollapsed: { (): boolean; set(v: boolean): void };
    selectedId: { (): string | null; set(v: string | null): void };
    onDocumentClickOutside: (event: MouseEvent) => void;
  }

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Outside-click doc',
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
        { provide: PiStudioDocumentsService, useValue: { update: jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC })) } },
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

  function createEditor(): TestableEditor {
    fixture = TestBed.createComponent(StudioEditorPage);
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.document.set(BASE_DOC);
    fixture.detectChanges();
    return component;
  }

  function clickEventFor(target: HTMLElement): MouseEvent {
    return { target } as unknown as MouseEvent;
  }

  it('does nothing when the panel is already collapsed', () => {
    const component = createEditor();
    component.panelCollapsed.set(true);
    component.selectedId.set('block-1');

    component.onDocumentClickOutside(clickEventFor(document.createElement('div')));

    expect(component.selectedId()).toBe('block-1');
  });

  it('ignores clicks inside the tools panel body', () => {
    const component = createEditor();
    component.panelCollapsed.set(false);
    component.selectedId.set('block-1');
    const panelTarget = document.createElement('div');
    panelTarget.setAttribute('data-test', 'studio-tools-panel');

    component.onDocumentClickOutside(clickEventFor(panelTarget));

    expect(component.panelCollapsed()).toBe(false);
    expect(component.selectedId()).toBe('block-1');
  });

  it('ignores clicks on the chrome rail (avoids a double toggle)', () => {
    const component = createEditor();
    component.panelCollapsed.set(false);
    const railTarget = document.createElement('button');
    railTarget.className = 'shell-rail-button shell-rail-tool';
    const railHost = document.createElement('aside');
    railHost.className = 'shell-rail shell-rail-right';
    railHost.appendChild(railTarget);

    component.onDocumentClickOutside(clickEventFor(railTarget));

    expect(component.panelCollapsed()).toBe(false);
  });

  it('ignores clicks inside a CDK overlay (dialogs)', () => {
    const component = createEditor();
    component.panelCollapsed.set(false);
    const overlayContainer = document.createElement('div');
    overlayContainer.className = 'cdk-overlay-container';
    const dialogTarget = document.createElement('button');
    overlayContainer.appendChild(dialogTarget);

    component.onDocumentClickOutside(clickEventFor(dialogTarget));

    expect(component.panelCollapsed()).toBe(false);
  });

  it('dismisses (collapses panel + clears selection) on a genuinely outside click', () => {
    const component = createEditor();
    component.panelCollapsed.set(false);
    component.selectedId.set('block-1');
    const emptyChrome = document.createElement('div');
    emptyChrome.className = 'kp-ws-viewport';

    component.onDocumentClickOutside(clickEventFor(emptyChrome));

    expect(component.panelCollapsed()).toBe(true);
    expect(component.selectedId()).toBeNull();
  });
});
