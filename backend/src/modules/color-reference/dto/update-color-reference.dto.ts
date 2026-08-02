import { PartialType } from '@nestjs/mapped-types';
import { CreateColorReferenceDto } from './create-color-reference.dto';

/**
 * TZ-PRODUCTS-301 — Update DTO for color references.
 *
 * PartialType(CreateColorReferenceDto) — все поля опциональны,
 * whitelist-only (глобальный ValidationPipe). organizationId из DTO
 * по-прежнему не принимается (IDOR guard: из req.user в контроллере).
 */
export class UpdateColorReferenceDto extends PartialType(CreateColorReferenceDto) {}
