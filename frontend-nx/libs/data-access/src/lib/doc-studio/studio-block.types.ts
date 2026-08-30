export type StudioBlockType = 'header' | 'text' | 'table' | 'image' | 'signature' | 'spacer';

export interface StudioBlockLayout {
  readonly page: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height?: number;
  readonly zIndex: number;
  readonly rotation: number;
}

export interface StudioBlock {
  readonly _id: string;
  readonly type: StudioBlockType;
  readonly order: number;
  readonly title?: string;
  readonly content?: string;
  readonly layout?: StudioBlockLayout;
  readonly locked?: boolean;
  readonly isActive?: boolean;
  readonly settings?: Record<string, unknown>;
}

export interface CreateStudioBlockPayload {
  readonly expectedRevision: number;
  readonly type: StudioBlockType;
  readonly order: number;
  readonly title?: string;
  readonly content?: string;
  readonly layout?: StudioBlockLayout;
  readonly locked?: boolean;
  readonly isActive?: boolean;
}

export interface UpdateStudioBlockPayload {
  readonly type?: StudioBlockType;
  readonly order?: number;
  readonly title?: string;
  readonly content?: string;
  readonly layout?: Partial<StudioBlockLayout>;
  readonly locked?: boolean;
  readonly isActive?: boolean;
}

export interface StudioBlockLayoutUpdate {
  readonly blockId: string;
  readonly layout: StudioBlockLayout;
}

export interface UpdateStudioBlockLayoutsPayload {
  readonly expectedRevision: number;
  readonly updates: readonly StudioBlockLayoutUpdate[];
}
