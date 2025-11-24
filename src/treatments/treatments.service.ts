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
    const insumos = createTreatmentDto.vacunas_usadas || [];

    // 1. Validar y descontar stock para CADA vacuna en la lista
    if (Array.isArray(insumos) && insumos.length > 0) {
      // Usamos un bucle for-of para esperar a que cada promesa termine (secuencial)
      for (const item of insumos) {
        if (!item.vacuna_id || !item.cantidad) {
           throw new BadRequestException('Datos de insumos incompletos');
        }
        // Si no hay stock, decreaseStock lanzará excepción y detendrá todo el proceso
        await this.vaccinesService.decreaseStock(item.vacuna_id, item.cantidad);
      }
    }

    // 2. Guardar el tratamiento
    const createdTreatment = new this.treatmentModel(createTreatmentDto);
    return createdTreatment.save();
  }

  async findAll(): Promise<Treatment[]> {
    return this.treatmentModel
      .find()
      .populate('mascota_id')
      .populate({
        path: 'vacunas_usadas.vacuna_id',
        model: 'Vaccine' // <--- Esto es clave cuando está dentro de un array
      })
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