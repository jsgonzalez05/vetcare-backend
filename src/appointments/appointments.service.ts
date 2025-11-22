import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
  ) {}

  // --- Helper Mejorado: Acepta 'excludeId' para evitar chocar consigo mismo ---
  private async validarDisponibilidad(veterinario: string, fecha: Date | string, excludeId?: string) {
    const query: any = {
      veterinario,
      fecha, 
      estado: { $ne: 'cancelada' }, // Ignoramos las canceladas
    };

    // Si nos pasan un ID, le decimos a Mongo: "Busca cualquiera MENOS este ID"
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const citaExistente = await this.appointmentModel.findOne(query);

    if (citaExistente) {
      throw new ConflictException(
        `El veterinario ${veterinario} ya tiene una cita activa en esa fecha y hora.`
      );
    }
  }

  async create(createAppointmentDto: any): Promise<Appointment> {
    // Validación normal (sin excluir nada porque es nueva)
    await this.validarDisponibilidad(
      createAppointmentDto.veterinario, 
      createAppointmentDto.fecha
    );

    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find()
      .populate({ path: 'mascota_id', populate: { path: 'dueno_id' } })
      .exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id).populate('mascota_id');
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  // --- REPROGRAMAR (UPDATE) ---
  async update(id: string, updateAppointmentDto: any): Promise<Appointment> {
    const citaActual = await this.appointmentModel.findById(id);
    if (!citaActual) throw new NotFoundException('Cita no encontrada');

    // Solo validamos choque si cambiaron la fecha o el veterinario
    if (updateAppointmentDto.fecha || updateAppointmentDto.veterinario) {
        const nuevoVet = updateAppointmentDto.veterinario || citaActual.veterinario;
        const nuevaFecha = updateAppointmentDto.fecha || citaActual.fecha;
        
        // ¡IMPORTANTE! Pasamos 'id' como tercer parámetro para excluirla del choque
        await this.validarDisponibilidad(nuevoVet, nuevaFecha, id);
    }

    return this.appointmentModel.findByIdAndUpdate(
      id, 
      updateAppointmentDto, 
      { new: true } // Devuelve el objeto ya actualizado
    ).exec();
  }

  // --- CANCELAR ---
  async cancel(id: string): Promise<Appointment> {
    const citaCancelada = await this.appointmentModel.findByIdAndUpdate(
        id, 
        { estado: 'cancelada' }, 
        { new: true }
    ).exec();

    if (!citaCancelada) throw new NotFoundException('Cita no encontrada');
    return citaCancelada;
  }

  async getUpcomingReport(veterinarianName?: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Construimos el filtro base dinámicamente
    const matchFilter: any = {
      fecha: { $gte: hoy },
      estado: { $ne: 'cancelada' },
    };

    // Si nos enviaron un nombre, lo agregamos al filtro
    if (veterinarianName) {
      matchFilter.veterinario = veterinarianName;
    }

    return this.appointmentModel.aggregate([
      {
        $match: matchFilter, // Usamos el filtro dinámico aquí
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'mascota_id',
          foreignField: '_id',
          as: 'mascota_info',
        },
      },
      {
        $unwind: '$mascota_info',
      },
      {
        $group: {
          _id: {
            veterinario: '$veterinario',
            dia: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          },
          citas: {
            $push: {
              hora: { $dateToString: { format: '%H:%M', date: '$fecha' } },
              paciente: '$mascota_info.nombre',
              motivo: '$motivo',
            },
          },
          cantidad_citas: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.dia': 1 },
      },
    ]);
  }
}