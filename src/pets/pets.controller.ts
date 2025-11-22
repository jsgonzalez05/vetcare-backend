import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('reports/incomplete-vaccinations')
  async getIncompleteVaccinations() {
    return this.petsService.getEsquemaIncompleto();
  }
  
  @Post()
  create(@Body() createPetDto: any) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  findAll() {
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePetDto: any) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}