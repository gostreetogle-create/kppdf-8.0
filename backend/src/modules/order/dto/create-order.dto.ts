import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class OrderItemDto {
  @IsObjectId()
  productId!: string;

  @IsOptional() @IsString() productName?: string;
  @IsOptional() @IsString() productSku?: string;

  @IsNumber() @Min(0)
  quantity!: number;

  @IsOptional() @IsString() unit?: string;

  @IsNumber() @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsOptional() @IsString() number?: string;

  @IsObjectId()
  counterpartyId!: string;

  @IsOptional() @IsObjectId() quotationId?: string;
  @IsOptional() @IsObjectId() contractId?: string;

  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() plannedDate?: string;

  @IsOptional()
  @IsIn(['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'])
  status?: 'draft' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() deliveryAddress?: string;
  @IsOptional() @IsObjectId() managerId?: string;

  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
