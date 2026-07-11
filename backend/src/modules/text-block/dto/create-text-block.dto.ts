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
} from 'class-validator';
import { TEXT_BLOCK_CATEGORIES, type TextBlockCategory } from '../text-block.schema';

/**
 * TZ-86 Phase A.1 — CreateTextBlockDto.
 *
 * Convention: name + slug (optional/auto) + category + content (required);
 *  tags + isActive + sortOrder optional.
 */
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
  /** Optional — service auto-generates from name if absent (kebab-case + Russian transliteration). */
  slug?: string;

  @IsIn(TEXT_BLOCK_CATEGORIES)
  category!: TextBlockCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  /** Free-form kebab-cased tags; sanitised in service layer (lowercase, dash-separated, ≤30 chars). */
  tags?: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  /** CommonMark markdown content. */
  content!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
