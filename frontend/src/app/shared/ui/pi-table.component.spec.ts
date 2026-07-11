import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ColumnDef, TableComponent } from './pi-table.component';

/**
 * TZ-94 Commit 1 (test portion): numeric column support test coverage.
 *
 * The `numeric?: boolean` field in `ColumnDef<T>` and the corresponding
 * `[class.tabular-nums]="col.numeric"` template binding were added in a
 * prior commit (interface + template already in `pi-table.component.ts`).
 * This spec file adds the test coverage specified in `tasks/TZ-94.md`
 * §C.3 ("Add a new test in a new `pi-table.component.spec.ts`"):
 *
 *   - `numeric: true` adds `tabular-nums` class to `<td>`.
 *   - `numeric: false` (or omitted) does NOT add `tabular-nums`.
 *
 * Behavioural contract: when a column is flagged `numeric: true`, the
 * rendered `<td>` gets Tailwind's `tabular-nums` class so that digit
 * columns align monospaced in financial / numeric tables. This is
 * the basis for the PiTable adopters in operational pages (TZ-95
 * showcase will demonstrate the visual difference).
 */
describe('TableComponent — TZ-94 numeric column support', () => {
  interface TestRow extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
  }

  @Component({
    standalone: true,
    imports: [TableComponent],
    template: `<app-pi-table [data]="data" [columns]="columns" />`,
  })
  class TestHost {
    data: TestRow[] = [
      { id: '1', name: 'Widget', price: 99.99 },
      { id: '2', name: 'Gadget', price: 149.5 },
    ];
    columns: ColumnDef<TestRow>[] = [
      { key: 'name', label: 'Name' },
      { key: 'price', label: 'Price', numeric: true },
    ];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHost] });
  });

  it('numeric: true adds `tabular-nums` class to <td>', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    // First row cells: [name, price]. The price cell should have tabular-nums.
    const firstRowCells = fixture.nativeElement.querySelectorAll(
      'tbody tr:first-child td',
    );
    expect(firstRowCells.length).toBe(2);
    expect(firstRowCells[1].classList.contains('tabular-nums')).toBe(true);
  });

  it('numeric: false (or omitted) does NOT add `tabular-nums`', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    // First row cell 0 is 'name' (no numeric flag) — should NOT have tabular-nums.
    const firstRowCells = fixture.nativeElement.querySelectorAll(
      'tbody tr:first-child td',
    );
    expect(firstRowCells.length).toBe(2);
    expect(firstRowCells[0].classList.contains('tabular-nums')).toBe(false);
  });
});
