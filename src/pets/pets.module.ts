import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { Pet, PetSchema } from './schemas/pet.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Treatment, TreatmentSchema } from '../treatments/schemas/treatment.schema';
import { VaccinationSchemesModule } from '../vaccination-schemes/vaccination-schemes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pet.name, schema: PetSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Treatment.name, schema: TreatmentSchema },
    ]),
    VaccinationSchemesModule
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}