import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiTableTemplatesService } from '@kppdf/data-access';
import type { StudioBlock } from '@kppdf/data-access';
import { StudioTablePropertiesComponent } from './studio-table-properties.component';

/**
 * TZ-NX-DOCSTUDIO-S45 — row editing lives in Свойства (moved off the A4 canvas):
 * manual tables get the «Строки таблицы» grid with + Строка; live-source tables
 * get a read-only hint instead of a duplicate write path.
 */
describe('StudioTablePropertiesComponent — S45 rows editor', () => {
  const TABLE: StudioBlock = {
    _id: 'tbl-1',
    type: 'table',
    order: 0,
    title: 'Витрина',
    content: '',
    layout: { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.4, zIndex: 1, rotation: 0 },
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
        { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
      ],
      tableTemplateSampleRows: [
        ['Кровать «Ночной сон»', '2'],
        ['Стол «Обеденный»', '1'],
      ],
    },
  };

  let fixture: ComponentFixture<StudioTablePropertiesComponent>;
  const templatesService = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTablePropertiesComponent],
      providers: [{ provide: PiTableTemplatesService, useValue: templatesService }],
    }).compileComponents();
  });

  function create(block: StudioBlock): StudioTablePropertiesComponent {
    fixture = TestBed.createComponent(StudioTablePropertiesComponent);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('manual table shows the rows editor with + Строка and emits rows changes', () => {
    const component = create(TABLE);
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).not.toBeNull();
    expect(host.querySelector('[data-test="studio-table-add-row"]')).not.toBeNull();

    const rowsSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);
    (host.querySelector<HTMLButtonElement>('[data-test="studio-table-add-row"]')!).click();
    expect(rowsSpy).toHaveBeenCalledTimes(1);
    const emitted = rowsSpy.mock.calls[0]![0] as string[][];
    expect(emitted).toHaveLength(3);
    expect(emitted[2]).toEqual(['', '']);
  });

  it('cell edit emits the updated matrix', () => {
    const component = create(TABLE);
    const rowsSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);

    const input = fixture.nativeElement.querySelector<HTMLInputElement>('[data-test="studio-table-cell-0-0"]')!;
    input.value = 'Диван';
    input.dispatchEvent(new Event('input'));

    expect(rowsSpy).toHaveBeenCalledTimes(1);
    const emitted = rowsSpy.mock.calls[0]![0] as string[][];
    expect(emitted[0]![0]).toBe('Диван');
    expect(emitted[1]![0]).toBe('Стол «Обеденный»');
  });

  it('row remove emits filtered rows and remapped disabled indices', () => {
    const component = create({
      ...TABLE,
      settings: { ...TABLE.settings, tableDisabledRowIndices: [1] },
    });
    const rowsSpy = jest.fn();
    const disabledSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);
    component.disabledRowsChange.subscribe(disabledSpy);

    (fixture.nativeElement.querySelector<HTMLButtonElement>('[data-test="studio-table-row-remove-0"]')!).click();

    // Removing row 0: disabled row 1 survives and shifts up to index 0.
    expect(disabledSpy).toHaveBeenCalledWith([0]);
    expect(rowsSpy).toHaveBeenCalledWith([['Стол «Обеденный»', '1']]);
  });

  it('live-source table shows a hint instead of the manual rows editor', () => {
    create({ ...TABLE, settings: { ...TABLE.settings, dataSource: { type: 'catalog-products' } } });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).toBeNull();
    expect(host.querySelector('[data-test="studio-table-rows-live-hint"]')).not.toBeNull();
  });
});
