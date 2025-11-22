import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VaccinesService } from './vaccines.service';

@Controller('vaccines')
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  create(@Body() createVaccineDto: any) {
    return this.vaccinesService.create(createVaccineDto);
  }

  @Get()
  findAll() {
    return this.vaccinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vaccinesService.findOne(id);
  }
}