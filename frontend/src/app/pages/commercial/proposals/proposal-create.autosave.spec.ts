import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { API_BASE_URL } from '../../../core/api.tokens';
import { ProductsService } from '../../../shared/services/products.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { CounterpartyService } from '../../../shared/services/pi-counterparty.service';
import {
  DocumentTemplatesService,
  type DocumentTemplate,
} from '../../../shared/services/pi-document-templates.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { ProposalsService } from '../../../shared/services/pi-proposals.service';
import { GeneratedDocumentsService } from '../../../shared/services/pi-generated-documents.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { ProductModulesService } from '../../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../../shared/services/materials.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { ProposalCreatePage } from './proposal-create.legacy.page';
import type { ProposalDraftLine } from './proposal-product-rail.component';

interface AutosaveHarness {
  onTemplateChange(template: DocumentTemplate | null): void;
  onInspectorState(state: { organizationId: string; orgMarkupPercent: number }): void;
  onProductAdd(line: ProposalDraftLine): void;
  saveDraft(): void;
}

describe('ProposalCreatePage A4 autosave characterization', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;
  let quotationCreate: jest.Mock;
  let quotationUpdate: jest.Mock;

  beforeEach(async () => {
    localStorage.clear();
    quotationCreate = jest.fn(() =>
      of({ ok: true, data: { _id: 'q-retry', number: 'KP-RETRY', status: 'draft' } }),
    );
    quotationUpdate = jest.fn(() => of({ ok: false, error: { status: 404 } }));

    await TestBed.configureTestingModule({
      imports: [ProposalCreatePage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: ProductsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: OrganizationsService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: () => of({ ok: true, data: { _id: 'tpl-1', name: 'КП' } }),
            build: () => of({ ok: true, data: '<html><body>preview</body></html>' }),
          },
        },
        {
          provide: TemplateBlocksService,
          useValue: { listByTemplate: () => of({ ok: true, data: [] }) },
        },
        {
          provide: TableTemplatesService,
          useValue: { findById: () => of({ ok: false, error: new Error('not found') }) },
        },
        {
          provide: ProposalsService,
          useValue: {
            create: quotationCreate,
            update: quotationUpdate,
            findById: () => of({ ok: false, error: new Error('not found') }),
            downloadPdf: jest.fn(),
          },
        },
        { provide: GeneratedDocumentsService, useValue: { archiveQuotation: jest.fn() } },
        {
          provide: TextBlocksService,
          useValue: { list: () => of({ ok: true, data: { items: [] } }) },
        },
        {
          provide: TextBlockCategoriesService,
          useValue: { list: () => of({ ok: true, data: [] }) },
        },
        { provide: ProductModulesService, useValue: { list: () => of({ ok: true, data: [] }) } },
        { provide: MaterialsService, useValue: { list: () => of({ ok: true, data: [] }) } },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn() },
        },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
        },
      ],
    })
      .overrideComponent(ProposalCreatePage, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(ProposalCreatePage);
    fixture.detectChanges();
  });

  it('retries a stale local draft exactly once as a fresh create', fakeAsync(() => {
    localStorage.setItem('kp.create.lastDraftId', 'q-stale');
    const page = fixture.componentInstance as unknown as AutosaveHarness;
    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    page.onInspectorState({ organizationId: 'org-1', orgMarkupPercent: 0 });
    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      quantity: 1,
      unit: 'шт',
      unitPrice: 100,
    });
    tick(250);

    page.saveDraft();

    expect(quotationUpdate).toHaveBeenCalledTimes(1);
    expect(quotationUpdate).toHaveBeenCalledWith('q-stale', expect.any(Object));
    expect(quotationCreate).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('kp.create.lastDraftId')).toBe('q-retry');
  }));
});
