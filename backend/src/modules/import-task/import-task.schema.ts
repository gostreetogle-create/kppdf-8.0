import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ImportTaskDocument = HydratedDocument<ImportTask>;

export const IMPORT_TASK_STATUSES = [
  'draft',
  'ready_for_ai',
  'analyzing',
  'awaiting_user',
  'applying',
  'done',
  'cancelled',
  'failed',
] as const;
export type ImportTaskStatus = (typeof IMPORT_TASK_STATUSES)[number];

export const IMPORT_TASK_FILE_TYPES = [
  'xlsx',
  'xls',
  'csv',
  'tsv',
  'txt',
  'other',
] as const;
export type ImportTaskFileType = (typeof IMPORT_TASK_FILE_TYPES)[number];

/** Terminal statuses — no further transitions except cancelled → ready_for_ai. */
export const IMPORT_TASK_TERMINAL: ReadonlySet<ImportTaskStatus> = new Set([
  'done',
  'cancelled',
  'failed',
]);

export interface ImportTaskSource {
  fileName: string;
  fileType: ImportTaskFileType;
  contentHash?: string;
  inboxPath?: string;
}

export interface ImportTaskRow {
  rowIndex: number;
  raw: Record<string, string | number | null>;
  name?: string;
  unit?: string;
  article?: string;
  sku?: string;
  notes?: string;
}

export type AiReportDecision = 'new' | 'skip' | 'update' | 'doubt';

export interface AiReportProposed {
  name?: string;
  unit?: string;
  article?: string;
  sku?: string;
  notes?: string;
}

export interface AiReportRow {
  rowIndex: number;
  decision: AiReportDecision;
  materialId?: string;
  reason?: string;
  proposed?: AiReportProposed;
}

/**
 * TZD-23 — AI matching report persisted on ImportTask.
 * Pure plan data: rows stay untouched; proposals are created on apply_plan.
 */
export interface AiReport {
  version: number;
  matchedAt: string;
  counts: { new: number; skip: number; update: number; doubt: number };
  rows: AiReportRow[];
}

/**
 * TZD-22 — Import Task: assembly point between inbox parse and propose.
 * Does NOT write Material / mutation journal. Matching → TZD-23.
 */
@Schema({ collection: 'import_tasks', timestamps: true })
export class ImportTask {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdByUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  source!: ImportTaskSource;

  @Prop({
    required: true,
    enum: IMPORT_TASK_STATUSES,
    default: 'ready_for_ai',
    index: true,
  })
  status!: ImportTaskStatus;

  @Prop({ type: [Object], default: [] })
  rows!: ImportTaskRow[];

  @Prop()
  summary?: string;

  /** TZD-23 AI matching report — pure plan (never writes SoT itself). */
  @Prop({ type: Object, default: null })
  aiReport!: AiReport | null;

  /** TZD-26 — header→canonical map after AI reshape (null = unknown/conflict). */
  @Prop({ type: Object, default: null })
  columnMap?: Record<string, string | null> | null;

  /** TZD-26 — human-readable reshape note (why columns were transformed). */
  @Prop()
  reshapeNote?: string;

  /** Links to mutation_journal after apply (TZD-23); empty in this TZ. */
  @Prop({ type: [Types.ObjectId], default: [] })
  proposalIds!: Types.ObjectId[];

  @Prop()
  errorMessage?: string;
}

export const ImportTaskSchema = SchemaFactory.createForClass(ImportTask);
ImportTaskSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
