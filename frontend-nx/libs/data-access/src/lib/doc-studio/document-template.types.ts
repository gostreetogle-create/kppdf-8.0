export interface DocumentTemplate {
  readonly _id: string;
  readonly name: string;
  readonly organizationId?: string | Record<string, unknown>;
  readonly docTypeId?: string | Record<string, unknown>;
  readonly pageSize?: string;
  readonly orientation?: 'portrait' | 'landscape';
  readonly isActive?: boolean;
  readonly isDefault?: boolean;
}
