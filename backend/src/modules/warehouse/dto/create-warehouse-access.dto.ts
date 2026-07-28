import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "../../../common/decorators/is-object-id.decorator";

/**
 * TZ-200.C — CreateWarehouseAccessDto.
 *
 * Grants a Role access to a Warehouse with optional time-bound (expiresAt)
 * and detailed (notes) qualifications. Idempotent: re-submitting identical
 * (warehouseId, roleId, permission) is a no-op; use revoke/reactivate
 * endpoints to change state on existing grants.
 */
export class CreateWarehouseAccessDto {
  @ApiProperty({ description: "Warehouse ID to grant access on" })
  @IsObjectId()
  warehouseId!: string;

  @ApiProperty({ description: "Role ID to grant the access to" })
  @IsObjectId()
  roleId!: string;

  @ApiProperty({
    enum: ["read", "write", "admin"],
    description: "Permission level for this grant",
    default: "read",
  })
  @IsOptional()
  @IsIn(["read", "write", "admin"])
  permission?: "read" | "write" | "admin";

  @ApiPropertyOptional({
    description: "Optional expiry timestamp (ISO). Past dates will be filtered out by queries.",
    example: "2026-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: "Free-text annotation (granted-by-user, reason, etc.)" })
  @IsOptional()
  @IsString()
  notes?: string;
}
