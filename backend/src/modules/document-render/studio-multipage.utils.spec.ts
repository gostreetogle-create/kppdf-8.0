import { Types } from 'mongoose';
import type { TemplateBlockDocument } from '../template-block/template-block.schema';
import {
  buildStudioTableHtml,
  planStudioMultipage,
} from './studio-multipage.utils';

function tableBlock(
  id: string,
  page: number,
): TemplateBlockDocument {
  return {
    _id: new Types.ObjectId(id),
    type: 'table',
    order: 0,
    showLine: false,
    isActive: true,
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Name' },
        { key: 'qty', label: 'Qty' },
      ],
    },
    layout: { page, x: 0.1, y: 0.2, width: 0.8, height: 0.3, zIndex: 1, rotation: 0 },
  } as unknown as TemplateBlockDocument;
}

describe('studio-multipage.utils (TZ-DOC-STUDIO-1701)', () => {
  it('buildStudioTableHtml renders columns and rows', () => {
    const html = buildStudioTableHtml(
      [{ key: 'a', label: 'A' }],
      [['hello']],
    );
    expect(html).toContain('pi-table');
    expect(html).toContain('hello');
  });

  it('plans manual pages with per-page background index', () => {
    const textBlock = {
      type: 'text',
      order: 0,
      showLine: false,
      isActive: true,
      content: '<p>Page 2</p>',
      layout: { page: 2, x: 0.1, y: 0.1, width: 0.5, zIndex: 1, rotation: 0 },
    } as unknown as TemplateBlockDocument;

    const plan = planStudioMultipage({
      blocks: [textBlock],
      manualPageCount: 2,
      dataSets: [],
      backgroundImages: ['/bg1.png', '/bg2.png'],
      defaultBackgroundIndex: 0,
    });

    expect(plan).toHaveLength(2);
    expect(plan[0].blocks).toHaveLength(0);
    expect(plan[1].blocks).toHaveLength(1);
    expect(plan[0].backgroundIndex).toBe(0);
    expect(plan[1].backgroundIndex).toBe(1);
  });

  it('uses configured first-page row capacity', () => {
    const blockId = '507f1f77bcf86cd799439011';
    const rows = Array.from({ length: 8 }, (_, i) => [`Row ${i}`, `${i}`]);
    const plan = planStudioMultipage({
      blocks: [tableBlock(blockId, 1)],
      manualPageCount: 1,
      dataSets: [{ key: `table-${blockId}`, rows }],
      backgroundImages: [],
      defaultBackgroundIndex: -1,
      sheetLayout: { rowsFirstPage: 5, rowsNextPage: 5 },
    });
    expect(plan[0].blocks[0]?.content).toContain('Row 4');
    expect(plan[0].blocks[0]?.content).not.toContain('Row 5');
  });

  it('splits overflowing table rows across pages', () => {
    const blockId = '507f1f77bcf86cd799439011';
    const manyRows = Array.from({ length: 30 }, (_, i) => [`Row ${i}`, `${i}`]);
    const plan = planStudioMultipage({
      blocks: [tableBlock(blockId, 1)],
      manualPageCount: 1,
      dataSets: [
        {
          key: `table-${blockId}`,
          rows: manyRows,
        },
      ],
      backgroundImages: [],
      defaultBackgroundIndex: -1,
    });

    expect(plan.length).toBeGreaterThan(1);
    const tablePages = plan.filter((page) =>
      page.blocks.some((block) => block.type === 'table'),
    );
    expect(tablePages.length).toBeGreaterThan(1);
  });
});
