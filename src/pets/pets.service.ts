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

  // Crear Mascota
  async create(createPetDto: any): Promise<Pet> {
    const createdPet = new this.petModel(createPetDto);
    return createdPet.save();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().populate('dueno_id').exec(); 
  }

  // Buscar una por ID
  async findOne(id: string): Promise<Pet> {
    return this.petModel.findById(id).populate('dueno_id').exec();
  }

  // Actualizar
  async update(id: string, updatePetDto: any): Promise<Pet> {
    return this.petModel.findByIdAndUpdate(id, updatePetDto, { new: true }).exec();
  }

  //Método Remove
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
      // Mapeamos IDs asegurándonos de leer el _id del objeto poblado
      mapaEsquemas[esq.especie] = esq.vacunas_requeridas
          .filter((v: any) => v.vacuna_id) // Filtro de seguridad
          .map((v: any) => v.vacuna_id._id.toString()); 
      
      // Mapeamos Nombres
      esq.vacunas_requeridas.forEach((v: any) => {
        if (v.vacuna_id) {
            mapaNombresVacunas[v.vacuna_id._id.toString()] = v.vacuna_id.nombre;
        }
      });
    });

    // 2. Agregación (Historial de la mascota)
    const mascotasReporte = await this.petModel.aggregate([
      {
        $lookup: {
          from: 'treatments',
          let: { petId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ['$mascota_id', '$$petId'] },
                vacuna_usada: { $exists: true } // Solo si tiene vacuna (lógica antigua)
              } 
            },
            // OJO: Si usaste la nueva lógica de array (vacunas_usadas), la agregación cambia.
            // Asumiendo que mantienes compatibilidad o usas la lógica simple:
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
          // Extraemos IDs tanto del campo antiguo 'vacuna_usada' como del nuevo array 'vacunas_usadas'
          vacunas_aplicadas_ids: {
             $map: { 
               input: "$historial_raw", 
               as: "h", 
               // Esta lógica intenta leer ambos formatos por compatibilidad
               in: { $toString: { $ifNull: ["$$h.vacuna_usada", { $arrayElemAt: ["$$h.vacunas_usadas.vacuna_id", 0] }] } } 
             }
          }
        }
      }
    ]);

    // 3. Comparación
    const resultado = mascotasReporte.map(mascota => {
      const requeridasIds = mapaEsquemas[mascota.especie] || [];
      // Filtramos IDs nulos o inválidos del historial
      const aplicadasIds = (mascota.vacunas_aplicadas_ids || []).filter(id => id);

      const faltantesIds = requeridasIds.filter(idReq => !aplicadasIds.includes(idReq));
      const faltantesNombres = faltantesIds.map(id => mapaNombresVacunas[id] || 'Vacuna Desconocida');

      return {
        ...mascota,
        esquema_completo: faltantesIds.length === 0,
        vacunas_faltantes: faltantesNombres,
        // Opcional: Nombres de las que SÍ tiene
        nombres_vacunas_aplicadas: aplicadasIds.map(id => mapaNombresVacunas[id] || 'Otra').filter(n => n !== 'Otra')
      };
    })
    .filter(m => !m.esquema_completo);

    return this.petModel.populate(resultado, { path: 'dueno_id', select: 'nombre contacto' });
  }
}