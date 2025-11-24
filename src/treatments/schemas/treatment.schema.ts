import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Pet } from '../../pets/schemas/pet.schema';
import { Vaccine } from '../../vaccines/schemas/vaccine.schema';

export type TreatmentDocument = HydratedDocument<Treatment>;

// 1. Definimos un sub-esquema para los items del array
@Schema({ _id: false }) // No necesitamos ID para estos sub-objetos
class TreatmentItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine', required: true })
  vacuna_id: Vaccine;

  @Prop({ required: true, min: 1 })
  cantidad: number;
}
const TreatmentItemSchema = SchemaFactory.createForClass(TreatmentItem);

@Schema()
export class Treatment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true })
  mascota_id: Pet;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  tipo: string; 

  @Prop()
  notas: string;

  @Prop({ required: true })
  costo: number;

  @Prop({ type: [TreatmentItemSchema], default: [] })
  vacunas_usadas: TreatmentItem[];
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);