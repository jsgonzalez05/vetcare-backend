import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaccineDocument = HydratedDocument<Vaccine>;

@Schema()
export class Vaccine {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, min: 0 })
  stock: number;
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);