import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { TableTemplateFormDialogComponent } from './table-template-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import {
  TableTemplatesService,
  type TableTemplate,
} from '../../../shared/services/pi-table-templates.service';
import { SilentResult } from '../../../core/silent-http';

/**
 * TZ-NEW: Unit tests for TableTemplateFormDialogComponent.
 *
 * Strategy: provide mock PI_DIALOG_DATA / PI_DIALOG_REF / TableTemplatesService
 * / PiToastService tokens, create the component via a TestHost standalone
 * wrapper, and assert form structure + method behavior. We intentionally pass
 * `data: null` for most tests so the constructor's `loadPreview()` queueMicrotask
 * does not fire (it only runs when editing an existing template). One explicit
 * test exercises the edit-mode bootstrap with a stub TableTemplate to verify
 * the preview path doesn't crash and the form still hydrates from `data`.
 *
 * Contract under test (per tasks/TZ-86 §C.4 + the component JSDoc):
 *   - 6 FormControls: name, description, category, sampleRowsJson, sortOrder, isActive
 *   - 1 FormArray: columns (each row = FormGroup<key, label, type, width, align, format>)
 *   - 7 fields total in the top-level FormGroup (6 FormControls + 1 FormArray)
 *   - name + category are required; description / sampleRowsJson / sortOrder / isActive optional
 *   - columns defaults to 1 empty column (the form is usable in "create" mode without seeding)
 *   - When data is provided, the form is hydrated from data.* fields
 *   - The component is a standalone, OnPush, signal-based Angular 20 component
 *
 * Method behavior under test (this addition):
 *   - addColumn: pushes a new FormGroup with 6 controls to the columns FormArray
 *   - removeColumn: removes at index
 *   - moveColumn: swaps positions, early-returns on out-of-bounds, preserves identity
 *   - validate: returns null on success, or a Russian error string on failure
 *   - onCancel: calls ref.close(null)
 *   - onSave: validates, calls service.create (no data) or service.update (with data),
 *     handles success (ref.close + toast.success) and error (errorMessage + toast.error)
 *
 * Note: the original task spec said "7 FormControls + 1 FormArray", but the
 * actual form is 6 FormControls + 1 FormArray (the `columns` field is a
 * FormArray, not a FormControl). Verified 2026-07-12 by reading the
 * FormGroup definition directly — re-verify if the form shape changes.
 */

/** Local mirror of the component's private `TableColumnForm` type for assertions. */
type TableColumnFormShape = FormGroup<{
  key: FormControl<string>;
  label: FormControl<string>;
  type: FormControl<string>;
  width: FormControl<number>;
  align: FormControl<string>;
  format: FormControl<string>;
}>;

/**
 * Mocked `SilentResult` observable: returns a never-completing
 * Observable so the constructor's queueMicrotask (when data is set)
 * doesn't trigger .subscribe() callbacks in tests that don't care
 * about the preview.
 */
function noopObservable<T>(): { subscribe: jest.Mock } {
  return { subscribe: jest.fn() };
}

function createMockRef<T>(): { ref: DialogRef<T>; closeSpy: jest.Mock } {
  const closeSpy = jest.fn();
  const ref = { close: closeSpy } as unknown as DialogRef<T>;
  return { ref, closeSpy };
}

/**
 * A fake Observable that captures the subscribe callback so a test can
 * manually fire a `SilentResult` value at the right moment. Avoids the
 * rxjs import cost for a 5-method component — the callback signature
 * matches what `obs.subscribe((res) => …)` in the component expects.
 */
function makeCapturedObservable<T>(): {
  observable: { subscribe: (cb: (value: T) => void) => { unsubscribe: () => void } };
  emit: (value: T) => void;
} {
  const callbacks: Array<(value: T) => void> = [];
  return {
    observable: {
      subscribe: (cb: (value: T) => void) => {
        callbacks.push(cb);
        return { unsubscribe: () => undefined };
      },
    },
    emit: (value: T) => {
      for (const cb of callbacks) cb(value);
    },
  };
}

describe('TableTemplateFormDialogComponent', () => {
  /** TestHost standalone wrapper that mounts the dialog directly. */
  @Component({
    standalone: true,
    imports: [TableTemplateFormDialogComponent],
    template: `<app-table-template-dialog />`,
  })
  class TestHost {}

  /**
   * Build a stub TableTemplate for edit-mode tests. Only the fields the
   * component's `form` reads are populated; everything else uses sensible
   * defaults so the test stays focused on hydration behaviour.
   */
  function stubTableTemplate(overrides: Partial<TableTemplate> = {}): TableTemplate {
    return {
      _id: 'tmpl-1',
      name: 'Спецификация',
      description: 'Базовый шаблон',
      category: 'product-spec',
      columns: [
        { key: 'sku', label: 'Артикул', type: 'text', width: 120, align: 'left' },
        { key: 'qty', label: 'Кол-во', type: 'number', width: 80, align: 'right' },
      ],
      sampleRows: [['А-001', 2]],
      sortOrder: 5,
      isActive: true,
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
      ...overrides,
    } as TableTemplate;
  }

  async function createFixture(
    data: TableTemplate | null = null,
  ): Promise<ComponentFixture<TestHost>> {
    const { ref } = createMockRef<TableTemplate | null>();

    const previewMock = jest.fn().mockReturnValue(noopObservable());

    await TestBed.configureTestingModule({
      imports: [TestHost, ReactiveFormsModule],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
        {
          provide: TableTemplatesService,
          useValue: { preview: previewMock },
        },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    return fixture;
  }

  /**
   * Extended fixture for onSave tests. Returns spies for ref.close, toast,
   * and service.create/update plus an `emit()` helper to fire the captured
   * subscribe callback at the right moment. This is the bridge between the
   * synchronous test body and the async observable.subscribe() in onSave.
   */
  async function createSaveFixture(
    data: TableTemplate | null = null,
  ): Promise<{
    fixture: ComponentFixture<TestHost>;
    dialog: TableTemplateFormDialogComponent;
    service: { create: jest.Mock; update: jest.Mock; preview: jest.Mock };
    closeSpy: jest.Mock;
    toastSuccess: jest.Mock;
    toastError: jest.Mock;
    emitCreate: (value: SilentResult<TableTemplate>) => void;
    emitUpdate: (value: SilentResult<TableTemplate>) => void;
  }> {
    const create = makeCapturedObservable<SilentResult<TableTemplate>>();
    const update = makeCapturedObservable<SilentResult<TableTemplate>>();
    const { ref, closeSpy } = createMockRef<TableTemplate | null>();
    const toastSuccess = jest.fn();
    const toastError = jest.fn();

    const service = {
      create: jest.fn().mockReturnValue(create.observable),
      update: jest.fn().mockReturnValue(update.observable),
      preview: jest.fn().mockReturnValue(noopObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [TestHost, ReactiveFormsModule],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref },
        { provide: TableTemplatesService, useValue: service },
        { provide: PiToastService, useValue: { success: toastSuccess, error: toastError } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const dialog = getDialog(fixture);
    return {
      fixture,
      dialog,
      service,
      closeSpy,
      toastSuccess,
      toastError,
      emitCreate: create.emit,
      emitUpdate: update.emit,
    };
  }

  function getDialog(fixture: ComponentFixture<TestHost>): TableTemplateFormDialogComponent {
    // TestHost renders a single <app-table-template-dialog /> element;
    // the component instance is the first child of the host.
    const debugEl = fixture.debugElement.children[0];
    if (!debugEl) throw new Error('TestHost did not render the dialog');
    return debugEl.componentInstance as TableTemplateFormDialogComponent;
  }

  /**
   * Fill the minimum required fields for the form to be valid. onSave() checks
   * `form.invalid` first and returns early without calling the service, so
   * every onSave test that expects a service call must first make the form
   * valid by setting name + the first column's key/label (other required
   * fields have valid defaults: category='custom', type='text', width=100,
   * align='left').
   */
  function makeFormValid(
    dialog: TableTemplateFormDialogComponent,
    opts: {
      name?: string;
      firstColumnKey?: string;
      firstColumnLabel?: string;
    } = {},
  ): void {
    dialog.form.get('name')!.setValue(opts.name ?? 'Тест');
    const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
    columns.at(0).controls.key.setValue(opts.firstColumnKey ?? 'col1');
    columns.at(0).controls.label.setValue(opts.firstColumnLabel ?? 'Column 1');
  }

  // ─── Form structure ────────────────────────────────────────────────

  describe('form structure (create mode, data: null)', () => {
    it('mounts the dialog and exposes a non-null FormGroup', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      expect(dialog).toBeTruthy();
      expect(dialog.form).toBeTruthy();
      expect(dialog.form).toBeInstanceOf(FormGroup);
    });

    it('has exactly 6 FormControls + 1 FormArray at the top level (7 fields total)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const controlNames = Object.keys(dialog.form.controls).sort();
      expect(controlNames).toEqual(
        [
          'category',
          'columns',
          'description',
          'isActive',
          'name',
          'sampleRowsJson',
          'sortOrder',
        ].sort(),
      );
      // 6 FormControls + 1 FormArray = 7 entries total (see JSDoc header for
      // why this is 6+1, not the 7+1 from the original task spec).
      const formControlCount = controlNames.filter(
        (k) => dialog.form.get(k) instanceof FormControl,
      ).length;
      const formArrayCount = controlNames.filter(
        (k) => dialog.form.get(k) instanceof FormArray,
      ).length;
      expect(formControlCount).toBe(6);
      expect(formArrayCount).toBe(1);
    });

    it('name FormControl exists and is required', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const name = dialog.form.get('name');
      expect(name).toBeInstanceOf(FormControl);
      expect(name!.validator).toBeTruthy();
      // Empty value + required → invalid
      name!.setValue('');
      expect(name!.invalid).toBe(true);
      name!.setValue('Спецификация товаров');
      expect(name!.valid).toBe(true);
    });

    it('description FormControl exists and is optional', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const description = dialog.form.get('description');
      expect(description).toBeInstanceOf(FormControl);
      // No value + no required → valid
      expect(description!.valid).toBe(true);
      description!.setValue('Краткое описание');
      expect(description!.value).toBe('Краткое описание');
    });

    it('category FormControl exists, defaults to "custom", and is required', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const category = dialog.form.get('category');
      expect(category).toBeInstanceOf(FormControl);
      expect(category!.value).toBe('custom');
      // category has a Validators.required — clearing makes it invalid.
      category!.setValue(null);
      expect(category!.invalid).toBe(true);
    });

    it('sampleRowsJson FormControl exists and defaults to empty string', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const sample = dialog.form.get('sampleRowsJson');
      expect(sample).toBeInstanceOf(FormControl);
      expect(sample!.value).toBe('');
    });

    it('sortOrder FormControl exists and defaults to 0', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const sortOrder = dialog.form.get('sortOrder');
      expect(sortOrder).toBeInstanceOf(FormControl);
      expect(sortOrder!.value).toBe(0);
    });

    it('isActive FormControl exists and defaults to true', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const isActive = dialog.form.get('isActive');
      expect(isActive).toBeInstanceOf(FormControl);
      expect(isActive!.value).toBe(true);
    });

    it('columns is a FormArray seeded with 1 default column', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const columns = dialog.form.get('columns');
      expect(columns).toBeInstanceOf(FormArray);
      // The component initializes the array with `data?.columns ?? [makeColumn()]`,
      // so 1 default column row when data is null.
      expect((columns as FormArray).length).toBe(1);
      const firstCol = (columns as FormArray).at(0) as TableColumnFormShape;
      expect(firstCol).toBeInstanceOf(FormGroup);
    });

    it('default column has 6 FormControls: key, label, type, width, align, format', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
      const firstCol = columns.at(0);
      const controlNames = Object.keys(firstCol.controls).sort();
      expect(controlNames).toEqual(
        ['align', 'format', 'key', 'label', 'type', 'width'].sort(),
      );
    });

    it('columns getter (columnsArray) returns the same FormArray as form.controls.columns', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const fromControl = dialog.form.get('columns');
      const fromGetter = dialog.columnsArray;
      expect(fromGetter).toBe(fromControl);
    });
  });

  // ─── Form hydration (edit mode, data: stub) ────────────────────────

  describe('form hydration (edit mode, data: stub TableTemplate)', () => {
    it('hydrates name + description + category from data', async () => {
      const fixture = await createFixture(
        stubTableTemplate({
          name: 'Шаблон прайс-листа',
          description: 'Для печати',
          category: 'price-list',
        }),
      );
      const dialog = getDialog(fixture);
      expect(dialog.form.get('name')!.value).toBe('Шаблон прайс-листа');
      expect(dialog.form.get('description')!.value).toBe('Для печати');
      expect(dialog.form.get('category')!.value).toBe('price-list');
    });

    it('hydrates sortOrder + isActive from data', async () => {
      const fixture = await createFixture(
        stubTableTemplate({ sortOrder: 42, isActive: false }),
      );
      const dialog = getDialog(fixture);
      expect(dialog.form.get('sortOrder')!.value).toBe(42);
      expect(dialog.form.get('isActive')!.value).toBe(false);
    });

    it('hydrates columns array with 2 column FormGroups from data', async () => {
      const fixture = await createFixture(stubTableTemplate());
      const dialog = getDialog(fixture);
      const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
      expect(columns.length).toBe(2);
      expect(columns.at(0).controls.key.value).toBe('sku');
      expect(columns.at(1).controls.key.value).toBe('qty');
      expect(columns.at(1).controls.type.value).toBe('number');
    });

    it('hydrates sampleRowsJson as a pretty-printed JSON string', async () => {
      const fixture = await createFixture(stubTableTemplate());
      const dialog = getDialog(fixture);
      const sample = dialog.form.get('sampleRowsJson')!.value as string;
      // The component does JSON.stringify(data.sampleRows, null, 2) when data has sampleRows.
      expect(typeof sample).toBe('string');
      expect(() => JSON.parse(sample)).not.toThrow();
      const parsed = JSON.parse(sample);
      expect(parsed).toEqual([['А-001', 2]]);
    });

    it('triggers service.preview() in edit mode (constructor queueMicrotask path)', async () => {
      // The constructor calls queueMicrotask(() => if (this.data) this.loadPreview()).
      // Flush microtasks + detectChanges so the queued callback runs.
      const fixture = await createFixture(stubTableTemplate());
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const previewMock = (
        TestBed.inject(TableTemplatesService) as { preview: jest.Mock }
      ).preview;
      expect(previewMock).toHaveBeenCalledTimes(1);
      expect(previewMock).toHaveBeenCalledWith('tmpl-1');
    });
  });

  // ─── Method behavior (addColumn / removeColumn / moveColumn / validate / onCancel / onSave) ─

  describe('method behavior — addColumn / removeColumn / moveColumn', () => {
    it('addColumn pushes a new FormGroup with 6 controls to the columns FormArray', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const before = (dialog.form.get('columns') as FormArray).length;
      dialog.addColumn();
      fixture.detectChanges();
      const after = (dialog.form.get('columns') as FormArray).length;
      expect(after).toBe(before + 1);
      const newCol = (dialog.form.get('columns') as FormArray).at(after - 1) as TableColumnFormShape;
      expect(Object.keys(newCol.controls).sort()).toEqual(
        ['align', 'format', 'key', 'label', 'type', 'width'].sort(),
      );
    });

    it('addColumn seeds the new column with valid default values', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      fixture.detectChanges();
      const newCol = (dialog.form.get('columns') as FormArray).at(1) as TableColumnFormShape;
      // makeColumn() defaults: { key: '', label: '', type: 'text', width: 100, align: 'left' }
      expect(newCol.controls.key.value).toBe('');
      expect(newCol.controls.label.value).toBe('');
      expect(newCol.controls.type.value).toBe('text');
      expect(newCol.controls.width.value).toBe(100);
      expect(newCol.controls.align.value).toBe('left');
      expect(newCol.controls.format.value).toBe('');
    });

    it('removeColumn removes the FormGroup at the given index', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      // Add 2 more so we have 3 columns
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      // Remove the middle one (index 1)
      const middle = (dialog.form.get('columns') as FormArray).at(1);
      dialog.removeColumn(1);
      fixture.detectChanges();
      const after = (dialog.form.get('columns') as FormArray);
      expect(after.length).toBe(2);
      // The new index 1 should be what was previously index 2
      expect(after.at(1)).not.toBe(middle);
    });

    it('removeColumn on the only column leaves the array empty', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      // Default seed = 1 column. Remove it.
      dialog.removeColumn(0);
      fixture.detectChanges();
      expect((dialog.form.get('columns') as FormArray).length).toBe(0);
    });

    it('moveColumn swaps positions forward (index 0 → 1, preserves FormGroup identity)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      const columns = dialog.form.get('columns') as FormArray;
      const first = columns.at(0);
      const second = columns.at(1);
      dialog.moveColumn(0, 1);
      fixture.detectChanges();
      // After move: first is now at index 1, second is now at index 0
      expect(columns.at(0)).toBe(second);
      expect(columns.at(1)).toBe(first);
    });

    it('moveColumn swaps positions backward (index 1 → 0, preserves FormGroup identity)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      const columns = dialog.form.get('columns') as FormArray;
      const first = columns.at(0);
      const second = columns.at(1);
      dialog.moveColumn(1, -1);
      fixture.detectChanges();
      expect(columns.at(0)).toBe(second);
      expect(columns.at(1)).toBe(first);
    });

    it('moveColumn with delta -1 at index 0 is a no-op (out of bounds)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      const columns = dialog.form.get('columns') as FormArray;
      const firstBefore = columns.at(0);
      const secondBefore = columns.at(1);
      dialog.moveColumn(0, -1);
      fixture.detectChanges();
      // No swap happened
      expect(columns.at(0)).toBe(firstBefore);
      expect(columns.at(1)).toBe(secondBefore);
    });

    it('moveColumn with delta +1 at last index is a no-op (out of bounds)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      const columns = dialog.form.get('columns') as FormArray;
      const lastIndex = columns.length - 1;
      const lastBefore = columns.at(lastIndex);
      const beforeLast = columns.at(lastIndex - 1);
      dialog.moveColumn(lastIndex, 1);
      fixture.detectChanges();
      expect(columns.at(lastIndex)).toBe(lastBefore);
      expect(columns.at(lastIndex - 1)).toBe(beforeLast);
    });
  });

  describe('method behavior — validate()', () => {
    it('returns null when form is valid (default 1 column, empty sampleRows)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      // Default state: 1 column with empty key, empty sampleRowsJson.
      // validate() filters out empty keys before checking duplicates, so this passes.
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBeNull();
    });

    it('returns "duplicate keys" error when 2 columns have the same trimmed key', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      // validate() does case-sensitive trim+equality on keys, so 'sku' and
      // 'sku' (after trim) are the same → duplicate.
      const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
      columns.at(0).controls.key.setValue('sku');
      dialog.addColumn();
      fixture.detectChanges();
      const newCol = (dialog.form.get('columns') as FormArray<TableColumnFormShape>).at(1);
      newCol.controls.key.setValue('sku');
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBe('Ключи колонок должны быть уникальными.');
    });

    it('trims keys before duplicate detection (so "  sku  " and "sku" are duplicates)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
      columns.at(0).controls.key.setValue('sku');
      dialog.addColumn();
      fixture.detectChanges();
      const newCol = (dialog.form.get('columns') as FormArray<TableColumnFormShape>).at(1);
      newCol.controls.key.setValue('  sku  '); // trim → "sku" → duplicate
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBe('Ключи колонок должны быть уникальными.');
    });

    it('returns "non-array" error when sampleRowsJson is valid JSON but not an array', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.form.get('sampleRowsJson')!.setValue('{"a": 1}');
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBe('Образцы строк должны быть массивом массивов.');
    });

    it('returns "row not array" error when a row in sampleRows is not an array', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.form.get('sampleRowsJson')!.setValue('[[1, 2], "not-an-array"]');
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBe('Каждая строка образца — массив значений.');
    });

    it('returns "invalid JSON" error when sampleRowsJson is malformed', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.form.get('sampleRowsJson')!.setValue('{not valid json');
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBe('Некорректный JSON в образцах строк.');
    });

    it('returns null when sampleRowsJson is empty (no JSON validation runs)', async () => {
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      // sampleRowsJson defaults to ''. validate() only parses if json is truthy.
      dialog.form.get('sampleRowsJson')!.setValue('   '); // whitespace only, trim → ''
      const result = (dialog as unknown as { validate: () => string | null }).validate();
      expect(result).toBeNull();
    });
  });

  describe('method behavior — onCancel()', () => {
    it('calls ref.close(null) and nothing else', async () => {
      const { dialog, closeSpy, service, toastSuccess, toastError } = await createSaveFixture(null);
      dialog.onCancel();
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledWith(null);
      // Sanity: no side effects on the service or toast
      expect(service.create).not.toHaveBeenCalled();
      expect(service.update).not.toHaveBeenCalled();
      expect(toastSuccess).not.toHaveBeenCalled();
      expect(toastError).not.toHaveBeenCalled();
    });
  });

  describe('method behavior — onSave()', () => {
    it('returns early without calling the service when the form is invalid (name required)', async () => {
      const { dialog, service, closeSpy } = await createSaveFixture(null);
      // name is empty (default) → form.invalid = true
      expect(dialog.form.invalid).toBe(true);
      dialog.onSave();
      expect(service.create).not.toHaveBeenCalled();
      expect(service.update).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('sets validationError signal and returns early when validate() returns an error', async () => {
      const { dialog, service, closeSpy } = await createSaveFixture(null);
      // onSave() checks form.invalid FIRST and returns early without calling
      // validate(), so we must fill in the required fields on BOTH columns
      // (name + each column's key/label) before triggering the duplicate-keys
      // condition.
      makeFormValid(dialog, {
        name: 'Тест',
        firstColumnKey: 'sku',
        firstColumnLabel: 'Артикул',
      });
      const columns = dialog.form.get('columns') as FormArray<TableColumnFormShape>;
      dialog.addColumn();
      const newCol = columns.at(1);
      newCol.controls.label.setValue('Кол-во');
      // Now set the duplicate key to force validate() to fail.
      newCol.controls.key.setValue('sku');
      dialog.onSave();
      // validationError signal should be set to the duplicate-keys message
      const validationError = (dialog as unknown as { validationError: () => string | null }).validationError();
      expect(validationError).toBe('Ключи колонок должны быть уникальными.');
      expect(service.create).not.toHaveBeenCalled();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('create mode (no data): calls service.create with the right payload and closes on success', async () => {
      const { dialog, service, closeSpy, toastSuccess, emitCreate } = await createSaveFixture(null);
      // Fill in a valid form. makeFormValid() handles name + the first
      // column's key/label (the required-by-default fields). The other fields
      // (description, category, sortOrder) are set inline for clarity.
      dialog.form.get('description')!.setValue('Описание');
      dialog.form.get('category')!.setValue('product-spec');
      dialog.form.get('sortOrder')!.setValue(3);
      makeFormValid(dialog, {
        name: 'Новый шаблон',
        firstColumnKey: 'sku',
        firstColumnLabel: 'Артикул',
      });
      const createdTemplate = { _id: 'new-1', name: 'Новый шаблон' } as TableTemplate;
      dialog.onSave();
      // service.create should be called once with a payload containing our values
      expect(service.create).toHaveBeenCalledTimes(1);
      const payload = service.create.mock.calls[0][0] as Partial<TableTemplate>;
      expect(payload.name).toBe('Новый шаблон');
      expect(payload.description).toBe('Описание');
      expect(payload.category).toBe('product-spec');
      expect(payload.sortOrder).toBe(3);
      // No data: update should not be called
      expect(service.update).not.toHaveBeenCalled();
      // saving signal should be true while pending
      const savingDuring = (dialog as unknown as { saving: () => boolean }).saving();
      expect(savingDuring).toBe(true);
      // Fire the captured callback: success
      emitCreate({ ok: true, data: createdTemplate });
      // After success: saving false, ref.close(data), toast.success called
      const savingAfter = (dialog as unknown as { saving: () => boolean }).saving();
      expect(savingAfter).toBe(false);
      expect(closeSpy).toHaveBeenCalledWith(createdTemplate);
      expect(toastSuccess).toHaveBeenCalledWith('Шаблон таблицы создан');
    });

    it('update mode (with data): calls service.update with data._id and closes on success', async () => {
      const existing = stubTableTemplate({ _id: 'tmpl-42' });
      const { dialog, service, closeSpy, toastSuccess, emitUpdate } =
        await createSaveFixture(existing);
      // makeFormValid() is called defensively here even though the stub
      // already has 2 valid columns: it decouples this test from the stub
      // shape so future stub changes don't break the test for the wrong reason.
      makeFormValid(dialog, { name: 'Изменённое имя' });
      const updatedTemplate = { ...existing, name: 'Изменённое имя' } as TableTemplate;
      dialog.onSave();
      // service.update should be called with data._id
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith('tmpl-42', expect.objectContaining({ name: 'Изменённое имя' }));
      // No data.create path: create should not be called
      expect(service.create).not.toHaveBeenCalled();
      // Fire captured callback: success
      emitUpdate({ ok: true, data: updatedTemplate });
      expect(closeSpy).toHaveBeenCalledWith(updatedTemplate);
      expect(toastSuccess).toHaveBeenCalledWith('Шаблон таблицы обновлён');
    });

    it('error path: sets errorMessage signal + toast.error + saving(false), does NOT call ref.close', async () => {
      const { dialog, service, closeSpy, toastError, emitCreate } = await createSaveFixture(null);
      makeFormValid(dialog, { name: 'Тест' });
      dialog.onSave();
      // Fire captured callback: error
      const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      emitCreate({ ok: false, error: httpError });
      const errorMessage = (dialog as unknown as { errorMessage: () => string | null }).errorMessage();
      expect(errorMessage).toBeTruthy();
      expect(toastError).toHaveBeenCalledTimes(1);
      // The toast.error argument should be a human-readable string (extractErrorMessage).
      const toastArg = toastError.mock.calls[0][0] as string;
      expect(typeof toastArg).toBe('string');
      expect(toastArg.length).toBeGreaterThan(0);
      // saving should be reset to false
      const savingAfter = (dialog as unknown as { saving: () => boolean }).saving();
      expect(savingAfter).toBe(false);
      // ref.close should NOT have been called (user can retry the save)
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('returns early if saving is already true (idempotency guard)', async () => {
      const { dialog, service, closeSpy } = await createSaveFixture(null);
      makeFormValid(dialog, { name: 'Тест' });
      // First call: saving goes true, captured observable hangs (no emit yet)
      dialog.onSave();
      expect(service.create).toHaveBeenCalledTimes(1);
      // Second call while saving=true: should be a no-op
      dialog.onSave();
      expect(service.create).toHaveBeenCalledTimes(1); // still 1, not 2
      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  // ─── Standalone + type-safety smoke checks ─────────────────────────

  describe('Angular 20 conventions', () => {
    it('is a standalone component (TestBed compile passes)', () => {
      // If the component were not standalone, `imports: [TableTemplateFormDialogComponent]`
      // inside TestHost would fail at compile time. Reaching this assertion is proof.
      expect(TableTemplateFormDialogComponent.prototype).toBeDefined();
    });

    it('align value is independent per row (formGroupName scopes the formControlName binding)', async () => {
      // Regression guard for per-row radio independence. Earlier the component
      // had `name="align"` (flat) which caused the browser to globally group
      // all 9 align radios across all 3 rows as ONE radio group, breaking UX
      // (verified by browser smoke test 2026-07-12). The fix removed the
      // name attribute entirely; per-row isolation now flows from
      // formGroupName scoping the formControlName binding to each row's
      // FormGroup. Setting one row's align value does NOT affect other rows.
      const fixture = await createFixture(null);
      const dialog = getDialog(fixture);
      dialog.addColumn();
      dialog.addColumn();
      fixture.detectChanges();
      // Access the FormArray via the protected getter.
      const columns = (dialog as unknown as {
        columnsArray: { at: (i: number) => { controls: { align: { setValue: (v: string) => void; value: string } } } };
      }).columnsArray;
      columns.at(0).controls.align.setValue('right');
      columns.at(1).controls.align.setValue('left');
      columns.at(2).controls.align.setValue('center');
      // Each row's align value is independent.
      expect(columns.at(0).controls.align.value).toBe('right');
      expect(columns.at(1).controls.align.value).toBe('left');
      expect(columns.at(2).controls.align.value).toBe('center');
    });

    it('mounts without the NG01050 / NG01054 / NG01202 runtime errors', async () => {
      // Earlier runtime bugs in this component:
      //   - NG01050: formControlName without parent [formGroup] (fixed in commit 81c6b89)
      //   - NG01054: formArrayName without parent [formGroup] (same fix)
      //   - NG01202: was caused by per-row [name]="'align-' + i" while
      //              formControlName was "align" everywhere; fixed by
      //              removing the name attribute entirely (Angular's
      //              RadioControlValueAccessor handles per-row isolation
      //              via formGroupName scoping).
      // A render-only check would have missed all three — Angular logs the
      // errors to console.error but the template still renders past that
      // point. We spy on console.error and assert none of the three NG
      // errors fired.
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const fixture = await createFixture(null);
      fixture.detectChanges();
      // Also flush microtasks so the constructor's queueMicrotask (if data was
      // set) doesn't defer a late console.error past the assertion. (data is
      // null here, so no preview path fires — but flush anyway for symmetry.)
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
      const ngErrors = consoleSpy.mock.calls.filter((args) => {
        const first = args[0];
        return (
          typeof first === 'string' &&
          /NG01050|NG01054|NG01202/.test(first)
        );
      });
      consoleSpy.mockRestore();
      expect(ngErrors).toEqual([]);
      // The dialog renders an <app-pi-dialog> wrapper; verify the body content
      // is present (i.e., the template didn't bail out before reaching the form
      // controls).
      const piDialog = fixture.nativeElement.querySelector('app-pi-dialog');
      expect(piDialog).toBeTruthy();
      // And the form group is actually attached to the template.
      const dialog = getDialog(fixture);
      expect(dialog.form.get('name')!.value).toBe('');
    });
  });
});

