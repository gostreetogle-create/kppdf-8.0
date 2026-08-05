import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ColumnDef } from './pi-table.component';
import { PiTableTreeComponent, TreeDropEvent } from './pi-table-tree.component';

interface TreeRow {
  _id: string;
  name: string;
  slug: string;
  children: TreeRow[];
}

@Component({
  standalone: true,
  imports: [PiTableTreeComponent],
  template: `
    <app-pi-table-tree
      [data]="rows"
      [columns]="columns"
      [childRows]="childrenOf"
      [expandedIds]="expanded"
      [dragReorder]="true"
      (drop)="drops.push($event)"
    />
  `,
})
class TreeHostComponent {
  readonly rows: TreeRow[] = [
    {
      _id: 'root',
      name: 'Материалы',
      slug: 'materials',
      children: [{ _id: 'child', name: 'Сталь', slug: 'steel', children: [] }],
    },
  ];
  readonly columns: ColumnDef<TreeRow>[] = [
    { key: 'name', label: 'Название' },
    { key: 'slug', label: 'Slug' },
  ];
  readonly expanded = new Set<string>(['root']);
  readonly drops: TreeDropEvent<TreeRow>[] = [];
  readonly childrenOf = (row: TreeRow): TreeRow[] => row.children;
}

describe('PiTableTreeComponent (TZ-UI-TABLE-302)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TreeHostComponent] }).compileComponents();
  });

  it('renders shared headers, root row, and expanded child row', () => {
    const fixture = TestBed.createComponent(TreeHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="columnheader"]')).toBeTruthy();
    expect(el.querySelector('[data-test="tree-row-root"]')).toBeTruthy();
    expect(el.querySelector('[data-test="tree-row-child"]')).toBeTruthy();
    expect(el.querySelector('[data-test="tree-children-root"]')).toBeTruthy();
  });

  it('emits a parent-aware reorder event when a drop changes index', () => {
    const fixture = TestBed.createComponent(TreeHostComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const tree = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof PiTableTreeComponent,
    ).componentInstance as PiTableTreeComponent<TreeRow>;
    const container = {} as never;
    tree['onDrop'](component.rows[0], {
      previousIndex: 0,
      currentIndex: 1,
      item: {} as never,
      container,
      previousContainer: container,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 },
    });
    expect(component.drops).toHaveLength(1);
    expect(component.drops[0].parent?._id).toBe('root');
    expect(component.drops[0].previousIndex).toBe(0);
    expect(component.drops[0].currentIndex).toBe(1);
  });

  it('keeps nested child drop-list inside the parent drag node (not a root sibling)', () => {
    const fixture = TestBed.createComponent(TreeHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const parentNode = el.querySelector('[data-test="tree-node-root"]');
    const childList = el.querySelector('[data-test="tree-children-root"]');
    expect(parentNode).toBeTruthy();
    expect(childList).toBeTruthy();
    expect(parentNode?.contains(childList)).toBe(true);
  });
});
