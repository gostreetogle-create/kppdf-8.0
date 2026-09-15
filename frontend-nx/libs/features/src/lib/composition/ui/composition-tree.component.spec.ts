import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { CompositionTreeNode } from '@kppdf/data-access';
import { CompositionTreeComponent } from './composition-tree.component';

const ROOT: CompositionTreeNode = {
  _id: 'root',
  name: 'Изделие',
  kind: 'product',
  quantity: 1,
  children: [
    {
      _id: 'mod-1',
      name: 'Модуль',
      kind: 'module',
      lineType: 'module',
      quantity: 2,
      unit: 'шт',
      children: [
        {
          _id: 'mat-1',
          name: 'Материал',
          kind: 'material',
          lineType: 'material',
          quantity: 3,
          children: [],
        },
      ],
    },
  ],
};

describe('CompositionTreeComponent (Phase 2)', () => {
  let fixture: ComponentFixture<CompositionTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompositionTreeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CompositionTreeComponent);
    fixture.componentRef.setInput('root', ROOT);
    fixture.detectChanges();
  });

  it('renders tree with a11y role=tree', () => {
    expect(fixture.nativeElement.querySelector('[data-test="composition-tree"]')?.getAttribute('role')).toBe(
      'tree',
    );
  });

  it('expands nested rows on click and emits selection', () => {
    const emitted: unknown[] = [];
    fixture.componentInstance.selectedChange.subscribe((e) => emitted.push(e));
    const row = fixture.nativeElement.querySelector('[data-test="composition-tree-row"]') as HTMLElement;
    row.click();
    fixture.detectChanges();
    expect(emitted.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('[data-test="composition-tree-nest"]')).toBeTruthy();
  });

  it('shows qty on child rows', () => {
    const rootRow = fixture.nativeElement.querySelector('[data-test="composition-tree-row"]') as HTMLElement;
    rootRow.click();
    fixture.detectChanges();
    const qty = fixture.nativeElement.querySelector('[data-test="composition-tree-qty"]');
    expect(qty?.textContent).toContain('×2');
  });
});
