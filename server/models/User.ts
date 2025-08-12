import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Abogado' | 'Asistente';
  tenantId: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Admin', 'Abogado', 'Asistente'],
    default: 'Asistente'
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for tenant isolation
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model<IUser>('User', UserSchema);