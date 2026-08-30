export type StudioDocumentStatus = 'draft' | 'published' | 'archived' | string;
export type StudioDocumentOrientation = 'portrait' | 'landscape';
export type StudioDocumentPageSize = 'A4' | 'A3' | string;

export interface StudioDocument {
  readonly _id: string;
  readonly name: string;
  readonly status: StudioDocumentStatus;
  readonly orientation: StudioDocumentOrientation;
  readonly pageSize: StudioDocumentPageSize;
  readonly revision?: number;
  readonly updatedAt?: string;
  readonly templateId?: string | null;
  readonly organizationId?: string;
  readonly manualPageCount?: number;
  readonly context?: Record<string, unknown>;
  readonly docTypeId?: string;
}

export interface CreateStudioDocumentPayload {
  readonly name: string;
  readonly orientation?: StudioDocumentOrientation;
  readonly pageSize?: StudioDocumentPageSize;
}

/**
 * PATCH body for /studio-documents/:id. Mirrors the backend UpdateStudioDocumentDto:
 * optimistic-concurrency gate expects the client-known revision (bumped on every write).
 */
export interface UpdateStudioDocumentPayload {
  readonly expectedRevision: number;
  readonly name?: string;
  readonly orientation?: StudioDocumentOrientation;
  readonly pageSize?: StudioDocumentPageSize;
  readonly status?: StudioDocumentStatus;
  readonly manualPageCount?: number;
  readonly context?: Record<string, unknown>;
  readonly docTypeId?: string;
}

