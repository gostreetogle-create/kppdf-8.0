import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class OrderItemDto {
  @ApiProperty({ description: 'ID продукта' })
  @IsObjectId()
  productId!: string;

  @ApiPropertyOptional({ description: 'Название продукта' })
  @IsOptional() @IsString() productName?: string;
  @ApiPropertyOptional({ description: 'Артикул продукта' })
  @IsOptional() @IsString() productSku?: string;

  @ApiProperty({ description: 'Количество' })
  @IsNumber() @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Единица измерения' })
  @IsOptional() @IsString() unit?: string;

  @ApiProperty({ description: 'Цена за единицу' })
  @IsNumber() @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Номер заказа' })
  @IsOptional() @IsString() number?: string;

  @ApiProperty({ description: 'ID контрагента' })
  @IsObjectId()
  counterpartyId!: string;

  @ApiPropertyOptional({ description: 'ID коммерческого предложения' })
  @IsOptional() @IsObjectId() quotationId?: string;
  @ApiPropertyOptional({ description: 'ID контракта' })
  @IsOptional() @IsObjectId() contractId?: string;

  @ApiPropertyOptional({ description: 'Дата заказа (ISO)' })
  @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional({ description: 'Плановая дата (ISO)' })
  @IsOptional() @IsDateString() plannedDate?: string;

  @ApiPropertyOptional({
    enum: ['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'],
    description: 'Статус заказа',
  })
  @IsOptional()
  @IsIn(['draft', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'])
  status?: 'draft' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

  @ApiPropertyOptional({ description: 'Заметки к заказу' })
  @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ description: 'Адрес доставки' })
  @IsOptional() @IsString() deliveryAddress?: string;
  @ApiPropertyOptional({ description: 'ID менеджера' })
  @IsOptional() @IsObjectId() managerId?: string;

  @ApiPropertyOptional({
    enum: ['low', 'normal', 'high', 'urgent'],
    description: 'Приоритет заказа',
  })
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty({ type: [OrderItemDto], description: 'Позиции заказа' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
