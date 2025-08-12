import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  type: string;
  url: string;
  size?: number;
  tenantId: string;
  uploadedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number
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
DocumentSchema.index({ tenantId: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);