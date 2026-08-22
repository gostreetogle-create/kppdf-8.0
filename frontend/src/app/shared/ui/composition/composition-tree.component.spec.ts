import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompositionTreeComponent } from './composition-tree.component';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';
import { CatalogAppearanceService } from '../catalog/catalog-appearance.service';
import { ThemeService } from '../../theme/theme.service';
import { of } from 'rxjs';
import { PiDialogService } from '../dialog/pi-dialog.service';

describe('CompositionTreeComponent (TZ-CATALOG-333/334 nest)', () => {
  let fixture: ComponentFixture<CompositionTreeComponent>;
  const dialog = { open: jest.fn() };

  const tree: CompositionTreeNode = {
    _id: 'p1',
    name: 'Изделие',
    kind: 'product',
    quantity: 1,
    children: [
      {
        _id: 'm1',
        name: 'Модуль A',
        kind: 'module',
        lineType: 'module',
        quantity: 1,
        children: [
          {
            _id: 'mat1',
            name: 'Материал 1',
            kind: 'material',
            lineType: 'material',
            quantity: 2,
            children: [],
          },
          {
            _id: 'mat2',
            name: 'Материал 2',
            kind: 'material',
            lineType: 'material',
            quantity: 1,
            children: [],
          },
        ],
      },
      {
        _id: 'm-leaf',
        name: 'Пустой модуль',
        kind: 'module',
        lineType: 'module',
        quantity: 1,
        children: [],
      },
      {
        _id: 'm2',
        name: 'Модуль B',
        kind: 'module',
        lineType: 'module',
        quantity: 1,
        children: [
          {
            _id: 'm2-1',
            name: 'Модуль B.1',
            kind: 'module',
            lineType: 'module',
            quantity: 1,
            children: [
              {
                _id: 'mat3',
                name: 'Материал вложенный',
                kind: 'material',
                lineType: 'material',
                quantity: 1,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    dialog.open.mockClear();
    await TestBed.configureTestingModule({
      imports: [CompositionTreeComponent],
      providers: [
        {
          provide: CatalogAppearanceService,
          useValue: {
            load: () => of(null),
            palette: () => undefined,
          },
        },
        { provide: PiDialogService, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompositionTreeComponent);
  });

  it('shows nest frame when expanded; hides on collapse', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    // Root auto-expands → nest under product
    const rootNest = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-nest"]',
    ) as HTMLElement | null;
    expect(rootNest).toBeTruthy();
    expect(rootNest!.getAttribute('data-parent-kind')).toBe('product');

    // Module A not expanded yet → no nest
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
      ),
    ).toBeNull();

    const moduleRow = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    moduleRow.click();
    fixture.detectChanges();

    const moduleNest = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
    ) as HTMLElement | null;
    expect(moduleNest).toBeTruthy();
    expect(moduleNest!.getAttribute('data-parent-kind')).toBe('module');
    // Unified open card: nest flush under row (no mt gap); sibling gap on node
    expect(moduleNest!.classList.contains('comp-tree__nest')).toBe(true);
    expect(moduleNest!.classList.contains('space-y-3')).toBe(true);
    expect(moduleNest!.classList.contains('border-l-[5px]')).toBe(true);
    expect(moduleNest!.classList.contains('mt-0')).toBe(true);
    expect(moduleNest!.classList.contains('pl-4')).toBe(true);
    const pack = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"]',
    ) as HTMLElement;
    expect(pack.classList.contains('mb-3')).toBe(true);
    // TZ-DESK-424: no card-in-card — the node wrapper never gets a hairline;
    // rows are split by border-b instead (see the row-level assertion below).
    expect(pack.classList.contains('hairline')).toBe(false);
    expect(pack.classList.contains('overflow-hidden')).toBe(true);
    const moduleRowEl = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    expect(moduleRowEl.classList.contains('border-b')).toBe(true);
    expect(moduleRowEl.classList.contains('hairline')).toBe(false);
    expect(moduleNest!.getAttribute('data-nest-depth')).toBe('1');
    // Both materials inside the same nest
    expect(moduleNest!.querySelector('[data-test="composition-tree-node-mat1"]')).toBeTruthy();
    expect(moduleNest!.querySelector('[data-test="composition-tree-node-mat2"]')).toBeTruthy();

    // Collapse (already selected + expanded)
    moduleRow.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
      ),
    ).toBeNull();
  });

  it('renders nested nest for module-in-module', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    const m2Row = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m2"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    m2Row.click();
    fixture.detectChanges();

    const m2Nest = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m2"] > [data-test="composition-tree-nest"]',
    ) as HTMLElement | null;
    expect(m2Nest).toBeTruthy();

    const m21Row = m2Nest!.querySelector(
      '[data-test="composition-tree-node-m2-1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    m21Row.click();
    fixture.detectChanges();

    const innerNest = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m2-1"] > [data-test="composition-tree-nest"]',
    ) as HTMLElement | null;
    expect(innerNest).toBeTruthy();
    expect(m2Nest!.contains(innerNest!)).toBe(true);
    expect(innerNest!.querySelector('[data-test="composition-tree-node-mat3"]')).toBeTruthy();
  });

  it('keeps whole-row click select + expand canon', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.componentRef.setInput('selectedId', null);
    fixture.detectChanges();

    const events: Array<{ id: string }> = [];
    fixture.componentInstance.selectedChange.subscribe((e) => events.push({ id: e.node._id }));

    const moduleRow = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    moduleRow.click();
    fixture.detectChanges();

    expect(events.some((e) => e.id === 'm1')).toBe(true);
    expect(
      fixture.nativeElement
        .querySelector('[data-test="composition-tree-node-m1"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('shows larger › only when node has children', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    const withKids = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"] [data-test="composition-tree-toggle"]',
    );
    expect(withKids).toBeTruthy();
    expect(withKids.textContent?.trim()).toBe('›');
    expect(withKids.classList.contains('w-7')).toBe(true);

    const leaf = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m-leaf"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    expect(leaf.querySelector('[data-test="composition-tree-toggle"]')).toBeNull();
  });

  it('TZ-CATALOG-335: dark nestSurface uses stronger depth ladder (not light 4/8/13)', () => {
    const theme = TestBed.inject(ThemeService);
    const comp = fixture.componentInstance;
    theme.set('light');
    const light0 = comp.nestSurface(0);
    const light2 = comp.nestSurface(2);
    expect(light0).toContain('4%');
    expect(light2).toContain('13%');

    theme.set('dark');
    fixture.detectChanges();
    const dark0 = comp.nestSurface(0);
    const dark2 = comp.nestSurface(2);
    const dark3 = comp.nestSurface(3);
    expect(dark0).toContain('12%');
    expect(dark2).toContain('34%');
    expect(dark3).toContain('46%');
    expect(dark0).not.toBe(light0);
  });

  it('TZ-DESK-424: no inset box-shadow on the nest, light or dark', () => {
    const theme = TestBed.inject(ThemeService);
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    const moduleRow = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    moduleRow.click();
    fixture.detectChanges();
    const moduleNest = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
    ) as HTMLElement;

    theme.set('light');
    fixture.detectChanges();
    expect(moduleNest.style.boxShadow).toBe('');

    theme.set('dark');
    fixture.detectChanges();
    expect(moduleNest.style.boxShadow).toBe('');
  });

  it('TZ-UX-311: name uses line-clamp-2 (not truncate); placeholder thumb without photoUrl', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-name"]',
    ) as HTMLElement;
    expect(nameEl).toBeTruthy();
    expect(nameEl.classList.contains('line-clamp-2')).toBe(true);
    expect(nameEl.classList.contains('break-words')).toBe(true);
    expect(nameEl.classList.contains('truncate')).toBe(false);

    const placeholder = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb-placeholder"]',
    );
    expect(placeholder).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb-img"]',
      ),
    ).toBeNull();
  });

  it('TZ-UX-311: thumb img when photoUrl present', () => {
    const withPhoto: CompositionTreeNode = {
      ...tree,
      photoUrl: '/uploads/demo-thumb.jpg',
    };
    fixture.componentRef.setInput('root', withPhoto);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb-img"]',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/uploads/demo-thumb.jpg');
    expect(img.closest('button')?.getAttribute('aria-label')).toBe('Открыть фото: Изделие');
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb-placeholder"]',
      ),
    ).toBeNull();
  });

  it('TZ-UI-344: thumbnail opens lightbox without selecting or expanding the row', () => {
    const withPhoto: CompositionTreeNode = {
      ...tree,
      photoUrl: '/uploads/demo-thumb.jpg',
    };
    fixture.componentRef.setInput('root', withPhoto);
    fixture.detectChanges();
    const thumb = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb"]',
    ) as HTMLButtonElement;

    thumb.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          src: '/uploads/demo-thumb.jpg',
          alt: 'Фото: Изделие',
          filename: 'Изделие',
        },
      }),
    );
    expect(
      fixture.nativeElement
        .querySelector('[data-test="composition-tree-node-p1"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('TZ-UX-312: thumb ≥36px (w-9 h-9); denser row (min-h-11, tight pad)', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    expect(row.classList.contains('min-h-11')).toBe(true);
    expect(row.classList.contains('px-1.5')).toBe(true);
    expect(row.classList.contains('py-1')).toBe(true);
    expect(row.classList.contains('gap-1')).toBe(true);
    expect(row.classList.contains('min-h-9')).toBe(false);
    expect(row.classList.contains('px-2')).toBe(false);

    const thumb = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-thumb"]',
    ) as HTMLElement;
    expect(thumb.classList.contains('w-9')).toBe(true);
    expect(thumb.classList.contains('h-9')).toBe(true);
    expect(thumb.classList.contains('w-5')).toBe(false);

    const nameEl = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-p1"] > [data-test="composition-tree-row"] [data-test="composition-tree-name"]',
    ) as HTMLElement;
    expect(nameEl.classList.contains('line-clamp-2')).toBe(true);
  });

  it('TZ-ORDERS-337: pencil on each row emits editClick without collapsing', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.componentRef.setInput('selectedId', 'm1');
    fixture.detectChanges();

    const moduleRow = fixture.nativeElement.querySelector(
      '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-row"]',
    ) as HTMLElement;
    moduleRow.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
      ),
    ).toBeTruthy();

    const edits: Array<{ id: string }> = [];
    fixture.componentInstance.editClick.subscribe((e) => edits.push({ id: e.node._id }));

    const pencil = moduleRow.querySelector(
      '[data-test="composition-tree-edit"]',
    ) as HTMLButtonElement;
    expect(pencil).toBeTruthy();
    expect(pencil.getAttribute('aria-label')).toContain('Модуль A');
    pencil.click();
    fixture.detectChanges();

    expect(edits).toEqual([{ id: 'm1' }]);
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="composition-tree-node-m1"] > [data-test="composition-tree-nest"]',
      ),
    ).toBeTruthy();
  });

  it('TZ-ORDERS-337: showEdit=false hides pencils', () => {
    fixture.componentRef.setInput('root', tree);
    fixture.componentRef.setInput('showEdit', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="composition-tree-edit"]')).toBeNull();
  });
});
