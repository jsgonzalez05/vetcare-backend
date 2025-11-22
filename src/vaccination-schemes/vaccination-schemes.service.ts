import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VaccinationScheme } from './schemas/vaccination-scheme.schema';

@Injectable()
export class VaccinationSchemesService {
  constructor(
    @InjectModel(VaccinationScheme.name) private schemeModel: Model<VaccinationScheme>,
  ) {}

  async create(createDto: any) {
    return new this.schemeModel(createDto).save();
  }

  async findAll() {
    return this.schemeModel.find().populate('vacunas_requeridas.vacuna_id').exec();
  }
}