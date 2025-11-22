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

  // --- REPORTE DINÁMICO DE ESQUEMAS ---
  async getEsquemaIncompleto() {
    // 1. Obtener todos los esquemas configurados en la BD
    // Usamos populate para traer los nombres de vacunas y mostrarlos en el reporte si faltan
    const esquemasDb = await this.schemeModel.find().populate('vacunas_requeridas.vacuna_id').exec();
    
    // Creamos un mapa rápido: "Perro" -> [Lista de IDs de vacunas requeridas]
    const mapaEsquemas = {};
    const mapaNombresVacunas = {}; // Para saber el nombre dado el ID

    esquemasDb.forEach(esq => {
      mapaEsquemas[esq.especie] = esq.vacunas_requeridas.map(v => v.vacuna_id.toString());
      
      // Guardamos los nombres para el reporte
      esq.vacunas_requeridas.forEach((v: any) => {
        mapaNombresVacunas[v.vacuna_id._id.toString()] = v.vacuna_id.nombre;
      });
    });

    // 2. Agregación para obtener historial de mascotas (Igual que antes pero trayendo IDs)
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
            { $project: { vacuna_usada: 1, _id: 0 } } // Solo necesitamos el ID de la vacuna
          ],
          as: 'historial_raw'
        }
      },
      {
        $project: {
          nombre: 1,
          especie: 1,
          dueno_id: 1,
          // Convertimos array de objetos a array de IDs strings
          vacunas_aplicadas_ids: {
             $map: { input: "$historial_raw", as: "h", in: { $toString: "$$h.vacuna_usada" } }
          }
        }
      }
    ]);

    // 3. Comparación Lógica (En Memoria)
    const resultado = mascotasReporte.map(mascota => {
      const requeridasIds = mapaEsquemas[mascota.especie] || [];
      const aplicadasIds = mascota.vacunas_aplicadas_ids || [];

      // Filtramos: ¿Qué ID requerido NO está en los aplicados?
      const faltantesIds = requeridasIds.filter(idReq => !aplicadasIds.includes(idReq));

      // Traducimos IDs a Nombres para que el humano entienda
      const faltantesNombres = faltantesIds.map(id => mapaNombresVacunas[id] || 'Vacuna Desconocida');

      return {
        ...mascota,
        esquema_completo: faltantesIds.length === 0,
        vacunas_faltantes: faltantesNombres
      };
    })
    .filter(m => !m.esquema_completo); // Solo devolvemos las incompletas

    // Populate del dueño
    return this.petModel.populate(resultado, { path: 'dueno_id', select: 'nombre contacto' });
  }

  // Crear Mascota
  async create(createPetDto: any): Promise<Pet> {
    const createdPet = new this.petModel(createPetDto);
    return createdPet.save();
  }

  // Listar todas (Con el truco de populate)
  async findAll(): Promise<Pet[]> {
    // .populate('dueno_id') hace que MongoDB busque al dueño y ponga sus datos aquí
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

  // 2. Método Remove BLINDADO
  async remove(id: string): Promise<Pet> {
    // Paso A: Verificar si la mascota existe
    const mascota = await this.petModel.findById(id);
    if (!mascota) throw new NotFoundException('Mascota no encontrada');

    // Paso B: Buscar si tiene Citas asociadas
    const citasCount = await this.appointmentModel.countDocuments({ mascota_id: id });
    if (citasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la mascota porque tiene ${citasCount} citas registradas.`
      );
    }

    // Paso C: Buscar si tiene Tratamientos asociados
    const tratamientosCount = await this.treatmentModel.countDocuments({ mascota_id: id });
    if (tratamientosCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la mascota porque tiene ${tratamientosCount} tratamientos registrados.`
      );
    }

    // Paso D: Si pasa las validaciones, procedemos a borrar
    return this.petModel.findByIdAndDelete(id).exec();
  }
}