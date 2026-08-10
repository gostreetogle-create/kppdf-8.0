import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { IMPORT_MAPPING_TARGETS } from '../import-mapping-profile.schema';

export class CreateImportMappingProfileDto {
  @ApiProperty({ example: 'Спецификация X' })
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiProperty({ example: { Артикул: 'article', Наименование: 'name', Цена: null } })
  @IsObject()
  columnMap!: Record<string, string | null>;

  @ApiPropertyOptional({ enum: IMPORT_MAPPING_TARGETS, default: 'material' })
  @IsOptional()
  @IsIn(IMPORT_MAPPING_TARGETS as unknown as string[])
  targetEntity?: (typeof IMPORT_MAPPING_TARGETS)[number];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateImportMappingProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  columnMap?: Record<string, string | null>;

  @ApiPropertyOptional({ enum: IMPORT_MAPPING_TARGETS })
  @IsOptional()
  @IsIn(IMPORT_MAPPING_TARGETS as unknown as string[])
  targetEntity?: (typeof IMPORT_MAPPING_TARGETS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
