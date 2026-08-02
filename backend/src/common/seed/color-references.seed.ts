import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ColorReference,
  ColorReferenceDocument,
} from '../../modules/color-reference/color-reference.schema';
import { SYSTEM_DEFAULT_COLOR_SLUG } from '../../modules/color-reference/color-reference.service';

/**
 * TZ-PRODUCTS-301 — системный default-цвет «Не выбран».
 *
 * Идемпотентный seed: глобальный (system, без organizationId) активный
 * isDefault-цвет «Не выбран» (hex #9CA3AF). Сервисный `resolveDefault()`
 * падает на него, так что форма товара всегда может показать
 * «цвет не выбран» на свежей базе.
 *
 * Idempotent: compound unique index {organizationId, slug} (null org для
 * system) предотвращает дубли; дополнительно проверяем существование.
 */
@Injectable()
export class ColorReferencesSeed implements OnModuleInit {
  private readonly logger = new Logger(ColorReferencesSeed.name);

  constructor(
    @InjectModel(ColorReference.name)
    private readonly model: Model<ColorReferenceDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.model
      .findOne({ slug: SYSTEM_DEFAULT_COLOR_SLUG })
      .exec();
    if (existing) {
      this.logger.log(
        `System default color «${SYSTEM_DEFAULT_COLOR_SLUG}» already present, skip`,
      );
      return;
    }
    await this.model.create({
      organizationId: undefined,
      name: 'Не выбран',
      slug: SYSTEM_DEFAULT_COLOR_SLUG,
      hex: '#9CA3AF',
      isSystem: true,
      isActive: true,
      isDefault: true,
      sortOrder: 0,
      description: 'Системный цвет по умолчанию — «цвет не выбран».',
    });
    this.logger.log(
      `Inserted system default color «${SYSTEM_DEFAULT_COLOR_SLUG}»`,
    );
  }
}
