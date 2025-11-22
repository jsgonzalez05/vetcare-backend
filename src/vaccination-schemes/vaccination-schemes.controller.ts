import { Controller, Post, Body, Get } from '@nestjs/common';
import { VaccinationSchemesService } from './vaccination-schemes.service';

@Controller('vaccination-schemes')
export class VaccinationSchemesController {
  constructor(private readonly service: VaccinationSchemesService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}