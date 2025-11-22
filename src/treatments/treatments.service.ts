import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Treatment } from './schemas/treatment.schema';
import { VaccinesService } from '../vaccines/vaccines.service'; // Importamos el servicio ajeno

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectModel(Treatment.name) private treatmentModel: Model<Treatment>,
    private vaccinesService: VaccinesService, // Inyectamos el servicio de vacunas
  ) {}

  async create(createTreatmentDto: any): Promise<Treatment> {
    // 1. Validamos si incluye vacuna
    if (createTreatmentDto.vacuna_usada) {
      if (!createTreatmentDto.cantidad || createTreatmentDto.cantidad <= 0) {
        throw new BadRequestException('Si usa vacuna, debe especificar la cantidad');
      }

      // 2. Llamamos al servicio de vacunas para descontar stock
      // Si no hay stock, el vaccinesService lanzará un error y detendrá el proceso aquí
      await this.vaccinesService.decreaseStock(
        createTreatmentDto.vacuna_usada,
        createTreatmentDto.cantidad,
      );
    }

    // 3. Si todo salió bien (o no hubo vacuna), guardamos el tratamiento
    const createdTreatment = new this.treatmentModel(createTreatmentDto);
    return createdTreatment.save();
  }

  async findAll(): Promise<Treatment[]> {
    // Usamos populate para ver los detalles de la mascota y la vacuna (si la hay)
    return this.treatmentModel
      .find()
      .populate('mascota_id')
      .populate('vacuna_usada')
      .exec();
  }
  
  async getReporteGastos(petName?: string) {
    const pipeline: any[] = [
      // 1. UNIR ($lookup): Traemos datos de la mascota
      {
        $lookup: {
          from: 'pets',
          localField: 'mascota_id',
          foreignField: '_id',
          as: 'mascota_info',
        },
      },
      // 2. DESCOMPRIMIR ($unwind)
      {
        $unwind: '$mascota_info',
      },
      // 3. ¡FILTRO DINÁMICO AQUÍ!
      // Si nos pasaron un nombre, filtramos ANTES de agrupar para procesar menos datos
    ];

    if (petName) {
      pipeline.push({
        $match: {
          'mascota_info.nombre': { $regex: petName, $options: 'i' }, // Búsqueda flexible
        },
      });
    }

    // 4. Continuamos con la agrupación normal
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