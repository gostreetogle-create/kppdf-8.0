import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsObjectId()
  productId!: string;

  @IsObjectId()
  warehouseId!: string;

  @IsNumber()
  @Min(0.0001)
  qty!: number;

  @IsOptional() @IsString() zoneName?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() expiresAt?: Date;
}
