import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateDocumentTemplateDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];  @IsObjectId() organizationId!: string;
  @IsObjectId() docTypeId!: string;

  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional() @IsIn(['A4', 'A5', 'Letter', 'Legal'])
  pageSize?: 'A4' | 'A5' | 'Letter' | 'Legal';

  @IsOptional() @IsArray() @IsString({ each: true })
  backgroundImage?: string[];

  @IsOptional() @IsNumber() @Min(0) backgroundOpacity?: number;
  @IsOptional() @IsNumber() @Min(1) version?: number;
  @IsOptional() @IsString() notes?: string;
}
