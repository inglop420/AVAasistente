import mongoose, { Document, Schema } from 'mongoose';

export interface IExpediente extends Document {
  numeroExpediente?: string;
  tipoProceso?: string;
  origen?: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'Activo' | 'Pendiente' | 'Cerrado';
  tenantId: string;
  dueDate?: Date;
  createdAt: Date;
}

const ExpedienteSchema = new Schema<IExpediente>({
  numeroExpediente: {
    type: String,
    trim: true
  },
  tipoProceso: {
    type: String,
    trim: true
  },
  origen: {
    type: String,
    enum: ['Juzgados', 'Oficinas', 'Tribunales', 'Notarías', 'Otros'],
    default: 'Oficinas'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    ref: 'Client'
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Activo', 'Pendiente', 'Cerrado'],
    default: 'Activo'
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for tenant isolation
ExpedienteSchema.index({ tenantId: 1 });

export default mongoose.model<IExpediente>('Expediente', ExpedienteSchema);