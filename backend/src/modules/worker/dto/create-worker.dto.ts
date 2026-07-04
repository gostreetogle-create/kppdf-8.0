import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsOptional() @IsString() patronymic?: string;
  @IsOptional() @IsString() grade?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() department?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ratePerHour?: number;

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  workTypeIds?: string[];

  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional() @IsObjectId() personId?: string;
}
