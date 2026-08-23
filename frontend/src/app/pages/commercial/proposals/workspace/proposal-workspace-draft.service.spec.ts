import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed } from '@angular/core';
import { of } from 'rxjs';

import { PiToastService } from '../../../../shared/ui/toast';
import { PiDialogService } from '../../../../shared/ui/dialog/pi-dialog.service';
import { OrdersService } from '../../../../shared/services/orders.service';
import { ProductsService } from '../../../../shared/services/products.service';
import { ProductModulesService } from '../../../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../../../shared/services/materials.service';
import { DocumentTemplatesService } from '../../../../shared/services/pi-document-templates.service';
import { TableTemplatesService } from '../../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../../shared/services/pi-template-blocks.service';
import { GeneratedDocumentsService } from '../../../../shared/services/pi-generated-documents.service';
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
  const proposalsDownloadPdfMock = jest.fn();
  const templatesFindMock = jest.fn();
  const buildMock = jest.fn();
  const tableFindMock = jest.fn();
  const toastError = jest.fn();
  const toastSuccess = jest.fn();
  const toastWarning = jest.fn();
  const dialogOpenMock = jest.fn();
  let dialogCloseValue: unknown = undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    proposalsFindMock.mockReturnValue(of({ ok: true, data: DRAFT }));
    proposalsCreateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-new' } }));
    proposalsUpdateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-1', status: 'draft' } }));
    proposalsDownloadPdfMock.mockReturnValue(of(new Blob(['pdf'])));
    dialogCloseValue = undefined;
    templatesFindMock.mockReturnValue(of({ ok: true, data: TEMPLATE }));
    tableFindMock.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'tbl-1',
          name: 'Спецификация',
          sortOrder: 0,
          isActive: true,
          columns: [
            { key: 'productName', label: 'Наименование', type: 'text', width: 260, align: 'left' },
            { key: 'quantity', label: 'Кол-во', type: 'number', width: 88, align: 'right' },
          ],
        },
      }),
    );
    buildMock.mockReturnValue(
      of({ ok: true, data: '<html><body><div class="doc-page">A4</div></body></html>' }),
    );
    URL.createObjectURL = jest.fn(() => 'blob:mock');
    URL.revokeObjectURL = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        ProposalWorkspaceDraftService,
        {
          provide: ProposalsService,
          useValue: {
            findById: proposalsFindMock,
            create: proposalsCreateMock,
            update: proposalsUpdateMock,
            downloadPdf: proposalsDownloadPdfMock,
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: { findById: templatesFindMock, build: buildMock },
        },
        { provide: OrdersService, useValue: { findById: jest.fn() } },
        {
          provide: ProductsService,
          useValue: {
            list: jest.fn(),
            findById: jest.fn(),
            duplicate: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: ProductModulesService, useValue: { findById: jest.fn(), update: jest.fn() } },
        { provide: MaterialsService, useValue: { findById: jest.fn(), update: jest.fn() } },
        {
          provide: TemplateBlocksService,
          useValue: { listByTemplate: jest.fn(() => of({ ok: true, data: [] })) },
        },
        { provide: TableTemplatesService, useValue: { findById: tableFindMock } },
        {
          provide: GeneratedDocumentsService,
          useValue: { archiveQuotation: jest.fn(() => of({ ok: true })) },
        },
        {
          provide: PiDialogService,
          useValue: {
            open: dialogOpenMock.mockImplementation(() => ({
              closed: computed(() => dialogCloseValue),
              close: jest.fn(),
            })),
          },
        },
        provideRouter([]),
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

  it('params change triggers a preview rebuild and autosave (AC: params → rebuild)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    const buildsAfterHydrate = buildMock.mock.calls.length;

    service.onInspectorState({
      number: 'КП-099',
      title: 'КП на стенды',
      date: '2026-08-23',
      validUntil: '2026-09-23',
      organizationId: 'org-1',
      counterpartyId: 'cp-1',
      orgMarkupPercent: 20,
      dealVatPercent: 20,
      discountType: 'none',
      discountPercent: 0,
      discountAmount: 0,
      prepaymentPercent: 0,
      productionDays: 0,
      deliveryDays: 0,
      sheetLayout: { rowsFirstPage: 8, rowsNextPage: 12 },
    });
    expect(service.proposalNumber()).toBe('КП-099');
    tick(2000); // rebuild debounce + autosave
    expect(buildMock.mock.calls.length).toBeGreaterThan(buildsAfterHydrate);
    expect(proposalsUpdateMock).toHaveBeenCalled();
    tick(5000);
  }));

  it('terms change updates the draft without leaving workspace (AC: terms from library)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.terms()).toHaveLength(0);

    service.onTermsChange([{ text: 'Оплата 100% по факту готовности', sortOrder: 0 }]);
    expect(service.terms()).toHaveLength(1);
    expect(service.terms()[0].text).toBe('Оплата 100% по факту готовности');
    tick(2000);
    expect(proposalsUpdateMock).toHaveBeenCalled();
    tick(5000);
  }));

  it('output print gate: without a ready preview it errors instead of printing', fakeAsync(() => {
    service.requestOutput('print');
    tick();
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('Превью'));
  }));

  it('output pdf gate: a saved draft downloads the PDF (canon 368)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.currentDraftId()).toBe('q-1');

    service.requestOutput('pdf');
    tick();
    expect(proposalsDownloadPdfMock).toHaveBeenCalledWith('q-1');
    expect(toastSuccess).toHaveBeenCalledWith('PDF подготовлен');
    tick(5000);
  }));

  it('opens the table preset dialog inline without a route change (TZ-405)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    service.tableTemplateId.set('tbl-1');

    service.openTableTemplatePreset();
    tick();

    expect(tableFindMock).toHaveBeenCalledWith('tbl-1');
    expect(dialogOpenMock).toHaveBeenCalled();
    const [component, config] = dialogOpenMock.mock.calls[0];
    expect(component.name).toContain('TableTemplateFormDialog');
    expect(config.data.template._id).toBe('tbl-1');
    tick(5000);
  }));

  it('errors when opening the table preset without a selected preset (TZ-405)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    service.tableTemplateId.set(null);

    service.openTableTemplatePreset();
    tick();

    expect(tableFindMock).not.toHaveBeenCalled();
    expect(dialogOpenMock).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('шаблон'));
    tick(5000);
  }));

  it('saving the preset syncs kpTableLayout from its columns and schedules autosave (TZ-405)', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    service.tableTemplateId.set('tbl-1');
    dialogCloseValue = {
      _id: 'tbl-1',
      name: 'Спецификация (новая)',
      sortOrder: 0,
      isActive: true,
      columns: [
        { key: 'productName', label: 'Наименование', type: 'text', width: 260, align: 'left' },
        { key: 'unitPrice', label: 'Цена', type: 'currency', width: 120, align: 'right' },
      ],
    };

    service.openTableTemplatePreset();
    tick();
    tick(2000);

    expect(service.tableTemplateId()).toBe('tbl-1');
    const layout = service.kpTableLayout();
    expect(layout.some((c) => c.key === 'productName')).toBe(true);
    expect(layout.some((c) => c.key === 'unitPrice')).toBe(true);
    expect(layout.every((c) => c.visible)).toBe(true);
    expect(proposalsUpdateMock).toHaveBeenCalled();
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

  it('TZ-KP-WS-408: source=order&sourceId prefills client/site/items (426 parity)', fakeAsync(() => {
    const ordersFind = jest.fn(() =>
      of({
        ok: true,
        data: {
          _id: 'ord-9',
          counterpartyId: 'cp-order',
          siteId: 'site-order',
          items: [
            { productId: 'prod-x', productName: 'Стойка', quantity: 3, unit: 'шт', unitPrice: 700 },
          ],
        },
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ProposalWorkspaceDraftService,
        {
          provide: ProposalsService,
          useValue: { findById: jest.fn(), create: jest.fn(), update: jest.fn() },
        },
        { provide: DocumentTemplatesService, useValue: { findById: jest.fn(), build: jest.fn() } },
        { provide: OrdersService, useValue: { findById: ordersFind } },
        { provide: ProductsService, useValue: { findById: jest.fn() } },
        { provide: ProductModulesService, useValue: { findById: jest.fn() } },
        { provide: MaterialsService, useValue: { findById: jest.fn() } },
        {
          provide: TemplateBlocksService,
          useValue: { listByTemplate: jest.fn(() => of({ ok: true, data: [] })) },
        },
        { provide: TableTemplatesService, useValue: { findById: jest.fn() } },
        { provide: GeneratedDocumentsService, useValue: { archiveQuotation: jest.fn() } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        provideRouter([]),
        {
          provide: PiToastService,
          useValue: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
        },
      ],
    });
    const s = TestBed.inject(ProposalWorkspaceDraftService);
    s.init({ source: 'order', sourceId: 'ord-9' });
    tick(200);

    expect(ordersFind).toHaveBeenCalledWith('ord-9');
    expect(s.counterpartyId()).toBe('cp-order');
    expect(s.siteId()).toBe('site-order');
    expect(s.draftLines()).toHaveLength(1);
    expect(s.draftLines()[0].productName).toBe('Стойка');
    expect(s.draftLines()[0].quantity).toBe(3);
    expect(s.currentDraftId()).toBeNull();
    tick(5000);
  }));

  it('TZ-KP-WS-408: ?action=print fires the printer once when preview is ready', fakeAsync(() => {
    service.attachPrinter(jest.fn());
    const printer = (service as unknown as { printCurrent: (() => void) | null }).printCurrent;
    service.init({ id: 'q-1', print: true });
    tick(200); // hydrate + first build
    expect(printer).toHaveBeenCalledTimes(1);
    // No second print on later rebuilds
    service.onTemplateChange(TEMPLATE);
    tick(300);
    expect(printer).toHaveBeenCalledTimes(1);
    tick(5000);
  }));
});
