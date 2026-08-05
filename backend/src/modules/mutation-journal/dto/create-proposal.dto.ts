import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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

  @ApiPropertyOptional({ default: 'kppdf_propose_material' })
  @IsOptional()
  @IsString()
  toolName?: string;
}
