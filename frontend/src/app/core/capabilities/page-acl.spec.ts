import { filterByPageAcl } from './page-acl';

describe('filterByPageAcl', () => {
  const chips = [
    { id: 'a', pageKey: 'products' },
    { id: 'b', pageKey: 'materials' },
    { id: 'c' },
    { id: 'd', anyPageKeys: ['doc-templates', 'doc-texts'] as const },
  ];

  it('shows all when pages is undefined (legacy)', () => {
    expect(filterByPageAcl(chips, undefined)).toHaveLength(4);
  });

  it('hides chips whose pageKey is missing from pages', () => {
    expect(filterByPageAcl(chips, ['products']).map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('keeps anyPageKeys chip when at least one key matches', () => {
    expect(filterByPageAcl(chips, ['doc-texts']).map((c) => c.id)).toEqual(['c', 'd']);
  });

  it('drops anyPageKeys chip when none match', () => {
    expect(filterByPageAcl(chips, ['orders']).map((c) => c.id)).toEqual(['c']);
  });
});
