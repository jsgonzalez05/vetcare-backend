import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { Treatment, TreatmentSchema } from './schemas/treatment.schema';
import { VaccinesModule } from '../vaccines/vaccines.module'; // <--- 1. IMPORTAR ESTO

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Treatment.name, schema: TreatmentSchema }]),
    VaccinesModule, 
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
})
export class TreatmentsModule {}