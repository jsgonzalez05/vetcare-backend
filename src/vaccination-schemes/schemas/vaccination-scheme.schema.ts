import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Vaccine } from '../../vaccines/schemas/vaccine.schema';

export type VaccinationSchemeDocument = HydratedDocument<VaccinationScheme>;

// Clase auxiliar para los detalles de cada vacuna dentro del esquema
@Schema({ _id: false }) // No necesitamos ID para sub-documentos
export class SchemeDetail {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine', required: true })
  vacuna_id: Vaccine; // Relación con la tabla Vacunas

  @Prop({ required: true })
  edad_meses: number; // A qué edad se aplica (ej: 3 meses)

  @Prop()
  frecuencia_dias: number; // Cada cuánto se repite (ej: 365 días)

  @Prop()
  notas: string; // Ej: "Refuerzo anual"
}

const SchemeDetailSchema = SchemaFactory.createForClass(SchemeDetail);

@Schema()
export class VaccinationScheme {
  @Prop({ required: true, unique: true })
  especie: string; // Ej: "Perro", "Gato"

  @Prop({ required: true })
  nombre_esquema: string; // Ej: "Esquema Básico Canino"

  // Array de vacunas requeridas
  @Prop({ type: [SchemeDetailSchema], required: true })
  vacunas_requeridas: SchemeDetail[];
}

export const VaccinationSchemeSchema = SchemaFactory.createForClass(VaccinationScheme);