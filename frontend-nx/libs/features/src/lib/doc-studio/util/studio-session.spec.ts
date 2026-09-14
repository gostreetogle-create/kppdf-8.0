import { pickResumeStudioDocument, rememberStudioDocument, readLastStudioDocumentId } from './studio-session';
import type { StudioDocument } from '@kppdf/data-access';

describe('studio-session', () => {
  const docs: StudioDocument[] = [
    { _id: 'a', name: 'Old', status: 'draft', orientation: 'portrait', pageSize: 'A4', updatedAt: '2026-08-30T10:00:00.000Z' },
    { _id: 'b', name: 'New', status: 'draft', orientation: 'portrait', pageSize: 'A4', updatedAt: '2026-08-30T17:00:00.000Z' },
    { _id: 'c', name: 'Archived', status: 'published', orientation: 'portrait', pageSize: 'A4', updatedAt: '2026-08-30T18:00:00.000Z' },
  ];

  beforeEach(() => localStorage.clear());

  it('rememberStudioDocument stores id in localStorage', () => {
    rememberStudioDocument('b');
    expect(readLastStudioDocumentId()).toBe('b');
  });

  it('pickResumeStudioDocument prefers remembered draft', () => {
    rememberStudioDocument('a');
    expect(pickResumeStudioDocument(docs)?._id).toBe('a');
  });

  it('pickResumeStudioDocument falls back to latest draft by updatedAt', () => {
    expect(pickResumeStudioDocument(docs)?._id).toBe('b');
  });

  it('pickResumeStudioDocument ignores non-draft documents', () => {
    expect(pickResumeStudioDocument([docs[2]!])).toBeNull();
  });
});
