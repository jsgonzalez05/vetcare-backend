import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Pet } from '../../pets/schemas/pet.schema';
import { Vaccine } from '../../vaccines/schemas/vaccine.schema';

export type TreatmentDocument = HydratedDocument<Treatment>;

@Schema()
export class Treatment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true })
  mascota_id: Pet;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  tipo: string; // Ej: 'Vacunación', 'Consulta'

  @Prop()
  notas: string;

  @Prop({ required: true })
  costo: number;

  // Relación opcional con Vacuna
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine' })
  vacuna_usada: Vaccine;

  @Prop()
  cantidad: number; // Dosis a descontar
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);