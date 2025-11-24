import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vaccine } from './schemas/vaccine.schema';

@Injectable()
export class VaccinesService {
  constructor(
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
  ) {}

  // Crear
  async create(createVaccineDto: any): Promise<Vaccine> {
    const createdVaccine = new this.vaccineModel(createVaccineDto);
    return createdVaccine.save();
  }

  // Listar
  async findAll(): Promise<Vaccine[]> {
    return this.vaccineModel.find().exec();
  }

  // Buscar uno
  async findOne(id: string): Promise<Vaccine> {
    const vaccine = await this.vaccineModel.findById(id).exec();
    if (!vaccine) throw new NotFoundException('Vacuna no encontrada');
    return vaccine;
  }

  // --- NUEVOS MÉTODOS ---
  
  // Editar (Para ajustar stock manual o corregir nombre)
  async update(id: string, updateVaccineDto: any): Promise<Vaccine> {
    const updatedVaccine = await this.vaccineModel
      .findByIdAndUpdate(id, updateVaccineDto, { new: true })
      .exec();
      
    if (!updatedVaccine) throw new NotFoundException('Vacuna no encontrada');
    return updatedVaccine;
  }

  // Eliminar
  async remove(id: string): Promise<Vaccine> {
    const deletedVaccine = await this.vaccineModel.findByIdAndDelete(id).exec();
    if (!deletedVaccine) throw new NotFoundException('Vacuna no encontrada');
    return deletedVaccine;
  }

  // Lógica de negocio: Descontar Stock (Usado por Tratamientos)
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