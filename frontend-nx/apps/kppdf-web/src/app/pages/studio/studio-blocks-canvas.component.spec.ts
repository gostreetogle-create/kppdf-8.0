import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { StudioBlocksCanvasComponent } from './studio-blocks-canvas.component';
import type { StudioBlock } from '@kppdf/data-access';

/**
 * TZ-NX-DOCSTUDIO-S45 — the canvas is print-like: clicking a manual table only
 * selects it (no inline `.table-edit` grid on the A4 sheet) and asks the host to
 * open Свойства; empty tables show a placeholder row instead of a bare thead.
 */
describe('StudioBlocksCanvasComponent — S45 print-like tables', () => {
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

  let fixture: ComponentFixture<StudioBlocksCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudioBlocksCanvasComponent] }).compileComponents();
  });

  function createCanvas(blocks: readonly StudioBlock[]): StudioBlocksCanvasComponent {
    fixture = TestBed.createComponent(StudioBlocksCanvasComponent);
    fixture.componentRef.setInput('blocks', [...blocks]);
    fixture.componentRef.setInput('selectedId', null);
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('manual selected table keeps the document-like preview and emits tableEditRequest', () => {
    const component = createCanvas([TABLE]);
    fixture.componentRef.setInput('selectedId', 'tbl-1');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    // No admin-grid on the sheet…
    expect(host.querySelector('[data-test="studio-table-rows-editor"]')).toBeNull();
    expect(host.querySelector('.table-edit')).toBeNull();
    // …the print-like preview stays…
    expect(host.querySelector('.table-preview table')).not.toBeNull();
    // …and the selection frame + handle are present.
    expect(host.querySelector('.selection-frame')).not.toBeNull();

    const editSpy = jest.fn();
    component.tableEditRequest.subscribe(editSpy);
    const article = host.querySelector<HTMLElement>('article.studio-block--table')!;
    article.click();
    expect(editSpy).toHaveBeenCalledWith('tbl-1');
  });

  it('empty manual table renders a placeholder row, not a bare thead', () => {
    createCanvas([{ ...TABLE, settings: { ...TABLE.settings, tableTemplateSampleRows: [] } }]);

    const host: HTMLElement = fixture.nativeElement;
    const emptyRow = host.querySelector('.table-preview__empty');
    expect(emptyRow).not.toBeNull();
    expect(emptyRow!.textContent).toContain('Нет строк');
  });

  it('table click is a single selection gesture — no row inputs to fight drag', () => {
    const component = createCanvas([TABLE]);
    fixture.componentRef.setInput('selectedId', 'tbl-1');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.table-preview input[type="text"]')).toBeNull();
    expect(host.querySelector('.table-preview input[type="checkbox"]')).toBeNull();
  });
});
