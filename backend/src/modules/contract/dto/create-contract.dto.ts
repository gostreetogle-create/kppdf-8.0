import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class ContractItemDto {
  @ApiProperty({ description: 'ID продукта' })
  @IsObjectId()
  productId!: string;

  @ApiPropertyOptional({ description: 'Название продукта' })
  @IsOptional() @IsString() productName?: string;

  @ApiProperty({ description: 'Количество' })
  @IsNumber() @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Единица измерения' })
  @IsOptional() @IsString() unit?: string;

  @ApiProperty({ description: 'Цена за единицу' })
  @IsNumber() @Min(0)
  unitPrice!: number;
}

export class CreateContractDto {
  @ApiPropertyOptional({ description: 'Номер контракта' })
  @IsOptional() @IsString() number?: string;
  @ApiPropertyOptional({ description: 'Название контракта' })
  @IsOptional() @IsString() title?: string;

  @ApiPropertyOptional({ description: 'ID предложения' })
  @IsOptional() @IsObjectId() proposalId?: string;

  @ApiProperty({ description: 'ID организации' })
  @IsObjectId()
  organizationId!: string;

  @ApiProperty({ description: 'ID заказчика' })
  @IsObjectId()
  customerId!: string;

  @ApiPropertyOptional({
    enum: ['draft', 'sent', 'signed', 'active', 'completed', 'cancelled', 'expired'],
    description: 'Статус контракта',
  })
  @IsOptional()
  @IsIn(['draft', 'sent', 'signed', 'active', 'completed', 'cancelled', 'expired'])
  status?: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled' | 'expired';

  @ApiPropertyOptional({ description: 'Заметки' })
  @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ description: 'Дата истечения (ISO)' })
  @IsOptional() @IsDateString() expiresAt?: string;
  @ApiPropertyOptional({ description: 'Тег пакета' })
  @IsOptional() @IsString() packageTag?: string;

  @ApiProperty({ type: [ContractItemDto], description: 'Позиции контракта' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractItemDto)
  items!: ContractItemDto[];
}
