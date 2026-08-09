import type { Model } from 'mongoose';
import {
  TableTemplate,
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
    expect(html).toContain('<td style="text-align:left"></td>');
  });
});
