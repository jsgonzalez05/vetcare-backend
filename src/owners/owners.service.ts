import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Owner } from './schemas/owner.schema';

@Injectable()
export class OwnersService {
  // Inyectamos el modelo que definimos antes
  constructor(@InjectModel(Owner.name) private ownerModel: Model<Owner>) {}

  // Función para crear un dueño
  async create(createOwnerDto: any): Promise<Owner> {
    const createdOwner = new this.ownerModel(createOwnerDto);
    return createdOwner.save(); // ¡Esto guarda en Atlas!
  }

  // Función para listar todos
  async findAll(): Promise<Owner[]> {
    return this.ownerModel.find().exec();
  }
}