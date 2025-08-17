import { Response } from 'express';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/auth';

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await Client.find({ tenantId: req.user!.tenantId }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    // Check if client already exists in this tenant
    const existingClient = await Client.findOne({ 
      email, 
      tenantId: req.user!.tenantId 
    });
    
    if (existingClient) {
      return res.status(400).json({ message: 'El cliente ya existe' });
    }

    const client = new Client({
      name,
      email,
      phone,
      tenantId: req.user!.tenantId,
      expedientesCount: 0
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const client = await Client.findOneAndUpdate(
      { _id: id, tenantId: req.user!.tenantId },
      { name, email, phone },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findOneAndDelete({
      _id: id,
      tenantId: req.user!.tenantId
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

export const createClientFromData = async (data: { name: string; email: string; phone: string }, tenantId: string) => {
  try {
    const { name, email, phone } = data;

    // Check if client already exists in this tenant
    const existingClient = await Client.findOne({ 
      email, 
      tenantId
    });
    
    if (existingClient) {
      throw new Error('El cliente ya existe');
    }

    const client = new Client({
      name,
      email,
      phone,
      tenantId,
      expedientesCount: 0
    });

    await client.save();
    return client;
  } catch (error) {
    console.error('Create client error:', error);
    throw error;
  }
};