import type { Model } from 'mongoose';
import {
  type TableTemplateDocument,
} from './table-template.schema';
import { TableTemplateService } from './table-template.service';

describe('TableTemplateService (TZ-SALES-335)', () => {
  it('renders an image cell for the existing photo column', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'table-1',
          columns: [
            { key: 'photo', label: 'Рисунок', type: 'text', align: 'left' },
            {
              key: 'quantity',
              label: 'Кол-во',
              type: 'number',
              align: 'right',
            },
          ],
        }),
      }),
    } as unknown as Model<TableTemplateDocument>;
    const service = new TableTemplateService(model);

    const html = await service.preview('507f1f77bcf86cd799439011', [
      [{ kind: 'image', url: '/uploads/stand-thumb.webp' }, 3],
    ]);

    expect(html).toContain(
      '<img src="/uploads/stand-thumb.webp" alt="" style="max-width:72px;max-height:48px;object-fit:contain" />',
    );
    expect(html).toContain('>3</td>');
  });

  it('does not render an unsafe image URL', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'table-1',
          columns: [
            { key: 'photo', label: 'Рисунок', type: 'text', align: 'left' },
          ],
        }),
      }),
    } as unknown as Model<TableTemplateDocument>;
    const service = new TableTemplateService(model);

    const html = await service.preview('507f1f77bcf86cd799439011', [
      [{ kind: 'image', url: 'javascript:alert(1)' }],
    ]);

    expect(html).not.toContain('<img');
    expect(html).toContain('Нет фото');
    expect(html).toContain('border:1px solid #ccc');
  });

  it('hides the photo column without shifting the remaining row cells', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'table-1',
          columns: [
            { key: 'photo', label: 'Фото', type: 'text', align: 'left' },
            { key: 'productName', label: 'Наименование', type: 'text', align: 'left' },
          ],
        }),
      }),
    } as unknown as Model<TableTemplateDocument>;
    const service = new TableTemplateService(model);

    const html = await service.preview(
      '507f1f77bcf86cd799439011',
      [['Стенд']],
      [
        { key: 'photo', visible: true },
        { key: 'productName', visible: true },
      ],
      undefined,
      { showPhotoColumn: false },
    );

    expect(html).not.toContain('<th scope="col" style="text-align:left;width:50%;font-weight:600;border:1px solid #ccc">Фото</th>');
    expect(html).toContain('>Стенд</td>');
    expect(html).not.toContain('<img');
  });

  it('applies request-only widthPercent and border/header chrome', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'table-1',
          columns: [
            { key: 'productName', label: 'Наименование', type: 'text', align: 'left' },
            { key: 'quantity', label: 'Кол-во', type: 'number', align: 'right' },
          ],
        }),
      }),
    } as unknown as Model<TableTemplateDocument>;
    const service = new TableTemplateService(model);

    const html = await service.preview(
      '507f1f77bcf86cd799439011',
      [['Стенд', 2]],
      [
        { key: 'productName', visible: true, widthPercent: 70 },
        { key: 'quantity', visible: true, widthPercent: 30 },
      ],
      undefined,
      undefined,
      { borderWeight: 'thick', headerWeight: 'bold' },
    );

    expect(html).toContain('width:70%');
    expect(html).toContain('border:2px solid #ccc');
    expect(html).toContain('font-weight:700');
    expect(html).toContain('<colgroup>');
  });

  it('applies rowPresentation density/accent/separator/page-break/description/photoFit', async () => {
    const model = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'table-1',
          columns: [
            { key: 'productName', label: 'Наименование', type: 'text', align: 'left' },
            { key: 'photo', label: 'Рисунок', type: 'text', align: 'left' },
          ],
        }),
      }),
    } as unknown as Model<TableTemplateDocument>;
    const service = new TableTemplateService(model);

    const html = await service.preview(
      '507f1f77bcf86cd799439011',
      [
        [
          {
            kind: 'line-text',
            title: 'Первая',
            description: 'Скрыть меня',
          },
          { kind: 'image', url: '/uploads/a.webp' },
        ],
        [
          {
            kind: 'line-text',
            title: 'Вторая',
            description: 'Видно',
          },
          { kind: 'image', url: '/uploads/b.webp' },
        ],
      ],
      undefined,
      undefined,
      undefined,
      undefined,
      [
        {
          density: 'compact',
          emphasis: 'accent',
          separatorBefore: true,
          pageBreakBefore: true,
          showDescription: false,
          photoFit: 'cover',
        },
        {
          density: 'large',
          photoFit: 'contain',
        },
      ],
    );

    expect(html).toContain('background:#f3f3f0');
    expect(html).toContain('padding:2px 4px');
    expect(html).toContain('border-top:2px solid #333');
    expect(html).not.toContain('page-break-before:always');
    expect(html).not.toContain('Скрыть меня');
    expect(html).toContain('Видно');
    expect(html).toContain('object-fit:cover');
    expect(html).toContain('object-fit:contain');
    expect(html).toContain('padding:10px 8px');

    const htmlSecondBreak = await service.preview(
      '507f1f77bcf86cd799439011',
      [
        [{ kind: 'line-text', title: 'A' }],
        [{ kind: 'line-text', title: 'B' }],
      ],
      undefined,
      undefined,
      undefined,
      undefined,
      [{}, { pageBreakBefore: true }],
    );
    expect(htmlSecondBreak).toContain('page-break-before:always');
  });
});
