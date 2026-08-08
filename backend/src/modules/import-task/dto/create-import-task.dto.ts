import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
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
