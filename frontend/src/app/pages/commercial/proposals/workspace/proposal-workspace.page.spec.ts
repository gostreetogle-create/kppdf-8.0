import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import {
  ContactRound,
  FileText,
  Package,
  Printer,
  ScrollText,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-angular';

import { AuthService } from '../../../../core/auth.service';
import { PiChromeToolsService } from '../../../../shared/chrome/pi-chrome-tools.service';
import { PiToastService } from '../../../../shared/ui/toast';
import { OrdersService } from '../../../../shared/services/orders.service';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { ProductsService } from '../../../../shared/services/products.service';
import { ProductModulesService } from '../../../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../../../shared/services/materials.service';
import { CounterpartyService } from '../../../../shared/services/pi-counterparty.service';
import { PersonsService } from '../../../../shared/services/pi-persons.service';
import { SiteService } from '../../../../shared/services/pi-site.service';
import { DocumentTemplatesService } from '../../../../shared/services/pi-document-templates.service';
import { TemplateBlocksService } from '../../../../shared/services/pi-template-blocks.service';
import { TableTemplatesService } from '../../../../shared/services/pi-table-templates.service';
import { GeneratedDocumentsService } from '../../../../shared/services/pi-generated-documents.service';
import { PiDialogService } from '../../../../shared/ui/dialog/pi-dialog.service';
import { OrganizationsService } from '../../../../shared/services/organizations.service';
import { TextBlocksService } from '../../../../shared/services/pi-text-blocks.service';
import { TextBlockCategoriesService } from '../../../../shared/services/pi-text-block-categories.service';
import { ProposalsService } from '../../../../shared/services/pi-proposals.service';
import { ProposalWorkspacePage } from './proposal-workspace.page';
import { ProposalWorkspaceStore } from './proposal-workspace.store';
import { ProposalWorkspaceDraftService } from './proposal-workspace-draft.service';

const EMPTY_LIST = () => of({ ok: true, data: { items: [], total: 0 } });

describe('ProposalWorkspacePage', () => {
  let fixture: ComponentFixture<ProposalWorkspacePage>;
  let chromeTools: PiChromeToolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspacePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: signal({ pages: ['proposals'] }) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        // Data services for mounted left panels (catalog / template / recipient).
        {
          provide: ProductsService,
          useValue: {
            list: EMPTY_LIST,
            findById: jest.fn(() => of({ ok: true, data: { _id: 'prod-1', name: 'Стенд' } })),
            update: jest.fn(),
            duplicate: jest.fn(),
          },
        },
        { provide: ProductModulesService, useValue: { list: EMPTY_LIST, findById: jest.fn() } },
        { provide: MaterialsService, useValue: { list: EMPTY_LIST, findById: jest.fn() } },
        { provide: CategoriesService, useValue: { list: EMPTY_LIST } },
        {
          provide: CounterpartyService,
          useValue: { list: EMPTY_LIST, quickCreateParty: jest.fn() },
        },
        { provide: PersonsService, useValue: { list: EMPTY_LIST } },
        { provide: SiteService, useValue: { listByCounterparty: EMPTY_LIST } },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: EMPTY_LIST,
            findById: jest.fn(),
            build: jest.fn(() => of({ ok: true, data: '<html/>' })),
          },
        },
        {
          provide: ProposalsService,
          useValue: { findById: jest.fn(), create: jest.fn(), update: jest.fn() },
        },
        { provide: OrdersService, useValue: { findById: jest.fn() } },
        { provide: OrganizationsService, useValue: { list: EMPTY_LIST } },
        {
          provide: TemplateBlocksService,
          useValue: { listByTemplate: jest.fn(() => of({ ok: true, data: [] })) },
        },
        {
          provide: TextBlocksService,
          useValue: { list: jest.fn(() => of({ ok: true, data: { items: [], total: 0 } })) },
        },
        {
          provide: TextBlockCategoriesService,
          useValue: { list: jest.fn(() => of({ ok: true, data: [] })) },
        },
        { provide: TableTemplatesService, useValue: { findById: jest.fn() } },
        {
          provide: GeneratedDocumentsService,
          useValue: { archiveQuotation: jest.fn(() => of({ ok: true })) },
        },
        {
          provide: PiDialogService,
          useValue: {
            open: jest.fn(() => ({
              closed: computed(() => undefined),
              close: jest.fn(),
            })),
          },
        },
        {
          provide: PiToastService,
          useValue: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
        },
      ],
    }).compileComponents();

    chromeTools = TestBed.inject(PiChromeToolsService);
    fixture = TestBed.createComponent(ProposalWorkspacePage);
    fixture.detectChanges();
  });

  afterEach(() => {
    chromeTools.clear('proposal-workspace');
  });

  it('registers left rail: Каталог · Шаблон · Клиент with unique Lucide icons and RU labels', () => {
    const left = chromeTools.leftTools();
    expect(left.map((t) => t.id)).toEqual(['catalog', 'template', 'recipient']);
    expect(left.map((t) => t.title)).toEqual(['Каталог', 'Шаблон', 'Клиент']);
    expect(left.map((t) => t.icon)).toEqual([Package, FileText, ContactRound]);
  });

  it('registers right rail: Параметры · Редактор таблицы · Условия · Вывод', () => {
    const right = chromeTools.rightTools();
    expect(right.map((t) => t.id)).toEqual(['params', 'table', 'terms', 'output']);
    expect(right.map((t) => t.title)).toEqual([
      'Параметры',
      'Редактор таблицы',
      'Условия',
      'Вывод',
    ]);
    expect(right.map((t) => t.icon)).toEqual([
      SlidersHorizontal,
      TableProperties,
      ScrollText,
      Printer,
    ]);
  });

  it('uses 7 distinct icons — no duplicate Template vs Terms (dedup IA)', () => {
    const icons = [...chromeTools.leftTools(), ...chromeTools.rightTools()].map((t) => t.icon);
    expect(new Set(icons).size).toBe(7);
  });

  it('clicking catalog tool opens the panel with the catalog vitrine (tier-wide)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const catalog = chromeTools.leftTools().find((t) => t.id === 'catalog')!;
    catalog.onClick();
    fixture.detectChanges();

    expect(store.panelOpen()).toBe(true);
    expect(store.activeSection()).toBe('catalog');
    expect(fixture.nativeElement.querySelector('[data-test="kp-product-rail"]')).not.toBeNull();
    const panel = fixture.nativeElement.querySelector(
      '[data-test="kp-tools-panel"]',
    ) as HTMLElement;
    expect(panel.classList.contains('kp-ws-panel--wide')).toBe(true);
  });

  it('repeat click on the same section collapses the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const terms = chromeTools.rightTools().find((t) => t.id === 'terms')!;
    terms.onClick();
    expect(store.panelOpen()).toBe(true);
    terms.onClick();
    expect(store.panelOpen()).toBe(false);
  });

  it('clicking the A4 sheet closes the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('params');
    fixture.detectChanges();
    expect(store.panelOpen()).toBe(true);

    const sheet = fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]') as HTMLElement;
    sheet.click();
    fixture.detectChanges();
    expect(store.panelOpen()).toBe(false);
  });

  it('Escape key closes the panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('table');
    expect(store.panelOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(store.panelOpen()).toBe(false);
  });

  it('does not register demo-only sections (composition / client split per IA)', () => {
    const ids = [...chromeTools.leftTools(), ...chromeTools.rightTools()].map((t) => t.id);
    expect(ids).not.toContain('composition');
    expect(ids).not.toContain('client');
  });

  it('mounts the template picker in the Шаблон panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('template');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-tpl-picker"]')).not.toBeNull();
  });

  it('mounts the recipient panel in the Клиент section', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('recipient');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-recipient-panel"]')).not.toBeNull();
  });

  it('mounts the params inspector in the Параметры section', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('params');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-create-inspector"]')).not.toBeNull();
  });

  it('mounts the table editor as tier-L wide overlay without A4 reflow', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('table');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-table-editor"]')).not.toBeNull();
    const panel = fixture.nativeElement.querySelector(
      '[data-test="kp-tools-panel"]',
    ) as HTMLElement;
    expect(panel.classList.contains('kp-ws-panel--wide')).toBe(true);
    // overlay only — the A4 sheet host keeps its own size (no inline reflow)
    const sheet = fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]');
    expect(sheet).not.toBeNull();
  });

  it('adds a custom line from the table editor footer (parity with create)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const draft = fixture.componentInstance['draft'] as ProposalWorkspaceDraftService;
    store.openSection('table');
    fixture.detectChanges();
    const before = draft.draftLines().length;

    const add = fixture.nativeElement.querySelector(
      '[data-test="kp-table-editor-add-custom"]',
    ) as HTMLElement;
    add.click();
    fixture.detectChanges();

    expect(draft.draftLines()).toHaveLength(before + 1);
    expect(draft.draftLines()[before].lineKind).toBe('custom');
  });

  it('mounts the terms panel and opens the library without leaving workspace', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('terms');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-terms-panel"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-terms-add"]')).not.toBeNull();

    const libToggle = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test="kp-terms-panel"] button'),
    ).find((b) => (b as HTMLElement).textContent?.includes('Взять из библиотеки')) as HTMLElement;
    libToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-terms-library"]')).not.toBeNull();
  });

  it('output panel mounts print/PDF/archive gates matching create (canon 368)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('output');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-create-output"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-output-print"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-output-pdf"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-output-archive"]')).not.toBeNull();
  });

  it('catalog review modal opens on table exit with dirty rows and resumes on resolve', () => {
    const draft = fixture.componentInstance['draft'] as ProposalWorkspaceDraftService;
    draft.draftLines.set([
      {
        lineKind: 'catalog',
        productId: 'prod-1',
        productName: 'Стенд',
        quantity: 1,
        unit: 'шт',
        unitPrice: 100,
        catalogDirtyFields: ['productName'],
      },
    ]);
    let exited = false;

    draft.requestTableExit(() => {
      exited = true;
    });
    fixture.detectChanges();

    expect(draft.catalogReviewOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.kp-catalog-review')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-catalog-review-row-0"]'),
    ).not.toBeNull();

    const kpOnly = fixture.nativeElement.querySelector(
      '[data-test="kp-catalog-review-kp-only-0"]',
    ) as HTMLElement;
    kpOnly.click();
    fixture.detectChanges();

    expect(draft.catalogReviewOpen()).toBe(false);
    expect(exited).toBe(true);
  });

  it('Escape does NOT close the catalog review modal (formal exception KP-CATALOG-REVIEW-NO-ESC)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const draft = fixture.componentInstance['draft'] as ProposalWorkspaceDraftService;
    draft.draftLines.set([
      {
        lineKind: 'catalog',
        productId: 'prod-1',
        productName: 'Стенд',
        quantity: 1,
        unit: 'шт',
        unitPrice: 100,
        catalogDirtyFields: ['productName'],
      },
    ]);
    store.openSection('table');
    fixture.detectChanges();
    draft.requestTableExit(() => undefined);
    fixture.detectChanges();
    expect(draft.catalogReviewOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(draft.catalogReviewOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.kp-catalog-review')).not.toBeNull();
  });
});
