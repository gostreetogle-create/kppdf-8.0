import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ProductDimensionsDto {
  @ApiPropertyOptional({ description: 'Длина' })
  @IsOptional() @IsNumber() @Min(0) length?: number;
  @ApiPropertyOptional({ description: 'Ширина' })
  @IsOptional() @IsNumber() @Min(0) width?: number;
  @ApiPropertyOptional({ description: 'Высота' })
  @IsOptional() @IsNumber() @Min(0) height?: number;
  @ApiPropertyOptional({ description: 'Единица измерения' })
  @IsOptional() @IsString() unit?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Окно ПВХ 1200x1400', description: 'Название продукта' })
  @IsString()
  @Length(1, 256)
  name!: string;

  @ApiPropertyOptional({ example: 'WIN-PVH-1214', description: 'Артикул' })
  @IsOptional() @IsString() @Length(0, 64) sku?: string;

  @ApiProperty({ enum: ['good', 'service', 'work'], description: 'Тип: товар/услуга/работа' })
  @IsIn(['good', 'service', 'work'])
  kind!: 'good' | 'service' | 'work';

  @ApiProperty({ example: 'шт', description: 'Единица измерения' })
  @IsString()
  @Length(1, 16)
  unit!: string;

  @ApiPropertyOptional({ description: 'ID категории' })
  @IsOptional() @IsMongoId() categoryId?: string;
  @ApiPropertyOptional({ description: 'Подкатегория' })
  @IsOptional() @IsString() @Length(0, 64) subcategory?: string;

  @ApiPropertyOptional({ enum: ['new', 'active', 'archived', 'draft'], description: 'Статус' })
  @IsOptional() @IsIn(['new', 'active', 'archived', 'draft'])
  status?: 'new' | 'active' | 'archived' | 'draft';

  @ApiPropertyOptional({ description: 'Цена по прайсу' })
  @IsOptional() @IsNumber() @Min(0) listPrice?: number;
  @ApiPropertyOptional({ description: 'Базовая цена' })
  @IsOptional() @IsNumber() @Min(0) basePrice?: number;
  @ApiPropertyOptional({ description: 'Себестоимость' })
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @ApiPropertyOptional({ description: 'Наценка по умолчанию (%)' })
  @IsOptional() @IsNumber() @Min(0) @Max(1000) defaultMarkupPercent?: number;
  @ApiPropertyOptional({ description: 'Количество на складе' })
  @IsOptional() @IsNumber() @Min(0) stockQty?: number;

  @ApiPropertyOptional({ description: 'Описание продукта' })
  @IsOptional() @IsString() @Length(0, 4000) description?: string;
  @ApiPropertyOptional({ description: 'Заметки' })
  @IsOptional() @IsString() @Length(0, 4000) notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'ID фотографий' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  photoIds?: string[];

  @ApiPropertyOptional({ type: ProductDimensionsDto, description: 'Размеры продукта' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;

  @ApiPropertyOptional({ description: 'Вес (кг)' })
  @IsOptional() @IsNumber() @Min(0) weightKg?: number;
  @ApiPropertyOptional({ description: 'Код RAL' })
  @IsOptional() @IsString() @Length(0, 16) ralCode?: string;

  @ApiPropertyOptional({ description: 'Есть ли паспорт' })
  @IsOptional() @IsBoolean() hasPassport?: boolean;
  @ApiPropertyOptional({ description: 'Есть ли чертёж' })
  @IsOptional() @IsBoolean() hasDrawing?: boolean;
  @ApiPropertyOptional({ description: 'Активен ли продукт' })
  @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ description: 'Назначение' })
  @IsOptional() @IsString() @Length(0, 256) purpose?: string;
  @ApiPropertyOptional({ description: 'Установка' })
  @IsOptional() @IsString() @Length(0, 256) installation?: string;

  @ApiPropertyOptional({ type: Object, description: 'EAV: { attributeName: value }' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
