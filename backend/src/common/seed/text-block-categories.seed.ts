import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TextBlockCategory,
  TextBlockCategoryDocument,
  SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
} from '../../modules/text-block-category/text-block-category.schema';

/** TZ-DOC-315 Ч Idempotent system-default seed for text-block categories. */
@Injectable()
export class TextBlockCategoriesSeed implements OnModuleInit {
  private readonly logger = new Logger(TextBlockCategoriesSeed.name);

  constructor(
    @InjectModel(TextBlockCategory.name)
    private readonly model: Model<TextBlockCategoryDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.model
      .findOne({ slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG })
      .exec();
    if (existing) {
      this.logger.log(
        `System default Ђ${SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG}ї already present, skip`,
      );
      return;
    }
    await this.model.create({
      organizationId: undefined,
      name: 'ќбщее',
      slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
      isSystem: true,
      isActive: true,
      isDefault: true,
      sortOrder: 0,
      description:
        '—истемна€ категори€ по умолчанию дл€ текстовых блоков. ¬идна всем организаци€м.',
    });
    this.logger.log(
      `Inserted text-block category Ђ${SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG}ї`,
    );
  }
}
