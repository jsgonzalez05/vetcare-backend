import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaccinationSchemesService } from './vaccination-schemes.service';
import { VaccinationSchemesController } from './vaccination-schemes.controller';
import { VaccinationScheme, VaccinationSchemeSchema } from './schemas/vaccination-scheme.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VaccinationScheme.name, schema: VaccinationSchemeSchema }])
  ],
  controllers: [VaccinationSchemesController],
  providers: [VaccinationSchemesService],
  exports: [VaccinationSchemesService, MongooseModule], // Exportamos para usarlo en Pets
})
export class VaccinationSchemesModule {}