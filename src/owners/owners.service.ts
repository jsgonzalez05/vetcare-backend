import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Owner } from './schemas/owner.schema';

@Injectable()
export class OwnersService {
  constructor(@InjectModel(Owner.name) private ownerModel: Model<Owner>) {}

  // Crear
  async create(createOwnerDto: any): Promise<Owner> {
    const createdOwner = new this.ownerModel(createOwnerDto);
    return createdOwner.save();
  }

  // Listar todos
  async findAll(): Promise<Owner[]> {
    return this.ownerModel.find().exec();
  }

  // Buscar uno solo por ID (necesario para validar si existe antes de editar)
  async findOne(id: string): Promise<Owner> {
    const owner = await this.ownerModel.findById(id).exec();
    if (!owner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return owner;
  }

  // Editar / Actualizar
  async update(id: string, updateOwnerDto: any): Promise<Owner> {
    const updatedOwner = await this.ownerModel
      .findByIdAndUpdate(id, updateOwnerDto, { new: true }) // { new: true } devuelve el objeto ya cambiado
      .exec();

    if (!updatedOwner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return updatedOwner;
  }

  // Eliminar
  async remove(id: string): Promise<Owner> {
    const deletedOwner = await this.ownerModel.findByIdAndDelete(id).exec();
    
    if (!deletedOwner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return deletedOwner;
  }
}