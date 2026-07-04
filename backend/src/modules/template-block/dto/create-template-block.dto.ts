import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateTemplateBlockDto {  @IsObjectId() templateId!: string;

  @IsIn(['header', 'text', 'table', 'image', 'signature'])
  type!: 'header' | 'text' | 'table' | 'image' | 'signature';

  @IsNumber() @Min(0)
  order!: number;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsNumber() @Min(0) height?: number;
  @IsOptional() @IsBoolean() showLine?: boolean;
  @IsOptional() settings?: Record<string, unknown>;
}
