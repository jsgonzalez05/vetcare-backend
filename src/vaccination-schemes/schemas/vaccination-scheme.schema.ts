import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Vaccine } from '../../vaccines/schemas/vaccine.schema';

export type VaccinationSchemeDocument = HydratedDocument<VaccinationScheme>;

@Schema({ _id: false })
export class SchemeDetail {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine', required: true })
  vacuna_id: Vaccine;

  @Prop({ required: true })
  edad_meses: number;

  @Prop()
  frecuencia_dias: number;

  @Prop()
  notas: string;
}

const SchemeDetailSchema = SchemaFactory.createForClass(SchemeDetail);

@Schema()
export class VaccinationScheme {
  @Prop({ required: true, unique: true })
  especie: string;

  @Prop({ required: true })
  nombre_esquema: string;

  @Prop({ type: [SchemeDetailSchema], required: true })
  vacunas_requeridas: SchemeDetail[];
}

export const VaccinationSchemeSchema = SchemaFactory.createForClass(VaccinationScheme);