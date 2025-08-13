import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'abogado', 'asistente', 'auxiliar'],
    default: 'auxiliar'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  tenantId: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
  // ...otros campos necesarios
});

export const User = mongoose.model('User', UserSchema);