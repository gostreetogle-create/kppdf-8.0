import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentTemplateDocument = HydratedDocument<DocumentTemplate>;

@Schema({ collection: 'document_templates', timestamps: true })
export class DocumentTemplate {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocType', required: true, index: true })
  docTypeId!: Types.ObjectId;

  /**
   * TZ-DOC-307 — document-template category (FK → DocumentTemplateCategory).
   *
   * Optional on the persisted model for READ compatibility with legacy
   * templates created before categories existed. New templates always
   * receive a category SERVER-SIDE: either the caller-provided
   * `categoryId` (validated active + same org scope) or the active default
   * category resolved by DocumentTemplateCategoryService. Dangling / cross-org
   * references are rejected, and a referenced category cannot be deleted.
   */
  @Prop({ type: Types.ObjectId, ref: 'DocumentTemplateCategory', index: true })
  categoryId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDefault!: boolean;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ enum: ['A3', 'A4', 'A5'], default: 'A4' })
  pageSize!: string;

  @Prop({ type: [String], default: [] })
  backgroundImage!: string[];

  @Prop({ default: -1 })
  defaultBackgroundIndex!: number;

  @Prop({ default: 0.3 })
  backgroundOpacity!: number;

  @Prop({ enum: ['portrait', 'landscape'], default: 'portrait' })
  orientation!: 'portrait' | 'landscape';

  @Prop({ default: false })
  pageNumbering?: boolean;

  @Prop({ default: false })
  tableOfContents?: boolean;

  @Prop({ default: '' })
  headerText?: string;

  @Prop({ default: '' })
  footerText?: string;

  @Prop({ default: 1 })
  version!: number;

  @Prop()
  notes?: string;

  /**
   * TZ-251 §ШАГ 1 — Object-level ownership (IDOR).
   *
   * Optional ObjectId of the user who created the template. New templates
   * (created via `POST /api/document-templates`) populate this from
   * `req.user.id`. Existing legacy templates without `createdBy` fall back
   * to RBAC-only authorization (the `OwnershipGuard` ladder treats
   * undefined owner as "defer to roles" — see `OwnershipGuard` Step 7).
   *
   * Index added on `createdBy` because future guards (TZ-255
   * server-side permissions) will need it for `find({ createdBy: userId })`
   * filters.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const DocumentTemplateSchema = SchemaFactory.createForClass(DocumentTemplate);
DocumentTemplateSchema.index({ organizationId: 1, docTypeId: 1, isDefault: 1 });
