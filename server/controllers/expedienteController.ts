import { Response } from 'express';
import Expediente from '../models/Expediente';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/auth';

export const getExpedientes = async (req: AuthRequest, res: Response) => {
  try {
    const expedientes = await Expediente.find({ tenantId: req.user!.tenantId }).sort({ createdAt: -1 });
    res.json(expedientes);
  } catch (error) {
    console.error('Get expedientes error:', error);
    res.status(500).json({ message: 'Error al obtener expedientes' });
  }
};

export const createExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { title, clientId, status, dueDate } = req.body;

    // Verify client exists and belongs to tenant
    const client = await Client.findOne({ 
      _id: clientId, 
      tenantId: req.user!.tenantId 
    });
    
    if (!client) {
      return res.status(400).json({ message: 'Cliente no encontrado' });
    }

    const expediente = new Expediente({
      title,
      clientId,
      clientName: client.name,
      status: status || 'Activo',
      tenantId: req.user!.tenantId,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    await expediente.save();

    // Update client's expedientes count
    await Client.findByIdAndUpdate(clientId, {
      $inc: { expedientesCount: 1 }
    });

    res.status(201).json(expediente);
  } catch (error) {
    console.error('Create expediente error:', error);
    res.status(500).json({ message: 'Error al crear expediente' });
  }
};

export const updateExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status, dueDate } = req.body;

    const expediente = await Expediente.findOneAndUpdate(
      { _id: id, tenantId: req.user!.tenantId },
      { 
        title, 
        status, 
        dueDate: dueDate ? new Date(dueDate) : undefined 
      },
      { new: true }
    );

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    res.json(expediente);
  } catch (error) {
    console.error('Update expediente error:', error);
    res.status(500).json({ message: 'Error al actualizar expediente' });
  }
};

export const deleteExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expediente = await Expediente.findOneAndDelete({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    // Update client's expedientes count
    await Client.findByIdAndUpdate(expediente.clientId, {
      $inc: { expedientesCount: -1 }
    });

    res.json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    console.error('Delete expediente error:', error);
    res.status(500).json({ message: 'Error al eliminar expediente' });
  }
};