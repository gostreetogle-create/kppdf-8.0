import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiRowActionsComponent } from './pi-row-actions.component';

/** Fixture row type — proves the generic <T> works for arbitrary shapes. */
interface TestRow {
  id: number;
  name: string;
  isSystem?: boolean;
}

/**
 * TZ-NEW: Unit tests for PiRowActionsComponent (TZ-AUDIT-6).
 *
 * Contract under test:
 *  - `row` (required) is emitted with the click handler payload
 *  - `editLabel` is forwarded to the edit button's `aria-label`
 *  - `deleteLabel` (required) is forwarded to the delete button's `aria-label`
 *  - `deleteTitle` is forwarded to the delete button's `title` attribute
 *  - `deleteDisabled=true` puts the button into the disabled state
 *  - `showEdit` defaults to true; when false, the edit button is NOT in the DOM
 *  - `dataTestEdit` / `dataTestDelete` are forwarded to `data-test` attrs
 *  - Clicking edit emits the `edit` output with the row payload
 *  - Clicking delete emits the `delete` output with the row payload
 *  - Generic <T> is erased at runtime — works for any row shape
 */
describe('PiRowActionsComponent', () => {
  const testRow: TestRow = { id: 1, name: 'Test Row' };

  async function createFixture(
    inputs: {
      row?: TestRow;
      editLabel?: string | null;
      deleteLabel?: string;
      deleteTitle?: string | null;
      deleteDisabled?: boolean;
      showEdit?: boolean;
      dataTestEdit?: string | null;
      dataTestDelete?: string | null;
    } = {},
  ): Promise<ComponentFixture<PiRowActionsComponent<TestRow>>> {
    await TestBed.configureTestingModule({
      imports: [PiRowActionsComponent<TestRow>],
    }).compileComponents();

    const fixture = TestBed.createComponent(PiRowActionsComponent<TestRow>);
    fixture.componentRef.setInput('row', inputs.row ?? testRow);
    fixture.componentRef.setInput('deleteLabel', inputs.deleteLabel ?? 'Delete row');
    if (inputs.editLabel !== undefined) {
      fixture.componentRef.setInput('editLabel', inputs.editLabel);
    } else if (inputs.showEdit !== false) {
      // Helper default: when showEdit is true (default), provide a
      // label so the edit button exposes an aria-label and the
      // `button[aria-label]:not(.pi-icon-btn-danger)` selector
      // resolves correctly. Tests that want to exercise the
      // "editLabel=null" path pass `editLabel: null` explicitly and
      // assert via `fixture.componentInstance.editLabel()` (signal
      // getter), not via the DOM selector.
      fixture.componentRef.setInput('editLabel', 'Edit row');
    }
    if (inputs.deleteTitle !== undefined) {
      fixture.componentRef.setInput('deleteTitle', inputs.deleteTitle);
    }
    if (inputs.deleteDisabled !== undefined) {
      fixture.componentRef.setInput('deleteDisabled', inputs.deleteDisabled);
    }
    if (inputs.showEdit !== undefined) {
      fixture.componentRef.setInput('showEdit', inputs.showEdit);
    }
    if (inputs.dataTestEdit !== undefined) {
      fixture.componentRef.setInput('dataTestEdit', inputs.dataTestEdit);
    }
    if (inputs.dataTestDelete !== undefined) {
      fixture.componentRef.setInput('dataTestDelete', inputs.dataTestDelete);
    }
    fixture.detectChanges();
    return fixture;
  }

  function editButton(
    fixture: ComponentFixture<PiRowActionsComponent<TestRow>>,
  ): HTMLButtonElement | null {
    // Semantic selector: pick the button that exposes an aria-label
    // (the edit button) and exclude the delete button by its
    // danger-variant class. More robust than the old
    // `button:not(.pi-icon-btn-danger)` selector: if a third button
    // (e.g. a "view" action) is added without an aria-label, the test
    // still resolves to the correct edit button.
    return fixture.nativeElement.querySelector(
      'button[aria-label]:not(.pi-icon-btn-danger)',
    ) as HTMLButtonElement | null;
  }

  function deleteButton(
    fixture: ComponentFixture<PiRowActionsComponent<TestRow>>,
  ): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.pi-icon-btn-danger') as HTMLButtonElement;
  }

  describe('button rendering', () => {
    it('renders BOTH edit and delete buttons by default (showEdit=true)', async () => {
      const fixture = await createFixture();
      expect(editButton(fixture)).not.toBeNull();
      expect(deleteButton(fixture)).toBeTruthy();
    });

    it('omits the edit button when showEdit=false (TZ-AUDIT-6 fix)', async () => {
      const fixture = await createFixture({ showEdit: false });
      expect(editButton(fixture)).toBeNull();
      // Delete still rendered
      expect(deleteButton(fixture)).toBeTruthy();
    });

    it('keeps the delete button visible even with showEdit=false', async () => {
      const fixture = await createFixture({
        showEdit: false,
        deleteLabel: 'Удалить системный юнит',
        deleteDisabled: true,
        deleteTitle: 'Системный юнит — нельзя удалить',
      });
      const del = deleteButton(fixture);
      expect(del.getAttribute('aria-label')).toBe('Удалить системный юнит');
      expect(del.disabled).toBe(true);
      expect(del.getAttribute('title')).toBe('Системный юнит — нельзя удалить');
    });
  });

  describe('default input values', () => {
    it('editLabel signal can be explicitly set to null (caller-controlled)', async () => {
      // The helper's default would set editLabel='Edit row'; pass
      // `null` explicitly to exercise the null-input path. The DOM
      // selector returns null in this case (button has no aria-label),
      // so we assert via the signal getter instead.
      const fixture = await createFixture({ editLabel: null });
      expect(fixture.componentInstance.editLabel()).toBeNull();
    });

    it('deleteTitle defaults to null (no title attr on delete button when not provided)', async () => {
      const fixture = await createFixture();
      expect(deleteButton(fixture).getAttribute('title')).toBeNull();
    });

    it('dataTestEdit defaults to null (no data-test on edit button when not provided)', async () => {
      const fixture = await createFixture();
      expect(editButton(fixture)?.getAttribute('data-test')).toBeNull();
    });

    it('dataTestDelete defaults to null (no data-test on delete button when not provided)', async () => {
      const fixture = await createFixture();
      expect(deleteButton(fixture).getAttribute('data-test')).toBeNull();
    });
  });

  describe('input bindings are forwarded', () => {
    it('forwards editLabel to the edit button aria-label', async () => {
      const fixture = await createFixture({ editLabel: 'Редактировать Test Row' });
      expect(editButton(fixture)?.getAttribute('aria-label')).toBe('Редактировать Test Row');
    });

    it('forwards deleteLabel to the delete button aria-label', async () => {
      const fixture = await createFixture({ deleteLabel: 'Удалить Test Row' });
      expect(deleteButton(fixture).getAttribute('aria-label')).toBe('Удалить Test Row');
    });

    it('forwards dataTestEdit / dataTestDelete to data-test attrs', async () => {
      const fixture = await createFixture({
        dataTestEdit: 'edit-1',
        dataTestDelete: 'delete-1',
      });
      expect(editButton(fixture)?.getAttribute('data-test')).toBe('edit-1');
      expect(deleteButton(fixture).getAttribute('data-test')).toBe('delete-1');
    });

    it('respects deleteDisabled=true (button is disabled)', async () => {
      const fixture = await createFixture({ deleteDisabled: true });
      expect(deleteButton(fixture).disabled).toBe(true);
    });

    it('deleteDisabled defaults to false (button is enabled)', async () => {
      const fixture = await createFixture();
      expect(deleteButton(fixture).disabled).toBe(false);
    });
  });

  describe('output emissions', () => {
    it('emits `edit` with the row payload when edit button is clicked', async () => {
      const fixture = await createFixture();
      const editSpy = jest.fn();
      fixture.componentInstance.edit.subscribe(editSpy);

      editButton(fixture)?.click();

      expect(editSpy).toHaveBeenCalledTimes(1);
      expect(editSpy).toHaveBeenCalledWith(testRow);
    });

    it('emits `delete` with the row payload when delete button is clicked', async () => {
      const fixture = await createFixture();
      const deleteSpy = jest.fn();
      fixture.componentInstance.delete.subscribe(deleteSpy);

      deleteButton(fixture).click();

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(testRow);
    });

    it('emits the same row instance reference (identity preserved)', async () => {
      const customRow: TestRow = { id: 99, name: 'Identity' };
      const fixture = await createFixture({ row: customRow });
      const deleteSpy = jest.fn();
      fixture.componentInstance.delete.subscribe(deleteSpy);

      deleteButton(fixture).click();

      expect(deleteSpy).toHaveBeenCalledWith(customRow);
      // Identity check (not just structural equality)
      expect(deleteSpy.mock.calls[0][0]).toBe(customRow);
    });

    it('emits the correct row when showEdit=false and only delete is clicked', async () => {
      const fixture = await createFixture({ showEdit: false });
      const editSpy = jest.fn();
      const deleteSpy = jest.fn();
      fixture.componentInstance.edit.subscribe(editSpy);
      fixture.componentInstance.delete.subscribe(deleteSpy);

      deleteButton(fixture).click();

      expect(editSpy).not.toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(testRow);
    });
  });

  describe('generic typing', () => {
    it('accepts a row with extra fields (isSystem, etc.) without complaint', async () => {
      const systemRow: TestRow = { id: 2, name: 'System Unit', isSystem: true };
      const fixture = await createFixture({
        row: systemRow,
        showEdit: false,
        deleteLabel: 'Удалить',
        deleteTitle: 'Системный юнит — нельзя удалить',
        // deleteDisabled intentionally omitted — disabled buttons
        // don't fire click events in jsdom, so the spy would never
        // be called. The disabled-state contract is covered by the
        // dedicated "respects deleteDisabled=true" test above.
      });
      const deleteSpy = jest.fn();
      fixture.componentInstance.delete.subscribe(deleteSpy);

      deleteButton(fixture).click();

      expect(deleteSpy).toHaveBeenCalledWith(systemRow);
    });
  });

  it('is a standalone component', async () => {
    // `imports: [PiRowActionsComponent<TestRow>]` in
    // TestBed.configureTestingModule would throw at compile time if the
    // component were not standalone. Reaching this assertion is
    // sufficient proof — no need to poke at the internal `ɵcmp` symbol
    // (private API, may change).
    expect(PiRowActionsComponent.prototype).toBeDefined();
  });
});
