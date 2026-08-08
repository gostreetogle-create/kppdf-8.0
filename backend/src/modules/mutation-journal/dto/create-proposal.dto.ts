import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { MUTATION_KINDS } from '../mutation-journal.schema';

export class ProposeMaterialCreateDto {
  @ApiProperty({ example: 'Стекло 4мм' })
  @IsString()
  @Length(1, 256)
  name!: string;

  @ApiPropertyOptional({ example: 'шт', description: 'Единица измерения (default шт)' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
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
  @IsMongoId()
  categoryId?: string;
}

export class ProposeMaterialUpdateDto {
  @ApiProperty({ description: 'Material id to update' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: 'Partial material fields' })
  @IsObject()
  patch!: Record<string, unknown>;
}

export class ProposeProductCreateDto {
  @ApiProperty({ example: 'Окно ПВХ 1200x1400' })
  @IsString()
  @Length(1, 256)
  name!: string;

  @ApiProperty({ enum: ['good', 'service', 'work'] })
  @IsIn(['good', 'service', 'work'])
  kind!: 'good' | 'service' | 'work';

  @ApiPropertyOptional({ example: 'шт', description: 'Единица измерения (default шт)' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  unit?: string;

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

export class ProposeProductUpdateDto {
  @ApiProperty({ description: 'Product id to update' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: 'Partial product passport fields' })
  @IsObject()
  patch!: Record<string, unknown>;
}

export class CreateProposalDto {
  @ApiProperty({ enum: MUTATION_KINDS })
  @IsIn(MUTATION_KINDS as unknown as string[])
  kind!: (typeof MUTATION_KINDS)[number];

  @ApiPropertyOptional({ description: 'For material.create' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposeMaterialCreateDto)
  create?: ProposeMaterialCreateDto;

  @ApiPropertyOptional({ description: 'For material.update' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposeMaterialUpdateDto)
  update?: ProposeMaterialUpdateDto;

  @ApiPropertyOptional({ description: 'For product.create (TZD-27)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposeProductCreateDto)
  productCreate?: ProposeProductCreateDto;

  @ApiPropertyOptional({ description: 'For product.update (TZD-27)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposeProductUpdateDto)
  productUpdate?: ProposeProductUpdateDto;

  @ApiPropertyOptional({ default: 'kppdf_propose_material' })
  @IsOptional()
  @IsString()
  toolName?: string;
}

// ── TZD-18: batch propose/confirm/cancel ──────────────────────────────────────

/**
 * POST /api/mutation-journal/propose-batch (TZD-18).
 * All-or-nothing best-effort: если хоть один item падает — созданные
 * proposals откатываются (cancel) и возвращаются errors. SoT не пишется.
 */
export class ProposeBatchDto {
  @ApiProperty({ type: [CreateProposalDto], minItems: 1, maxItems: 500 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateProposalDto)
  items!: CreateProposalDto[];

  @ApiPropertyOptional({
    description: 'Повторный вызов с тем же ключом вернёт те же proposalIds (dedup по предложенным)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  idempotencyKey?: string;
}

/** Для confirm-batch / cancel-batch. */
export class ProposalIdsBatchDto {
  @ApiProperty({ type: [String], minItems: 1, maxItems: 500 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsMongoId({ each: true })
  ids!: string[];
}
