import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

const DIMENSION_TYPES = [
  'length',
  'width',
  'height',
  'thickness',
  'diameter',
  'depth',
] as const;

export class DimensionDto {
  @IsIn(DIMENSION_TYPES, {
    message: `type должен быть одним из: ${DIMENSION_TYPES.join(', ')}`,
  })
  type!: (typeof DIMENSION_TYPES)[number];

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsBoolean()
  isImmutable?: boolean;
}

export class CreateMaterialDto {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  article?: string;

  @IsString()
  @Length(1, 32)
  unit!: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  /** Цена за единицу. Всегда в RUB — поле валюты отсутствует. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionDto)
  dimensions?: DimensionDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  photoIds?: string[];

  @IsOptional()
  @IsMongoId()
  mainPhotoId?: string;

  @IsOptional()
  @IsMongoId()
  supplierId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
