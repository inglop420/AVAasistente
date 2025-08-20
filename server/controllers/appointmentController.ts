import { Response } from 'express';
import Appointment from '../models/Appointment';
import Expediente from '../models/Expediente';
import { AuthRequest } from '../middleware/auth';
import { ArrayExpressionOperatorReturningObject } from 'mongoose';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await Appointment.find({ tenantId: req.user!.tenantId }).sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { title, date, expedienteId, clientName, status } = req.body;

    let expedienteTitle;
    let finalClientName = clientName;

    // If expediente is provided, get its details
    if (expedienteId) {
      const expediente = await Expediente.findOne({
        _id: expedienteId,
        tenantId: req.user!.tenantId
      });
      
      if (expediente) {
        expedienteTitle = expediente.title;
        finalClientName = expediente.clientName;
      }
    }

    const appointment = new Appointment({
      title,
      date: new Date(date),
      expedienteId: expedienteId || undefined,
      expedienteTitle,
      clientName: finalClientName,
      status: status || 'programada',
      tenantId: req.user!.tenantId
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Error al crear cita' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, status } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, tenantId: req.user!.tenantId },
      { 
        title, 
        date: new Date(date), 
        status 
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Error al actualizar cita' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOneAndDelete({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Error al eliminar cita' });
  }
};

export const createAppointmentFromData = async (
  data: { title?: string; motivo?: string; date: Date; clientName: string; status?: string; tenantId: string; expedienteId?: string },
  tenantId: string
) => {
  try {
    const appointment = new Appointment({
      title: data.motivo || data.title || 'Cita',
      date: data.date,
      clientName: data.clientName,
      status: data.status || 'programada',
      tenantId,
      expedienteId: data.expedienteId
    });

    await appointment.save();
    return appointment;
  } catch (error) {
    console.error('Create appointment error:', error);
    throw error;
  }
};