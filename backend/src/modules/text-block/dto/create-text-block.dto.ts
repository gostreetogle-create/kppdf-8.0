import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TEXT_BLOCK_CATEGORIES, type TextBlockCategory } from '../text-block.schema';

/**
 * CreateTextBlockDto — simplified.
 *
 * Only `name` is required. `slug`, `category`, `tags`, `content`, `columns`
 * are optional. For multi-column blocks, pass `columns[]` and omit `content`.
 */
export class ColumnDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;

  @IsOptional()
  @IsNumber()
  width?: number;
}

export class CreateTextBlockDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsIn(TEXT_BLOCK_CATEGORIES)
  category?: TextBlockCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  columns?: ColumnDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
