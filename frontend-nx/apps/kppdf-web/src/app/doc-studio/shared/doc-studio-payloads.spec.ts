import { tableTemplatePayload, textBlockPayload } from './doc-studio-payloads';

describe('doc-studio payloads', () => {
  it('does not send the removed text-block category field', () => {
    const payload = textBlockPayload({
      name: ' X ',
      slug: 'x',
      tags: 'a, b',
      categoryId: '',
      sortOrder: 1,
      content: '<p>x</p>',
    });
    expect(payload).toEqual({ name: 'X', slug: 'x', tags: ['a', 'b'], content: '<p>x</p>', sortOrder: 1 });
    expect('category' in payload).toBe(false);
  });

  it('omits empty data source while preserving changed columns only', () => {
    const payload = tableTemplatePayload({
      name: ' T ',
      description: '',
      category: 'custom',
      sortOrder: 0,
      dataSource: '',
      columns: [{ key: 'x', label: 'X', type: 'text', width: 100, align: 'left' }],
    });
    expect(payload.dataSource).toBeUndefined();
    expect(payload.columns).toHaveLength(1);
  });
});
