import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Owner } from './schemas/owner.schema';

@Injectable()
export class OwnersService {
  constructor(@InjectModel(Owner.name) private ownerModel: Model<Owner>) {}

  async create(createOwnerDto: any): Promise<Owner> {
    const createdOwner = new this.ownerModel(createOwnerDto);
    return createdOwner.save();
  }

  async findAll(): Promise<Owner[]> {
    return this.ownerModel.find().exec();
  }

  async findOne(id: string): Promise<Owner> {
    const owner = await this.ownerModel.findById(id).exec();
    if (!owner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return owner;
  }

  async update(id: string, updateOwnerDto: any): Promise<Owner> {
    const updatedOwner = await this.ownerModel
      .findByIdAndUpdate(id, updateOwnerDto, { new: true }) // { new: true } devuelve el objeto ya cambiado
      .exec();

    if (!updatedOwner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return updatedOwner;
  }

  async remove(id: string): Promise<Owner> {
    const deletedOwner = await this.ownerModel.findByIdAndDelete(id).exec();
    
    if (!deletedOwner) {
      throw new NotFoundException(`Dueño con ID ${id} no encontrado`);
    }
    return deletedOwner;
  }
}