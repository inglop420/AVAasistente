import mongoose, { Document, Schema } from 'mongoose';

export interface IMovement extends Document {
  expedienteId: string;
  fecha: Date;
  descripcion: string;
  tipoMovimiento: 'Actuacion' | 'Escrito' | 'Documento' | 'Audiencia' | 'Resolucion' | 'Otro';
  contenido?: string; // Para escritos con editor de texto
  archivos?: {
    nombre: string;
    url: string;
    tipo: string;
    tamaño?: number;
  }[];
  tenantId: string;
  creadoPor: string;
  createdAt: Date;
}

const MovementSchema = new Schema<IMovement>({
  expedienteId: {
    type: String,
    required: true,
    ref: 'Expediente'
  },
  fecha: {
    type: Date,
    required: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  tipoMovimiento: {
    type: String,
    enum: ['Actuacion', 'Escrito', 'Documento', 'Audiencia', 'Resolucion', 'Otro'],
    required: true
  },
  contenido: {
    type: String, // HTML del editor de texto
    trim: true
  },
  archivos: [{
    nombre: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      required: true
    },
    tamaño: {
      type: Number
    }
  }],
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
MovementSchema.index({ tenantId: 1, expedienteId: 1 });

export default mongoose.model<IMovement>('Movement', MovementSchema);