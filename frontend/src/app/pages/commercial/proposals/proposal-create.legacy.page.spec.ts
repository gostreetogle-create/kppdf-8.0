import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ProposalCreatePage } from './proposal-create.legacy.page';
import { calculateKpPreviewScale } from './proposal-create-template-center.component';
import { AuthService } from '../../../core/auth.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { ProductsService } from '../../../shared/services/products.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { ProposalsService } from '../../../shared/services/pi-proposals.service';
import { GeneratedDocumentsService } from '../../../shared/services/pi-generated-documents.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { PiToastService } from '../../../shared/ui/toast';
import { OrdersService } from '../../../shared/services/orders.service';
import { ProposalDraftLine } from './proposal-product-rail.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

describe('ProposalCreatePage (TZ-SALES-317 shell + TZ-SALES-319 build preview)', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;
  const buildMock = jest.fn();
  const tableFindMock = jest.fn();
  const blocksListMock = jest.fn();
  const templateFindMock = jest.fn();
  const quotationCreateMock = jest.fn();
  const quotationUpdateMock = jest.fn();
  const quotationFindMock = jest.fn();
  const orderFindByIdMock = jest.fn();
  const productFindByIdMock = jest.fn();
  const productUpdateMock = jest.fn();
  const productDuplicateMock = jest.fn();
  const toastSuccessMock = jest.fn();
  const toastErrorMock = jest.fn();

  beforeEach(async () => {
    localStorage.clear();
    buildMock.mockReset();
    templateFindMock.mockReset();
    templateFindMock.mockReturnValue(of({ ok: true, data: { _id: 'tpl-1', name: 'КП стандарт' } }));
    quotationCreateMock.mockReset();
    quotationUpdateMock.mockReset();
    quotationFindMock.mockReset();
    orderFindByIdMock.mockReset();
    orderFindByIdMock.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'o1',
          number: 'З-1001',
          counterpartyId: 'cp-1',
          siteId: 'site-1',
          items: [
            {
              productId: 'prod-1',
              productName: 'Стенд',
              productSku: 'ST-1',
              quantity: 2,
              unit: 'шт',
              unitPrice: 5000,
            },
          ],
        },
      }),
    );
    productFindByIdMock.mockReset();
    productUpdateMock.mockReset();
    productDuplicateMock.mockReset();
    productFindByIdMock.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'prod-1',
          name: 'Стенд',
          sku: 'ST-1',
          kind: 'good',
          unit: 'шт',
          listPrice: 5000,
          __v: 3,
          photoIds: [{ _id: 'ph-1', storageUrl: '/uploads/stand-thumb.webp' }],
        },
      }),
    );
    productUpdateMock.mockReturnValue(
      of({
        ok: true,
        data: { _id: 'prod-1', name: 'Стенд edited', sku: 'ST-1', unit: 'шт', __v: 4 },
      }),
    );
    productDuplicateMock.mockReturnValue(
      of({
        ok: true,
        data: { _id: 'prod-copy', name: 'Стенд copy', sku: 'ST-1-COPY-1', unit: 'шт', __v: 1 },
      }),
    );
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    quotationCreateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-1' } }));
    quotationUpdateMock.mockReturnValue(of({ ok: true, data: { _id: 'q-1' } }));
    quotationFindMock.mockReturnValue(of({ ok: false, error: new Error('not found') }));
    buildMock.mockReturnValue(
      of({
        ok: true,
        data: '<html><head></head><body><div class="doc-bg" data-test="DATA_TEST_BUILD_OK"><img src="/uploads/bg.png" alt=""></div></body></html>',
      }),
    );
    blocksListMock.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            type: 'table',
            title: 'Позиции КП',
            settings: { tableTemplateId: 'table-1', kpLineItems: true },
          },
        ],
      }),
    );
    tableFindMock.mockReturnValue(
      of({
        ok: true,
        data: {
          _id: 'table-1',
          columns: [
            { key: 'index', label: '№' },
            { key: 'productName', label: 'Наименование' },
            { key: 'quantity', label: 'Кол-во' },
            { key: 'unit', label: 'Ед.' },
            { key: 'unitPrice', label: 'Цена' },
            { key: 'sum', label: 'Сумма' },
          ],
        },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ProposalCreatePage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AuthService,
          useValue: {
            user: signal({ pages: ['proposals', 'contracts', 'orders'] }),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'prod-1',
                      name: 'Стенд',
                      sku: 'ST-1',
                      kind: 'product',
                      unit: 'шт',
                      listPrice: 5000,
                    },
                  ],
                  total: 1,
                },
              }),
            findById: productFindByIdMock,
            update: productUpdateMock,
            duplicate: productDuplicateMock,
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: { items: [{ _id: 'org-1', name: 'ООО Альфа' }], total: 1 },
              }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: {
            list: jest.fn(() =>
              of({
                ok: true,
                data: {
                  items: [
                    { _id: 'cp-1', name: 'ООО Заказчик', inn: '7700000001', isActive: true },
                    { _id: 'cp-2', name: 'ООО Поставщик', inn: '7700000002', isActive: true },
                  ],
                  total: 2,
                },
              }),
            ),
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'tpl-1',
                      name: 'КП стандарт',
                      description: 'Базовый бланк',
                      tags: [],
                      organizationId: 'org-1',
                      docTypeId: 'dt-1',
                      isDefault: true,
                      isActive: true,
                      pageSize: 'A4',
                      backgroundImage: [],
                      defaultBackgroundIndex: 0,
                      backgroundOpacity: 1,
                      orientation: 'portrait',
                      version: 1,
                    },
                  ],
                  total: 1,
                },
              }),
            build: buildMock,
            findById: templateFindMock,
          },
        },
        {
          provide: TemplateBlocksService,
          useValue: { listByTemplate: blocksListMock },
        },
        {
          provide: ProposalsService,
          useValue: {
            create: quotationCreateMock,
            update: quotationUpdateMock,
            findById: quotationFindMock,
            downloadPdf: jest.fn(),
          },
        },
        {
          provide: GeneratedDocumentsService,
          useValue: { archiveQuotation: jest.fn() },
        },
        {
          provide: TextBlocksService,
          useValue: {
            list: jest.fn(() => of({ ok: true, data: { items: [], total: 0 } })),
          },
        },
        {
          provide: TextBlockCategoriesService,
          useValue: {
            list: jest.fn(() => of({ ok: true, data: [] })),
          },
        },
        {
          provide: PiToastService,
          useValue: { success: toastSuccessMock, error: toastErrorMock },
        },
        {
          provide: TableTemplatesService,
          useValue: { findById: tableFindMock },
        },
        {
          provide: OrdersService,
          useValue: { findById: orderFindByIdMock },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalCreatePage);
    fixture.detectChanges();
  });

  it('fits a small sheet without upscaling or scroll gutters', () => {
    const scale = calculateKpPreviewScale(600, 800);

    expect(scale).toBeLessThan(1);
    expect(scale * 794).toBeLessThanOrEqual(600);
    expect(scale * 1123).toBeLessThanOrEqual(800);
  });

  it('keeps fixed rails with two left tools (template + products)', () => {
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-toggle-template"]')),
    ).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-left"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-right"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-right"]'))).toBeNull();
  });

  it('does not use docked multi-column body modifiers', () => {
    const body = fixture.debugElement.query(By.css('[data-test="kp-create-body"]'));
    expect(body.classes['kp-create-studio__body--left-open']).toBeFalsy();
    expect(body.classes['kp-create-studio__body--right-open']).toBeFalsy();
  });

  it('opens template overlay from center CTA without cascade L1/L2', () => {
    fixture.debugElement.query(By.css('[data-test="kp-tpl-add"]')).triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-picker"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-cascade-l1"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
  });

  it('opens the unified Редактор таблицы pane with 3-button right rail', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'params' | 'table') => void;
    };
    page.toggleRightPane('table');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-table"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-insp-markup"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor"]'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Редактор таблицы');
    expect(fixture.nativeElement.textContent).toContain('+ Своя строка');
    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor"]'))).toBeTruthy();

    page.toggleRightPane('params');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-insp-markup"]'))).toBeTruthy();
  });

  it('keeps right rail order Параметры → Редактор таблицы → Условия → Вывод', () => {
    const buttons = fixture.debugElement
      .query(By.css('[data-test="kp-rail-right"]'))
      .queryAll(By.css('button'))
      .map((btn) => btn.attributes['data-test']);
    expect(buttons).toEqual([
      'kp-create-toggle-right',

      'kp-create-toggle-table',
      'kp-create-toggle-terms',
      'kp-create-toggle-output',
    ]);
  });

  it('uses flyout S/L tiers and distinct Шаблон vs Условия icons (TZ-SALES-362)', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      fileIcon: unknown;
      termsIcon: unknown;
      toggleLeftTool: (tool: 'template' | 'products' | 'recipient') => void;
      toggleRightPane: (pane: 'params' | 'terms' | 'table') => void;
    };
    expect(page.fileIcon).not.toBe(page.termsIcon);

    page.toggleLeftTool('template');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="template"]'))?.attributes[
        'data-flyout-tier'
      ],
    ).toBe('s');

    page.toggleLeftTool('products');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="products"]'))?.attributes[
        'data-flyout-tier'
      ],
    ).toBe('l');

    page.toggleLeftTool('recipient');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="recipient"]'))?.attributes[
        'data-flyout-tier'
      ],
    ).toBe('l');

    page.toggleRightPane('params');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="params"]'))?.attributes['data-flyout-tier'],
    ).toBe('s');

    page.toggleRightPane('terms');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="terms"]'))?.attributes['data-flyout-tier'],
    ).toBe('s');

    page.toggleRightPane('table');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-flyout="table"]'))?.attributes['data-flyout-tier'],
    ).toBe('l');

    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-toggle-terms"]'))?.attributes[
        'aria-label'
      ],
    ).toBe('Условия');
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-toggle-template"]'))?.attributes[
        'aria-label'
      ],
    ).toBe('Шаблон');
  });

  it('places «Своя строка» in the table editor footer and adds a custom line', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table') => void;
      addCustomLine: () => void;
      draftLines: () => ProposalDraftLine[];
    };
    page.toggleRightPane('table');
    fixture.detectChanges();

    const addBtn = fixture.debugElement.query(By.css('[data-test="kp-table-editor-add-custom"]'));
    expect(addBtn).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Своя строка');

    addBtn.triggerEventHandler('click');
    fixture.detectChanges();
    expect(page.draftLines()).toHaveLength(1);
    expect(page.draftLines()[0].lineKind).toBe('custom');
  });

  it('opens the Условия overlay from the right rail without changing the shell', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'terms') => void;
    };
    page.toggleRightPane('terms');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-terms-panel"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-center"]'))).toBeTruthy();
  });

  it('opens products overlay from its own rail button', () => {
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-product-rail"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeNull();
  });

  it('closes overlay on Escape', () => {
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
  });

  it('uses a backdrop to close both flyouts from the center/iframe area', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      rightOpen: () => boolean;
    };
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-right"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-backdrop"]'))).toBeTruthy();
    expect(page.rightOpen()).toBe(true);

    fixture.debugElement
      .query(By.css('[data-test="kp-create-backdrop"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-right"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-backdrop"]'))).toBeNull();
  });

  it('does not close when pointerdown originates inside a flyout', () => {
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    const flyout = fixture.debugElement.query(By.css('[data-test="kp-create-products"]'));
    flyout.nativeElement.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();
  });

  it('TZ-SALES-319: pick calls build and shows iframe without stub chrome', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      openTemplateTool: () => void;
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      leftTool: () => string | null;
      selectedTemplate: () => DocumentTemplate | null;
      previewStatus: () => string;
    };

    page.openTemplateTool();
    fixture.detectChanges();
    expect(page.leftTool()).toBe('template');

    page.onTemplateChange({
      _id: 'tpl-1',
      name: 'КП стандарт',
    } as DocumentTemplate);
    fixture.detectChanges();

    expect(page.selectedTemplate()?.name).toBe('КП стандарт');
    expect(page.leftTool()).toBeNull();

    tick(250);
    fixture.detectChanges();

    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [],
        tableLayout: expect.arrayContaining([
          expect.objectContaining({ key: 'productName', visible: true }),
          expect.objectContaining({ key: 'sum', visible: true }),
        ]),
      }),
    );
    expect(page.previewStatus()).toBe('ready');
    const frame = fixture.debugElement.query(By.css('[data-test="kp-tpl-html-preview"]'));
    expect(frame).toBeTruthy();
    expect(frame.nativeElement.getAttribute('sandbox')).toBe('allow-same-origin');
    expect(frame.nativeElement.getAttribute('srcdoc')).toContain(
      `${window.location.origin}/uploads/bg.png`,
    );
    expect(frame.styles['transform']).toContain('scale(');
    expect(fixture.debugElement.query(By.css('[data-test="kp-save-bar"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-page-count"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-page-1"]'))).toBeTruthy();
    expect(getComputedStyle(frame.nativeElement).pointerEvents).toBe('none');
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-name"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('упрощённое');
  }));

  it('shows per-page labels in the center for a multi-page build (no savebar count)', fakeAsync(() => {
    buildMock.mockReturnValueOnce(
      of({
        ok: true,
        data: `<html><body><section class="doc-page">Лист 1</section><section class="doc-page">Лист 2</section></body></html>`,
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      autosaveLabel: { set: (value: string) => void };
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.autosaveLabel.set('Сохранено');
    tick(250);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-save-bar"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-page-count"]'))).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Страница 1 из 2');
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-page-1"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-page-2"]'))).toBeTruthy();
  }));

  it('keeps preview loading and build failures short and Russian', fakeAsync(() => {
    buildMock.mockReturnValueOnce(of({ ok: false, error: { message: 'Raw Exception: failed' } }));
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      previewStatus: () => string;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Загрузка превью…');

    tick(250);
    fixture.detectChanges();

    expect(page.previewStatus()).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('Не удалось построить превью');
    expect(fixture.nativeElement.textContent).not.toContain('Raw Exception');
  }));

  it('TZ-SALES-319: org change rebuilds with organizationId', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (s: { organizationId: string; orgMarkupPercent: number }) => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();
    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [],
        tableLayout: expect.arrayContaining([
          expect.objectContaining({ key: 'productName', visible: true }),
          expect.objectContaining({ key: 'sum', visible: true }),
        ]),
      }),
    );

    buildMock.mockClear();
    page.onInspectorState({ organizationId: 'org-1', orgMarkupPercent: 0 });
    tick(250);
    fixture.detectChanges();

    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [],
        organizationId: 'org-1',
        tableLayout: expect.any(Array),
      }),
    );
  }));

  it('rebuilds the template with reordered and hidden table layout', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onTableLayoutChange: (
        layout: Array<{ key: string; label: string; visible: boolean }>,
      ) => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    buildMock.mockClear();

    page.onTableLayoutChange([
      { key: 'sum', label: 'Сумма', visible: true },
      { key: 'productName', label: 'Наименование', visible: false },
    ]);
    tick(250);
    fixture.detectChanges();

    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        tableLayout: [
          { key: 'sum', visible: true },
          { key: 'productName', visible: true },
          { key: 'photo', visible: true },
        ],
      }),
    );
  }));

  it('syncs the inspector layout from the selected template table columns', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      kpTableLayout: () => Array<{ key: string; label: string; visible: boolean }>;
    };
    tableFindMock.mockReturnValueOnce(
      of({
        ok: true,
        data: {
          _id: 'table-1',
          columns: [
            { key: 'photo', label: 'Рисунок' },
            { key: 'name', label: 'Наименование' },
            { key: 'sku', label: 'Артикул' },
          ],
        },
      }),
    );

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();

    expect(page.kpTableLayout()).toEqual([
      { key: 'photo', label: 'Рисунок', visible: true },
      { key: 'name', label: 'Наименование', visible: true },
      { key: 'sku', label: 'Артикул', visible: true },
    ]);
    expect(buildMock).toHaveBeenLastCalledWith(
      'tpl-1',
      expect.objectContaining({
        tableLayout: [
          { key: 'photo', visible: true },
          { key: 'name', visible: true },
          { key: 'sku', visible: true },
        ],
      }),
    );
  }));

  it('lets the Table rail select among multiple live tables and sends the selected target', fakeAsync(() => {
    blocksListMock.mockReturnValueOnce(
      of({
        ok: true,
        data: [
          {
            type: 'table',
            title: 'Коммерческие позиции',
            settings: { tableTemplateId: 'table-1' },
          },
          {
            type: 'table',
            title: 'Позиции КП',
            settings: { tableTemplateId: 'table-2', kpLineItems: true },
          },
        ],
      }),
    );
    tableFindMock.mockImplementation((id: string) =>
      of({
        ok: true,
        data: {
          _id: id,
          columns:
            id === 'table-1'
              ? [{ key: 'sku', label: 'Артикул' }]
              : [{ key: 'name', label: 'Наименование' }],
        },
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onTableTargetChange: (id: string) => void;
      selectedTableTargetId: () => string | null;
      kpTableLayout: () => Array<{ key: string; label: string; visible: boolean }>;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    page.onTableTargetChange('table-1');
    tick(250);
    fixture.detectChanges();

    expect(page.selectedTableTargetId()).toBe('table-1');
    expect(page.kpTableLayout()).toEqual([
      { key: 'sku', label: 'Артикул', visible: true },
      { key: 'photo', label: 'Фото', visible: true },
    ]);
    expect(buildMock).toHaveBeenLastCalledWith(
      'tpl-1',
      expect.objectContaining({
        tableTargetId: 'table-1',
        tableLayout: [
          { key: 'sku', visible: true },
          { key: 'photo', visible: true },
        ],
      }),
    );
  }));

  it('426: source=order&sourceId prefills the КП from the order (client + items)', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      prefillFromOrder: (orderId: string) => void;
      counterpartyId: () => string;
      siteId: () => string;
      draftLines: () => ProposalDraftLine[];
    };
    page.prefillFromOrder('o1');
    tick();

    expect(orderFindByIdMock).toHaveBeenCalledWith('o1');
    expect(page.counterpartyId()).toBe('cp-1');
    expect(page.siteId()).toBe('site-1');
    expect(page.draftLines()).toEqual([
      expect.objectContaining({
        productId: 'prod-1',
        productName: 'Стенд',
        productSku: 'ST-1',
        quantity: 2,
        unit: 'шт',
        unitPrice: 5000,
      }),
    ]);
  }));

  it('saves a draft with template snapshot and updates the same draft on repeat Save', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (state: { organizationId: string; orgMarkupPercent: number }) => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      saveDraft: () => void;
    };
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onInspectorState({
      organizationId: 'org-1',
      counterpartyId: 'cp-1',
      orgMarkupPercent: 10,
    });

    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      photoUrl: '/uploads/stand-thumb.webp',
      quantity: 2,
      unit: 'шт',
      unitPrice: 5000,
    });
    tick(250);
    page.saveDraft();

    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        counterpartyId: 'cp-1',
        status: 'draft',
        templateId: 'tpl-1',
        templateSnapshot: expect.objectContaining({
          templateId: 'tpl-1',
          html: expect.any(String),
        }),
        items: [
          expect.objectContaining({
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 5000,
            photoUrl: '/uploads/stand-thumb.webp',
          }),
        ],
      }),
    );
    expect(
      (quotationCreateMock.mock.calls[0][0] as { items: Array<{ total?: number }> }).items[0].total,
    ).toBeUndefined();
    expect(localStorage.getItem('kp.create.lastDraftId')).toBe('q-1');
    expect(toastSuccessMock).toHaveBeenCalledWith('Черновик сохранён');

    page.saveDraft();
    expect(quotationUpdateMock).toHaveBeenCalledWith('q-1', expect.any(Object));
  }));

  it('uses the all-counterparty picker value in the autosave payload', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (state: {
        organizationId: string;
        counterpartyId?: string;
        orgMarkupPercent: number;
      }) => void;
      saveDraft: () => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onInspectorState({ organizationId: 'org-1', counterpartyId: 'cp-2', orgMarkupPercent: 0 });
    tick(250);
    page.saveDraft();

    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ counterpartyId: 'cp-2' }),
    );
  }));

  it('autosaves after template + firm settle without a Save КП button', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (state: { organizationId: string; orgMarkupPercent: number }) => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onInspectorState({ organizationId: 'org-1', orgMarkupPercent: 0 });
    tick(250);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-save-draft-top"]'))).toBeNull();

    tick(1150);
    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        templateId: 'tpl-1',
        organizationId: 'org-1',
      }),
    );
    const created = quotationCreateMock.mock.calls[0][0] as {
      items: Array<Record<string, unknown>>;
    };
    for (const item of created.items) {
      expect(item.total).toBeUndefined();
    }
    expect(toastSuccessMock).toHaveBeenCalledWith('Черновик сохранён');
  }));

  it('clears local pointers when last draft was deleted (empty Create)', fakeAsync(() => {
    localStorage.setItem('kp.create.lastDraftId', 'q-gone');
    localStorage.setItem('kp.create.lastTemplateId', 'tpl-1');
    quotationFindMock.mockReturnValueOnce(of({ ok: false, error: { status: 404 } }));
    const page = fixture.componentInstance as ProposalCreatePage & {
      resumeLastDraft: () => void;
      draftLines: () => ProposalDraftLine[];
      selectedTemplate: () => DocumentTemplate | null;
    };
    page.resumeLastDraft();
    tick();
    expect(localStorage.getItem('kp.create.lastDraftId')).toBeNull();
    expect(localStorage.getItem('kp.create.lastTemplateId')).toBeNull();
    expect(page.draftLines()).toEqual([]);
    expect(page.selectedTemplate()).toBeNull();
  }));

  it('reopens the last editable draft into the selected template and draft lines', fakeAsync(() => {
    localStorage.setItem('kp.create.lastDraftId', 'q-2');
    quotationFindMock.mockReturnValueOnce(
      of({
        ok: true,
        data: {
          _id: 'q-2',
          status: 'draft',
          organizationId: 'org-1',
          templateId: 'tpl-1',
          orgMarkupPercent: 8,
          sheetLayout: {
            rowsFirstPage: 12,
            rowsNextPage: 8,
            photoScalePercent: 85,
            photoCropYPercent: 10,
            showPhotoColumn: false,
          },
          terms: [{ text: 'Оплата: {{total_price}}', sortOrder: 0 }],
          items: [
            {
              productId: 'prod-1',
              productName: 'Стенд',
              quantity: 3,
              unit: 'шт',
              unitPrice: 5000,
              photoUrl: '/uploads/stand-thumb.webp',
            },
          ],
        },
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      draftLines: () => ProposalDraftLine[];
      terms: () => { text: string; sortOrder: number }[];
      sheetLayout: () => {
        rowsFirstPage: number;
        rowsNextPage: number;
        photoScalePercent: number;
        photoCropYPercent: number;
        showPhotoColumn: boolean;
        tableFontSize: number;
        tableHeaderFontSize: number;
      };
      resumeLastDraft: () => void;
    };
    page.resumeLastDraft();
    tick();
    expect(page.draftLines()).toEqual([
      {
        lineKind: 'catalog',
        productId: 'prod-1',
        productName: 'Стенд',
        productSku: undefined,
        quantity: 3,
        unit: 'шт',
        unitPrice: 5000,
        photoUrl: '/uploads/stand-thumb.webp',
      },
    ]);
    expect(localStorage.getItem('kp.create.lastTemplateId')).toBe('tpl-1');
    expect(page.terms()).toEqual([{ text: 'Оплата: {{total_price}}', sortOrder: 0 }]);
    expect(page.sheetLayout()).toEqual({
      rowsFirstPage: 12,
      rowsNextPage: 8,
      photoScalePercent: 85,
      photoCropYPercent: 10,
      showPhotoColumn: false,
      tableFontSize: 12,
      tableHeaderFontSize: 12,
    });
  }));

  it('hydrates an editable quotation addressed by the studio query id', fakeAsync(() => {
    quotationFindMock.mockReturnValueOnce(
      of({
        ok: true,
        data: {
          _id: 'q-query',
          status: 'draft',
          organizationId: 'org-1',
          templateId: 'tpl-1',
          items: [
            {
              productId: 'prod-1',
              productName: 'Стенд',
              quantity: 4,
              unit: 'шт',
              unitPrice: 5000,
              photoUrl: '/uploads/stand-thumb.webp',
            },
          ],
        },
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      draftLines: () => ProposalDraftLine[];
      resumeDraftById: (id: string) => void;
    };

    page.resumeDraftById('q-query');
    tick();

    expect(quotationFindMock).toHaveBeenCalledWith('q-query');
    expect(localStorage.getItem('kp.create.lastDraftId')).toBe('q-query');
    expect(page.draftLines()).toEqual([
      {
        lineKind: 'catalog',
        productId: 'prod-1',
        productName: 'Стенд',
        productSku: undefined,
        quantity: 4,
        unit: 'шт',
        unitPrice: 5000,
        photoUrl: '/uploads/stand-thumb.webp',
      },
    ]);
  }));

  it('keeps the saved template snapshot when an accepted КП is reopened', fakeAsync(() => {
    quotationFindMock.mockReturnValueOnce(
      of({
        ok: true,
        data: {
          _id: 'q-paid',
          status: 'accepted',
          organizationId: 'org-1',
          templateId: 'tpl-1',
          templateSnapshot: {
            templateId: 'tpl-1',
            html: '<html><body><p data-test="locked-snapshot">Сохранённый бланк</p></body></html>',
          },
          items: [],
        },
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      resumeDraftById: (id: string) => void;
      proposalStatus: () => string;
      isReadOnly: () => boolean;
      previewStatus: () => string;
    };

    page.resumeDraftById('q-paid');
    tick();
    fixture.detectChanges();

    expect(page.proposalStatus()).toBe('accepted');
    expect(page.isReadOnly()).toBe(true);
    expect(page.previewStatus()).toBe('ready');
    expect(buildMock).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="kp-tpl-html-preview"]')).toBeTruthy();
    expect(page.proposalStatus()).toBe('accepted');
  }));

  it('merges missing commercial columns into the Create instance only', fakeAsync(() => {
    tableFindMock.mockReturnValueOnce(
      of({
        ok: true,
        data: {
          _id: 'table-1',
          columns: [
            { key: 'photo', label: 'Рисунок' },
            { key: 'name', label: 'Наименование' },
          ],
        },
      }),
    );
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      addCommercialColumns: () => void;
      kpTableLayout: () => Array<{ key: string; label: string; visible: boolean }>;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    page.addCommercialColumns();
    tick(250);

    expect(page.kpTableLayout().map((column) => column.key)).toEqual([
      'photo',
      'name',
      'index',
      'quantity',
      'unit',
      'unitPrice',
      'sum',
    ]);
    expect(buildMock).toHaveBeenLastCalledWith(
      'tpl-1',
      expect.objectContaining({
        tableLayout: expect.arrayContaining([
          expect.objectContaining({ key: 'quantity', visible: true }),
          expect.objectContaining({ key: 'unitPrice', visible: true }),
          expect.objectContaining({ key: 'sum', visible: true }),
        ]),
      }),
    );
  }));

  it('rebuilds quantity and photo data after editing a draft line', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: { index: number; patch: { quantity: number } }) => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      photoUrl: '/uploads/stand-thumb.webp',
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    tick(250);
    buildMock.mockClear();
    page.onCompositionLineChange({ index: 0, patch: { quantity: 3 } });
    tick(250);

    expect(buildMock).toHaveBeenLastCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [
          expect.objectContaining({
            quantity: 3,
            photoUrl: '/uploads/stand-thumb.webp',
          }),
        ],
      }),
    );
  }));

  it('rebuilds the template with request-only previewLines after adding a product', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (s: {
        organizationId: string;
        orgMarkupPercent: number;
        dealVatPercent?: number;
      }) => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      draftLines: () => ProposalDraftLine[];
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    buildMock.mockClear();

    page.onInspectorState({ organizationId: '', orgMarkupPercent: 10, dealVatPercent: 20 });
    tick(250);
    buildMock.mockClear();

    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    fixture.detectChanges();
    tick(250);
    fixture.detectChanges();

    expect(page.draftLines()).toHaveLength(1);
    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [
          {
            productName: 'Стенд',
            productSku: 'ST-1',
            quantity: 1,
            unit: 'шт',
            unitPrice: 5500,
          },
        ],
        tableLayout: expect.any(Array),
        dealTotals: expect.objectContaining({ vatPercent: 20 }),
      }),
    );
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
  }));

  it('opens the Редактор таблицы panel and edits one shared draft write path', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table') => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      duplicateCompositionLine: (index: number) => void;
      moveCompositionLine: (change: { index: number; direction: -1 | 1 }) => void;
      removeCompositionLine: (index: number) => void;
      draftLines: () => ProposalDraftLine[];
    };

    page.toggleRightPane('table');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor"]'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Добавьте изделия из панели «Товары».');
    fixture.debugElement
      .query(By.css('[data-test="kp-table-editor-open-products"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();
    page.toggleRightPane('table');
    fixture.detectChanges();

    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    expect(page.draftLines()[0].quantity).toBe(2);

    page.onCompositionLineChange({ index: 0, patch: { quantity: 3, unitPrice: 5100 } });
    expect(page.draftLines()[0]).toEqual(expect.objectContaining({ quantity: 3, unitPrice: 5100 }));
    page.duplicateCompositionLine(0);
    expect(page.draftLines()).toHaveLength(2);
    page.moveCompositionLine({ index: 1, direction: -1 });
    page.removeCompositionLine(1);
    expect(page.draftLines()).toHaveLength(1);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor-line-0"]'))).toBeTruthy();
  }));

  it('edits catalog identity as a КП snapshot and never calls Product on inline change', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      draftLines: () => ProposalDraftLine[];
    };
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      description: 'Старое описание',
      catalogSourceVersion: 3,
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    page.onCompositionLineChange({
      index: 0,
      patch: {
        productName: 'Стенд новый',
        description: 'Текст КП',
        productSku: 'ST-2',
        unitPrice: 1,
      },
    });
    expect(page.draftLines()[0]).toEqual(
      expect.objectContaining({
        productName: 'Стенд новый',
        catalogDirtyFields: ['productName', 'description', 'productSku'],
        catalogDecision: 'pending',
      }),
    );
    expect(productUpdateMock).not.toHaveBeenCalled();
    expect(productDuplicateMock).not.toHaveBeenCalled();
  }));

  it('reviews pending rows with a safe КП-only default and conflict-safe source actions', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table' | 'params') => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      resolveCatalogRow: (index: number, decision: 'kp-only' | 'update' | 'copy') => void;
      draftLines: () => ProposalDraftLine[];
    };
    page.toggleRightPane('table');
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд новый',
      productSku: 'ST-2',
      catalogSourceVersion: 3,
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    page.onCompositionLineChange({ index: 0, patch: { productName: 'Стенд из КП' } });
    page.toggleRightPane('params');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-catalog-review-row-0"]')),
    ).toBeTruthy();
    fixture.debugElement
      .query(By.css('[data-test="kp-catalog-review-kp-only-0"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(page.draftLines()[0].catalogDecision).toBe('kp-only');
    expect(fixture.debugElement.query(By.css('[data-test="kp-catalog-review-row-0"]'))).toBeNull();
    expect(productUpdateMock).not.toHaveBeenCalled();

    page.onCompositionLineChange({ index: 0, patch: { productName: 'Стенд для source' } });
    page.resolveCatalogRow(0, 'update');
    expect(productUpdateMock).toHaveBeenCalledWith('prod-1', {
      name: 'Стенд для source',
      expectedVersion: 3,
    });
    expect(productUpdateMock.mock.calls[0][1]).not.toHaveProperty('unitPrice');
  }));

  it('510: Escape does NOT close the catalog review (formal exception KP-CATALOG-REVIEW-NO-ESC)', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table' | 'params') => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
    };
    page.toggleRightPane('table');
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд новый',
      productSku: 'ST-2',
      catalogSourceVersion: 3,
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    page.onCompositionLineChange({ index: 0, patch: { productName: 'Стенд из КП' } });
    page.toggleRightPane('params');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.kp-catalog-review'))).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    // Esc=B: the review stays open — no Product mutation may happen implicitly.
    expect(fixture.debugElement.query(By.css('.kp-catalog-review'))).toBeTruthy();
  }));

  it('510: review traps focus and Cancel returns it to the trigger (return-focus)', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table' | 'params') => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      cancelCatalogReview: () => void;
    };
    const trigger = document.createElement('button');
    trigger.textContent = 'Открыть ревью';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    page.toggleRightPane('table');
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд новый',
      productSku: 'ST-2',
      catalogSourceVersion: 3,
      quantity: 1,
      unit: 'шт',
      unitPrice: 5000,
    });
    page.onCompositionLineChange({ index: 0, patch: { productName: 'Стенд из КП' } });
    page.toggleRightPane('params');
    fixture.detectChanges();
    tick(); // effect → setTimeout(0) → focus trap creation
    fixture.detectChanges();

    const review = fixture.nativeElement.querySelector('.kp-catalog-review') as HTMLElement;
    expect(review).toBeTruthy();
    // CDK focus trap engaged on the review shell (anchors from constructor).
    expect(document.querySelector('.cdk-focus-trap-anchor')).toBeTruthy();

    // Simulate the trap: focus a control inside the review.
    const inside = document.createElement('button');
    inside.textContent = 'inside';
    review.appendChild(inside);
    inside.focus();
    expect(document.activeElement).toBe(inside);

    page.cancelCatalogReview();
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('.kp-catalog-review'))).toBeNull();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  }));

  it('copies an edited Product into a new row and keeps KP row duplication on the same source', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      duplicateProductForLine: (index: number) => void;
      onRowAction: (event: { index: number; action: 'duplicate-kp' }) => void;
      draftLines: () => ProposalDraftLine[];
    };
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      productSku: 'ST-1',
      description: 'Описание в КП',
      quantity: 3,
      unit: 'шт',
      unitPrice: 9000,
      discountPercent: 15,
      isOptional: true,
      catalogSourceVersion: 3,
    });
    page.onCompositionLineChange({ index: 0, patch: { productName: 'Стенд — новая версия' } });
    page.duplicateProductForLine(0);

    expect(productDuplicateMock).toHaveBeenCalledWith('prod-1', {
      name: 'Стенд — новая версия',
      description: 'Описание в КП',
      unit: 'шт',
      sku: 'ST-1',
    });
    expect(productDuplicateMock.mock.calls[0][1]).not.toHaveProperty('unitPrice');
    expect(page.draftLines()).toHaveLength(2);
    expect(page.draftLines()[0].productId).toBe('prod-1');
    expect(page.draftLines()[1]).toEqual(expect.objectContaining({ productId: 'prod-copy' }));

    page.onRowAction({ index: 0, action: 'duplicate-kp' });
    expect(page.draftLines()).toHaveLength(3);
    expect(page.draftLines()[1].productId).toBe('prod-1');
  }));

  it('opens one row drawer, persists presentation, keeps commerce cells, and shows indicator', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'table') => void;
      onProductAdd: (line: ProposalDraftLine) => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      moveCompositionLine: (change: { index: number; direction: -1 | 1 }) => void;
      removeCompositionLine: (index: number) => void;
      draftLines: () => ProposalDraftLine[];
      proposalStatus: { set: (status: string) => void };
    };

    page.toggleRightPane('table');
    fixture.detectChanges();

    for (let i = 0; i < 4; i++) {
      page.onProductAdd({
        productId: `prod-${i}`,
        productName: `Позиция ${i + 1}`,
        productSku: `SKU-${i}`,
        photoUrl: i === 1 ? '/uploads/p.webp' : undefined,
        quantity: 1,
        unit: 'шт',
        unitPrice: 1000 + i,
        discountPercent: i === 1 ? 5 : 0,
        description: `Описание ${i + 1}`,
      });
    }
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-table-editor-line-1"]'))).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-discount-1"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-optional-1"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-price-1"]')),
    ).toBeTruthy();

    const openSecond = fixture.debugElement.query(
      By.css('[data-test="kp-table-editor-row-settings-1"]'),
    );
    expect(openSecond).toBeTruthy();
    expect(openSecond.attributes['aria-expanded']).toBe('false');
    openSecond.triggerEventHandler('click');
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-row-drawer-1"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-row-drawer-0"]')),
    ).toBeNull();
    expect(openSecond.attributes['aria-expanded']).toBe('true');

    fixture.debugElement
      .query(By.css('[data-test="kp-row-density-large"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-row-emphasis-accent"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-row-separator"]'))
      .triggerEventHandler('change', { target: { checked: true } });
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-row-pagebreak"]'))
      .triggerEventHandler('change', { target: { checked: true } });
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-row-show-description"]'))
      .triggerEventHandler('change', { target: { checked: false } });
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-row-photo-contain"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    expect(page.draftLines()[1].rowPresentation).toEqual(
      expect.objectContaining({
        density: 'large',
        emphasis: 'accent',
        separatorBefore: true,
        pageBreakBefore: true,
        showDescription: false,
        photoFit: 'contain',
      }),
    );

    // Commerce still visible while drawer open.
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-discount-1"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-price-1"]')),
    ).toBeTruthy();

    // One-at-a-time: opening another closes the first.
    fixture.debugElement
      .query(By.css('[data-test="kp-table-editor-row-settings-2"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-row-drawer-1"]')),
    ).toBeNull();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-row-drawer-2"]')),
    ).toBeTruthy();

    // Close drawer — indicator remains for custom row.
    fixture.debugElement
      .query(By.css('[data-test="kp-table-editor-row-settings-2"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-editor-row-drawer-2"]')),
    ).toBeNull();
    expect(
      fixture.debugElement.query(
        By.css(
          '[data-test="kp-table-editor-row-settings-1"] [data-test="kp-table-editor-row-indicator"]',
        ),
      ),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(
        By.css(
          '[data-test="kp-table-editor-row-settings-0"] [data-test="kp-table-editor-row-indicator"]',
        ),
      ),
    ).toBeNull();

    // Reorder keeps presentation on the same product line.
    page.moveCompositionLine({ index: 1, direction: -1 });
    fixture.detectChanges();
    expect(page.draftLines()[0].productName).toBe('Позиция 2');
    expect(page.draftLines()[0].rowPresentation?.density).toBe('large');
    expect(page.draftLines()[1].rowPresentation).toBeUndefined();

    // Read-only: drawer opens for view, controls disabled.
    page.proposalStatus.set('accepted');
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-test="kp-table-editor-row-settings-0"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    const densityBtn = fixture.debugElement.query(By.css('[data-test="kp-row-density-compact"]'));
    expect(densityBtn).toBeTruthy();
    expect(densityBtn.nativeElement.disabled).toBe(true);
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-row-separator"]')).nativeElement.disabled,
    ).toBe(true);
  }));

  it('adds module/material lines by refId and merges quantity on repeat', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onProductAdd: (line: ProposalDraftLine) => void;
      removeCompositionLine: (index: number) => void;
      draftLines: () => ProposalDraftLine[];
    };

    page.onProductAdd({
      lineKind: 'module',
      productId: 'module-1',
      refId: 'module-1',
      productName: 'Каркас',
      productSku: 'MD-01',
      quantity: 2,
      unit: 'шт',
      unitPrice: 0,
    });
    page.onProductAdd({
      lineKind: 'module',
      productId: 'module-1',
      refId: 'module-1',
      productName: 'Каркас',
      quantity: 1,
      unitPrice: 0,
    });
    expect(page.draftLines()).toEqual([
      expect.objectContaining({
        lineKind: 'module',
        refId: 'module-1',
        quantity: 3,
        productName: 'Каркас',
      }),
    ]);

    page.onProductAdd({
      lineKind: 'material',
      productId: 'material-1',
      refId: 'material-1',
      productName: 'Труба',
      productSku: 'MT-1',
      quantity: 5,
      unit: 'м',
      unitPrice: 450,
    });
    expect(page.draftLines()).toHaveLength(2);
    page.removeCompositionLine(0);
    expect(page.draftLines()).toEqual([
      expect.objectContaining({ lineKind: 'material', refId: 'material-1', quantity: 5 }),
    ]);
  });

  it('adds a custom line, rebuilds it on the sheet, and includes it in persistence', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (state: { organizationId: string; orgMarkupPercent: number }) => void;
      addCustomLine: () => void;
      onCompositionLineChange: (change: {
        index: number;
        patch: Partial<ProposalDraftLine>;
      }) => void;
      draftLines: () => ProposalDraftLine[];
      saveDraft: () => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.addCustomLine();
    expect(page.draftLines()[0].productName).toBe('');
    page.onCompositionLineChange({
      index: 0,
      patch: {
        productName: 'Монтаж',
        description: 'Шеф-монтаж на площадке',
        quantity: 2,
        unitPrice: 1000,
        discountPercent: 10,
        isOptional: true,
      },
    });
    expect(page.draftLines()[0]).toEqual(
      expect.objectContaining({
        lineKind: 'custom',
        productName: 'Монтаж',
        description: 'Шеф-монтаж на площадке',
        isOptional: true,
      }),
    );

    tick(250);
    expect(buildMock).toHaveBeenLastCalledWith(
      'tpl-1',
      expect.objectContaining({
        previewLines: [
          expect.objectContaining({
            lineKind: 'custom',
            description: 'Шеф-монтаж на площадке',
            discountPercent: 10,
            isOptional: true,
          }),
        ],
      }),
    );

    page.onInspectorState({ organizationId: 'org-1', orgMarkupPercent: 0 });
    page.saveDraft();
    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            lineKind: 'custom',
            productName: 'Монтаж',
            discountPercent: 10,
            isOptional: true,
          }),
        ],
      }),
    );
    expect(quotationCreateMock.mock.calls[0][0].items[0].productId).toBeUndefined();
  }));

  it('has no savebar over A4 and exposes output on the right rail (TZ-SALES-367)', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      toggleRightPane: (pane: 'output') => void;
      autosaveLabel: { set: (value: string) => void };
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    page.autosaveLabel.set('Сохранено');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-save-bar"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-autosave-status"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-studio-status"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-order"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-save-version"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-duplicate"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-download-menu"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-center"]'))).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-toggle-output"]')),
    ).toBeTruthy();

    page.toggleRightPane('output');
    fixture.detectChanges();

    const output = fixture.debugElement.query(By.css('[data-test="kp-create-output"]'));
    expect(output).toBeTruthy();
    const labels = output
      .queryAll(By.css('button'))
      .map((btn) => (btn.nativeElement as HTMLButtonElement).textContent?.trim());
    expect(labels).toEqual(['Печать', 'PDF', 'Сохранить в архив документов']);
    expect(fixture.nativeElement.textContent).not.toContain('Сохранено');
  }));

  it('uses the canonical Принято label in the inspector unlock action', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      toggleRightPane: (pane: 'params') => void;
      proposalStatus: { set: (value: 'accepted') => void };
      autosaveLabel: { set: (value: string) => void };
    };
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    page.autosaveLabel.set('Сохранено');
    page.proposalStatus.set('accepted');
    page.toggleRightPane('params');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Снять «Принято»');
    expect(fixture.nativeElement.textContent).not.toContain('Снять «Оплачена»');
  }));

  it('persists recipient references and sends them to build', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onRecipientState: (state: {
        counterpartyId: string;
        contactPersonId: string;
        siteId: string;
      }) => void;
      saveDraft: () => void;
      organizationId: { set: (value: string) => void };
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onRecipientState({
      counterpartyId: 'cp-1',
      contactPersonId: 'person-1',
      siteId: 'site-1',
    });
    page.organizationId.set('org-1');
    tick(250);
    page.saveDraft();

    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        counterpartyId: 'cp-1',
        contactPersonId: 'person-1',
        siteId: 'site-1',
      }),
    );
    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        counterpartyId: 'cp-1',
        contactPersonId: 'person-1',
        siteId: 'site-1',
      }),
    );
  }));

  it('persists commercial fields and sends discounted totals to build', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (state: {
        organizationId: string;
        orgMarkupPercent: number;
        dealVatPercent: number;
        title: string;
        date: string;
        validUntil: string;
        discountType: 'percent';
        discountPercent: number;
        prepaymentPercent: number;
        productionDays: number;
        deliveryDays: number;
      }) => void;
      saveDraft: () => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onInspectorState({
      organizationId: 'org-1',
      orgMarkupPercent: 10,
      dealVatPercent: 20,
      title: 'КП для цеха',
      date: '2026-08-10',
      validUntil: '2026-08-20',
      discountType: 'percent',
      discountPercent: 5,
      prepaymentPercent: 30,
      productionDays: 7,
      deliveryDays: 3,
    });
    tick(250);
    page.saveDraft();

    expect(quotationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'КП для цеха',
        date: '2026-08-10',
        validUntil: '2026-08-20',
        vatPercent: 20,
        discountType: 'percent',
        discountPercent: 5,
        prepaymentPercent: 30,
        productionDays: 7,
        deliveryDays: 3,
      }),
    );
    expect(buildMock).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({
        dealTotals: expect.objectContaining({
          vatPercent: 20,
          discountType: 'percent',
          discountPercent: 5,
        }),
      }),
    );
  }));

  it('печать при готовом превью без фирмы не требует фирму и не форсит сохранение (TZ-SALES-368)', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      requestOutput: (action: 'pdf' | 'print' | 'archive') => void;
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
    };
    const center = (page as unknown as { templateCenter?: { printPreview: () => void } })
      .templateCenter;
    expect(center).toBeDefined();
    const printSpy = jest.spyOn(center!, 'printPreview');

    // Готовое превью без выбранной фирмы (organizationId пустой).
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();

    page.requestOutput('print');

    expect(printSpy).toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(quotationCreateMock).not.toHaveBeenCalled();
  }));

  it('печать без превью показывает короткий тост без слова «фирма»', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      requestOutput: (action: 'pdf' | 'print' | 'archive') => void;
    };

    page.requestOutput('print');

    expect(toastErrorMock).toHaveBeenCalledWith('Превью листа ещё не готово.');
    expect(toastErrorMock.mock.calls.flat().join(' ')).not.toContain('фирма');
  });

  it('PDF без черновика и фирмы даёт отдельное сообщение, не общий тост печати', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      requestOutput: (action: 'pdf' | 'print' | 'archive') => void;
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
    };
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();

    page.requestOutput('pdf');

    expect(toastErrorMock).toHaveBeenCalledWith(
      'Для PDF нужны шаблон, готовое превью и наша фирма.',
    );
    expect(toastErrorMock).not.toHaveBeenCalledWith(
      'Дождитесь готового превью и выберите нашу фирму.',
    );
    expect(quotationCreateMock).not.toHaveBeenCalled();
  }));

  it('Архив без черновика и фирмы даёт отдельное сообщение', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      requestOutput: (action: 'pdf' | 'print' | 'archive') => void;
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
    };
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();

    page.requestOutput('archive');

    expect(toastErrorMock).toHaveBeenCalledWith(
      'Для архива нужны шаблон, готовое превью и наша фирма.',
    );
    expect(quotationCreateMock).not.toHaveBeenCalled();
  }));
});
