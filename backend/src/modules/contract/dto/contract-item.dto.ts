import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * ContractItemDto — single line-item inside CreateContractDto.items[].
 * Mirrors the QuotationItem shape used during quotation→contract conversion.
 */
export class ContractItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ description: 'Product display name' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Quantity (must be ≥ 1)' })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Unit price (must be ≥ 0)' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
