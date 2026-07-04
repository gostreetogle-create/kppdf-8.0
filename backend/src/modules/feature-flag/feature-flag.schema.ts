import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;

@Schema({ collection: 'featureflags', timestamps: true })
export class FeatureFlag {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true })
  label!: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  enabledByDefault!: boolean;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

FeatureFlagSchema.virtual('enabled').get(function (this: FeatureFlagDocument) {
  return this.isActive ? this.enabledByDefault : this.enabledByDefault;
});

FeatureFlagSchema.set('toJSON', { virtuals: true });
FeatureFlagSchema.set('toObject', { virtuals: true });
