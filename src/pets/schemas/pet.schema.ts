import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Owner } from '../../owners/schemas/owner.schema';

export type PetDocument = HydratedDocument<Pet>;

@Schema()
export class Pet {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  especie: string;

  @Prop()
  raza: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true })
  dueno_id: Owner; // Relación

  @Prop()
  fecha_nacimiento: Date;
}

export const PetSchema = SchemaFactory.createForClass(Pet);