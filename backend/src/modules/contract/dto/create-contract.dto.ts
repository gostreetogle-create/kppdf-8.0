import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class ContractItemDto {
  @IsObjectId()
  productId!: string;

  @IsOptional() @IsString() productName?: string;

  @IsNumber() @Min(0)
  quantity!: number;

  @IsOptional() @IsString() unit?: string;

  @IsNumber() @Min(0)
  unitPrice!: number;
}

export class CreateContractDto {
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() title?: string;

  @IsOptional() @IsObjectId() proposalId?: string;

  @IsObjectId()
  organizationId!: string;

  @IsObjectId()
  customerId!: string;

  @IsOptional()
  @IsIn(['draft', 'sent', 'signed', 'active', 'completed', 'cancelled', 'expired'])
  status?: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled' | 'expired';

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsString() packageTag?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractItemDto)
  items!: ContractItemDto[];
}
