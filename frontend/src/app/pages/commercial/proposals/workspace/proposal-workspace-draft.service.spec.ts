import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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
import { OrganizationsService } from '../../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../../shared/services/pi-counterparty.service';
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
  const proposalsDuplicateMock = jest.fn();
  const proposalsDownloadPdfMock = jest.fn();
  const templatesFindMock = jest.fn();
  const templatesListMock = jest.fn();
  const buildMock = jest.fn();
  const tableFindMock = jest.fn();
  const toastError = jest.fn();
  const toastSuccess = jest.fn();
  const toastWarning = jest.fn();
  const toastShow = jest.fn();
  const dialogOpenMock = jest.fn();
  const orgFindMock = jest.fn();
  const counterpartyFindMock = jest.fn();
  const routerNavigateMock = jest.fn().mockResolvedValue(true);
  let dialogCloseValue: unknown = undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    proposalsFindMock.mockReturnValue(of({ ok: true, data: DRAFT }));
    proposalsCreateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-new' } }));
    proposalsUpdateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-1', status: 'draft' } }));
    proposalsDuplicateMock.mockReturnValue(
      of({ ok: true, data: { _id: 'q-copy', number: 'КП-043' } }),
    );
    proposalsDownloadPdfMock.mockReturnValue(of(new Blob(['pdf'])));
    templatesListMock.mockReturnValue(of({ ok: true, data: { items: [], total: 0 } }));
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
    orgFindMock.mockReturnValue(of({ ok: true, data: { _id: 'org-1', vatRate: 20 } }));
    counterpartyFindMock.mockReturnValue(of({ ok: true, data: { _id: 'cp-1', vatRate: 20 } }));
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
            duplicate: proposalsDuplicateMock,
            downloadPdf: proposalsDownloadPdfMock,
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: { findById: templatesFindMock, build: buildMock, list: templatesListMock },
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
          provide: OrganizationsService,
          useValue: { findById: orgFindMock },
        },
        {
          provide: CounterpartyService,
          useValue: { findById: counterpartyFindMock },
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
          useValue: {
            error: toastError,
            success: toastSuccess,
            warning: toastWarning,
            show: toastShow,
          },
        },
        { provide: Router, useValue: { navigate: routerNavigateMock } },
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

  it('MECH-503: new draft autosave assigns proposalNumber from create response', fakeAsync(() => {
    proposalsCreateMock.mockReturnValue(
      of({ ok: true, data: { _id: 'q-new', number: 'QTN-001', status: 'draft' } }),
    );
    service.init({ new: true });
    tick();
    expect(service.proposalNumber()).toBe('');

    service.onTemplateChange(TEMPLATE as never);
    tick(200);
    service.onInspectorState({
      organizationId: 'org-1',
      counterpartyId: '',
      orgMarkupPercent: 0,
      dealVatPercent: 20,
      discountType: 'none',
      discountPercent: 0,
      discountAmount: 0,
      prepaymentPercent: 0,
      productionDays: 0,
      deliveryDays: 0,
      sheetLayout: {
        rowsFirstPage: 0,
        rowsNextPage: 0,
        photoScalePercent: 100,
        photoCropYPercent: 0,
        showPhotoColumn: true,
        tableFontSize: 12,
        tableHeaderFontSize: 12,
      },
    });
    tick(2000);

    expect(proposalsCreateMock).toHaveBeenCalled();
    expect(proposalsCreateMock.mock.calls[0][0].number).toBeUndefined();
    expect(service.proposalNumber()).toBe('QTN-001');
    expect(service.currentDraftId()).toBe('q-new');
    tick(5000);
  }));

  it('MECH-503: manual number edit is sent on subsequent update', fakeAsync(() => {
    proposalsCreateMock.mockReturnValue(
      of({ ok: true, data: { _id: 'q-new', number: 'QTN-001', status: 'draft' } }),
    );
    service.init({ new: true });
    service.onTemplateChange(TEMPLATE as never);
    tick(200);
    service.onInspectorState({
      organizationId: 'org-1',
      counterpartyId: '',
      orgMarkupPercent: 0,
      dealVatPercent: 20,
      discountType: 'none',
      discountPercent: 0,
      discountAmount: 0,
      prepaymentPercent: 0,
      productionDays: 0,
      deliveryDays: 0,
      sheetLayout: {
        rowsFirstPage: 0,
        rowsNextPage: 0,
        photoScalePercent: 100,
        photoCropYPercent: 0,
        showPhotoColumn: true,
        tableFontSize: 12,
        tableHeaderFontSize: 12,
      },
    });
    tick(2000);
    expect(service.proposalNumber()).toBe('QTN-001');
    localStorage.setItem('kp.create.lastDraftId', 'q-new');

    service.onInspectorState({
      organizationId: 'org-1',
      counterpartyId: '',
      number: 'QTN-001-custom',
      orgMarkupPercent: 0,
      dealVatPercent: 20,
      discountType: 'none',
      discountPercent: 0,
      discountAmount: 0,
      prepaymentPercent: 0,
      productionDays: 0,
      deliveryDays: 0,
      sheetLayout: {
        rowsFirstPage: 0,
        rowsNextPage: 0,
        photoScalePercent: 100,
        photoCropYPercent: 0,
        showPhotoColumn: true,
        tableFontSize: 12,
        tableHeaderFontSize: 12,
      },
    });
    tick(2000);

    expect(proposalsUpdateMock).toHaveBeenCalled();
    expect(proposalsUpdateMock.mock.calls.at(-1)?.[1].number).toBe('QTN-001-custom');
    tick(5000);
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
        {
          provide: OrganizationsService,
          useValue: { findById: jest.fn(() => of({ ok: true, data: {} })) },
        },
        {
          provide: CounterpartyService,
          useValue: {
            findById: jest.fn(() =>
              of({ ok: true, data: { _id: 'cp-order', vatRate: 20, paymentTermDays: 10 } }),
            ),
          },
        },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        provideRouter([]),
        {
          provide: PiToastService,
          useValue: { error: jest.fn(), success: jest.fn(), warning: jest.fn(), show: jest.fn() },
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

  it('normalizes catalog photoIds to a single photo column (no duplicate Фото)', () => {
    service.onTableLayoutChange([
      { key: 'sku', label: 'Артикул', visible: true },
      { key: 'photoIds', label: 'Фото', visible: true },
      { key: 'name', label: 'Наименование', visible: true },
      { key: 'listPrice', label: 'Цена', visible: true },
    ]);

    const layout = service.kpTableLayout();
    expect(layout.filter((column) => column.key === 'photo')).toHaveLength(1);
    expect(layout.some((column) => column.key === 'photoIds')).toBe(false);
  });

  const inspectorBase = {
    orgMarkupPercent: 0,
    dealVatPercent: 20,
    discountType: 'none' as const,
    discountPercent: 0,
    discountAmount: 0,
    prepaymentPercent: 0,
    productionDays: 0,
    deliveryDays: 0,
    sheetLayout: {
      rowsFirstPage: 0,
      rowsNextPage: 0,
      photoScalePercent: 100,
      photoCropYPercent: 0,
      showPhotoColumn: true,
      tableFontSize: 12,
      tableHeaderFontSize: 12,
    },
  };

  it('MECH-504: org change inherits vatRate when user has not touched vat', fakeAsync(() => {
    service.init({ new: true });
    orgFindMock.mockReturnValueOnce(of({ ok: true, data: { _id: 'org-10', vatRate: 10 } }));

    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-10',
      counterpartyId: '',
    });
    tick();

    expect(orgFindMock).toHaveBeenCalledWith('org-10');
    expect(service.dealVatPercent()).toBe(10);
    expect(service.vatTouchedByUser()).toBe(false);
    tick(5000);
  }));

  it('MECH-504: counterparty change inherits vatRate when user has not touched vat', fakeAsync(() => {
    service.init({ new: true });
    counterpartyFindMock.mockReturnValueOnce(
      of({ ok: true, data: { _id: 'cp-5', vatRate: 0, paymentTermDays: 14 } }),
    );

    service.onRecipientState({ counterpartyId: 'cp-5', contactPersonId: '', siteId: '' });
    tick();

    expect(counterpartyFindMock).toHaveBeenCalledWith('cp-5');
    expect(service.dealVatPercent()).toBe(0);
    expect(toastShow).toHaveBeenCalledWith('У клиента срок оплаты 14 дн.');
    tick(5000);
  }));

  it('MECH-504: manual vat edit blocks inherit on subsequent org change', fakeAsync(() => {
    service.init({ new: true });
    orgFindMock.mockReturnValueOnce(of({ ok: true, data: { _id: 'org-10', vatRate: 10 } }));
    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-10',
      counterpartyId: '',
    });
    tick();
    expect(service.dealVatPercent()).toBe(10);

    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-10',
      counterpartyId: '',
      dealVatPercent: 15,
    });
    tick();
    expect(service.vatTouchedByUser()).toBe(true);
    expect(service.dealVatPercent()).toBe(15);

    orgFindMock.mockReturnValueOnce(of({ ok: true, data: { _id: 'org-20', vatRate: 5 } }));
    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-20',
      counterpartyId: '',
      dealVatPercent: 15,
    });
    tick();
    expect(service.dealVatPercent()).toBe(15);
    tick(5000);
  }));

  it('MECH-504: new draft keeps discount none/0 by default', fakeAsync(() => {
    service.init({ new: true });
    tick();
    expect(service.discountType()).toBe('none');
    expect(service.discountPercent()).toBe(0);
    expect(service.discountAmount()).toBe(0);
    expect(service.discountTouchedByUser()).toBe(false);
    tick(5000);
  }));

  it('MECH-504: hydrated draft marks vat touched from saved snapshot', fakeAsync(() => {
    proposalsFindMock.mockReturnValue(
      of({ ok: true, data: { ...DRAFT, vatPercent: 7, discountType: 'none' } }),
    );
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.dealVatPercent()).toBe(7);
    expect(service.vatTouchedByUser()).toBe(true);

    orgFindMock.mockClear();
    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-99',
      counterpartyId: 'cp-1',
      dealVatPercent: 7,
    });
    tick();
    expect(service.dealVatPercent()).toBe(7);
    tick(5000);
  }));

  it('MECH-505: duplicateDraft calls service and navigates to new workspace id', fakeAsync(() => {
    service.init({ id: 'q-1' });
    tick(200);
    expect(service.currentDraftId()).toBe('q-1');

    service.duplicateDraft();
    tick();

    expect(proposalsDuplicateMock).toHaveBeenCalledWith('q-1');
    expect(toastSuccess).toHaveBeenCalledWith('Создана копия КП-043');
    expect(routerNavigateMock).toHaveBeenCalledWith(['/proposals/workspace'], {
      queryParams: { id: 'q-copy' },
    });
    tick(5000);
  }));

  it('MECH-505: org change shows template background hint toast', fakeAsync(() => {
    service.init({ new: true });
    orgFindMock.mockReturnValueOnce(of({ ok: true, data: { _id: 'org-10', vatRate: 10 } }));

    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-10',
      counterpartyId: '',
    });
    tick();

    expect(toastShow).toHaveBeenCalledWith(
      'Проверьте шаблон бланка — у другой фирмы может быть другой фон',
    );
    tick(5000);
  }));

  it('MECH-505: org change suggests template picker when org templates exist', fakeAsync(() => {
    service.init({ new: true });
    orgFindMock.mockReturnValueOnce(of({ ok: true, data: { _id: 'org-10', vatRate: 10 } }));
    templatesListMock.mockReturnValueOnce(
      of({ ok: true, data: { items: [{ _id: 'tpl-org-10', name: 'Бланк B' }], total: 1 } }),
    );

    service.onInspectorState({
      ...inspectorBase,
      organizationId: 'org-10',
      counterpartyId: '',
    });
    tick();

    expect(templatesListMock).toHaveBeenCalledWith({ organizationId: 'org-10' });
    expect(toastShow).toHaveBeenCalledWith(
      'Для выбранной фирмы есть 1 шаблон(ов) — проверьте раздел «Шаблон»',
    );
    tick(5000);
  }));
});
