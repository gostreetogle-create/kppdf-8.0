import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiRegistryDataSourcesService, PiTableTemplatesService } from '@kppdf/data-access';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { TableTemplateFormDialogComponent } from './table-template-form-dialog.component';

describe('TableTemplateFormDialogComponent (TZ-NX-REGISTRIES-BROWSER-MATRIX-2)', () => {
  // Live browser matrix found this dialog crashing on open: "Cannot find
  // control with name: 'columns'" -- the template's formArrayName="columns"
  // had no matching FormArray registered on the parent form (columns were a
  // separate signal). This spec locks the fix (a real FormArray inside the
  // reactive form) so it can't regress silently again.
  let fixture: ComponentFixture<TableTemplateFormDialogComponent>;
  const close = jest.fn();
  const create = jest.fn().mockReturnValue(
    of({ ok: true as const, data: { _id: 'tt-1', name: 'Test', category: 'custom', sortOrder: 0, columns: [] } }),
  );

  beforeEach(async () => {
    close.mockReset();
    create.mockClear();
    await TestBed.configureTestingModule({
      imports: [TableTemplateFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: PI_DIALOG_REF, useValue: { close } as DialogRef<unknown> },
        { provide: PiRegistryDataSourcesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiTableTemplatesService, useValue: { create, update: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableTemplateFormDialogComponent);
    fixture.detectChanges();
  });

  it('renders the default column row without throwing "Cannot find control with name: columns"', () => {
    expect(fixture.nativeElement.querySelector('input[placeholder="key*"]')).toBeTruthy();
  });

  it('addColumn/removeColumn mutate a real FormArray registered on the form', () => {
    const component = fixture.componentInstance;
    expect(component['columnsArray'].length).toBe(1);
    component['addColumn']();
    fixture.detectChanges();
    expect(component['columnsArray'].length).toBe(2);
    component['removeColumn'](0);
    fixture.detectChanges();
    expect(component['columnsArray'].length).toBe(1);
  });

  it('includes filled-in columns in the create payload', async () => {
    const component = fixture.componentInstance;
    component['form'].patchValue({ name: 'Спецификация' });
    component['columnsArray'].at(0).patchValue({ key: 'qty', label: 'Кол-во' });
    await component['submit']();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Спецификация',
        columns: [expect.objectContaining({ key: 'qty', label: 'Кол-во' })],
      }),
    );
    expect(close).toHaveBeenCalled();
  });
});
