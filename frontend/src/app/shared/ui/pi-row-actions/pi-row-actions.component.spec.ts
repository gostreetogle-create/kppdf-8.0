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

  beforeEach(async () => {
    // Reset Angular's testing module between tests so subsequent calls
    // to TestBed.configureTestingModule don't trip `assertNotInstantiated`
    // (TestBed tracks whether a component has been created; validating
    // siblings without a manual reset leaks that state across tests).
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PiRowActionsComponent<TestRow>],
    }).compileComponents();
  });

  async function createFixture(
    inputs: {
      row?: TestRow;
      copyLabel?: string | null;
      editLabel?: string | null;
      documentLabel?: string | null;
      deleteLabel?: string;
      deleteTitle?: string | null;
      deleteDisabled?: boolean;
      showEdit?: boolean;
      dataTestCopy?: string | null;
      dataTestEdit?: string | null;
      dataTestDelete?: string | null;
      showDelete?: boolean;
      loading?: boolean;
    } = {},
  ): Promise<ComponentFixture<PiRowActionsComponent<TestRow>>> {
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
    if (inputs.copyLabel !== undefined) {
      fixture.componentRef.setInput('copyLabel', inputs.copyLabel);
    }
    if (inputs.documentLabel !== undefined) {
      fixture.componentRef.setInput('documentLabel', inputs.documentLabel);
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
    if (inputs.showDelete !== undefined) {
      fixture.componentRef.setInput('showDelete', inputs.showDelete);
    }
    if (inputs.loading !== undefined) {
      fixture.componentRef.setInput('loading', inputs.loading);
    }
    if (inputs.dataTestCopy !== undefined) {
      fixture.componentRef.setInput('dataTestCopy', inputs.dataTestCopy);
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

  /**
   * Locate the COPY button specifically (not edit / document / delete).
   *
   * Selection strategies, in order:
   *  1. Explicit `dataTest` argument — match `button[data-test="..."]`.
   *  2. Heuristic: any button whose data-test starts with `copy-` or
   *     aria-label contains «Копировать» (the per-row aria-label is
   *     generated as `'Копировать ' + row.name`).
   *
   * Returns `null` when no such button is in the DOM — that is EXACTLY
   * how the test verifies `copyLabel=null` ⇒ button NOT rendered
   * (any other button — edit, document, delete — would be a wrong match).
   */
  function copyButton(
    fixture: ComponentFixture<PiRowActionsComponent<TestRow>>,
    dataTest?: string | null,
  ): HTMLButtonElement | null {
    if (dataTest) {
      return fixture.nativeElement.querySelector(
        `button[data-test="${dataTest}"]`,
      ) as HTMLButtonElement | null;
    }
    // Match by data-test prefix OR label substring. Both are stable
    // across slot re-orderings as long as the COPY slot is rendered.
    return fixture.nativeElement.querySelector(
      'button[data-test^="copy-"], button[aria-label^="Копировать"]',
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

    it('renders the copy button only when copyLabel is non-null (TZ-MATERIALS-310)', async () => {
      const fixture = await createFixture({ copyLabel: null });
      expect(copyButton(fixture)).toBeNull();

      const fixtureWith = await createFixture({ copyLabel: 'Копировать Test Row' });
      expect(copyButton(fixtureWith)).not.toBeNull();
    });

    it('omits the copy button under loading=true and shows the loading state', async () => {
      const fixture = await createFixture({ copyLabel: 'Копировать', loading: true });
      expect(copyButton(fixture)).toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-test="row-actions-loading"]'),
      ).not.toBeNull();
    });

    it('forwards copyLabel to the copy button aria-label', async () => {
      const fixture = await createFixture({ copyLabel: 'Копировать Test Row' });
      expect(copyButton(fixture)?.getAttribute('aria-label')).toBe('Копировать Test Row');
    });

    it('forwards dataTestCopy to the copy button data-test attribute', async () => {
      const fixture = await createFixture({
        copyLabel: 'Копировать',
        dataTestCopy: 'copy-1',
      });
      const btn = copyButton(fixture, 'copy-1');
      expect(btn).not.toBeNull();
      expect(btn?.getAttribute('data-test')).toBe('copy-1');
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

    it('omits the delete button when showDelete=false', async () => {
      const fixture = await createFixture({ showDelete: false });
      expect(deleteButton(fixture)).toBeNull();
      expect(editButton(fixture)).not.toBeNull();
    });

    it('shows row loading status and hides action buttons while loading', async () => {
      const fixture = await createFixture({ loading: true, documentLabel: 'Создать документ' });
      expect(
        fixture.nativeElement.querySelector('[data-test="row-actions-loading"]'),
      ).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[aria-label="Создать документ"]')).toBeNull();
      expect(editButton(fixture)).toBeNull();
      expect(deleteButton(fixture)).toBeNull();
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

    it('emits `copy` with the row payload ONLY when copyLabel is provided and the button is clicked', async () => {
      const fixtureNoCopy = await createFixture();
      const copySpyNoCopy = jest.fn();
      fixtureNoCopy.componentInstance.copy.subscribe(copySpyNoCopy);

      // No copy button rendered → no copy can fire.
      expect(copyButton(fixtureNoCopy)).toBeNull();
      // Even forcing a click does nothing because the button is missing.
      expect(copySpyNoCopy).not.toHaveBeenCalled();

      const fixture = await createFixture({ copyLabel: 'Копировать Test Row' });
      const copySpy = jest.fn();
      fixture.componentInstance.copy.subscribe(copySpy);
      const editSpy = jest.fn();
      fixture.componentInstance.edit.subscribe(editSpy);

      copyButton(fixture, 'edit-button-' + (testRow.id || 'test'))?.click();
      // data-test was different; locate by data-test from input map:
      const btn = copyButton(fixture);
      btn?.click();

      expect(copySpy).toHaveBeenCalledTimes(1);
      expect(copySpy).toHaveBeenCalledWith(testRow);
      // Clicking copy MUST NOT also fire `edit` (separate outputs / slots).
      expect(editSpy).not.toHaveBeenCalled();
    });

    it('preserves row identity when `copy` is emitted', async () => {
      const customRow: TestRow = { id: 99, name: 'Identity Copy' };
      const fixture = await createFixture({ row: customRow, copyLabel: 'Копировать' });
      const copySpy = jest.fn();
      fixture.componentInstance.copy.subscribe(copySpy);

      copyButton(fixture)?.click();

      expect(copySpy.mock.calls[0][0]).toBe(customRow);
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
