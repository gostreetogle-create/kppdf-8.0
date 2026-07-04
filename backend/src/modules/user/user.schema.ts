import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ required: true })
  passwordHash!: string;

  /**
   * Single role name (string) for simplicity (per TZ-04).
   * Can be extended to `string[]` later if multi-role users are needed.
   */
  @Prop({ required: true, index: true })
  role!: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  phone?: string;

  /** Bumped on logout / change-password to invalidate all refresh tokens. */
  @Prop({ default: 0 })
  refreshTokenVersion!: number;

  @Prop()
  fullName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
