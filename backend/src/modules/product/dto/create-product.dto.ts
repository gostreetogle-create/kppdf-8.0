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
  @IsOptional() @IsNumber() @Min(0) length?: number;
  @IsOptional() @IsNumber() @Min(0) width?: number;
  @IsOptional() @IsNumber() @Min(0) height?: number;
  @IsOptional() @IsString() unit?: string;
}

export class CreateProductDto {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsOptional() @IsString() @Length(0, 64) sku?: string;

  @IsIn(['good', 'service', 'work'])
  kind!: 'good' | 'service' | 'work';

  @IsString()
  @Length(1, 16)
  unit!: string;

  @IsOptional() @IsMongoId() categoryId?: string;
  @IsOptional() @IsString() @Length(0, 64) subcategory?: string;

  @IsOptional() @IsIn(['new', 'active', 'archived', 'draft'])
  status?: 'new' | 'active' | 'archived' | 'draft';

  @IsOptional() @IsNumber() @Min(0) listPrice?: number;
  @IsOptional() @IsNumber() @Min(0) basePrice?: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1000) defaultMarkupPercent?: number;
  @IsOptional() @IsNumber() @Min(0) stockQty?: number;

  @IsOptional() @IsString() @Length(0, 4000) description?: string;
  @IsOptional() @IsString() @Length(0, 4000) notes?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  photoIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;

  @IsOptional() @IsNumber() @Min(0) weightKg?: number;
  @IsOptional() @IsString() @Length(0, 16) ralCode?: string;

  @IsOptional() @IsBoolean() hasPassport?: boolean;
  @IsOptional() @IsBoolean() hasDrawing?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() @Length(0, 256) purpose?: string;
  @IsOptional() @IsString() @Length(0, 256) installation?: string;

  /** EAV: { attributeName: value }. Validated by EavService per AttributeDefinition.type. */
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
