import type { DocType } from '@kppdf/data-access';

/** КП doc type — recognized by slug (canonical) or Russian name (legacy seed data). */
export function isKpDocType(docType: Pick<DocType, 'slug' | 'name'> | undefined): boolean {
  return docType?.slug === 'proposal' || docType?.name === 'КП';
}

export function findKpDocType(docTypes: readonly DocType[]): DocType | undefined {
  return docTypes.find((item) => isKpDocType(item));
}
