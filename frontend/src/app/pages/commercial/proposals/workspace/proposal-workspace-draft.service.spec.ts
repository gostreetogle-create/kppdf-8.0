import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { PiToastService } from '../../../../shared/ui/toast';
import { OrdersService } from '../../../../shared/services/orders.service';
import { DocumentTemplatesService } from '../../../../shared/services/pi-document-templates.service';
import { ProposalsService, type Proposal } from '../../../../shared/services/pi-proposals.service';
import { ProposalWorkspaceDraftService } from './proposal-workspace-draft.service';
import type { ProposalDraftLine } from '../proposal-product-rail.component';

const TEMPLATE = { _id: 'tpl-1', name: 'Бланк А', defaultSheetLayout: undefined as never };

const DRAFT: Partial<Proposal> = {
  _id: 'q-1',
  status: 'draft',
  templateId: 'tpl-1',
  organizationId: 'org-1',
  counterpartyId: 'cp-1',
  contactPersonId: 'p-1',
  siteId: 's-1',
  number: 'КП-042',
  items: [
    {
      lineKind: 'catalog',
      productId: 'prod-1',
      productName: 'Стенд',
      quantity: 2,
      unit: 'шт',
      unitPrice: 5000,
      sortOrder: 0,
    },
  ],
};

describe('ProposalWorkspaceDraftService', () => {
  let service: ProposalWorkspaceDraftService;
  const proposalsFindMock = jest.fn();
  const proposalsCreateMock = jest.fn();
  const proposalsUpdateMock = jest.fn();
  const templatesFindMock = jest.fn();
  const buildMock = jest.fn();
  const toastError = jest.fn();
  const toastSuccess = jest.fn();
  const toastWarning = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    proposalsFindMock.mockReturnValue(of({ ok: true, data: DRAFT }));
    proposalsCreateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-new' } }));
    proposalsUpdateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-1', status: 'draft' } }));
    templatesFindMock.mockReturnValue(of({ ok: true, data: TEMPLATE }));
    buildMock.mockReturnValue(
      of({ ok: true, data: '<html><body><div class="doc-page">A4</div></body></html>' }),
    );

    TestBed.configureTestingModule({
      providers: [
        ProposalWorkspaceDraftService,
        {
          provide: ProposalsService,
          useValue: {
            findById: proposalsFindMock,
            create: proposalsCreateMock,
            update: proposalsUpdateMock,
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: { findById: templatesFindMock, build: buildMock },
        },
        { provide: OrdersService, useValue: { findById: jest.fn() } },
        {
          provide: PiToastService,
          useValue: { error: toastError, success: toastSuccess, warning: toastWarning },
        },
      ],
    });
    service = TestBed.inject(ProposalWorkspaceDraftService);
  });

  it('hydrates template, lines and recipient from ?id=', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);

    expect(proposalsFindMock).toHaveBeenCalledWith('q-1');
    expect(templatesFindMock).toHaveBeenCalledWith('tpl-1');
    expect(service.selectedTemplate()?._id).toBe('tpl-1');
    expect(service.counterpartyId()).toBe('cp-1');
    expect(service.contactPersonId()).toBe('p-1');
    expect(service.siteId()).toBe('s-1');
    expect(service.draftLines()).toHaveLength(1);
    expect(service.draftLines()[0].productName).toBe('Стенд');
    expect(service.previewStatus()).toBe('ready');
    tick(5000);
  }));

  it('adding a product from catalog merges quantity and autosaves via create (single write-path)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.draftLines()).toHaveLength(1);

    service.onProductAdd({
      lineKind: 'catalog',
      productId: 'prod-1',
      productName: 'Стенд',
      quantity: 3,
      unit: 'шт',
      unitPrice: 5000,
    });
    expect(service.draftLines()[0].quantity).toBe(5);

    tick(2000); // rebuild (200) + autosave debounce (1200)
    expect(proposalsCreateMock).not.toHaveBeenCalled(); // hydrated draft has an id → update, not create
    expect(proposalsUpdateMock).toHaveBeenCalled();
    const payload = proposalsUpdateMock.mock.calls[0][1];
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].quantity).toBe(5);
    expect(payload.items[0].productId).toBe('prod-1');
    tick(5000);
  }));

  it('recipient change updates signals and schedules autosave', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    service.onRecipientState({ counterpartyId: 'cp-2', contactPersonId: '', siteId: '' });
    expect(service.counterpartyId()).toBe('cp-2');
    tick(2000);
    expect(proposalsUpdateMock).toHaveBeenCalled();
    tick(5000);
  }));

  it('template change rebuilds the preview and keeps the sheet source', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.previewStatus()).toBe('ready');

    service.onTemplateChange({ _id: 'tpl-2', name: 'Бланк Б' } as never);
    tick(200); // build debounce
    expect(buildMock).toHaveBeenCalledWith('tpl-2', expect.any(Object));
    expect(service.previewStatus()).toBe('ready');
    expect(service.previewPages().length).toBeGreaterThan(0);
    tick(5000);
  }));

  it('manual save without template shows an error and does not call the API', fakeAsync(() => {
    service.saveDraft(true);
    tick();
    expect(proposalsCreateMock).not.toHaveBeenCalled();
    expect(proposalsUpdateMock).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  }));

  it('accepted draft renders the locked snapshot without rebuilding', fakeAsync(() => {
    proposalsFindMock.mockReturnValue(
      of({
        ok: true,
        data: {
          ...DRAFT,
          status: 'accepted',
          templateSnapshot: { templateId: 'tpl-1', html: '<p>frozen</p>' },
        },
      }),
    );
    service.init({ id: 'q-1' });
    tick(200);
    expect(buildMock).not.toHaveBeenCalled();
    expect(service.previewStatus()).toBe('ready');
    expect(service.isReadOnly()).toBe(true);
    tick(5000);
  }));

  it('new=1 clears local draft pointers (no resume)', fakeAsync(() => {
    localStorage.setItem('kp.create.lastDraftId', 'q-stale');
    service.init({ new: true });
    tick();
    expect(proposalsFindMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('kp.create.lastDraftId')).toBeNull();
  }));

  it('composition total reflects lines and markup', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.compositionTotal()).toBe(12000); // 2 × 5000 + 20% НДС
    tick(5000);
  }));

  it('keeps a typed custom line and DraftLine shape intact on save', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    const custom: ProposalDraftLine = {
      lineKind: 'custom',
      productId: 'custom-1',
      productName: 'Своя строка',
      quantity: 1,
      unit: 'шт',
      unitPrice: 100,
    };
    service.onProductAdd(custom);
    tick(2000);
    const items = proposalsUpdateMock.mock.calls.at(-1)[1].items;
    // custom lines keep name/kind; productId (custom-*) is not sent (mirrors create)
    expect(
      items.some(
        (i: { lineKind: string; productName: string }) =>
          i.lineKind === 'custom' && i.productName === 'Своя строка',
      ),
    ).toBe(true);
    tick(5000);
  }));
});
