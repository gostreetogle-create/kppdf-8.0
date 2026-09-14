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
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — «Значения» display mode's source bag
 * (`editorSubstitutionBag`) is built entirely from context already loaded in
 * this editor session (issuer org / counterparty anchors / quotation /
 * order), per the TZ's own preferred option — no new resolve API. This spec
 * drives the editor directly (same harness pattern as the sibling
 * `studio-editor-*.spec.ts` files) to prove the bag shape matches what
 * `DocumentRenderService`'s dotted-path `substitute()` walk expects
 * server-side (`organization.*`, `counterparty.*`, `anchor.client|payer|
 * supplier.*`, `quotation.*`, `order.*`).
 */
describe('StudioEditorPage — token display mode + substitution bag (TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP)', () => {
  const ORG = { _id: 'org-1', name: 'ООО Ромашка', shortName: 'Ромашка', inn: '1234567890', isOurCompany: true, type: ['customer'] };
  const CLIENT = { _id: 'cp-client', name: 'ООО Клиент', shortName: 'Клиент', inn: '111', roles: ['client'], isActive: true };
  const PAYER = { _id: 'cp-payer', name: 'ООО Плательщик', shortName: 'Плательщик', inn: '222', roles: ['client'], isActive: true };
  const SUPPLIER = { _id: 'cp-supplier', name: 'ООО Поставщик', shortName: 'Поставщик', inn: '333', roles: ['supplier'], isActive: true };
  const QUOTATION = { _id: 'q-1', number: 'KP-42', status: 'draft' };
  const ORDER = { _id: 'o-1', number: 'Z-7', status: 'new' };

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Token-display doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    organizationId: ORG._id,
    context: {
      counterpartyId: CLIENT._id,
      quotationId: QUOTATION._id,
      orderId: ORDER._id,
      anchors: {
        payer: { entityType: 'counterparty', entityId: PAYER._id },
        supplier: { entityType: 'counterparty', entityId: SUPPLIER._id },
      },
    },
  };

  function configure(opts: { blocks?: readonly unknown[]; doc?: StudioDocument } = {}): {
    toast: { success: jest.Mock; error: jest.Mock; warning: jest.Mock };
  } {
    const toast = { success: jest.fn(), error: jest.fn(), warning: jest.fn() };
    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: PiStudioDocumentsService,
          useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: opts.doc ?? BASE_DOC })) },
        },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: opts.blocks ?? [] })) } },
        {
          provide: PiCounterpartiesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [CLIENT, PAYER, SUPPLIER] } })) },
        },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [QUOTATION] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [ORDER] })) } },
        {
          provide: PiOrganizationsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [ORG] } })) },
        },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: toast },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'doc-1' }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
    return { toast };
  }

  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function flush(): Promise<void> {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  }

  interface TestableEditor {
    tokenDisplayMode: { (): 'tokens' | 'values'; set: (v: 'tokens' | 'values') => void };
    editorSubstitutionBag: () => Record<string, unknown>;
    onTokenDisplayModeChange: (mode: 'tokens' | 'values') => void;
  }

  it('defaults to «Значения» (TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON; not persisted, resets on reload)', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    expect(component.tokenDisplayMode()).toBe('values');
  });

  it('builds organization/counterparty/anchor/quotation/order from already-loaded editor context', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    const bag = component.editorSubstitutionBag();

    expect(bag['organization']).toEqual(ORG);
    expect(bag['counterparty']).toEqual(CLIENT);
    expect(bag['quotation']).toEqual(QUOTATION);
    expect(bag['order']).toEqual(ORDER);
    expect(bag['anchor']).toEqual({ client: CLIENT, payer: PAYER, supplier: SUPPLIER });
  });

  it('toggling the mode signal switches «Токены» <-> «Значения»', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    component.tokenDisplayMode.set('values');
    expect(component.tokenDisplayMode()).toBe('values');

    component.tokenDisplayMode.set('tokens');
    expect(component.tokenDisplayMode()).toBe('tokens');
  });

  /**
   * TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON — switching to «Значения» with an
   * unresolved `{{counterparty.*}}`/`{{organization.*}}` still in the
   * document (no client/issuer picked) is a quiet, one-time nudge, not a
   * silent no-op. Uses `configure({ doc, blocks })` with no `counterpartyId`
   * in context so the bag genuinely has no `counterparty` entry.
   */
  describe('onTokenDisplayModeChange — missing-entity hint', () => {
    const DOC_NO_CLIENT: StudioDocument = { ...BASE_DOC, context: { anchors: {} } };
    const textBlockWith = (content: string) => [{ _id: 'b1', type: 'text', order: 0, content, isActive: true }];

    it('toasts a warning once when the document text references {{counterparty.*}} and no client is picked', async () => {
      const { toast } = configure({ doc: DOC_NO_CLIENT, blocks: textBlockWith('Клиент: {{counterparty.name}}') });
      fixture = TestBed.createComponent(StudioEditorPage);
      await flush();
      const component = fixture.componentInstance as unknown as TestableEditor;
      expect(component.editorSubstitutionBag()['counterparty']).toBeUndefined();

      component.onTokenDisplayModeChange('values');

      expect(toast.warning).toHaveBeenCalledTimes(1);
      expect(toast.warning.mock.calls[0]![0] as string).toMatch(/клиента/i);
      expect(component.tokenDisplayMode()).toBe('values');
    });

    it('toasts nothing when the client is already resolved in the bag', async () => {
      const { toast } = configure({ blocks: textBlockWith('Клиент: {{counterparty.name}}') });
      fixture = TestBed.createComponent(StudioEditorPage);
      await flush();
      const component = fixture.componentInstance as unknown as TestableEditor;
      expect(component.editorSubstitutionBag()['counterparty']).toEqual(CLIENT);

      component.onTokenDisplayModeChange('values');

      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('never toasts switching back to «Токены», even with an unresolved token present', async () => {
      const { toast } = configure({ doc: DOC_NO_CLIENT, blocks: textBlockWith('{{counterparty.name}}') });
      fixture = TestBed.createComponent(StudioEditorPage);
      await flush();
      const component = fixture.componentInstance as unknown as TestableEditor;

      component.onTokenDisplayModeChange('tokens');

      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('never toasts for unrelated token kinds this editor has no picker for (e.g. {{table.*}})', async () => {
      const { toast } = configure({ doc: DOC_NO_CLIENT, blocks: textBlockWith('{{table.subtotal}}') });
      fixture = TestBed.createComponent(StudioEditorPage);
      await flush();
      const component = fixture.componentInstance as unknown as TestableEditor;

      component.onTokenDisplayModeChange('values');

      expect(toast.warning).not.toHaveBeenCalled();
    });
  });

  it('omits organization/counterparty/anchor/quotation/order entirely when nothing is loaded/selected yet', async () => {
    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: PiStudioDocumentsService,
          useValue: {
            getById: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: { ...BASE_DOC, organizationId: 'org-unknown', context: {} },
              }),
            ),
          },
        },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
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
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as TestableEditor;

    expect(component.editorSubstitutionBag()).toEqual({});
  });
});
