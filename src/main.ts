import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  app.useGlobalFilters(new MongoExceptionFilter());

  app.setGlobalPrefix('api');
  
  const config = new DocumentBuilder()
    .setTitle('VetCare 2.0 API')
    .setDescription('Sistema de gestión veterinaria: Dueños, Mascotas, Citas, Tratamientos y Vacunas.')
    .setVersion('1.0')
    .addTag('owners', 'Gestión de dueños')
    .addTag('pets', 'Gestión de pacientes (mascotas)')
    .addTag('appointments', 'Agenda y Citas')
    .addTag('treatments', 'Tratamientos e historial clínico')
    .addTag('vaccines', 'Inventario de vacunas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(3000);
}
bootstrap();