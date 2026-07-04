import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

class DimensionsDto {
  @IsOptional() @IsNumber() @Min(0) length?: number;
  @IsOptional() @IsNumber() @Min(0) width?: number;
  @IsOptional() @IsNumber() @Min(0) height?: number;
  @IsOptional() @IsNumber() @Min(0) thickness?: number;
  @IsOptional() @IsNumber() @Min(0) diameter?: number;
  @IsOptional() @IsString() unit?: string;
}

export class CreateMaterialDto {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsOptional() @IsString() @Length(0, 64) article?: string;

  @IsString()
  @Length(1, 32)
  unit!: string;

  @IsOptional() @IsMongoId() categoryId?: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;

  @IsOptional() @IsNumber() @Min(0) pricePerUnit?: number;
  @IsOptional() @IsString() @Length(3, 8) priceCurrency?: string;
  @IsOptional() @IsNumber() @Min(0) stockQty?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional() @IsBoolean() fixedDimensions?: boolean;
  @IsOptional() @IsString() image?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  photoIds?: string[];

  @IsOptional() @IsMongoId() supplierId?: string;
  @IsOptional() @IsString() @Length(0, 2000) notes?: string;
}
