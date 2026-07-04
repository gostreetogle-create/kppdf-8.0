import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsIn(['main', 'branch', 'transit', 'production', 'other'])
  type?: 'main' | 'branch' | 'transit' | 'production' | 'other';

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() zoneNames?: string[];

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  roleIds?: string[];
}
