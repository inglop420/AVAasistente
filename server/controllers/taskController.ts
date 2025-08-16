import { Response } from 'express';
import Task from '../models/Task';
import Expediente from '../models/Expediente';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
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

    const tasks = await Task.find({ 
      expedienteId,
      tenantId: req.user!.tenantId 
    }).sort({ fechaVencimiento: 1, createdAt: -1 });

    // Transform tasks to match frontend interface
    const tasksResponse = tasks.map(task => ({
      id: (task as any)._id.toString(),
      expedienteId: task.expedienteId,
      expedienteTitle: task.expedienteTitle,
      clientName: task.clientName,
      titulo: task.titulo,
      descripcion: task.descripcion,
      prioridad: task.prioridad,
      estado: task.estado,
      fechaVencimiento: task.fechaVencimiento,
      creadoPor: task.creadoPor,
      createdAt: task.createdAt
    }));

    res.json(tasksResponse);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ 
      tenantId: req.user!.tenantId 
    }).sort({ fechaVencimiento: 1, createdAt: -1 });

    // Transform tasks to match frontend interface
    const tasksResponse = tasks.map(task => ({
      id: (task as any)._id.toString(),
      expedienteId: task.expedienteId,
      expedienteTitle: task.expedienteTitle,
      clientName: task.clientName,
      titulo: task.titulo,
      descripcion: task.descripcion,
      prioridad: task.prioridad,
      estado: task.estado,
      fechaVencimiento: task.fechaVencimiento,
      creadoPor: task.creadoPor,
      createdAt: task.createdAt
    }));

    res.json(tasksResponse);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Error al obtener todas las tareas' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const { titulo, descripcion, prioridad, fechaVencimiento } = req.body;

    // Verify expediente exists and belongs to tenant
    const expediente = await Expediente.findOne({
      _id: expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    const task = new Task({
      expedienteId,
      expedienteTitle: expediente.title,
      clientName: expediente.clientName,
      titulo,
      descripcion: descripcion || undefined,
      prioridad,
      estado: 'pendiente',
      fechaVencimiento: new Date(fechaVencimiento),
      tenantId: req.user!.tenantId,
      creadoPor: req.user!.id
    });

    await task.save();

    // Create corresponding appointment for agenda synchronization
    const appointment = new Appointment({
      title: `Tarea: ${titulo}`,
      date: new Date(fechaVencimiento),
      expedienteId,
      expedienteTitle: expediente.title,
      clientName: expediente.clientName,
      status: 'programada',
      tenantId: req.user!.tenantId
    });

    await appointment.save();

    // Return task with proper id field
    const taskResponse = {
      id: (task as any)._id.toString(),
      expedienteId: task.expedienteId,
      expedienteTitle: task.expedienteTitle,
      clientName: task.clientName,
      titulo: task.titulo,
      descripcion: task.descripcion,
      prioridad: task.prioridad,
      estado: task.estado,
      fechaVencimiento: task.fechaVencimiento,
      creadoPor: task.creadoPor,
      createdAt: task.createdAt
    };

    res.status(201).json(taskResponse);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error al crear tarea' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId, taskId } = req.params;
    const { titulo, descripcion, prioridad, estado, fechaVencimiento } = req.body;

    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        expedienteId,
        tenantId: req.user!.tenantId 
      },
      { 
        titulo,
        descripcion: descripcion || undefined,
        prioridad,
        estado,
        fechaVencimiento: new Date(fechaVencimiento)
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Update corresponding appointment if exists
    await Appointment.findOneAndUpdate(
      {
        title: { $regex: `^Tarea: ` },
        expedienteId,
        tenantId: req.user!.tenantId
      },
      {
        title: `Tarea: ${titulo}`,
        date: new Date(fechaVencimiento),
        status: estado === 'realizado' ? 'completada' : estado === 'cancelado' ? 'cancelada' : 'programada'
      }
    );

    // Return task with proper id field
    const taskResponse = {
      id: (task as any)._id.toString(),
      expedienteId: task.expedienteId,
      expedienteTitle: task.expedienteTitle,
      clientName: task.clientName,
      titulo: task.titulo,
      descripcion: task.descripcion,
      prioridad: task.prioridad,
      estado: task.estado,
      fechaVencimiento: task.fechaVencimiento,
      creadoPor: task.creadoPor,
      createdAt: task.createdAt
    };

    res.json(taskResponse);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error al actualizar tarea' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { expedienteId, taskId } = req.params;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      expedienteId,
      tenantId: req.user!.tenantId
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Delete corresponding appointment
    await Appointment.findOneAndDelete({
      title: `Tarea: ${task.titulo}`,
      expedienteId,
      tenantId: req.user!.tenantId
    });

    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error al eliminar tarea' });
  }
};