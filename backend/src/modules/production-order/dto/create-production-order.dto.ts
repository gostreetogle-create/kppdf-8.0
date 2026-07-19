import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';
import { ToObjectId } from '../../../common/decorators/to-object-id.decorator';

export class CreateProductionOrderDto {
  @IsObjectId()
  @ToObjectId()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() ralCode?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() packageTag?: string;

  @IsOptional() @IsDateString() plannedStartDate?: string;
  @IsOptional() @IsDateString() plannedEndDate?: string;

  @IsOptional() @IsObjectId() @ToObjectId() workCenterId?: string;
  @IsOptional() @IsObjectId() @ToObjectId() workTypeId?: string;
  @IsOptional() @IsObjectId() @ToObjectId() contractId?: string;
  @IsOptional() @IsObjectId() @ToObjectId() proposalId?: string;
}
