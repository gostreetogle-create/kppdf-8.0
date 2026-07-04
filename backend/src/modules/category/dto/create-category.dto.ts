import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 128)
  name!: string;

  @IsString()
  @Length(1, 64)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase, a-z, 0-9, -' })
  slug!: string;

  @IsIn(['material', 'product', 'general'])
  type!: 'material' | 'product' | 'general';

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsString()
  @Length(1, 16)
  @Matches(/^[A-Z0-9-]+$/, { message: 'skuPrefix must be uppercase A-Z, 0-9, -' })
  skuPrefix!: string;

  @IsOptional() @IsString() @Length(0, 512) description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
