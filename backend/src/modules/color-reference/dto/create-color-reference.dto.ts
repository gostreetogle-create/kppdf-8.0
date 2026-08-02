import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

/**
 * TZ-PRODUCTS-301 — Create DTO for color references.
 *
 * Whitelist-only: the global ValidationPipe strips unknown fields
 * (forbidNonWhitelisted → 400). `organizationId` is NOT accepted from the
 * client — it is derived from the authenticated user (controller), so a
 * user can never create a color in a foreign scope.
 *
 * `slug` is OPTIONAL: when omitted the server generates it from `name`
 * (Russian→Latin transliteration, kebab-case) — see
 * `ColorReferenceService.slugify`. `hex` is REQUIRED and validated as
 * `#RRGGBB` (400 on anything else).
 */
export class CreateColorReferenceDto {
  @ApiProperty({ example: 'RAL 9003 (Сигнальный белый)', description: 'Название цвета' })
  @IsString()
  @Length(1, 128)
  name!: string;

  @ApiPropertyOptional({ example: 'ral-9003-signal-white', description: 'Slug (строчные, a-z, 0-9, -). Необязателен — сервер сгенерирует из name' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase, a-z, 0-9, -' })
  slug?: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Swatch-значение #RRGGBB' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'hex must match #RRGGBB' })
  hex!: string;

  @ApiPropertyOptional({ description: 'Описание цвета' })
  @IsOptional()
  @IsString()
  @Length(0, 512)
  description?: string;

  @ApiPropertyOptional({ description: 'Активен ли цвет' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Цвет по умолчанию для форм товара' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
