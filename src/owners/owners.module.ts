import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Importar
import { OwnersService } from './owners.service';
import { OwnersController } from './owners.controller';
import { Owner, OwnerSchema } from './schemas/owner.schema'; // Importar Schema

@Module({
  imports: [
    // Registramos el Schema para que este módulo lo pueda usar
    MongooseModule.forFeature([{ name: Owner.name, schema: OwnerSchema }])
  ],
  controllers: [OwnersController],
  providers: [OwnersService],
})
export class OwnersModule {}