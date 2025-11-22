import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaccinesService } from './vaccines.service';
import { VaccinesController } from './vaccines.controller';
import { Vaccine, VaccineSchema } from './schemas/vaccine.schema';

@Module({
  imports: [
    // Registramos el Schema para usarlo dentro de este módulo
    MongooseModule.forFeature([{ name: Vaccine.name, schema: VaccineSchema }])
  ],
  controllers: [VaccinesController],
  providers: [VaccinesService],
  
  // ¡IMPORTANTE! Exportamos el servicio para que TreatmentsModule pueda usarlo
  exports: [VaccinesService], 
})
export class VaccinesModule {}