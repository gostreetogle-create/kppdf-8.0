import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  COLUMN_TYPES,
  type ColumnType,
  TABLE_TEMPLATE_CATEGORIES,
  type TableTemplateCategory,
} from '../table-template.schema';

/**
 * TZ-86 Phase A.2 — TableColumnDto extended.
 *
 * `type` is optional in DTO (default applied at schema level) to keep
 * migration of old frontend calls safe — if a pre-A.2 client forgets
 * `type`, server defaults to 'text'.
 *
 * Other fields (`width`, `align`, `format`) unchanged for backward compat.
 */
export class TableColumnDto {
  @IsString() @IsNotEmpty() key!: string;
  @IsString() @IsNotEmpty() label!: string;

  @IsOptional() @IsIn(COLUMN_TYPES) type?: ColumnType;

  @IsOptional() @IsNumber() @Min(1) width?: number;
  @IsOptional() @IsIn(['left', 'center', 'right'])
  align?: 'left' | 'center' | 'right';
  @IsOptional() @IsString() format?: string;
}

/**
 * TZ-86 Phase A.2 — CreateTableTemplateDto extended.
 *
 * New optional fields: `category`, `sortOrder`, `sampleRows`, `dataSource`.
 * All optional → existing pre-A.2 clients (write only name/columns) still pass.
 */
export class CreateTableTemplateDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsIn(TABLE_TEMPLATE_CATEGORIES) category?: TableTemplateCategory;

  @IsOptional() @IsNumber() @Min(0) sortOrder?: number;

  /**
   * Sample rows for the preview endpoint. Each row is `unknown[]` aligned
   * to `columns[]` order. Validated as array-of-arrays (loose element type).
   */
  @IsOptional() @IsArray() sampleRows?: unknown[][];

  /**
   * Registry-resolved dataSource label (e.g. 'products', 'cost-calc').
   * Phase A.5 RegistryController exposes the canonical list.
   */
  @IsOptional() @IsString() dataSource?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableColumnDto)
  columns!: TableColumnDto[];
}
