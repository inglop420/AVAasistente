import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  title: string;
  date: Date;
  expedienteId?: string;
  expedienteTitle?: string;
  clientName: string;
  status: 'programada' | 'completada' | 'cancelada';
  tenantId: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  expedienteId: {
    type: String,
    ref: 'Expediente'
  },
  expedienteTitle: {
    type: String,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['programada', 'completada', 'cancelada'],
    default: 'programada'
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for tenant isolation
//AppointmentSchema.index({ tenantId: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);