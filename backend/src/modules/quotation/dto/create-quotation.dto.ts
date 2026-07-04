import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';

export class QuotationItemDto {
  @IsObjectId()
  productId!: string;

  @IsOptional() @IsString() productName?: string;
  @IsOptional() @IsString() productSku?: string;
  @IsOptional() @IsString() sourceItemId?: string;

  @IsNumber() @Min(0)
  quantity!: number;

  @IsOptional() @IsString() unit?: string;
  @IsNumber() @Min(0)
  unitPrice!: number;

  @IsOptional() @IsNumber() @Min(0) markupPercent?: number;
  @IsOptional() @IsNumber() @Min(0) sortOrder?: number;
}

export class CreateQuotationDto {
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() title?: string;

  @IsObjectId()
  organizationId!: string;

  @IsObjectId()
  counterpartyId!: string;

  @IsOptional() @IsObjectId() tenderId?: string;

  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() validUntil?: string;

  @IsOptional()
  @IsIn(['draft', 'sent', 'accepted', 'rejected', 'converted', 'cancelled'])
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'cancelled';

  @IsOptional()
  @IsIn(['none', 'percent', 'amount'])
  discountType?: 'none' | 'percent' | 'amount';

  @IsOptional() @IsNumber() @Min(0) discountPercent?: number;
  @IsOptional() @IsNumber() @Min(0) discountAmount?: number;

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsObjectId() templateId?: string;
  @IsOptional() designSnapshot?: Record<string, unknown>;
  @IsOptional() templateSnapshot?: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];
}
