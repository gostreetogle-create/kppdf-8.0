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
 * TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT — Выбрано's «Вставить «Клиент»»
 * / «Вставить «Поставщик»» / «Вставить «Плательщик»» CTA creates a text
 * layer preset with that party's canon tokens (the same `{{counterparty.*}}`
 * / `{{anchor.<role>.*}}` paths `editorSubstitutionBag()` and the server's
 * substitution walk both already resolve — no new token scheme), opens
 * Свойства so the operator can tweak the wording around them, and toasts a
 * short confirmation. Missing entity for that role toasts an honest error
 * instead of creating an empty block (AC #3).
 */
describe('StudioEditorPage — «Вставить <party>» from Выбрано (TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT)', () => {
  const CLIENT = { _id: 'cp-client', name: 'ООО Клиент', shortName: 'Клиент', inn: '111', roles: ['client'], isActive: true };
  const SUPPLIER = { _id: 'cp-supplier', name: 'ООО Поставщик', shortName: 'Поставщик', inn: '333', roles: ['supplier'], isActive: true };

  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Party-text doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    manualPageCount: 1,
    context: {
      counterpartyId: CLIENT._id,
      anchors: { supplier: { entityType: 'counterparty', entityId: SUPPLIER._id } },
    },
  };

  const DOC_NO_PARTIES: StudioDocument = { ...BASE_DOC, context: { anchors: {} } };

  let create: jest.Mock;
  let toast: { success: jest.Mock; error: jest.Mock };

  function configure(doc: StudioDocument): void {
    create = jest.fn().mockReturnValue(
      of({ ok: true, data: { _id: 'blk-new', type: 'text', order: 0, title: 'Клиент', content: '<p>{{counterparty.name}}</p>' } }),
    );
    toast = { success: jest.fn(), error: jest.fn() };

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: doc })) } },
        { provide: PiStudioBlocksService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })), create } },
        {
          provide: PiCounterpartiesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [CLIENT, SUPPLIER] } })) },
        },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
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
  }

  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function flush(): Promise<void> {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  }

  interface Testable {
    insertPartyText: (key: string) => void;
    activeSection: () => string | null;
  }

  it('client selected -> creates a text layer with the counterparty tokens and opens Свойства', async () => {
    configure(BASE_DOC);
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    (fixture.componentInstance as unknown as Testable).insertPartyText('client');
    await flush();

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![1]).toEqual(
      expect.objectContaining({ content: expect.stringContaining('{{counterparty.name}}'), title: 'Клиент' }),
    );
    expect((fixture.componentInstance as unknown as Testable).activeSection()).toBe('properties');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('supplier selected -> creates a text layer with the anchor.supplier tokens', async () => {
    configure(BASE_DOC);
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    (fixture.componentInstance as unknown as Testable).insertPartyText('supplier');
    await flush();

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![1]).toEqual(
      expect.objectContaining({ content: expect.stringContaining('{{anchor.supplier.name}}'), title: 'Поставщик' }),
    );
  });

  it('no client selected -> honest toast, no block created', async () => {
    configure(DOC_NO_PARTIES);
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    (fixture.componentInstance as unknown as Testable).insertPartyText('client');
    await flush();

    expect(create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('клиента'));
  });

  it('no payer selected -> honest toast, no block created (payer never falls back to client)', async () => {
    configure(BASE_DOC);
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();

    (fixture.componentInstance as unknown as Testable).insertPartyText('payer');
    await flush();

    expect(create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('плательщика'));
  });
});
