import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  tenantId: string;
  expedientesCount: number;
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  expedientesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for tenant isolation
ClientSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model<IClient>('Client', ClientSchema);