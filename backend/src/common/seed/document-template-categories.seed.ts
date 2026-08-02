import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DocumentTemplateCategory,
  DocumentTemplateCategoryDocument,
} from '../../modules/document-template-category/document-template-category.schema';
import { SYSTEM_DEFAULT_CATEGORY_SLUG } from '../../modules/document-template-category/document-template-category.service';

/**
 * TZ-DOC-307 — system default document-template category.
 *
 * Ensures a global (system) active default «Общее» exists on every boot.
 * The service's `resolveDefault()` falls back to it, so a brand-new
 * database can already create templates without a categoryId — the
 * server-side default contract works out of the box.
 *
 * Idempotent: the compound unique index {organizationId, slug} (null org
 * for system records) prevents duplicates; we also check existence first.
 */
@Injectable()
export class DocumentTemplateCategoriesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(DocumentTemplateCategoriesSeed.name);

  constructor(
    @InjectModel(DocumentTemplateCategory.name)
    private readonly model: Model<DocumentTemplateCategoryDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.model
      .findOne({ slug: SYSTEM_DEFAULT_CATEGORY_SLUG })
      .exec();
    if (existing) return;

    await this.model.create({
      name: 'Общее',
      slug: SYSTEM_DEFAULT_CATEGORY_SLUG,
      description: 'Системная категория по умолчанию',
      isActive: true,
      isDefault: true,
      isSystem: true,
      sortOrder: 0,
      // organizationId intentionally absent → system (global) scope.
    });
    this.logger.log(
      `DocumentTemplateCategory seeded: system «Общее» (${SYSTEM_DEFAULT_CATEGORY_SLUG})`,
    );
  }
}
