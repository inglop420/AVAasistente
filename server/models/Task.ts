import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  expedienteId: string;
  expedienteTitle: string;
  clientName: string;
  titulo: string;
  descripcion?: string;
  prioridad: 'urgente' | 'prioritario' | 'importante' | 'recordar';
  estado: 'pendiente' | 'realizado' | 'cancelado';
  fechaVencimiento: Date;
  tenantId: string;
  creadoPor: string;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  expedienteId: {
    type: String,
    required: true,
    ref: 'Expediente'
  },
  expedienteTitle: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  prioridad: {
    type: String,
    enum: ['urgente', 'prioritario', 'importante', 'recordar'],
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'realizado', 'cancelado'],
    default: 'pendiente'
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  creadoPor: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for tenant isolation and expediente queries
TaskSchema.index({ tenantId: 1, expedienteId: 1 });
TaskSchema.index({ tenantId: 1, fechaVencimiento: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);