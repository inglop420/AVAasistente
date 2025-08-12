import mongoose, { Document, Schema } from 'mongoose';

export interface IExpediente extends Document {
  title: string;
  clientId: string;
  clientName: string;
  status: 'Activo' | 'Pendiente' | 'Cerrado';
  tenantId: string;
  dueDate?: Date;
  createdAt: Date;
}

const ExpedienteSchema = new Schema<IExpediente>({
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