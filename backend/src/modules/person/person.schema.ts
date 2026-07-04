import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ collection: 'persons', timestamps: true })
export class Person {
  @Prop({ required: true, index: true })
  lastName!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  patronymic?: string;

  @Prop({ index: true })
  phone?: string;

  @Prop({ index: true })
  email?: string;

  @Prop()
  position?: string;

  @Prop()
  notes?: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
PersonSchema.index({ lastName: 1, firstName: 1, patronymic: 1 });
