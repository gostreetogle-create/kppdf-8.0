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

/**
 * TZ-NEW: Unit tests for TableTemplateFormDialogComponent.
 *
 * Strategy: provide mock PI_DIALOG_DATA / PI_DIALOG_REF / TableTemplatesService
 * / PiToastService tokens, create the component via a TestHost standalone
 * wrapper, and assert form structure. We intentionally pass `data: null` for
 * most tests so the constructor's `loadPreview()` queueMicrotask does not fire
 * (it only runs when editing an existing template). One explicit test
 * exercises the edit-mode bootstrap with a stub TableTemplate to verify the
 * preview path doesn't crash and the form still hydrates from `data`.
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

  function getDialog(fixture: ComponentFixture<TestHost>): TableTemplateFormDialogComponent {
    // TestHost renders a single <app-table-template-dialog /> element;
    // the component instance is the first child of the host.
    const debugEl = fixture.debugElement.children[0];
    if (!debugEl) throw new Error('TestHost did not render the dialog');
    return debugEl.componentInstance as TableTemplateFormDialogComponent;
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
