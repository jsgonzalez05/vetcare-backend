import { Body, Controller, Get, Post } from '@nestjs/common';
import { OwnersService } from './owners.service';

@Controller('owners') // La ruta será http://localhost:3000/owners
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Post()
  async create(@Body() createOwnerDto: any) {
    // Recibe los datos del frontend (o Postman) y llama al servicio
    return this.ownersService.create(createOwnerDto);
  }

  @Get()
  async findAll() {
    return this.ownersService.findAll();
  }
}