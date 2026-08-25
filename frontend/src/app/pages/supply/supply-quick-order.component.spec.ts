import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SupplyQuickOrderComponent } from './supply-quick-order.component';

describe('SupplyQuickOrderComponent TZ-SUPPLY-304', () => {
  /** Real seed ids from `categories.seed.ts` (24-hex, so the ObjectId path runs). */
  const COMPONENTS_CATEGORY_ID = '6a6a5aa8414225da04787cb4';
  const METALS_CATEGORY_ID = '6a6a5aa7414225da04787c2f';

  const flushLiveMaterialCategories = (
    httpMock: HttpTestingController,
    categories: { _id: string; name: string }[],
  ): void => {
    httpMock
      .expectOne((req) => req.url.includes('/categories') && req.params.get('type') === 'material')
      .flush(
        categories.map((category, index) => ({
          ...category,
          slug: `seed-${index}`,
          type: 'material',
          skuPrefix: 'SEED',
          sortOrder: index,
          isActive: true,
        })),
      );
  };

  const openOverflowOptions = (root: HTMLElement, hook: string): string[] => {
    const host = root.querySelector(`[data-test="${hook}"]`);
    (
      host?.querySelector('button[data-test="pi-overflow-select-trigger"]') as HTMLButtonElement
    )?.click();
    const options = Array.from(
      document.body.querySelectorAll('[data-test="pi-overflow-select-list"] [role="option"]'),
    ).map((option) => (option.textContent ?? '').trim());
    document.body.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    return options;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyQuickOrderComponent],
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('renders quick view with mock seed tiles by default', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      visibleRows: () => { id: string }[];
    };
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="supply-quick-order"]')).toBeTruthy();
    expect(root.querySelectorAll('[data-test^="supply-quick-tile-qo-"]').length).toBe(5);
    expect(root.textContent).toContain('Подшипник 6205');
    expect(comp.visibleRows().length).toBe(5);
  });

  it('summary is a minimal one-line grid with full date, material, status and priority', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const summary = root.querySelector(
      '[data-test="supply-quick-tile-toggle-qo-1"] .supply-quick-order__summary-text',
    ) as HTMLElement;
    expect(summary).toBeTruthy();
    expect(summary.textContent).toContain('19.08.2026');
    expect(summary.textContent).toContain('Подшипник 6205');
    expect(summary.querySelectorAll('.supply-quick-order__summary-cell').length).toBe(6);
    expect(root.querySelectorAll('[data-test="supply-quick-table-head"] > span').length).toBe(8);
    expect(root.querySelector('[data-test="supply-quick-table-head"]')?.textContent).toContain(
      'Наименование',
    );
    expect(summary.querySelector('[data-test="supply-quick-status-badge"]')).toBeTruthy();
  });

  it('create adds an expanded tile at the top', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onCreate: () => void;
      expandedId: () => string | null;
      visibleRows: () => { id: string }[];
    };
    comp.onCreate();
    fixture.detectChanges();

    const expandedId = comp.expandedId();
    expect(expandedId).toBeTruthy();
    expect(comp.visibleRows().some((r) => r.id === expandedId)).toBe(true);
    expect(comp.visibleRows().length).toBe(6);
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-tile-expanded"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="supply-quick-material-select"]'),
    ).toBeTruthy();
  });

  it('TZ-SUPPLY-306 / 431: expanded tile renders three zones A|B|C simultaneously', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      visibleRows: () => { id: string }[];
    };
    comp.toggleExpand(comp.visibleRows()[0].id);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.supply-quick-order__zone').length).toBe(3);
    expect(root.querySelector('.supply-quick-order__zone--a')).toBeTruthy();
    expect(root.querySelector('.supply-quick-order__zone--b')).toBeTruthy();
    expect(root.querySelector('.supply-quick-order__zone--c')).toBeTruthy();
    expect(root.querySelector('[data-test="supply-quick-delete"]')).toBeTruthy();
    expect(root.querySelector('[data-test="supply-quick-tile-expanded"] textarea')).toBeNull();

    for (const hook of [
      'supply-quick-category-select',
      'supply-quick-category-add',
      'supply-quick-material-select',
      'supply-quick-material-add',
      'supply-quick-material-article',
      'supply-quick-material-color',
      'supply-quick-product-url',
      'supply-quick-supplier-select',
      'supply-quick-supplier-add',
      'supply-quick-manager-select',
      'supply-quick-manager-add',
      'supply-quick-manager-email',
      'supply-quick-status-select',
      'supply-quick-priority-select',
      'supply-quick-more-toggle',
    ]) {
      expect(root.querySelector(`[data-test="${hook}"]`)).toBeTruthy();
    }
  });

  it('TZ-SUPPLY-431: expanded row shows all zones without accordion toggles', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      visibleRows: () => { id: string }[];
    };
    comp.toggleExpand(comp.visibleRows()[0].id);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="supply-quick-where-toggle"]')).toBeNull();
    expect(root.querySelector('[data-test="supply-quick-details-toggle"]')).toBeNull();
    expect(root.querySelector('[data-test="supply-quick-supplier-select"]')).toBeTruthy();
    expect(root.querySelector('[data-test="supply-quick-status-select"]')).toBeTruthy();
    expect(root.querySelectorAll('.supply-quick-order__zone').length).toBe(3);
  });

  it('TZ-SUPPLY-307: what strip has no free-text title / article inputs', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      visibleRows: () => { id: string }[];
    };
    comp.toggleExpand(comp.visibleRows()[0].id);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="supply-quick-title-input"]')).toBeNull();
    expect(
      root.querySelector('[data-test="supply-quick-material-article"]')?.textContent,
    ).toContain('6205-2RS');
    expect(root.querySelector('[data-test="supply-quick-category-add"]')).toBeTruthy();
    expect(document.body.querySelector('[data-test="supply-quick-category-panel"]')).toBeNull();
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeNull();
    expect(root.querySelector('[data-test="supply-quick-order"]')?.className).not.toContain(
      'max-w-6xl',
    );
  });

  it('TZ-SUPPLY-307: material options are filtered by the selected category', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onCategoryChange: (rowId: string, categoryId: string) => void;
      visibleRows: () => { id: string; materialId: string | null }[];
    };
    const rowId = comp.visibleRows()[0].id;
    comp.toggleExpand(rowId);
    comp.onCategoryChange(rowId, 'cat-osnastka');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const options = openOverflowOptions(root, 'supply-quick-material-select');
    expect(options).toContain('Фреза D6 твердосплавная');
    expect(options).toContain('Цанга ER16');
    expect(options).not.toContain('Подшипник 6205');
    expect(comp.visibleRows().find((r) => r.id === rowId)?.materialId).toBeNull();
  });

  it('TZ-SUPPLY-318: orphan materials are excluded from category picker', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onCategoryChange: (rowId: string, categoryId: string) => void;
      visibleRows: () => { id: string }[];
      materials: {
        update: (
          fn: (
            list: { id: string; categoryId: string; name: string; unit: string }[],
          ) => { id: string; categoryId: string; name: string; unit: string }[],
        ) => void;
      };
    };
    comp.materials.update((list) => [
      ...list,
      { id: 'mat-orphan', categoryId: '', name: 'Без категории в каталоге', unit: 'шт' },
    ]);
    const rowId = comp.visibleRows()[0].id;
    comp.toggleExpand(rowId);
    comp.onCategoryChange(rowId, 'cat-metizy');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const options = openOverflowOptions(root, 'supply-quick-material-select');
    expect(options).not.toContain('Без категории в каталоге');
    expect(options).toContain('Болт М8×40');
    expect(options).not.toContain('Подшипник 6205');
  });

  it('TZ-SUPPLY-318: mock category with no matched materials shows empty picker', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      materialOptions: (categoryId: string) => { id: string; label: string }[];
      materials: {
        set: (list: { id: string; categoryId: string; name: string; unit: string }[]) => void;
      };
    };

    comp.materials.set([
      { id: 'mat-other', categoryId: 'cat-prochee', name: 'Чужая категория', unit: 'шт' },
      { id: 'mat-orphan', categoryId: '', name: 'Осиротевший', unit: 'шт' },
    ]);
    expect(comp.materialOptions('cat-metizy').map((o) => o.label)).toEqual([]);
  });

  it('TZ-SUPPLY-311: onCategoryChange loads materials filtered by categoryId from API', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onCategoryChange: (rowId: string, categoryId: string) => void;
      materialOptions: (categoryId: string) => { id: string; label: string }[];
    };
    const liveCategoryId = '507f1f77bcf86cd799439011';
    comp.onCategoryChange('qo-1', liveCategoryId);
    fixture.detectChanges();

    const materialsReq = httpMock.expectOne(
      (req) => req.url.includes('/materials') && req.params.get('categoryId') === liveCategoryId,
    );
    materialsReq.flush({
      items: [
        {
          _id: '507f1f77bcf86cd799439012',
          categoryId: liveCategoryId,
          name: 'Лист стальной 2 мм',
          unit: 'м²',
        },
      ],
      total: 1,
      page: 1,
      limit: 500,
    });
    fixture.detectChanges();

    expect(comp.materialOptions(liveCategoryId).map((item) => item.label)).toContain(
      'Лист стальной 2 мм',
    );
    expect(comp.materialOptions(liveCategoryId).map((item) => item.label)).not.toContain(
      'Замок врезной',
    );
  });

  it('TZ-SUPPLY-307: add panel saves a material, auto-selects it and closes', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newMaterialName: { set: (v: string) => void };
      saveNewMaterial: (rowId: string) => void;
      visibleRows: () => { id: string; materialId: string | null }[];
      materialName: (id: string | null) => string;
    };
    const rowId = comp.visibleRows()[0].id;
    comp.toggleExpand(rowId);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-material-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeTruthy();
    expect(document.body.querySelector('[data-test="supply-quick-photo-stub"]')).toBeTruthy();

    comp.newMaterialName.set('Втулка бронзовая 20×26');
    comp.saveNewMaterial(rowId);
    fixture.detectChanges();

    const row = comp.visibleRows().find((r) => r.id === rowId);
    expect(row?.materialId).toBeTruthy();
    expect(comp.materialName(row?.materialId ?? null)).toBe('Втулка бронзовая 20×26');
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeNull();
    const options = openOverflowOptions(root, 'supply-quick-material-select');
    expect(options).toContain('Втулка бронзовая 20×26');
  });

  it('category panel save adds option and selects on row', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newCategoryName: { set: (v: string) => void };
      saveNewCategory: (rowId: string) => void;
      categoryLabel: (categoryId: string) => string;
      visibleRows: () => { id: string; categoryId: string; materialId: string | null }[];
      categories: () => { id: string; label: string }[];
    };
    const rowId = comp.visibleRows()[0].id;
    comp.toggleExpand(rowId);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-category-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-category-panel"]')).toBeTruthy();

    comp.newCategoryName.set('Заготовки');
    comp.saveNewCategory(rowId);
    fixture.detectChanges();

    const row = comp.visibleRows().find((r) => r.id === rowId);
    expect(row?.categoryId).toBeTruthy();
    expect(row?.materialId).toBeNull();
    expect(comp.categoryLabel(row!.categoryId)).toBe('Заготовки');
    expect(comp.categories().some((c) => c.id === row!.categoryId && c.label === 'Заготовки')).toBe(
      true,
    );
    expect(document.body.querySelector('[data-test="supply-quick-category-panel"]')).toBeNull();

    const tile = root.querySelector(`[data-test="supply-quick-tile-${rowId}"]`) as HTMLElement;
    const options = openOverflowOptions(tile, 'supply-quick-category-select');
    expect(options).toContain('Заготовки');
    expect(
      (tile.querySelector('[data-test="supply-quick-material-add"]') as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it('TZ-SUPPLY-308 / 431: expanded card is split into three zone columns', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const titles = Array.from(root.querySelectorAll('.supply-quick-order__zone-title')).map((e) =>
      (e.textContent ?? '').trim(),
    );
    expect(titles).toEqual(['A ПОЗИЦИЯ', 'B ПОСТАВЩИК И КОНТАКТ', 'C ДЕТАЛИ']);
  });

  it('TZ-SUPPLY-308: suppliers are filtered by row category, managers by supplier', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onCategoryChange: (rowId: string, categoryId: string) => void;
      visibleRows: () => { id: string; supplierId: string | null }[];
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();
    // NgModel applies value / disabled state in a microtask, so flush before DOM asserts.
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;

    const supplierOptions = openOverflowOptions(root, 'supply-quick-supplier-select');
    expect(supplierOptions).toContain('Кубаньподшипник');
    expect(supplierOptions).not.toContain('profrezi.ru');
    const managerOptions = openOverflowOptions(root, 'supply-quick-manager-select');
    expect(managerOptions).toContain('Ковалёв И. П.');
    expect(managerOptions).not.toContain('Сидоров А. Ю.');
    expect(
      (root.querySelector('[data-test="supply-quick-manager-email"]') as HTMLInputElement).value,
    ).toBe('kovalev@kubanpodshipnik.ru');
    expect(
      (root.querySelector('[data-test="supply-quick-supplier-website"]') as HTMLInputElement)
        .disabled,
    ).toBe(false);

    comp.onCategoryChange('qo-1', '');
    fixture.detectChanges();
    await fixture.whenStable();

    // SUPPLY-319: empty category = all materials/suppliers; pickers stay enabled.
    expect(comp.visibleRows().find((r) => r.id === 'qo-1')?.supplierId).toBeNull();
    expect(
      (
        root.querySelector(
          '[data-test="supply-quick-supplier-select"] button[data-test="pi-overflow-select-trigger"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(
      (root.querySelector('[data-test="supply-quick-supplier-add"]') as HTMLButtonElement).disabled,
    ).toBe(false);
    const allSuppliers = openOverflowOptions(root, 'supply-quick-supplier-select');
    expect(allSuppliers).toContain('Кубаньподшипник');
    expect(allSuppliers).toContain('profrezi.ru');
  });

  it('TZ-SUPPLY-319: empty category shows all materials; clear via «— все материалы —»', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onCategoryChange: (rowId: string, categoryId: string) => void;
      materialOptions: (categoryId: string) => { id: string; label: string }[];
      categoryOptions: () => { id: string; label: string }[];
      visibleRows: () => { id: string; categoryId: string }[];
    };

    expect(comp.categoryOptions().some((o) => o.id === '' && o.label.includes('все'))).toBe(true);

    const allLabels = comp.materialOptions('').map((o) => o.label);
    expect(allLabels).toContain('Подшипник 6205');
    expect(allLabels).toContain('Болт М8×40');
    expect(allLabels).toContain('Фреза D6 твердосплавная');

    comp.toggleExpand(comp.visibleRows()[0].id);
    comp.onCategoryChange(comp.visibleRows()[0].id, '');
    fixture.detectChanges();
    expect(comp.visibleRows()[0].categoryId).toBe('');
    const root = fixture.nativeElement as HTMLElement;
    const options = openOverflowOptions(root, 'supply-quick-material-select');
    expect(options.length).toBeGreaterThan(5);
    expect(options).toContain('Подшипник 6205');
  });

  it('TZ-SUPPLY-320: dropdown keeps only live material categories once the catalog loads', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      categoryOptions: () => { id: string; label: string }[];
      rows: () => { id: string; categoryId: string }[];
    };
    flushLiveMaterialCategories(httpMock, [
      { _id: COMPONENTS_CATEGORY_ID, name: 'Комплектующие' },
      { _id: METALS_CATEGORY_ID, name: 'Металлы' },
    ]);
    fixture.detectChanges();

    const labels = comp.categoryOptions().map((option) => option.label);
    expect(labels).toEqual(['— все материалы —', 'Комплектующие', 'Металлы']);
    expect(labels).not.toContain('Подшипники');
    expect(labels).not.toContain('Метизы');
    // Rows keyed by a dropped mock category fall back to «— все материалы —».
    expect(comp.rows().every((row) => row.categoryId === '')).toBe(true);
  });

  it('TZ-SUPPLY-320: live category lists materials from the signal before the API cache fills', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      materialOptions: (categoryId: string) => { id: string; label: string }[];
      materialPickerPlaceholder: (categoryId: string) => string;
      materials: {
        set: (list: { id: string; categoryId: string; name: string; unit: string }[]) => void;
      };
    };
    flushLiveMaterialCategories(httpMock, [{ _id: COMPONENTS_CATEGORY_ID, name: 'Комплектующие' }]);
    comp.materials.set([
      {
        id: '6a6f19759f53f007783874d8',
        categoryId: COMPONENTS_CATEGORY_ID,
        name: 'Петля сварная усиленная',
        unit: 'шт',
      },
      { id: '6a81c3ef107c9fceaf1e5c03', categoryId: '', name: 'Лист стальной 2 мм', unit: 'м²' },
    ]);
    fixture.detectChanges();

    expect(comp.materialOptions(COMPONENTS_CATEGORY_ID).map((option) => option.label)).toEqual([
      'Петля сварная усиленная',
    ]);
    expect(comp.materialPickerPlaceholder(COMPONENTS_CATEGORY_ID)).toContain('выберите материал');
    // Empty category still means the whole catalog.
    expect(comp.materialOptions('').map((option) => option.label)).toEqual([
      'Петля сварная усиленная',
      'Лист стальной 2 мм',
    ]);
  });

  it('TZ-SUPPLY-320: an empty ?categoryId= response does not blank a category that has materials', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onCategoryChange: (rowId: string, categoryId: string) => void;
      materialOptions: (categoryId: string) => { id: string; label: string }[];
      materials: {
        set: (list: { id: string; categoryId: string; name: string; unit: string }[]) => void;
      };
    };
    flushLiveMaterialCategories(httpMock, [{ _id: COMPONENTS_CATEGORY_ID, name: 'Комплектующие' }]);
    comp.materials.set([
      {
        id: '6a6f19759f53f007783874d8',
        categoryId: COMPONENTS_CATEGORY_ID,
        name: 'Петля сварная усиленная',
        unit: 'шт',
      },
    ]);
    comp.onCategoryChange('qo-1', COMPONENTS_CATEGORY_ID);
    fixture.detectChanges();

    httpMock
      .expectOne(
        (req) =>
          req.url.includes('/materials') && req.params.get('categoryId') === COMPONENTS_CATEGORY_ID,
      )
      .flush({ items: [], total: 0, page: 1, limit: 500 });
    fixture.detectChanges();

    expect(comp.materialOptions(COMPONENTS_CATEGORY_ID).map((option) => option.label)).toEqual([
      'Петля сварная усиленная',
    ]);
  });

  it('TZ-SUPPLY-308: manager select and + stay disabled until a supplier is chosen', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      (
        root.querySelector(
          '[data-test="supply-quick-manager-select"] button[data-test="pi-overflow-select-trigger"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (root.querySelector('[data-test="supply-quick-manager-add"]') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('TZ-SUPPLY-308: supplier panel creates org only and selects it for the row', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      openNewSupplier: (rowId: string) => void;
      newSupplierName: { set: (v: string) => void };
      newSupplierInn: { set: (v: string) => void };
      newSupplierWebsite: { set: (v: string) => void };
      newContactLastName: { set: (v: string) => void };
      newContactFirstName: { set: (v: string) => void };
      saveNewSupplier: (rowId: string) => void;
      saveNewManager: (rowId: string) => void;
      suppliers: () => { id: string; categoryIds: string[] }[];
      visibleRows: () => {
        id: string;
        supplierId: string | null;
        supplierContactId: string | null;
      }[];
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    comp.openNewSupplier('qo-2');
    fixture.detectChanges();
    comp.newSupplierName.set('Метизторг');
    comp.newSupplierInn.set('1234567890');
    comp.newSupplierWebsite.set('https://metiztorg.ru');
    comp.saveNewSupplier('qo-2');
    fixture.detectChanges();
    await fixture.whenStable();

    const row = comp.visibleRows().find((r) => r.id === 'qo-2');
    expect(row?.supplierId).toBeTruthy();
    expect(row?.supplierContactId).toBeNull();
    expect(root.querySelector('[data-test="supply-quick-supplier-manager-last-name"]')).toBeNull();
    // TZ-SUPPLY-311: новый поставщик больше не привязан к категории (общий справочник).
    expect(comp.suppliers().find((s) => s.id === row!.supplierId)?.categoryIds).toEqual([]);
    expect(
      (root.querySelector('[data-test="supply-quick-supplier-website"]') as HTMLInputElement).value,
    ).toBe('https://metiztorg.ru');
    expect(
      (root.querySelector('[data-test="supply-quick-manager-email"]') as HTMLInputElement).disabled,
    ).toBe(true);
    expect(
      root
        .querySelector('[data-test="supply-quick-product-url"]')
        ?.closest('.supply-quick-order__zone--a'),
    ).toBeTruthy();
    expect(
      root
        .querySelector('[data-test="supply-quick-product-url"]')
        ?.closest('.supply-quick-order__zone--b'),
    ).toBeNull();

    const supplierOptions = openOverflowOptions(root, 'supply-quick-supplier-select');
    expect(supplierOptions).toContain('Метизторг');
    expect(
      (
        root.querySelector(
          '[data-test="supply-quick-manager-select"] button[data-test="pi-overflow-select-trigger"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(
      (root.querySelector('[data-test="supply-quick-manager-add"]') as HTMLButtonElement).disabled,
    ).toBe(false);

    (root.querySelector('[data-test="supply-quick-manager-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-manager-panel"]')).toBeTruthy();
    comp.newContactLastName.set('Панов');
    comp.newContactFirstName.set('Дмитрий');
    comp.saveNewManager('qo-2');
    fixture.detectChanges();
    await fixture.whenStable();

    const updatedRow = comp.visibleRows().find((r) => r.id === 'qo-2');
    expect(updatedRow?.supplierContactId).toBeTruthy();
    const managerOptions = openOverflowOptions(root, 'supply-quick-manager-select');
    expect(managerOptions).toContain('Панов Д.');
  });

  it('TZ-SUPPLY-308: manager panel adds a second contact to the selected supplier', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newContactLastName: { set: (v: string) => void };
      saveNewManager: (rowId: string) => void;
      contactsFor: (supplierId: string | null) => { id: string; position?: string }[];
      visibleRows: () => { id: string; supplierContactId: string | null }[];
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-manager-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-manager-panel"]')).toBeTruthy();

    comp.newContactLastName.set('Тарасов');
    comp.saveNewManager('qo-1');
    fixture.detectChanges();

    const contacts = comp.contactsFor('sup-kuban');
    expect(contacts.length).toBe(3);
    expect(contacts.at(-1)?.position).toBe('Менеджер по продажам');
    expect(comp.visibleRows().find((r) => r.id === 'qo-1')?.supplierContactId).toBe(
      contacts.at(-1)?.id,
    );
    expect(document.body.querySelector('[data-test="supply-quick-manager-panel"]')).toBeNull();
    const managerOptions = openOverflowOptions(root, 'supply-quick-manager-select');
    expect(managerOptions).toContain('Тарасов');
  });

  it('TZ-SUPPLY-308: only one add panel is open at a time', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      openNewSupplier: (rowId: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-manager-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-manager-panel"]')).toBeTruthy();

    comp.openNewSupplier('qo-1');
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-manager-panel"]')).toBeNull();
    expect(document.body.querySelector('[data-test="supply-quick-supplier-panel"]')).toBeTruthy();

    (root.querySelector('[data-test="supply-quick-material-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-supplier-panel"]')).toBeNull();
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeTruthy();
  });

  it('TZ-SUPPLY-309: contact shows phone before email', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const phone = root.querySelector(
      '[data-test="supply-quick-manager-phone"]',
    ) as HTMLInputElement;
    const email = root.querySelector(
      '[data-test="supply-quick-manager-email"]',
    ) as HTMLInputElement;
    expect(phone).toBeTruthy();
    expect(phone.value).toBe('+7 918 000-11-22');
    expect(email.value).toBe('kovalev@kubanpodshipnik.ru');
    expect(phone.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('TZ-SUPPLY-309: color select lists material colors and + persists a new color', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newColorName: { set: (v: string) => void };
      saveNewColor: (rowId: string) => void;
      materials: () => { id: string; colors?: string[] }[];
      visibleRows: () => { id: string; materialId: string | null; color?: string }[];
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const options = Array.from(
      root.querySelectorAll('[data-test="supply-quick-material-color"] option'),
    ).map((o) => (o.textContent ?? '').trim());
    expect(options).toContain('чёрный');
    expect(options).toContain('белый');
    expect(options).toContain('серый');

    (root.querySelector('[data-test="supply-quick-color-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-color-panel"]')).toBeTruthy();

    comp.newColorName.set('красный');
    comp.saveNewColor('qo-2');
    fixture.detectChanges();

    expect(comp.visibleRows().find((r) => r.id === 'qo-2')?.color).toBe('красный');
    expect(comp.materials().find((m) => m.id === 'mat-zaglushka-20')?.colors).toContain('красный');
    expect(document.body.querySelector('[data-test="supply-quick-color-panel"]')).toBeNull();
  });

  it('TZ-SUPPLY-309: edit opens panel pre-filled and updates the material', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newMaterialName: { set: (v: string) => void };
      saveNewMaterial: (rowId: string) => void;
      materials: () => { id: string; name: string }[];
      visibleRows: () => { id: string; materialId: string | null }[];
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-material-edit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeTruthy();
    expect(
      (document.body.querySelector('[data-test="supply-quick-material-name"]') as HTMLInputElement)
        .value,
    ).toBe('Подшипник 6205');

    comp.newMaterialName.set('Подшипник 6205 2RS');
    comp.saveNewMaterial('qo-1');
    fixture.detectChanges();

    expect(comp.materials().find((m) => m.id === 'mat-6205')?.name).toBe('Подшипник 6205 2RS');
    expect(comp.visibleRows().find((r) => r.id === 'qo-1')?.materialId).toBe('mat-6205');
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeNull();
  });

  it('TZ-SUPPLY-309: copy clones material with «копия» prefix and opens editor', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      materials: () => { id: string; name: string }[];
      visibleRows: () => { id: string; materialId: string | null }[];
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-material-copy"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const copy = comp.materials().find((m) => m.name === 'копия Подшипник 6205');
    expect(copy).toBeTruthy();
    expect(comp.visibleRows().find((r) => r.id === 'qo-1')?.materialId).toBe(copy?.id);
    expect(document.body.querySelector('[data-test="supply-quick-material-panel"]')).toBeTruthy();
    expect(
      (document.body.querySelector('[data-test="supply-quick-material-name"]') as HTMLInputElement)
        .value,
    ).toBe('копия Подшипник 6205');
  });

  it('TZ-SUPPLY-309: summary shows the material main-photo thumbnail', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const tile = root.querySelector('[data-test="supply-quick-tile-qo-1"]') as HTMLElement;
    expect(tile.querySelector('.supply-quick-order__thumb--summary')).toBeTruthy();
  });

  it('TZ-SUPPLY-312: material color select exposes variants and persists the chosen variant', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onColorChange: (rowId: string, color: string) => void;
      visibleRows: () => { id: string; materialId: string | null; color?: string }[];
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector(
      '[data-test="supply-quick-material-color"]',
    ) as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.textContent?.trim())).toEqual([
      '—',
      'чёрный',
      'белый',
      'серый',
    ]);

    comp.onColorChange('qo-2', 'белый');
    fixture.detectChanges();
    expect(comp.visibleRows().find((row) => row.id === 'qo-2')?.color).toBe('белый');
  });

  it('TZ-SUPPLY-312: color + modal adds a variant, selects it and closes', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      newColorName: { set: (value: string) => void };
      saveNewColor: (rowId: string) => void;
      materials: () => { id: string; colors?: string[] }[];
      visibleRows: () => { id: string; materialId: string | null; color?: string }[];
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-color-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-color-panel"]')).toBeTruthy();

    comp.newColorName.set('  синий  ');
    comp.saveNewColor('qo-2');
    fixture.detectChanges();

    expect(comp.materials().find((material) => material.id === 'mat-zaglushka-20')?.colors).toEqual(
      ['чёрный', 'белый', 'серый', 'синий'],
    );
    expect(comp.visibleRows().find((row) => row.id === 'qo-2')?.color).toBe('синий');
    expect(document.body.querySelector('[data-test="supply-quick-color-panel"]')).toBeNull();
    expect(
      Array.from(
        (root.querySelector('[data-test="supply-quick-material-color"]') as HTMLSelectElement)
          .options,
      ).map((option) => option.textContent?.trim()),
    ).toContain('синий');
  });

  it('TZ-SUPPLY-315: shared dialog shell closes on Escape', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '[data-test="supply-quick-category-add"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBe('Новая категория');
    document.body
      .querySelector<HTMLElement>('.cdk-overlay-pane')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-modal"]')).toBeNull();
  });

  it('TZ-SUPPLY-310: add buttons open a modal dialog and backdrop click closes it', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector('[data-test="supply-quick-category-add"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const modal = document.body.querySelector('[data-test="supply-quick-modal"]') as HTMLElement;
    expect(modal).toBeTruthy();
    expect(document.body.querySelector('[data-test="supply-quick-category-panel"]')).toBeTruthy();

    // The shared CDK backdrop (outside the dialog) cancels and closes it.
    document.body.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-modal"]')).toBeNull();
  });

  it('TZ-SUPPLY-311: onCreate posts to /supply-requests and adopts the server id', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);

    const comp = fixture.componentInstance as unknown as {
      onCreate: () => void;
      visibleRows: () => { id: string }[];
    };
    comp.onCreate();
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === '/api/supply-requests');
    const serverId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    req.flush({ _id: serverId, status: 'in_progress', priority: 'normal', qty: 1 });

    expect(comp.visibleRows().some((r) => r.id === serverId)).toBe(true);
  });

  it('TZ-SUPPLY-312: uploads material photo through PhotosService and renders it as main thumbnail', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onMaterialPhotoFiles: (event: Event) => void;
      setEditingMainPhoto: (photoId: string) => void;
      saveNewMaterial: (rowId: string) => void;
    };
    comp.toggleExpand('qo-1');
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '[data-test="supply-quick-material-edit"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const file = new File(['image'], 'bearing.png', { type: 'image/png' });
    comp.onMaterialPhotoFiles({ target: { files: [file], value: '' } } as unknown as Event);
    const upload = httpMock.expectOne(
      (request) => request.method === 'POST' && request.url === '/api/photos/upload',
    );
    expect(upload.request.body instanceof FormData).toBe(true);
    upload.flush({
      _id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
      storageUrl: '/uploads/bearing.png',
      originalFilename: 'bearing.png',
      variants: {
        thumb: {
          _id: 'cccccccccccccccccccccccc',
          storageUrl: '/uploads/bearing.webp',
          variant: 'thumb',
        },
      },
    });
    fixture.detectChanges();

    expect(
      document.body
        .querySelector('[data-test="supply-quick-material-panel"] img')
        ?.getAttribute('src'),
    ).toBe('/uploads/bearing.webp');
    comp.setEditingMainPhoto('bbbbbbbbbbbbbbbbbbbbbbbb');
    comp.saveNewMaterial('qo-1');
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[data-test="supply-quick-tile-qo-1"] .supply-quick-order__thumb-image')
        ?.getAttribute('src'),
    ).toBe('/uploads/bearing.webp');
  });

  it('TZ-SUPPLY-312: live manager phone/email edits persist through PersonsService', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const comp = fixture.componentInstance as unknown as {
      contacts: {
        update: (
          updater: (
            items: { id: string; personId?: string }[],
          ) => { id: string; personId?: string }[],
        ) => void;
      };
      onContactFieldInput: (contactId: string, field: 'phone' | 'email', value: string) => void;
      commitContactField: (contactId: string, patch: { phone?: string; email?: string }) => void;
    };
    const personId = 'eeeeeeeeeeeeeeeeeeeeeeee';
    comp.contacts.update((contacts) =>
      contacts.map((contact) => (contact.id === 'sc-kuban-1' ? { ...contact, personId } : contact)),
    );

    comp.onContactFieldInput('sc-kuban-1', 'phone', '+7 900 123-45-67');
    comp.onContactFieldInput('sc-kuban-1', 'email', 'new@example.ru');
    httpMock.expectNone((r) => r.method === 'PATCH' && r.url === `/api/persons/${personId}`);

    comp.commitContactField('sc-kuban-1', {
      phone: '+7 900 123-45-67',
      email: 'new@example.ru',
    });

    const requests = httpMock.match(
      (r) => r.method === 'PATCH' && r.url === `/api/persons/${personId}`,
    );
    expect(requests.length).toBe(2);
    const bodies = requests.map((r) => r.request.body);
    expect(bodies).toContainEqual({ phone: '+7 900 123-45-67' });
    expect(bodies).toContainEqual({ email: 'new@example.ru' });
    for (const request of requests) {
      request.flush({
        _id: personId,
        lastName: 'Ковалёв',
        firstName: 'Игорь',
        phone: '+7 900 123-45-67',
        email: 'new@example.ru',
      });
    }
  });

  it('TZ-SUPPLY-317: selecting mock supplier fills website and email inputs', async () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      onCategoryChange: (rowId: string, categoryId: string) => void;
      onSupplierChange: (rowId: string, supplierId: string) => void;
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();
    comp.onCategoryChange('qo-2', 'cat-osnastka');
    fixture.detectChanges();
    comp.onSupplierChange('qo-2', 'sup-profrezi');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(
      (root.querySelector('[data-test="supply-quick-supplier-website"]') as HTMLInputElement).value,
    ).toBe('https://profrezi.ru');
    expect(
      (root.querySelector('[data-test="supply-quick-supplier-email"]') as HTMLInputElement).value,
    ).toBe('sales@profrezi.ru');
    expect(root.querySelector('[data-test="supply-quick-supplier-persist-hint"]')).toBeNull();
  });

  it('TZ-SUPPLY-317: valid email commits one Organization PATCH on blur', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const supplierId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const comp = fixture.componentInstance as unknown as {
      suppliers: {
        update: (
          fn: (
            list: {
              id: string;
              name: string;
              categoryIds: string[];
              website?: string;
              email?: string;
            }[],
          ) => {
            id: string;
            name: string;
            categoryIds: string[];
            website?: string;
            email?: string;
          }[],
        ) => void;
      };
      onSupplierFieldInput: (supplierId: string, field: 'website' | 'email', value: string) => void;
      onSupplierFieldBlur: (supplierId: string, field: 'website' | 'email') => void;
    };
    comp.suppliers.update((list) => [
      ...list,
      { id: supplierId, name: 'Live Org', categoryIds: [], email: 'old@example.ru' },
    ]);

    comp.onSupplierFieldInput(supplierId, 'email', 'a');
    comp.onSupplierFieldInput(supplierId, 'email', 'a@');
    comp.onSupplierFieldInput(supplierId, 'email', 'a@b.ru');
    httpMock.expectNone(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${supplierId}`,
    );

    comp.onSupplierFieldBlur(supplierId, 'email');
    const request = httpMock.expectOne(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${supplierId}`,
    );
    expect(request.request.body).toEqual({ email: 'a@b.ru' });
    request.flush({
      _id: supplierId,
      name: 'Live Org',
      inn: '1234567890',
      email: 'a@b.ru',
    });
    expect(
      (
        fixture.componentInstance as unknown as { supplierSavedHint: () => boolean }
      ).supplierSavedHint(),
    ).toBe(true);
  });

  it('TZ-SUPPLY-317: partial email mid-type does not PATCH every keystroke', () => {
    jest.useFakeTimers();
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const supplierId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
    const comp = fixture.componentInstance as unknown as {
      suppliers: {
        update: (
          fn: (
            list: { id: string; name: string; categoryIds: string[] }[],
          ) => { id: string; name: string; categoryIds: string[] }[],
        ) => void;
      };
      onSupplierFieldInput: (supplierId: string, field: 'website' | 'email', value: string) => void;
    };
    comp.suppliers.update((list) => [
      ...list,
      { id: supplierId, name: 'Debounce Org', categoryIds: [] },
    ]);

    comp.onSupplierFieldInput(supplierId, 'email', 'a');
    comp.onSupplierFieldInput(supplierId, 'email', 'a@');
    comp.onSupplierFieldInput(supplierId, 'email', 'a@b');
    httpMock.expectNone(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${supplierId}`,
    );

    jest.advanceTimersByTime(400);
    const requests = httpMock.match(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${supplierId}`,
    );
    expect(requests.length).toBeLessThanOrEqual(1);
    if (requests.length === 1) {
      expect(requests[0]!.request.body).toEqual({ email: 'a@b' });
      requests[0]!.flush({
        _id: supplierId,
        name: 'Debounce Org',
        inn: '1',
        email: 'a@b',
      });
    }
    jest.useRealTimers();
  });

  it('TZ-SUPPLY-317: findById hydrates sparse supplier on select', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const supplierId = 'cccccccccccccccccccccccc';
    const comp = fixture.componentInstance as unknown as {
      suppliers: {
        update: (
          fn: (
            list: {
              id: string;
              name: string;
              categoryIds: string[];
              website?: string;
              email?: string;
            }[],
          ) => {
            id: string;
            name: string;
            categoryIds: string[];
            website?: string;
            email?: string;
          }[],
        ) => void;
      };
      onSupplierChange: (rowId: string, supplierId: string) => void;
      supplierWebsite: (id: string | null) => string;
      supplierEmail: (id: string | null) => string;
    };
    comp.suppliers.update((list) => [
      ...list,
      { id: supplierId, name: 'Sparse Live', categoryIds: [] },
    ]);

    comp.onSupplierChange('qo-1', supplierId);

    const findReq = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === `/api/organizations/${supplierId}`,
    );
    findReq.flush({
      _id: supplierId,
      name: 'Sparse Live',
      inn: '123',
      website: 'https://sparse.example',
      email: 'orders@sparse.example',
    });
    // contacts list may also fire
    const contactReqs = httpMock.match(
      (r) => r.method === 'GET' && r.url === `/api/organizations/${supplierId}/contacts`,
    );
    for (const req of contactReqs) req.flush([]);

    expect(comp.supplierWebsite(supplierId)).toBe('https://sparse.example');
    expect(comp.supplierEmail(supplierId)).toBe('orders@sparse.example');
  });

  it('TZ-SUPPLY-317: PATCH fail shows error hook and reverts local email', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const supplierId = 'dddddddddddddddddddddddd';
    const comp = fixture.componentInstance as unknown as {
      suppliers: {
        update: (
          fn: (
            list: { id: string; name: string; categoryIds: string[]; email?: string }[],
          ) => { id: string; name: string; categoryIds: string[]; email?: string }[],
        ) => void;
      };
      onSupplierFieldInput: (supplierId: string, field: 'website' | 'email', value: string) => void;
      onSupplierFieldBlur: (supplierId: string, field: 'website' | 'email') => void;
      supplierEmail: (id: string | null) => string;
      toggleExpand: (id: string) => void;
      visibleRows: () => { id: string }[];
    };
    comp.suppliers.update((list) => [
      ...list,
      { id: supplierId, name: 'Fail Org', categoryIds: [], email: 'keep@example.ru' },
    ]);
    const rowId = comp.visibleRows()[0]!.id;
    comp.toggleExpand(rowId);
    fixture.detectChanges();

    comp.onSupplierFieldInput(supplierId, 'email', 'bad@');
    comp.onSupplierFieldBlur(supplierId, 'email');
    const request = httpMock.expectOne(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${supplierId}`,
    );
    request.flush(
      { message: 'email must be an email' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(comp.supplierEmail(supplierId)).toBe('keep@example.ru');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-test="supply-quick-supplier-save-error"]',
      ),
    ).toBeTruthy();
  });

  it('TZ-SUPPLY-312: supplier modal sends its email to Organization API', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      openNewSupplier: (rowId: string) => void;
      newSupplierName: { set: (value: string) => void };
      newSupplierInn: { set: (value: string) => void };
      newSupplierEmail: { set: (value: string) => void };
      saveNewSupplier: (rowId: string) => void;
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();
    comp.openNewSupplier('qo-2');
    fixture.detectChanges();
    comp.newSupplierName.set('Поставщик с почтой');
    comp.newSupplierInn.set('1234567890');
    comp.newSupplierEmail.set('orders@example.ru');
    comp.saveNewSupplier('qo-2');

    const request = httpMock.expectOne(
      (r) => r.method === 'POST' && r.url === '/api/organizations',
    );
    expect(request.request.body).toEqual(
      expect.objectContaining({ name: 'Поставщик с почтой', email: 'orders@example.ru' }),
    );
    request.flush({
      _id: 'dddddddddddddddddddddddd',
      name: 'Поставщик с почтой',
      inn: '1234567890',
      type: ['supplier'],
      email: 'orders@example.ru',
    });
    fixture.detectChanges();
    expect(document.body.querySelector('[data-test="supply-quick-modal"]')).toBeNull();
  });

  it('TZ-SUPPLY-310: modal save binds to the active row', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      openNewSupplier: (rowId: string) => void;
      newSupplierName: { set: (v: string) => void };
      newSupplierInn: { set: (v: string) => void };
      visibleRows: () => { id: string; supplierId: string | null }[];
    };
    comp.toggleExpand('qo-2');
    fixture.detectChanges();
    comp.openNewSupplier('qo-2');
    fixture.detectChanges();

    comp.newSupplierName.set('Метизторг Модал');
    comp.newSupplierInn.set('1234567890');
    comp.saveNewSupplier('qo-2');
    fixture.detectChanges();

    expect(comp.visibleRows().find((r) => r.id === 'qo-2')?.supplierId).toBeTruthy();
    expect(document.body.querySelector('[data-test="supply-quick-modal"]')).toBeNull();
  });

  it('TZ-SUPPLY-431: single contact auto-selected on supplier change', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onSupplierChange: (rowId: string, supplierId: string) => void;
      visibleRows: () => { id: string; supplierContactId: string | null }[];
    };
    comp.onSupplierChange('qo-2', 'sup-profrezi');
    fixture.detectChanges();
    const row = comp.visibleRows().find((r) => r.id === 'qo-2');
    expect(row?.supplierContactId).toBeTruthy();
  });

  it('TZ-SUPPLY-431: promote org merges supplier type via PATCH', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();
    const httpMock = TestBed.inject(HttpTestingController);
    const orgId = 'ffffffffffffffffffffffff';
    const comp = fixture.componentInstance as unknown as {
      activeRowId: { set: (v: string) => void };
      pendingPromoteOrg: {
        set: (v: { _id: string; name: string; inn: string; type: string[] }) => void;
      };
      confirmPromoteOrg: () => void;
      onSupplierChange: (rowId: string, supplierId: string) => void;
    };
    comp.activeRowId.set('qo-1');
    comp.pendingPromoteOrg.set({
      _id: orgId,
      name: 'Клиент ООО',
      inn: '7700000000',
      type: ['customer'],
    });
    comp.confirmPromoteOrg();

    const patch = httpMock.expectOne(
      (r) => r.method === 'PATCH' && r.url === `/api/organizations/${orgId}`,
    );
    expect(patch.request.body).toEqual({ type: ['customer', 'supplier'] });
    patch.flush({
      _id: orgId,
      name: 'Клиент ООО',
      inn: '7700000000',
      type: ['customer', 'supplier'],
    });
    const findReq = httpMock.match(
      (r) => r.method === 'GET' && r.url === `/api/organizations/${orgId}`,
    );
    for (const req of findReq) {
      req.flush({
        _id: orgId,
        name: 'Клиент ООО',
        inn: '7700000000',
        type: ['customer', 'supplier'],
      });
    }
    const contactReqs = httpMock.match(
      (r) => r.method === 'GET' && r.url === `/api/organizations/${orgId}/contacts`,
    );
    for (const req of contactReqs) req.flush([]);
    fixture.detectChanges();
  });

  it('TZ-SUPPLY-443: supplier add button has pi-select-add-btn canon class', () => {
    const fixture = TestBed.createComponent(SupplyQuickOrderComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      toggleExpand: (id: string) => void;
      visibleRows: () => { id: string }[];
    };
    comp.toggleExpand(comp.visibleRows()[0].id);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      '[data-test="supply-quick-supplier-add"]',
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.classList.contains('pi-select-add-btn')).toBe(true);
  });
});
