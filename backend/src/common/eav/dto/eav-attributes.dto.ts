/**
 * EavAttributesDto — key-value map for EAV (Entity-Attribute-Value) attributes.
 * Used as the type of `attrs` in CreateProductionOrderDto and similar DTOs
 * that need dynamic attribute sets without schema changes.
 *
 * IMPORTANT: no @ApiProperty decorator here — an index-signature class with
 * both [key: string] and concrete properties triggers a NestJS Swagger
 * circular-dependency error at schema-object-factory.ts. Since the DTO
 * consumer (create-production-order.dto.ts) uses `@ApiProperty({ required: false })`
 * on the `attrs` field itself, the Swagger schema is satisfied without
 * inspecting this class directly.
 */
export class EavAttributesDto {
  [key: string]: unknown;
}
