import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateActualCostDto {
  @IsObjectId()
  orderId!: string;

  @IsIn(['material', 'labor', 'overhead', 'other'])
  type!: 'material' | 'labor' | 'overhead' | 'other';

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sourceRef?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsObjectId() createdBy?: string;
}
