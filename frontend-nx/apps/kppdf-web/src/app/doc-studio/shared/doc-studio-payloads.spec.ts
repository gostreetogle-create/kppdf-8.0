import { tableTemplatePayload, textBlockPayload } from './doc-studio-payloads';

describe('doc-studio payloads', () => {
  it('does not send the removed legacy category field or a slug (server auto-generates it)', () => {
    const payload = textBlockPayload({
      name: ' X ',
      tags: 'a, b',
      categoryId: '',
      sortOrder: 1,
      content: '<p>x</p>',
    });
    expect(payload).toEqual({ name: 'X', tags: ['a', 'b'], content: '<p>x</p>', sortOrder: 1 });
    expect('category' in payload).toBe(false);
    expect('slug' in payload).toBe(false);
  });

  // TZ-NX-TEXT-CAT-PARENT: subcategory (leaf) is mandatory going forward —
  // when the form supplies one, it must reach the payload.
  it('includes a trimmed categoryId when supplied (subcategory is mandatory)', () => {
    const payload = textBlockPayload({
      name: 'Y',
      tags: '',
      categoryId: '  64a7b8c9d0e1f2a3b4c5d6e7  ',
      sortOrder: 0,
      content: '<p>y</p>',
    });
    expect(payload.categoryId).toBe('64a7b8c9d0e1f2a3b4c5d6e7');
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
