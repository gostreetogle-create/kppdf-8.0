/**
 * TZ-86 Phase D — frontend mirror of backend TemplateBlock schema.
 *
 * Source of truth: `backend/src/modules/template-block/template-block.schema.ts`.
 * Keep this file in lockstep with the backend — any new BlockType,
 * DataBinding source, or DataBindingFormat must be added here too.
 *
 * Used by:
 *   - `shared/services/pi-template-blocks.service.ts` (CRUD)
 *   - `pages/doc-constructor/builder/builder.page.ts` (canvas state)
 *   - `pages/doc-constructor/builder/block-renderer.component.ts` (rendering)
 *   - `pages/doc-constructor/builder/builder-inspector.component.ts` (editing)
 *
 * The builder treats `dataBinding === null` as «render literal `content`».
 * Any non-null binding is resolved server-side at build() time per
 * `document-template.service.ts:resolveBlockContent` — the frontend does
 * NOT resolve data itself; the backend's `BuildDocumentDto` is the single
 * resolution surface.
 */

export type BlockType = 'header' | 'text' | 'table' | 'image' | 'signature';

export const BLOCK_TYPES: readonly BlockType[] = [
  'header',
  'text',
  'table',
  'image',
  'signature',
] as const;

export type DataBindingSource =
  | 'organization'
  | 'counterparty'
  | 'product'
  | 'material'
  | 'work-type'
  | 'order'
  | 'contract'
  | 'cost-calculation'
  | 'static';

export const DATA_BINDING_SOURCES: readonly DataBindingSource[] = [
  'organization',
  'counterparty',
  'product',
  'material',
  'work-type',
  'order',
  'contract',
  'cost-calculation',
  'static',
] as const;

export type DataBindingFormat = 'text' | 'date' | 'currency' | 'number';

export const DATA_BINDING_FORMATS: readonly DataBindingFormat[] = [
  'text',
  'date',
  'currency',
  'number',
] as const;

/**
 * Optional binding for live data resolution at render time.
 * `source: 'static'` requires `value`; all other sources require `field`.
 */
export interface DataBinding {
  source: DataBindingSource;
  field?: string;
  value?: string;
  format?: DataBindingFormat;
}

/**
 * TemplateBlock — single atomic canvas block.
 *
 * `_id` is omitted in create() payloads (server-assigned Mongoose ObjectId).
 * `tempId` is a client-only UUID used for list keying between drop and persist.
 */
export interface TemplateBlock {
  _id?: string;
  /** Client-only UUID for blocks awaiting server-assigned _id. */
  tempId?: string;
  templateId: string;
  type: BlockType;
  order: number;
  title?: string;
  content?: string;
  height?: number;
  showLine: boolean;
  settings?: Record<string, unknown>;
  dataBinding?: DataBinding | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Stable key for `track` in @for — prefers _id, falls back to tempId. */
export function blockKey(b: TemplateBlock): string {
  return b._id ?? b.tempId ?? `idx-${b.order}`;
}

/**
 * Payload for `POST /document-templates/:id/blocks` — `templateId` comes from
 * URL param, so it is omitted from the body.
 */
export type CreateTemplateBlockPayload = Omit<
  TemplateBlock,
  '_id' | 'tempId' | 'templateId' | 'createdAt' | 'updatedAt'
>;

/**
 * Payload for `PATCH /template-blocks/:id` — partial; all fields optional.
 */
export type UpdateTemplateBlockPayload = Partial<
  Omit<TemplateBlock, '_id' | 'tempId' | 'templateId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Payload for `POST /document-templates/:id/blocks/reorder` — array of _id.
 */
export interface ReorderBlocksPayload {
  blockIds: string[];
}

/**
 * Display-only label for each block type — Russian i18n for the tool pane
 * and inspector chip. Order matches the visual order in the tool palette.
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  header: 'Заголовок',
  text: 'Текст',
  table: 'Таблица',
  image: 'Изображение',
  signature: 'Подпись',
};

/**
 * Short visual hint for the tool-pane cards (one-liner explaining the type).
 */
export const BLOCK_TYPE_HINTS: Record<BlockType, string> = {
  header: 'H1, разделитель, видимая линия',
  text: 'Произвольный markdown-блок',
  table: 'Шаблон таблицы с колонками',
  image: 'Картинка из библиотеки',
  signature: 'Место для подписи / печати',
};
