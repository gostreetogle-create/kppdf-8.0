import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import type { RegistryDataField, RegistryDataSource } from '@kppdf/data-access';
import {
  StudioDataFieldPickerDialogComponent,
  type StudioDataFieldSelection,
} from './studio-data-field-picker-dialog.component';

interface TestableComponent {
  pickSource: (src: RegistryDataSource) => void;
  selectField: (field: RegistryDataField) => void;
  selectedSource: () => RegistryDataSource | null;
  isDisabled: (key: string) => boolean;
  groupedSources: () => ReadonlyArray<{ key: string; sources: readonly RegistryDataSource[] }>;
}

const SOURCES: RegistryDataSource[] = [
  {
    key: 'organization',
    label: 'Наша фирма',
    group: 'contacts',
    fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
  },
  {
    key: 'counterparty',
    label: 'Клиент',
    group: 'contacts',
    fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
  },
  {
    key: 'invoice',
    label: 'Счёт',
    group: 'contacts',
    fields: [{ key: 'number', label: 'Номер счёта', type: 'text' }],
  },
  {
    key: 'product',
    label: 'Продукция',
    group: 'catalog',
    fields: [{ key: 'name', label: 'Наименование', type: 'text' }],
  },
];

function sectionSource(component: TestableComponent, sectionKey: string): RegistryDataSource {
  const section = component.groupedSources().find((g) => g.key === sectionKey);
  const src = section?.sources[0];
  if (!src) throw new Error(`Section ${sectionKey} not found in groupedSources()`);
  return src;
}

describe('StudioDataFieldPickerDialogComponent', () => {
  let fixture: ComponentFixture<StudioDataFieldPickerDialogComponent>;
  let closeSpy: jest.Mock;
  let component: TestableComponent;

  beforeEach(async () => {
    closeSpy = jest.fn();
    await TestBed.configureTestingModule({
      imports: [StudioDataFieldPickerDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { sources: SOURCES, columnIndex: 0 } },
        { provide: PI_DIALOG_REF, useValue: { close: closeSpy } as unknown as DialogRef<StudioDataFieldSelection | null> },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioDataFieldPickerDialogComponent);
    component = fixture.componentInstance as unknown as TestableComponent;
    fixture.detectChanges();
  });

  it('inserts a plain counterparty token for the «Клиент» section', async () => {
    const src = sectionSource(component, 'contacts-counterparty');
    component.pickSource(src);
    component.selectField(src.fields?.[0] as RegistryDataField);
    await Promise.resolve();

    expect(closeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'counterparty', field: expect.objectContaining({ key: 'name' }) }),
    );
  });

  it('inserts an anchor.payer token — not counterparty — for the «Плательщик» section', async () => {
    const src = sectionSource(component, 'contacts-payer');
    expect(src.key).toBe('payer');
    component.pickSource(src);
    component.selectField(src.fields?.[0] as RegistryDataField);
    await Promise.resolve();

    expect(closeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'anchor.payer', field: expect.objectContaining({ key: 'name' }) }),
    );
  });

  it('inserts an anchor.supplier token for the «Поставщик» section', async () => {
    const src = sectionSource(component, 'contacts-supplier');
    expect(src.key).toBe('supplier');
    component.pickSource(src);
    component.selectField(src.fields?.[0] as RegistryDataField);
    await Promise.resolve();

    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ source: 'anchor.supplier' }));
  });

  it('marks unbound sources (invoice/product) disabled and does not select them on click', () => {
    expect(component.isDisabled('invoice')).toBe(true);
    expect(component.isDisabled('product')).toBe(true);
    expect(component.isDisabled('counterparty')).toBe(false);

    const invoiceSource = SOURCES.find((s) => s.key === 'invoice');
    expect(invoiceSource).toBeDefined();
    component.pickSource(invoiceSource as RegistryDataSource);

    expect(component.selectedSource()).toBeNull();
  });

  it('renders a disabled row and hint text for invoice in the DOM', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = Array.from(el.querySelectorAll('.dfpd-source-row')) as HTMLButtonElement[];
    const invoiceButton = buttons.find((b) => b.textContent?.includes('Счёт'));
    expect(invoiceButton?.disabled).toBe(true);
    expect(el.querySelector('[data-test="studio-data-source-disabled-hint"]')).toBeTruthy();
  });
});
