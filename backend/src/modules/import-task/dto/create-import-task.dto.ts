import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  IMPORT_TASK_FILE_TYPES,
  IMPORT_TASK_STATUSES,
} from '../import-task.schema';

export class ImportTaskSourceDto {
  @ApiProperty({ example: 'zakupka.xlsx' })
  @IsString()
  @Length(1, 512)
  fileName!: string;

  @ApiProperty({ enum: IMPORT_TASK_FILE_TYPES })
  @IsIn(IMPORT_TASK_FILE_TYPES as unknown as string[])
  fileType!: (typeof IMPORT_TASK_FILE_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 128)
  contentHash?: string;

  @ApiPropertyOptional({ description: 'Local inbox path (metadata only)' })
  @IsOptional()
  @IsString()
  @Length(0, 1024)
  inboxPath?: string;
}

export class ImportTaskRowDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  rowIndex!: number;

  @ApiProperty({ description: 'Original row key→value map' })
  @IsObject()
  raw!: Record<string, string | number | null>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 256)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  article?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 512)
  notes?: string;
}

export class CreateImportTaskDto {
  @ApiProperty({ type: ImportTaskSourceDto })
  @ValidateNested()
  @Type(() => ImportTaskSourceDto)
  source!: ImportTaskSourceDto;

  @ApiProperty({ type: [ImportTaskRowDto], minItems: 1, maxItems: 500 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500, {
    message: 'rows.length must be ≤500 — split the file or use TZD-18 chunk',
  })
  @ValidateNested({ each: true })
  @Type(() => ImportTaskRowDto)
  rows!: ImportTaskRowDto[];

  @ApiPropertyOptional({ example: 'Закупка.xlsx · 50 строк' })
  @IsOptional()
  @IsString()
  @Length(0, 512)
  summary?: string;
}

export class PatchImportTaskStatusDto {
  @ApiProperty({ enum: IMPORT_TASK_STATUSES })
  @IsIn(IMPORT_TASK_STATUSES as unknown as string[])
  status!: (typeof IMPORT_TASK_STATUSES)[number];

  @ApiPropertyOptional({ description: 'Required-ish when status=failed' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  errorMessage?: string;
}

// ── TZD-23: AI matching report + proposals patch ─────────────────────────────

export const AI_REPORT_DECISIONS = ['new', 'skip', 'update', 'doubt'] as const;
export type AiReportDecisionDto = (typeof AI_REPORT_DECISIONS)[number];

export class AiReportProposedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 256)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  article?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 64)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 512)
  notes?: string;
}

export class AiReportRowDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  rowIndex!: number;

  @ApiProperty({ enum: AI_REPORT_DECISIONS })
  @IsIn(AI_REPORT_DECISIONS as unknown as string[])
  decision!: AiReportDecisionDto;

  @ApiPropertyOptional({ description: 'Existing Material id for update / doubt refs' })
  @IsOptional()
  @IsMongoId()
  materialId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 512)
  reason?: string;

  @ApiPropertyOptional({ type: AiReportProposedDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AiReportProposedDto)
  proposed?: AiReportProposedDto;
}

export class AiReportCountsDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  new!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  skip!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  update!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  doubt!: number;
}

export class AiReportDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  version?: number;

  @ApiPropertyOptional({ description: 'ISO-8601; defaults to now' })
  @IsOptional()
  @IsString()
  matchedAt?: string;

  @ApiPropertyOptional({ type: AiReportCountsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AiReportCountsDto)
  counts?: AiReportCountsDto;

  @ApiPropertyOptional({ type: [AiReportRowDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReportRowDto)
  rows?: AiReportRowDto[];
}

/**
 * PATCH /api/import-tasks/:id/report (TZD-23).
 * Whitelist: summary + aiReport + status only — rows/source cannot be patched
 * (forbidNonWhitelisted rejects any stray field, e.g. rows).
 */
export class PatchImportTaskReportDto {
  @ApiPropertyOptional({ example: 't.xlsx · 2 new / 1 skip / 1 update / 1 doubt' })
  @IsOptional()
  @IsString()
  @Length(0, 512)
  summary?: string;

  @ApiProperty({ type: AiReportDto })
  @ValidateNested()
  @Type(() => AiReportDto)
  aiReport!: AiReportDto;

  @ApiProperty({ enum: ['analyzing', 'awaiting_user'] })
  @IsIn(['analyzing', 'awaiting_user'])
  status!: 'analyzing' | 'awaiting_user';
}

/**
 * PATCH /api/import-tasks/:id/proposals (TZD-23).
 * Links created proposal ids to the task and moves it to applying/done/failed.
 */
export class PatchImportTaskProposalsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  proposalIds!: string[];

  @ApiPropertyOptional({ enum: ['applying', 'done', 'failed'] })
  @IsOptional()
  @IsIn(['applying', 'done', 'failed'])
  status?: 'applying' | 'done' | 'failed';
}

/**
 * PATCH /api/import-tasks/:id/rows (TZD-26).
 * Safe AI reshape: rows + optional columnMap/reshapeNote. Only allowed while
 * the task is still pre-apply (ready_for_ai | analyzing | awaiting_user | draft).
 * Resetting aiReport forces re-match after reshape.
 */
export class PatchImportTaskRowsDto {
  @ApiProperty({ type: [ImportTaskRowDto], minItems: 1, maxItems: 500 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500, {
    message: 'rows.length must be ≤500 — split the file or use TZD-18 chunk',
  })
  @ValidateNested({ each: true })
  @Type(() => ImportTaskRowDto)
  rows!: ImportTaskRowDto[];

  @ApiPropertyOptional({
    description: 'header → canonical column map (null = unknown/conflict column)',
  })
  @IsOptional()
  @IsObject()
  columnMap?: Record<string, string | null>;

  @ApiPropertyOptional({ example: '«Наименование» → name; колонка «Цена» удалена' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  reshapeNote?: string;
}
