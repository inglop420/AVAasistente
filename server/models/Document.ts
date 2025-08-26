import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  originalName: string;
  type: string;
  category: 'document' | 'template';
  url: string;
  size: number;
  expedienteId?: string;
  expedienteTitle?: string;
  tenantId: string;
  uploadedBy: string;
  uploadedAt: Date;
  createdAt: Date;
}

export interface IDocumentPlain {
  _id: any;
  name: string;
  originalName: string;
  type: string;
  category: 'document' | 'template';
  url: string;
  size: number;
  expedienteId?: string;
  expedienteTitle?: string;
  tenantId: string;
  uploadedBy: string;
  uploadedAt: Date;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['document', 'template'],
    default: 'document'
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
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
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for tenant isolation and expediente queries
DocumentSchema.index({ tenantId: 1, category: 1 });
DocumentSchema.index({ tenantId: 1, expedienteId: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);