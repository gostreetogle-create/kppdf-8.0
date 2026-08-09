import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BuildPreviewLineDto {
  @IsString()
  productName!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsString()
  productSku?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class BuildTableLayoutColumnDto {
  @IsString()
  key!: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

/**
 * TZ-86 Phase A.4 — BuildDocumentDto.
 *
 * Input body for `POST /api/document-templates/:id/build`. A flat record of
 * optional ObjectId strings — one canonical key per `DataBindingSource` value.
 * Service resolves each in parallel via Mongoose findById and exposes them
 * to the template's blocks via dataBinding source-matching (`bag.source`).
 *
 * The build surface includes organization, counterparty, quotation, invoice,
 * contract and order sources. Catalog/work sources remain available for the
 * existing builder bindings; unsupported sources resolve to an empty render.
 *
 * Whitelist-strict (forbidNonWhitelisted) in main.ts ensures unknown fields
 * are stripped before reaching the service.
 */
export class BuildDocumentDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildPreviewLineDto)
  previewLines?: BuildPreviewLineDto[];

  /** Request-only copy-on-write layout for the live КП line-items table. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildTableLayoutColumnDto)
  tableLayout?: BuildTableLayoutColumnDto[];

  @IsOptional() @IsString() @IsObjectId() organizationId?: string;

  @IsOptional() @IsString() @IsObjectId() counterpartyId?: string;

  @IsOptional() @IsString() @IsObjectId() productId?: string;

  @IsOptional() @IsString() @IsObjectId() materialId?: string;

  @IsOptional() @IsString() @IsObjectId() workTypeId?: string;

  @IsOptional() @IsString() @IsObjectId() orderId?: string;

  @IsOptional() @IsString() @IsObjectId() quotationId?: string;

  @IsOptional() @IsString() @IsObjectId() invoiceId?: string;

  @IsOptional() @IsString() @IsObjectId() contractId?: string;
}
