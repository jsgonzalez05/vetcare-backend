import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Pet } from '../../pets/schemas/pet.schema';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema()
export class Appointment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true })
  mascota_id: Pet;

  @Prop({ required: true })
  fecha: Date;

  @Prop()
  motivo: string;

  @Prop({ required: true })
  veterinario: string;

  @Prop({ default: 'pendiente' })
  estado: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);