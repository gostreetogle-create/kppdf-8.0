import { Types } from 'mongoose';
import {
  injectTableContent,
  mapLineItemsToRows,
  renderStudioTableHtml,
  StudioDataResolverService,
} from './studio-data-resolver';
import type { TemplateBlockDocument } from '../template-block/template-block.schema';

describe('studio-data-resolver utils (TZ-DOC-STUDIO-1601)', () => {
  const columns = [
    { key: 'name', label: 'Наименование' },
    { key: 'qty', label: 'Кол-во' },
    { key: 'price', label: 'Цена' },
  ];

  it('maps quotation line items to table rows by column key', () => {
    const rows = mapLineItemsToRows(
      [
        {
          productName: 'Стол',
          quantity: 2,
          unitPrice: 1500,
          total: 3000,
        },
      ],
      columns,
    );
    expect(rows).toEqual([['Стол', '2', '1500']]);
  });

  it('renders table HTML with escaped cell values', () => {
    const html = renderStudioTableHtml(columns, [['<b>Тест</b>', '1', '99']]);
    expect(html).toContain('<table');
    expect(html).toContain('&lt;b&gt;Тест&lt;/b&gt;');
    expect(html).toContain('99');
  });

  it('injects resolved rows into table block content', () => {
    const blockId = new Types.ObjectId();
    const block = {
      _id: blockId,
      type: 'table',
      order: 0,
      isActive: true,
      showLine: false,
      settings: { tableTemplateColumns: columns },
    } as unknown as TemplateBlockDocument;

    const [rendered] = injectTableContent([block], [
      {
        key: `table-${blockId.toString()}`,
        source: { type: 'manual' },
        rows: [['Диван', '1', '5000']],
      },
    ]);

    expect(rendered.content).toContain('Диван');
    expect(rendered.content).toContain('5000');
  });
});

describe('StudioDataResolverService (TZ-DOC-STUDIO-1601)', () => {
  const blockId = new Types.ObjectId();
  const orgId = new Types.ObjectId();
  const quotationId = new Types.ObjectId().toString();

  const tableBlock = {
    _id: blockId,
    type: 'table',
    order: 0,
    isActive: true,
    showLine: false,
    settings: {
      tableTemplateColumns: [
        { key: 'name', label: 'Наименование' },
        { key: 'qty', label: 'Кол-во' },
        { key: 'price', label: 'Цена' },
      ],
    },
  } as unknown as TemplateBlockDocument;

  function createResolver(items: Array<Record<string, unknown>> = []) {
    const quotationService = {
      findById: jest.fn().mockResolvedValue({
        organizationId: orgId,
        items,
      }),
    };
    const orderService = { findById: jest.fn() };
    return {
      service: new StudioDataResolverService(
        quotationService as never,
        orderService as never,
      ),
      quotationService,
    };
  }

  it('live-reads quotation-items for draft documents', async () => {
    const { service } = createResolver([
      { productName: 'Кресло', quantity: 3, unitPrice: 200 },
    ]);
    const doc = {
      organizationId: orgId,
      status: 'draft',
      context: { quotationId },
      dataSets: [
        {
          key: `table-${blockId.toString()}`,
          source: { type: 'quotation-items' },
          rows: [],
        },
      ],
    };

    const resolved = await service.resolveDataSets(doc as never, [tableBlock], true);

    expect(resolved[0]).toMatchObject({
      rows: [['Кресло', '3', '200']],
    });
  });

  it('bakeSnapshot converts ERP source to manual with rows', async () => {
    const { service } = createResolver([
      { productName: 'Шкаф', quantity: 1, unitPrice: 9000 },
    ]);
    const doc = {
      organizationId: orgId,
      status: 'draft',
      context: { quotationId },
      dataSets: [
        {
          key: `table-${blockId.toString()}`,
          source: { type: 'quotation-items' },
          rows: [],
        },
      ],
    };

    const baked = await service.bakeSnapshot(doc as never, [tableBlock]);

    expect(baked[0]).toMatchObject({
      source: { type: 'manual', bakedFrom: 'quotation-items' },
      rows: [['Шкаф', '1', '9000']],
    });
  });
});
