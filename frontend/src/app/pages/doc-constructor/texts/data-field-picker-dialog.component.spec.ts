import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DataSourceDescriptor } from '../../../shared/services/pi-registry.service';
import {
  DataFieldPickerDialogComponent,
  type DataFieldPickerDialogData,
} from './data-field-picker-dialog.component';

describe('DataFieldPickerDialogComponent', () => {
  let fixture: ComponentFixture<DataFieldPickerDialogComponent>;

  const mockSources: DataSourceDescriptor[] = [
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
      fields: [
        { key: 'name', label: 'Наименование', type: 'text' },
        { key: 'siteAddress', label: 'Адрес объекта', type: 'text' },
      ],
    },
  ];

  beforeEach(async () => {
    const data: DataFieldPickerDialogData = { sources: mockSources, columnIndex: 0 };

    await TestBed.configureTestingModule({
      imports: [DataFieldPickerDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataFieldPickerDialogComponent);
    fixture.detectChanges();
  });

  it('renders source labels from the injected registry data (no local hardcode)', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Наша фирма');
    expect(text).toContain('Клиент');
    expect(text).toContain('Наша фирма (бланк)');
    expect(text).toContain('Клиент (получатель)');
  });

  it('prefixes field labels with source name', () => {
    const component = fixture.componentInstance as unknown as {
      pickSource: (src: DataSourceDescriptor) => void;
    };
    component.pickSource(mockSources[0]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Наша фирма · Наименование');
  });

  it('shows counterparty siteAddress field after picking the source', () => {
    const component = fixture.componentInstance as unknown as {
      pickSource: (src: DataSourceDescriptor) => void;
    };
    component.pickSource(mockSources[1]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Адрес объекта');
  });
});
