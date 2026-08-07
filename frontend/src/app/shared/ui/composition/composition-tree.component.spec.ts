import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompositionTreeComponent } from './composition-tree.component';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';
import { CatalogAppearanceService } from '../catalog/catalog-appearance.service';
import { of } from 'rxjs';

describe('CompositionTreeComponent (TZ-CATALOG-333/334 nest)', () => {
  let fixture: ComponentFixture<CompositionTreeComponent>;

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
    // TZ-334 cohesion classes: sibling gap + left rail + children indent
    expect(moduleNest!.classList.contains('comp-tree__nest')).toBe(true);
    expect(moduleNest!.classList.contains('space-y-3')).toBe(true);
    expect(moduleNest!.classList.contains('border-l-[3px]')).toBe(true);
    expect(moduleNest!.classList.contains('pl-3')).toBe(true);
    expect(moduleNest!.classList.contains('mb-3')).toBe(true);
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
});
