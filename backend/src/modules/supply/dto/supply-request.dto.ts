import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';
import type {
  SupplyRequestPriority,
  SupplyRequestStatus,
} from '../supply-request.schema';

export const SUPPLY_REQUEST_STATUSES = [
  'in_progress',
  'requested',
  'ordered',
  'received',
  'cancelled',
] as const;

export const SUPPLY_REQUEST_PRIORITIES = ['urgent', 'normal', 'low'] as const;

export class CreateSupplyRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 256)
  title?: string;

  @IsOptional()
  @IsObjectId()
  categoryId?: string;

  @IsOptional()
  @IsObjectId()
  materialId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 256)
  article?: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2048)
  productUrl?: string;

  @IsOptional()
  @IsObjectId()
  supplierId?: string;

  @IsOptional()
  @IsObjectId()
  supplierContactId?: string;

  @IsOptional()
  @IsObjectId()
  companyId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  requestedBy?: string;

  @IsOptional()
  @IsObjectId()
  orderId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty?: number;

  @IsOptional()
  @IsString()
  @Length(0, 32)
  unit?: string;

  @IsOptional()
  @IsDateString()
  neededBy?: string;

  @IsOptional()
  @IsIn(SUPPLY_REQUEST_STATUSES)
  status?: SupplyRequestStatus;

  @IsOptional()
  @IsIn(SUPPLY_REQUEST_PRIORITIES)
  priority?: SupplyRequestPriority;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceHint?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lineTotal?: number;

  @IsOptional()
  @IsDateString()
  supplierOrderDate?: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  responsible?: string;
}

export class UpdateSupplyRequestDto extends PartialType(CreateSupplyRequestDto) {}
