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

  describe('TZ-NX-SORTORDER-EMPTY-MIN — empty "Порядок" never reaches the backend as "" / NaN', () => {
    it('tableTemplatePayload omits sortOrder when the CVA cleared it to an empty string', () => {
      const payload = tableTemplatePayload({
        name: 'T',
        description: '',
        category: 'custom',
        sortOrder: '' as unknown as number,
        dataSource: '',
        columns: [],
      });
      expect(payload.sortOrder).toBeUndefined();
      expect('sortOrder' in JSON.parse(JSON.stringify(payload))).toBe(false);
    });

    it('tableTemplatePayload keeps a real explicit sortOrder, including 0', () => {
      expect(tableTemplatePayload({ name: 'T', description: '', category: 'custom', sortOrder: 0, dataSource: '', columns: [] }).sortOrder).toBe(0);
      expect(tableTemplatePayload({ name: 'T', description: '', category: 'custom', sortOrder: 5, dataSource: '', columns: [] }).sortOrder).toBe(5);
    });

    it('tableTemplatePayload omits a string that does not parse to a finite number', () => {
      const payload = tableTemplatePayload({
        name: 'T',
        description: '',
        category: 'custom',
        sortOrder: 'abc' as unknown as number,
        dataSource: '',
        columns: [],
      });
      expect(payload.sortOrder).toBeUndefined();
    });

    it('tableTemplatePayload coerces a numeric string from the CVA to a real number', () => {
      const payload = tableTemplatePayload({
        name: 'T',
        description: '',
        category: 'custom',
        sortOrder: '3' as unknown as number,
        dataSource: '',
        columns: [],
      });
      expect(payload.sortOrder).toBe(3);
    });

    it('textBlockPayload omits sortOrder when empty, keeps it when a real number', () => {
      const empty = textBlockPayload({ name: 'X', tags: '', categoryId: '', sortOrder: '' as unknown as number, content: '' });
      expect(empty.sortOrder).toBeUndefined();
      const real = textBlockPayload({ name: 'X', tags: '', categoryId: '', sortOrder: 2, content: '' });
      expect(real.sortOrder).toBe(2);
    });
  });
});
