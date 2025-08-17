import { Response } from 'express';
import Expediente from '../models/Expediente';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/auth';

export const getExpedientes = async (req: AuthRequest, res: Response) => {
  try {
    const expedientes = await Expediente.find({ tenantId: req.user!.organizationId }).sort({ createdAt: -1 });
    
    // Transform expedientes to match frontend interface
    const expedientesResponse = expedientes.map(exp => ({
      id: (exp as any)._id.toString(),
      numeroExpediente: exp.numeroExpediente,
      tipoProceso: exp.tipoProceso,
      origen: exp.origen,
      title: exp.title,
      clientId: exp.clientId,
      clientName: exp.clientName,
      status: exp.status,
      organizationId: exp.tenantId,
      createdAt: exp.createdAt,
      dueDate: exp.dueDate
    }));
    
    res.json(expedientesResponse);
  } catch (error) {
    console.error('Get expedientes error:', error);
    res.status(500).json({ message: 'Error al obtener expedientes' });
  }
};

export const createExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { numeroExpediente, tipoProceso, origen, title, clientId, status, dueDate } = req.body;

    // Verify client exists and belongs to tenant
    const client = await Client.findOne({ 
      _id: clientId,
      tenantId: req.user!.organizationId 
    });
    
    if (!client) {
      return res.status(400).json({ message: 'Cliente no encontrado' });
    }

    const expediente = new Expediente({
      numeroExpediente,
      tipoProceso,
      origen: origen || 'Oficinas',
      title,
      clientId,
      clientName: client.name,
      status: status || 'Activo',
      tenantId: req.user!.organizationId,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    await expediente.save();

    // Update client's expedientes count
    await Client.findOneAndUpdate(
      { _id: clientId, tenantId: req.user!.organizationId },
      {
      $inc: { expedientesCount: 1 }
      }
    );

    // Return expediente with proper id field
    const expedienteResponse = {
      id: (expediente as any)._id.toString(),
      numeroExpediente: expediente.numeroExpediente,
      tipoProceso: expediente.tipoProceso,
      origen: expediente.origen,
      title: expediente.title,
      clientId: expediente.clientId,
      clientName: expediente.clientName,
      status: expediente.status,
      organizationId: expediente.tenantId,
      createdAt: expediente.createdAt,
      dueDate: expediente.dueDate
    };

    res.status(201).json(expedienteResponse);
  } catch (error) {
    console.error('Create expediente error:', error);
    res.status(500).json({ message: 'Error al crear expediente' });
  }
};

export const updateExpediente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { numeroExpediente, tipoProceso, origen, title, status, dueDate } = req.body;

    const expediente = await Expediente.findOneAndUpdate(
      { _id: id, tenantId: req.user!.organizationId },
      { 
        numeroExpediente,
        tipoProceso,
        origen,
        title, 
        status, 
        dueDate: dueDate ? new Date(dueDate) : undefined 
      },
      { new: true }
    );

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    // Return expediente with proper id field
    const expedienteResponse = {
      id: (expediente as any) ._id.toString(),
      numeroExpediente: expediente.numeroExpediente,
      tipoProceso: expediente.tipoProceso,
      origen: expediente.origen,
      title: expediente.title,
      clientId: expediente.clientId,
      clientName: expediente.clientName,
      status: expediente.status,
      organizationId: expediente.tenantId,
      createdAt: expediente.createdAt,
      dueDate: expediente.dueDate
    };

    res.json(expedienteResponse);
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
      tenantId: req.user!.organizationId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    // Update client's expedientes count
    await Client.findOneAndUpdate(
      { _id: expediente.clientId, tenantId: req.user!.organizationId },
      {
      $inc: { expedientesCount: -1 }
      }
    );

    res.json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    console.error('Delete expediente error:', error);
    res.status(500).json({ message: 'Error al eliminar expediente' });
  }
};

export const createExpedienteFromData = async (
  data: {
    numero: string;
    tipoProceso: string;
    origen: string;
    clientName: string;
    clientId: string;
    title: string;
    status: string;
    dueDate?: string;
  },
  tenantId: string
) => {
  try {
    // Verifica si el expediente ya existe en este tenant
    const existingExpediente = await Expediente.findOne({ numeroExpediente: data.numero, tenantId });
    if (existingExpediente) throw new Error('El expediente ya existe');

    const expediente = new Expediente({
      numeroExpediente: data.numero,
      tipoProceso: data.tipoProceso,
      origen: data.origen,
      title: data.title,
      clientId: data.clientId,
      clientName: data.clientName,
      status: data.status || 'Activo',
      tenantId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    });

    await expediente.save();
    return expediente;
  } catch (error) {
    console.error('Create expediente error:', error);
    throw error;
  }
};