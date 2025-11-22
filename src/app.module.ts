import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Importar esto

// Importa aquí tus módulos (OwnersModule, PetsModule, etc.)
import { OwnersModule } from './owners/owners.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PetsModule } from './pets/pets.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { VaccinationSchemesService } from './vaccination-schemes/vaccination-schemes.service';
import { VaccinationSchemesModule } from './vaccination-schemes/vaccination-schemes.module';

@Module({
  imports: [
    // 2. Configurar ConfigModule para que sea global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 3. Usar forRootAsync para inyectar la configuración
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Lee la variable del .env
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