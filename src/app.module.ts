import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OwnersModule } from './owners/owners.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PetsModule } from './pets/pets.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { VaccinationSchemesService } from './vaccination-schemes/vaccination-schemes.service';
import { VaccinationSchemesModule } from './vaccination-schemes/vaccination-schemes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    OwnersModule,
    PetsModule,
    AppointmentsModule,
    TreatmentsModule,
    VaccinesModule,
    VaccinationSchemesModule,
  ],
  controllers: [],
  providers: [VaccinationSchemesService],
})
export class AppModule {}