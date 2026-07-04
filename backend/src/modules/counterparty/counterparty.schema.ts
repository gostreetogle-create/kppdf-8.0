import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CounterpartyDocument = HydratedDocument<Counterparty>;

@Schema({ collection: 'counterparties', timestamps: true })
export class Counterparty {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  shortName?: string;

  @Prop()
  legalForm?: string;

  @Prop({ type: [String], default: [] })
  roles!: string[]; // refs by slug to CounterpartyRole

  @Prop({ required: true, unique: true, index: true })
  inn!: string;

  @Prop()
  kpp?: string;

  @Prop()
  ogrn?: string;

  // Banking
  @Prop()
  bankName?: string;

  @Prop()
  bankBik?: string;

  @Prop()
  bankAccount?: string;

  @Prop()
  bankCorrAccount?: string;

  // Signer
  @Prop()
  signerName?: string;

  @Prop()
  signerPosition?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  type!: string[];

  @Prop()
  legalType?: 'ooo' | 'ip' | 'pao' | 'ao' | 'other';

  @Prop()
  website?: string;

  @Prop()
  directorName?: string;

  @Prop()
  registrationDate?: Date;

  @Prop({ type: [String], default: [] })
  partyTypes!: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Photo' }], default: [] })
  photoIds!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Person' })
  contactPersonId?: Types.ObjectId;

  // Terms
  @Prop({ default: 10 })
  paymentTermDays!: number;

  @Prop({ default: 20 })
  vatRate!: number;
}

export const CounterpartySchema = SchemaFactory.createForClass(Counterparty);
CounterpartySchema.index({ name: 1 });
