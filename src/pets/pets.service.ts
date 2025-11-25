import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet } from './schemas/pet.schema';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Treatment } from '../treatments/schemas/treatment.schema';
import { VaccinationScheme } from '../vaccination-schemes/schemas/vaccination-scheme.schema';

@Injectable()
export class PetsService {
  constructor(@InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Treatment.name) private treatmentModel: Model<Treatment>,
    @InjectModel(VaccinationScheme.name) private schemeModel: Model<VaccinationScheme>,
) {}

  async create(createPetDto: any): Promise<Pet> {
    const createdPet = new this.petModel(createPetDto);
    return createdPet.save();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().populate('dueno_id').exec(); 
  }

  async findOne(id: string): Promise<Pet> {
    return this.petModel.findById(id).populate('dueno_id').exec();
  }

  async update(id: string, updatePetDto: any): Promise<Pet> {
    return this.petModel.findByIdAndUpdate(id, updatePetDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Pet> {
    const mascota = await this.petModel.findById(id);
    if (!mascota) throw new NotFoundException('Mascota no encontrada');

    const citasCount = await this.appointmentModel.countDocuments({ mascota_id: id });
    if (citasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la mascota porque tiene ${citasCount} citas registradas.`
      );
    }

    const tratamientosCount = await this.treatmentModel.countDocuments({ mascota_id: id });
    if (tratamientosCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la mascota porque tiene ${tratamientosCount} tratamientos registrados.`
      );
    }

    return this.petModel.findByIdAndDelete(id).exec();
  }

  async getEsquemaIncompleto() {
    const esquemasDb = await this.schemeModel.find()
      .populate({ path: 'vacunas_requeridas.vacuna_id', model: 'Vaccine' })
      .exec();
    
    const mapaEsquemas = {};
    const mapaNombresVacunas = {};

    esquemasDb.forEach(esq => {
      mapaEsquemas[esq.especie] = esq.vacunas_requeridas
          .filter((v: any) => v.vacuna_id)
          .map((v: any) => v.vacuna_id._id.toString()); 
      
      esq.vacunas_requeridas.forEach((v: any) => {
        if (v.vacuna_id) {
            mapaNombresVacunas[v.vacuna_id._id.toString()] = v.vacuna_id.nombre;
        }
      });
    });

    const mascotasReporte = await this.petModel.aggregate([
      {
        $lookup: {
          from: 'treatments',
          let: { petId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ['$mascota_id', '$$petId'] },
                vacuna_usada: { $exists: true }
              } 
            },
            { $project: { vacuna_usada: 1, vacunas_usadas: 1, _id: 0 } } 
          ],
          as: 'historial_raw'
        }
      },
      {
        $project: {
          nombre: 1,
          especie: 1,
          dueno_id: 1,
          vacunas_aplicadas_ids: {
             $map: { 
               input: "$historial_raw", 
               as: "h", 
               in: { $toString: { $ifNull: ["$$h.vacuna_usada", { $arrayElemAt: ["$$h.vacunas_usadas.vacuna_id", 0] }] } } 
             }
          }
        }
      }
    ]);

    const resultado = mascotasReporte.map(mascota => {
      const requeridasIds = mapaEsquemas[mascota.especie] || [];
      const aplicadasIds = (mascota.vacunas_aplicadas_ids || []).filter(id => id);

      const faltantesIds = requeridasIds.filter(idReq => !aplicadasIds.includes(idReq));
      const faltantesNombres = faltantesIds.map(id => mapaNombresVacunas[id] || 'Vacuna Desconocida');

      return {
        ...mascota,
        esquema_completo: faltantesIds.length === 0,
        vacunas_faltantes: faltantesNombres,
        nombres_vacunas_aplicadas: aplicadasIds.map(id => mapaNombresVacunas[id] || 'Otra').filter(n => n !== 'Otra')
      };
    })
    .filter(m => !m.esquema_completo);

    return this.petModel.populate(resultado, { path: 'dueno_id', select: 'nombre contacto' });
  }
}