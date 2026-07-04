import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class TableColumnDto {
  @IsString() @IsNotEmpty() key!: string;
  @IsString() @IsNotEmpty() label!: string;
  @IsOptional() @IsNumber() @Min(1) width?: number;
  @IsOptional() @IsIn(['left', 'center', 'right']) align?: 'left' | 'center' | 'right';
  @IsOptional() @IsString() format?: string;
}

export class CreateTableTemplateDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableColumnDto)
  columns!: TableColumnDto[];
}
