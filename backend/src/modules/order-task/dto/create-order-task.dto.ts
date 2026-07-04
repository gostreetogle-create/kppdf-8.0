import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateOrderTaskDto {
  @IsObjectId()
  productionOrderId!: string;

  @IsOptional() @IsObjectId() componentId?: string;
  @IsOptional() @IsString() componentName?: string;
  @IsOptional() @IsObjectId() workTypeId?: string;
  @IsOptional() @IsString() workTypeName?: string;
  @IsOptional() @IsObjectId() workerId?: string;
  @IsOptional() @IsObjectId() workCenterId?: string;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'skipped', 'cancelled'])
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';

  @IsOptional() @IsNumber() @Min(0) estimatedHours?: number;
  @IsOptional() @IsNumber() actualHours?: number;
  @IsOptional() @IsNumber() sortOrder?: number;

  @IsOptional() @IsDateString() actualStartDate?: string;
  @IsOptional() @IsDateString() actualEndDate?: string;

  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  dependsOnTaskIds?: string[];
}
