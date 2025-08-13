import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);