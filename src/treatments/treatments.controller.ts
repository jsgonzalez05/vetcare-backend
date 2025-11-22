import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // --- Endpoint de Reporte de Gastos ---
  @Get('reports/expenses')
  getExpensesReport(@Query('petName') petName?: string) {
    return this.treatmentsService.getReporteGastos(petName);
  }

  @Post()
  create(@Body() createTreatmentDto: any) {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Get()
  findAll() {
    return this.treatmentsService.findAll();
  }
}