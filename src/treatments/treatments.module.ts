import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { Treatment, TreatmentSchema } from './schemas/treatment.schema';
import { VaccinesModule } from '../vaccines/vaccines.module'; // <--- 1. IMPORTAR ESTO

@Module({
  imports: [
    // Registramos el Schema de Tratamientos
    MongooseModule.forFeature([{ name: Treatment.name, schema: TreatmentSchema }]),
    // Importamos el módulo de vacunas para usar su servicio exportado
    VaccinesModule, 
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
})
export class TreatmentsModule {}