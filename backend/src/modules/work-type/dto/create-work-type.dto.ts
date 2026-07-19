import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';
import { ToObjectId } from '../../../common/decorators/to-object-id.decorator';

export class CreateWorkTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional() @IsString() section?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsNumber() @Min(0) defaultDurationHours?: number;
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsObjectId() @ToObjectId() workCenterId?: string;
}
