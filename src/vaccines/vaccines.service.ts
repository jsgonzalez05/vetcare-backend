import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vaccine } from './schemas/vaccine.schema'; // Asegúrate que la ruta sea correcta

@Injectable()
export class VaccinesService {
  constructor(
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
  ) {}

  // 1. Crear Vacuna (Para llenar el inventario inicial)
  async create(createVaccineDto: any): Promise<Vaccine> {
    const createdVaccine = new this.vaccineModel(createVaccineDto);
    return createdVaccine.save();
  }

  // 2. Listar todas (Para ver el stock actual)
  async findAll(): Promise<Vaccine[]> {
    return this.vaccineModel.find().exec();
  }

  // 3. Buscar una por ID (Útil para validaciones)
  async findOne(id: string): Promise<Vaccine> {
    const vaccine = await this.vaccineModel.findById(id).exec();
    if (!vaccine) throw new NotFoundException('Vacuna no encontrada');
    return vaccine;
  }

  // 4. MÉTODO CLAVE: Descontar Stock
  // Este método será llamado por el TreatmentsService
  async decreaseStock(id: string, cantidad: number): Promise<Vaccine> {
    const vaccine = await this.vaccineModel.findById(id);
    
    if (!vaccine) throw new NotFoundException('Vacuna no encontrada');
    if (vaccine.stock < cantidad) {
        throw new ConflictException({
            message: 'No hay suficiente stock disponible',
            stock_actual: vaccine.stock,
            cantidad_solicitada: cantidad
        });
    }

    vaccine.stock -= cantidad;
    return vaccine.save();
  }
}