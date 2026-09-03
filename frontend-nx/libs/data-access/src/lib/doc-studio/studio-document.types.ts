export type StudioDocumentStatus = 'draft' | 'published' | 'archived' | string;
export type StudioDocumentOrientation = 'portrait' | 'landscape';
export type StudioDocumentPageSize = 'A4' | 'A3' | string;

export interface StudioPageMargins {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface StudioSheetLayout {
  readonly rowsFirstPage: number;
  readonly rowsNextPage: number;
}

export type StudioDataSetSourceType = 'manual' | 'quotation-items' | 'order-items' | 'catalog-products' | 'catalog-modules' | 'catalog-parts' | 'catalog-materials' | string;

export interface StudioDataSetPayload {
  readonly source: { readonly type: StudioDataSetSourceType };
  readonly rows: readonly unknown[];
  readonly [key: string]: unknown;
}

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
  readonly pageNumbering?: boolean;
  readonly backgroundImage?: readonly string[];
  readonly defaultBackgroundIndex?: number;
  readonly backgroundPageIndices?: readonly number[];
  readonly backgroundOpacity?: number;
  readonly pageMargins?: StudioPageMargins;
  readonly sheetLayout?: StudioSheetLayout;
  readonly context?: Record<string, unknown>;
  readonly dataAnchors?: readonly Record<string, unknown>[];
  readonly docTypeId?: string;
  readonly linkedQuotationId?: string;
  readonly dataSets?: readonly StudioDataSetPayload[];
}

export interface CreateStudioDocumentPayload {
  readonly name: string;
  readonly orientation?: StudioDocumentOrientation;
  readonly pageSize?: StudioDocumentPageSize;
  readonly docTypeId?: string;
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
  readonly pageNumbering?: boolean;
  readonly backgroundImage?: readonly string[];
  readonly defaultBackgroundIndex?: number;
  readonly backgroundPageIndices?: readonly number[];
  readonly backgroundOpacity?: number;
  readonly pageMargins?: StudioPageMargins;
  readonly sheetLayout?: StudioSheetLayout;
  readonly context?: Record<string, unknown>;
  readonly dataAnchors?: readonly Record<string, unknown>[];
  readonly docTypeId?: string;
}

