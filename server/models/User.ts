import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  organizationId: string;
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
    enum: ['superadmin', 'admin', 'user'],
    default: 'user'
  },
  organizationId: {
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
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export default mongoose.model<IUser>('User', UserSchema);