import { Controller, Get, Post, Body, Param, Put, Patch, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // --- Endpoint de Reporte ---
  @Get('reports/upcoming')
  getUpcomingReport(@Query('veterinarian') veterinarian?: string) {
    // Pasamos el parámetro (puede ser undefined si no lo envían)
    return this.appointmentsService.getUpcomingReport(veterinarian);
  }

  @Post()
  create(@Body() createAppointmentDto: any) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // Reprogramar / Editar
  @Put(':id') 
  update(@Param('id') id: string, @Body() updateAppointmentDto: any) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  // Cancelar específicamente
  @Patch(':id/cancel') 
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}