import type { StudioDocument } from '@kppdf/data-access';

const LAST_DOC_KEY = 'kppdf:studio:last-doc-id';

/** Persist the last explicit document flow; the `/studio` landing never consumes it. */
export function rememberStudioDocument(id: string): void {
  try {
    localStorage.setItem(LAST_DOC_KEY, id);
  } catch {
    /* private mode / quota — ignore */
  }
}

export function readLastStudioDocumentId(): string | null {
  try {
    return localStorage.getItem(LAST_DOC_KEY);
  } catch {
    return null;
  }
}

/**
 * Choose a draft only for callers that explicitly enter an editor flow.
 * The `/studio` landing list must not call this helper.
 */
export function pickResumeStudioDocument(
  documents: readonly StudioDocument[],
): StudioDocument | null {
  const drafts = documents.filter((d) => d.status === 'draft');
  if (drafts.length === 0) return null;

  const lastId = readLastStudioDocumentId();
  const remembered = lastId ? drafts.find((d) => d._id === lastId) : undefined;
  if (remembered) return remembered;

  return [...drafts].sort(
    (a, b) => parseUpdatedAt(b.updatedAt) - parseUpdatedAt(a.updatedAt),
  )[0] ?? null;
}

function parseUpdatedAt(value?: string): number {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
}
