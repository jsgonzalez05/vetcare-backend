import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common'; // Agregamos Put y Delete
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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVaccineDto: any) {
    return this.vaccinesService.update(id, updateVaccineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vaccinesService.remove(id);
  }
}