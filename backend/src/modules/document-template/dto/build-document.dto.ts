import { IsObjectId } from '../../../common/decorators/is-object-id.decorator';
import { IsOptional, IsString } from 'class-validator';

/**
 * TZ-86 Phase A.4 — BuildDocumentDto.
 *
 * Input body for `POST /api/document-templates/:id/build`. A flat record of
 * optional ObjectId strings — one canonical key per `DataBindingSource` value.
 * Service resolves each in parallel via Mongoose findById and exposes them
 * to the template's blocks via dataBinding source-matching (`bag.source`).
 *
 * MVP scope (TZ-86 A.4): only the 7 main data sources are wired. Sources not
 * yet represented (`cost-calculation`, `table-template`, `text-block`) will
 * resolve to empty render — locked to a planned extension in TZ-86D/E.
 *
 * Whitelist-strict (forbidNonWhitelisted) in main.ts ensures unknown fields
 * are stripped before reaching the service.
 */
export class BuildDocumentDto {
  @IsOptional() @IsString() @IsObjectId() organizationId?: string;

  @IsOptional() @IsString() @IsObjectId() counterpartyId?: string;

  @IsOptional() @IsString() @IsObjectId() productId?: string;

  @IsOptional() @IsString() @IsObjectId() materialId?: string;

  @IsOptional() @IsString() @IsObjectId() workTypeId?: string;

  @IsOptional() @IsString() @IsObjectId() orderId?: string;

  @IsOptional() @IsString() @IsObjectId() contractId?: string;
}
