import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ProposalCreatePage } from './proposal-create.page';
import { calculateKpPreviewScale } from './proposal-create-template-center.component';
import { AuthService } from '../../../core/auth.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { ProductsService } from '../../../shared/services/products.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { ProposalDraftLine } from './proposal-product-rail.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

describe('ProposalCreatePage (TZ-SALES-317 shell + TZ-SALES-319 build preview)', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;
  const buildMock = jest.fn();
  const tableFindMock = jest.fn();

  beforeEach(async () => {
    buildMock.mockReset();
    buildMock.mockReturnValue(
      of({
        ok: true,
        data: '<html><head></head><body><div class="doc-bg" data-test="DATA_TEST_BUILD_OK"><img src="/uploads/bg.png" alt=""></div></body></html>',
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
          },
        },
        {
          provide: TemplateBlocksService,
          useValue: {
            listByTemplate: () =>
              of({
                ok: true,
                data: [
                  {
                    type: 'table',
                    settings: { tableTemplateId: 'table-1', kpLineItems: true },
                  },
                ],
              }),
          },
        },
        {
          provide: TableTemplatesService,
          useValue: { findById: tableFindMock },
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

  it('opens a separate Table rail pane with the polished column controls', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      toggleRightPane: (pane: 'params' | 'table') => void;
    };
    page.toggleRightPane('table');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-table"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-insp-markup"]'))).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Видна');
    expect(fixture.nativeElement.textContent).toContain('Открыть шаблон таблицы');
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-left-productName"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-table-right-productName"]')),
    ).toBeTruthy();
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
          { key: 'productName', visible: true },
          { key: 'sum', visible: true },
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
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-name"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('упрощённое');
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
          { key: 'productName', visible: true },
          { key: 'sum', visible: true },
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
          { key: 'productName', visible: false },
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
        dealTotals: { vatPercent: 20 },
      }),
    );
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
  }));
});
