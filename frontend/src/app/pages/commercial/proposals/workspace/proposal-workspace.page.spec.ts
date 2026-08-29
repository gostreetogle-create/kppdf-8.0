import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import {
  CircleDollarSign,
  Clock,
  ContactRound,
  FileText,
  Package,
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
import { DesktopPairingService } from '../../../../shared/services/pi-desktop-pairing.service';
import { ProposalWorkspacePage } from './proposal-workspace.page';
import { ProposalWorkspaceStore } from './proposal-workspace.store';
import { ProposalWorkspaceDraftService } from './proposal-workspace-draft.service';

const EMPTY_LIST = () => of({ ok: true, data: { items: [], total: 0 } });

describe('ProposalWorkspacePage', () => {
  let fixture: ComponentFixture<ProposalWorkspacePage>;
  let chromeTools: PiChromeToolsService;
  const dialogOpenMock = jest.fn();
  const dialogCloseValue = signal<unknown>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspacePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
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
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            duplicate: jest.fn(),
          },
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
            open: dialogOpenMock.mockImplementation(() => ({
              closed: computed(() => dialogCloseValue()),
              close: jest.fn(),
            })),
          },
        },
        {
          provide: PiToastService,
          useValue: { error: jest.fn(), success: jest.fn(), warning: jest.fn(), show: jest.fn() },
        },
        {
          provide: DesktopPairingService,
          useValue: {
            list: jest.fn(() => of({ ok: true, data: [] })),
            issue: jest.fn(),
            revoke: jest.fn(),
            compat: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    chromeTools = TestBed.inject(PiChromeToolsService);
    fixture = TestBed.createComponent(ProposalWorkspacePage);
    fixture.detectChanges();
  });

  afterEach(() => {
    chromeTools.clear('proposal-workspace');
    dialogCloseValue.set(undefined);
  });

  it('shows empty A4 placeholder and opens template panel when no template is selected', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-empty-state"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]')).not.toBeNull();
    expect(store.panelOpen()).toBe(true);
    expect(store.activeSection()).toBe('template');
  });

  it('registers left rail: Каталог · Шаблон · Клиент with unique Lucide icons and RU labels', () => {
    const left = chromeTools.leftTools();
    expect(left.map((t) => t.id)).toEqual(['catalog', 'template', 'recipient']);
    expect(left.map((t) => t.title)).toEqual(['Каталог', 'Шаблон', 'Клиент']);
    expect(left.map((t) => t.icon)).toEqual([Package, FileText, ContactRound]);
  });

  it('registers right rail: Параметры · Деньги · Сроки · Таблица · Условия', () => {
    const right = chromeTools.rightTools();
    expect(right.map((t) => t.id)).toEqual(['params', 'money', 'deadlines', 'table', 'terms']);
    expect(right.map((t) => t.title)).toEqual([
      'Параметры',
      'Деньги',
      'Сроки',
      'Редактор таблицы',
      'Условия',
    ]);
    expect(right.map((t) => t.icon)).toEqual([
      SlidersHorizontal,
      CircleDollarSign,
      Clock,
      TableProperties,
      ScrollText,
    ]);
  });

  it('uses 8 distinct icons — no duplicate Template vs Terms (dedup IA)', () => {
    const icons = [...chromeTools.leftTools(), ...chromeTools.rightTools()].map((t) => t.icon);
    expect(new Set(icons).size).toBe(8);
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

  it('clicking empty A4 sheet keeps template panel open', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('params');
    fixture.detectChanges();

    const sheet = fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]') as HTMLElement;
    sheet.click();
    fixture.detectChanges();
    expect(store.panelOpen()).toBe(true);
    expect(store.activeSection()).toBe('template');
  });

  it('clicking the A4 sheet closes the panel when template preview is loaded', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const draft = fixture.componentInstance['draft'] as ProposalWorkspaceDraftService;
    draft.selectedTemplate.set({ _id: 'tpl-1', name: 'Test' } as never);
    store.openSection('params');
    fixture.detectChanges();

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

  it('TZ-KP-WS-405: «Фон» without template shows toast instead of silent no-op', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const toast = TestBed.inject(PiToastService) as { show: jest.Mock };
    store.openSection('template');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector(
      '[data-test="kp-ws-template-bg-label"]',
    ) as HTMLElement;
    expect(label.classList.contains('kp-ws-tpl-actions__bg--disabled')).toBe(true);
    label.click();
    expect(toast.show).toHaveBeenCalledWith('Сначала выберите шаблон в списке ниже');
  });

  it('mounts the template picker in the Шаблон panel', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('template');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-tpl-picker"]')).not.toBeNull();
  });

  it('TZ-KP-WS-406: template panel shows the AI-from-file section with pairing CTA (no keys)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('template');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('[data-test="kp-ws-ai-draft"]');
    expect(section).not.toBeNull();
    expect(section.textContent).toContain('Из файла (AI)');
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-ws-ai-pairing-cta"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-ai-create-cta"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-ai-todos-badge"]')).toBeNull();
  });

  it('TZ-KP-WS-406: ?templateDraft= opens the template panel preselected on the draft', async () => {
    // Fresh component with the MCP href query param.
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspacePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: { user: signal({ pages: ['proposals'] }) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'templateDraft' ? 'draft-42' : null),
              },
            },
          },
        },
        { provide: ProductsService, useValue: { list: EMPTY_LIST, findById: jest.fn() } },
        { provide: ProductModulesService, useValue: { list: EMPTY_LIST } },
        { provide: MaterialsService, useValue: { list: EMPTY_LIST } },
        { provide: CategoriesService, useValue: { list: EMPTY_LIST } },
        { provide: CounterpartyService, useValue: { list: EMPTY_LIST } },
        { provide: PersonsService, useValue: { list: EMPTY_LIST } },
        { provide: SiteService, useValue: { listByCounterparty: EMPTY_LIST } },
        {
          provide: DocumentTemplatesService,
          useValue: { list: EMPTY_LIST, findById: jest.fn(), build: jest.fn() },
        },
        { provide: ProposalsService, useValue: { findById: jest.fn() } },
        { provide: OrdersService, useValue: { findById: jest.fn() } },
        { provide: OrganizationsService, useValue: { list: EMPTY_LIST } },
        { provide: TemplateBlocksService, useValue: { listByTemplate: jest.fn() } },
        { provide: TextBlocksService, useValue: { list: jest.fn() } },
        { provide: TextBlockCategoriesService, useValue: { list: jest.fn() } },
        { provide: TableTemplatesService, useValue: { findById: jest.fn() } },
        { provide: GeneratedDocumentsService, useValue: { archiveQuotation: jest.fn() } },
        { provide: PiDialogService, useValue: { open: dialogOpenMock } },
        { provide: PiToastService, useValue: { error: jest.fn(), success: jest.fn() } },
        {
          provide: DesktopPairingService,
          useValue: { list: jest.fn(() => of({ ok: true, data: [] })) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalWorkspacePage);
    fixture.detectChanges();
    const store2 = fixture.componentInstance['store'] as ProposalWorkspaceStore;

    expect(store2.templateDraftId()).toBe('draft-42');
    expect(store2.panelOpen()).toBe(true);
    expect(store2.activeSection()).toBe('template');
    expect(fixture.nativeElement.querySelector('[data-test="kp-tpl-picker"]')).not.toBeNull();
  });

  it('TZ-KP-WS-406: paired desktop shows create-draft button + manual link (not /import-todos dead-end)', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspacePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: { user: signal({ pages: ['proposals'] }) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        { provide: ProductsService, useValue: { list: EMPTY_LIST, findById: jest.fn() } },
        { provide: ProductModulesService, useValue: { list: EMPTY_LIST } },
        { provide: MaterialsService, useValue: { list: EMPTY_LIST } },
        { provide: CategoriesService, useValue: { list: EMPTY_LIST } },
        { provide: CounterpartyService, useValue: { list: EMPTY_LIST } },
        { provide: PersonsService, useValue: { list: EMPTY_LIST } },
        { provide: SiteService, useValue: { listByCounterparty: EMPTY_LIST } },
        {
          provide: DocumentTemplatesService,
          useValue: { list: EMPTY_LIST, findById: jest.fn(), build: jest.fn() },
        },
        { provide: ProposalsService, useValue: { findById: jest.fn() } },
        { provide: OrdersService, useValue: { findById: jest.fn() } },
        { provide: OrganizationsService, useValue: { list: EMPTY_LIST } },
        { provide: TemplateBlocksService, useValue: { listByTemplate: jest.fn() } },
        { provide: TextBlocksService, useValue: { list: jest.fn() } },
        { provide: TextBlockCategoriesService, useValue: { list: jest.fn() } },
        { provide: TableTemplatesService, useValue: { findById: jest.fn() } },
        { provide: GeneratedDocumentsService, useValue: { archiveQuotation: jest.fn() } },
        {
          provide: PiDialogService,
          useValue: {
            open: dialogOpenMock.mockImplementation(() => ({
              closed: computed(() => dialogCloseValue()),
              close: jest.fn(),
            })),
          },
        },
        {
          provide: PiToastService,
          useValue: { error: jest.fn(), success: jest.fn(), warning: jest.fn(), show: jest.fn() },
        },
        {
          provide: DesktopPairingService,
          useValue: {
            list: jest.fn(() => of({ ok: true, data: [{ id: 'k1', revokedAt: null }] })),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalWorkspacePage);
    fixture.detectChanges();

    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('template');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-ai-pairing-cta"]')).toBeNull();
    const createBtn = fixture.nativeElement.querySelector('[data-test="kp-ws-ai-create-cta"]');
    expect(createBtn).not.toBeNull();
    expect(createBtn.tagName).toBe('APP-PI-BUTTON');
    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-ai-manual-cta"]')).not.toBeNull();

    createBtn.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(dialogOpenMock).toHaveBeenCalled();
    const [component] = dialogOpenMock.mock.calls.at(-1);
    expect(component.name).toContain('AiDraftDialog');
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

    const libToggle = fixture.nativeElement.querySelector(
      '[data-test="kp-terms-library-toggle"]',
    ) as HTMLElement;
    libToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-terms-library"]')).not.toBeNull();
  });

  it('terms panel mounts the inline text-block create action (TZ-405)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('terms');
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[data-test="kp-terms-library-toggle"]') as HTMLElement
    ).click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-ws-text-block-create"]'),
    ).not.toBeNull();
  });

  it('clicking Создать текстовый блок opens the editor dialog and bumps library refresh on save (TZ-405)', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    const page = fixture.componentInstance as unknown as {
      textBlocksVersion: { (): number; update: (fn: (v: number) => number) => void };
    };
    store.openSection('terms');
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[data-test="kp-terms-library-toggle"]') as HTMLElement
    ).click();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '[data-test="kp-ws-text-block-create"]',
    ) as HTMLElement;
    const before = page.textBlocksVersion();
    button.click();
    fixture.detectChanges();

    expect(dialogOpenMock).toHaveBeenCalled();
    const [component] = dialogOpenMock.mock.calls.at(-1);
    expect(component.name).toContain('WorkspaceTextBlockDialog');
    expect(page.textBlocksVersion()).toBe(before); // no refresh until save closes

    dialogCloseValue.set({ _id: 'tb-1', name: 'Новый блок' });
    fixture.detectChanges();
    expect(page.textBlocksVersion()).toBe(before + 1);
  });

  it('money and deadlines panels mount as separate S-tier inspector modes', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('money');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-insp-discount"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-insp-org"]')).toBeNull();

    store.openSection('deadlines');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="kp-insp-terms"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-insp-discount"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-insp-sheet-layout"]')).toBeNull();
  });

  it('does not register an output rail tool; output actions remain on ribbon', () => {
    const right = chromeTools.rightTools();
    expect(right.some((tool) => tool.id === 'output')).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-test="kp-ribbon-print"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-ribbon-pdf"]')).not.toBeNull();
  });

  it('ribbon exposes Печать and PDF without opening the Вывод panel (canon: demo ribbon)', () => {
    const ribbon = fixture.nativeElement.querySelector('[data-test="kp-workspace-ribbon"]');
    const print = ribbon.querySelector('[data-test="kp-ribbon-print"]');
    const pdf = ribbon.querySelector('[data-test="kp-ribbon-pdf"]');
    expect(print).not.toBeNull();
    expect(pdf).not.toBeNull();
    // Single gold CTA: gold lives in the ribbon, the panel copy stays neutral.
    expect(pdf.className).toContain('kp-ws-ribbon-btn--gold');
  });

  it('ribbon PDF/Печать delegate to the same output gate as the panel', () => {
    const draft = fixture.componentInstance['draft'] as ProposalWorkspaceDraftService;
    const spy = jest.spyOn(draft, 'requestOutput').mockImplementation(() => {});
    const ribbon = fixture.nativeElement.querySelector('[data-test="kp-workspace-ribbon"]');

    (ribbon.querySelector('[data-test="kp-ribbon-print"]') as HTMLElement).click();
    (ribbon.querySelector('[data-test="kp-ribbon-pdf"]') as HTMLElement).click();

    expect(spy).toHaveBeenNthCalledWith(1, 'print');
    expect(spy).toHaveBeenNthCalledWith(2, 'pdf');
    spy.mockRestore();
  });

  it('MECH-505: params panel exposes duplicate action and ribbon has Ещё menu', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('params');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-duplicate"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="kp-ws-ribbon-more"]')).not.toBeNull();
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

  it('TZ-KP-MECH-502: template and params panels show IA hint lines', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;

    store.openSection('template');
    fixture.detectChanges();
    const templateHint = fixture.nativeElement.querySelector('[data-test="kp-hint-template"]');
    expect(templateHint).not.toBeNull();
    expect(templateHint.textContent).toContain('Эталон бланка');

    store.openSection('params');
    fixture.detectChanges();
    const paramsHint = fixture.nativeElement.querySelector('[data-test="kp-hint-params"]');
    expect(paramsHint).not.toBeNull();
    expect(paramsHint.textContent).toContain('Параметры этого коммерческого предложения');
  });

  it('TZ-KP-MECH-502: table panel shows IA hint line', () => {
    const store = fixture.componentInstance['store'] as ProposalWorkspaceStore;
    store.openSection('table');
    fixture.detectChanges();

    const tableHint = fixture.nativeElement.querySelector('[data-test="kp-hint-table"]');
    expect(tableHint).not.toBeNull();
    expect(tableHint.textContent).toContain('Пресет таблицы');
  });
});
