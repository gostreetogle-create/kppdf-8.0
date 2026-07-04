import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ collection: 'organizations', timestamps: true })
export class Organization {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop()
  shortName?: string;

  @Prop()
  legalForm?: string;

  @Prop({ required: true, unique: true, index: true })
  inn!: string;

  @Prop()
  kpp?: string;

  @Prop()
  ogrn?: string;

  @Prop()
  ogrnip?: string;

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

  // Terms
  @Prop({ default: 10 })
  paymentTermDays!: number;

  @Prop({ default: 20 })
  vatRate!: number;

  @Prop({ default: true })
  isActive!: boolean;

  // Classification
  @Prop({ type: [String], default: [] })
  type!: string[]; // ['customer', 'supplier', 'contractor', 'manufacturer', 'partner']

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

  // Primary contact person
  @Prop({ type: Types.ObjectId, ref: 'Person' })
  contactPersonId?: Types.ObjectId;

  // Passport data (for ИП)
  @Prop()
  passportSeries?: string;

  @Prop()
  passportNumber?: string;

  @Prop()
  passportIssuedBy?: string;

  @Prop()
  passportIssuedAt?: Date;

  @Prop()
  passportDivisionCode?: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
