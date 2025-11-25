import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Treatment } from './schemas/treatment.schema';
import { VaccinesService } from '../vaccines/vaccines.service';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectModel(Treatment.name) private treatmentModel: Model<Treatment>,
    private vaccinesService: VaccinesService,
  ) {}

  async create(createTreatmentDto: any): Promise<Treatment> {
    const insumos = createTreatmentDto.vacunas_usadas || [];

    if (Array.isArray(insumos) && insumos.length > 0) {
      for (const item of insumos) {
        if (!item.vacuna_id || !item.cantidad) {
           throw new BadRequestException('Datos de insumos incompletos');
        }
        await this.vaccinesService.decreaseStock(item.vacuna_id, item.cantidad);
      }
    }

    const createdTreatment = new this.treatmentModel(createTreatmentDto);
    return createdTreatment.save();
  }

  async findAll(): Promise<Treatment[]> {
    return this.treatmentModel
      .find()
      .populate('mascota_id')
      .populate({
        path: 'vacunas_usadas.vacuna_id',
        model: 'Vaccine'
      })
      .exec();
  }
  
  async getReporteGastos(petName?: string) {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'pets',
          localField: 'mascota_id',
          foreignField: '_id',
          as: 'mascota_info',
        },
      },
      {
        $unwind: '$mascota_info',
      },
    ];

    if (petName) {
      pipeline.push({
        $match: {
          'mascota_info.nombre': { $regex: petName, $options: 'i' }, // Búsqueda flexible
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            mascota: '$mascota_info.nombre',
            mes: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          },
          total_gasto: { $sum: '$costo' },
          cantidad_tratamientos: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          mascota: '$_id.mascota',
          mes: '$_id.mes',
          total: '$total_gasto',
          procedimientos: '$cantidad_tratamientos',
        },
      },
      {
        $sort: { mes: -1, total: -1 },
      }
    );

    return this.treatmentModel.aggregate(pipeline);
  }

}