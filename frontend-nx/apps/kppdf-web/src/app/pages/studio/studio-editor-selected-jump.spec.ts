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
 * TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP — «Изменить» on a «Выбрано» chip
 * must land the operator on the *same* place the value is already edited in
 * «Данные» (Кому/Ещё/Товары), never a second picker. This spec drives the
 * editor's own jump map (`onEditSelection`) directly: it must switch to the
 * `data` section and command the data panel to the right TOC category, with
 * a fresh `nonce` each time so a repeat jump to the same category (e.g.
 * Client then Payer, both `whom`) isn't silently dropped by Angular's input
 * change detection.
 */
describe('StudioEditorPage — «Выбрано» chip jump (TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP)', () => {
  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Selected-jump doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    context: {},
  };

  function configure(): void {
    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: PiStudioDocumentsService,
          useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC })) },
        },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'doc-1' }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  }

  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function flush(): Promise<void> {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  }

  interface TestableEditor {
    activeSection: () => string | null;
    pendingDataJump: () => { category: string; nonce: number } | null;
    onEditSelection: (key: string) => void;
    onSection: (id: string) => void;
  }

  it('client chip jumps to section=data, category=whom', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    component.onEditSelection('client');

    expect(component.activeSection()).toBe('data');
    expect(component.pendingDataJump()?.category).toBe('whom');
  });

  it('supplier chip jumps to category=more; payer chip also jumps to whom with a new nonce', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    component.onEditSelection('supplier');
    expect(component.pendingDataJump()?.category).toBe('more');
    const supplierNonce = component.pendingDataJump()?.nonce;

    component.onEditSelection('payer');
    expect(component.pendingDataJump()?.category).toBe('whom');
    expect(component.pendingDataJump()?.nonce).not.toBe(supplierNonce);
  });

  it('a catalog chip key (products/modules/parts/materials) jumps to category=products (vitrina)', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    component.onEditSelection('modules');
    expect(component.activeSection()).toBe('data');
    expect(component.pendingDataJump()?.category).toBe('products');
  });

  it('an unknown chip key is a no-op — never navigates or invents a new section', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;
    component.onSection('pages'); // move away from the 'data' default first
    expect(component.activeSection()).toBe('pages');

    component.onEditSelection('elements'); // some other section id, not a real jump key

    expect(component.activeSection()).toBe('pages');
    expect(component.pendingDataJump()).toBeNull();
  });

  it('repeating the same target twice in a row still carries a fresh nonce (re-jump must not silently no-op)', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    component.onEditSelection('client');
    const first = component.pendingDataJump()?.nonce;
    component.onEditSelection('client');
    const second = component.pendingDataJump()?.nonce;

    expect(second).not.toBe(first);
  });
});
