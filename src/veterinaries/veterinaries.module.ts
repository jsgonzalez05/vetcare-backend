import { Module } from '@nestjs/common';
import { VeterinariesController } from './veterinaries.controller';

@Module({
  controllers: [VeterinariesController]
})
export class VeterinariesModule {}
