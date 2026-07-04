import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateProductionOrderDto {
  @IsObjectId()
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

  @IsOptional() @IsObjectId() workCenterId?: string;
  @IsOptional() @IsObjectId() workTypeId?: string;
  @IsOptional() @IsObjectId() contractId?: string;
  @IsOptional() @IsObjectId() proposalId?: string;
}
