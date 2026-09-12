import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Types } from 'mongoose';
import {
  ensureTableDataSetsFromBlocks,
  injectTableContent,
  mapLineItemsToRows,
  renderStudioTableHtml,
  sampleRowsFromBlock,
  StudioDataResolverService,
} from './studio-data-resolver';
import type { TemplateBlockDocument } from '../template-block/template-block.schema';

/** TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE — real file on disk, same convention as document-render.utils.spec.ts's PDF-inline fixture. */
const PHOTO_SMOKE_DIR = join(process.cwd(), 'uploads', 'studio-photo-smoke-test');
const EXISTING_PHOTO_URL = '/uploads/studio-photo-smoke-test/stol.webp';

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

  it('maps photo/description/article aliases by key, not position (TZ-NX-DOCSTUDIO-S47)', () => {
    const poCanonColumns = [
      { key: 'article', label: 'Артикул' },
      { key: 'photo', label: 'Фото' },
      { key: 'productName', label: 'Наименование' },
      { key: 'description', label: 'Описание' },
      { key: 'unit', label: 'Ед.Изм.' },
      { key: 'unitPrice', label: 'Цена' },
    ];
    const rows = mapLineItemsToRows(
      [
        {
          productName: 'Мангал',
          productSku: 'SKU-1',
          unit: 'шт',
          unitPrice: 4500,
          description: 'Складной мангал',
          photoUrl: '/uploads/mangal.webp',
        },
      ],
      poCanonColumns,
    );
    expect(rows).toEqual([['SKU-1', '/uploads/mangal.webp', 'Мангал', 'Складной мангал', 'шт', '4500']]);
  });

  it('treats `article` as an alias of sku (acceptance criterion 4)', () => {
    const rows = mapLineItemsToRows(
      [{ productSku: 'ART-9' }],
      [{ key: 'article', label: 'Артикул' }],
    );
    expect(rows).toEqual([['ART-9']]);
  });

  it('renders table HTML with escaped cell values', () => {
    const html = renderStudioTableHtml(columns, [['<b>Тест</b>', '1', '99']]);
    expect(html).toContain('<table');
    expect(html).toContain('&lt;b&gt;Тест&lt;/b&gt;');
    expect(html).toContain('99');
  });

  it('renders a photo column as an <img> thumbnail, not the raw URL text (TZ-NX-DOCSTUDIO-S48)', () => {
    const html = renderStudioTableHtml(
      [{ key: 'photo', label: 'Фото' }, { key: 'name', label: 'Наименование' }],
      [['/uploads/mangal.webp', 'Мангал']],
    );
    expect(html).toContain('<img src="/uploads/mangal.webp" alt=""');
    expect(html).not.toContain('>/uploads/mangal.webp<');
    // Default (no frame, no block override): same contain/center/48px as before.
    expect(html).toContain('object-fit:contain');
    expect(html).toContain('object-position:50% 50%');
    expect(html).toContain('max-height:48px');
  });

  it('TZ-NX-PO-SWEEP-05: applies the photo\'s own frame (cover + pan) to the cell', () => {
    const html = renderStudioTableHtml(
      [{ key: 'photo', label: 'Фото' }],
      [['/uploads/mangal.webp']],
      [],
      20,
      { frames: { '/uploads/mangal.webp': { fit: 'cover', posX: 30, posY: 70 } } },
    );
    expect(html).toContain('object-fit:cover');
    expect(html).toContain('object-position:30% 70%');
  });

  it('TZ-NX-PO-SWEEP-05: block «Фото в ячейке» fit override wins over the photo\'s own frame.fit, but pan stays from the frame', () => {
    const html = renderStudioTableHtml(
      [{ key: 'photo', label: 'Фото' }],
      [['/uploads/mangal.webp']],
      [],
      20,
      { frames: { '/uploads/mangal.webp': { fit: 'cover', posX: 30, posY: 70 } }, fit: 'contain', maxHeightPx: 64 },
    );
    expect(html).toContain('object-fit:contain');
    expect(html).toContain('object-position:30% 70%');
    expect(html).toContain('max-height:64px');
  });

  it('renders «Нет фото» for an empty photo cell instead of a blank/qty-looking cell', () => {
    const html = renderStudioTableHtml(
      [{ key: 'photo', label: 'Фото' }, { key: 'name', label: 'Наименование' }],
      [['', 'Мангал']],
    );
    expect(html).toContain('<span class="pi-photo-empty">Нет фото</span>');
  });

  it('escapes a double quote in a photo URL so it cannot break out of the src attribute', () => {
    const html = renderStudioTableHtml(
      [{ key: 'photo', label: 'Фото' }],
      [['"><script>alert(1)</script>']],
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&quot;');
  });

  it('renders subtotal and VAT footer for sum columns', () => {
    const html = renderStudioTableHtml(
      [{ key: 'name', label: 'Наименование' }, { key: 'sum', label: 'Сумма', type: 'sum' }, { key: 'vat', label: 'НДС', type: 'vat' }],
      [['A', '1000', '']],
    );
    expect(html).toContain('Итого');
    expect(html).toContain('НДС (20%)');
    expect(html).toContain('200');
  });

  it('uses organization vat rate percent in footer (S22)', () => {
    const html = renderStudioTableHtml(
      [{ key: 'name', label: 'Name' }, { key: 'sum', label: 'Sum', type: 'sum' }, { key: 'vat', label: 'VAT', type: 'vat' }],
      [['A', '1000', '']],
      [],
      22,
    );
    expect(html).toContain('НДС (22%)');
    expect(html).toContain('220');
  });

  it('renders sum footer and ignores disabled rows', () => {
    const html = renderStudioTableHtml(
      [{ key: 'name', label: 'Name' }, { key: 'sum', label: 'Total', type: 'sum' }],
      [['A', '10'], ['B', '20'], ['C', '30']],
      [1],
    );
    expect(html).toContain('<tfoot>');
    expect(html).toContain('<td>40</td>');
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

  it('TZ-NX-PO-SWEEP-05: injectTableContent applies photoFrames + block tablePhotoDisplay to a photo cell', () => {
    const blockId = new Types.ObjectId();
    const block = {
      _id: blockId,
      type: 'table',
      order: 0,
      isActive: true,
      showLine: false,
      settings: {
        tableTemplateColumns: [{ key: 'photo', label: 'Фото' }],
        tablePhotoDisplay: { fit: null, maxHeightPx: 40 },
      },
    } as unknown as TemplateBlockDocument;

    const [rendered] = injectTableContent([block], [
      {
        key: `table-${blockId.toString()}`,
        source: { type: 'catalog-products' },
        rows: [['/uploads/mangal.webp']],
        photoFrames: { '/uploads/mangal.webp': { fit: 'cover', posX: 10, posY: 90 } },
      },
    ]);

    expect(rendered.content).toContain('object-fit:cover');
    expect(rendered.content).toContain('object-position:10% 90%');
    expect(rendered.content).toContain('max-height:40px');
  });

  it('reads manual sample rows from block settings', () => {
    const block = {
      _id: new Types.ObjectId(),
      type: 'table',
      settings: {
        tableTemplateSampleRows: [['Стол', '2', '1500']],
        tableTemplateDisabledRows: [1],
      },
    } as unknown as TemplateBlockDocument;
    expect(sampleRowsFromBlock(block)).toEqual([['Стол', '2', '1500']]);
  });

  it('synthesizes dataSets from table blocks when document has none', () => {
    const blockId = new Types.ObjectId();
    const block = {
      _id: blockId,
      type: 'table',
      settings: {
        tableTemplateColumns: columns,
        tableTemplateSampleRows: [['Кресло', '1', '900']],
      },
    } as unknown as TemplateBlockDocument;
    const dataSets = ensureTableDataSetsFromBlocks([block], []);
    expect(dataSets).toEqual([
      {
        key: `table-${blockId.toString()}`,
        source: { type: 'manual' },
        rows: [['Кресло', '1', '900']],
      },
    ]);
  });
});

describe('StudioDataResolverService (TZ-DOC-STUDIO-1601)', () => {
  const blockId = new Types.ObjectId();
  const orgId = new Types.ObjectId();
  const quotationId = new Types.ObjectId().toString();

  beforeAll(async () => {
    await mkdir(PHOTO_SMOKE_DIR, { recursive: true });
    await writeFile(join(PHOTO_SMOKE_DIR, 'stol.webp'), Buffer.from([0x52, 0x49, 0x46, 0x46]));
  });

  afterAll(async () => {
    await rm(PHOTO_SMOKE_DIR, { recursive: true, force: true });
  });

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
    const productModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
    const moduleModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
    const materialModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
    const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
    const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
    return {
      service: new StudioDataResolverService(
        quotationService as never,
        orderService as never,
        productModel as never,
        moduleModel as never,
        materialModel as never,
        orgModel as never,
        photoModel as never,
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

  it('resolves selected catalog products into rows', async () => {
    const product = new Types.ObjectId();
    const productModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200 }]) }) };
    const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
    const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
    const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
    const resolved = await resolver.resolveDataSets({ organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never, [tableBlock], true);
    expect(resolved[0]).toMatchObject({ rows: [['Стол', '1', '1200']] });
  });

  it('resolves catalog products into a PO-canon 6-key table without positional leaks (TZ-NX-DOCSTUDIO-S47)', async () => {
    const product = new Types.ObjectId();
    const photo = new Types.ObjectId();
    const productModel = {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            _id: product,
            name: 'Стол',
            sku: 'P-1',
            unit: 'шт',
            listPrice: 1200,
            description: 'Дубовый стол',
            mainPhotoId: photo,
          },
        ]),
      }),
    };
    const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
    const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: photo, storageUrl: EXISTING_PHOTO_URL }]) }) };
    const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
    const poCanonBlock = {
      ...tableBlock,
      settings: {
        tableTemplateColumns: [
          { key: 'article', label: 'Артикул' },
          { key: 'photo', label: 'Фото' },
          { key: 'productName', label: 'Наименование' },
          { key: 'description', label: 'Описание' },
          { key: 'unit', label: 'Ед.Изм.' },
          { key: 'unitPrice', label: 'Цена' },
        ],
      },
    } as unknown as TemplateBlockDocument;

    const resolved = await resolver.resolveDataSets(
      { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
      [poCanonBlock],
      true,
    );

    expect(resolved[0]).toMatchObject({
      rows: [['P-1', EXISTING_PHOTO_URL, 'Стол', 'Дубовый стол', 'шт', '1200']],
    });
  });

  it('TZ-NX-PO-SWEEP-05: resolved entry carries the photo\'s РАМКА (frame), keyed by its resolved URL', async () => {
    const product = new Types.ObjectId();
    const photo = new Types.ObjectId();
    const productModel = {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200, mainPhotoId: photo },
        ]),
      }),
    };
    const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
    const photoModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: photo, storageUrl: EXISTING_PHOTO_URL, frame: { fit: 'cover', posX: 20, posY: 80 } },
        ]),
      }),
    };
    const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);

    const resolved = await resolver.resolveDataSets(
      { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
      [tableBlock],
      true,
    );

    expect(resolved[0]).toMatchObject({
      photoFrames: { [EXISTING_PHOTO_URL]: { fit: 'cover', posX: 20, posY: 80 } },
    });
  });

  it('TZ-NX-PO-SWEEP-05: no frame on the photo → no photoFrames entry for it (renderer falls back to contain/center)', async () => {
    const product = new Types.ObjectId();
    const photo = new Types.ObjectId();
    const productModel = {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200, mainPhotoId: photo },
        ]),
      }),
    };
    const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
    const photoModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ _id: photo, storageUrl: EXISTING_PHOTO_URL }]),
      }),
    };
    const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);

    const resolved = await resolver.resolveDataSets(
      { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
      [tableBlock],
      true,
    );

    expect((resolved[0] as { photoFrames?: Record<string, unknown> }).photoFrames?.[EXISTING_PHOTO_URL]).toBeUndefined();
  });

  describe('orphaned photo references (TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE)', () => {
    it('resolves to empty (renders «Нет фото») when the Photo doc exists but the file is missing on disk', async () => {
      const product = new Types.ObjectId();
      const photo = new Types.ObjectId();
      const productModel = {
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([
            { _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200, mainPhotoId: photo },
          ]),
        }),
      };
      const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
      const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: photo, storageUrl: '/uploads/studio-photo-smoke-test/does-not-exist.webp' }]) }) };
      const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
      const blockWithPhoto = {
        ...tableBlock,
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование' },
            { key: 'photo', label: 'Фото' },
          ],
        },
      } as unknown as TemplateBlockDocument;

      const resolved = await resolver.resolveDataSets(
        { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
        [blockWithPhoto],
        true,
      );

      expect(resolved[0]).toMatchObject({ rows: [['Стол', '']] });
    });

    it('rejects a path-traversal storageUrl instead of resolving outside uploads/', async () => {
      const product = new Types.ObjectId();
      const photo = new Types.ObjectId();
      const productModel = {
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([
            { _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200, mainPhotoId: photo },
          ]),
        }),
      };
      const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
      const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: photo, storageUrl: '/uploads/../../etc/passwd' }]) }) };
      const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
      const blockWithPhoto = {
        ...tableBlock,
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование' },
            { key: 'photo', label: 'Фото' },
          ],
        },
      } as unknown as TemplateBlockDocument;

      const resolved = await resolver.resolveDataSets(
        { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
        [blockWithPhoto],
        true,
      );

      expect(resolved[0]).toMatchObject({ rows: [['Стол', '']] });
    });
  });

  describe('tableQtyOverrides (TZ-NX-DOCSTUDIO-TABLE-LINE-QTY)', () => {
    it('defaults catalog rows to qty=1, total=price when no override is stored', async () => {
      const product = new Types.ObjectId();
      const productModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200 }]) }) };
      const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
      const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
      const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
      const blockWithSum = {
        ...tableBlock,
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование' },
            { key: 'qty', label: 'Кол-во' },
            { key: 'price', label: 'Цена' },
            { key: 'sum', label: 'Сумма' },
          ],
        },
      } as unknown as TemplateBlockDocument;

      const resolved = await resolver.resolveDataSets(
        { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
        [blockWithSum],
        true,
      );

      expect(resolved[0]).toMatchObject({ rows: [['Стол', '1', '1200', '1200']] });
    });

    it('applies a stored per-row qty override and recomputes the total column', async () => {
      const product = new Types.ObjectId();
      const productModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200 }]) }) };
      const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
      const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
      const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
      const blockWithOverride = {
        ...tableBlock,
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование' },
            { key: 'qty', label: 'Кол-во' },
            { key: 'price', label: 'Цена' },
            { key: 'sum', label: 'Сумма' },
          ],
          tableQtyOverrides: { 0: 3 },
        },
      } as unknown as TemplateBlockDocument;

      const resolved = await resolver.resolveDataSets(
        { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
        [blockWithOverride],
        true,
      );

      expect(resolved[0]).toMatchObject({ rows: [['Стол', '3', '1200', '3600']] });
    });

    it('ignores a negative or non-numeric override and falls back to qty=1', async () => {
      const product = new Types.ObjectId();
      const productModel = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([{ _id: product, name: 'Стол', sku: 'P-1', unit: 'шт', listPrice: 1200 }]) }) };
      const orgModel = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue({ vatRate: 20 }) }) };
      const photoModel = { find: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) }) };
      const resolver = new StudioDataResolverService({ findById: jest.fn() } as never, { findById: jest.fn() } as never, productModel as never, { find: jest.fn() } as never, { find: jest.fn() } as never, orgModel as never, photoModel as never);
      const blockWithBadOverride = {
        ...tableBlock,
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование' },
            { key: 'qty', label: 'Кол-во' },
            { key: 'price', label: 'Цена' },
          ],
          tableQtyOverrides: { 0: -5, garbage: 'nope' },
        },
      } as unknown as TemplateBlockDocument;

      const resolved = await resolver.resolveDataSets(
        { organizationId: orgId, context: { catalogSelections: { products: [product.toString()] } }, dataSets: [{ key: `table-${blockId}`, source: { type: 'catalog-products' }, rows: [] }] } as never,
        [blockWithBadOverride],
        true,
      );

      expect(resolved[0]).toMatchObject({ rows: [['Стол', '1', '1200']] });
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
