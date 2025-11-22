// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter'; // <--- Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aplicar el filtro globalmente
  app.useGlobalFilters(new MongoExceptionFilter());

  await app.listen(3000);
}
bootstrap();