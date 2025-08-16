import { Response } from 'express';
import Movement from '../models/Movement';
import Expediente from '../models/Expediente';
import { AuthRequest } from '../middleware/auth';

export const getMovements = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;

    // Verify expediente exists and belongs to tenant
    const expediente = await Expediente.findOne({
      _id: expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    const movements = await Movement.find({ 
      expedienteId,
      tenantId: req.user!.tenantId 
    }).sort({ fecha: -1, createdAt: -1 });

    // Transform movements to match frontend interface
    const movementsResponse = movements.map(movement => ({
      id: (movement as any)._id.toString(),
      expedienteId: movement.expedienteId,
      fecha: movement.fecha,
      descripcion: movement.descripcion,
      tipoMovimiento: movement.tipoMovimiento,
      contenido: movement.contenido,
      archivos: movement.archivos,
      creadoPor: movement.creadoPor,
      createdAt: movement.createdAt
    }));

    res.json(movementsResponse);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

export const createMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const { fecha, descripcion, tipoMovimiento, contenido, archivos } = req.body;

    // Verify expediente exists and belongs to tenant
    const expediente = await Expediente.findOne({
      _id: expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    const movement = new Movement({
      expedienteId,
      fecha: new Date(fecha),
      descripcion,
      tipoMovimiento,
      contenido: contenido || undefined,
      archivos: archivos || [],
      tenantId: req.user!.tenantId,
      creadoPor: req.user!.id
    });

    await movement.save();

    // Return movement with proper id field
    const movementResponse = {
      id: (movement as any)._id.toString(),
      expedienteId: movement.expedienteId,
      fecha: movement.fecha,
      descripcion: movement.descripcion,
      tipoMovimiento: movement.tipoMovimiento,
      contenido: movement.contenido,
      archivos: movement.archivos,
      creadoPor: movement.creadoPor,
      createdAt: movement.createdAt
    };

    res.status(201).json(movementResponse);
  } catch (error) {
    console.error('Create movement error:', error);
    res.status(500).json({ message: 'Error al crear movimiento' });
  }
};

export const updateMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId, movementId } = req.params;
    const { fecha, descripcion, tipoMovimiento, contenido, archivos } = req.body;

    const movement = await Movement.findOneAndUpdate(
      { 
        _id: movementId,
        expedienteId,
        tenantId: req.user!.tenantId 
      },
      { 
        fecha: new Date(fecha),
        descripcion,
        tipoMovimiento,
        contenido: contenido || undefined,
        archivos: archivos || []
      },
      { new: true }
    );

    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    // Return movement with proper id field
    const movementResponse = {
      id: (movement as any)._id.toString(),
      expedienteId: movement.expedienteId,
      fecha: movement.fecha,
      descripcion: movement.descripcion,
      tipoMovimiento: movement.tipoMovimiento,
      contenido: movement.contenido,
      archivos: movement.archivos,
      creadoPor: movement.creadoPor,
      createdAt: movement.createdAt
    };

    res.json(movementResponse);
  } catch (error) {
    console.error('Update movement error:', error);
    res.status(500).json({ message: 'Error al actualizar movimiento' });
  }
};

export const deleteMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId, movementId } = req.params;

    const movement = await Movement.findOneAndDelete({
      _id: movementId,
      expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    res.json({ message: 'Movimiento eliminado exitosamente' });
  } catch (error) {
    console.error('Delete movement error:', error);
    res.status(500).json({ message: 'Error al eliminar movimiento' });
  }
};