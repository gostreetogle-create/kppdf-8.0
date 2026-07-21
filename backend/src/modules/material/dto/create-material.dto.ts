import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ enum: DIMENSION_TYPES, description: 'Тип размера' })
  @IsIn(DIMENSION_TYPES, {
    message: `type должен быть одним из: ${DIMENSION_TYPES.join(', ')}`,
  })
  type!: (typeof DIMENSION_TYPES)[number];

  @ApiProperty({ description: 'Значение размера' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ description: 'Неизменяемый размер' })
  @IsOptional()
  @IsBoolean()
  isImmutable?: boolean;
}

export class CreateMaterialDto {
  @ApiProperty({ example: 'Стекло 4мм', description: 'Название материала' })
  @IsString()
  @Length(1, 256)
  name!: string;

  @ApiPropertyOptional({ example: 'STK-004', description: 'Артикул' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  article?: string;

  @ApiProperty({ example: 'м2', description: 'Единица измерения' })
  @IsString()
  @Length(1, 32)
  unit!: string;

  @ApiPropertyOptional({ description: 'ID категории' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Описание материала' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Цена за единицу (RUB)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerUnit?: number;

  @ApiPropertyOptional({ description: 'Количество на складе' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQty?: number;

  @ApiPropertyOptional({ type: [DimensionDto], description: 'Размеры материала' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionDto)
  dimensions?: DimensionDto[];

  @ApiPropertyOptional({ type: [String], description: 'ID фотографий' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  photoIds?: string[];

  @ApiPropertyOptional({ description: 'ID основного фото' })
  @IsOptional()
  @IsMongoId()
  mainPhotoId?: string;

  @ApiPropertyOptional({ description: 'ID поставщика' })
  @IsOptional()
  @IsMongoId()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Заметки' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
