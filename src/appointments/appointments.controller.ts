import { Controller, Get, Post, Body, Param, Put, Patch, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('reports/upcoming')
  getUpcomingReport(@Query('veterinarian') veterinarian?: string) {
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

  @Put(':id') 
  update(@Param('id') id: string, @Body() updateAppointmentDto: any) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/cancel') 
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}